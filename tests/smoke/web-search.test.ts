/**
 * Smoke test — verify the web_search tool works end-to-end through the
 * kimchi-code harness.
 *
 * Requires KIMCHI_API_KEY to be set (skipped otherwise).
 * The web_search tool is bundled into the compiled binary via inline
 * extension factories — no settings.json or disk-based discovery needed.
 */

import { describe, expect, it } from "vitest"
import { runBinary } from "./harness.js"

describe("web_search smoke tests", () => {
	it.skipIf(!process.env.KIMCHI_API_KEY)("web_search tool is registered and available", { retry: 2 }, () => {
		const result = runBinary({
			args: ["--debug-prompts", "-p", "List all your available tools, one per line. Just the tool names, nothing else."],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})

		expect(result.stdout.toLowerCase()).toContain("web_search")
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)("web_search returns results for a factual query", { retry: 2 }, () => {
		const result = runBinary({
			args: [
				"--debug-prompts",
				"-p",
				"Use the web_search tool to search for 'TypeScript programming language'. " +
					"After searching, report the first source title you see, verbatim.",
			],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})

		const output = result.stdout.trim()
		expect(output).not.toBe("")
		expect(output.length).toBeGreaterThan(10)
	})
})
