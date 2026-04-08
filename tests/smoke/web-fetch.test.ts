/**
 * Smoke test — verify the web_fetch tool works end-to-end through the
 * kimchi-code harness.
 *
 * Requires KIMCHI_API_KEY to be set (skipped otherwise).
 * Writes settings.json into the temp agent dir so the harness discovers
 * the web-fetch extension through its normal settings-based loading path.
 */

import { writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"
import { ensureAgentDir, runBinary } from "./harness.js"

beforeAll(() => {
	const agentDir = ensureAgentDir()
	const extensionAbsPath = resolve("extensions/web-fetch")
	writeFileSync(
		join(agentDir, "settings.json"),
		JSON.stringify({ extensions: [extensionAbsPath] }),
	)
})

describe("web_fetch smoke tests", () => {
	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"web_fetch tool is registered and available",
		() => {
			const result = runBinary(
				["-p", "List all your available tools, one per line. Just the tool names, nothing else."],
				{ KIMCHI_API_KEY: process.env.KIMCHI_API_KEY! },
			)

			expect(result.status).toBe(0)
			expect(result.stdout.toLowerCase()).toContain("web_fetch")
		},
	)

	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"fetches a web page via the web_fetch tool",
		() => {
			const result = runBinary(
				[
					"-p",
					"Use the web_fetch tool to fetch https://example.com in markdown format. After fetching, repeat the first heading you see in the page content verbatim.",
				],
				{ KIMCHI_API_KEY: process.env.KIMCHI_API_KEY! },
			)

			expect(result.status).toBe(0)
			const output = result.stdout.trim()
			expect(output).not.toBe("")
			expect(output.toLowerCase()).toContain("example domain")
		},
	)
})
