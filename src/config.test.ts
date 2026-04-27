import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { clearApiKey, loadConfig, writeApiKey } from "./config.js"

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

	it("reads apiKey from config file", () => {
		writeFileSync(configPath, JSON.stringify({ apiKey: "file-key-456" }))
		const config = loadConfig({ configPath })
		expect(config.apiKey).toBe("file-key-456")
	})

	it("reads api_key from config file for backward compatibility", () => {
		writeFileSync(configPath, JSON.stringify({ api_key: "file-key-456" }))
		const config = loadConfig({ configPath })
		expect(config.apiKey).toBe("file-key-456")
	})

	it("prefers apiKey over api_key when both are set", () => {
		writeFileSync(configPath, JSON.stringify({ apiKey: "new-key", api_key: "old-key" }))
		const config = loadConfig({ configPath })
		expect(config.apiKey).toBe("new-key")
	})

	it("returns empty apiKey when no key is found", () => {
		const config = loadConfig({ configPath })
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

	it("writes apiKey to config file", () => {
		writeApiKey("new-key-789", configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw.apiKey).toBe("new-key-789")
	})

	it("preserves existing fields when writing apiKey", () => {
		writeFileSync(configPath, JSON.stringify({ migrationState: "done" }))
		writeApiKey("new-key-789", configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw).toEqual({ migrationState: "done", apiKey: "new-key-789" })
	})
})

describe("clearApiKey", () => {
	let tempDir: string
	let configPath: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-test-"))
		configPath = join(tempDir, "config.json")
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("removes apiKey from config file", () => {
		writeFileSync(configPath, JSON.stringify({ apiKey: "key-to-clear", migrationState: "done" }))
		clearApiKey(configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw).toEqual({ migrationState: "done" })
	})

	it("removes legacy api_key from config file", () => {
		writeFileSync(configPath, JSON.stringify({ api_key: "key-to-clear", migrationState: "done" }))
		clearApiKey(configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw).toEqual({ migrationState: "done" })
	})

	it("removes both apiKey and api_key when both are present", () => {
		writeFileSync(configPath, JSON.stringify({ apiKey: "new-key", api_key: "old-key", migrationState: "done" }))
		clearApiKey(configPath)
		const raw = JSON.parse(readFileSync(configPath, "utf-8"))
		expect(raw).toEqual({ migrationState: "done" })
	})

	it("is a no-op when config file does not exist", () => {
		expect(() => clearApiKey(configPath)).not.toThrow()
	})
})
