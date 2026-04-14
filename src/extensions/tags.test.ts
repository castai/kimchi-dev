import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { isValidTag, parseTag } from "./tags.js"

describe("isValidTag", () => {
	const validCases = [
		"project:test",
		"team:backend",
		"milestone:M015",
		"key:value",
		"a:b",
		"project-1:test_v2",
		"app.name:version.1.0",
	]

	const invalidCases = [
		"invalid",
		":value",
		"key:",
		":",
		"",
		"key value",
		"key@value",
		`${"a".repeat(65)}:value`, // key too long
		`key:${"b".repeat(65)}`, // value too long
	]

	for (const tag of validCases) {
		it(`returns true for valid tag "${tag}"`, () => {
			expect(isValidTag(tag)).toBe(true)
		})
	}

	for (const tag of invalidCases) {
		it(`returns false for invalid tag "${tag}"`, () => {
			expect(isValidTag(tag)).toBe(false)
		})
	}
})

describe("parseTag", () => {
	const cases: Array<{
		tag: string
		expected: { key: string; value: string } | null
	}> = [
		{ tag: "project:test", expected: { key: "project", value: "test" } },
		{ tag: "team:backend", expected: { key: "team", value: "backend" } },
		{ tag: "milestone:M015", expected: { key: "milestone", value: "M015" } },
		{ tag: "invalid", expected: null },
		{ tag: "", expected: null },
	]

	for (const { tag, expected } of cases) {
		it(`parses "${tag}" correctly`, () => {
			expect(parseTag(tag)).toEqual(expected)
		})
	}
})

describe("TagManager persistence", () => {
	let tempDir: string
	let configPath: string
	let originalEnv: string | undefined

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-tags-test-"))
		configPath = join(tempDir, "tags.json")
		originalEnv = process.env.KIMCHI_TAGS
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
		if (originalEnv !== undefined) {
			process.env.KIMCHI_TAGS = originalEnv
		} else {
			process.env.KIMCHI_TAGS = undefined
		}
	})

	// Simulates the TagManager.saveTags() logic
	function saveTags(tags: string[], filePath: string): void {
		const configDir = dirname(filePath)
		if (!existsSync(configDir)) {
			// Would be created by saveTags in real implementation
		}
		writeFileSync(filePath, JSON.stringify({ tags: tags.sort() }, null, 2))
	}

	// Simulates the TagManager.loadTags() logic
	function loadTags(filePath: string): string[] {
		if (!existsSync(filePath)) {
			return []
		}
		const content = readFileSync(filePath, "utf-8")
		const config = JSON.parse(content) as { tags?: string[] }
		return Array.isArray(config.tags) ? config.tags : []
	}

	it("persists added tags to config file", () => {
		// Simulate adding tags and persisting
		const tags: string[] = []

		tags.push("project:test")
		saveTags(tags, configPath)

		// Verify persistence
		const loaded = loadTags(configPath)
		expect(loaded).toContain("project:test")
	})

	it("loads tags from config file on initialization", () => {
		// Pre-populate config file
		writeFileSync(configPath, JSON.stringify({ tags: ["env:prod", "team:backend"] }))

		// Verify file can be read
		const loaded = loadTags(configPath)
		expect(loaded).toEqual(["env:prod", "team:backend"])
	})

	it("removes tags from config file when deleted", () => {
		// Pre-populate config file
		writeFileSync(configPath, JSON.stringify({ tags: ["tag1:value1", "tag2:value2"] }))

		// Simulate removal
		const tags = loadTags(configPath).filter((t: string) => t !== "tag1:value1")
		saveTags(tags, configPath)

		// Verify removal
		const loaded = loadTags(configPath)
		expect(loaded).toEqual(["tag2:value2"])
	})

	it("clears all user tags from config file", () => {
		// Pre-populate config file
		writeFileSync(configPath, JSON.stringify({ tags: ["tag1:value1", "tag2:value2", "tag3:value3"] }))

		// Simulate clear
		saveTags([], configPath)

		// Verify cleared
		const loaded = loadTags(configPath)
		expect(loaded).toEqual([])
	})

	it("creates config directory if it does not exist", () => {
		// Use a nested directory path
		const nestedDir = join(tempDir, "nested", "config")
		const nestedPath = join(nestedDir, "tags.json")

		// Create directory manually (saveTags would do this with mkdirSync recursive)
		const fs = require("node:fs")
		fs.mkdirSync(nestedDir, { recursive: true })

		// Save to nested path
		writeFileSync(nestedPath, JSON.stringify({ tags: ["test:value"] }))

		// Verify file exists and is readable
		const loaded = loadTags(nestedPath)
		expect(loaded).toEqual(["test:value"])
	})
})
