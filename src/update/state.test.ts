import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { isStale, isUpdateCheckDisabled, loadRepoState, saveRepoState } from "./state.js"

describe("update state cache", () => {
	let tmp: string
	let prevHome: string | undefined
	let prevXdg: string | undefined

	beforeEach(() => {
		tmp = mkdtempSync(join(tmpdir(), "kimchi-update-state-test-"))
		prevHome = process.env.HOME
		prevXdg = process.env.XDG_CACHE_HOME
		// statePath() consults XDG_CACHE_HOME first; pin it at the temp dir
		// so the test never touches the developer's real ~/.cache/kimchi.
		process.env.XDG_CACHE_HOME = tmp
	})

	afterEach(() => {
		// biome-ignore lint/performance/noDelete: env-var cleanup needs a real delete; assigning undefined would coerce to the literal string "undefined".
		if (prevHome === undefined) delete process.env.HOME
		else process.env.HOME = prevHome
		// biome-ignore lint/performance/noDelete: same as above.
		if (prevXdg === undefined) delete process.env.XDG_CACHE_HOME
		else process.env.XDG_CACHE_HOME = prevXdg
		rmSync(tmp, { recursive: true, force: true })
	})

	it("returns null for a missing state file", () => {
		expect(loadRepoState("castai", "kimchi")).toBeNull()
	})

	it("round-trips per-repo state through saveRepoState + loadRepoState", () => {
		saveRepoState("castai", "kimchi", {
			checkedAt: 1_700_000_000_000,
			latestVersion: "1.2.3",
			releaseUrl: "https://github.com/castai/kimchi/releases/tag/v1.2.3",
		})
		const got = loadRepoState("castai", "kimchi")
		expect(got).toEqual({
			checkedAt: 1_700_000_000_000,
			latestVersion: "1.2.3",
			releaseUrl: "https://github.com/castai/kimchi/releases/tag/v1.2.3",
		})
	})

	it("preserves entries for other repos when updating one", () => {
		saveRepoState("a", "b", { checkedAt: 1, latestVersion: "1.0.0" })
		saveRepoState("c", "d", { checkedAt: 2, latestVersion: "2.0.0" })
		expect(loadRepoState("a", "b")?.latestVersion).toBe("1.0.0")
		expect(loadRepoState("c", "d")?.latestVersion).toBe("2.0.0")
	})

	it("writes the file with 0600 perms via tmp+rename (atomic)", () => {
		saveRepoState("a", "b", { checkedAt: 1, latestVersion: "1.0.0" })
		const path = join(tmp, "kimchi", "state.json")
		expect(existsSync(path)).toBe(true)
		// Smoke-check that the JSON parses back rather than asserting on
		// fs mode bits, which differ between OSes/file-systems.
		const raw = readFileSync(path, "utf-8")
		expect(JSON.parse(raw).repos["a/b"]).toEqual({ checkedAt: 1, latestVersion: "1.0.0" })
	})
})

describe("isStale", () => {
	const day = 24 * 60 * 60 * 1000
	it("returns false for a fresh check", () => {
		expect(isStale({ checkedAt: 1_000, latestVersion: "" }, 1_000)).toBe(false)
	})
	it("returns false within 24h", () => {
		expect(isStale({ checkedAt: 1_000, latestVersion: "" }, 1_000 + day - 1)).toBe(false)
	})
	it("returns true past 24h", () => {
		expect(isStale({ checkedAt: 1_000, latestVersion: "" }, 1_000 + day + 1)).toBe(true)
	})
})

describe("isUpdateCheckDisabled", () => {
	let prev: string | undefined
	beforeEach(() => {
		prev = process.env.KIMCHI_NO_UPDATE_CHECK
		// biome-ignore lint/performance/noDelete: env-var cleanup needs a real delete.
		delete process.env.KIMCHI_NO_UPDATE_CHECK
	})
	afterEach(() => {
		// biome-ignore lint/performance/noDelete: same as above.
		if (prev === undefined) delete process.env.KIMCHI_NO_UPDATE_CHECK
		else process.env.KIMCHI_NO_UPDATE_CHECK = prev
	})

	it("returns false when unset", () => {
		expect(isUpdateCheckDisabled()).toBe(false)
	})
	it("returns false for empty string (matches gh CLI conventions)", () => {
		process.env.KIMCHI_NO_UPDATE_CHECK = ""
		expect(isUpdateCheckDisabled()).toBe(false)
	})
	it("returns true for any non-empty value", () => {
		process.env.KIMCHI_NO_UPDATE_CHECK = "1"
		expect(isUpdateCheckDisabled()).toBe(true)
		process.env.KIMCHI_NO_UPDATE_CHECK = "true"
		expect(isUpdateCheckDisabled()).toBe(true)
	})
})
