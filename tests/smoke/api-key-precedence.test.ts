import { execFile } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { promisify } from "node:util"
import { expect, it } from "vitest"
import { startFakeOpenAiServer } from "../e2e/tui/support/fake-openai-server.js"

const BINARY_PATH = resolve("dist/bin/kimchi")
const PACKAGE_DIR = resolve("dist/share/kimchi")

const execFileAsync = promisify(execFile)

it.each([false, true])("honors the environment override in headless mode (rejected=%s)", async (rejected) => {
	const homeDir = mkdtempSync(join(tmpdir(), "kimchi-ci-auth-"))
	const fake = await startFakeOpenAiServer({
		models: [{ slug: "ci-model", displayName: "CI model", provider: "openai" }],
		rejectedApiKeys: rejected ? ["ci-key"] : ["fake"],
		responses: [
			{
				toolCalls: [
					{
						function: {
							name: "bash",
							arguments: JSON.stringify({
								command:
									"if printenv KIMCHI_API_KEY >/dev/null; then echo KIMCHI_KEY_PRESENT; else echo KIMCHI_KEY_ABSENT; fi",
							}),
						},
					},
				],
			},
			{ stream: ["CI authentication works."] },
		],
	})
	try {
		const configDir = join(homeDir, ".config", "kimchi")
		mkdirSync(join(configDir, "harness"), { recursive: true })
		writeFileSync(
			join(configDir, "config.json"),
			JSON.stringify({ apiKey: "fake", llmEndpoint: fake.baseUrl, skillPaths: [], migrationState: "done" }),
			{ mode: 0o600 },
		)
		const authPath = join(configDir, "harness", "auth.json")
		writeFileSync(authPath, JSON.stringify({ "kimchi-dev/openai": { type: "api_key", key: "fake" } }), { mode: 0o600 })
		const args = ["--print", "--provider", "kimchi-dev/openai", "--model", "ci-model", "--no-session", "Say hello"]
		const options = {
			cwd: homeDir,
			timeout: 12000,
			env: {
				PATH: process.env.PATH,
				HOME: homeDir,
				PI_PACKAGE_DIR: PACKAGE_DIR,
				KIMCHI_API_KEY: "ci-key",
				KIMCHI_PERMISSIONS: "yolo",
				KIMCHI_TELEMETRY_ENABLED: "0",
			},
		}
		const run = execFileAsync(BINARY_PATH, args, options)
		run.child.stdin?.end()
		if (rejected) {
			await expect(run).rejects.toMatchObject({
				code: 1,
				stderr: expect.stringContaining(
					"KIMCHI_API_KEY environment variable contains an invalid API key. Update or delete the environment variable, then restart Kimchi.",
				),
			})
			expect(fake.requests.some((request) => request.url.includes("chat/completions"))).toBe(false)
		} else {
			const { stdout, stderr } = await run
			expect(stdout).toContain("CI authentication works.")
			expect(stdout).not.toContain("KIMCHI_API_KEY differs")
			expect(stderr).toContain("Warning: KIMCHI_API_KEY differs from your saved key")
			const chats = fake.requests.filter((request) => request.url.includes("chat/completions"))
			expect(chats.every((request) => request.headers.authorization === "Bearer ci-key")).toBe(true)
			expect(chats.map((request) => request.body)).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						messages: expect.arrayContaining([
							expect.objectContaining({ role: "tool", content: expect.stringContaining("KIMCHI_KEY_ABSENT") }),
						]),
					}),
				]),
			)
		}
		const metadata = fake.requests.filter((request) => request.url.startsWith("/v1/models/metadata"))
		expect(metadata.length).toBeGreaterThan(0)
		expect(metadata.every((request) => request.headers.authorization === "Bearer ci-key")).toBe(true)
		const config = JSON.parse(readFileSync(join(homeDir, ".config", "kimchi", "config.json"), "utf-8"))
		expect(config.apiKey).toBe("fake")
		expect(JSON.parse(readFileSync(authPath, "utf-8"))["kimchi-dev/openai"].key).toBe(rejected ? "fake" : "ci-key")
	} finally {
		await fake.stop()
		rmSync(homeDir, { recursive: true, force: true })
	}
})

it.each([
	{ envKey: "", provider: "custom" },
	{ envKey: "expired-env-key", provider: "custom" },
	{ envKey: "", provider: "kimchi-dev/openai" },
	{ envKey: "expired-env-key", provider: "kimchi-dev/openai" },
])("preserves auth after a Kimchi 401 (environment key=$envKey, provider=$provider)", async ({ envKey, provider }) => {
	const homeDir = mkdtempSync(join(tmpdir(), "kimchi-custom-provider-auth-"))
	const fake = await startFakeOpenAiServer({
		rejectedApiKeys: ["expired-saved-key", "expired-env-key"],
		responses: [{ stream: ["Custom provider authentication works."] }],
	})
	try {
		const configDir = join(homeDir, ".config", "kimchi")
		const agentDir = join(configDir, "harness")
		mkdirSync(agentDir, { recursive: true })
		const configPath = join(configDir, "config.json")
		writeFileSync(
			configPath,
			JSON.stringify({
				apiKey: "expired-saved-key",
				llmEndpoint: fake.baseUrl,
				skillPaths: [],
				migrationState: "done",
			}),
			{ mode: 0o600 },
		)
		const customProvider = {
			baseUrl: `${fake.baseUrl}/openai/v1`,
			apiKey: "custom-key",
			api: "openai-completions",
			authHeader: true,
			models: [
				{
					id: "custom-model",
					name: "Custom Model",
					reasoning: false,
					input: ["text"],
					contextWindow: 8192,
					maxTokens: 1024,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
			],
		}
		const modelsPath = join(agentDir, "models.json")
		writeFileSync(
			modelsPath,
			JSON.stringify({
				providers: {
					custom: customProvider,
					"kimchi-dev/openai": { ...customProvider, apiKey: "$KIMCHI_API_KEY" },
				},
			}),
			{ mode: 0o600 },
		)
		const authPath = join(agentDir, "auth.json")
		const savedAuth = JSON.stringify({
			"kimchi-dev/openai": { type: "api_key", key: "valid-stored-kimchi-key" },
			custom: { type: "api_key", key: "custom-key" },
		})
		writeFileSync(authPath, savedAuth, { mode: 0o600 })
		const run = execFileAsync(
			BINARY_PATH,
			["--print", "--provider", provider, "--model", "custom-model", "--no-session", "Say hello"],
			{
				cwd: homeDir,
				timeout: 12000,
				env: {
					PATH: process.env.PATH,
					HOME: homeDir,
					PI_PACKAGE_DIR: PACKAGE_DIR,
					KIMCHI_API_KEY: envKey,
					KIMCHI_PERMISSIONS: "yolo",
					KIMCHI_TELEMETRY_ENABLED: "0",
				},
			},
		)
		run.child.stdin?.end()
		if (envKey) {
			await expect(run).rejects.toMatchObject({
				code: 1,
				stderr: expect.stringContaining(
					"KIMCHI_API_KEY environment variable contains an invalid API key. Update or delete the environment variable, then restart Kimchi.",
				),
			})
			expect(fake.requests.some((request) => request.url.includes("chat/completions"))).toBe(false)
		} else if (provider === "custom") {
			const { stdout, stderr } = await run
			expect(stdout).toContain("Custom provider authentication works.")
			expect(stderr).toContain("401")
			const chat = fake.requests.find((request) => request.url.includes("chat/completions"))
			expect(chat?.headers.authorization).toBe("Bearer custom-key")
		} else {
			await expect(run).rejects.toMatchObject({
				code: 1,
				stderr: expect.stringContaining("Kimchi API key was rejected"),
			})
			expect(
				fake.requests
					.filter((request) => request.url.includes("chat/completions"))
					.map((request) => request.headers.authorization),
			).not.toContain("Bearer valid-stored-kimchi-key")
		}
		const metadata = fake.requests.find((request) => request.url.startsWith("/v1/models/metadata"))
		expect(metadata?.headers.authorization).toBe(`Bearer ${envKey || "expired-saved-key"}`)
		expect(JSON.parse(readFileSync(configPath, "utf-8")).apiKey).toBe("expired-saved-key")
		expect(JSON.parse(readFileSync(modelsPath, "utf-8")).providers.custom).toEqual(customProvider)
		expect(readFileSync(authPath, "utf-8")).toBe(savedAuth)
	} finally {
		await fake.stop()
		rmSync(homeDir, { recursive: true, force: true })
	}
})
