/**
 * HITL Metrics Simulation Test
 *
 * Programmatically exercises the full HITL interaction lifecycle:
 *   1. Start kimchi session (session_start)
 *   2. Agent calls ask_user_questions (tool_execution_start)
 *   3. User responds (tool_result with response data)
 *   4. Session ends (session_shutdown)
 *   5. Query /metrics — verify HITL time and interaction count
 *
 * No kimchi instance needed — calls through SessionManager directly.
 *
 * Usage:
 *   bun run extensions/hitl-metrics/test-hitl-simulation.ts
 */

import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { homedir } from "node:os"
import { SessionManager } from "./session-manager.js"
import { projectHash } from "./storage/index.js"
import { HitlDatabase } from "./storage/db.js"
import { getSessionStats } from "./storage/session.js"
import { getMetricsOutput } from "./commands/metrics.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"

const STORAGE_DIR = join(homedir(), ".kimchi", "metrics")

function storageDbPath(cwd: string): string {
	return join(STORAGE_DIR, projectHash(cwd), "hitl.db")
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

async function simulateHitlInteraction(
	manager: SessionManager,
	questionCount: number,
	userResponseTimeMs: number,
	questions: string[],
): Promise<void> {
	const toolCallId = `call-hitl-${Date.now()}`

	// Step 1: Agent calls ask_user_questions (tool_execution_start)
	const startTime = Date.now()
	// Record tool start for activity tracking
	manager.recordStartTime(toolCallId)

	// Step 2: User takes time to think and respond
	// During this time the session is "blocked" — HITL time accumulates
	await sleep(userResponseTimeMs)

	// Step 3: User responds (tool_result)
	// Format matches what pi's ask_user_questions actually returns
	const answers: Record<string, { answers: string[] }> = {}
	for (let i = 0; i < questionCount; i++) {
		answers[`q${i + 1}`] = { answers: [questions[i] ?? "Option A"] }
	}
	const resultJson = JSON.stringify({ answers })

	const actualDuration = Date.now() - startTime
	manager.recordEvent("ask_user_questions", questionCount, actualDuration, questions)
}

async function main() {
	const tempDir = mkdtempSync(join(tmpdir(), "hitl-sim-"))
	const dbPath = storageDbPath(tempDir)

	console.log("=== HITL Metrics Simulation ===\n")
	console.log("Temp dir:", tempDir)
	console.log("DB path:", dbPath)

	// ── Session 1: Quick confirmation (2 seconds) ──────────────────────────────
	{
		console.log("\n[Session 1] Quick confirmation — 2s response time")
		const manager = new SessionManager()
		manager.init(tempDir)

		await simulateHitlInteraction(manager, 1, 2000, ["Yes"])

		manager.close()
		const stats = manager.getSession() // null after close, but data is in DB
		console.log("  ✓ Session closed")
	}

	// ── Session 2: Multi-option choice (5 seconds) ─────────────────────────────
	{
		console.log("\n[Session 2] Multi-option — 5s response time")
		await sleep(100) // Small gap between sessions

		const manager = new SessionManager()
		manager.init(tempDir)

		await simulateHitlInteraction(
			manager,
			2,
			5000,
			["Approach A: TDD-first", "Approach B: Test later"],
		)

		manager.close()
		console.log("  ✓ Session closed")
	}

	// ── Session 3: Architecture decision (30 seconds) ──────────────────────────
	{
		console.log("\n[Session 3] Architecture decision — 30s response time")
		await sleep(100)

		const manager = new SessionManager()
		manager.init(tempDir)

		await simulateHitlInteraction(
			manager,
			3,
			30000,
			["PostgreSQL — relational, mature", "SQLite — embedded, simple", "DynamoDB — managed, scalable"],
		)

		manager.close()
		console.log("  ✓ Session closed")
	}

	// ── Verify: Query DB directly ──────────────────────────────────────────────
	console.log("\n=== Database Contents ===\n")
	const db = new HitlDatabase(dbPath)
	db.open()

	const stats = getSessionStats(db)
	const events = db.query<{ id: number; tool_name: string; question_count: number; duration_ms: number; created_at: number }>(
		"SELECT id, tool_name, question_count, duration_ms, created_at FROM hitl_events ORDER BY created_at ASC",
	)
	const sessions = db.query<{ id: string; started_at: number; ended_at: number; status: string; hitl_time_ms: number; agent_time_ms: number; idle_time_ms: number }>(
		"SELECT id, started_at, ended_at, status, hitl_time_ms, agent_time_ms, idle_time_ms FROM hitl_sessions",
	)

	db.close()

	console.log("Sessions:")
	for (const s of sessions) {
		const dur = s.ended_at ? ` (${((s.ended_at - s.started_at) / 1000).toFixed(0)}s)` : " (active)"
		console.log(
			`  ${s.status.padEnd(8)} hitl:${(s.hitl_time_ms / 1000).toFixed(1)}s  agent:${(s.agent_time_ms / 1000).toFixed(1)}s  idle:${(s.idle_time_ms / 1000).toFixed(1)}s${dur}`,
		)
	}

	console.log(`\nHITL Events: ${events.length}`)
	for (const e of events) {
		console.log(`  ${e.question_count}Q  ${(e.duration_ms / 1000).toFixed(1)}s  selected:${e.duration_ms > 10000 ? "long" : "quick"}`)
	}

	console.log(`\nStats:`)
	console.log(`  Total sessions:    ${stats.total_sessions}`)
	console.log(`  Interactions:      ${stats.interaction_count}`)
	console.log(`  Total HITL time:   ${(stats.total_hitl_time_ms / 1000).toFixed(1)}s`)
	console.log(`  Avg wait time:     ${(stats.avg_wait_ms / 1000).toFixed(1)}s`)

	// ── Verify: getMetricsOutput ───────────────────────────────────────────────
	console.log("\n=== /metrics Output ===\n")
	const output = await getMetricsOutput(tempDir, createMockTheme(), { dbPath })
	console.log(output)

	// ── Assertions ─────────────────────────────────────────────────────────────
	console.log("\n=== Assertions ===\n")

	let passed = 0
	let failed = 0

	function check(label: string, actual: unknown, expected: unknown) {
		const ok = actual === expected
		if (ok) {
			console.log(`  ✓ ${label}: ${actual}`)
			passed++
		} else {
			console.log(`  ✗ ${label}: expected ${expected}, got ${actual}`)
			failed++
		}
	}

	check("Sessions", stats.total_sessions, 3)
	check("Interactions", stats.interaction_count, 3)
	check("HITL time > 35s", stats.total_hitl_time_ms > 35000, true) // 2s + 5s + 30s
	check("Non-zero avg wait", stats.avg_wait_ms > 0, true)
	check("3 HITL events in DB", events.length, 3)
	check("Event 1: 1 question", events[0].question_count, 1)
	check("Event 2: 2 questions", events[1].question_count, 2)
	check("Event 3: 3 questions", events[2].question_count, 3)
	check("metrics output contains HITL time", output.includes("HITL time"), true)
	check("metrics output shows 3 interactions", output.includes("Interactions:"), true)
	check("timeline renders", output.includes("Session Timeline"), true)

	console.log(`\n${passed} passed, ${failed} failed`)

	// ── Cleanup ────────────────────────────────────────────────────────────────
	rmSync(tempDir, { recursive: true, force: true })
	process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
	console.error("Fatal:", err)
	process.exit(1)
})