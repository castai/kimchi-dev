/**
 * HITL Session Management Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { HitlDatabase } from "./db.js"
import {
	getOrCreateSession,
	closeSession,
	closeOrphanSessions,
	getRecentSessions,
	getSessionStats,
} from "./session.js"

describe("Session Management", () => {
	let db: HitlDatabase

	beforeEach(() => {
		db = new HitlDatabase(":memory:")
		db.open()
		db.initSchema()
	})

	afterEach(() => {
		db.close()
	})

	describe("getOrCreateSession", () => {
		it("creates a new session when none exists", () => {
			const session = getOrCreateSession(db, "project-abc-123")

			expect(session).not.toBeNull()
			expect(session?.project_hash).toBe("project-abc-123")
			expect(session?.status).toBe("active")
			expect(session?.ended_at).toBeNull()
			expect(session?.started_at).toBeGreaterThan(0)
			expect(typeof session?.id).toBe("string")
		})

		it("returns existing active session within 5-minute window", () => {
			const first = getOrCreateSession(db, "project-abc-123")
			const second = getOrCreateSession(db, "project-abc-123")

			expect(first).not.toBeNull()
			expect(second).not.toBeNull()
			expect(second?.id).toBe(first?.id)
		})

		it("creates new session when old session was closed", () => {
			const first = getOrCreateSession(db, "project-abc-123")
			closeSession(db, first!.id)

			const second = getOrCreateSession(db, "project-abc-123")

			expect(second).not.toBeNull()
			expect(second?.id).not.toBe(first?.id)
		})

		it("creates new session when old session exceeded 5-min timeout", () => {
			const oldTime = Date.now() - 6 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["old-session-id", "project-abc-123", oldTime, "active"],
			)

			const session = getOrCreateSession(db, "project-abc-123")

			expect(session).not.toBeNull()
			expect(session?.id).not.toBe("old-session-id")
			expect(session?.status).toBe("active")
		})

		it("isolates sessions by project hash", () => {
			const sessionA = getOrCreateSession(db, "project-a")
			const sessionB = getOrCreateSession(db, "project-b")

			expect(sessionA?.id).not.toBe(sessionB?.id)
			expect(sessionA?.project_hash).toBe("project-a")
			expect(sessionB?.project_hash).toBe("project-b")
		})

		it("returns null on database closure", () => {
			db.close()
			const session = getOrCreateSession(db, "project-abc-123")
			expect(session).toBeNull()
		})
	})

	describe("closeSession", () => {
		it("marks session as closed with ended_at", () => {
			const session = getOrCreateSession(db, "project-x")
			const closed = closeSession(db, session!.id)

			expect(closed).toBe(true)

			const queryResult = db.query<{ status: string; ended_at: number }>(
				"SELECT status, ended_at FROM hitl_sessions WHERE id = ?",
				[session!.id],
			)
			expect(queryResult[0].status).toBe("closed")
			expect(queryResult[0].ended_at).toBeGreaterThan(0)
		})

		it("returns false for non-existent session", () => {
			const result = closeSession(db, "non-existent-id")
			expect(result).toBe(false)
		})

		it("is non-fatal (returns false) after database closure", () => {
			const session = getOrCreateSession(db, "project-x")
			db.close()
			const closed = closeSession(db, session!.id)
			expect(closed).toBe(false)
		})
	})

	describe("closeOrphanSessions", () => {
		it("closes sessions older than threshold", () => {
			const oldTime = Date.now() - 10 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan-1", "project-abc-123", oldTime, "active"],
			)

			const count = closeOrphanSessions(db, 5 * 60 * 1000)

			expect(count).toBe(1)

			const status = db.query<{ status: string }>(
				"SELECT status FROM hitl_sessions WHERE id = ?",
				["orphan-1"],
			)
			expect(status[0].status).toBe("orphaned")
		})

		it("does not close sessions within threshold", () => {
			const recentTime = Date.now() - 2 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["active-session", "project-abc-123", recentTime, "active"],
			)

			const count = closeOrphanSessions(db, 5 * 60 * 1000)

			expect(count).toBe(0)

			const status = db.query<{ status: string }>(
				"SELECT status FROM hitl_sessions WHERE id = ?",
				["active-session"],
			)
			expect(status[0].status).toBe("active")
		})

		it("only targets active sessions", () => {
			const oldTime = Date.now() - 10 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status, ended_at) VALUES (?, ?, ?, ?, ?)",
				["already-closed", "project-abc-123", oldTime, "closed", oldTime + 1000],
			)

			const count = closeOrphanSessions(db, 5 * 60 * 1000)
			expect(count).toBe(0)
		})

		it("closes multiple orphan sessions at once", () => {
			const oldTime = Date.now() - 60 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan-a", "project-a", oldTime, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan-b", "project-b", oldTime, "active"],
			)

			const count = closeOrphanSessions(db, 5 * 60 * 1000)

			expect(count).toBe(2)
		})

		it("logs warning when orphans are found", () => {
			const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
			const oldTime = Date.now() - 10 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan", "project-x", oldTime, "active"],
			)

			closeOrphanSessions(db, 5 * 60 * 1000)

			expect(consoleSpy).toHaveBeenCalledWith("[HITL] Closed 1 orphan session(s)")
			consoleSpy.mockRestore()
		})

		it("uses default threshold of 5 minutes", () => {
			const sixMinsAgo = Date.now() - 6 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan-default", "project-x", sixMinsAgo, "active"],
			)

			const count = closeOrphanSessions(db)
			expect(count).toBe(1)
		})

		it("is non-fatal (returns 0) after database closure", () => {
			db.close()
			const count = closeOrphanSessions(db)
			expect(count).toBe(0)
		})
	})

	describe("getRecentSessions", () => {
		it("returns sessions in descending order", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-oldest", "project-x", 1000, "closed"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-middle", "project-x", 2000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-newest", "project-x", 3000, "closed"],
			)

			const sessions = getRecentSessions(db, "project-x")

			expect(sessions).toHaveLength(3
)
			expect(sessions[0].id).toBe("session-newest")
			expect(sessions[1].id).toBe("session-middle")
			expect(sessions[2].id).toBe("session-oldest")
		})

		it("returns empty array when no sessions exist", () => {
			const sessions = getRecentSessions(db, "nonexistent-project")
			expect(sessions).toEqual([])
		})

		it("respects limit parameter", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "project-x", 1000, "closed"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-2", "project-x", 2000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-3", "project-x", 3000, "closed"],
			)

			const sessions = getRecentSessions(db, "project-x", 2)
			expect(sessions).toHaveLength(2)
			expect(sessions[0].id).toBe("session-3")
			expect(sessions[1].id).toBe("session-2")
		})

		it("uses default limit of 10", () => {
			for (let i = 0; i < 15; i++) {
				db.run(
					"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
					[`session-${i}`, "project-x", 1000 + i, "active"],
				)
			}

			const sessions = getRecentSessions(db, "project-x")
			expect(sessions.length).toBeLessThanOrEqual(10)
		})

		it("filters by project hash", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-a", "project-a", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-b", "project-b", 2000, "active"],
			)

			const sessionsA = getRecentSessions(db, "project-a")
			expect(sessionsA).toHaveLength(1)
			expect(sessionsA[0].project_hash).toBe("project-a")
		})

		it("returns empty array on database closure", () => {
			db.close()
			const sessions = getRecentSessions(db, "project-x")
			expect(sessions).toEqual([])
		})
	})

	describe("getSessionStats", () => {
		it("returns zeros for empty project", () => {
			const stats = getSessionStats(db, "empty-project")

			expect(stats.total_sessions).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.interaction_count).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})

		it("returns correct aggregates", () => {
			// Create session
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "project-x", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-2", "project-x", 2000, "closed"],
			)

			// Create events
			db.run(
				"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				["session-1", "tool-a", 2, 1000, "[]", 3000],
			)
			db.run(
				"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				["session-1", "tool-b", 1, 2000, "[]", 4000],
			)
			db.run(
				"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				["session-2", "tool-c", 3, 3000, "[]", 5000],
			)

			const stats = getSessionStats(db, "project-x")

			expect(stats.total_sessions).toBe(2)
			expect(stats.interaction_count).toBe(3)
			expect(stats.total_hitl_time_ms).toBe(6000)
			expect(stats.avg_wait_ms).toBe(2000)
		})

		it("calculates average correctly for single event", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "project-x", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				["session-1", "tool-a", 1, 5000, "[]", 2000],
			)

			const stats = getSessionStats(db, "project-x")

			expect(stats.avg_wait_ms).toBe(5000)
		})

		it("handles sessions with no events", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "project-x", 1000, "active"],
			)

			const stats = getSessionStats(db, "project-x")

			expect(stats.total_sessions).toBe(1)
			expect(stats.interaction_count).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})

		it("filters by project hash", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-a", "project-a", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-b", "project-b", 2000, "active"],
			)

			const statsA = getSessionStats(db, "project-a")
			expect(statsA.total_sessions).toBe(1)
		})

		it("returns zeros on database closure", () => {
			db.close()
			const stats = getSessionStats(db, "project-x")

			expect(stats.total_sessions).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.interaction_count).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})
	})
})
