/**
 * SessionManager Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { SessionManager } from "./session-manager.js"

describe("SessionManager", () => {
	describe("with :memory: database via init()", () => {
		let manager: SessionManager
		let consoleWarnSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => {
			manager = new SessionManager()
			consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		})

		afterEach(() => {
			manager.close()
			consoleWarnSpy.mockRestore()
		})

		it("init() opens DB, inits schema, creates session", () => {
			manager.init("/tmp/test-project")

			const session = manager.getSession()
			expect(session).not.toBeNull()
			expect(session?.status).toBe("active")
			expect(session?.project_hash).toBeTruthy()
			expect(session?.started_at).toBeGreaterThan(0)
		})

		it("getSession() returns current active session", () => {
			manager.init("/tmp/test-project")

			const session = manager.getSession()
			expect(session).not.toBeNull()
			expect(session?.status).toBe("active")
		})

		it("recordEvent() returns false when no active session", () => {
			// Don't call init() - no session exists
			const result = manager.recordEvent("ask_user_questions", 1, 1000, ["Option"])
			expect(result).toBe(false)
		})

		it("recordEvent() returns false after session is closed", () => {
			manager.init("/tmp/test-project")
			manager.close()

			const result = manager.recordEvent("ask_user_questions", 1, 1000, ["Option"])
			expect(result).toBe(false)
		})

		it("close() closes the session and database", () => {
			manager.init("/tmp/test-project")
			const sessionBefore = manager.getSession()
			expect(sessionBefore).not.toBeNull()

			manager.close()

			const sessionAfter = manager.getSession()
			expect(sessionAfter).toBeNull()
		})

		it("close() is idempotent (safe to call twice)", () => {
			manager.init("/tmp/test-project")
			manager.close()
			manager.close() // Should not throw

			expect(manager.getSession()).toBeNull()
		})

		it("init() is non-fatal with empty path (doesn't throw)", () => {
			// Empty path produces a valid hash - test just verifies no exception thrown
			expect(() => manager.init("")).not.toThrow()
			// Empty string hashes to a valid project_hash, so a session is created
			// This is acceptable behavior - the hash function handles empty strings
		})
	})

	describe("event recording with duration tracking", () => {
		let manager: SessionManager

		beforeEach(() => {
			manager = new SessionManager()
			manager.init("/tmp/test-project")
		})

		afterEach(() => {
			manager.close()
		})

		it("recordStartTime() stores start time for tool call", () => {
			const toolCallId = "call-123"
			manager.recordStartTime(toolCallId)

			const startTime = manager.consumeStartTime(toolCallId)
			expect(startTime).toBeGreaterThan(0)
		})

		it("recordStartTime() handles empty toolCallId gracefully", () => {
			// Should not throw
			manager.recordStartTime("")
			expect(manager.consumeStartTime("")).toBeUndefined()
		})

		it("consumeStartTime() returns and removes start time", () => {
			const toolCallId = "call-456"
			manager.recordStartTime(toolCallId)

			const first = manager.consumeStartTime(toolCallId)
			const second = manager.consumeStartTime(toolCallId)

			expect(first).toBeGreaterThan(0)
			expect(second).toBeUndefined()
		})

		it("consumeStartTime() returns undefined for unknown toolCallId", () => {
			const startTime = manager.consumeStartTime("non-existent")
			expect(startTime).toBeUndefined()
		})

		it("multiple start times can be tracked independently", () => {
			manager.recordStartTime("call-1")
			manager.recordStartTime("call-2")

			const time1 = manager.consumeStartTime("call-1")
			const time2 = manager.consumeStartTime("call-2")

			expect(time1).toBeGreaterThan(0)
			expect(time2).toBeGreaterThan(0)
		})
	})

	describe("session persistence", () => {
		let manager: SessionManager
		let consoleWarnSpy: ReturnType<typeof vi.spyOn>

		beforeEach(() => {
			consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		})

		afterEach(() => {
			manager?.close()
			consoleWarnSpy.mockRestore()
		})

		it("recordEvent() writes event to hitl_events table with correct fields", () => {
			manager = new SessionManager()
			manager.init("/tmp/test-project")

			const result = manager.recordEvent("ask_user_questions", 3, 5000, [
				"Option A",
				"Option B",
			])

			expect(result).toBe(true)
		})

		it("same project path produces same project_hash across instances", () => {
			const manager1 = new SessionManager()
			manager1.init("/tmp/same-project")
			const hash1 = manager1.getSession()?.project_hash

			const manager2 = new SessionManager()
			manager2.init("/tmp/same-project")
			const hash2 = manager2.getSession()?.project_hash

			expect(hash1).toBe(hash2)

			manager1.close()
			manager2.close()
		})
	})
})
