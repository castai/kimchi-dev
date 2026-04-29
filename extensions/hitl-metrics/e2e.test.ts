/**
 * HITL Metrics End-to-End Tests
 *
 * Exercises the full extension event path: session_start → recordEvent
 * → DB write → getMetricsOutput → verify non-zero data.
 *
 * Key insight: SessionManager stores data at ~/.kimchi/metrics/<hash>/hitl.db
 * (where hash = projectHash(tempDir)), NOT inside tempDir itself.
 * getMetricsOutput must use the same path.
 */

import { describe, it, expect } from "vitest"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir, homedir } from "node:os"
import { join } from "node:path"
import { getMetricsOutput } from "./commands/metrics.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"
import { SessionManager } from "./session-manager.js"
import { projectHash } from "./storage/index.js"

const STORAGE_DIR = join(homedir(), ".kimchi", "metrics")

function createTempDir(): string {
	return mkdtempSync(join(tmpdir(), "hitl-e2e-"))
}

function storageDbPath(tempDir: string): string {
	return join(STORAGE_DIR, projectHash(tempDir), "hitl.db")
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function cleanup(dir: string): void {
	try { rmSync(dir, { recursive: true, force: true }) } catch {}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("HITL Metrics E2E — DB write/read cycle", () => {
	it("recordEvent writes to DB and getMetricsOutput reads non-zero values", async () => {
		const tempDir = createTempDir()
		const dbPath = storageDbPath(tempDir)

		// Write: create session + record 3 HITL events
		const manager = new SessionManager()
		manager.init(tempDir)
		const session = manager.getSession()
		expect(session).not.toBeNull()
		expect(session!.status).toBe("active")

		await sleep(10)
		manager.recordEvent("ask_user_questions", 2, 500, ["A", "B"])
		await sleep(10)
		manager.recordEvent("ask_user_questions", 1, 300, ["C"])
		await sleep(10)
		manager.recordEvent("ask_user_questions", 3, 800, ["X", "Y", "Z"])
		manager.close()

		// Read: use same dbPath that SessionManager used
		const output = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output).toContain("HITL Metrics")
		expect(output).toMatch(/Total sessions:\s+1/)
		expect(output).toMatch(/Interactions:\s+([1-9]\d*)/)
		expect(output).toMatch(/Total HITL time:\s+(?!0s\b)\d/)
		expect(output).toMatch(/Complete:\s+1/)

		cleanup(tempDir)
	})

	it("multiple manager invocations accumulate sessions and interactions", async () => {
		const tempDir = createTempDir()
		const dbPath = storageDbPath(tempDir)

		// Session 1: 2 events
		{
			const m = new SessionManager()
			m.init(tempDir)
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 200, ["A"])
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 150, ["B"])
			m.close()
		}

		// Session 2: 1 event
		{
			await sleep(10)
			const m = new SessionManager()
			m.init(tempDir)
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 150, ["C"])
			m.close()
		}

		// Session 3: 3 events
		{
			await sleep(10)
			const m = new SessionManager()
			m.init(tempDir)
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 100, ["D"])
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 100, ["E"])
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 100, ["F"])
			m.close()
		}

		const output = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output).toMatch(/Total sessions:\s+3/)
		expect(output).toMatch(/Interactions:\s+6/) // 2 + 1 + 3
		expect(output).toMatch(/Complete:\s+3/)
		expect(output).toMatch(/Interrupted:\s+0/)

		cleanup(tempDir)
	})

	it("data persists across manager restart cycles", async () => {
		const tempDir = createTempDir()
		const dbPath = storageDbPath(tempDir)

		// Session 1: 1 event
		{
			const m = new SessionManager()
			m.init(tempDir)
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 200, ["Yes"])
			m.close()
		}

		// Verify session 1
		const output1 = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output1).toMatch(/Total sessions:\s+1/)
		expect(output1).toMatch(/Interactions:\s+1/)

		// Session 2: 2 events (must be BEFORE close)
		{
			await sleep(10)
			const m = new SessionManager()
			m.init(tempDir)
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 300, ["A"])
			await sleep(10)
			m.recordEvent("ask_user_questions", 1, 300, ["B"])
			m.close()
		}

		// Verify accumulated: 1 + 2 = 3 interactions
		const output2 = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output2).toMatch(/Total sessions:\s+2/)
		expect(output2).toMatch(/Interactions:\s+3/)

		cleanup(tempDir)
	})

	it("realistic session with agent + HITL phases renders timeline", async () => {
		const tempDir = createTempDir()
		const dbPath = storageDbPath(tempDir)

		const manager = new SessionManager()
		manager.init(tempDir)

		// Agent work
		manager.recordStartTime("call-1")
		await sleep(100)
		manager.recordStartTime("call-2")
		await sleep(100)

		// HITL interaction 1
		manager.recordStartTime("call-hitl-1")
		await sleep(100)
		manager.recordEvent("ask_user_questions", 2, 1500, ["Option A", "Option B"])
		await sleep(100)

		// More agent work
		manager.recordStartTime("call-3")
		await sleep(100)

		// HITL interaction 2
		manager.recordStartTime("call-hitl-2")
		await sleep(100)
		manager.recordEvent("ask_user_questions", 1, 600, ["Yes"])

		manager.close()

		const output = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output).toMatch(/Interactions:\s+2/)
		expect(output).toContain("Session Timeline")
		expect(output).toContain("agent")
		expect(output).toContain("HITL")

		cleanup(tempDir)
	})

	it("empty DB produces valid output without crashing", async () => {
		const tempDir = createTempDir()
		const dbPath = storageDbPath(tempDir)

		// Create manager but don't close — session stays active
		const manager = new SessionManager()
		manager.init(tempDir)

		const output = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
		expect(output).toContain("HITL Metrics")
		// 1 active session, 0 interactions
		expect(output).toMatch(/Total sessions:\s+1/)
		expect(output).toMatch(/Interactions:\s+0/)

		cleanup(tempDir)
	})
})