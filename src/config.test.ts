import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { loadConfig, writeApiKey } from "./config.js"

describe("loadConfig", () => {
	let tempDir: string
	let configPath: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-test-"))
		configPath = join(tempDir, "config.json")
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("uses KIMCHI_API_KEY env var when set", () => {
		const config = loadConfig({
			env: { KIMCHI_API_KEY: "env-key-123" },
			configPath,
		})
		expect(config.apiKey).toBe("env-key-123")
	})

	it("reads api_key from config file when env var is not set", () => {
		writeFileSync(configPath, JSON.stringify({ api_key: "file-key-456" }))
		const config = loadConfig({
			env: {},
			configPath,
		})
		expect(config.apiKey).toBe("file-key-456")
	})

	it("env var takes precedence over config file", () => {
		writeFileSync(configPath, JSON.stringify({ api_key: "file-key-456" }))
		const config = loadConfig({
			env: { KIMCHI_API_KEY: "env-key-123" },
			configPath,
		})
		expect(config.apiKey).toBe("env-key-123")
	})

	it("returns empty apiKey when no key is found", () => {
		const config = loadConfig({
			env: {},
			configPath,
		})
		expect(config.apiKey).toBe("")
	})
})

describe("writeApiKey", () => {
	let tempDir: string
	let configPath: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-test-"))
		configPath = join(tempDir, "config.json")
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("writes api_key to config file", () => {
		writeApiKey("new-key-789", configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw.api_key).toBe("new-key-789")
	})

	it("preserves existing fields when writing api_key", () => {
		writeFileSync(configPath, JSON.stringify({ migrationState: "done" }))
		writeApiKey("new-key-789", configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw).toEqual({ migrationState: "done", api_key: "new-key-789" })
	})
})
