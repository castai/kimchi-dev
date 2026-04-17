import type { AssistantMessage, Usage } from "@mariozechner/pi-ai"
import type { ExtensionAPI, MessageRenderer, Theme } from "@mariozechner/pi-coding-agent"
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
		cacheRead: number
		cacheWrite: number
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

function formatTokenCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
	return String(n)
}

// Fixed column widths (prefix + max value "1000.0k" = 7 chars):
//   ↑/↓ cols:          2 + 7 = 9  → pad to 10
//   cache-read col:   11 + 7 = 18  → pad to 20
//   cache-write col:  12 + 7 = 19  → pad to 21
//   total col:         6 + 7 = 13  (last, no padding needed)
const COL_IN_OUT_WIDTH = 10
const COL_CACHE_READ_WIDTH = 20
const COL_CACHE_WRITE_WIDTH = 21
const COL_GAP = "  "

function formatUsageValues(totals: UsageTotals, theme: Theme): string {
	const total = totals.input + totals.output + totals.cacheRead + totals.cacheWrite
	const cols = [
		`↑${formatTokenCount(totals.input)}`.padEnd(COL_IN_OUT_WIDTH),
		`↓${formatTokenCount(totals.output)}`.padEnd(COL_IN_OUT_WIDTH),
	]
	if (totals.cacheRead > 0 || totals.cacheWrite > 0) {
		cols.push(`cache-read ${formatTokenCount(totals.cacheRead)}`.padEnd(COL_CACHE_READ_WIDTH))
		cols.push(`cache-write ${formatTokenCount(totals.cacheWrite)}`.padEnd(COL_CACHE_WRITE_WIDTH))
	}
	cols.push(`${theme.fg("dim", "total ")}${formatTokenCount(total)}`)
	return cols.join(COL_GAP)
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
		const values = formatUsageValues(row.totals, theme)
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
		subagents.cacheRead += stats.tokenUsage.cacheRead
		subagents.cacheWrite += stats.tokenUsage.cacheWrite
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
