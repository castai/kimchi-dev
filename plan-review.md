# Design Plan: Handling MiniMax Model Thinking Tokens

## Problem Statement
MiniMax-M2 is an interleaved thinking model that outputs content with `<thinking>...</thinking>` tags in the raw text stream. Per the model documentation: "Do not remove the `<thinking>` part, otherwise the model's performance will be negatively affected."

We need to:
1. Display thinking content as collapsible thinking blocks in the UI
2. Preserve the `<thinking>` tags in the raw content for history (model performance)
3. Handle this at the provider level for correctness

## Current Architecture
- pi-ai produces `AssistantMessageEvent` streams with event types: `thinking_start/thinking_delta/thinking_end` for native thinking, `text_start/text_delta/text_end` for regular text
- Extensions receive these via `MessageUpdateEvent`
- Messages stored as arrays of `TextContent | ThinkingContent | ToolCall` blocks
- Outbound messages with `requiresThinkingAsText: true` convert `ThinkingContent` → `<thinking>text</thinking>`

## The Challenge
When MiniMax responds with `<thinking>reasoning...</thinking>text...`, we receive it as plain text tokens. Without parsing, pi-ai sees this as a single text stream.

## Proposed Solution: Stream Interceptor at Provider Level

1. **Inbound (Response Streaming)**:
   - Intercept text chunks as they arrive from MiniMax
   - Maintain a state machine: `is_thinking` boolean + lookahead buffer for partial tags
   - When `<thinking>` matched → emit `thinking_start`, set `is_thinking=true`
   - When `</thinking>` matched → emit `thinking_end`, set `is_thinking=false`
   - Content between tags → `thinking_delta` events
   - Content outside tags → `text_delta` events

2. **Storage**:
   - Store as `ThinkingContent` blocks in the message (no tags in structured data)

3. **Outbound (Next Turn)**:
   - Model has `compat.requiresThinkingAsText: true`
   - pi-ai converts `ThinkingContent` → `<thinking>...</thinking>` in API request
   - Model receives tags, performance preserved

## Open Questions
1. Should the stream interceptor be part of pi-ai core or a provider-specific adapter?
2. How to handle partial/malformed tags gracefully?
3. What's the lookahead buffer size for tag detection?
4. Should this be generic for any interleaved-thinking model or MiniMax-specific?
5. How does this interact with existing thinking block rendering in the UI?

## Constraints
- Must preserve `<thinking>` tags in raw text sent to model (performance critical)
- Should not duplicate thinking content in UI (show blocks OR raw text, not both)
- Must handle streaming without UI flicker
- Must be compatible with existing pi-ai architecture
