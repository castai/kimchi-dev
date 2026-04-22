import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { homedir, tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { attachmentExists, resolveAttachmentPath } from "./attachment-path.js"

describe("resolveAttachmentPath", () => {
	it("expands bare ~ to the user's home directory", () => {
		expect(resolveAttachmentPath("~", "/any/cwd")).toBe(homedir())
	})

	it("expands ~/ prefix to home directory", () => {
		expect(resolveAttachmentPath("~/Downloads", "/any/cwd")).toBe(resolve(homedir(), "Downloads"))
	})

	it("leaves ~ alone when not followed by / (treats as filename)", () => {
		expect(resolveAttachmentPath("~foo", "/cwd")).toBe(resolve("/cwd", "~foo"))
	})

	it("resolves cwd-relative paths", () => {
		expect(resolveAttachmentPath("sub/file.txt", "/base")).toBe("/base/sub/file.txt")
	})

	it("passes absolute paths through unchanged", () => {
		expect(resolveAttachmentPath("/etc/hosts", "/any/cwd")).toBe("/etc/hosts")
	})
})

describe("attachmentExists", () => {
	let tmp: string
	beforeAll(() => {
		tmp = mkdtempSync(join(tmpdir(), "attachment-path-test-"))
		writeFileSync(join(tmp, "present.txt"), "hi")
	})
	afterAll(() => {
		rmSync(tmp, { recursive: true, force: true })
	})

	it("returns true for a cwd-relative file that exists", () => {
		expect(attachmentExists("present.txt", tmp)).toBe(true)
	})

	it("returns false for a cwd-relative file that does not exist", () => {
		expect(attachmentExists("missing.txt", tmp)).toBe(false)
	})

	it("returns true for an absolute path that exists", () => {
		expect(attachmentExists(join(tmp, "present.txt"), "/unrelated/cwd")).toBe(true)
	})

	it("returns false for a ~ path to a file that does not exist", () => {
		expect(attachmentExists("~/definitely-not-a-real-file-xyz123.txt", tmp)).toBe(false)
	})
})
