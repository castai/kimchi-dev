import type { AssistantMessage } from "@mariozechner/pi-ai"

export const CONTINUATION_NUDGE_TEXT =
	"You ended your turn without calling a tool. If the task is complete, reply with a brief summary. Otherwise, call the appropriate tool now — for any delegated pipeline step, that means invoking the `subagent` tool immediately."

export interface NudgeDecision {
	shouldNudge: boolean
}

/**
 * State machine for the orchestrator "text-only drift" nudge.
 *
 * Detects the failure mode where the orchestrator reasons through the
 * self-assessment in prose, announces it will delegate, and then ends its
 * turn without emitting the `subagent` tool call. Documented for kimi-k2.5
 * and other models with unreliable native tool-calling; mirrors the
 * `on_continue` pattern used by AISI Inspect's ReAct agent.
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
