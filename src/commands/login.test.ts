import { afterEach, beforeEach, expect, it, vi } from "vitest"

vi.mock("@clack/prompts", () => ({ spinner: () => ({ start: vi.fn(), stop: vi.fn() }) }))
vi.mock("../cli-auth/index.js", () => ({ authenticateViaBrowser: vi.fn() }))
vi.mock("../config.js", async (importOriginal) => ({
	...(await importOriginal<typeof import("../config.js")>()),
	writeApiKey: vi.fn(),
}))
vi.mock("../setup-wizard/shell-profile.js", () => ({ exportEnvToShellProfile: vi.fn() }))

import { authenticateViaBrowser } from "../cli-auth/index.js"
import { writeApiKey } from "../config.js"
import { exportEnvToShellProfile } from "../setup-wizard/shell-profile.js"
import { runLogin } from "./login.js"

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(writeApiKey).mockReset()
	vi.mocked(authenticateViaBrowser).mockResolvedValue({ token: "new-key" })
	vi.spyOn(console, "warn").mockImplementation(() => {})
	vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

it.each(["", "new-key", "old-key"])("saves login without exporting and warns only on mismatch (%s)", async (envKey) => {
	vi.stubEnv("KIMCHI_API_KEY", envKey)
	expect(await runLogin([])).toBe(0)
	expect(writeApiKey).toHaveBeenCalledWith("new-key")
	expect(exportEnvToShellProfile).not.toHaveBeenCalled()
	expect(process.env.KIMCHI_API_KEY).toBe(envKey)
	if (envKey === "old-key") {
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("unset KIMCHI_API_KEY"))
	} else {
		expect(console.warn).not.toHaveBeenCalled()
	}
})

it("does not announce a saved login when saving fails", async () => {
	vi.stubEnv("KIMCHI_API_KEY", "old-key")
	vi.mocked(writeApiKey).mockImplementation(() => {
		throw new Error("disk full")
	})
	expect(await runLogin([])).toBe(1)
	expect(console.warn).not.toHaveBeenCalled()
	expect(exportEnvToShellProfile).not.toHaveBeenCalled()
})
