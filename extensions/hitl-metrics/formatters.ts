/**
 * HITL Metrics Formatters
 *
 * Pure formatting utilities for displaying HITL metrics in the TUI.
 * Updated to support three-category time tracking and end causes.
 */

import type { HitlStats, HitlSession, TimelineSegment } from "./types.js"
import { renderTimeline } from "./timeline.js"
import type { Theme } from "@mariozechner/pi-coding-agent"

export function formatDuration(ms: number): string {
	if (ms < 0) ms = 0
	if (ms === 0) return "0s"
	const totalSeconds = Math.round(ms / 1000)
	const hours = Math.floor(totalSeconds / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60
	const parts: string[] = []
	if (hours > 0) parts.push(`${hours}h`)
	if (minutes > 0 || hours > 0) parts.push(`${minutes}m`)
	parts.push(`${seconds}s`)
	return parts.join(" ")
}

function formatTimestamp(ms: number): string {
	const d = new Date(ms)
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function formatEndCause(cause: string | null | undefined): string {
	if (!cause) return ""
	const icons: Record<string, string> = {
		complete: "✓",
		disconnect: "⚠",
		signal: "✗",
		orphaned: "?",
	}
	return icons[cause] || "?"
}

function getCauseColor(cause: string | null | undefined): "success" | "error" | "warning" | "muted" {
	if (cause === "complete") return "success"
	if (cause === "disconnect" || cause === "signal" || cause === "orphaned") return "error"
	return "muted"
}

export function formatSessionRow(session: HitlSession, theme: Theme): string {
	const timestamp = formatTimestamp(session.started_at)
	const duration = session.ended_at ? formatDuration(session.ended_at - session.started_at) : "active"
	const causeIcon = session.end_cause ? formatEndCause(session.end_cause) : ""
	const causeColor = getCauseColor(session.end_cause)

	let statusDisplay: string
	if (session.status === "active") statusDisplay = theme.fg("warning", "ACTIVE")
	else if (session.status === "closed") statusDisplay = theme.fg("success", "CLOSED")
	else statusDisplay = theme.fg("error", "ORPHANED")

	const causeDisplay = causeIcon ? ` ${theme.fg(causeColor, causeIcon)}` : ""

	return `  ${timestamp}  ${statusDisplay}${causeDisplay}  (${duration})`
}

export function formatTimelineSection(segments: TimelineSegment[], theme: Theme, width = 60): string {
	if (segments.length === 0) return ""
	return [theme.bold("Session Timeline"), "", "  " + renderTimeline(segments, theme, width), ""].join("\n")
}

export function formatMetrics(
	stats: HitlStats,
	recentSessions: HitlSession[],
	theme: Theme,
	timelineSection?: string,
): string {
	const lines: string[] = ["", theme.bold("HITL Metrics"), ""]

	if (stats.total_sessions === 0) {
		lines.push("  No HITL data recorded yet", "")
		return lines.join("\n")
	}

	// Calculate totals from sessions
	let totalAgentMs = 0
	let totalHitlMs = 0
	let totalIdleMs = 0

	for (const session of recentSessions) {
		totalAgentMs += session.agent_time_ms || 0
		totalHitlMs += session.hitl_time_ms || 0
		totalIdleMs += session.idle_time_ms || 0
	}

	// Add session-level aggregation for backward compatibility
	lines.push(theme.bold("Time Breakdown"))
	lines.push(`  Agent time: ${formatDuration(totalAgentMs)}`)
	lines.push(`  HITL time:  ${formatDuration(totalHitlMs)}`)
	lines.push(`  Idle time:  ${formatDuration(totalIdleMs)}`)
	lines.push("")

	lines.push(theme.bold("Statistics"))
	lines.push(`  Total sessions:     ${stats.total_sessions}`)
	lines.push(`  Total HITL time:    ${formatDuration(stats.total_hitl_time_ms)}`)
	lines.push(`  Interactions:       ${stats.interaction_count}`)
	lines.push(`  Avg wait time:      ${formatDuration(stats.avg_wait_ms)}`)
	lines.push("")
	
	// Permission stats
	if (stats.permission_count > 0) {
		lines.push(theme.bold("Permission Events"))
		lines.push(`  Permission prompts: ${stats.permission_count}`)
		lines.push(`  Permission time:    ${formatDuration(stats.total_permission_time_ms)}`)
		lines.push("")
	}

	// Count end causes
	const endCauses = { complete: 0, disconnect: 0, signal: 0, orphaned: 0 }
	for (const s of recentSessions) {
		if (s.end_cause) endCauses[s.end_cause]++
	}
	const completed = endCauses.complete
	const interrupted = endCauses.disconnect + endCauses.signal + endCauses.orphaned

	if (completed > 0 || interrupted > 0) {
		lines.push(theme.bold("Session Outcomes"))
		lines.push(`  Complete: ${completed}`)
		lines.push(`  Interrupted: ${interrupted}`)
		lines.push("")
	}

	lines.push(theme.bold("Recent Sessions"))
	if (recentSessions.length === 0) {
		lines.push("  No recent sessions")
	} else {
		for (const session of recentSessions.slice(0, 10)) {
			lines.push(formatSessionRow(session, theme))
		}
		if (recentSessions.length > 10) {
			lines.push(`  ... and ${recentSessions.length - 10} more`)
		}
	}
	lines.push("")

	if (timelineSection) {
		lines.push(timelineSection)
	}

	return lines.join("\n")
}
