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
   - Detect format: try `JSON.parse` on trimmed content → `.json`, else `.txt`
   - Derive output dir:
     - `sessionFile = ctx.sessionManager.getSessionFile()`
     - If set: `dirname(sessionFile)/tool-results/`
     - Else: `os.tmpdir()/kimchi-tool-results/`
   - `mkdirSync(dir, { recursive: true })`
   - Write full content to `<dir>/<uuid>.<ext>`
   - On I/O failure: log warning, fall back to `truncateTail`
   - Return message to model (see below)

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
| `getSessionFile()` returns null | Fall back to `os.tmpdir()/kimchi-tool-results/` |
| `mkdirSync` or file write fails | Log warning, fall back to `truncateTail` |
| Content is not valid JSON | Use `.txt` extension |
| Content has mixed blocks (images etc.) | Only text blocks concatenated; non-text blocks dropped from file |

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
