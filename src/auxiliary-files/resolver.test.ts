import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { resolveAuxiliaryFilesDir } from "./resolver.js"

describe("resolveAuxiliaryFilesDir", () => {
	// Whitespace in the home path is intentional: it would break if the resolver used string concatenation instead of path.join.
	const home = "/home alice"

	it("returns PI_PACKAGE_DIR when it is set", () => {
		const env = { PI_PACKAGE_DIR: "/custom/path" }
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/custom/path")
	})

	it("returns PI_PACKAGE_DIR even when XDG_DATA_HOME is also set", () => {
		const env = {
			PI_PACKAGE_DIR: "/custom/path",
			XDG_DATA_HOME: "/xdg/data",
		}
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/custom/path")
	})

	it("returns $XDG_DATA_HOME/kimchi/ when XDG_DATA_HOME is set and PI_PACKAGE_DIR is not", () => {
		const env = { XDG_DATA_HOME: "/xdg/data" }
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/xdg/data/kimchi")
	})

	it("returns ~/.local/share/kimchi/ when neither PI_PACKAGE_DIR nor XDG_DATA_HOME is set", () => {
		const env: Record<string, string | undefined> = {}
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/home alice/.local/share/kimchi")
	})

	it("treats an empty-string PI_PACKAGE_DIR as unset and falls through", () => {
		// Matches the XDG spec's treatment of empty env vars: empty is equivalent to unset.
		// Prevents silently returning "" (or a relative path via path.join) as an auxiliary files dir.
		const env = { PI_PACKAGE_DIR: "" }
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/home alice/.local/share/kimchi")
	})

	it("treats an empty-string XDG_DATA_HOME as unset and falls through", () => {
		const env = { XDG_DATA_HOME: "" }
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/home alice/.local/share/kimchi")
	})

	it("handles XDG_DATA_HOME with a trailing slash", () => {
		const env = { XDG_DATA_HOME: "/xdg/data/" }
		expect(resolveAuxiliaryFilesDir(env, home)).toBe("/xdg/data/kimchi")
	})

	describe("binary-sibling share directory", () => {
		let tmpBase: string

		beforeEach(() => {
			tmpBase = join(tmpdir(), `kimchi-resolver-test-${process.pid}`)
			// Simulate dist/bin/kimchi + dist/share/kimchi/package.json
			mkdirSync(join(tmpBase, "bin"), { recursive: true })
			mkdirSync(join(tmpBase, "share", "kimchi"), { recursive: true })
			writeFileSync(join(tmpBase, "share", "kimchi", "package.json"), "{}")
		})

		afterEach(() => {
			rmSync(tmpBase, { recursive: true, force: true })
		})

		it("returns sibling share dir when package.json exists next to the binary", () => {
			const execPath = join(tmpBase, "bin", "kimchi")
			const env: Record<string, string | undefined> = {}
			expect(resolveAuxiliaryFilesDir(env, home, execPath)).toBe(join(tmpBase, "share", "kimchi"))
		})

		it("PI_PACKAGE_DIR takes precedence over sibling share dir", () => {
			const execPath = join(tmpBase, "bin", "kimchi")
			const env = { PI_PACKAGE_DIR: "/custom/path" }
			expect(resolveAuxiliaryFilesDir(env, home, execPath)).toBe("/custom/path")
		})

		it("falls through to XDG when sibling share dir has no package.json", () => {
			rmSync(join(tmpBase, "share", "kimchi", "package.json"))
			const execPath = join(tmpBase, "bin", "kimchi")
			const env = { XDG_DATA_HOME: "/xdg/data" }
			expect(resolveAuxiliaryFilesDir(env, home, execPath)).toBe("/xdg/data/kimchi")
		})
	})
})
