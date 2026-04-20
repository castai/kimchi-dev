# Permission System for kimchi-dev — Implementation Plan

Status: draft, awaiting review.
Branch: `feat/permissions` (worktree at `../kimchi-dev-permissions`).

## 1. Goal

Introduce a permission layer to kimchi-dev with three modes:

1. **default** — interactive per-tool-call approval, session-remembering.
2. **plan** — read-only exploration; writes/executes blocked with a clear message.
3. **auto** — YOLO with a same-model danger classifier plus user-defined allow/deny rules.

Modeled conceptually on Claude Code. No code or system prompts are copied from Claude Code; all prompts in this plan are original.

## 2. Integration seam

No pi-mono changes required. The hook is already there: `pi.on("tool_call", handler)` is invoked from `agent-session.ts:366` (`agent.beforeToolCall`). A handler returning `{ block: true, reason }` blocks execution; the `reason` surfaces to the model as the tool-result error. `event.input` is mutable across handlers. Context gives us `ctx.ui.{select,confirm,notify}`, `ctx.hasUI`, `ctx.model`, `ctx.modelRegistry`, and `ctx.signal`.

All work lives in a new extension:

```
src/extensions/permissions/
  index.ts            # ExtensionFactory entry point
  mode.ts             # Mode state machine + mode selection (flag/env/command)
  classifier.ts       # YOLO classifier (system prompt + call + parse)
  rules.ts            # Rule parsing, matching (wildcards, prefix, exact)
  taxonomy.ts         # Tool classification (readOnly/write/execute/network/custom)
  config.ts           # Config file discovery + precedence merging
  session-memory.ts   # In-memory session approvals
  commands.ts         # /permissions slash commands
  prompts.ts          # Interactive-approval UX (select dialogs)
  types.ts            # Shared types
  *.test.ts           # Unit tests
```

Registered in `src/cli.ts` alongside the other extensions.

## 3. Modes

| Mode | Flag | Env | Default tool policy |
|------|------|-----|---------------------|
| `default` | *(none)* | `KIMCHI_PERMISSIONS=default` | Ask per call; remember per-rule for session |
| `plan` | `--plan` | `KIMCHI_PERMISSIONS=plan` | Read-only tools allowed; everything else blocked |
| `auto` | `--auto` | `KIMCHI_PERMISSIONS=auto` | Allowlist/denylist short-circuit; classifier otherwise |

Mode can also be changed mid-session via `/permissions <mode>`. Only one mode is active at a time.

### Mode precedence (highest first)

1. `/permissions` slash command (runtime change)
2. `--auto` / `--plan` CLI flag
3. `KIMCHI_PERMISSIONS` env var
4. `permissions.json` → `defaultMode` field
5. Built-in default: `default`

## 4. Tool classification taxonomy

Every registered tool is classified once per session (via `pi.getAllTools()` plus a static override table). Categories:

- **readOnly** — `read`, `grep`, `find`, `ls`, and any custom tool whose entry in the taxonomy table marks it `readOnly` (e.g. `web_search`, `web_fetch`, MCP describe-only tools).
- **write** — `edit`, `write`, filesystem-mutating custom tools.
- **execute** — `bash` (special: command-level classification), and any custom tool that spawns processes.
- **network** — tools that make outbound mutating HTTP (write APIs, MCP write calls).
- **unknown** — anything not otherwise classified; treated as write+execute for safety.

The mapping lives in `taxonomy.ts` as a static table plus a simple heuristic for unknown custom tools (tool name contains `read|get|list|search|query|describe` → `readOnly`; otherwise `unknown`). An extension hook (`registerToolCategory`) is not added now; the table is the source of truth.

### Bash special handling

`bash` is always `execute`, but in plan mode and auto mode we further classify **by command**: the command is parsed to its leading program and matched against a read-only program allowlist (`cat`, `head`, `tail`, `ls`, `pwd`, `grep`, `find`, `rg`, `fd`, `git status|log|diff|show|branch|remote`, `npm list|ls|view|info`, `node --version`, `jq`, `sed -n`, etc. — a curated list adapted from pi-mono's `plan-mode/utils.ts` patterns, rewritten in our style). Anything not on the allowlist is treated as `execute` in the general sense.

## 5. Rule matching

Rules are strings of the form `ToolName` or `ToolName(content)`. `ToolName` without content matches any invocation of that tool. The content clause is tool-specific:

| Tool | Content semantics | Examples |
|------|-------------------|----------|
| `bash` | command prefix (Claude-Code-style): `ToolName:*` is prefix, bare string is exact, `*` is wildcard | `Bash(git status)`, `Bash(git:*)`, `Bash(npm test *)` |
| `read`, `edit`, `write`, `ls`, `grep`, `find` | path glob (matched via [micromatch](https://github.com/micromatch/micromatch)) | `Write(src/**)`, `Edit(.env)`, `Read(/etc/**)` |
| any MCP / custom tool | exact-match content string against a tool-defined key; if no key defined, matches on a string-serialization of `event.input` | `mcp__foo__bar`, `set_phase(plan)` |

The wildcard semantics for bash are paraphrased from Claude Code's `shellRuleMatching.ts` behavior (our own implementation): `pattern:*` = prefix; `*` = sequence wildcard; `\*` = literal star; trailing `' *'` is optional (so `git *` matches bare `git`).

Rules are evaluated in order of source precedence (session > cli > local > project > user), then deny-before-allow within a source. First match wins. No match → behavior falls through to mode default (ask / block / classifier).

## 6. Session approval memory

When the user picks "Yes, don't ask again for `<scope>` this session" in default mode, a rule is appended to the in-memory `session` source. The chosen scope corresponds to:

- **bash**: prefix up to the first whitespace-separated argument that starts with `-`, or the full command if none. `Bash(git status)` → `Bash(git:*)` offered as the scope when asking about `git status main`. The user sees both options ("just this command" vs "this prefix").
- **file tools**: directory prefix (`Write(src/cli.ts)` → offer `Write(src/**)`).
- **other tools**: just the tool name.

Session memory is cleared on session end (not persisted). `/permissions save` can promote a session rule to the user or project config (prompted).

Data structure:

```ts
interface SessionMemory {
  // keyed by source, then by behavior
  allow: Rule[]
  deny: Rule[]
}
type Rule = { toolName: string; content?: string; source: RuleSource }
```

## 7. YOLO classifier (auto mode)

### Flow

```
tool_call event
  ├── tool is readOnly-classified?  → allow (skip classifier, per Q3-B)
  ├── match deny rules?             → block
  ├── match allow rules?            → allow
  └── otherwise                     → classifier
                                         ├── safe                     → allow
                                         ├── requires-confirmation    → prompt user (or fail-closed if no UI)
                                         ├── blocked                  → block
                                         └── error/timeout            → prompt user if UI else block (per Q3-C)
```

### Classifier call

Uses `ctx.model` and `ctx.modelRegistry.getApiKeyAndHeaders()` (the same pattern as `examples/extensions/summarize.ts`), so the classifier runs on whatever model the harness is configured with. Timeout: 8s. AbortSignal: `ctx.signal`.

Model call:

```ts
import { complete } from "@mariozechner/pi-ai"
const auth = await ctx.modelRegistry.getApiKeyAndHeaders(ctx.model)
const res = await complete(ctx.model, { messages: [
  { role: "system", content: [{ type: "text", text: CLASSIFIER_SYSTEM_PROMPT }] },
  { role: "user", content: [{ type: "text", text: toolDescription }] },
]}, { apiKey: auth.apiKey, headers: auth.headers })
```

### Draft classifier system prompt (original, not copied)

```
You are a security gate for a terminal coding assistant. A coding agent is about
to invoke a tool on the user's machine. Your job is to classify the call into
one of three verdicts:

  safe                   — the call has no meaningful chance of causing harm,
                           data loss, privacy leak, or persistent side effects
                           outside the working directory.
  requires-confirmation  — the call is plausibly fine but has a real chance of
                           being destructive or sensitive and the user should
                           confirm before it runs.
  blocked                — the call is clearly destructive, exfiltrates secrets,
                           attempts to disable safety controls, or otherwise
                           should never run without the user understanding what
                           it does.

Use `blocked` sparingly — only when you are confident harm would result. Use
`requires-confirmation` for ambiguous cases where the user's intent would
resolve the question (for example: `rm somefile` inside the project directory
is almost always fine, but the user should confirm).

Focus on concrete blast radius:
  - Files outside the current working directory, especially in $HOME, /etc,
    /usr, ~/.ssh, ~/.aws, ~/.gnupg, ~/.config, shell rc files.
  - Destructive git operations that rewrite or discard history
    (reset --hard, push --force, branch -D, clean -fdx).
  - Package installs or global tool installs.
  - Network calls that send data to untrusted endpoints.
  - Commands that read credentials or environment secrets and could exfiltrate
    them (curl piped to a file upload, environment dumps to a remote host).
  - Process control: sudo, kill, systemctl, shutdown, reboot.
  - Privilege escalation, sandbox escape, or disabling safety hooks.

Commands that are typically safe inside a project directory:
  - Reading, listing, grepping files the agent already has context on.
  - Building, testing, linting, formatting the current project.
  - Version-control inspection (status, log, diff, show, branch -v).
  - Git operations that only affect the current branch and can be undone
    (add, commit, switch, stash).
  - Running scripts under `./scripts/`, `./bin/`, or the project's test runner.

Return a single JSON object with no prose before or after:

{
  "verdict": "safe" | "requires-confirmation" | "blocked",
  "confidence": "high" | "medium" | "low",
  "reason": "<one short sentence the user will see>"
}

If you cannot parse the call or the information is insufficient, return
`requires-confirmation` with confidence `low`.
```

The user-message payload is built from: tool name, tool category, serialized input (truncated at 2 KB), current working directory, and — for bash — the command with env-var prefixes stripped.

### Classifier result shape

```ts
type ClassifierVerdict =
  | { verdict: "safe"; confidence: "high" | "medium" | "low"; reason: string }
  | { verdict: "requires-confirmation"; confidence: ...; reason: string }
  | { verdict: "blocked"; confidence: ...; reason: string }
```

Parse failures → treat as `requires-confirmation` (prompt with reason `"classifier returned unparseable output"`) and log to telemetry.

## 8. Interactive approval UX (default mode)

For each tool call not matching a rule, we `ctx.ui.select()` with these options:

```
▸ The assistant wants to run: Bash(git status)

  › Yes — just this call
  › Yes — don't ask again for `Bash(git:*)` this session
  › No — tell the assistant what to do differently
```

- **"Just this call"** → allow once, no memory.
- **"Don't ask again for `<scope>`"** → allow + append session rule. The `<scope>` string is computed per-tool (see §6).
- **"Tell the assistant..."** → opens `ctx.ui.input()` for a reason; returns `{ block: true, reason: <user text> }` so the assistant sees the feedback as the tool-result error and course-corrects.

In non-UI mode (`!ctx.hasUI`), default mode falls back to "block with reason 'no UI for approval'" — matching the behavior of `examples/extensions/permission-gate.ts`.

## 9. Plan mode

Implementation: on mode activation, call `pi.setActiveTools([readOnlyToolNames])` so only read-only tools are advertised to the LLM at all. Additionally, register a `tool_call` handler that blocks any tool not in the read-only set as defense-in-depth (in case a tool was selected before the mode toggle took effect, or a subagent is running with a stale tool set). Bash specifically uses the command allowlist from §4.

In `before_agent_start`, inject a system-prompt supplement (via the `systemPrompt` return value, chained with other extensions) that tells the assistant it is in plan mode and what it can and cannot do. Drafted text:

```
Plan mode is active. You have read-only access to this codebase: you can read
files, search, list directories, and run read-only shell commands (cat, grep,
git status, etc.). You cannot edit, write, or run any command that changes
state. Use this mode to investigate and propose a plan. The user will switch
off plan mode before you execute it.
```

Unlike pi-mono's `plan-mode` example, kimchi-dev does not need the `[DONE:n]` step tracker or the todo widget — that is orchestration concern, not permissions.

## 10. Config file

**Location precedence (highest first):**

1. CLI flag: `--permissions-config <path>`
2. Project-local: `./.kimchi/permissions.json`
3. User: `~/.config/kimchi/harness/permissions.json`

Files are merged additively (project adds to user, local adds to project). Flag-specified file replaces entirely.

**Schema (JSON, validated with `zod`):**

```json
{
  "defaultMode": "default",
  "allow": [
    "Bash(git status)",
    "Bash(git log:*)",
    "Bash(npm test *)",
    "Read(**)",
    "Grep",
    "Find"
  ],
  "deny": [
    "Bash(rm -rf /*)",
    "Bash(sudo *)",
    "Write(.env)",
    "Write(.env.*)",
    "Edit(.env)",
    "Read(/Users/*/.ssh/**)"
  ],
  "classifierTimeoutMs": 8000
}
```

Tool names in config are case-sensitive and use the LLM-facing tool name (`bash`, `read`, etc.) — but we accept PascalCase aliases (`Bash`, `Read`) for readability, matching Claude Code's convention.

On first run, if no config exists, a commented default is written to `~/.config/kimchi/harness/permissions.json` with safe defaults (empty allow, deny list pre-populated with common footguns).

## 11. Slash commands

- `/permissions` — show current mode and active rules, grouped by source.
- `/permissions mode <default|plan|auto>` — switch mode mid-session.
- `/permissions allow <rule>` — add a session-scope allow rule.
- `/permissions deny <rule>` — add a session-scope deny rule.
- `/permissions save user|project` — promote session rules to user or project config.
- `/permissions reload` — re-read config files.

## 12. Migration & compatibility

- **No new dependencies on pi-mono breaking changes**; we only use public `ExtensionAPI` surface (`pi.on`, `pi.registerCommand`, `pi.registerFlag`, `pi.registerShortcut`, `pi.setActiveTools`, `pi.getAllTools`).
- **micromatch** added as a dependency for path globbing (~50 KB, widely used).
- **Existing kimchi-dev users** who upgrade to this version: default mode is now `default` (interactive approval). This **is a behavior change** — previous sessions ran with no gate. To preserve prior behavior, users can set `KIMCHI_PERMISSIONS=auto` with an empty classifier allowlist, but we document the new behavior as the safer default. A one-time notice is shown on first run of the new version.
- **No session-file format change.** The new custom entry types (`permission-mode`, `permission-session-rule`) are appended via `pi.appendEntry` and are ignored by older versions.
- **Telemetry**: classifier calls, blocks, and denies are logged to the existing telemetry extension with PII stripped (command text is hashed beyond the leading program name).

## 13. Test strategy

**Unit tests (vitest, co-located `*.test.ts`):**

- `rules.test.ts` — pattern parsing, wildcard/prefix/exact matching, precedence. At minimum: 20 cases covering the examples in §5 plus edge cases (escaped stars, trailing wildcards, case sensitivity).
- `taxonomy.test.ts` — classification of built-in tools, heuristic for unknown tools, bash command-allowlist matching.
- `classifier.test.ts` — JSON-response parsing, partial/malformed responses, timeout handling, fail-closed/fail-open branches. Mocks `complete()` from pi-ai.
- `config.test.ts` — config discovery, merging precedence (user/project/local/cli), zod validation errors.
- `session-memory.test.ts` — scope computation, rule promotion.
- `mode.test.ts` — mode precedence (flag > env > config > default), mid-session transitions.

**Integration tests (vitest):**

- `permissions-default.test.ts` — boot agent with a fake UI, simulate a bash call, verify prompt appears and approval plumbs through.
- `permissions-plan.test.ts` — verify write tools are blocked, read tools pass.
- `permissions-auto.test.ts` — stub the model with canned classifier responses (`safe` / `blocked` / `requires-confirmation`), verify each branch.

Tests use pi-mono's `AgentSession` SDK directly rather than the TUI.

**Smoke tests (tests/smoke):**

- `permissions.smoke.test.ts` — boot kimchi-code, send "run `ls`", confirm approval prompt appears and ls runs on approval.

## 14. Implementation order

1. `taxonomy.ts` + `rules.ts` + `config.ts` with full unit tests. No pi-mono integration yet.
2. `mode.ts` state machine + `cli.ts` wiring (flag + env + command), no classifier, no UI prompt — just infrastructure.
3. Default-mode `prompts.ts` + `session-memory.ts`, wired through `tool_call` handler.
4. `plan` mode wiring (read-only tool filter + system-prompt supplement).
5. `classifier.ts` + `auto` mode full flow.
6. `/permissions` slash commands.
7. Integration tests.
8. Docs in `README.md` + a new `docs/permissions.md`.

Each step is mergeable on its own (each adds a feature behind an opt-in mode).

## 15. Open questions parked for later

- **Subagents**: should subagent tool calls inherit parent mode, or always run in plan mode by default? Leaning "inherit" for MVP; revisit after seeing subagent usage patterns.
- **MCP tools**: per-server rules (`mcp__castai_prod_eu(*)`) vs per-tool (`mcp__castai_prod_eu__list_clusters`)? MVP: per-tool only. Per-server is a wildcard like `mcp__castai_prod_eu__*` which works today.
- **Rule import/export**: out of scope for MVP. Users edit the JSON directly.
