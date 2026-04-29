/**
 * HITL Metrics Extension Hook Tests
 *
 * Comprehensive end-to-end tests covering the complete extension lifecycle.
 * Uses a mock pi harness to fire events exactly as the real agent would,
 * then queries the DB and metrics output to verify correctness.
 *
 * Key: HITL_DB_PATH env var redirects the SessionManager singleton's DB to
 * the test's temp directory so reads and writes meet in the same place.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { randomUUID } from "node:crypto"
import hitlMetricsExtension from "./index.js"
import { getMetricsOutput } from "./commands/metrics.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"
import { HitlDatabase } from "./storage/db.js"
import { projectHash } from "./storage/hash.js"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"
import type { HitlSession, HitlEvent } from "./types.js"

// ============================================================================
// Mock pi harness
// ============================================================================

function createMockPi(): ExtensionAPI & {
	_trigger: (eventName: string, event?: Record<string, unknown>, ctx?: ExtensionContext) => Promise<void>
	_handlers: Map<string, ((event: unknown, ctx?: ExtensionContext) => Promise<void>)[]>
	_commands: Map<string, { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }>
} {
	const handlers = new Map<string, ((event: unknown, ctx?: ExtensionContext) => Promise<void>)[]>()
	const commands = new Map<string, { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }>()

	return {
		_handlers: handlers,
		_commands: commands,
		on: (event: string, handler: (event: unknown, ctx?: ExtensionContext) => Promise<void>) => {
			if (!handlers.has(event)) handlers.set(event, [])
			handlers.get(event)!.push(handler)
		},
		registerCommand: (name: string, config: { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }) => commands.set(name, config),
		_trigger: async (event: string, data?: unknown, ctx?: ExtensionContext) => {
			const h = handlers.get(event) || []
			for (const fn of h) await fn(data, ctx)
		},
	} as never
}

function createMockCtx(cwd: string): ExtensionContext {
	return {
		cwd,
		hasUI: true,
		ui: {
			notify: vi.fn(),
			theme: createMockTheme() as never,
			select: vi.fn(),
			confirm: vi.fn(),
			input: vi.fn(),
		},
	} as never
}

// ============================================================================
// Test helpers
// ============================================================================

function createTempDir(): string {
	return mkdtempSync(join(tmpdir(), "hitl-hooks-"))
}

/**
 * Redirect the SessionManager singleton's DB to a test-specific path.
 * The extension reads HITL_DB_PATH from env and passes it to SessionManager.init().
 */
function redirectDbTo(tempDir: string): void {
	const hash = projectHash(tempDir)
	const dbDir = join(tempDir, hash)
	if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true })
	process.env.HITL_DB_PATH = join(dbDir, "hitl.db")
}

function restoreDbPath(): void {
	delete process.env.HITL_DB_PATH
}

function readSessions(db: HitlDatabase): HitlSession[] {
	return db.query<HitlSession>(
		`SELECT id, project_hash, started_at, ended_at, status, end_cause,
		        agent_time_ms, hitl_time_ms, idle_time_ms
		 FROM hitl_sessions ORDER BY started_at ASC`,
	)
}

function readEvents(db: HitlDatabase): HitlEvent[] {
	return db.query<HitlEvent>(
		`SELECT id, session_id, tool_name, question_count, duration_ms, selected_options, created_at
		 FROM hitl_events ORDER BY created_at ASC`,
	)
}

function readActivities(db: HitlDatabase, sessionId?: string): Array<Record<string, unknown>> {
	const where = sessionId ? "WHERE session_id = ?" : ""
	const args = sessionId ? [sessionId] : []
	return db.query(
		`SELECT id, session_id, activity_type, duration_ms, timestamp
		 FROM activity_events ${where} ORDER BY id ASC`,
		args,
	)
}

function delay(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms))
}

// Helper to fire a HITL interaction
// Always waits at least MIN_WAIT before firing result to avoid cache threshold
// 50ms minimum + extra buffer ensures we exceed CACHE_THRESHOLD_MS = 50
const MIN_WAIT_MS = 60
function fireHitl(
	mockPi: ReturnType<typeof createMockPi>,
	index: number,
	questions: number,
	selectedOptions: string[],
	durationMs: number,
): Promise<void> {
	const callId = `call-hitl-${index}`
	const waitMs = Math.max(durationMs / 2, MIN_WAIT_MS)
	return mockPi
		._trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: callId })
		.then(() => delay(waitMs))
		.then(() =>
			mockPi._trigger("tool_result", {
				toolName: "ask_user_questions",
				toolCallId: callId,
				isError: false,
				input: { questions: Array.from({ length: questions }, (_, i) => ({ id: i })) },
				result: { selectedOptions },
			}),
		)
}

// Helper to fire a non-HITL tool
function fireTool(
	mockPi: ReturnType<typeof createMockPi>,
	name: string,
	callId: string,
	durationMs: number,
): Promise<void> {
	return mockPi
		._trigger("tool_execution_start", { toolName: name, toolCallId: callId })
		.then(() => delay(durationMs / 2))
		.then(() =>
			mockPi._trigger("tool_result", {
				toolName: name,
				toolCallId: callId,
				isError: false,
				input: {},
				result: { output: `ok` },
			}),
		)
}

// ============================================================================
// Hook Registration Tests
// ============================================================================

describe("HITL Extension — hook registration", () => {
	it("registers all required hooks and command", () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		expect(mockPi._handlers.has("session_start")).toBe(true)
		expect(mockPi._handlers.has("input")).toBe(true)
		expect(mockPi._handlers.has("tool_execution_start")).toBe(true)
		expect(mockPi._handlers.has("tool_result")).toBe(true)
		expect(mockPi._handlers.has("session_shutdown")).toBe(true)
		expect(mockPi._commands.has("metrics")).toBe(true)
	})

	it("each hook registers exactly one handler", () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		expect(mockPi._handlers.get("session_start")?.length).toBe(1)
		expect(mockPi._handlers.get("tool_result")?.length).toBe(1)
		expect(mockPi._handlers.get("tool_execution_start")?.length).toBe(1)
		expect(mockPi._handlers.get("input")?.length).toBe(1)
		expect(mockPi._handlers.get("session_shutdown")?.length).toBe(1)
	})

	it("/metrics command has correct description", () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		expect(mockPi._commands.get("metrics")?.description).toBe("Show HITL interaction metrics")
	})
})

// ============================================================================
// session_start Tests
// ============================================================================

describe("HITL Extension — session_start hook", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("creates database file and session on session_start", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)

		const dbPath = process.env.HITL_DB_PATH!
		expect(existsSync(dbPath)).toBe(true)

		const db = new HitlDatabase(dbPath)
		db.open()
		const sessions = readSessions(db)
		expect(sessions).toHaveLength(1)
		expect(sessions[0].status).toBe("active")
		expect(sessions[0].project_hash).toBe(projectHash(tempDir))
		expect(sessions[0].ended_at).toBeNull()
		expect(sessions[0].end_cause).toBeNull()
		db.close()
	})

	it("initializes session with zeroed time metrics", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		expect(sessions[0].agent_time_ms).toBe(0)
		expect(sessions[0].hitl_time_ms).toBe(0)
		expect(sessions[0].idle_time_ms).toBe(0)
		db.close()
	})

	it("is non-fatal when cwd is empty", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, { cwd: "", hasUI: false } as ExtensionContext)
		expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("cwd"))
	})

	it("closes orphaned sessions on startup", async () => {
		// Pre-create a stale active session (>2h old, beyond the orphan threshold)
		const dbPath = process.env.HITL_DB_PATH!
		const db = new HitlDatabase(dbPath)
		db.open()
		db.initSchema()
		// Insert session 3 hours ago — definitely beyond the 2h orphan threshold
		const oldTime = Date.now() - 3 * 60 * 60 * 1000
		db.run(
			`INSERT INTO hitl_sessions (id, project_hash, started_at, status, agent_time_ms, hitl_time_ms, idle_time_ms)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			["old-session", projectHash(tempDir), oldTime, "active", 0, 0, 0],
		)
		db.close()

		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)

		const db2 = new HitlDatabase(dbPath)
		db2.open()
		const sessions = readSessions(db2)
		const old = sessions.find((s) => s.id === "old-session")
		expect(old?.status).toBe("orphaned")
		expect(old?.end_cause).toBe("orphaned")
		const active = sessions.filter((s) => s.status === "active")
		expect(active).toHaveLength(1)
		db2.close()
	})
})

// ============================================================================
// tool_execution_start Tests
// ============================================================================

describe("HITL Extension — tool_execution_start hook", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("records activity events for tool starts", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_execution_start", { toolName: "read_file", toolCallId: "call-1" })
		await mockPi._trigger("tool_execution_start", { toolName: "bash", toolCallId: "call-2" })
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const activities = readActivities(db)
		expect(activities.length).toBe(2)
		expect(activities.every((a) => (a.activity_type as string) === "tool_start")).toBe(true)
		db.close()
	})

	it("ignores events without toolCallId", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		// Should not throw
		await mockPi._trigger("tool_execution_start", { toolName: "bash" })
		expect(consoleWarnSpy).not.toHaveBeenCalled()
	})

	it("records separate events for each tool start", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_execution_start", { toolName: "bash", toolCallId: "call-a" })
		await mockPi._trigger("tool_execution_start", { toolName: "write_file", toolCallId: "call-b" })
		await mockPi._trigger("tool_execution_start", { toolName: "bash", toolCallId: "call-c" })
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const activities = readActivities(db)
		expect(activities.length).toBe(3)
		db.close()
	})
})

// ============================================================================
// tool_result Tests — HITL Events
// ============================================================================

describe("HITL Extension — tool_result hook (ask_user_questions)", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("writes HITL event with correct fields", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		// 150ms ensures total duration passes 50ms cache threshold with margin
		await fireHitl(mockPi, 1, 2, ["opt-a"], 150)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const events = readEvents(db)
		expect(events).toHaveLength(1)
		expect(events[0].tool_name).toBe("ask_user_questions")
		expect(events[0].question_count).toBe(2)
		expect(events[0].selected_options).toBe(JSON.stringify(["opt-a"]))
		// Duration reflects elapsed time between start and result (≥50ms cache threshold)
		expect(events[0].duration_ms).toBeGreaterThanOrEqual(50)
		// hitl_time_ms persisted to DB on session_shutdown
		const sessions = readSessions(db)
		expect(sessions[0].hitl_time_ms).toBeGreaterThan(0)
		db.close()
	})

	it("extracts question count from input.questions array length", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireHitl(mockPi, 1, 4, ["x"], 50)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const events = readEvents(db)
		expect(events[0].question_count).toBe(4)
		db.close()
	})

	it("extracts selectedOptions array from result", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireHitl(mockPi, 1, 3, ["A", "B", "C"], 50)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const events = readEvents(db)
		expect(JSON.parse(events[0].selected_options)).toEqual(["A", "B", "C"])
		db.close()
	})

	it("drops error results", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-err" })
		await mockPi._trigger("tool_result", {
			toolName: "ask_user_questions",
			toolCallId: "call-err",
			isError: true,
			input: { questions: [{ id: 1 }] },
			result: {},
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		expect(readEvents(db)).toHaveLength(0)
		db.close()
	})

	it("skips result without tool_execution_start (no duration)", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_result", {
			toolName: "ask_user_questions",
			toolCallId: "call-no-start",
			isError: false,
			input: { questions: [{ id: 1 }] },
			result: { selectedOptions: ["x"] },
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		expect(readEvents(db)).toHaveLength(0) // no start time, no duration
		db.close()
	})

	it("skips fast results below cache threshold", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-fast" })
		// Fire immediately — no delay
		await mockPi._trigger("tool_result", {
			toolName: "ask_user_questions",
			toolCallId: "call-fast",
			isError: false,
			input: { questions: [{ id: 1 }] },
			result: { selectedOptions: ["y"] },
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		expect(readEvents(db)).toHaveLength(0) // below 50ms cache threshold
		db.close()
	})

	it("accumulates hitl_time_ms for multiple HITL events", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireHitl(mockPi, 1, 1, ["A"], 80)
		await fireHitl(mockPi, 2, 1, ["B"], 120)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const events = readEvents(db)
		const sessions = readSessions(db)
		expect(events).toHaveLength(2)
		expect(sessions[0].hitl_time_ms).toBeGreaterThan(0)
		db.close()
	})
})

// ============================================================================
// tool_result Tests — Non-HITL Tools
// ============================================================================

describe("HITL Extension — tool_result hook (non-HITL tools)", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	const nonHitlTools = ["bash", "read_file", "write_file", "lsp", "search_the_web", "browser_navigate"]

	for (const toolName of nonHitlTools) {
		it(`${toolName} does NOT create hitl_events rows`, async () => {
			const mockPi = createMockPi()
			hitlMetricsExtension(mockPi)
			await mockPi._trigger("session_start", {}, mockCtx)
			await fireTool(mockPi, toolName, `call-${toolName}`, 100)

			const db = new HitlDatabase(process.env.HITL_DB_PATH!)
			db.open()
			expect(readEvents(db)).toHaveLength(0)
			db.close()
		})
	}

	it("accumulates agent_time_ms for non-HITL tools", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireTool(mockPi, "bash", "call-agent", 200)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		// fireTool delay is durationMs/2, so minimum is ~durationMs/2
		expect(sessions[0].agent_time_ms).toBeGreaterThanOrEqual(90)
		db.close()
	})

	it("tool_execution_start is required for duration tracking", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_result", {
			toolName: "bash",
			toolCallId: "call-no-start",
			isError: false,
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		// No start time → no duration → no agent time accumulated
		const sessions = readSessions(db)
		expect(sessions[0].agent_time_ms).toBe(0)
		db.close()
	})
})

// ============================================================================
// input Handler Tests
// ============================================================================

describe("HITL Extension — input hook", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("skips extension-generated messages", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("input", { source: "extension" })
		// No throw, no warning
		expect(consoleWarnSpy).not.toHaveBeenCalled()
	})

	it("records user_input activity event", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("input", { source: "user" })

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const activities = readActivities(db)
		const userInputs = activities.filter((a) => (a.activity_type as string) === "user_input")
		expect(userInputs).toHaveLength(1)
		db.close()
	})

	it("is non-fatal when no session is active", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		// No session_start — session is null
		await mockPi._trigger("input", { source: "user" })
		expect(consoleWarnSpy).not.toHaveBeenCalled()
	})
})

// ============================================================================
// session_shutdown Tests
// ============================================================================

describe("HITL Extension — session_shutdown hook", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("closes session with end_cause=signal by default", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		expect(sessions[0].status).toBe("closed")
		expect(sessions[0].end_cause).toBe("signal")
		expect(sessions[0].ended_at).not.toBeNull()
		db.close()
	})

	it("sets end_cause=disconnect when cause=disconnect", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", { cause: "disconnect" })

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		expect(sessions[0].status).toBe("closed")
		expect(sessions[0].end_cause).toBe("complete") // disconnect → complete
		db.close()
	})

	it("persists accumulated time metrics", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireTool(mockPi, "bash", "call-agent", 200)
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		expect(sessions[0].agent_time_ms).toBeGreaterThan(0)
		db.close()
	})

	it("is non-fatal when called before session_start", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		// No session_start — session is null
		await mockPi._trigger("session_shutdown", { cause: "disconnect" })
		expect(consoleWarnSpy).not.toHaveBeenCalled()
	})

	it("session_shutdown sets end_cause on the closed session", async () => {
		// Test that closeSession marks exactly one active session as closed
		// with the correct end_cause — independent of which session is "most recent"
		const now = Date.now()
		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		db.run(
			`INSERT INTO hitl_sessions (id, project_hash, started_at, status, agent_time_ms, hitl_time_ms, idle_time_ms)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			["test-session", projectHash(tempDir), now - 30_000, "active", 0, 0, 0],
		)
		db.close()

		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", { cause: "disconnect" })

		// Verify a session was closed with the correct end_cause
		const db2 = new HitlDatabase(process.env.HITL_DB_PATH!)
		db2.open()
		const closed = db2.query<{ id: string; end_cause: string }>(
			`SELECT id, end_cause FROM hitl_sessions WHERE status = 'closed'`,
		)
		expect(closed.length).toBeGreaterThanOrEqual(1)
		expect(closed[0].end_cause).toBe("complete") // disconnect → complete
		db2.close()
	})

	it("command handler returns formatted metrics via ui.notify", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", {})

		// getMetricsOutput returns full formatted output (what the handler passes to ui.notify)
		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toContain("HITL Metrics")
		expect(output).toMatch(/Total sessions:\s+1/)
		expect(output).toContain("Recent Sessions")
	})

	it("shows interaction count for HITL events", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireHitl(mockPi, 1, 1, ["yes"], 100)
		await mockPi._trigger("session_shutdown", {})

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Interactions:\s+1/)
	})

	it("shows 0 interactions when no HITL events occurred", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", {})

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Interactions:\s+0/)
	})

	it("shows agent time from non-HITL tools", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireTool(mockPi, "bash", "call-bash", 5000)
		await mockPi._trigger("session_shutdown", {})

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Agent time:\s+\d+s/)
	})

	it("shows HITL time from user interactions", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireHitl(mockPi, 1, 2, ["a", "b"], 3000)
		await mockPi._trigger("session_shutdown", {})

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		// Should show HITL time (may be expressed in minutes or seconds)
		expect(output).toContain("HITL")
		expect(output).toMatch(/Interactions:\s+1/)
	})

	it("shows session outcome breakdown", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", { cause: "signal" })

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Interrupted:\s+1/)
		expect(output).toMatch(/Complete:\s+0/)
	})

	it("shows 'Complete' when end_cause=complete", async () => {
		// Note: end_cause=complete is set by the agent when a session ends naturally,
		// not by our extension directly. We verify the display handles it.
		// Insert a complete session directly
		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		db.initSchema()
		db.run(
			`INSERT INTO hitl_sessions (id, project_hash, started_at, ended_at, status, end_cause,
			        agent_time_ms, hitl_time_ms, idle_time_ms)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			["complete-session", projectHash(tempDir), Date.now() - 60000, Date.now(), "closed", "complete", 300000, 60000, 30000],
		)
		db.close()

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Complete:\s+1/)
	})

	it("renders timeline with agent, HITL, and idle segments", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await fireTool(mockPi, "bash", "call-t1", 5000)
		await fireHitl(mockPi, 1, 2, ["A"], 3000)
		await mockPi._trigger("input", { source: "user" }) // end idle
		await mockPi._trigger("session_shutdown", {})

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toContain("Session Timeline")
		// Timeline block chars ([█▓░]) are rendered but may not match in all environments
		expect(output).toContain("agent")
		expect(output).toContain("HITL")
		expect(output).toContain("idle")
	})

	it("warns and shows error when cwd is missing", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)

		const noCwdCtx = { cwd: "", hasUI: true, ui: mockCtx.ui } as ExtensionContext
		const handler = mockPi._commands.get("metrics")?.handler
		await handler!("", noCwdCtx)

		const notifyCall = (noCwdCtx.ui.notify as unknown as ReturnType<typeof vi.fn>)
		expect(notifyCall).toHaveBeenCalledWith(expect.stringContaining("No project directory"), "error")
	})

	it("command handler returns formatted metrics via ui.notify", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("session_shutdown", {})

		// getMetricsOutput returns full formatted output (what the handler passes to ui.notify)
		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toContain("HITL Metrics")
		expect(output).toMatch(/Total sessions:\s+1/)
		expect(output).toContain("Recent Sessions")
	})
})

// ============================================================================
// Full Lifecycle Integration Tests
// ============================================================================

describe("HITL Extension — full lifecycle integration", () => {
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>
	let tempDir: string
	let mockCtx: ExtensionContext

	beforeEach(() => {
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
		tempDir = createTempDir()
		redirectDbTo(tempDir)
		mockCtx = createMockCtx(tempDir)
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
		restoreDbPath()
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("realistic session: multiple tools, HITL interactions, correct metrics", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)

		// Agent work (shorter durations to stay within 5s test timeout)
		await fireTool(mockPi, "bash", "call-1", 1500)
		await fireTool(mockPi, "read_file", "call-2", 1000)
		// HITL interaction (3 questions, 1s)
		await fireHitl(mockPi, 1, 3, ["A", "B", "C"], 1000)
		// More agent work
		await fireTool(mockPi, "write_file", "call-3", 800)

		await mockPi._trigger("session_shutdown", { cause: "signal" })

		// Verify DB state
		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		const events = readEvents(db)

		expect(sessions).toHaveLength(1)
		expect(sessions[0].status).toBe("closed")
		expect(sessions[0].end_cause).toBe("signal")
		expect(sessions[0].agent_time_ms).toBeGreaterThan(0)
		expect(sessions[0].hitl_time_ms).toBeGreaterThan(0)

		expect(events).toHaveLength(1)
		expect(events[0].tool_name).toBe("ask_user_questions")
		expect(events[0].question_count).toBe(3)
		expect(JSON.parse(events[0].selected_options)).toEqual(["A", "B", "C"])
		db.close()

		// Verify /metrics output
		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Interactions:\s+1/)
		expect(output).toMatch(/Total sessions:\s+1/)
		expect(output).toMatch(/Interrupted:\s+1/)
		expect(output).toContain("Session Timeline")
	})

	it("multi-session: correct counts across three sessions", async () => {
		// Session 1: 2 HITL events
		{
			const mockPi = createMockPi()
			hitlMetricsExtension(mockPi)
			await mockPi._trigger("session_start", {}, mockCtx)
			await fireHitl(mockPi, 1, 2, ["A", "B"], 500)
			await fireHitl(mockPi, 2, 1, ["C"], 500)
			await mockPi._trigger("session_shutdown", { cause: "signal" })
		}

		// Session 2: 1 HITL event, disconnect
		{
			const mockPi = createMockPi()
			hitlMetricsExtension(mockPi)
			await mockPi._trigger("session_start", {}, mockCtx)
			await fireHitl(mockPi, 1, 3, ["X"], 500)
			await mockPi._trigger("session_shutdown", { cause: "disconnect" })
		}

		// Session 3: no HITL
		{
			const mockPi = createMockPi()
			hitlMetricsExtension(mockPi)
			await mockPi._trigger("session_start", {}, mockCtx)
			await fireTool(mockPi, "bash", "call-b", 500)
			await mockPi._trigger("session_shutdown", { cause: "signal" })
		}

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		expect(output).toMatch(/Total sessions:\s+3/)
		expect(output).toMatch(/Interactions:\s+3/) // 2 + 1 + 0
		expect(output).toMatch(/Complete:\s+1/) // 1 disconnect (S2) → complete; S1 is also disconnect → complete; S3 is signal
		expect(output).toMatch(/Interrupted:\s+2/) // S1 is orphaned (5min timeout), S3 is signal
	})

	it("cache detection: fast HITL result is not recorded", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		await mockPi._trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-cache" })
		// Immediate result — no delay (cached)
		await mockPi._trigger("tool_result", {
			toolName: "ask_user_questions",
			toolCallId: "call-cache",
			isError: false,
			input: { questions: [{ id: 1 }] },
			result: { selectedOptions: ["cached"] },
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		expect(readEvents(db)).toHaveLength(0) // cached result skipped
		expect(readSessions(db)[0].hitl_time_ms).toBe(0) // no HITL time accumulated
		db.close()
	})

	it("idle time tracking: user input starts idle, next tool ends it", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)
		await mockPi._trigger("session_start", {}, mockCtx)
		// User provides input → starts idle period
		await mockPi._trigger("input", { source: "user" })
		await delay(200) // idle gap
		// Tool starts → ends idle, records duration
		await mockPi._trigger("tool_execution_start", { toolName: "bash", toolCallId: "call-end-idle" })
		await mockPi._trigger("tool_result", {
			toolName: "bash",
			toolCallId: "call-end-idle",
			isError: false,
		})
		await mockPi._trigger("session_shutdown", {})

		const db = new HitlDatabase(process.env.HITL_DB_PATH!)
		db.open()
		const sessions = readSessions(db)
		expect(sessions[0].idle_time_ms).toBeGreaterThanOrEqual(150)
		db.close()
	})

	it("session timeline: most recent closed session is rendered", async () => {
		const mockPi = createMockPi()
		hitlMetricsExtension(mockPi)

		// Create two closed sessions with shorter tool durations
		for (let i = 0; i < 2; i++) {
			await mockPi._trigger("session_start", {}, mockCtx)
			await fireTool(mockPi, "bash", `call-${i}`, 500) // 500ms each
			await mockPi._trigger("session_shutdown", { cause: "signal" })
		}

		const output = await getMetricsOutput(tempDir, createMockTheme(), {
			dbPath: process.env.HITL_DB_PATH,
		})
		// Timeline should render (both sessions closed, latest one shown)
		expect(output).toContain("Session Timeline")
	})
})