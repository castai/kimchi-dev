/**
 * Metrics Command Integration Tests
 *
 * Tests the /metrics command handler with both populated and empty DB scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { handleMetricsCommand } from "./metrics.js"
import { HitlDatabase, projectHash, getSessionStats, getRecentSessions } from "../storage/index.js"
import type { HitlStats, HitlSession } from "../types.js"
import type { ExtensionCommandContext, Theme } from "@mariozechner/pi-coding-agent"
import { homedir } from "node:os"
import { resolve } from "node:path"
import { mkdtempSync, rmSync } from "node:fs"

// --- Mock Theme ---
function createMockTheme(): Theme {
	const noOp = (text: string) => text
	return {
		name: "mock",
		fg: (_c, text) => `[color:${text}]`,
		bg: (_c, text) => text,
		bold: (text) => `<b>${text}</b>`,
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

const mockTheme: Theme = createMockTheme()

// --- Mock ExtensionCommandContext ---
function createMockCtx(overrides: Partial<ExtensionCommandContext> = {}): ExtensionCommandContext {
	return {
		cwd: "/tmp/test",
		hasUI: true,
		ui: {
			notify: vi.fn(),
			theme: mockTheme,
		},
		...overrides,
	}
}

// --- Setup Helpers ---
function seedDatabase(db: HitlDatabase, hash: string): void {
	db.open()
	db.initSchema()

	// Insert test sessions
	const now = Date.now()
	const sessionId1 = "test-session-1"
	const sessionId2 = "test-session-2"

	db.run(
		"INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status) VALUES (?, ?, ?, ?, ?)",
		[sessionId1, hash, now - 3600000, now - 3000000, "closed"],
	)
	db.run(
		"INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status) VALUES (?, ?, ?, ?, ?)",
		[sessionId2, hash, now - 1800000, now - 900000, "closed"],
	)

	// Insert test events
	db.run(
		"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		[sessionId1, "ask_user_questions", 2, 1200, JSON.stringify(["option1"]), now - 3500000],
	)
	db.run(
		"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		[sessionId1, "ask_user_questions", 1, 800, JSON.stringify(["option2"]), now - 3400000],
	)
	db.run(
		"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		[sessionId2, "ask_user_questions", 3, 2000, JSON.stringify(["option3", "option4"]), now - 800000],
	)
}

// --- Tests ---
describe("handleMetricsCommand", () => {
	let tempDir: string
	let mockCtx: ReturnType<typeof createMockCtx>

	beforeEach(() => {
		tempDir = mkdtempSync("/tmp/hitl-test-")
		mockCtx = createMockCtx({ cwd: tempDir })
	})

	afterEach(() => {
		try {
			rmSync(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore
		}
	})

	it("should show empty state when no DB exists", async () => {
		await handleMetricsCommand("", mockCtx)

		expect(mockCtx.ui.notify).toHaveBeenCalledWith("No HITL data recorded yet", "info")
	})

	it("should show error when cwd is missing", async () => {
		const ctxNoCwd = createMockCtx({ cwd: undefined })
		await handleMetricsCommand("", ctxNoCwd)

		expect(ctxNoCwd.ui.notify).toHaveBeenCalledWith("No project directory available", "error")
	})

	it("should handle no-UI case gracefully", async () => {
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})
		
		// Use a unique temp directory path to avoid picking up existing data
		const uniqueTempDir = mkdtempSync("/tmp/hitl-noui-test-")
		const ctxNoUI = createMockCtx({ hasUI: false, cwd: uniqueTempDir })

		await handleMetricsCommand("", ctxNoUI)

		expect(consoleSpy).toHaveBeenCalledWith("HITL Metrics:")
		// Output contains the no-data message since DB doesn't exist
		const output = consoleSpy.mock.calls[1][0] as string
		expect(output).toContain("No HITL data recorded yet")

		consoleSpy.mockRestore()
		
		// Cleanup
		try {
			rmSync(uniqueTempDir, { recursive: true, force: true })
		} catch {
			// Ignore
		}
	})

	it("should display metrics via notify when DB has data", async () => {
		const projectHashStr = projectHash(tempDir)
		const storageDir = resolve(homedir(), ".hitl-metrics")
		const expectedDbPath = resolve(storageDir, `${projectHashStr}.db`)

		// Create DB at expected location
		const db = new HitlDatabase(expectedDbPath)
		seedDatabase(db, projectHashStr)
		db.close()

		await handleMetricsCommand("", mockCtx)

		// Should notify with formatted output containing expected elements
		const notifyCall = mockCtx.ui.notify as unknown as ReturnType<typeof vi.fn>
		expect(notifyCall).toHaveBeenCalled()
		const notifiedMessage = notifyCall.mock.calls[0][0] as string
		expect(notifiedMessage).toContain("HITL Metrics")
		expect(notifiedMessage).toContain("Total sessions")
		expect(notifiedMessage).toContain("2")

		// Cleanup
		try {
			rmSync(expectedDbPath, { force: true })
		} catch {
			// Ignore
		}
	})

	it("should handle DB errors gracefully", async () => {
		// Mock console.warn to suppress warning
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		
		// Point to a directory where DB exists but is corrupted
		const projectHashStr = projectHash(tempDir)
		const storageDir = resolve(homedir(), ".hitl-metrics")
		const expectedDbPath = resolve(storageDir, `${projectHashStr}.db`)

		// Create empty/corrupted DB file
		const db = new HitlDatabase(expectedDbPath)
		db.open()
		db.close()
		// Database exists but has no schema — querying should fail gracefully

		await handleMetricsCommand("", mockCtx)

		// Should fall back to empty state
		expect(mockCtx.ui.notify).toHaveBeenCalledWith("No HITL data recorded yet", "info")

		warnSpy.mockRestore()

		// Cleanup
		try {
			rmSync(expectedDbPath, { force: true })
		} catch {
			// Ignore
		}
	})
})

describe("storage integration", () => {
	let tempDir: string

	beforeEach(() => {
		tempDir = mkdtempSync("/tmp/hitl-test-")
	})

	afterEach(() => {
		try {
			rmSync(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore
		}
	})

	it("getSessionStats and getRecentSessions return correct data", async () => {
		const hash = projectHash(tempDir)
		const dbPath = resolve(tempDir, "test.db")

		// Create and seed DB
		const db = new HitlDatabase(dbPath)
		seedDatabase(db, hash)
		db.close()

		// Reopen to query
		const db2 = new HitlDatabase(dbPath)
		db2.open()

		const stats: HitlStats = getSessionStats(db2, hash)
		const sessions: HitlSession[] = getRecentSessions(db2, hash, 10)

		expect(stats.total_sessions).toBe(2)
		expect(stats.interaction_count).toBe(3)
		expect(stats.total_hitl_time_ms).toBe(4000) // 1200 + 800 + 2000
		expect(stats.avg_wait_ms).toBeGreaterThan(0)
		expect(sessions.length).toBe(2)
		expect(sessions[0].status).toBe("closed")

		db2.close()
	})

	it("returns zero stats for empty database", () => {
		const hash = projectHash(tempDir)
		const dbPath = resolve(tempDir, "empty.db")

		// Create empty DB with schema
		const db = new HitlDatabase(dbPath)
		db.open()
		db.initSchema()

		const stats: HitlStats = getSessionStats(db, hash)
		const sessions: HitlSession[] = getRecentSessions(db, hash, 10)

		expect(stats.total_sessions).toBe(0)
		expect(stats.interaction_count).toBe(0)
		
expect(stats.total_hitl_time_ms).toBe(0)
		expect(stats.avg_wait_ms).toBe(0)
		expect(sessions.length).toBe(0)

		db.close()
	})
})

describe("timeline integration", () => {
	let tempDir: string

	beforeEach(() => {
		tempDir = mkdtempSync("/tmp/hitl-test-")
	})

	afterEach(() => {
		try {
			rmSync(tempDir, { recursive: true, force: true })
		} catch {
			// Ignore
		}
	})

	it("getMetricsOutput includes timeline for closed session with events", async () => {
		const { getMetricsOutput } = await import("./metrics.js")
		const projectHashStr = projectHash(tempDir)
		const storageDir = resolve(homedir(), ".hitl-metrics")
		const expectedDbPath = resolve(storageDir, `${projectHashStr}.db`)

		// Create DB at expected location
		const db = new HitlDatabase(expectedDbPath)
		db.open()
		db.initSchema()

		const now = Date.now()
		const sessionId = "test-session-timeline"

		// Insert a closed session
		db.run(
			"INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status) VALUES (?, ?, ?, ?, ?)",
			[sessionId, projectHashStr, now - 3600000, now - 60000, "closed"],
		)

		// Insert events for the session
		db.run(
			"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
			[sessionId, "ask_user_questions", 2, 120000, JSON.stringify(["option1"]), now - 3500000],
		)
		db.run(
			"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
			[sessionId, "ask_user_questions", 1, 60000, JSON.stringify(["option2"]), now - 3300000],
		)

		db.close()

		const mockTheme = {
			fg: (_c: string, t: string) => t,
			bg: (_c: string, t: string) => t,
			bold: (t: string) => t, inverse: (t: string) => t,
			dim: (t: string) => t,
			italic: (t: string) => t,
			underline: (t: string) => t,
			strikethrough: (t: string) => t,
		}

		const output = await getMetricsOutput(tempDir, mockTheme as Theme)

		expect(output).toContain("Session Timeline")
		expect(output).toContain("solo")
		expect(output).toContain("HITL")

		// Cleanup
		try {
			rmSync(expectedDbPath, { force: true })
		} catch {
			// Ignore
		}
	})

	it("getMetricsOutput omits timeline when no closed sessions exist", async () => {
		const { getMetricsOutput } = await import("./metrics.js")
		const projectHashStr = projectHash(tempDir)
		const storageDir = resolve(homedir(), ".hitl-metrics")
		const expectedDbPath = resolve(storageDir, `${projectHashStr}.db`)

		// Create DB at expected location
		const db = new HitlDatabase(expectedDbPath)
		db.open()
		db.initSchema()

		const now = Date.now()
		const sessionId = "test-session-active"

		// Insert only an active session (no closed sessions)
		db.run(
			"INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status) VALUES (?, ?, ?, ?, ?)",
			[sessionId, projectHashStr, now - 3600000, null, "active"],
		)

		db.close()

		const mockTheme = {
			fg: (_c: string, t: string) => t,
			bg: (_c: string, t: string) => t,
			bold: (t: string) => t, inverse: (t: string) => t,
			dim: (t: string) => t,
			italic: (t: string) => t,
			underline: (t: string) => t,
			strikethrough: (t: string) => t,
		}

		const output = await getMetricsOutput(tempDir, mockTheme as Theme)

		// Should have metrics but no timeline section
		expect(output).toContain("Total sessions")
		expect(output).not.toContain("Session Timeline")

		// Cleanup
		try {
			rmSync(expectedDbPath, { force: true })
		} catch {
			// Ignore
		}
	})

	it("metrics command shows timeline when DB has closed session data", async () => {
		const projectHashStr = projectHash(tempDir)
		const storageDir = resolve(homedir(), ".hitl-metrics")
		const expectedDbPath = resolve(storageDir, `${projectHashStr}.db`)

		// Create DB at expected location
		const db = new HitlDatabase(expectedDbPath)
		db.open()
		db.initSchema()

		const now = Date.now()
		const sessionId = "test-session-closed"

		// Insert a closed session with events
		db.run(
			"INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status) VALUES (?, ?, ?, ?, ?)",
			[sessionId, projectHashStr, now - 3600000, now - 60000, "closed"],
		)
		db.run(
			"INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at) VALUES (?, ?, ?, ?, ?, ?)",
			[sessionId, "ask_user_questions", 2, 120000, JSON.stringify(["option1"]), now - 3500000],
		)

		db.close()

		const mockCtx = createMockCtx({ cwd: tempDir })
		await handleMetricsCommand("", mockCtx)

		// Should notify with output containing timeline
		const notifyCall = mockCtx.ui.notify as unknown as ReturnType<typeof vi.fn>
		expect(notifyCall).toHaveBeenCalled()
		const notifiedMessage = notifyCall.mock.calls[0][0] as string
		expect(notifiedMessage).toContain("Session Timeline")
		expect(notifiedMessage).toContain("solo")
		expect(notifiedMessage).toContain("HITL")

		// Cleanup
		try {
			rmSync(expectedDbPath, { force: true })
		} catch {
			// Ignore
		}
	})
})
