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
		responses: [{ stream: ["CI authentication works."] }],
	})
	try {
		const configDir = join(homeDir, ".config", "kimchi")
		mkdirSync(join(configDir, "harness"), { recursive: true })
		writeFileSync(
			join(configDir, "config.json"),
			JSON.stringify({ apiKey: "fake", llmEndpoint: fake.baseUrl, skillPaths: [], migrationState: "done" }),
			{ mode: 0o600 },
		)
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
				stderr: expect.stringContaining("KIMCHI_API_KEY was rejected. Update or unset it"),
			})
			expect(fake.requests.some((request) => request.url.includes("chat/completions"))).toBe(false)
		} else {
			const { stdout, stderr } = await run
			expect(stdout).toContain("CI authentication works.")
			expect(stdout).not.toContain("KIMCHI_API_KEY differs")
			expect(stderr).toContain("Warning: KIMCHI_API_KEY differs from your saved key")
			const chat = fake.requests.find((request) => request.url.includes("chat/completions"))
			expect(chat?.headers.authorization).toBe("Bearer ci-key")
		}
		const metadata = fake.requests.filter((request) => request.url.startsWith("/v1/models/metadata"))
		expect(metadata.length).toBeGreaterThan(0)
		expect(metadata.every((request) => request.headers.authorization === "Bearer ci-key")).toBe(true)
		const config = JSON.parse(readFileSync(join(homeDir, ".config", "kimchi", "config.json"), "utf-8"))
		expect(config.apiKey).toBe("fake")
	} finally {
		await fake.stop()
		rmSync(homeDir, { recursive: true, force: true })
	}
})
