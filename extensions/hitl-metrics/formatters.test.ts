/**
 * HITL Metrics Formatters Unit Tests
 */

import { describe, it, expect } from "vitest"
import { formatDuration, formatMetrics, formatSessionRow, formatTimelineSection } from "./formatters.js"
import type { HitlStats, HitlSession, TimelineSegment } from "./types.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"

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

	it("handles negative input by clamping to 0", () => {
		expect(formatDuration(-100)).toBe("0s")
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
			permission_count: 0,
			total_permission_time_ms: 0,
		}
		const output = formatMetrics(stats, [], mockTheme)
		expect(output).toContain("HITL Metrics")
		expect(output).toContain("No HITL data recorded yet")
	})

	it("renders stat fields with labels", () => {
		const stats: HitlStats = {
			total_sessions: 42,
			total_hitl_time_ms: 3661000,
			interaction_count: 150,
			avg_wait_ms: 24000,
			permission_count: 10,
			total_permission_time_ms: 50000,
		}
		const output = formatMetrics(stats, [], mockTheme)
		expect(output).toContain("42")
		expect(output).toContain("150")
	})

	it("renders permission stats when present", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 60000,
			interaction_count: 5,
			avg_wait_ms: 12000,
			permission_count: 10,
			total_permission_time_ms: 50000,
		}
		const output = formatMetrics(stats, [], mockTheme)
		expect(output).toContain("Permission Events")
		expect(output).toContain("Permission prompts: 10")
		expect(output).toContain("Permission time:")
	})

	it("does not render permission section when count is zero", () => {
		const stats: HitlStats = {
			total_sessions: 1,
			total_hitl_time_ms: 60000,
			interaction_count: 5,
			avg_wait_ms: 12000,
			permission_count: 0,
			total_permission_time_ms: 0,
		}
		const output = formatMetrics(stats, [], mockTheme)
		expect(output).not.toContain("Permission Events")
	})
})

describe("formatSessionRow", () => {
	const mockTheme = createMockTheme()

	function createSession(overrides: Partial<HitlSession> = {}): HitlSession {
		return {
			id: "sess-1",
			project_hash: "abc123",
			started_at: 1714233600000,
			ended_at: null,
			status: "active",
			end_cause: null,
			agent_time_ms: 0,
			hitl_time_ms: 0,
			idle_time_ms: 0,
			...overrides,
		}
	}

	it("formats active session", () => {
		const session = createSession()
		const output = formatSessionRow(session, mockTheme)
		expect(output).toContain("ACTIVE")
	})

	it("formats closed session", () => {
		const session = createSession({
			status: "closed",
			ended_at: 1714237200000,
			end_cause: "complete",
		})
		const output = formatSessionRow(session, mockTheme)
		expect(output).toContain("CLOSED")
		expect(output).toContain("✓")
	})

	it("formats interrupted session", () => {
		const session = createSession({
			status: "closed",
			ended_at: 1714237200000,
			end_cause: "signal",
		})
		const output = formatSessionRow(session, mockTheme)
		expect(output).toContain("✗")
	})

	it("formats orphaned session", () => {
		const session = createSession({
			status: "orphaned",
			ended_at: 1714237200000,
			end_cause: "orphaned",
		})
		const output = formatSessionRow(session, mockTheme)
		expect(output).toContain("ORPHANED")
	})
})

describe("formatTimelineSection", () => {
	const mockTheme = createMockTheme()

	it("returns empty string for empty segments", () => {
		const output = formatTimelineSection([], mockTheme)
		expect(output).toBe("")
	})

	it("returns formatted section with three categories", () => {
		const segments: TimelineSegment[] = [
			{ type: "agent", startMs: 0, endMs: 5000, durationMs: 5000 },
			{ type: "hitl", startMs: 5000, endMs: 8000, durationMs: 3000 },
			{ type: "idle", startMs: 8000, endMs: 10000, durationMs: 2000 },
		]
		const output = formatTimelineSection(segments, mockTheme)
		expect(output).toContain("Session Timeline")
		expect(output).toContain("agent")
		expect(output).toContain("HITL")
		expect(output).toContain("idle")
	})
})
