import type { ExtensionContext, ReadonlyFooterDataProvider, Theme } from "@mariozechner/pi-coding-agent"
import type { Component } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { RST_FG, TEAL_FG } from "../ansi.js"
import { formatCount } from "../extensions/format.js"
import { getActiveSubagentCount } from "../extensions/subagent.js"

const BAR_WIDTH = 16

function teal(text: string): string {
	return `${TEAL_FG}${text}${RST_FG}`
}

export class StatsFooter implements Component {
	constructor(
		private ctx: ExtensionContext,
		private theme: Theme,
		private _footerData: ReadonlyFooterDataProvider,
	) {}

	invalidate(): void {}

	render(width: number): string[] {
		const { theme, ctx } = this
		const dim = (s: string) => theme.fg("dim", s)

		let totalInput = 0
		let totalOutput = 0
		for (const entry of ctx.sessionManager.getEntries()) {
			if (entry.type === "message") {
				const msg = entry.message
				if (msg?.role === "assistant" && msg.usage) {
					totalInput += msg.usage.input ?? 0
					totalOutput += msg.usage.output ?? 0
				}
			}
		}

		const contextUsage = ctx.getContextUsage()
		const contextPercent = contextUsage?.percent ?? 0

		const segments: string[] = []

		const modelName = ctx.model?.id ?? "no-model"
		segments.push(teal(modelName))

		const subagentCount = getActiveSubagentCount()
		if (subagentCount > 0) {
			segments.push(teal(`${subagentCount} subagent${subagentCount === 1 ? "" : "s"}`))
		}

		const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((contextPercent / 100) * BAR_WIDTH)))
		const bar = theme.fg("success", "█".repeat(filled)) + dim("░".repeat(BAR_WIDTH - filled))
		const percentStr =
			contextPercent > 90
				? theme.fg("error", `${Math.round(contextPercent)}%`)
				: contextPercent > 70
					? theme.fg("warning", `${Math.round(contextPercent)}%`)
					: teal(`${Math.round(contextPercent)}%`)
		segments.push(`${bar} ${percentStr} ${dim("ctx")}`)

		if (totalInput || totalOutput) {
			const tokens = [
				totalInput ? `↑${formatCount(totalInput)}` : "",
				totalOutput ? `↓${formatCount(totalOutput)}` : "",
			]
				.filter(Boolean)
				.join(" ")
			segments.push(dim(tokens))
		}

		const sep = ` ${dim("·")} `
		const left = segments.join(sep)
		const leftWidth = visibleWidth(left)

		const hint = dim("/ for commands")
		const hintWidth = visibleWidth(hint)

		let line: string
		if (leftWidth + 2 + hintWidth <= width) {
			line = left + " ".repeat(width - leftWidth - hintWidth) + hint
		} else {
			line = truncateToWidth(left, width)
		}

		return [line]
	}
}
