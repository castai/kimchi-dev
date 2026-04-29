/**
 * HITL Metrics Integration Smoke Tests
 *
 * End-to-end tests that exercise the full HITL metrics lifecycle through
 * real code paths with file-based SQLite databases in temp directories.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mkdtempSync, rmSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SessionManager } from "./session-manager.js"
import { getMetricsOutput } from "./commands/metrics.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"

/**
 * Helper to create a unique temp directory for each test
 */
function createTempDir(): string {
	return mkdtempSync(join(tmpdir(), "hitl-smoke-test-"))
}

/**
 * Helper to cleanup temp directory
 */
function cleanupTempDir(dir: string): void {
	if (existsSync(dir)) {
		rmSync(dir, { recursive: true, force: true })
	}
}

describe("HITL Metrics Smoke Tests", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDirs: string[] = []

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDirs = []
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		// Cleanup all temp directories
		for (const dir of tempDirs) {
			cleanupTempDir(dir)
		}
	})

	describe("single session lifecycle", () => {
		it("records events and metrics reflect them correctly", async () => {
			const tempDir = createTempDir()
			tempDirs.push(tempDir)

			// Create and initialize session manager
			const manager = new SessionManager()
			manager.init(tempDir)

			const session = manager.getSession()
			expect(session).not.toBeNull()
			expect(session?.status).toBe("active")

			// Record events with realistic durations
			// Simulate tool execution timing
			manager.recordStartTime("call-1")
			await new Promise(resolve => setTimeout(resolve, 50))
			const startTime1 = manager.consumeStartTime("call-1")
			expect(startTime1).toBeDefined()
			const duration1 = Date.now() - startTime1!

			const result1 = manager.recordEvent("ask_user_questions", 2, duration1, [
				"Option A",
				"Option B",
			])
			expect(result1).toBe(true)

			// Record second event
			manager.recordStartTime("call-2")
			await new Promise(resolve => setTimeout(resolve, 30))
			const startTime2 = manager.consumeStartTime("call-2")
			expect(startTime2).toBeDefined()
			const duration2 = Date.now() - startTime2!

			const result2 = manager.recordEvent("secure_env_collect", 1, duration2, [
				"OPENAI_API_KEY",
			])
			expect(result2).toBe(true)

			// Record third event
			const result3 = manager.recordEvent("search_and_read", 0, 150, [])
			expect(result3).toBe(true)

			// Close the manager (closes session)
			manager.close()

			// Now call getMetricsOutput with a fresh connection to the same DB
			const theme = createMockTheme()
			const output = await getMetricsOutput(tempDir, theme)

			// Verify output contains expected stats
			expect(output).toContain("HITL Metrics")
			expect(output).toContain("Total sessions:     1")
			expect(output).toContain("Interactions:       3")
			expect(output).toContain("Total HITL time:")

			// Verify session appears in recent sessions
			expect(output).toContain("Recent Sessions")
			expect(output).toContain("CLOSED")
		})

		it("timeline renders for closed sessions with events", async () => {
			const tempDir = createTempDir()
			tempDirs.push(tempDir)

			const manager = new SessionManager()
			manager.init(tempDir)

			// Record events to create timeline data
			manager.recordStartTime("call-1")
			await new Promise(resolve => setTimeout(resolve, 20))
			const startTime = manager.consumeStartTime("call-1")!
			manager.recordEvent("ask_user_questions", 1, Date.now() - startTime, [
				"Yes",
			])

			// Record another event after a small delay
			await new Promise(resolve => setTimeout(resolve, 20))
			manager.recordEvent("search_and_read", 0, 100, [])

			manager.close()

			const theme = createMockTheme()
			const output = await getMetricsOutput(tempDir, theme)

			// Verify timeline appears
			expect(output).toContain("Session Timeline")

			// Verify legend characters appear (agent, HITL, idle indicators)
			expect(output).toContain("agent")
			expect(output).toContain("HITL")
			expect(output).toContain("idle")
		})
	})

	describe("multi-session accumulation", () => {
		it("multiple sessions accumulate correctly", async () => {
			const tempDir = createTempDir()
			tempDirs.push(tempDir)

			// Session 1: Create manager, record events, close
			const manager1 = new SessionManager()
			manager1.init(tempDir)

			manager1.recordStartTime("s1-call-1")
			await new Promise(resolve => setTimeout(resolve, 30))
			const s1Start1 = manager1.consumeStartTime("s1-call-1")!
			manager1.recordEvent("ask_user_questions", 2, Date.now() - s1Start1, ["A", "B"])

			manager1.recordStartTime("s1-call-2")
			await new Promise(resolve => setTimeout(resolve, 20))
			const s1Start2 = manager1.consumeStartTime("s1-call-2")!
			manager1.recordEvent("secure_env_collect", 1, Date.now() - s1Start2, ["KEY"])

			manager1.close()

			// Session 2: Create a NEW manager on same directory
			const manager2 = new SessionManager()
			manager2.init(tempDir)

			// This should be a new session (not resumed, since previous was closed)
			const session2 = manager2.getSession()
			expect(session2).not.toBeNull()

			// Record events in second session
			manager2.recordStartTime("s2-call-1")
			await new Promise(resolve => setTimeout(resolve, 25))
			const s2Start1 = manager2.consumeStartTime("s2-call-1")!
			manager2.recordEvent("search_and_read", 0, Date.now() - s2Start1, [])

			manager2.recordStartTime("s2-call-2")
			await new Promise(resolve => setTimeout(resolve, 15))
			const s2Start2 = manager2.consumeStartTime("s2-call-2")!
			manager2.recordEvent("ask_user_questions", 1, Date.now() - s2Start2, ["Continue"])

			manager2.close()

			// Verify metrics show accumulated data
			const theme = createMockTheme()
			const output = await getMetricsOutput(tempDir, theme)

			// Should show 2 total sessions
			expect(output).toContain("Total sessions:     2")

			// Should show 4 interactions (2 from session 1 + 2 from session 2)
			expect(output).toContain("Interactions:       4")

			// Should show accumulated HITL time (all events)
			expect(output).toContain("Total HITL time:")

			// Both sessions should be in recent sessions
			expect(output).toContain("Recent Sessions")

			// Count occurrences of CLOSED status
			const closedMatches = output.match(/CLOSED/g)
			expect(closedMatches?.length).toBeGreaterThanOrEqual(2)
		})

		it("data persists across restart", async () => {
			const tempDir = createTempDir()
			tempDirs.push(tempDir)

			// First "run" - simulate work with first manager
			const manager1 = new SessionManager()
			manager1.init(tempDir)

			manager1.recordEvent("ask_user_questions", 1, 500, ["Yes"])
			manager1.recordEvent("search_and_read", 0, 200, [])

			manager1.close()

			//
			// Simulate "restart" by opening getMetricsOutput with fresh DB connection
			const theme = createMockTheme()
			const output = await getMetricsOutput(tempDir, theme)

			// Verify data from first session persisted and is visible
			expect(output).toContain("Total sessions:     1")
			expect(output).toContain("Interactions:       2")
			expect(output).toContain("Total HITL time:")

			// Also prove we can add more data (restart and continue)
			const manager2 = new SessionManager()
			manager2.init(tempDir)
			manager2.recordEvent("another_tool", 1, 300, ["Option"])
			manager2.close()

			const output2 = await getMetricsOutput(tempDir, theme)
			expect(output2).toContain("Interactions:       3")
		})
	})

	describe("error handling", () => {
		it("non-fatal degradation when DB cannot be opened", () => {
			const manager = new SessionManager()

			// Initialize with a valid path (session is created in memory)
			const tempDir = createTempDir()
			tempDirs.push(tempDir)
			manager.init(tempDir)

			// Close the manager to release DB connection
			manager.close()

			// recordEvent should return false when db/session unavailable
			// (tested by not re-initializing after close)
			const result = manager.recordEvent("ask_user_questions", 1, 1000, ["Yes"])
			expect(result).toBe(false)

			// close should not throw even when called multiple times
			expect(() => manager.close()).not.toThrow()
		})

		it("non-fatal degradation on manager without init", () => {
			const manager = new SessionManager()

			// Using manager without calling init() should not throw
			expect(() => manager.getSession()).not.toThrow()
			expect(manager.getSession()).toBeNull()

			// recordEvent should return false when not initialized
			const result = manager.recordEvent("ask_user_questions", 1, 1000, ["Yes"])
			expect(result).toBe(false)

			// close should not throw even when never initialized
			expect(() => manager.close()).not.toThrow()
		})
	})
})
