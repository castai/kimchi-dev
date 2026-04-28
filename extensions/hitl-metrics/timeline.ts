/**
 * Timeline Chart Renderer
 *
 * Pure functions for building session timelines and rendering ASCII charts.
 * No side effects — completely testable.
 */

import type { HitlSession, HitlEvent, TimelineSegment } from "./types.ts"
import type { Theme } from "./formatters.ts"
import { formatDuration } from "./formatters.ts"

/** Default chart width in characters */
const DEFAULT_WIDTH = 60

/** Character for solo time segments (agent-only) */
const SOLO_CHAR = "█"

/** Character for HITL time segments (human-in-the-loop) */
const HITL_CHAR = "▓"

/**
 * Build timeline segments from session and events.
 *
 * Timeline structure:
 * 1. Solo from session start → first event created_at
 * 2. HITL from first event created_at → created_at + duration_ms
 * 3. Solo from end of HITL → next event created_at
 * 4. ... repeat for all events ...
 * 5. Solo from end of last HITL → session end (or now if active)
 *
 * @param session - The HITL session with start/end times
 * @param events - Array of HITL events ordered by created_at
 * @returns Array of timeline segments
 */
export function buildTimeline(
	session: HitlSession,
	events: HitlEvent[],
): TimelineSegment[] {
	const segments: TimelineSegment[] = []
	const sessionStart = session.started_at
	const sessionEnd = session.ended_at ?? Date.now()

	// No events → single solo segment spanning the session
	if (events.length === 0) {
		return [
			{
				type: "solo",
				startMs: sessionStart,
				endMs: sessionEnd,
				durationMs: sessionEnd - sessionStart,
			},
		]
	}

	let currentTime = sessionStart

	for (const event of events) {
		const eventStart = event.created_at
		const eventEnd = event.created_at + event.duration_ms

		// Solo segment before this event (if there's a gap)
		if (eventStart > currentTime) {
			segments.push({
				type: "solo",
				startMs: currentTime,
				endMs: eventStart,
				durationMs: eventStart - currentTime,
			})
		}

		// HITL segment for this event
		segments.push({
			type: "hitl",
			startMs: eventStart,
			endMs: eventEnd,
			durationMs: event.duration_ms,
		})

		currentTime = eventEnd
	}

	// Final solo segment after last event (if session continues)
	if (currentTime < sessionEnd) {
		segments.push({
			type: "solo",
			startMs: currentTime,
			endMs: sessionEnd,
			durationMs: sessionEnd - currentTime,
		})
	}

	return segments
}

/**
 * Render timeline segments as an ASCII bar chart.
 *
 * @param segments - Array of timeline segments
 * @param theme - Theme for color formatting
 * @param width - Chart width in characters (default: 60)
 * @returns Multi-line string with bar and legend
 */
export function renderTimeline(
	segments: TimelineSegment[],
	theme: Theme,
	width: number = DEFAULT_WIDTH,
): string {
	if (segments.length === 0) {
		return "  No timeline data"
	}

	// Calculate totals
	let totalSoloMs = 0
	let totalHitlMs = 0
	let totalDurationMs = 0

	for (const segment of segments) {
		totalDurationMs += segment.durationMs
		if (segment.type === "solo") {
			totalSoloMs += segment.durationMs
		} else {
			totalHitlMs += segment.durationMs
		}
	}

	// Handle zero duration edge case
	if (totalDurationMs === 0) {
		return "  ─".repeat(Math.floor(width / 2))
	}

	// Build the bar
	const barChars: string[] = []
	let soloChars = 0
	let hitlChars = 0

	for (const segment of segments) {
		// Skip zero-duration segments
		if (segment.durationMs <= 0) continue

		// Calculate proportional width (minimum 1 char for any non-zero segment)
		const proportion = segment.durationMs / totalDurationMs
		let charCount = Math.max(1, Math.round(proportion * width))

		// Don't exceed remaining width
		const remainingWidth = width - barChars.length
		if (charCount > remainingWidth) {
			charCount = remainingWidth
		}
		if (charCount <= 0) break

		const char = segment.type === "solo" ? SOLO_CHAR : HITL_CHAR
		for (let i = 0; i < charCount; i++) {
			barChars.push(char)
		}

		if (segment.type === "solo") {
			soloChars += charCount
		} else {
			hitlChars += charCount
		}
	}

	// Pad or trim to exact width
	while (barChars.length < width) {
		barChars.push(SOLO_CHAR)
	}
	const barLine = barChars.slice(0, width).join("")

	// Color the bar
	let coloredBar = ""
	for (const char of barLine) {
		if (char === SOLO_CHAR) {
			coloredBar += theme.fg("cyan", char)
		} else {
			coloredBar += theme.fg("yellow", char)
		}
	}

	// Build legend
	const soloLegend = theme.fg("cyan", SOLO_CHAR) + " solo " + formatDuration(totalSoloMs)
	const hitlLegend = theme.fg("yellow", HITL_CHAR) + " HITL " + formatDuration(totalHitlMs)
	const legendLine = `  ${soloLegend}    ${hitlLegend}`

	return `${coloredBar}\n${legendLine}`
}
