/**
 * Two complementary workarounds for Kimi K2.x tool-calling quirks that each
 * leave the agent loop in a stuck-looking state. Both targets the same failure
 * class (model said one thing, didn't follow through in the next tool-use
 * step) but on opposite sides of the loop lifecycle:
 *
 *   1. `ContinuationNudge` — post-turn. The orchestrator reasons through the
 *      self-assessment in prose, announces it will delegate, and ends its
 *      turn without emitting the `subagent` tool call. Without a nudge the
 *      agent loop exits and the user has to re-prompt ("is it completed?").
 *      Mirrors AISI Inspect's `on_continue` parameter.
 *
 *   2. `buildEmptyTurnNudgedMessages` — pre-LLM-call. The model returned a
 *      tool-call-only response (no text), tool results are queued, and it
 *      is about to be called again. Some Kimi deployments return an empty
 *      response on this specific follow-up. Injecting a user-role nudge
 *      into the context reliably prevents the empty turn.
 *
 * Both are orchestrator-only concerns — they are wired in
 * `prompt-enrichment.ts` inside the `if (!subagentMode)` guard.
 */

import type { AgentMessage } from "@mariozechner/pi-agent-core"
import type { AssistantMessage } from "@mariozechner/pi-ai"

export const CONTINUATION_NUDGE_TEXT =
	"You ended your turn without calling a tool. If the task is complete, reply with a brief summary. Otherwise, call the appropriate tool now — for any delegated pipeline step, that means invoking the `subagent` tool immediately."

export const EMPTY_TURN_NUDGE_TEXT =
	"If you have finished, please summarize the result for the user. Otherwise, continue with the next tool call."

export interface NudgeDecision {
	shouldNudge: boolean
}

/**
 * Post-turn state machine for the "text-only drift" nudge.
 *
 * Fires at most once per user-input cycle, and only when no tool has been
 * called during that cycle — so legitimate end-of-task summaries after a
 * completed tool sequence are not nudged.
 */
export class ContinuationNudge {
	private toolsCalledSinceLastUserInput = false
	private nudgedSinceLastUserInput = false

	resetForNewUserInput(): void {
		this.toolsCalledSinceLastUserInput = false
		this.nudgedSinceLastUserInput = false
	}

	recordToolCall(): void {
		this.toolsCalledSinceLastUserInput = true
	}

	evaluateTurn(message: AssistantMessage): NudgeDecision {
		if (this.nudgedSinceLastUserInput) return { shouldNudge: false }
		if (this.toolsCalledSinceLastUserInput) return { shouldNudge: false }
		const hasToolCalls = message.content.some((c) => c.type === "toolCall")
		const hasText = message.content.some((c) => c.type === "text" && c.text.trim().length > 0)
		if (hasToolCalls || !hasText) return { shouldNudge: false }
		this.nudgedSinceLastUserInput = true
		return { shouldNudge: true }
	}
}

/**
 * Pre-LLM-call nudge for the "tool-call-only assistant, tool results pending"
 * pattern. Returns a new messages array with a user-role nudge appended if
 * the pattern matches, otherwise `undefined` (signal for the caller to leave
 * the context untouched).
 *
 * Stateless by design — every decision is computable from the messages array
 * alone, which also makes it trivial to unit test.
 */
export function buildEmptyTurnNudgedMessages(messages: AgentMessage[]): AgentMessage[] | undefined {
	const lastAssistant = [...messages].reverse().find((m): m is AssistantMessage => m.role === "assistant")
	if (!lastAssistant) return undefined

	const hasToolCalls = lastAssistant.content.some((c) => c.type === "toolCall")
	const hasText = lastAssistant.content.some((c) => c.type === "text")
	if (!hasToolCalls || hasText) return undefined

	const lastAssistantIndex = messages.lastIndexOf(lastAssistant)
	const hasToolResultsAfter = messages.slice(lastAssistantIndex + 1).some((m) => m.role === "toolResult")
	if (!hasToolResultsAfter) return undefined

	return [
		...messages,
		{
			role: "user" as const,
			content: [{ type: "text" as const, text: EMPTY_TURN_NUDGE_TEXT }],
			timestamp: Date.now(),
		},
	]
}
