# Permissions

kimchi-code gates every tool call through a three-mode permission system.
Switch modes at any time with **`shift+tab`** or `/permissions mode <name>`.

## Modes

| Mode | UI label | Behavior |
|------|----------|----------|
| `default` | default | Prompt on each call that isn't covered by a rule. Approvals can be remembered for the session. |
| `plan` | plan | Read-only exploration. Non-read tools are hidden; `bash` is restricted to read-only commands. |
| `auto` | yolo | Allow/deny rules short-circuit. Otherwise a classifier (same model as the session) decides `safe` / `requires-confirmation` / `blocked`. |

### Default mode

On each unmatched call the user picks from:

- **Yes — just this call.**
- **Yes — don't ask again for `<scope>` this session.** Adds an in-memory rule. Scope is tool-specific: `bash(git status:*)` (program + subcommand), `write(src/**)` (directory glob), or just the tool name.
- **No — tell the assistant what to do differently.** Blocks the call and forwards your message as the tool error.

Headless sessions (no UI) in `default` mode route through the classifier instead; `requires-confirmation` verdicts fail closed.

### Plan mode

Exposes only read-oriented tools: `read`, `grep`, `find`, `ls`, `web_search`, `web_fetch`, `questionnaire`, plus any tool whose name matches read-only patterns (`read*`, `get*`, `list*`, `search*`, `query*`, `describe*`, `view*`, `show*`, `loki_*`). `bash` is available but restricted to read-only commands (`cat`, `ls`, `git status|log|diff|show|…`, `kubectl get|describe|…`, etc. — see `src/extensions/permissions/taxonomy.ts`). The system prompt is supplemented to explain the restriction.

### Auto mode

Per call:

1. Read-only tools and read-only bash commands → allow.
2. Deny rule matches → block.
3. Allow rule matches → allow.
4. `subagent` and `set_phase` (built-in trusted tools) → allow.
5. Otherwise invoke the classifier (8s default timeout):
   - `safe` → allow
   - `blocked` → block with reason
   - `requires-confirmation` → prompt user (block if no UI)
   - error/timeout → prompt user (block if no UI)

## Built-in denylist

Applied at the lowest precedence so users can override by adding higher-precedence allow rules:

```
bash(rm -rf /*)
bash(sudo *)
write(.env)    write(.env.*)
edit(.env)     edit(.env.*)
```

`bash` also hard-blocks `sudo`, `rm -rf /`, `shutdown`, `reboot`, `mkfs`, `dd of=/dev/*`, and fork bombs — these cannot be allowlisted.

## Configuration

JSON files, merged in this order (later layers override `defaultMode`; `allow`/`deny` are additive):

1. `~/.config/kimchi/harness/permissions.json` (user)
2. `<cwd>/.kimchi/permissions.json` (project)
3. `<cwd>/.kimchi/permissions.local.json` (local, usually gitignored)
4. `--permissions-config <path>` **replaces** the merged file config (user + project + local). `--allow-tool` / `--deny-tool` still layer on top as session rules under the `cli` source.

Schema:

```json
{
  "defaultMode": "default",
  "allow": ["bash(git status)", "bash(npm test *)", "read(**)"],
  "deny": ["bash(rm -rf /*)", "write(.env)"],
  "classifierTimeoutMs": 8000
}
```

### Rule syntax

`toolname` or `toolname(content)`. Use the lowercase internal tool name (`bash`, `read`, `write`, `edit`, `ls`, `grep`, `find`, …). Input is case-insensitive (`Bash` is accepted and normalized to `bash`), but examples and saved rules use lowercase for consistency. MCP names (`mcp__server__tool`) keep their underscores verbatim.

| Tool | Content semantics |
|------|-------------------|
| `bash` | `prefix:*` → prefix match; `*` → wildcard (trailing ` *` is optional, so `git *` also matches bare `git`); `\*` → literal star; otherwise exact match. |
| `read`, `write`, `edit`, `ls`, `grep`, `find` | [micromatch](https://github.com/micromatch/micromatch) glob against the `path` argument. |
| other (incl. `mcp__server__tool`) | exact match against a stable JSON serialization of the input. |

### Precedence

Evaluated in source order (highest first): **session > cli > local > project > user > builtin**. Within a source, `deny` beats `allow`. First match wins. No match → mode behavior (prompt / block / classify).

## Slash commands

- `/permissions` — open an interactive selector (change mode, add/save rules, reload).
- `/permissions list` (or `status`) — print current mode, config paths, and all rules.
- `/permissions mode [default|plan|auto]` — switch mode (no arg opens a picker).
- `/permissions allow <rule>` / `deny <rule>` — add a session rule.
- `/permissions save user|project` — persist session rules to a config file.
- `/permissions reload` — re-read config files.
- `/permissions help` — show usage.

## CLI flags

- `--plan` / `--auto` — start in that mode.
- `--permissions-config <path>` — replace the file config (user + project + local) with a single file.
- `--allow-tool "<rule>,<rule>,..."` — session allow rules (layer on top of `--permissions-config`).
- `--deny-tool "<rule>,<rule>,..."` — session deny rules (layer on top of `--permissions-config`).

## Env vars

- `KIMCHI_PERMISSIONS=default|plan|auto` — initial mode (overridden by CLI flags and runtime changes). Propagated to spawned subagents.

## Keybindings

- `shift+tab` — cycle `default → plan → yolo → default`.
