import type { AssistantMessage, Usage } from "@mariozechner/pi-ai"
import type { ExtensionAPI, MessageRenderer } from "@mariozechner/pi-coding-agent"
import { Container, Text } from "@mariozechner/pi-tui"
import { isSubagent } from "./orchestration/prompt-transformer/prompt-transformer.js"

interface UsageTotals {
	input: number
	output: number
	cacheRead: number
	cacheWrite: number
}

interface SubagentStats {
	tokenUsage: {
		input: number
		output: number
	}
}

interface PromptSummaryData {
	elapsed: string
	orchestrator: UsageTotals | null
	subagents: UsageTotals | null
	total: UsageTotals
}

function emptyTotals(): UsageTotals {
	return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }
}

function addUsage(totals: UsageTotals, usage: Usage): void {
	totals.input += usage.input
	totals.output += usage.output
	totals.cacheRead += usage.cacheRead
	totals.cacheWrite += usage.cacheWrite
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`
	const s = ms / 1000
	if (s < 60) return `${s.toFixed(1)}s`
	const m = Math.floor(s / 60)
	const rem = Math.round(s % 60)
	return `${m}m ${rem}s`
}

function formatUsageValues(totals: UsageTotals): string {
	const total = totals.input + totals.output + totals.cacheRead + totals.cacheWrite
	const parts = [`↑${totals.input.toLocaleString()}`, `↓${totals.output.toLocaleString()}`]
	if (totals.cacheRead > 0) parts.push(`cache-read ${totals.cacheRead.toLocaleString()}`)
	if (totals.cacheWrite > 0) parts.push(`cache-write ${totals.cacheWrite.toLocaleString()}`)
	parts.push(`total ${total.toLocaleString()}`)
	return parts.join("   ")
}

const LABEL_WIDTH = 16
const INDENT = "  "

const promptSummaryRenderer: MessageRenderer<PromptSummaryData> = (message, _options, theme) => {
	const data = message.details as PromptSummaryData
	if (!data) return undefined

	const container = new Container()

	const dash = theme.fg("dim", "- ")
	const header = theme.bold(theme.fg("toolTitle", "Prompt summary"))
	container.addChild(new Text(dash + header, 0, 0))

	container.addChild(new Text(INDENT + theme.fg("dim", "execution:".padEnd(LABEL_WIDTH)) + data.elapsed, 0, 0))

	const rows: Array<{ label: string; totals: UsageTotals }> = []
	if (data.orchestrator) rows.push({ label: "orchestrator:", totals: data.orchestrator })
	if (data.subagents) rows.push({ label: "subagents:", totals: data.subagents })
	rows.push({ label: "total:", totals: data.total })

	for (const row of rows) {
		const rowLabel = theme.fg("dim", row.label.padEnd(LABEL_WIDTH))
		const values = formatUsageValues(row.totals)
		container.addChild(new Text(INDENT + rowLabel + values, 0, 0))
	}

	return container
}

export default function promptSummaryExtension(pi: ExtensionAPI) {
	if (isSubagent()) return

	pi.registerMessageRenderer("prompt-summary", promptSummaryRenderer)

	const orchestrator = emptyTotals()
	const subagents = emptyTotals()
	const startedAt = Date.now()

	pi.on("message_end", async (event) => {
		const message = event.message as AssistantMessage
		if (message.role !== "assistant") return
		addUsage(orchestrator, message.usage)
	})

	pi.on("tool_result", async (event) => {
		if (event.toolName !== "subagent") return
		const stats = event.details as SubagentStats | undefined
		if (!stats?.tokenUsage) return
		subagents.input += stats.tokenUsage.input
		subagents.output += stats.tokenUsage.output
	})

	pi.on("agent_end", async () => {
		const grandTotal: UsageTotals = {
			input: orchestrator.input + subagents.input,
			output: orchestrator.output + subagents.output,
			cacheRead: orchestrator.cacheRead + subagents.cacheRead,
			cacheWrite: orchestrator.cacheWrite + subagents.cacheWrite,
		}
		if (grandTotal.input + grandTotal.output === 0) return

		const data: PromptSummaryData = {
			elapsed: formatDuration(Date.now() - startedAt),
			orchestrator: orchestrator.input + orchestrator.output > 0 ? { ...orchestrator } : null,
			subagents: subagents.input + subagents.output > 0 ? { ...subagents } : null,
			total: grandTotal,
		}

		// Defer so the agent event loop finishes and isStreaming resets to false
		// before sendMessage is called — otherwise it gets queued as a steer message
		// and only appears after the next user prompt.
		await new Promise((resolve) => setTimeout(resolve, 0))

		pi.sendMessage({
			customType: "prompt-summary",
			content: [{ type: "text", text: `Prompt summary (${data.elapsed})` }],
			display: true,
			details: data,
		})
	})
}
