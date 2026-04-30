/**
 * Smoke test — verify the web_fetch tool works end-to-end through the
 * kimchi harness.
 *
 * Requires KIMCHI_API_KEY to be set (skipped otherwise).
 * The web_fetch tool is bundled into the compiled binary via inline
 * extension factories — no settings.json or disk-based discovery needed.
 */

import { describe, expect, it } from "vitest"
import { runBinary } from "./harness.js"

describe("web_fetch smoke tests", () => {
	it.skipIf(!process.env.KIMCHI_API_KEY)("web_fetch tool is registered and available", { retry: 2 }, () => {
		const result = runBinary({
			args: [
				"--debug-prompts",
				"-p",
				"List all your available tools, one per line. Just the tool names, nothing else.",
			],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})

		expect(result.stdout.toLowerCase()).toContain("web_fetch")
	})

	it.skipIf(!process.env.KIMCHI_API_KEY)("fetches a web page via the web_fetch tool", { retry: 2 }, () => {
		const result = runBinary({
			args: [
				"--debug-prompts",
				"-p",
				"Use the web_fetch tool to fetch https://example.com in markdown format. After fetching, repeat the first heading you see in the page content verbatim.",
			],
			extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
		})

		const output = result.stdout.trim()
		expect(output).not.toBe("")
		expect(output.toLowerCase()).toContain("example domain")
	})
})
