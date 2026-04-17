import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

export const MAX_CONSECUTIVE_FAILURES = 5
export const MAX_REPEATED_CALLS = 3
export const CALL_HISTORY_WINDOW = 15

export class LoopGuard {
	private consecutiveFailures = 0
	private callHistory: string[] = []
	private triggered = false

	reset(): void {
		this.consecutiveFailures = 0
		this.callHistory = []
		this.triggered = false
	}

	isTriggered(): boolean {
		return this.triggered
	}

	recordResult(isError: boolean): void {
		if (isError) {
			this.consecutiveFailures++
		} else {
			this.consecutiveFailures = 0
		}
	}

	checkAndRecord(toolName: string, input: Record<string, unknown>): { block: boolean; reason?: string } {
		if (this.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
			this.triggered = true
			return {
				block: true,
				reason: `Loop guard: ${this.consecutiveFailures} consecutive tool failures. Stop retrying and summarize what went wrong.`,
			}
		}

		const fingerprint = toolFingerprint(toolName, input)
		const repeatCount = this.callHistory.filter((f) => f === fingerprint).length
		if (repeatCount >= MAX_REPEATED_CALLS) {
			this.triggered = true
			return {
				block: true,
				reason: `Loop guard: "${toolName}" called with identical arguments ${repeatCount + 1} times. Stop repeating and try a different approach.`,
			}
		}

		this.callHistory.push(fingerprint)
		if (this.callHistory.length > CALL_HISTORY_WINDOW) {
			this.callHistory.shift()
		}

		return { block: false }
	}
}

function toolFingerprint(toolName: string, input: Record<string, unknown>): string {
	return `${toolName}:${stableStringify(input)}`
}

function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value)
	}
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(",")}]`
	}
	const obj = value as Record<string, unknown>
	const entries = Object.keys(obj)
		.sort()
		.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
	return `{${entries.join(",")}}`
}

const STOP_MESSAGE =
	"Loop guard activated. Do not make any more tool calls. Respond only with plain text summarizing what was attempted and why it failed."

export default function loopGuardExtension(pi: ExtensionAPI) {
	const guard = new LoopGuard()

	pi.on("input", () => {
		guard.reset()
	})

	pi.on("tool_execution_end", (event) => {
		guard.recordResult(event.isError)
	})

	pi.on("tool_call", (event) => {
		const check = guard.checkAndRecord(event.toolName, event.input as Record<string, unknown>)
		if (check.block) {
			return { block: true, reason: check.reason }
		}
	})

	pi.on("before_agent_start", () => {
		if (!guard.isTriggered()) return
		return {
			message: {
				customType: "loop-guard-stop",
				content: [{ type: "text" as const, text: STOP_MESSAGE }],
				display: true,
			},
		}
	})
}
