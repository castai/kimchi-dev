/**
 * Project Hash Unit Tests
 */

import { describe, it, expect } from "vitest"
import { projectHash } from "./hash.ts"

describe("projectHash", () => {
	it("returns 16 hex characters for a valid path", () => {
		const hash = projectHash("/Users/dev/myproject")
		expect(hash).toHaveLength(16)
		expect(hash).toMatch(/^[0-9a-f]+$/)
	})

	it("is deterministic - same input produces same output", () => {
		const path = "/Users/dev/myproject"
		const hash1 = projectHash(path)
		const hash2 = projectHash(path)
		expect(hash1).toBe(hash2)
	})

	it("produces different hashes for different paths", () => {
		const hash1 = projectHash("/Users/dev/project1")
		const hash2 = projectHash("/Users/dev/project2")
		expect(hash1).not.toBe(hash2)
	})

	it("handles empty string", () => {
		const hash = projectHash("")
		expect(hash).toHaveLength(16)
		expect(hash).toMatch(/^[0-9a-f]+$/)
	})

	it("handles paths with special characters", () => {
		const hash = projectHash("/Users/dev/my-project_v2.0/test")
		expect(hash).toHaveLength(16)
		expect(hash).toMatch(/^[0-9a-f]+$/)
	})

	it("handles very long paths", () => {
		const longPath = "/Users/dev/" + "a".repeat(500)
		const hash = projectHash(longPath)
		expect(hash).toHaveLength(16)
		expect(hash).toMatch(/^[0-9a-f]+$/)
	})
})
