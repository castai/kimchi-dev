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
	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"web_search tool is registered and available",
		() => {
			const result = runBinary(
				["-p", "List all your available tools, one per line. Just the tool names, nothing else."],
				{ KIMCHI_API_KEY: process.env.KIMCHI_API_KEY! },
			)

			expect(result.status).toBe(0)
			expect(result.stdout.toLowerCase()).toContain("web_search")
		},
	)

	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"web_search returns results for a factual query",
		() => {
			const result = runBinary(
				[
					"-p",
					"Use the web_search tool to search for 'TypeScript programming language'. " +
						"After searching, report the first source title you see, verbatim.",
				],
				{ KIMCHI_API_KEY: process.env.KIMCHI_API_KEY! },
			)

			expect(result.status).toBe(0)
			const output = result.stdout.trim()
			expect(output).not.toBe("")
			// The model should report a source title — it won't be empty
			expect(output.length).toBeGreaterThan(10)
		},
	)
})
