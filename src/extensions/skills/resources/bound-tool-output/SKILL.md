---
name: bound-tool-output
description: Cap output from harness tool calls — shell commands, file-content search, file reads — to preserve context window. Use before running Bash, before broad search patterns, and before reading large or unknown-size files.
user-invocable: false
---

# Bound Tool Output

Unbounded tool output is the #1 source of context bloat in coding harnesses. Defaults are tuned for human terminals, not LLM context. Cap *before* the call; recovery from a flood is expensive.

## Rules

1. **Estimate before running.** If output could exceed ~100 lines, cap it.
2. **Cap at the source.** Pipe to `head`/`tail`, pass `-n`, use built-in limits — don't post-filter.
3. **Search, don't dump.** Filter to what you need rather than reading everything.
4. **Iterate narrow → wide.** Start small; expand only if the answer isn't there.

## Bash

| Command | Default cap |
|---|---|
| `git log` | `-n 20 --oneline` |
| `git diff` | `--stat` first; full diff only on specific files |
| `git status` | never `-uall` on large repos |
| `npm install`/`pip install` | `2>&1 | tail -50` |
| `*test*`/`*build*` | `2>&1 | tail -100` on success; full only on failure |
| `docker logs`, `journalctl`, `tail -f` | always `--tail N` / `-n N` |
| `curl` large responses | `| head -c 5000` or `| jq` filter |
| `tree` | `-L 2` max |
| `ps aux`, `df`, `du` | filter with `grep` or `--max-depth` |

## File-content search (grep / ripgrep-equivalent)

Two-phase, every time:

1. **Paths first.** Paths-only mode (`files_with_matches`, `-l`). Cheap; narrows the space.
2. **Content second.** Only after you've decided which files matter.

Caps that harness defaults usually don't enforce tightly enough:

- Result limit (`head_limit`, `--max-count`, `-m`): **≤ 50** for content searches on broad patterns. Many defaults are 200+.
- Context lines (`-A`/`-B`/`-C`): start at **2**. Raise only if the hit doesn't make sense alone.
- Scope filter (`--glob`, `--type`, path filter): shrink *before* searching, not after.

If you need every hit across a large repo, split by path/module and aggregate — don't dump.

## File read

- Don't read a known-large file (lockfiles, vendored code, generated output, fixtures, build artifacts) without a target line. Search first, then read with an offset around the hit.
- For files larger than the harness's read cap (typically ~2000 lines), chunk via `offset`/`limit`. Re-read only if the answer isn't in the first chunk.
- Never read a file just to "see what's there." Use a directory listing or search instead.

## Recovery

If a call returned a wall of output:
- Don't re-call it. Note what you learned, move on.
- Next call on similar data: apply a cap.

## Anti-patterns

- `cat file | grep X` → use the harness's content-search tool
- `find . -name X` → use the harness's filename-search tool
- `git log` (no limit) → `git log -n 20`
- Reading a huge file in full → search to locate, then read with offset/limit
