import type { ExtensionContext, ReadonlyFooterDataProvider, Theme } from "@mariozechner/pi-coding-agent"
import type { Component } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { formatCount } from "../extensions/format.js"

function sanitizeStatusText(text: string): string {
	return text
		.replace(/[\r\n\t]/g, " ")
		.replace(/ +/g, " ")
		.trim()
}

export class StatsFooter implements Component {
	constructor(
		private ctx: ExtensionContext,
		private theme: Theme,
		private footerData: ReadonlyFooterDataProvider,
	) {}

	invalidate(): void {}

	render(width: number): string[] {
		let totalInput = 0
		let totalOutput = 0
		let totalCacheRead = 0
		let totalCacheWrite = 0
		let totalCost = 0

		for (const entry of this.ctx.sessionManager.getEntries()) {
			if (entry.type === "message") {
				const msg = (entry as any).message
				if (msg?.role === "assistant" && msg.usage) {
					totalInput += msg.usage.input ?? 0
					totalOutput += msg.usage.output ?? 0
					totalCacheRead += msg.usage.cacheRead ?? 0
					totalCacheWrite += msg.usage.cacheWrite ?? 0
					totalCost += msg.usage.cost?.total ?? 0
				}
			}
		}

		const contextUsage = this.ctx.getContextUsage()
		const contextWindow = contextUsage?.contextWindow ?? this.ctx.model?.contextWindow ?? 0
		const contextPercentValue = contextUsage?.percent ?? 0
		const contextPercent = contextUsage?.percent != null ? contextPercentValue.toFixed(1) : "?"

		const statsParts: string[] = []
		if (totalInput) statsParts.push(`↑${formatCount(totalInput)}`)
		if (totalOutput) statsParts.push(`↓${formatCount(totalOutput)}`)
		if (totalCacheRead) statsParts.push(`R${formatCount(totalCacheRead)}`)
		if (totalCacheWrite) statsParts.push(`W${formatCount(totalCacheWrite)}`)
		if (totalCost) statsParts.push(`$${totalCost.toFixed(3)}`)

		const contextDisplay =
			contextPercent === "?"
				? `?/${formatCount(contextWindow)}`
				: `${contextPercent}%/${formatCount(contextWindow)}`

		let contextPercentStr: string
		if (contextPercentValue > 90) contextPercentStr = this.theme.fg("error", contextDisplay)
		else if (contextPercentValue > 70) contextPercentStr = this.theme.fg("warning", contextDisplay)
		else contextPercentStr = contextDisplay

		statsParts.push(contextPercentStr)

		let statsLeft = statsParts.join(" ")
		let statsLeftWidth = visibleWidth(statsLeft)
		if (statsLeftWidth > width) {
			statsLeft = truncateToWidth(statsLeft, width, "...")
			statsLeftWidth = visibleWidth(statsLeft)
		}

		const modelName = this.ctx.model?.id ?? "no-model"
		let rightSide = modelName
		if (this.footerData.getAvailableProviderCount() > 1 && this.ctx.model) {
			const withProvider = `(${(this.ctx.model as any).provider}) ${modelName}`
			if (statsLeftWidth + 2 + visibleWidth(withProvider) <= width) {
				rightSide = withProvider
			}
		}

		const rightSideWidth = visibleWidth(rightSide)
		let statsLine: string
		if (statsLeftWidth + 2 + rightSideWidth <= width) {
			statsLine = statsLeft + " ".repeat(width - statsLeftWidth - rightSideWidth) + rightSide
		} else {
			const available = width - statsLeftWidth - 2
			if (available > 0) {
				const truncated = truncateToWidth(rightSide, available, "")
				statsLine = statsLeft + " ".repeat(Math.max(0, width - statsLeftWidth - visibleWidth(truncated))) + truncated
			} else {
				statsLine = statsLeft
			}
		}

		const dimStatsLeft = this.theme.fg("dim", statsLeft)
		const remainder = statsLine.slice(statsLeft.length)
		const dimRemainder = this.theme.fg("dim", remainder)
		const lines = [dimStatsLeft + dimRemainder]

		const extensionStatuses = this.footerData.getExtensionStatuses()
		if (extensionStatuses.size > 0) {
			const statusLine = Array.from(extensionStatuses.entries())
				.sort(([a], [b]) => a.localeCompare(b))
				.map(([, text]) => sanitizeStatusText(text))
				.join(" ")
			lines.push(truncateToWidth(statusLine, width, this.theme.fg("dim", "...")))
		}

		return lines
	}
}
