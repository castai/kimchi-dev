/**
 * HITL Metrics Formatters
 *
 * Pure formatting utilities for displaying HITL metrics in the TUI.
 * No side effects — completely testable.
 */

import type { HitlStats, HitlSession, TimelineSegment } from "./types.ts"
import { renderTimeline } from "./timeline.ts"

/**
 * Theme interface for color/formatting — matches @mariozechner/pi-coding-agent Theme
 */
export interface Theme {
	fg: (color: string, text: string) => string
	bg: (color: string, text: string) => string
	bold: (text: string) => string
	dim: (text: string) => string
	italic: (text: string) => string
	underline: (text: string) => string
	strikethrough: (text: string) => string
}

/**
 * Convert milliseconds to human-readable "Xh Ym Zs" format.
 * - Omits zero-value leading segments (e.g., no "0h" if < 1 hour)
 * - Always shows at least "0s" for zero input
 * - Rounds seconds to whole numbers
 */
export function formatDuration(ms: number): string {
	if (ms < 0) ms = 0
	if (ms === 0) return "0s"

	const totalSeconds = Math.round(ms / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const parts: string[] = []

	if (hours > 0) {
		parts.push(`${hours}h`)
	}

	if (minutes > 0 || hours > 0) {
		parts.push(`${minutes}m`)
	}

	// Always show seconds (unless we have hours/minutes, then show even if 0)
	if (hours === 0 && minutes === 0) {
		parts.push(`${seconds}s`)
	} else {
		parts.push(`${seconds}s`)
	}

	return parts.join(" ")
}

/**
 * Format a timestamp (Unix epoch ms) to ISO date string (YYYY-MM-DD HH:MM)
 */
function formatTimestamp(ms: number): string {
	const date = new Date(ms)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")
	const hour = String(date.getHours()).padStart(2, "0")
	const minute = String(date.getMinutes()).padStart(2, "0")

	return `${year}-${month}-${day} ${hour}:${minute}`
}

/**
 * Format a single session row for the recent sessions list
 */
export function formatSessionRow(session: HitlSession, theme: Theme): string {
	const timestamp = formatTimestamp(session.started_at)
	const status = session.status.toUpperCase()

	let duration = ""
	if (session.ended_at !== null) {
		const durationMs = session.ended_at - session.started_at
		duration = ` (${formatDuration(durationMs)})`
	} else {
		duration = " (active)"
	}

	// Status color coding (use text labels since we don't have specific colors)
	let statusDisplay: string
	if (session.status === "active") {
		statusDisplay = theme.fg("yellow", status)
	} else if (session.status === "closed") {
		statusDisplay = theme.fg("green", status)
	} else {
		statusDisplay = theme.fg("red", status)
	}

	return `  ${timestamp}  ${statusDisplay}${duration}`
}

/**
 * Format a timeline section with a section header.
 * Returns an empty string if there are no timeline segments.
 *
 * @param segments - Array of timeline segments (from most recent session)
 * @param theme - Theme for color/formatting
 * @param width - Chart width in characters (default: 60)
 * @returns Formatted timeline section string, or empty string if no segments
 */
export function formatTimelineSection(
	segments: TimelineSegment[],
	theme: Theme,
	width: number = 60,
): string {
	if (segments.length === 0) {
		return ""
	}

	const lines: string[] = []
	lines.push(theme.bold("Session Timeline"))
	lines.push("")
	lines.push("  " + renderTimeline(segments, theme, width))
	lines.push("")

	return lines.join("\n")
}

/**
 * Build the complete /metrics output as themed text lines
 */
export function formatMetrics(
	stats: HitlStats,
	recentSessions: HitlSession[],
	theme: Theme,
	timelineSection?: string,
): string {
	const lines: string[] = []

	// Header
	lines.push("")
	lines.push(theme.bold("HITL Metrics"))
	lines.push("")

	// Empty state check
	if (stats.total_sessions === 0) {
		lines.push("  No HITL data recorded yet")
		lines.push("")
		return lines.join("\n")
	}

	// Stats section
	lines.push(theme.bold("Statistics"))
	lines.push(`  Total sessions:     ${stats.total_sessions}`)
	lines.push(`  Total HITL time:    ${formatDuration(stats.total_hitl_time_ms)}`)
	lines.push(`  Interactions:       ${stats.interaction_count}`)
	lines.push(`  Avg wait time:      ${formatDuration(stats.avg_wait_ms)}`)
	lines.push("")

	// Recent sessions section
	lines.push(theme.bold("Recent Sessions"))
	if (recentSessions.length === 0) {
		lines.push("  No recent sessions")
	} else {
		// Show up to 10 sessions
		const sessionsToShow = recentSessions.slice(0, 10)
		for (const session of sessionsToShow) {
			lines.push(formatSessionRow(session, theme))
		}
		if (recentSessions.length > 10) {
			lines.push(`  ... and ${recentSessions.length - 10} more`)
		}
	}
	lines.push("")

	// Append timeline section if provided
	if (timelineSection !== undefined && timelineSection !== "") {
		lines.push(timelineSection)
	}

	return lines.join("\n")
}
