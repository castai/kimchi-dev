/**
 * Timeline Chart Renderer
 *
 * Pure functions for building session timelines and rendering ASCII charts.
 * Supports three time categories: agent, hitl, idle.
 */

import type { HitlSession, HitlEvent, ActivityEvent, TimelineSegment } from "./types.js"
import type { Theme } from "@mariozechner/pi-coding-agent"
import { formatDuration } from "./formatters.js"

const DEFAULT_WIDTH = 60

const AGENT_CHAR = "█"
const HITL_CHAR = "▓"
const IDLE_CHAR = "░"

export function buildTimeline(session: HitlSession, events: HitlEvent[], activities?: ActivityEvent[]): TimelineSegment[] {
	const sessionEnd = session.ended_at ?? Date.now()
	if (activities && activities.length > 0) {
		return buildTimelineFromActivities(session.started_at, session.ended_at ?? null, activities)
	}
	return buildTimelineFromEvents(session, events, sessionEnd)
}

function buildTimelineFromActivities(sessionStart: number, sessionEndedAt: number | null, activities: ActivityEvent[]): TimelineSegment[] {
	const segments: TimelineSegment[] = []
	sortActivities(activities)

	let currentTime = sessionStart
	let currentSegment: TimelineSegment | null = null

	for (const activity of activities) {
		const type = activityTypeToSegmentType(activity.activity_type)
		if (!currentSegment || currentSegment.type !== type) {
			if (currentSegment) {
				pushSegment(segments, currentSegment, currentTime)
			}
			currentSegment = createSegment(type, currentTime)
		}
		currentTime = activity.timestamp
	}

	if (currentSegment) {
		pushSegment(segments, currentSegment, currentTime)
	}

	if (sessionEndedAt !== null) {
		// Closed session: fill the remaining gap to session end
		if (currentTime < sessionEndedAt) {
			segments.push({ type: "idle", startMs: currentTime, endMs: sessionEndedAt, durationMs: sessionEndedAt - currentTime })
		}
	} else {
		// Active session: only append trailing idle if we're actively waiting (last activity was idle_start)
		const lastActivity = activities[activities.length - 1]
		if (lastActivity?.activity_type === "idle_start") {
			const now = Date.now()
			if (currentTime < now) {
				segments.push({ type: "idle", startMs: currentTime, endMs: now, durationMs: now - currentTime })
			}
		}
		// Otherwise: agent finished last turn — no trailing segment shown
	}

	return mergeConsecutiveSegments(segments)
}

function sortActivities(activities: ActivityEvent[]): void {
	activities.sort((a, b) => a.timestamp - b.timestamp)
}

function createSegment(type: TimelineSegment["type"], startMs: number): TimelineSegment {
	return { type, startMs, endMs: startMs, durationMs: 0 }
}

function pushSegment(segments: TimelineSegment[], segment: TimelineSegment, endTime: number): void {
	if (endTime > segment.startMs) {
		segment.endMs = endTime
		segment.durationMs = endTime - segment.startMs
		segments.push(segment)
	}
}

function activityTypeToSegmentType(activityType: ActivityEvent["activity_type"]): TimelineSegment["type"] {
	if (activityType === "tool_start" || activityType === "tool_end") return "agent"
	if (activityType === "user_input") return "hitl"
	return "idle"
}

function buildTimelineFromEvents(session: HitlSession, events: HitlEvent[], sessionEnd: number): TimelineSegment[] {
	if (events.length === 0) {
		return buildFromSessionTotals(session, sessionEnd)
	}

	const segments: TimelineSegment[] = []
	let currentTime = session.started_at

	for (const event of events) {
		const eventStart = event.created_at
		if (eventStart > currentTime) {
			segments.push({ type: "agent", startMs: currentTime, endMs: eventStart, durationMs: eventStart - currentTime })
		}
		const eventEnd = eventStart + event.duration_ms
		segments.push({ type: "hitl", startMs: eventStart, endMs: eventEnd, durationMs: event.duration_ms })
		currentTime = eventEnd
	}

	if (currentTime < sessionEnd) {
		const remaining = sessionEnd - currentTime
		segments.push({ type: session.idle_time_ms >= remaining ? "idle" : "agent", startMs: currentTime, endMs: sessionEnd, durationMs: remaining })
	}

	return mergeConsecutiveSegments(segments)
}

function buildFromSessionTotals(session: HitlSession, sessionEnd: number): TimelineSegment[] {
	const segments: TimelineSegment[] = []
	let currentTime = session.started_at

	if (session.agent_time_ms > 0) {
		segments.push({ type: "agent", startMs: currentTime, endMs: currentTime + session.agent_time_ms, durationMs: session.agent_time_ms })
		currentTime += session.agent_time_ms
	}
	if (session.hitl_time_ms > 0) {
		segments.push({ type: "hitl", startMs: currentTime, endMs: currentTime + session.hitl_time_ms, durationMs: session.hitl_time_ms })
		currentTime += session.hitl_time_ms
	}
	if (session.idle_time_ms > 0) {
		const idleStart = sessionEnd - session.idle_time_ms
		segments.push({ type: "idle", startMs: idleStart, endMs: sessionEnd, durationMs: session.idle_time_ms })
	}

	return segments
}

function mergeConsecutiveSegments(segments: TimelineSegment[]): TimelineSegment[] {
	const merged: TimelineSegment[] = []
	for (const segment of segments) {
		if (segment.durationMs <= 0) continue
		const last = merged[merged.length - 1]
		if (last && last.type === segment.type) {
			last.endMs = segment.endMs
			last.durationMs += segment.durationMs
		} else {
			merged.push({ ...segment })
		}
	}
	return merged
}

export function renderTimeline(segments: TimelineSegment[], theme: Theme, width: number = DEFAULT_WIDTH): string {
	if (segments.length === 0) return "  No timeline data"

	const { totalAgentMs, totalHitlMs, totalIdleMs } = calculateTotals(segments)

	const totalDurationMs = segments.reduce((max, s) => Math.max(max, s.endMs), 0) - segments[0].startMs
	if (totalDurationMs <= 0 || segments.every((s) => s.durationMs <= 0)) {
		return "  ─".repeat(Math.floor(width / 2))
	}

	const barLine = buildBar(segments, totalDurationMs, width)
	const coloredBar = applyColors(barLine, theme)
	const legend = buildLegend(totalAgentMs, totalHitlMs, totalIdleMs, theme)

	return `${coloredBar}\n${legend}`
}

function calculateTotals(segments: TimelineSegment[]) {
	let totalAgentMs = 0, totalHitlMs = 0, totalIdleMs = 0, totalDurationMs = 0
	for (const s of segments) {
		totalDurationMs += s.durationMs
		if (s.type === "agent") totalAgentMs += s.durationMs
		else if (s.type === "hitl") totalHitlMs += s.durationMs
		else totalIdleMs += s.durationMs
	}
	return { totalAgentMs, totalHitlMs, totalIdleMs, totalDurationMs }
}

function buildBar(segments: TimelineSegment[], totalDurationMs: number, width: number): string {
	const barChars: string[] = []
	for (const segment of segments) {
		if (segment.durationMs <= 0) continue
		const count = Math.min(Math.max(1, Math.round((segment.durationMs / totalDurationMs) * width)), width - barChars.length)
		if (count <= 0) break
		const char = segment.type === "agent" ? AGENT_CHAR : segment.type === "hitl" ? HITL_CHAR : IDLE_CHAR
		barChars.push(...Array(count).fill(char))
	}
	while (barChars.length < width) barChars.push(IDLE_CHAR)
	return barChars.slice(0, width).join("")
}

function applyColors(barLine: string, theme: Theme): string {
	let colored = ""
	for (const char of barLine) {
		if (char === AGENT_CHAR) colored += theme.fg("success", char)
		else if (char === HITL_CHAR) colored += theme.fg("warning", char)
		else colored += theme.fg("muted", char)
	}
	return colored
}

function buildLegend(agentMs: number, hitlMs: number, idleMs: number, theme: Theme): string {
	const agent = theme.fg("success", AGENT_CHAR) + " agent " + formatDuration(agentMs)
	const hitl = theme.fg("warning", HITL_CHAR) + " HITL " + formatDuration(hitlMs)
	const idle = theme.fg("muted", IDLE_CHAR) + " idle " + formatDuration(idleMs)
	return `  ${agent}  ${hitl}  ${idle}`
}
