# Permissions

kimchi-code ships a three-mode permission system that gates every tool call
the assistant wants to make. This replaces the previous "run everything, no
approval" behavior with explicit consent or configurable policy.

## Modes

| Mode | How to select | What happens on tool call |
|------|---------------|---------------------------|
| `default` | *(default)* | Prompt the user for each call. Remember approvals per-scope for the session. |
| `plan` | `--plan` flag, `KIMCHI_PERMISSIONS=plan`, or `/permissions mode plan` | Read-only tools only; writes/executes blocked with a clear error. |
| `auto` | `--auto` flag, `KIMCHI_PERMISSIONS=auto`, or `/permissions mode auto` | Allow/deny rules short-circuit. Otherwise an LLM classifier (on the same model the harness is using) decides safe / requires-confirmation / blocked. |

### Default mode

For each tool call that isn't already allowed by a rule, you get three options:

- **Yes — just this call.** Allow this call only.
- **Yes — don't ask again for `<scope>` this session.** Allow and append an
  in-memory rule for the session. Scope is tool-specific — for `bash` it's a
  prefix like `Bash(git:*)`, for file tools it's a directory glob like
  `Write(src/**)`.
- **No — tell the assistant what to do differently.** Block the call and
  forward your explanation to the assistant as the tool-result error, so it
  can course-correct.

### Plan mode

Intended for read-only exploration. The assistant sees only read-only tools
(`read`, `grep`, `find`, `ls`, `web_search`, `web_fetch`, `questionnaire`, plus
any custom tools with read-oriented names like `list_*`/`get_*`/`search_*`).
The `bash` tool is available but restricted to an allowlist of read-only
programs (`cat`, `ls`, `git status|log|diff`, `npm list`, etc.). The system
prompt is supplemented with instructions explaining the mode.

### Auto mode

For each tool call:

1. Read-only tools and read-only bash commands are allowed immediately.
2. Deny rules short-circuit to `block`.
3. Allow rules short-circuit to `allow`.
4. Otherwise the same model the harness is using is called with a
   safety-gate prompt. It returns `safe` / `requires-confirmation` /
   `blocked` with a one-sentence reason.
5. `requires-confirmation` prompts the user (falls through to block if no UI).
6. On classifier error or timeout (8 s default), the user is prompted, or
   the call is blocked if no UI is available.

## Configuration

Config files are JSON at the following paths, merged in order (later layers
override earlier ones for `defaultMode`; `allow`/`deny` are additive):

1. `~/.config/kimchi/harness/permissions.json` (user)
2. `<cwd>/.kimchi/permissions.json` (project)
3. `<cwd>/.kimchi/permissions.local.json` (local, typically gitignored)
4. `--permissions-config <path>` on the CLI, which **replaces** the merged
   config entirely.

Schema:

```json
{
  "defaultMode": "default",
  "allow": ["Bash(git status)", "Bash(npm test *)", "Read(**)"],
  "deny": ["Bash(rm -rf /*)", "Bash(sudo *)", "Write(.env)"],
  "classifierTimeoutMs": 8000
}
```

### Rule syntax

Rules are strings of the form `ToolName` or `ToolName(content)`. Tool names
are case-insensitive (`Bash` == `bash`). Content semantics depend on the tool:

| Tool | Content semantics |
|------|-------------------|
| `bash` | `prefix:*` → prefix match; `*` → wildcard (trailing ` *` is optional so `git *` matches bare `git`); `\*` → literal star; otherwise exact. |
| `read`, `write`, `edit`, `ls`, `grep`, `find` | glob matched by [micromatch](https://github.com/micromatch/micromatch) against the `path` argument. |
| other (including MCP `mcp__*__*`) | exact-match against a stable JSON serialization of the input. |

### Precedence

Rules are evaluated in source order (highest first): **session** > **cli** >
**local** > **project** > **user**. Within a single source, `deny` rules beat
`allow` rules. First match wins. If no rule matches, mode behavior takes
over (prompt in default, block in plan, classifier in auto).

## Slash commands

- `/permissions` — show current mode, config paths, and rules.
- `/permissions mode <default|plan|auto>` — switch mode at runtime.
- `/permissions allow <rule>` — add a session allow rule.
- `/permissions deny <rule>` — add a session deny rule.
- `/permissions save user|project` — persist session rules to user or project
  config.
- `/permissions reload` — re-read config files.
- `/permissions help` — show help.

## CLI flags

- `--plan` / `--auto` — start in plan or auto mode.
- `--permissions-config <path>` — override all config files.
- `--allow-tool "<rule>,<rule>,..."` — add session allow rules.
- `--deny-tool "<rule>,<rule>,..."` — add session deny rules.

## Env vars

- `KIMCHI_PERMISSIONS=default|plan|auto` — set the mode (overridden by CLI
  flags and runtime `/permissions mode`).

## Behavior change notice

This is a behavior change from older kimchi-code versions, which ran every
tool call with no approval. To restore the previous behavior, set
`defaultMode: "auto"` in `~/.config/kimchi/harness/permissions.json` (and be
aware that the classifier still runs).
