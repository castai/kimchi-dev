/**
 * /metrics Command Handler
 *
 * Displays HITL metrics for the current project with three-category
 * time breakdown: agent, HITL, and idle time.
 */

import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent"
import type { Theme } from "@mariozechner/pi-coding-agent"
import { formatMetrics, formatTimelineSection } from "../formatters.js"
import {
	HitlDatabase,
	projectHash,
	getSessionStats,
	getRecentSessions,
	getSessionEvents,
	getSessionActivityEvents,
} from "../storage/index.js"
import { buildTimeline } from "../timeline.js"
import type { HitlStats, HitlSession } from "../types.js"
import { homedir } from "node:os"
import { join, resolve } from "node:path"

const STORAGE_DIR = join(homedir(), ".kimchi", "metrics")

function createFallbackTheme(): Theme {
	const noOp = (text: string) => text
	return {
		name: "fallback",
		fg: (_c: string, text: string) => text,
		bg: (_c: string, text: string) => text,
		bold: noOp,
		italic: noOp,
		underline: noOp,
		inverse: noOp,
		strikethrough: noOp,
		getFgAnsi: () => "",
		getBgAnsi: () => "",
		getColorMode: () => "truecolor",
		getThinkingBorderColor: () => noOp,
		getBashModeBorderColor: () => noOp,
	} as unknown as Theme
}

export async function getMetricsOutput(
	cwd: string,
	theme: Theme,
	options: { dbPath?: string } = {},
): Promise<string> {
	const hash = projectHash(cwd)
	const dbPath = options.dbPath ?? resolve(STORAGE_DIR, hash, "hitl.db")

	const { existsSync } = await import("node:fs")
	if (!existsSync(dbPath)) {
		return "No HITL data recorded yet"
	}

	const db = new HitlDatabase(dbPath)
	db.open()

	try {
		const stats: HitlStats = getSessionStats(db)
		const sessions: HitlSession[] = getRecentSessions(db, 10)

		if (stats.total_sessions === 0) {
			return "No HITL data recorded yet"
		}

		// Find most recent closed session for timeline with activity data
		const mostRecentClosedSession = sessions.find((s) => s.status === "closed" && s.ended_at !== null)

		let timelineSection = ""
		if (mostRecentClosedSession) {
			const events = getSessionEvents(db, mostRecentClosedSession.id)
			const activities = getSessionActivityEvents(db, mostRecentClosedSession.id)
			const segments = buildTimeline(mostRecentClosedSession, events, activities)
			timelineSection = formatTimelineSection(segments, theme, 60)
		}

		return formatMetrics(stats, sessions, theme, timelineSection)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[HITL] Error querying metrics: ${message}`)
		return "No HITL data recorded yet"
	} finally {
		db.close()
	}
}

export async function handleMetricsCommand(_args: string, ctx: ExtensionCommandContext): Promise<void> {
	try {
		const cwd = ctx.cwd
		if (!cwd) {
			ctx.ui.notify("No project directory available", "error")
			return
		}

		if (!ctx.hasUI) {
			const output = await getMetricsOutput(cwd, createFallbackTheme())
			console.log("HITL Metrics:")
			console.log(output)
			return
		}

		const output = await getMetricsOutput(cwd, ctx.ui.theme)
		ctx.ui.notify(output, "info")
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[HITL] Error in metrics command: ${message}`)
		ctx.ui.notify("No HITL data recorded yet", "info")
	}
}
