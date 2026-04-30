import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { claudeCodeEnv, injectClaudeCodeEnv } from "./claude-code.js"
import { byId } from "./registry.js"

describe("claudeCodeEnv", () => {
	it("emits the four env vars Claude Code expects, with ANTHROPIC_API_KEY explicitly empty", () => {
		const env = claudeCodeEnv("my-key")
		expect(env).toEqual({
			ANTHROPIC_BASE_URL: "https://llm.kimchi.dev/anthropic",
			ANTHROPIC_API_KEY: "",
			ANTHROPIC_AUTH_TOKEN: "my-key",
			CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS: "1",
		})
	})

	it("accepts a custom base URL for testing", () => {
		const env = claudeCodeEnv("k", "https://example.com/anthropic")
		expect(env.ANTHROPIC_BASE_URL).toBe("https://example.com/anthropic")
	})
})

describe("injectClaudeCodeEnv", () => {
	it("merges into an existing env block without removing unrelated keys", () => {
		const env: Record<string, unknown> = { FOO: "bar" }
		injectClaudeCodeEnv(env, "https://b", "k")
		expect(env.FOO).toBe("bar")
		expect(env.ANTHROPIC_BASE_URL).toBe("https://b")
		expect(env.ANTHROPIC_AUTH_TOKEN).toBe("k")
	})

	it("overwrites previously set ANTHROPIC_* values", () => {
		const env: Record<string, unknown> = { ANTHROPIC_API_KEY: "old", ANTHROPIC_AUTH_TOKEN: "old" }
		injectClaudeCodeEnv(env, "https://b", "new")
		expect(env.ANTHROPIC_API_KEY).toBe("")
		expect(env.ANTHROPIC_AUTH_TOKEN).toBe("new")
	})
})

describe("claude-code tool registration", () => {
	let scratchHome: string
	let prevHome: string | undefined

	// claude-code.ts calls register() at module top-level. Vitest caches the
	// import, so the registration runs once per test file when the module is
	// first loaded. We don't reset the registry here — re-registering the
	// same tool would throw, and this suite only needs to read the tool back.

	beforeEach(() => {
		scratchHome = mkdtempSync(join(tmpdir(), "kimchi-claude-test-"))
		// os.homedir() consults $HOME first on POSIX. Pointing it at the
		// scratch dir lets resolveScopePath("global", "~/...") land there
		// without monkey-patching node:os.
		prevHome = process.env.HOME
		process.env.HOME = scratchHome
	})

	afterEach(() => {
		// biome-ignore lint/performance/noDelete: env-var cleanup needs a real delete; assigning undefined would coerce to the literal string "undefined".
		if (prevHome === undefined) delete process.env.HOME
		else process.env.HOME = prevHome
		rmSync(scratchHome, { recursive: true, force: true })
	})

	it("registers itself with the integrations registry on import", () => {
		const tool = byId("claudecode")
		expect(tool).toBeDefined()
		expect(tool?.binaryName).toBe("claude")
		expect(tool?.configPath).toBe("~/.claude/settings.json")
	})

	it("write() merges env into ~/.claude/settings.json without clobbering other keys", async () => {
		const settings = join(scratchHome, ".claude", "settings.json")
		mkdirSync(join(scratchHome, ".claude"), { recursive: true })
		writeFileSync(settings, JSON.stringify({ theme: "dark", env: { CUSTOM_FLAG: "yes" } }), "utf-8")

		const tool = byId("claudecode")
		expect(tool).toBeDefined()
		await tool?.write("global", "test-key")

		const written = JSON.parse(readFileSync(settings, "utf-8"))
		expect(written.theme).toBe("dark")
		expect(written.env.CUSTOM_FLAG).toBe("yes")
		expect(written.env.ANTHROPIC_AUTH_TOKEN).toBe("test-key")
		expect(written.env.ANTHROPIC_API_KEY).toBe("")
		expect(written.env.ANTHROPIC_BASE_URL).toBe("https://llm.kimchi.dev/anthropic")
	})

	it("write() creates the directory and file when they don't exist yet", async () => {
		const tool = byId("claudecode")
		expect(tool).toBeDefined()
		await tool?.write("global", "fresh-key")

		const settings = join(scratchHome, ".claude", "settings.json")
		const written = JSON.parse(readFileSync(settings, "utf-8"))
		expect(written.env.ANTHROPIC_AUTH_TOKEN).toBe("fresh-key")
	})

	it("write() rejects an empty API key", async () => {
		const tool = byId("claudecode")
		expect(tool).toBeDefined()
		await expect(tool?.write("global", "")).rejects.toThrow(/API key/)
	})
})
