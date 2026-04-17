import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { validateAuxiliaryFiles } from "./validator.js"

describe("validateAuxiliaryFiles", () => {
	let testDir: string

	beforeEach(() => {
		// Create a unique temp directory for each test
		testDir = join(tmpdir(), `kimchi-test-${Date.now()}-${Math.random().toString(36).slice(2)}`)
		mkdirSync(testDir, { recursive: true })
	})

	afterEach(() => {
		// Clean up temp directory after each test
		rmSync(testDir, { recursive: true, force: true })
	})

	it("passes when both package.json and theme/ are present", () => {
		// Arrange
		writeFileSync(join(testDir, "package.json"), JSON.stringify({ name: "test" }))
		mkdirSync(join(testDir, "theme"), { recursive: true })

		// Act & Assert - should not throw
		expect(() => validateAuxiliaryFiles(testDir)).not.toThrow()
	})

	it("throws when package.json is missing", () => {
		// Arrange - only theme/ directory
		mkdirSync(join(testDir, "theme"), { recursive: true })

		// Act & Assert
		expect(() => validateAuxiliaryFiles(testDir)).toThrow(/package\.json/)
	})

	it("throws when theme/ directory is missing", () => {
		// Arrange - only package.json
		writeFileSync(join(testDir, "package.json"), JSON.stringify({ name: "test" }))

		// Act & Assert
		expect(() => validateAuxiliaryFiles(testDir)).toThrow(/theme/)
	})

	it("throws when the directory does not exist", () => {
		// Arrange - use a non-existent path
		const nonExistentDir = join(tmpdir(), `kimchi-nonexistent-${Date.now()}`)

		// Act & Assert
		expect(() => validateAuxiliaryFiles(nonExistentDir)).toThrow(/not found/)
	})
})
