/**
 * HITL Metrics Formatters Unit Tests
 */

import { describe, it, expect } from "vitest"
import { formatDuration, formatMetrics, formatSessionRow, formatTimelineSection } from "./formatters.js"
import type { HitlStats, HitlSession, TimelineSegment } from "./types.js"
import type { Theme } from "@mariozechner/pi-coding-agent"

/**
 * Minimal mock theme that returns plain strings (no ANSI codes)
 * — suitable for deterministic unit tests
 */
function createMockTheme(): Theme {
	const noOp = (text: string) => text
	return {
		name: "mock",
		fg: (_c, text) => text,
		bg: (_c, text) => text,
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

describe("formatDuration", () => {
	it("formats 0ms as 0s", () => {
		expect(formatDuration(0)).toBe("0s")
	})

	it("formats 5000ms as 5s", () => {
		expect(formatDuration(5000)).toBe("5s")
	})

	it("formats 65000ms as 1m 5s", () => {
		expect(formatDuration(65000)).toBe("1m 5s")
	})

	it("formats 3661000ms as 1h 1m 1s", () => {
		expect(formatDuration(3661000)).toBe("1h 1m 1s")
	})

	it("formats 7200000ms as 2h 0m 0s", () => {
		expect(formatDuration(7200000)).toBe("2h 0m 0s")
	})

	it("handles negative input by clamping to 0", () => {
		expect(formatDuration(-100)).toBe("0s")
	})

	it("rounds seconds correctly", () => {
		expect(formatDuration(1499)).toBe("1s") // rounds to 1s
		expect(formatDuration(1500)).toBe("2s") // rounds to 2s
	})

	it("handles minutes without hours", () => {
		expect(formatDuration(90000)).toBe("1m 30s")
		expect(formatDuration(3599000)).toBe("59m 59s")
	})

	it("handles hours with minutes and seconds", () => {
		expect(formatDuration(7322000)).toBe("2h 2m 2s")
	})
})

describe("formatMetrics", () => {
	const mockTheme = createMockTheme()

	it("renders header and empty state for zero stats", () => {
		const stats: HitlStats = {
			total_sessions: 0,
			total_hitl_time_ms: 0,
			interaction_count: 0,
			avg_wait_ms: 0,
		}
		const output = formatMetrics(stats, [], mockTheme)

		expect(output).toContain("HITL Metrics")
		expect(output).toContain("No HITL data recorded yet")
		expect(output).not.toContain("Statistics")
	})

	it("renders all four stat fields with labels", () => {
		const stats: HitlStats = {
			total_sessions: 42,
			total_hitl_time_ms: 3661000,
			interaction_count: 150,
			avg_wait_ms: 24000,
		}
		const output = formatMetrics(stats, [], mockTheme)

		expect(output).toContain("Total sessions:")
		expect(output).toContain("42")
		expect(output).toContain("Total HITL time:")
		expect(output).toContain("1h 1m 1s")
		expect(output).toContain("Interactions:")
		expect(output).toContain("150")
		expect(output).toContain("Avg wait time:")
		expect(output).toContain("24s")
	})

	it("renders statistics header before stats", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 0,
			interaction_count: 1,
			avg_wait_ms: 0,
		}
		const output = formatMetrics(stats, [], mockTheme)

		expect(output).toContain("Statistics")
		expect(output.indexOf("Statistics")).toBeLessThan(output.indexOf("Total sessions:"))
	})

	it("shows recent sessions section with timestamps", () => {
		const stats: HitlStats = {
			total_sessions: 2,
			total_hitl_time_ms: 0,
			interaction_count: 2,
			avg_wait_ms: 0,
		}
		const sessions: HitlSession[] = [
			{
				id: "sess-1",
				project_hash: "abc123",
				started_at: 1714233600000, // 2024-04-27 12:00
				ended_at: 1714237200000, // 2024-04-27 13:00
				status: "closed",
			},
		]
		const output = formatMetrics(stats, sessions, mockTheme)

		expect(output).toContain("Recent Sessions")
		expect(output).toContain("2024-04-27")
		expect(output).toMatch(/CLOSED|closed/i)
	})

	it("shows message when no recent sessions", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 0,
			interaction_count: 1,
			avg_wait_ms: 0,
		}
		const output = formatMetrics(stats, [], mockTheme)

		expect(output).toContain("Recent Sessions")
		expect(output).toContain("No recent sessions")
	})

	it("limits recent sessions to 10 with ellipsis", () => {
		const stats: HitlStats = {
			total_sessions: 15,
			total_hitl_time_ms: 0,
			interaction_count: 15,
			avg_wait_ms: 0,
		}
		const sessions: HitlSession[] = Array.from({ length: 15 }, (_, i) => ({
			id: `sess-${i}`,
			project_hash: "abc123",
			started_at: 1714233600000 + i * 1000,
			ended_at: null,
			status: "active" as const,
		}))

		const output = formatMetrics(stats, sessions, mockTheme)

		// Should have "... and 5 more" or similar ellipsis
		expect(output).toMatch(/\.{3,}|and \d+ more/)
	})

	it("handles sessions as first argument in slice form", () => {
		// Verify the function signature matches expected form
		const stats: HitlStats = { total_sessions: 1, total_hitl_time_ms: 0, interaction_count: 1, avg_wait_ms: 0 }
		const output = formatMetrics(stats, [], mockTheme)
		expect(output).toBeTruthy()
	})
})

describe("formatSessionRow", () => {
	const mockTheme = createMockTheme()

	it("formats active session with timestamp and status", () => {
		const session: HitlSession = {
			id: "sess-1",
			project_hash: "abc123",
			started_at: 1714233600000,
			ended_at: null,
			status: "active",
		}
		const output = formatSessionRow(session, mockTheme)

		expect(output).toContain("2024-04-27")
		expect(output).toContain("ACTIVE")
		expect(output).toContain("(active)")
	})

	it("formats closed session with duration", () => {
		const session: HitlSession = {
			id: "sess-2",
			project_hash: "def456",
			started_at: 1714233600000,
			ended_at: 1714237200000, // 1 hour later
			status: "closed",
		}
		const output = formatSessionRow(session, mockTheme)

		expect(output).toContain("CLOSED")
		expect(output).toContain("(1h 0m 0s)")
	})

	it("formats orphaned session with duration", () => {
		const session: HitlSession = {
			id: "sess-3",
			project_hash: "ghi789",
			started_at: 1714233600000,
			ended_at: 1714237260000,
			status: "orphaned",
		}
		const output = formatSessionRow(session, mockTheme)

		expect(output).toContain("ORPHANED")
		expect(output).toMatch(/\(\d+h \d+m \d+s\)/)
	})
})

describe("formatTimelineSection", () => {
	const mockTheme = createMockTheme()

	it("returns empty string for empty segments", () => {
		const output = formatTimelineSection([], mockTheme)
		expect(output).toBe("")
	})

	it("returns formatted section with header and chart for segments", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 5000, durationMs: 5000 },
			{ type: "hitl", startMs: 5000, endMs: 8000, durationMs: 3000 },
		]
		const output = formatTimelineSection(segments, mockTheme)

		expect(output).toContain("Session Timeline")
		expect(output).toContain("solo")
		expect(output).toContain("HITL")
	})

	it("respects custom width parameter", () => {
		const segments: TimelineSegment[] = [
			{ type: "solo", startMs: 0, endMs: 1000, durationMs: 1000 },
		]
		const output = formatTimelineSection(segments, mockTheme, 30)

		expect(output).toContain("Session Timeline")
		// The bar should be present with visual characters
		expect(output).toContain("█")
	})
})

describe("formatMetrics with timeline", () => {
	const mockTheme = createMockTheme()

	it("includes timeline section when provided", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 1000,
			interaction_count: 1,
			avg_wait_ms: 1000,
		}
		const sessions: HitlSession[] = []
		const timeline = "Session Timeline\n\n  [timeline chart]"

		const output = formatMetrics(stats, sessions, mockTheme, timeline)

		expect(output).toContain("Session Timeline")
		expect(output).toContain("[timeline chart]")
	})

	it("omits timeline section when empty string", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 1000,
			interaction_count: 1,
			avg_wait_ms: 1000,
		}
		const sessions: HitlSession[] = []

		const output = formatMetrics(stats, sessions, mockTheme, "")

		expect(output).not.toContain("Session Timeline")
	})

	it("omits timeline section when undefined", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 1000,
			interaction_count: 1,
			avg_wait_ms: 1000,
		}
		const sessions: HitlSession[] = []

		const output = formatMetrics(stats, sessions, mockTheme)

		expect(output).not.toContain("Session Timeline")
	})
})
