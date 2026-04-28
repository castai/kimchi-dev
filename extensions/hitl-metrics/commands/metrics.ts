/**
 * /metrics Command Handler
 *
 * Displays HITL metrics for the current project by querying
 * accumulated data from the SQLite database.
 */

import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent"
import type { Theme } from "@mariozechner/pi-coding-agent"
import { formatMetrics, formatTimelineSection } from "../formatters.js"
import { HitlDatabase, projectHash, getSessionStats, getRecentSessions, getSessionEvents } from "../storage/index.js"
import { buildTimeline } from "../timeline.js"
import type { HitlStats, HitlSession } from "../types.js"
import { homedir } from "node:os"
import { resolve } from "node:path"

/** Storage directory path (shared with SessionManager) */
const STORAGE_DIR = resolve(homedir(), ".hitl-metrics")

/**
 * Create a fallback theme when no UI is available.
 * This satisfies the Theme type interface without actual color support.
 */
function createFallbackTheme(): Theme {
	const noOp = (text: string) => text
	// Simple theme that just returns text unchanged
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

/**
 * Get metrics output for a project directory.
 * Opens a temporary DB connection, queries stats, formats output, closes DB.
 * Pure and testable — the command handler is just glue.
 *
 * @param cwd - Project directory path
 * @param theme - Theme for color/formatting
 * @returns Formatted metrics string (or empty state message)
 */
export async function getMetricsOutput(cwd: string, theme: Theme): Promise<string> {
	const hash = projectHash(cwd)
	const dbPath = resolve(STORAGE_DIR, `${hash}.db`)

	// Check if DB file exists before trying to open
	const { existsSync } = await import("node:fs")
	if (!existsSync(dbPath)) {
		return "No HITL data recorded yet"
	}

	const db = new HitlDatabase(dbPath)
	db.open()

	try {
		// Read-only: no need to initSchema (tables must already exist)
		const stats: HitlStats = getSessionStats(db, hash)
		const sessions: HitlSession[] = getRecentSessions(db, hash, 10)

		// Empty check — stats might be zero even if DB exists
		if (stats.total_sessions === 0) {
			return "No HITL data recorded yet"
		}

		// Find most recent closed session for timeline
		const mostRecentClosedSession = sessions.find(s => s.status === "closed" && s.ended_at !== null)
		
		// Build timeline section if we have a closed session
		let timelineSection = ""
		if (mostRecentClosedSession !== undefined) {
			const events = getSessionEvents(db, mostRecentClosedSession.id)
			const segments = buildTimeline(mostRecentClosedSession, events)
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

/**
 * Handle the /metrics command.
 * Queries HITL metrics for the current project and displays them via UI.
 *
 * @param _args - Command arguments (unused)
 * @param ctx - Extension command context
 */
export async function handleMetricsCommand(_args: string, ctx: ExtensionCommandContext): Promise<void> {
	try {
		const cwd = ctx.cwd
		if (!cwd) {
			ctx.ui.notify("No project directory available", "error")
			return
		}

		let theme: Theme
		if (!ctx.hasUI) {
			// No UI available — use fallback theme
			theme = createFallbackTheme()
			const output = await getMetricsOutput(cwd, theme)
			console.log("HITL Metrics:")
			console.log(output)
			return
		}

		const output = await getMetricsOutput(cwd, ctx.ui.theme)
		ctx.ui.notify(output, "info")
	} catch (error) {
		// Non-fatal error handling — show graceful message
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[HITL] Error in metrics command: ${message}`)
		ctx.ui.notify("No HITL data recorded yet", "info")
	}
}
