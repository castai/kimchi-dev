/**
 * Two complementary nudges for Kimi K2.x tool-calling quirks that each
 * leave the agent loop in a stuck-looking state. Both target the same failure
 * class (model said one thing, didn't follow through in the next tool-use
 * step) but fire at different points in the turn lifecycle:
 *
 *   1. Continuation nudge — post-turn. The orchestrator reasons in prose,
 *      announces it will delegate, and ends its turn without emitting the
 *      `subagent` tool call. Delivered as a `followUp` via `pi.sendMessage`
 *      so the agent loop restarts. Mirrors AISI Inspect's `on_continue`.
 *
 *   2. Empty-turn nudge — reactive. Some Kimi deployments return an empty
 *      response (no text, no tool calls) after receiving tool results. When
 *      detected on `turn_end`, the nudge is armed and injected into the next
 *      LLM context via the `context` event so it doesn't pollute the session
 *      history.
 *
 * Both are delivered as custom messages with `display: false` so they
 * never appear in the conversation. Stale nudges (those the model has
 * already acted on) are stripped from the LLM context by
 * `stripStaleNudges` before each call.
 *
 * Both are orchestrator-only concerns — wired in `prompt-enrichment.ts`
 * inside the `if (!subagentMode)` guard.
 */

import type { AssistantMessage } from "@mariozechner/pi-ai"
import type { ContextEvent } from "@mariozechner/pi-coding-agent"

/**
 * Message-array shape passed through `context` events. Derived from
 * `ContextEvent` because `AgentMessage` lives in `@mariozechner/pi-agent-core`,
 * which is only a transitive dep — importing it directly works under npm's
 * flat install but breaks under pnpm's strict resolution (and thus CI).
 */
export type OrchestratorMessages = ContextEvent["messages"]

export const CONTINUATION_NUDGE_TEXT =
	"You ended your turn without calling a tool. If the task is complete, reply with a brief summary. Otherwise, call the appropriate tool now — for any delegated pipeline step, that means invoking the `subagent` tool immediately."

export const EMPTY_TURN_NUDGE_TEXT =
	"If you have finished, please summarize the result for the user. Otherwise, continue with the next tool call."

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

	evaluateTurn(message: AssistantMessage): boolean {
		if (this.nudgedSinceLastUserInput) return false
		if (this.toolsCalledSinceLastUserInput) return false
		const hasToolCalls = message.content.some((c) => c.type === "toolCall")
		const hasText = message.content.some((c) => c.type === "text" && c.text.trim().length > 0)
		if (hasToolCalls || !hasText) return false
		this.nudgedSinceLastUserInput = true
		return true
	}
}

/**
 * Reactive state machine for the "empty follow-up" nudge.
 *
 * Some model deployments (notably Kimi K2.x) return an empty response — no text, no tool calls — after receiving tool results from a tool-call-only turn. The agent loop stalls because there is nothing to execute or display. This class detects that failure and arms a one-shot nudge that is injected into the next LLM context to prompt the model to continue.
 *
 * The nudge is reactive: it only fires after an empty response has actually occurred, not preemptively on every tool-result → LLM-call transition. Models that never produce empty responses never see the nudge at all.
 */
export class EmptyTurnNudge {
	private armed = false

	evaluateTurn(message: AssistantMessage): void {
		const hasText = message.content.some((c) => c.type === "text" && c.text.trim().length > 0)
		const hasToolCalls = message.content.some((c) => c.type === "toolCall")
		this.armed = !hasText && !hasToolCalls
	}

	shouldNudge(): boolean {
		if (!this.armed) return false
		this.armed = false
		return true
	}

	resetForNewUserInput(): void {
		this.armed = false
	}
}

/**
 * Pre-LLM-call nudge for the "tool-call-only assistant, tool results pending"
 * pattern. Returns a new messages array with a custom-role nudge appended if
 * the pattern matches, otherwise `undefined` (signal for the caller to leave
 * the context untouched).
 *
 * Injected via the `context` event so it is transient — visible only to the
 * targeted LLM call, not persisted in the session history.
 */
export const NUDGE_CUSTOM_TYPE = "nudge"

function isNudgeMessage(m: OrchestratorMessages[number]): boolean {
	return m.role === "custom" && "customType" in m && (m as { customType: string }).customType === NUDGE_CUSTOM_TYPE
}

/**
 * Strip nudge messages that the model has already acted on (i.e. there is an
 * assistant response after them). Keeps nudges that are still at the tail of
 * the array — the model hasn't seen those yet.
 */
export function stripStaleNudges(messages: OrchestratorMessages): OrchestratorMessages {
	const lastAssistantIdx = messages.findLastIndex((m) => m.role === "assistant")
	if (lastAssistantIdx === -1) return messages
	const stripped = messages.filter((m, i) => i > lastAssistantIdx || !isNudgeMessage(m))
	return stripped.length === messages.length ? messages : stripped
}

export function buildEmptyTurnNudgedMessages(messages: OrchestratorMessages): OrchestratorMessages | undefined {
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
			role: "custom" as const,
			customType: NUDGE_CUSTOM_TYPE,
			content: [{ type: "text" as const, text: EMPTY_TURN_NUDGE_TEXT }],
			display: false,
			timestamp: Date.now(),
		},
	]
}
