# MCP Tool Result Offload Design

## Context

MCP tool calls (especially Loki log queries) return large payloads that go directly into LLM context, causing token spikes. A Loki query returning 51KB of JSON caused a 1k → 31k token spike in one session. The existing `truncateTail` (50KB/2000 lines) failed because the response was a single JSON blob treated as one line.

The fix mirrors Claude Code's pattern: when a tool result exceeds a threshold, save the full result to a file and return a message to the model with the path and instructions for reading it.

---

## Design

### Configuration

Add `maxToolResultChars?: number` to `src/config.ts` `Config` type. Read from `~/.config/kimchi/config.json`. Default: `10_000` characters (~2,500 tokens at 4 chars/token).

```json
{
  "maxToolResultChars": 10000
}
```

### `applyOffload` function (`proxy-modes.ts`)

Replaces `applyTruncation`. Signature:

```typescript
function applyOffload(
  content: ContentBlock[],
  toolName: string,
  maxChars: number,
  ctx: ExtensionContext,
): ContentBlock[]
```

**Logic:**
1. Filter `type === "text"` blocks, concatenate into single string
2. If total chars ≤ `maxChars` → return content as-is (no change)
3. If over limit:
   - Detect format: lightweight heuristic `/^\s*[\{\[]/.test(content)` → `.json`, else `.txt` (avoids blocking the event loop on large strings; concatenated multi-block content is never valid JSON anyway)
   - Derive output dir:
     - `sessionFile = ctx.sessionManager.getSessionFile()`
     - If set: `dirname(sessionFile)/tool-results/`
     - Else: `os.tmpdir()/kimchi-tool-results/`
   - `mkdirSync(dir, { recursive: true })`
   - Write full content to `<dir>/<uuid>.<ext>`
   - On I/O failure: log warning, hard-slice: `text.slice(0, maxChars) + "\n\n... [Truncated due to I/O error]"` (do NOT fall back to `truncateTail` — it fails on single-line blobs, the same class of input that triggered offload)
   - Return: all original non-text blocks (images etc.) preserved + new offload message text block

**Note:** The message references `bash` for file inspection. Kimchi always registers bash as a core tool, so this is guaranteed to be available.

**Model message format:**
```
result (<N> characters) exceeds limit. Full output saved to <path>.
Format: <JSON | Plain text>
- To search: use bash with grep on the file directly
- To read in chunks: bash -c "python3 -c \"print(open('<path>').read()[A:B])\""
- For analysis requiring full content: use a subagent with the file path
```

### Parameter threading

- `src/config.ts`: add `maxToolResultChars` to `Config`, default `10_000`
- `src/extensions/mcp-adapter/index.ts`: pass `ctx` and `config.maxToolResultChars` to `executeCall`
- `src/extensions/mcp-adapter/proxy-modes.ts`: `executeCall` receives `ctx: ExtensionContext` and `maxToolResultChars: number`; calls `applyOffload` instead of `applyTruncation`

### What is NOT changed

- `executeSearch`, `executeList`, `executeDescribe` — not affected
- Direct tool executors — not affected
- `renderResult` 10-line UI collapse — separate concern, unchanged
- bash/read tools — not affected (can revisit later)

---

## Edge Cases

| Scenario | Handling |
|---|---|
| `getSessionFile()` returns null | Fall back to `os.tmpdir()/kimchi-tool-results/` (files unmanaged; rely on OS temp cleanup; proper cleanup deferred to future PR) |
| `mkdirSync` or file write fails | Log warning, fall back to `truncateTail` |
| Content is not valid JSON | Use `.txt` extension |
| Content has mixed blocks (images etc.) | Only text blocks written to file; non-text blocks (images) preserved in the returned `ContentBlock[]` alongside the offload message |

---

## Files Changed

- `src/config.ts`
- `src/extensions/mcp-adapter/index.ts`
- `src/extensions/mcp-adapter/proxy-modes.ts`

---

## Verification

1. Run `pnpm typecheck` — must pass
2. Build binary: `pnpm build:binary`
3. Start session, run a Loki query that returns large output
4. Confirm context stays under ~3k tokens (not 31k)
5. Confirm a file appears under `<session-dir>/tool-results/`
6. Confirm model uses bash/grep to read it rather than having it in context
