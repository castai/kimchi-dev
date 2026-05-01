/**
 * Timeline Tests
 *
 * Comprehensive tests for timeline segment computation and ASCII chart rendering.
 * Updated for three-category timeline: agent, hitl, idle.
 */

import { describe, it, expect } from "vitest"
import { buildTimeline, renderTimeline } from "./timeline.js"
import type { HitlSession, HitlEvent, TimelineSegment, ActivityEvent } from "./types.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"

const mockTheme = createMockTheme()

function createSession(overrides: Partial<HitlSession> = {}): HitlSession {
	return {
		id: "test-session-id",
		project_hash: "abc123",
		started_at: 1000,
		ended_at: 5000,
		status: "closed",
		end_cause: "complete",
		agent_time_ms: 3000,
		hitl_time_ms: 1000,
		idle_time_ms: 1000,
		...overrides,
	}
}

function createEvent(overrides: Partial<HitlEvent> = {}): HitlEvent {
	return {
		id: 1,
		session_id: "test-session-id",
		tool_name: "test_tool",
		question_count: 1,
		duration_ms: 500,
		selected_options: "[]",
		created_at: 2000,
		...overrides,
	}
}

function createActivity(overrides: Partial<ActivityEvent> = {}): ActivityEvent {
	return {
		id: 1,
		session_id: "test-session-id",
		activity_type: "tool_start",
		tool_name: "test_tool",
		duration_ms: null,
		timestamp: 2000,
		...overrides,
	}
}

describe("buildTimeline", () => {
	it("builds from session totals when no events or activities", () => {
		const session = createSession({ agent_time_ms: 3000, hitl_time_ms: 1000, idle_time_ms: 1000 })
		const segments = buildTimeline(session, [])

		// Should have segments based on session totals (agent + hitl + idle = 5000)
		expect(segments.length).toBeGreaterThan(0)
		const totalDuration = segments.reduce((sum, s) => sum + s.durationMs, 0)
		expect(totalDuration).toBe(5000)
	})

	it("builds from HITL events when no activities", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const event = createEvent({ created_at: 2000, duration_ms: 1000 })
		const segments = buildTimeline(session, [event])

		expect(segments.length).toBeGreaterThanOrEqual(2)
		// First segment should be agent time before HITL
		expect(segments[0].type).toBe("agent")
		expect(segments[0].endMs).toBe(2000)

		// HITL segment
		const hitlSegment = segments.find((s) => s.type === "hitl")
		expect(hitlSegment).toBeDefined()
		expect(hitlSegment!.startMs).toBe(2000)
		expect(hitlSegment!.durationMs).toBe(1000)
	})

	it("builds from activity events when available", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const activities: ActivityEvent[] = [
			createActivity({ activity_type: "tool_start", timestamp: 1000 }),
			createActivity({ activity_type: "tool_end", timestamp: 2000, duration_ms: 1000 }),
			createActivity({ activity_type: "idle_start", timestamp: 2000 }),
			createActivity({ activity_type: "idle_end", timestamp: 3500, duration_ms: 1500 }),
			createActivity({ activity_type: "tool_start", timestamp: 3500 }),
			createActivity({ activity_type: "tool_end", timestamp: 5000, duration_ms: 1500 }),
		]

		const segments = buildTimeline(session, [], activities)
		expect(segments.length).toBeGreaterThan(0)

		// Should have agent, idle, and potentially agent segments
		const types = segments.map((s) => s.type)
		expect(types).toContain("agent")
		expect(types).toContain("idle")
	})

	it("merges consecutive segments of same type", () => {
		const session = createSession({ started_at: 0, ended_at: 10000 })
		const activities: ActivityEvent[] = [
			createActivity({ activity_type: "tool_start", timestamp: 0 }),
			createActivity({ activity_type: "tool_end", timestamp: 2000, duration_ms: 2000 }),
			createActivity({ activity_type: "tool_start", timestamp: 2000 }), // immediate next
			createActivity({ activity_type: "tool_end", timestamp: 4000, duration_ms: 2000 }),
		]

		const segments = buildTimeline(session, [], activities)
		// Should merge the two agent segments
		const agentSegments = segments.filter((s) => s.type === "agent")
		expect(agentSegments.length).toBe(1)
		expect(agentSegments[0].durationMs).toBe(4000)
	})

	it("active session: no trailing idle after last tool_end", () => {
		const session = createSession({ started_at: 1000, ended_at: null, status: "active", agent_time_ms: 0, hitl_time_ms: 0, idle_time_ms: 0 })
		const activities: ActivityEvent[] = [
			createActivity({ activity_type: "tool_start", timestamp: 1000 }),
			createActivity({ activity_type: "tool_end", timestamp: 2000, duration_ms: 1000 }),
		]
		const segments = buildTimeline(session, [], activities)
		// Total duration should reflect only the known activity, not extend to Date.now()
		const totalMs = segments.reduce((sum, s) => sum + s.durationMs, 0)
		expect(totalMs).toBeLessThanOrEqual(1000)
		const idleSegments = segments.filter((s) => s.type === "idle")
		expect(idleSegments.length).toBe(0)
	})

	it("active session: trailing idle shown when last activity is idle_start (agent waiting)", () => {
		const before = Date.now()
		const session = createSession({ started_at: before - 5000, ended_at: null, status: "active", agent_time_ms: 0, hitl_time_ms: 0, idle_time_ms: 0 })
		const activities: ActivityEvent[] = [
			createActivity({ activity_type: "user_input", timestamp: before - 5000 }),
			createActivity({ activity_type: "idle_start", timestamp: before - 5000 }),
		]
		const segments = buildTimeline(session, [], activities)
		const idleSegments = segments.filter((s) => s.type === "idle")
		expect(idleSegments.length).toBe(1)
		expect(idleSegments[0].durationMs).toBeGreaterThan(0)
	})

	it("closed session: always fills trailing gap as idle", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000, status: "closed", agent_time_ms: 0, hitl_time_ms: 0, idle_time_ms: 0 })
		const activities: ActivityEvent[] = [
			createActivity({ activity_type: "tool_start", timestamp: 1000 }),
			createActivity({ activity_type: "tool_end", timestamp: 2000, duration_ms: 1000 }),
		]
		const segments = buildTimeline(session, [], activities)
		const end = segments.reduce((max, s) => Math.max(max, s.endMs), 0)
		expect(end).toBe(5000)
	})
})

describe("renderTimeline", () => {
	it("returns placeholder for empty segments", () => {
		const result = renderTimeline([], mockTheme)
		expect(result).toBe("  No timeline data")
	})

	it("renders three-category timeline", () => {
		const segments: TimelineSegment[] = [
			{ type: "agent", startMs: 0, endMs: 4000, durationMs: 4000 },
			{ type: "hitl", startMs: 4000, endMs: 7000, durationMs: 3000 },
			{ type: "idle", startMs: 7000, endMs: 10000, durationMs: 3000 },
		]
		const result = renderTimeline(segments, mockTheme, 30)

		const lines = result.split("\n")
		expect(lines.length).toBe(2) // bar line + legend
		expect(lines[1]).toContain("agent")
		expect(lines[1]).toContain("HITL")
		expect(lines[1]).toContain("idle")
	})

	it("uses correct characters for each category", () => {
		const segments: TimelineSegment[] = [
			{ type: "agent", startMs: 0, endMs: 1000, durationMs: 1000 },
			{ type: "hitl", startMs: 1000, endMs: 2000, durationMs: 1000 },
			{ type: "idle", startMs: 2000, endMs: 3000, durationMs: 1000 },
		]
		const result = renderTimeline(segments, mockTheme, 30)

		const bar = result.split("\n")[0]
		expect(bar).toContain("█") // agent
		expect(bar).toContain("▓") // hitl
		expect(bar).toContain("░") // idle
	})

	it("handles zero duration total", () => {
		const segments: TimelineSegment[] = [{ type: "agent", startMs: 1000, endMs: 1000, durationMs: 0 }]
		const result = renderTimeline(segments, mockTheme)
		expect(result).toContain("─")
	})
})
