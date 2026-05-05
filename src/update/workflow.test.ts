import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { GitHubClient, ReleaseInfo, Repo } from "./github.js"
import { checkForUpdate } from "./workflow.js"

const REPO: Repo = { owner: "castai", name: "kimchi-dev", binary: "kimchi" }

function fakeClient(release: ReleaseInfo): GitHubClient {
	return {
		latestRelease: async () => release,
	} as unknown as GitHubClient
}

describe("checkForUpdate version comparison", () => {
	let tmp: string
	let prevHome: string | undefined
	let prevXdg: string | undefined

	beforeEach(() => {
		tmp = mkdtempSync(join(tmpdir(), "kimchi-workflow-test-"))
		prevHome = process.env.HOME
		prevXdg = process.env.XDG_CACHE_HOME
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

	it("does not flag a v-prefixed older tag as an update", async () => {
		const client = fakeClient({ tagName: "v0.0.23", htmlUrl: "https://example/release" })
		const result = await checkForUpdate({ repo: REPO, currentVersion: "0.1.0", skipCache: true, client })
		expect(result.hasUpdate).toBe(false)
		// display string keeps the "v" — only the comparison should be normalized
		expect(result.latestVersion).toBe("v0.0.23")
	})

	it("flags a v-prefixed newer tag as an update", async () => {
		const client = fakeClient({ tagName: "v0.2.0", htmlUrl: "https://example/release" })
		const result = await checkForUpdate({ repo: REPO, currentVersion: "0.1.0", skipCache: true, client })
		expect(result.hasUpdate).toBe(true)
	})

	it("still works for an unprefixed newer tag", async () => {
		const client = fakeClient({ tagName: "0.2.0", htmlUrl: "https://example/release" })
		const result = await checkForUpdate({ repo: REPO, currentVersion: "0.1.0", skipCache: true, client })
		expect(result.hasUpdate).toBe(true)
	})
})
