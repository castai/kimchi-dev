// Runs inside subagent processes only. After every turn, reads the assistant
// message's usage, accumulates running totals, and on transitions across the
// soft-budget thresholds (80%, 100%) injects a steering message into the
// running conversation so the model sees its budget status before the next
// LLM call.
//
// The `display: false` flag keeps the warning out of the visible UI but in the
// model's context — the human watching the parent's terminal already sees the
// same warning via the parent's `accumulated` buffer.
//
// Cache-read tokens are excluded from the count to mirror the parent's
// resolveBudgetConfig / checkBudgetState semantics.

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

interface BudgetConfig {
	softLimit: number
	warningThreshold: number
}

type BudgetState = "normal" | "warning" | "exceeded"

interface UsageLike {
	input?: number
	output?: number
}

export function parseBudgetConfig(softBudget: string | undefined): BudgetConfig | null {
	if (!softBudget || softBudget.length === 0) return null
	const soft = Number(softBudget)
	if (!Number.isFinite(soft) || soft <= 0) return null
	return {
		softLimit: soft,
		warningThreshold: Math.round(soft * 0.8),
	}
}

export function nextBudgetState(total: number, config: BudgetConfig, current: BudgetState): BudgetState {
	if (total > config.softLimit) return "exceeded"
	if (total > config.warningThreshold) return current === "exceeded" ? "exceeded" : "warning"
	return current
}

export function buildWarningText(total: number, config: BudgetConfig, next: BudgetState): string | null {
	const used = total.toLocaleString()
	const limit = config.softLimit.toLocaleString()
	if (next === "exceeded") {
		return `[budget exceeded: ${used} / ${limit} soft limit. Finishing current action, then stopping.]`
	}
	if (next === "warning") {
		const percent = Math.round((total / config.softLimit) * 100)
		return `[budget warning: ${used} / ${limit} soft limit used (${percent}%). Consider wrapping up.]`
	}
	return null
}

export default function (pi: ExtensionAPI): void {
	if (process.env.KIMCHI_SUBAGENT !== "1") return

	const config = parseBudgetConfig(process.env.KIMCHI_SUBAGENT_SOFT_BUDGET)

	let inputTokens = 0
	let outputTokens = 0
	let state: BudgetState = "normal"
	let turnCount = 0

	pi.on("turn_end", (event) => {
		const message = event.message as { usage?: UsageLike } | undefined
		const usage = message?.usage
		if (!usage) return
		inputTokens += typeof usage.input === "number" ? usage.input : 0
		outputTokens += typeof usage.output === "number" ? usage.output : 0
		const total = inputTokens + outputTokens
		turnCount += 1

		if (config) {
			const prev = state
			const next = nextBudgetState(total, config, state)
			if (next === prev) return
			state = next
			const text = buildWarningText(total, config, next)
			if (text === null) return
			const customType = next === "exceeded" ? "budget_exceeded" : "budget_warning"
			pi.sendMessage({ customType, content: [{ type: "text", text }], display: false }, { triggerTurn: true })
			return
		}

		// No budget configured — emit an actionable usage report that forces the model to confront the burn rate
		const text = `[SYSTEM TOKEN REPORT] Turn ${turnCount} — cumulative ${total.toLocaleString()} tokens (${inputTokens.toLocaleString()} input + ${outputTokens.toLocaleString()} output).\nThis report is real-time feedback. Use it:\n- If you're re-reading files you've already covered, STOP and wrap up.\n- If the last few turns each burned >50K input tokens, STOP after the current tool call.\n- Return your findings now. The orchestrator can spawn a fresh subagent for deeper work. Do NOT over-investigate.`
		pi.sendMessage(
			{ customType: "budget_usage_report", content: [{ type: "text", text }], display: false },
			{ triggerTurn: false },
		)
	})
}
