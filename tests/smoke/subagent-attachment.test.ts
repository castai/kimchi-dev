// Smoke test for LLM-1321: the `subagent` tool must forward attachments to the spawned child.

import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { runBinary } from "./harness.js"

const SENTINEL = "PURPLE_RHINO_8891"
const FIXTURE_PATH = resolve("tests/smoke/fixtures/subagent-attachment.txt")

describe("subagent attachment smoke tests", () => {
	it.skipIf(!process.env.KIMCHI_API_KEY)(
		"subagent receives file attachment and can read its contents",
		{ timeout: 180_000, retry: 2 },
		() => {
			const prompt = [
				"Use the `subagent` tool exactly once with these arguments:",
				'- provider: "kimchi-dev"',
				'- model: "kimi-k2.5"',
				`- attachments: ["${FIXTURE_PATH}"]`,
				'- prompt: "The attached file contains a line beginning with `SENTINEL:`. Reply with only the token that follows `SENTINEL: ` and nothing else."',
				"",
				"After the subagent returns, print the subagent's answer verbatim as your final reply, with no extra commentary.",
			].join("\n")

			const result = runBinary({
				args: ["--debug-prompts", "-p", prompt],
				extraEnv: { KIMCHI_API_KEY: process.env.KIMCHI_API_KEY as string },
				timeoutMs: 180_000,
			})

			expect(result.stdout).toContain(SENTINEL)
		},
	)
})
