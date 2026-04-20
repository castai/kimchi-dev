import { describe, expect, it } from "vitest"
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
})
