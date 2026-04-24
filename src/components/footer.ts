import type { ExtensionContext, ReadonlyFooterDataProvider, Theme } from "@mariozechner/pi-coding-agent"
import type { Component } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { RST_FG, TEAL_FG } from "../ansi.js"
import { formatCount } from "../extensions/format.js"
import { getActiveSubagentCount } from "../extensions/subagent.js"
import { getActiveTags, getCurrentPhase, parseTag } from "../extensions/tags.js"

interface FooterSegment {
	text: string
	width: number
}

const BAR_WIDTH = 16

function teal(text: string): string {
	return `${TEAL_FG}${text}${RST_FG}`
}

function seg(text: string): FooterSegment {
	return { text, width: visibleWidth(text) }
}

export class StatsFooter implements Component {
	constructor(
		private ctx: ExtensionContext,
		private theme: Theme,
		private _footerData: ReadonlyFooterDataProvider,
	) {}

	invalidate(): void {}

	private dim(s: string): string {
		return this.theme.fg("dim", s)
	}

	private sessionSegment(): FooterSegment {
		const name = this.ctx.sessionManager.getSessionName() ?? "default"
		return seg(this.dim(name))
	}

	private modelSegment(): FooterSegment {
		const modelId = this.ctx.model?.id ?? "n/a"
		return seg(teal(modelId))
	}

	private usageSegment(): FooterSegment | null {
		let totalInput = 0
		let totalOutput = 0
		for (const entry of this.ctx.sessionManager.getEntries()) {
			if (entry.type === "message") {
				const msg = entry.message
				if (msg?.role === "assistant" && msg.usage) {
					totalInput += msg.usage.input ?? 0
					totalOutput += msg.usage.output ?? 0
				}
			}
		}
		if (!totalInput && !totalOutput) return null
		const tokens = [totalInput ? `↑${formatCount(totalInput)}` : "", totalOutput ? `↓${formatCount(totalOutput)}` : ""]
			.filter(Boolean)
			.join(" ")
		return seg(this.dim(tokens))
	}

	private contextSegment(): FooterSegment {
		const contextUsage = this.ctx.getContextUsage()
		const pct = contextUsage?.percent ?? 0

		const filled = Math.max(0, Math.min(BAR_WIDTH, Math.round((pct / 100) * BAR_WIDTH)))
		const bar = this.theme.fg("success", "█".repeat(filled)) + this.dim("░".repeat(BAR_WIDTH - filled))
		const pctColor = pct > 90 ? "error" : pct > 70 ? "warning" : undefined
		const pctStr = pctColor ? this.theme.fg(pctColor, `${Math.round(pct)}%`) : teal(`${Math.round(pct)}%`)
		return seg(`${bar} ${pctStr} ${this.dim("ctx")}`)
	}

	private phaseSegment(): FooterSegment {
		const phase = getCurrentPhase() ?? "n/a"
		return seg(`${this.dim("phase:")}${teal(phase)}`)
	}

	private tagsSegment(parsed: Array<{ key: string; value: string }>): FooterSegment | null {
		const display = parsed.filter((t) => t.key !== "team" && t.key !== "phase")
		if (display.length === 0) return null
		const formatted = display.map((t) => this.dim(`${t.key}:${t.value}`)).join(this.dim(" "))
		return seg(`${this.dim("tags:")}${formatted}`)
	}

	private teamSegment(parsed: Array<{ key: string; value: string }>): FooterSegment | null {
		const team = parsed.find((t) => t.key === "team")
		if (!team) return null
		return seg(`${this.dim("team:")}${teal(team.value)}`)
	}

	private subagentSegment(): FooterSegment | null {
		const count = getActiveSubagentCount()
		if (count === 0) return null
		return seg(teal(`${count} subagent${count === 1 ? "" : "s"}`))
	}

	render(width: number): string[] {
		const tags = getActiveTags()
			.map(parseTag)
			.filter((t): t is { key: string; value: string } => t !== null)

		const segments = [
			this.sessionSegment(),
			this.modelSegment(),
			this.subagentSegment(),
			this.contextSegment(),
			this.usageSegment(),
			this.phaseSegment(),
			this.tagsSegment(tags),
			this.teamSegment(tags),
		].filter((s): s is FooterSegment => s !== null)

		const sep = ` ${this.dim("·")} `
		const left = segments.map((s) => s.text).join(sep)
		const leftWidth = visibleWidth(left)

		const hint = this.dim("/ for commands")
		const hintWidth = visibleWidth(hint)

		let line: string
		if (leftWidth + 2 + hintWidth <= width) {
			line = `${left}${" ".repeat(width - leftWidth - hintWidth)}${hint}`
		} else {
			line = truncateToWidth(left, width)
		}

		return [line]
	}
}
