// Smoke test for subagent session tracking (PRD: prd/subagent-session-tracking.md).
// Exercises the end-to-end path that unit tests can't reach: a real kimchi run
// spawns a real subagent subprocess, and the parent and child session files
// must land side-by-side on disk with the correct linkage.

import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { runBinary } from "./harness.js"

if (!process.env.KIMCHI_API_KEY) {
	console.warn("[smoke] KIMCHI_API_KEY not set — subagent-session-tracking smoke test will be skipped.")
}

interface SubagentDetails {
	sessionId?: string
	sessionFile?: string
	tokenUsage?: unknown
	durationMs?: number
}

interface SessionEntry {
	type: string
	message?: { role?: string; toolCallId?: string; details?: unknown }
}

function readJsonl<T = SessionEntry>(path: string): T[] {
	return readFileSync(path, "utf-8")
		.split("\n")
		.filter((l) => l.trim().length > 0)
		.map((l) => JSON.parse(l) as T)
}

describe("subagent session tracking smoke tests", () => {
	let sessionDir: string

	beforeEach(() => {
		sessionDir = mkdtempSync(join(tmpdir(), "kimchi-subagent-session-"))
	})

	afterEach(() => {
		rmSync(sessionDir, { recursive: true, force: true })
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"subagent run leaves a child session file with a header that back-references the parent, and the parent's tool-result records the child's id and path",
		{ timeout: 60_000, retry: 1 },
		() => {
			const prompt = [
				"Use the `subagent` tool exactly once with these arguments:",
				'- provider: "kimchi-dev"',
				'- model: "kimi-k2.5"',
				'- prompt: "Reply with only the single word: OK"',
				"",
				"After it returns, echo the subagent's reply verbatim as your final answer and nothing else.",
			].join("\n")

			runBinary({
				args: ["--session-dir", sessionDir, "-p", prompt],
				extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
				timeoutMs: 55_000,
			})

			// Expect at least 2 session files: one parent, one child. In-memory aux files (like lock files) can bring more; we just need ≥ 2.
			const files = readdirSync(sessionDir).filter((f) => f.endsWith(".jsonl"))
			expect(files.length, "expected parent + child session files in the custom --session-dir").toBeGreaterThanOrEqual(
				2,
			)

			const sessionsByHeader = new Map<
				string,
				{ file: string; header: { id?: string; parentSession?: string }; entries: SessionEntry[] }
			>()
			for (const name of files) {
				const full = join(sessionDir, name)
				const entries = readJsonl(full)
				const header = entries[0] as unknown as { id?: string; parentSession?: string; type?: string }
				if (header?.type !== "session") continue
				sessionsByHeader.set(name, { file: full, header, entries })
			}

			const parent = [...sessionsByHeader.values()].find((s) => !s.header.parentSession)
			const child = [...sessionsByHeader.values()].find((s) => s.header.parentSession !== undefined)
			expect(parent, "parent session file (no parentSession header) should exist").toBeDefined()
			expect(child, "child session file (with parentSession header) should exist").toBeDefined()

			// Header linkage: child → parent.
			expect(child?.header.parentSession).toBe(parent?.file)

			// Parent → child linkage: the parent session log should carry a tool-result entry with SubagentStats.details referencing the child.
			const toolResult = parent?.entries.find(
				(e) =>
					e.type === "message" &&
					e.message?.role === "toolResult" &&
					(e.message.details as SubagentDetails | undefined)?.sessionFile !== undefined,
			)
			expect(
				toolResult,
				"parent session should contain a subagent tool-result with sessionFile populated",
			).toBeDefined()
			const details = toolResult?.message?.details as SubagentDetails
			expect(details.sessionId).toBe(child?.header.id)
			expect(details.sessionFile).toBe(child?.file)

			// Retention: removing the parent session dir removes the child (same dir, by D3/D5).
			const childPath = child?.file
			rmSync(sessionDir, { recursive: true, force: true })
			expect(() => statSync(childPath as string)).toThrow()
		},
	)

	// Phase 5: a subagent that itself spawns a further subagent must land its grandchild in the top-level parent's session directory, with a back-reference chain grandchild → child → parent intact. This is load-bearing for pi's session-selector tree rendering at depth > 1 and for the billing walk convention — neither works if descendants scatter across directories.
	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"nested subagent runs keep all descendants in the top-level parent's directory with an intact back-reference chain",
		{ timeout: 120_000, retry: 1 },
		() => {
			const prompt = [
				"Use the `subagent` tool exactly once with these arguments:",
				'- provider: "kimchi-dev"',
				'- model: "kimi-k2.5"',
				"- prompt: (multi-line, copy verbatim)",
				'    """',
				"    Use the `subagent` tool exactly once with these arguments:",
				'    - provider: "kimchi-dev"',
				'    - model: "kimi-k2.5"',
				'    - prompt: "Reply with only the single word: OK"',
				"",
				"    After it returns, echo the subagent's reply verbatim as your final answer and nothing else.",
				'    """',
				"",
				"After it returns, echo the subagent's reply verbatim as your final answer and nothing else.",
			].join("\n")

			runBinary({
				args: ["--session-dir", sessionDir, "-p", prompt],
				extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
				timeoutMs: 110_000,
			})

			// Expect ≥ 3 session files: parent, child, grandchild — all as siblings in the top-level parent dir.
			const files = readdirSync(sessionDir).filter((f) => f.endsWith(".jsonl"))
			expect(
				files.length,
				"expected parent + child + grandchild session files in the top-level --session-dir",
			).toBeGreaterThanOrEqual(3)

			const sessionsByFile = new Map<
				string,
				{ file: string; header: { id?: string; parentSession?: string }; entries: SessionEntry[] }
			>()
			for (const name of files) {
				const full = join(sessionDir, name)
				const entries = readJsonl(full)
				const header = entries[0] as unknown as { id?: string; parentSession?: string; type?: string }
				if (header?.type !== "session") continue
				sessionsByFile.set(full, { file: full, header, entries })
			}

			const parent = [...sessionsByFile.values()].find((s) => !s.header.parentSession)
			expect(parent, "top-level parent session (no parentSession header) should exist").toBeDefined()

			// Walk the chain: parent → child → grandchild via `parentSession` headers.
			const child = [...sessionsByFile.values()].find((s) => s.header.parentSession === parent?.file)
			expect(child, "child session back-referencing the parent should exist").toBeDefined()

			const grandchild = [...sessionsByFile.values()].find((s) => s.header.parentSession === child?.file)
			expect(grandchild, "grandchild session back-referencing the child should exist").toBeDefined()

			// All three must share the same directory — required for pi's non-recursive session-selector tree to render the full chain.
			expect(child?.file.startsWith(`${sessionDir}/`)).toBe(true)
			expect(grandchild?.file.startsWith(`${sessionDir}/`)).toBe(true)

			// Forward linkage: each level's tool-result must point at the next level's session file/id.
			const parentToolResult = parent?.entries.find(
				(e) =>
					e.type === "message" &&
					e.message?.role === "toolResult" &&
					(e.message.details as SubagentDetails | undefined)?.sessionFile === child?.file,
			)
			expect(parentToolResult, "parent tool-result should reference child.sessionFile").toBeDefined()
			expect((parentToolResult?.message?.details as SubagentDetails).sessionId).toBe(child?.header.id)

			const childToolResult = child?.entries.find(
				(e) =>
					e.type === "message" &&
					e.message?.role === "toolResult" &&
					(e.message.details as SubagentDetails | undefined)?.sessionFile === grandchild?.file,
			)
			expect(childToolResult, "child tool-result should reference grandchild.sessionFile").toBeDefined()
			expect((childToolResult?.message?.details as SubagentDetails).sessionId).toBe(grandchild?.header.id)
		},
	)
})
