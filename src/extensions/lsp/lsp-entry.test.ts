import path from "node:path"
import { describe, expect, it } from "vitest"
import { clientCwd } from "../../../extensions/lsp.js"

describe("clientCwd", () => {
	it("returns sessionCwd for file inside it", () => {
		expect(clientCwd("/repo/src/foo.ts", "/repo")).toBe("/repo")
	})

	it("returns sessionCwd for file at sessionCwd root", () => {
		expect(clientCwd("/repo/foo.ts", "/repo")).toBe("/repo")
	})

	it("returns file directory for file outside sessionCwd", () => {
		expect(clientCwd("/tmp/test.ts", "/repo")).toBe("/tmp")
	})

	it("does not match sessionCwd as prefix of unrelated path", () => {
		expect(clientCwd("/repo-other/foo.ts", "/repo")).toBe("/repo-other")
	})

	it("returns file directory for deeply nested outside file", () => {
		expect(clientCwd("/tmp/gotest/main.go", "/repo")).toBe("/tmp/gotest")
	})
})
