import { accessSync, constants } from "node:fs"
import { describe, expect, it } from "vitest"
import { BINARY_PATH, runBinary } from "./harness.js"

describe("binary smoke tests", () => {
	it("binary exists and is executable", () => {
		accessSync(BINARY_PATH, constants.X_OK)
	})

	it("errors with meaningful message when KIMCHI_API_KEY is missing", () => {
		const result = runBinary([])
		expect(result.status).toBe(1)
		expect(result.stderr).toContain("No Kimchi API key found")
	})

	it("--version exits cleanly", () => {
		const result = runBinary(["--version"], {
			KIMCHI_API_KEY: "smoke-test-dummy",
		})
		expect(result.status).toBe(0)
		expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/)
	})

	it("--help exits cleanly", () => {
		const result = runBinary(["--help"], {
			KIMCHI_API_KEY: "smoke-test-dummy",
		})
		expect(result.status).toBe(0)
		expect(result.stdout).toContain("Usage")
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"sends a request to a model via -p flag",
		() => {
			const result = runBinary(
				["-p", "respond with only the word hello"],
				{ KIMCHI_API_KEY: process.env.KIMCHI_API_KEY! },
			)
			expect(result.status).toBe(0)
			expect(result.stdout.trim()).not.toBe("")
		},
	)
})
