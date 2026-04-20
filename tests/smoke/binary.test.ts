import { constants, accessSync, copyFileSync, mkdtempSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { BINARY_PATH, runBinary } from "./harness.js"

describe("binary smoke tests", () => {
	it("binary exists and is executable", () => {
		accessSync(BINARY_PATH, constants.X_OK)
	})

	it("errors with meaningful message when KIMCHI_API_KEY is missing", () => {
		const result = runBinary({ throwOnError: false })
		expect(result.status).toBe(1)
		expect(result.stderr).toContain("No Kimchi API key found")
	})

	it("--version exits cleanly", () => {
		const result = runBinary({
			args: ["--version"],
			extraEnv: { KIMCHI_API_KEY: "smoke-test-dummy" },
		})
		expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/)
	})

	it("--help exits cleanly", () => {
		const result = runBinary({
			args: ["--help"],
			extraEnv: { KIMCHI_API_KEY: "smoke-test-dummy" },
		})
		expect(result.stdout).toContain("Usage")
	})

	it("prompt templates are embedded in binary (no extension errors on startup)", () => {
		const result = runBinary({
			args: ["-p", "hello"],
			extraEnv: { KIMCHI_API_KEY: "smoke-test-dummy" },
			throwOnError: false,
		})
		// The orchestration extension fires "input" and "before_agent_start" events, triggering template loading. If templates are missing from the compiled binary, the extension runner reports ENOENT via "Extension error" on stderr.
		expect(result.stderr).not.toContain("Extension error")
	})

	describe("--export", () => {
		const fixtureSrc = resolve("tests/smoke/fixtures/session.jsonl")
		let workDir: string

		beforeEach(() => {
			workDir = mkdtempSync(join(tmpdir(), "kimchi-smoke-export-"))
		})

		afterEach(() => {
			rmSync(workDir, { recursive: true, force: true })
		})

		it("exports a session to HTML using staged template assets", () => {
			// Copy the fixture into a scratch dir — the binary rewrites the jsonl on load to populate IDs, which would mutate the checked-in file.
			const sessionPath = join(workDir, "session.jsonl")
			copyFileSync(fixtureSrc, sessionPath)
			const outPath = join(workDir, "session.html")
			const result = runBinary({
				args: ["--export", sessionPath, outPath],
				extraEnv: { KIMCHI_API_KEY: "smoke-test-dummy" },
			})
			expect(result.stdout).toContain(outPath)
			// Output must load the template + vendor bundle (marked + highlight ≈ 200KB), so 10KB is a safe regression floor.
			expect(statSync(outPath).size).toBeGreaterThan(10_000)
		})
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)("sends a request to a model via -p flag", { retry: 2 }, () => {
		const result = runBinary({
			args: ["--debug-prompts", "-p", "respond with only the word hello"],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})
		expect(result.stdout.trim()).not.toBe("")
	})
})
