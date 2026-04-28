/**
 * Timeline Tests
 *
 * Comprehensive tests for timeline segment computation and ASCII chart rendering.
 */

import { describe, it, expect } from "bun:test"
import { buildTimeline, renderTimeline } from "./timeline.ts"
import type { HitlSession, HitlEvent, TimelineSegment } from "./types.ts"
import type { Theme } from "./formatters.ts"

// Mock theme for testing (no ANSI colors)
const mockTheme: Theme = {
	fg: (_color: string, text: string) => text,
	bg: (_color: string, text: string) => text,
	bold: (text: string) => text,
	dim: (text: string) => text,
	italic: (text: string) => text,
	underline: (text: string) => text,
	strikethrough: (text: string) => text,
}

// Helper to create a session
function createSession(overrides: Partial<HitlSession> = {}): HitlSession {
	return {
		id: "test-session-id",
		project_hash: "abc123",
		started_at: 1000,
		ended_at: 5000,
		status: "closed",
		...overrides,
	}
}

// Helper to create an event
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

describe("buildTimeline", () => {
	it("returns single solo segment when no events", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const segments = buildTimeline(session, [])

		expect(segments).toHaveLength(1)
		expect(segments[0]).toEqual({
			type: "solo",
			startMs: 1000,
			endMs: 5000,
			durationMs: 4000,
		})
	})

	it("builds correct segments for single event", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const event = createEvent({ created_at: 2000, duration_ms: 1000 })
		const segments = buildTimeline(session, [event])

		expect(segments).toHaveLength(3)
		expect(segments[0]).toEqual({
			type: "solo",
			startMs: 1000,
			endMs: 2000,
			durationMs: 1000,
		})
		expect(segments[1]).toEqual({
			type: "hitl",
			startMs: 2000,
			endMs: 3000,
			durationMs: 1000,
		})
		expect(segments[2]).toEqual({
			type: "solo",
			startMs: 3000,
			endMs: 5000,
			durationMs: 2000,
		})
	})

	it("builds correct segments for multiple events", () => {
		const session = createSession({ started_at: 0, ended_at: 10000 })
		const events: HitlEvent[] = [
			createEvent({ id: 1, created_at: 2000, duration_ms: 1000 }),
			createEvent({ id: 2, created_at: 5000, duration_ms: 500 }),
			createEvent({ id: 3, created_at: 8000, duration_ms: 1000 }),
		]
		const segments = buildTimeline(session, events)

		expect(segments).toHaveLength(7)

		expect(segments[0].type).toBe("solo")
		expect(segments[1].type).toBe("hitl")
		expect(segments[2].type).toBe("solo")
		expect(segments[3].type).toBe("hitl")
		expect(segments[4].type).toBe("solo")
		expect(segments[5].type).toBe("hitl")
		expect(segments[6].type).toBe("solo")

		expect(segments[0].startMs).toBe(0)
		expect(segments[6].endMs).toBe(10000)
	})

	it("uses Date.now() as end for active session (null ended_at)", () => {
		const beforeNow = Date.now() - 100
		const session = createSession({ started_at: beforeNow, ended_at: null })
		const segments = buildTimeline(session, [])

		expect(segments).toHaveLength(1)
		expect(segments[0].startMs).toBe(beforeNow)
		expect(segments[0].endMs).toBeGreaterThan(beforeNow + 50)
		expect(segments[0].endMs).toBeLessThanOrEqual(Date.now())
	})

	it("handles back-to-back events (no solo gap between)", () => {
		const session = createSession({ started_at: 0, ended_at: 5000 })
		const events: HitlEvent[] = [
			createEvent({ id: 1, created_at: 1000, duration_ms: 1000 }),
			createEvent({ id: 2, created_at: 2000, duration_ms: 1000 }),
		]
		const segments = buildTimeline(session, events)

		expect(segments).toHaveLength(4)
		expect(segments[0].type).toBe("solo")
		expect(segments[0].endMs).toBe(1000)
		expect(segments[1].type).toBe("hitl")
		expect(segments[1].endMs).toBe(2000)
		expect(segments[2].type).toBe("hitl")
		expect(segments[2].endMs).toBe(3000)
		expect(segments[3].type).toBe("solo")
	})

	it("handles event at exact session start", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const event = createEvent({ created_at: 1000, duration_ms: 1000 })
		const segments = buildTimeline(session, [event])

		expect(segments).toHaveLength(2)
		expect(segments[0].type).toBe("hitl")
		expect(segments[0].startMs).toBe(1000)
		expect(segments[1].type).toBe("solo")
	})

	it("handles event at exact session end", () => {
		const session = createSession({ started_at: 1000, ended_at: 3000 })
		const event = createEvent({ created_at: 2000, duration_ms: 1000 })
		const segments = buildTimeline(session, [event])

		expect(segments).toHaveLength(2)
		expect(segments[0].type).toBe("solo")
		expect(segments[1].type).toBe("hitl")
		expect(segments[1].endMs).toBe(3000)
	})

	it("handles zero-duration event", () => {
		const session = createSession({ started_at: 1000, ended_at: 5000 })
		const event = createEvent({ created_at: 2000, duration_ms: 0 })
		const segments = buildTimeline(session, [event])

		expect(segments).toHaveLength(3)
		expect(segments[1].durationMs).toBe(0)
	})
})

describe("renderTimeline", () => {
	it("returns placeholder for empty segments", () => {
		const result = renderTimeline([], mockTheme)
		expect(result).toBe("  No timeline data")
	})

	it("renders single solo segment", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 60000, durationMs: 60000 },
		]
		const result = renderTimeline(segments, mockTheme, 10)

		const lines = result.split("\n")
		expect(lines[0]).toBe("██████████") // All solo chars
		expect(lines[1]).toContain("solo")
	})

	it("renders single hitl segment", () => {
		const segments: TimelineSegment[] = [
			{ type: "hitl", startMs: 0, endMs: 60000, durationMs: 60000 },
		]
		const result = renderTimeline(segments, mockTheme, 10)

		const lines = result.split("\n")
		expect(lines[0]).toBe("▓▓▓▓▓▓▓▓▓▓") // All hitl chars
		expect(lines[1]).toContain("HITL")
	})

	it("renders mixed segments with correct proportions", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 4000, durationMs: 4000 },
			{ type: "hitl", startMs: 4000, endMs: 5000, durationMs: 1000 },
			{ type: "solo", startMs: 5000, endMs: 10000, durationMs: 5000 },
		]
		const result = renderTimeline(segments, mockTheme, 10)

		const lines = result.split("\n")
		const bar = lines[0]
		expect(bar.length).toBe(10)

		const soloCount = (bar.match(/█/g) || []).length
		const hitlCount = (bar.match(/▓/g) || []).length
		expect(soloCount).toBeGreaterThanOrEqual(8)
		expect(hitlCount).toBeGreaterThanOrEqual(1)
	})

	it("shows both solo and HITL in legend", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 60000, durationMs: 60000 },
			{ type: "hitl", startMs: 60000, endMs: 120000, durationMs: 60000 },
		]
		const result = renderTimeline(segments, mockTheme, 20)

		const lines = result.split("\n")
		expect(lines[1]).toContain("█")
		expect(lines[1]).toContain("solo")
		expect(lines[1]).toContain("▓")
		expect(lines[1]).toContain("HITL")
	})

	it("handles very short segments in narrow width", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 100000, durationMs: 100000 },
			{ type: "hitl", startMs: 100000, endMs: 100050, durationMs: 50 },
		]
		// With limited width, dominant segment fills the bar
		const result = renderTimeline(segments, mockTheme, 20)

		const lines = result.split("\n")
		const bar = lines[0]
		expect(bar.length).toBe(20)
		// Legend still shows both segment types
		expect(lines[1]).toContain("solo")
		expect(lines[1]).toContain("HITL")
	})

	it("handles zero duration total", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 1000, endMs: 1000, durationMs: 0 },
		]
		const result = renderTimeline(segments, mockTheme)

		expect(result).toContain("─")
	})

	it("skips zero-duration segments in rendering", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 5000, durationMs: 5000 },
			{ type: "hitl", startMs: 5000, endMs: 5000, durationMs: 0 },
			{ type: "solo", startMs: 5000, endMs: 10000, durationMs: 5000 },
		]
		const result = renderTimeline(segments, mockTheme, 10)

		const lines = result.split("\n")
		const bar = lines[0]
		expect(bar).not.toContain("▓")
	})

	it("uses default width of 60", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 1000, durationMs: 1000 },
		]
		const result = renderTimeline(segments, mockTheme)

		const lines = result.split("\n")
		expect(lines[0].length).toBe(60)
	})
})