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
})
