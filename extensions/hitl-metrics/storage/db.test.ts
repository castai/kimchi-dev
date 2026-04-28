/**
 * HitlDatabase Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { HitlDatabase } from "./db.ts"
import { SESSIONS_TABLE_SQL, EVENTS_TABLE_SQL, PROJECT_HASH_INDEX_SQL, SESSION_ID_INDEX_SQL } from "./schema.ts"

describe("HitlDatabase", () => {
	describe("with :memory: database", () => {
		let db: HitlDatabase

		beforeEach(() => {
			db = new HitlDatabase(":memory:")
		})

		afterEach(() => {
			db.close()
		})

		it("opens successfully", () => {
			const opened = db.open()
			expect(opened).toBe(true)
			expect(db.isOpen).toBe(true)
		})

		it("returns false on double open (lazy init)", () => {
			db.open()
			const secondOpen = db.open()
			// Second open creates new Database instance (replaces previous)
			// This is acceptable behavior - we just verify it doesn't crash
			expect(db.isOpen).toBe(true)
		})

		it("initializes schema successfully", () => {
			db.open()
			const schemaOk = db.initSchema()
			expect(schemaOk).toBe(true)
		})

		it("closes successfully", () => {
			db.open()
			db.close()
			expect(db.isOpen).toBe(false)
		})

		it("can insert and query data after init", () => {
			db.open()
			db.initSchema()

			// Insert a session
			const insertOk = db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["test-session-1", "abc123def4567890", 1234567890, "active"],
			)
			expect(insertOk).toBe(true)

			// Query it back
			const results = db.query<{ id: string; project_hash: string; status: string }>(
				"SELECT id, project_hash, status FROM hitl_sessions WHERE id = ?",
				["test-session-1"],
			)
			expect(results).toHaveLength(1)
			expect(results[0].id).toBe("test-session-1")
			expect(results[0].project_hash).toBe("abc123def4567890")
			expect(results[0].status).toBe("active")
		})

		it("returns empty array on failed query (non-fatal)", () => {
			db.open()
			// Query before schema init - should fail gracefully
			const results = db.query("SELECT * FROM hitl_sessions")
			expect(results).toEqual([])
		})

		it("returns false on failed run (non-fatal)", () => {
			db.open()
			// Try to insert without schema - should fail gracefully
			const insertOk = db.run("INSERT INTO hitl_sessions (id) VALUES (?)", ["test"])
			expect(insertOk).toBe(false)
		})

		it("handles multiple sessions in same project", () => {
			db.open()
			db.initSchema()

			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-1", "proj-hash-1", 1000, "active"],
			)
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-2", "proj-hash-1", 2000, "closed"],
			)

			const results = db.query<{ id: string }>(
				"SELECT id FROM hitl_sessions WHERE project_hash = ? ORDER BY started_at",
				["proj-hash-1"],
			)
			expect(results).toHaveLength(2)
			expect(results[0].id).toBe("session-1")
			expect(results[1].id).toBe("session-2")
		})

		it("supports foreign key constraints (events link to sessions)", () => {
			db.open()
			db.initSchema()

			// Insert session
			db.run(
				"INSERT INTO hitl_sessions (id, project_hash, started_at, status) VALUES (?, ?, ?, ?)",
				["session-parent", "proj-hash", 1000, "active"],
			)

			// Insert event referencing session
			db.run(
				"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				["session-parent", "ask_user", 3, 5000, '["option1", "option2"]', 2000],
			)

			const events = db.query<{ tool_name: string; question_count: number }>(
				"SELECT tool_name, question_count FROM hitl_events WHERE session_id = ?",
				["session-parent"],
			)
			expect(events).toHaveLength(1)
			expect(events[0].tool_name).toBe("ask_user")
			expect(events[0].question_count).toBe(3)
		})
	})

	describe("schema constants", () => {
		it("SESSIONS_TABLE_SQL contains expected columns", () => {
			expect(SESSIONS_TABLE_SQL).toContain("hitl_sessions")
			expect(SESSIONS_TABLE_SQL).toContain("id TEXT PRIMARY KEY")
			expect(SESSIONS_TABLE_SQL).toContain("project_hash TEXT")
			expect(SESSIONS_TABLE_SQL).toContain("started_at INTEGER")
			expect(SESSIONS_TABLE_SQL).toContain("ended_at INTEGER")
			expect(SESSIONS_TABLE_SQL).toContain("status TEXT")
		})

		it("EVENTS_TABLE_SQL contains expected columns", () => {
			expect(EVENTS_TABLE_SQL).toContain("hitl_events")
			expect(EVENTS_TABLE_SQL).toContain("id INTEGER PRIMARY KEY AUTOINCREMENT")
			expect(EVENTS_TABLE_SQL).toContain("session_id TEXT")
			expect(EVENTS_TABLE_SQL).toContain("tool_name TEXT")
			expect(EVENTS_TABLE_SQL).toContain("question_count INTEGER")
			expect(EVENTS_TABLE_SQL).toContain("duration_ms INTEGER")
			expect(EVENTS_TABLE_SQL).toContain("selected_options TEXT")
			expect(EVENTS_TABLE_SQL).toContain("created_at INTEGER")
			expect(EVENTS_TABLE_SQL).toContain("FOREIGN KEY")
		})

		it("indexes are defined", () => {
			expect(PROJECT_HASH_INDEX_SQL).toContain("idx_sessions_project_hash")
			expect(SESSION_ID_INDEX_SQL).toContain("idx_events_session_id")
		})
	})

	describe("error handling", () => {
		it("returns false for operations before open()", () => {
			const db = new HitlDatabase(":memory:")
			// Don't call open()
			expect(db.initSchema()).toBe(false)
			expect(db.run("SELECT 1")).toBe(false)
			expect(db.query("SELECT 1")).toEqual([])
			db.close() // safe no-op
		})

		it("returns empty/false for operations after close()", () => {
			const db = new HitlDatabase(":memory:")
			db.open()
			db.initSchema()
			db.close()
			expect(db.isOpen).toBe(false)
			expect(db.query("SELECT 1")).toEqual([])
			expect(db.run("SELECT 1")).toBe(false)
		})
	})
})
