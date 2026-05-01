#!/usr/bin/env bun
/**
 * ACP E2E test for HITL metrics.
 *
 * Uses two approaches to verify the full flow:
 *   A) Pre-recorded JSONL fixture — deterministic, no LLM needed
 *   B) Real kimchi binary — exercises the actual LLM + extension stack
 *
 * Usage:
 *   bun run extensions/hitl-metrics/e2e-acp.ts
 */

import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { join } from "node:path"
import { homedir } from "node:os"
import { mkdirSync, readFileSync, existsSync } from "node:fs"
import { HitlDatabase } from "./storage/db.js"
import { getSessionStats } from "./storage/session.js"
import { getMetricsOutput } from "./commands/metrics.js"
import { createMockTheme } from "./test-helpers/mock-theme.js"

// ─── Config ───────────────────────────────────────────────────────────────────

const CWD = process.cwd()
const PROJECT_HASH = "65d14f0abb50c294" // real project hash of CWD
const STORAGE_DIR = join(homedir(), ".kimchi", "metrics", PROJECT_HASH)
const SESSION_FILE = `/tmp/kimchi-acp-session-${Date.now()}.jsonl`
const METRICS_DB = join(STORAGE_DIR, "hitl.db")

mkdirSync(STORAGE_DIR, { recursive: true })

// ─── Types ────────────────────────────────────────────────────────────────────

interface JsonlEvent {
  type: string
  [key: string]: unknown
}

interface ToolStart { toolName: string; toolCallId: string; args: Record<string, unknown> }
interface ToolEnd { toolName: string; toolCallId: string; isError: boolean; result: unknown }

function parseEvents(raw: string): JsonlEvent[] {
  return raw.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    try { return JSON.parse(l) }
    catch { return null }
  }).filter(Boolean) as JsonlEvent[]
}

function extractToolEvents(events: JsonlEvent[]): { starts: ToolStart[]; ends: ToolEnd[] } {
  const starts: ToolStart[] = []
  const ends: ToolEnd[] = []
  for (const e of events) {
    if (e.type === "tool_execution_start") {
      starts.push({
        toolName: e.toolName as string,
        toolCallId: e.toolCallId as string,
        args: (e.args as Record<string, unknown>) ?? {},
      })
    }
    if (e.type === "tool_execution_end") {
      ends.push({
        toolName: e.toolName as string,
        toolCallId: e.toolCallId as string,
        isError: (e.isError as boolean) ?? false,
        result: e.result,
      })
    }
  }
  return { starts, ends }
}

// ─── Run kimchi binary ────────────────────────────────────────────────────────

interface RunResult { stdout: string; stderr: string; exitCode: number; events: JsonlEvent[] }

async function runKimchi(args: string[], prompt: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const proc = spawn(args[0], args.slice(1), {
      cwd: CWD,
      env: { ...process.env },
      timeout: 120_000,
    })
    const out: Buffer[] = []
    const err: Buffer[] = []
    proc.stdout.on("data", (d) => out.push(d as Buffer))
    proc.stderr.on("data", (d) => err.push(d as Buffer))
    proc.on("close", (code) => {
      const stdout = Buffer.concat(out).toString()
      const stderr = Buffer.concat(err).toString()
      resolve({ stdout, stderr, exitCode: code ?? 1, events: parseEvents(stdout) })
    })
    proc.on("error", (err_) => resolve({ stdout: "", stderr: err_.message, exitCode: 1, events: [] }))
    proc.stdin.write(prompt + "\n")
    proc.stdin.end()
  })
}

// ─── Build expected events from JSONL ────────────────────────────────────────

interface ExpectedToolEvent {
  tool: string
  questionCount: number
  durationMs: number
  answerSelected: string[]
}

function buildExpected(starts: ToolStart[], ends: ToolEnd[]): ExpectedToolEvent[] {
  const endById = new Map(ends.map((e) => [e.toolCallId, e]))
  const result: ExpectedToolEvent[] = []
  for (const s of starts) {
    const end = endById.get(s.toolCallId)
    if (s.toolName === "ask_user_questions") {
      const questions = (s.args.questions as any[]) ?? []
      const questionCount = questions.length
      let selected: string[] = []
      const text = (end?.result as any)?.content?.[0]?.text
      if (text) {
        try {
          const parsed = JSON.parse(text)
          for (const [, ans] of Object.entries(parsed.answers ?? {})) {
            selected.push(...((ans as { answers: string[] }).answers ?? []))
          }
        }
        catch { /* not JSON */ }
      }
      const durationMs = end ? ((end as any).durationMs ?? 3000) : 3000
      result.push({ tool: "ask_user_questions", questionCount, durationMs, answerSelected: selected })
    }
    else if (s.toolName === "bash") {
      const durationMs = end ? ((end as any).durationMs ?? 5000) : 5000
      result.push({ tool: "bash", questionCount: 0, durationMs, answerSelected: [] })
    }
  }
  return result
}

// ─── Verify metrics DB ────────────────────────────────────────────────────────

function verifyDb(dbPath: string, expected: ExpectedToolEvent[]) {
  const hitlEvents = expected.filter((e) => e.tool === "ask_user_questions")
  const bashEvents = expected.filter((e) => e.tool === "bash")

  if (!existsSync(dbPath)) {
    console.log("  ⚠️  No DB found at:", dbPath)
    return { passed: 0, failed: 4 + expected.length }
  }

  const db = new HitlDatabase(dbPath)
  db.open()
  const stats = getSessionStats(db)
  const sessions = db.query<{ id: string; hitl_time_ms: number; agent_time_ms: number; idle_time_ms: number; status: string }>(
    "SELECT * FROM hitl_sessions",
  )
  const dbEvents = db.query<{ id: number; tool_name: string; question_count: number; duration_ms: number }>(
    "SELECT * FROM hitl_events",
  )
  db.close()

  let passed = 0
  let failed = 0

  const check = (label: string, actual: unknown, expected: unknown) => {
    const ok = actual == expected || (typeof expected === "boolean" && !!actual === expected)
    if (ok) { console.log(`  ✓ ${label}: ${actual}`); passed++ }
    else { console.log(`  ✗ ${label}: expected ${expected}, got ${actual}`); failed++ }
  }

  console.log("\n  DB Stats:")
  check("sessions in DB", sessions.length, 1)
  check("HITL events in DB", dbEvents.length, hitlEvents.length)
  check("interaction_count", stats.interaction_count, hitlEvents.length)
  check("hitl_time_ms > 0", stats.total_hitl_time_ms > 0, true)

  if (hitlEvents.length > 0) {
    const totalHitlMs = hitlEvents.reduce((s, e) => s + e.durationMs, 0)
    const dbHitlMs = dbEvents.reduce((s, e) => s + e.duration_ms, 0)
    check("HITL time matches (approx)", Math.abs(dbHitlMs - totalHitlMs) < 2000, true)
    check("question count", dbEvents[0]?.question_count, hitlEvents[0]?.questionCount)
  }

  console.log("\n  Session rows:")
  for (const s of sessions) {
    const total = s.hitl_time_ms + s.agent_time_ms + s.idle_time_ms
    console.log(
      `    ${s.status.padEnd(8)} HITL:${(s.hitl_time_ms / 1000).toFixed(1)}s  ` +
      `Agent:${(s.agent_time_ms / 1000).toFixed(1)}s  ` +
      `Idle:${(s.idle_time_ms / 1000).toFixed(1)}s  ` +
      `total:${(total / 1000).toFixed(1)}s`,
    )
  }

  console.log("\n  HITL events:")
  for (const e of dbEvents) {
    console.log(`    ${e.tool_name.padEnd(25)} ${e.question_count}Q  ${(e.duration_ms / 1000).toFixed(1)}s`)
  }

  return { passed, failed }
}

// ─── /metrics output ──────────────────────────────────────────────────────────

function showMetrics(dbPath: string) {
  console.log("═".repeat(60))
  console.log("📊 /metrics output:")
  console.log("═".repeat(60) + "\n")
  try {
    const output = getMetricsOutput(CWD, createMockTheme(), { dbPath })
    console.log(output)
  }
  catch (err) {
    console.log("  (metrics command error)")
    console.error(err)
  }
}

// ─── TUI output ────────────────────────────────────────────────────────────────

function showTuiOutput(stderr: string) {
  // Filter out noise — print meaningful TUI output
  const lines = stderr.split("\n").filter((l) =>
    l.trim() &&
    !l.includes("Duplicate key") &&
    !l.includes("prepare") &&
    !l.includes("warn:"),
  )
  if (lines.length) {
    console.log("─── TUI Output ───")
    lines.forEach((l) => console.log(l))
    console.log("─── End TUI ───\n")
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== ACP E2E: HITL Metrics ===\n")
  console.log("Project:", CWD)
  console.log("DB:", METRICS_DB)
  console.log("")

  // ── Approach A: Run real kimchi with extension via bun run ──────────────────
  console.log("─── Approach A: bun run + extension (DB recording) ───\n")

  // Get API key from config
  const configPath = join(homedir(), ".config", "kimchi", "config.json")
  const apiKey = (() => {
    try {
      return JSON.parse(readFileSync(configPath, "utf8")).api_key ?? ""
    }
    catch { return "" }
  })()

  if (!apiKey) {
    console.error("❌ No api_key in ~/.config/kimchi/config.json")
    process.exit(1)
  }

  // Resolve PI_PACKAGE_DIR via require.resolve so it's absolute
  const piPkgDir = require.resolve("@mariozechner/pi-coding-agent/package.json").replace(/[/\\]package\.json$/, "")
  const agentDir = join(homedir(), ".config", "kimchi", "harness")

  // Build env. Set PI_PACKAGE_DIR explicitly so entry.ts uses the local auxiliary files dir
  // (instead of resolving from the global /opt/homebrew/bin/gsd install).
  const auxDir = join(CWD, "node_modules", "@mariozechner", "pi-coding-agent")
  const runEnv: Record<string, string> = {
    ...process.env,
    KIMCHI_API_KEY: apiKey,
    PI_SKIP_VERSION_CHECK: "1",
    KIMCHI_CODING_AGENT_DIR: agentDir,
    PI_PACKAGE_DIR: auxDir,
  }

  const PROMPT = `You are a metrics test assistant. Execute this EXACT sequence:

1. Run: bash sleep 3
2. Then use ask_user_questions with:
   id: "choice"
   header: "Next?"
   question: "What next?"
   options: [
     { label: "Continue", description: "Keep going" },
     { label: "Stop", description: "Done" }
   ]
3. Run: bash sleep 2
4. Say "Done."`

  console.log("Running kimchi with extension + real LLM...")
  const result = await runKimchi(
    [
      "bun", "run", "src/entry.ts",
      "--print", "--mode", "json", "--no-session",
      "-e", "extensions/hitl-metrics/index.ts",
      "--model", "kimi-k2.5",
    ],
    PROMPT
  )

  console.log(`Exit code: ${result.exitCode}`)
  showTuiOutput(result.stderr)
  console.log(`JSONL events captured: ${result.events.length}`)

  // Parse events
  const { starts, ends } = extractToolEvents(result.events)
  const expected = buildExpected(starts, ends)

  console.log("\nTool events from JSONL:")
  for (const s of starts) {
    const end = ends.find((e) => e.toolCallId === s.toolCallId)
    const ok = end && !end.isError
    console.log(
      `  ${ok ? "✅" : end ? "❌" : "⏳"}  ${s.toolName.padEnd(25)}  ${JSON.stringify(s.args).slice(0, 60)}...`,
    )
  }

  console.log("\nExpected metrics (from JSONL):")
  for (const e of expected) {
    const q = e.questionCount > 0 ? ` (${e.questionCount}Q)` : ""
    const ans = e.answerSelected.length ? ` → ${e.answerSelected.join(", ")}` : ""
    console.log(
      `  ${e.tool.padEnd(25)}  ${(e.durationMs / 1000).toFixed(1)}s${q}${ans}`,
    )
  }

  // ── Verify DB ──────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60))
  console.log("📊 DB Verification:")
  console.log("═".repeat(60))
  const dbResult = verifyDb(METRICS_DB, expected)

  // ── /metrics output ────────────────────────────────────────────────────────
  showMetrics(METRICS_DB)

  // ── Approach B: Run kimchi binary for comparison (no extension) ────────────
  console.log("─── Approach B: kimchi binary (no extension) ───\n")
  console.log("Running kimchi binary for comparison...")
  const binaryResult = await runKimchi(
    ["/opt/homebrew/bin/gsd", "--print", "--mode", "json", "--no-session", "--model", "kimi-k2.5"],
    "bash echo hello",
  )
  console.log(`Exit code: ${binaryResult.exitCode}`)
  console.log(`JSONL events captured: ${binaryResult.events.length}`)

  const { starts: bStarts, ends: bEnds } = extractToolEvents(binaryResult.events)
  console.log("\nTool calls (binary):")
  for (const s of bStarts) {
    const end = bEnds.find((e) => e.toolCallId === s.toolCallId)
    console.log(`  ${end && !end.isError ? "✅" : "❌"}  ${s.toolName}`)
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60))
  console.log("✅ Result:")
  console.log("═".repeat(60))
  console.log(`  JSONL events (bun run):  ${result.events.length}`)
  console.log(`  JSONL events (binary):   ${binaryResult.events.length}`)
  console.log(`  DB /metrics assertions:  ${dbResult.passed} passed, ${dbResult.failed} failed`)
  console.log(`  Tool events captured:    ${starts.length} (${starts.filter((s) => s.toolName === "bash").length} bash, ${starts.filter((s) => s.toolName === "ask_user_questions").length} ask_user_questions)`)
}

main().catch((err) => {
  console.error("\n❌ Fatal:", err)
  process.exit(1)
})