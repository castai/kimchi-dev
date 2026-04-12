import { constants, accessSync } from "node:fs"
import { describe, expect, it } from "vitest"
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
		// The orchestration extension fires "input" and "before_agent_start" events before API key validation, triggering template loading. If templates are missing from the compiled binary, the extension runner reports ENOENT via "Extension error" on stderr.
		expect(result.stderr).not.toContain("Extension error")
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)("sends a request to a model via -p flag", () => {
		const result = runBinary({
			args: ["-p", "respond with only the word hello"],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})
		expect(result.stdout.trim()).not.toBe("")
	})
})
