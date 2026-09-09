import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { expect, test } from "@microsoft/tui-test"
import { fullText, waitForText } from "./support/assertions.js"
import { runKimchiSession, TUI_TEST_CONFIG } from "./support/kimchi-fixture.js"

test.use(TUI_TEST_CONFIG)

test("an invalid environment key shows correction guidance instead of asking for login", async ({ terminal }) => {
	const savedAuth = JSON.stringify({ "kimchi-dev/openai": { type: "api_key", key: "valid-saved-key" } })
	await runKimchiSession(
		terminal,
		{
			artifactName: "rejected-env-api-key",
			startupText: "KIMCHI_API_KEY environment variable contains an invalid API key.",
			providerId: "kimchi-dev/openai",
			rejectedApiKeys: ["wrong-env-key"],
			responses: [],
			seedHome(homeDir) {
				const agentDir = join(homeDir, ".config", "kimchi", "harness")
				writeFileSync(join(agentDir, "auth.json"), savedAuth, { mode: 0o600 })
				// Even a usable custom provider must not hide rejection of an explicit override.
				const modelsPath = join(agentDir, "models.json")
				const models = JSON.parse(readFileSync(modelsPath, "utf-8"))
				models.providers.custom = { ...models.providers["kimchi-dev/openai"], apiKey: "custom-key" }
				writeFileSync(modelsPath, JSON.stringify(models))
				return { env: { KIMCHI_API_KEY: "wrong-env-key", KIMCHI_TELEMETRY_ENABLED: "0" } }
			},
		},
		async (fixture, trace) => {
			expect(fullText(terminal)).toContain("Update or delete the environment variable")
			trace.step("invalid override explains how to correct the key and restart")
			terminal.submit("echo KIMCHI_REJECTION_EXIT_$?")
			await waitForText(terminal, "KIMCHI_REJECTION_EXIT_1")
			expect(fullText(terminal)).not.toContain("Use a Kimchi account")
			expect(fullText(terminal)).not.toContain("Redirecting to setup")
			expect(readFileSync(join(fixture.agentDir, "auth.json"), "utf-8")).toBe(savedAuth)
			expect(fixture.fake.requests.some((request) => request.url.includes("chat/completions"))).toBe(false)
			trace.step("startup exited without a login dialog or changing saved credentials")
		},
	)
})
