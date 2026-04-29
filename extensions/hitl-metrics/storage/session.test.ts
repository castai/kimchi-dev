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
	recordPermissionEvent,
	getSessionPermissionEvents,
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

		it("returns existing active session within 2.hour window", () => {
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

		it("creates new session when old session exceeded 2.h timeout", async () => {
			// Insert active session 3 hours ago — beyond the 2h resume window
			const oldTime = Date.now() - 3 * 60 * 60 * 1000
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

		it("uses default threshold of 2 hours", () => {
			const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["orphan-default", "project-x", threeHoursAgo, "active"],
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

			const sessions = getRecentSessions(db)

			expect(sessions).toHaveLength(3
)
			expect(sessions[0].id).toBe("session-newest")
			expect(sessions[1].id).toBe("session-middle")
			expect(sessions[2].id).toBe("session-oldest")
		})

		it("returns empty array when no sessions exist", () => {
			const sessions = getRecentSessions(db)
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

			const sessions = getRecentSessions(db, 2)
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

			const sessions = getRecentSessions(db)
			expect(sessions.length).toBeLessThanOrEqual(10)
		})

		it("returns all sessions from the DB (no hash filter needed — DB is project-scoped)", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-a", "project-a", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-b", "project-b", 2000, "active"],
			)

			const sessions = getRecentSessions(db)
			// Both sessions returned — DB is already scoped to one project
			expect(sessions).toHaveLength(2)
			expect(sessions[0].id).toBe("session-b") // newest first
			expect(sessions[1].id).toBe("session-a")
		})

		it("returns empty array on database closure", () => {
			db.close()
			const sessions = getRecentSessions(db)
			expect(sessions).toEqual([])
		})
	})

	describe("getSessionStats", () => {
		it("returns zeros for empty project", () => {
			const stats = getSessionStats(db)

			expect(stats.total_sessions).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.interaction_count).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})

		it("returns correct aggregates", () => {
			// Create sessions with hitl_time_ms set (stats now reads from sessions, not events)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status, hitl_time_ms) VALUES (?, ?, ?, ?, ?)",
				["session-1", "project-x", 1000, "active", 3000],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status, hitl_time_ms) VALUES (?, ?, ?, ?, ?)",
				["session-2", "project-x", 2000, "closed", 3000],
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

			const stats = getSessionStats(db)

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

			const stats = getSessionStats(db)

			expect(stats.avg_wait_ms).toBe(5000)
		})

		it("handles sessions with no events", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "project-x", 1000, "active"],
			)

			const stats = getSessionStats(db)

			expect(stats.total_sessions).toBe(1)
			expect(stats.interaction_count).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})

		it("counts all sessions in DB (no hash filter needed — DB is project-scoped)", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-a", "project-a", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-b", "project-b", 2000, "active"],
			)

			const stats = getSessionStats(db)
			expect(stats.total_sessions).toBe(2) // Both sessions counted — DB is already project-scoped
		})

		it("returns zeros on database closure", () => {
			db.close()
			const stats = getSessionStats(db)

			expect(stats.total_sessions).toBe(0)
			expect(stats.total_hitl_time_ms).toBe(0)
			expect(stats.interaction_count).toBe(0)
			expect(stats.avg_wait_ms).toBe(0)
		})
	})

	describe("recordPermissionEvent", () => {
		it("records a permission event", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-perm", "project-x", 1000, "active"],
			)

			const result = recordPermissionEvent(
				db,
				"session-perm",
				"bash",
				"rm -rf /tmp/*",
				"allow",
				500,
			)

			expect(result).toBe(true)

			const events = getSessionPermissionEvents(db, "session-perm")
			expect(events).toHaveLength(1)
			expect(events[0].tool_name).toBe("bash")
			expect(events[0].action).toBe("rm -rf /tmp/*")
			expect(events[0].outcome).toBe("allow")
			expect(events[0].duration_ms).toBe(500)
		})

		it("records different outcomes", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-outcomes", "project-x", 1000, "active"],
			)

			recordPermissionEvent(db, "session-outcomes", "bash", "cmd1", "allow", 100)
			recordPermissionEvent(db, "session-outcomes", "bash", "cmd2", "allow_once", 200)
			recordPermissionEvent(db, "session-outcomes", "bash", "cmd3", "deny", 300)
			recordPermissionEvent(db, "session-outcomes", "bash", "cmd4", "blocked", 400, "Denied by rule")

			const events = getSessionPermissionEvents(db, "session-outcomes")
			expect(events).toHaveLength(4)
			expect(events[0].outcome).toBe("allow")
			expect(events[1].outcome).toBe("allow_once")
			expect(events[2].outcome).toBe("deny")
			expect(events[3].outcome).toBe("blocked")
			expect(events[3].reason).toBe("Denied by rule")
		})

		it("is non-fatal when database is closed", () => {
			db.close()
			const result = recordPermissionEvent(
				db,
				"session-perm",
				"bash",
				"cmd",
				"deny",
				100,
			)
			expect(result).toBe(false)
		})

		it("is non-fatal when session does not exist", () => {
			const result = recordPermissionEvent(
				db,
				"nonexistent-session",
				"bash",
				"cmd",
				"allow",
				100,
			)
			expect(result).toBe(false)
		})
	})

	describe("getSessionPermissionEvents", () => {
		it("returns empty array when no permission events exist", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-empty", "project-x", 1000, "active"],
			)

			const events = getSessionPermissionEvents(db, "session-empty")
			expect(events).toEqual([])
		})

		it("returns events in chronological order", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-chron", "project-x", 1000, "active"],
			)

			recordPermissionEvent(db, "session-chron", "write", "file1", "allow", 100)
			recordPermissionEvent(db, "session-chron", "write", "file2", "allow", 200)

			const events = getSessionPermissionEvents(db, "session-chron")
			expect(events).toHaveLength(2)
			expect(events[0].action).toBe("file1")
			expect(events[1].action).toBe("file2")
		})

		it("returns empty array on database closure", () => {
			db.close()
			const events = getSessionPermissionEvents(db, "any-session")
			expect(events).toEqual([])
		})
	})

	describe("getSessionStats with permission events", () => {
		it("aggregates permission event stats", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-perm-stats", "project-perm", 1000, "active"],
			)

			recordPermissionEvent(db, "session-perm-stats", "bash", "cmd1", "allow", 1000)
			recordPermissionEvent(db, "session-perm-stats", "bash", "cmd2", "deny", 500)

			const stats = getSessionStats(db)

			expect(stats.permission_count).toBe(2)
			expect(stats.total_permission_time_ms).toBe(1500)
		})

		it("returns zero permission stats when no permission events", () => {
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-no-perm", "project-no-perm", 1000, "active"],
			)

			const stats = getSessionStats(db)

			expect(stats.permission_count).toBe(0)
			expect(stats.total_permission_time_ms).toBe(0)
		})
	})
})
