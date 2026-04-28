# Context Compactor Design

**Ticket:** LLM-1395  
**Date:** 2026-04-28  
**Status:** Approved for implementation

## Problem

14/89 benchmark trials hit `AgentTimeoutError` at the 15-minute wall clock. Sessions accumulate context monotonically — per-turn input tokens grow from ~3K at turn 1 to 78K–164K by the final turn. Cumulative tokens across a session reach 600K–9M.

The root cause is standard: every turn re-sends the full conversation history. Bash outputs are already capped at 50KB by the framework. The growth is gradual accumulation of tool results across many turns, not single giant outputs.

**Why native compaction doesn't help:** pi-coding-agent's auto-compaction checks `contextTokens > contextWindow - reserveTokens` but fires at `agent_end`, before the next user prompt — inter-session by design. In `--print` mode there is no next user prompt, so compaction fires post-mortem after the wall clock has already expired.

**Evidence:**
- `make-mips-interpreter`: 97 turns, max per-turn input = 164K tokens, ran 24 minutes
- `crack-7z-hash`: 155 turns, max per-turn input = 78K tokens

## Decision

Implement Approach A: **in-place tool result pruning via the `context` event** (no LLM call).

Rejected alternatives:
- **`pi.compact()` mid-session (Approach B):** Correct architecture but burns wall-clock time on an extra LLM summarization call during an already time-pressured run. Risk of compaction thrashing if fires multiple times.
- **Two-layer prune + compact (Approach C):** Better long-term but adds complexity. Start with prune alone; add compact as a follow-up if benchmarks show it's needed.

Validated by: opencode implements identical prune logic (`PRUNE_PROTECT=40k`, `PRUNE_MINIMUM=20k`, marks old tool parts as compacted).

## Design

### New file: `src/extensions/context-compactor.ts`

Default export `contextCompactorExtension(pi: ExtensionAPI)` — same shape as all other extensions.

Skips subagents via `isSubagent()` guard. Subagent sessions are short (11–55 events in evidence) and not contributing to timeouts.

### Constants

```ts
const PRUNE_THRESHOLD = 35_000  // input tokens — trigger prune
const PROTECT_WINDOW  = 30      // messages — keep last N untouched
const MIN_PRUNE_CHARS = 500     // chars — skip tiny tool outputs
```

`PRUNE_THRESHOLD = 35_000` targets a 50K ceiling with a 15K buffer for whatever the current turn generates. `PROTECT_WINDOW = 30` protects approximately the last 5–6 turns (a turn = ~5 messages: user + assistant + 1–3 tool results).

### State

```ts
let lastInputTokens = 0
```

Closure-scoped — declared inside `contextCompactorExtension`, not at module level. This ensures each agent instance (if multiple are ever constructed in the same process) has independent state. No reset needed — in `--print` mode each harness run is a fresh process.

### Event: `message_end`

```ts
pi.on("message_end", async (event) => {
    const msg = event.message as AssistantMessage
    if (msg.role !== "assistant") return
    lastInputTokens = msg.usage?.input ?? 0
})
```

Records the actual per-turn input token count from the API response. Used as the trigger signal on the next turn.

Using `lastInputTokens` (previous turn) rather than estimating from `event.messages` in the context handler is intentional: the API count is exact, character estimation is inaccurate, and the 15K buffer absorbs the one-turn lag.

### Event: `context`

```ts
pi.on("context", async (event) => {
    if (lastInputTokens < PRUNE_THRESHOLD) return
    const { messages } = event
    if (messages.length <= PROTECT_WINDOW) return

    const cutoff = messages.length - PROTECT_WINDOW

    return {
        messages: messages.map((msg, i) => {
            if (i >= cutoff) return msg
            if (msg.role !== "toolResult") return msg

            return {
                ...msg,
                content: msg.content.map(block => {
                    if (block.type !== "text") return block
                    if (block.text.length < MIN_PRUNE_CHARS) return block
                    if (msg.isError) {
                        // keep last 2000 chars of error output — tail contains the actual crash reason
                        const tail = block.text.slice(-2000)
                        return { ...block, text: `[compacted: ${msg.toolName} error, ${block.text.length} chars]\n...\n${tail}` }
                    }
                    return { ...block, text: `[compacted: ${msg.toolName} output, ${block.text.length} chars]` }
                }),
            }
        }),
    }
})
```

Key design points:
- Returns a **new array** — never mutates `event.messages` in-place
- Maps over individual content blocks — preserves `ImageContent` and any future block types
- Error tool results are **truncated, not skipped** — keeps last 2000 chars (the tail contains the actual crash reason). Full exemption would cause loop-of-errors sessions (e.g., crack-7z-hash's 155-turn loop) to grow unbounded.
- Shallow-clones messages with `{ ...msg }` — preserves all fields (`toolCallId`, `toolName`, `details`, `isError`, `timestamp`)
- No cooldown needed: prune self-regulates. After pruning, `message_end` reports lower tokens and the handler goes quiet until accumulation climbs back above 35K.
- **PROTECT_WINDOW limitation:** If the last 30 messages themselves contain large bash outputs (e.g., 50KB × 6 recent turns ≈ 72K tokens), prune cannot help since those messages are in the protected zone. In that case reduce `PROTECT_WINDOW` to 10. The primary case (accumulated old history) is fully covered by 30.

### Registration: `src/cli.ts`

```ts
import contextCompactorExtension from "./extensions/context-compactor.js"

// in the extensions array:
promptSummaryExtension,
contextCompactorExtension,
```

## Data flow

```
turn N completes
  → message_end fires
  → lastInputTokens = usage.input (e.g. 42,000)

turn N+1 starts
  → context fires with full messages array
  → lastInputTokens (42K) > PRUNE_THRESHOLD (35K) → prune runs
  → old ToolResultMessages beyond last 30 get text blocks replaced
  → reduced messages array sent to LLM
  → message_end fires with lower input tokens (e.g. 18,000)

turn N+2 starts
  → context fires
  → lastInputTokens (18K) < PRUNE_THRESHOLD → no prune
  → accumulation resumes until next threshold crossing
```

## What this does NOT cover

- Sessions with very long assistant turns (single turn > 35K tokens of output). Unlikely for benchmark tasks but not addressed.
- Pathological loop cases (crack-7z-hash: 155 turns). Prune will keep context bounded but won't stop the loop itself — that's loop-guard's job (LLM-1403 and related).
- LLM summarization quality. Prune is lossy: the agent loses raw tool output but retains its own prior reasoning. For benchmark tasks this is acceptable — the agent already acted on the output.

## Testing

Rerun the 4 evidence trials with the extension active. Expected outcome: per-turn input plateaus below 50K instead of growing monotonically to 164K. Benchmark pass rate on the 14 timed-out trials should improve.
