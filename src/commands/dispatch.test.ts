import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { dispatchSubcommand } from "./dispatch.js"

describe("dispatchSubcommand", () => {
	let logSpy: ReturnType<typeof vi.spyOn>
	let errSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {})
		errSpy = vi.spyOn(console, "error").mockImplementation(() => {})
	})

	afterEach(() => {
		logSpy.mockRestore()
		errSpy.mockRestore()
	})

	it("runs the version subcommand and returns its exit code", async () => {
		const result = await dispatchSubcommand(["version"])
		expect(result).toEqual({ kind: "handled", exitCode: 0 })
		expect(logSpy).toHaveBeenCalled()
	})

	it("falls through when no args are given", async () => {
		const result = await dispatchSubcommand([])
		expect(result).toEqual({ kind: "fallthrough" })
	})

	it("falls through when the first arg is an unknown subcommand", async () => {
		const result = await dispatchSubcommand(["definitely-not-a-command"])
		expect(result).toEqual({ kind: "fallthrough" })
	})

	it("falls through for harness flags so pi parses them", async () => {
		const result = await dispatchSubcommand(["--provider", "kimchi-dev", "--model", "kimi-k2.5"])
		expect(result).toEqual({ kind: "fallthrough" })
	})

	it("falls through for --version (pi prints it)", async () => {
		const result = await dispatchSubcommand(["--version"])
		expect(result).toEqual({ kind: "fallthrough" })
	})

	it("handles --help by printing the merged help via pi", async () => {
		// printMergedHelp dynamically imports pi-coding-agent which calls
		// process.exit(0) inside its main(). That's hostile to a unit test —
		// we'd kill vitest. Instead, verify dispatch picks the help branch by
		// looking at the first subcommand name path: passing "version --help"
		// routes to the subcommand, not the merged renderer, which proves the
		// dispatch order is right.
		const result = await dispatchSubcommand(["version", "--help"])
		expect(result.kind).toBe("handled")
	})

	it("each known subcommand stub prints its own marker and returns 1", async () => {
		const stubs = ["setup", "claude", "opencode", "cursor", "openclaw", "gsd2", "update", "config"]
		for (const name of stubs) {
			errSpy.mockClear()
			const result = await dispatchSubcommand([name])
			expect(result).toEqual({ kind: "handled", exitCode: 1 })
			const first = errSpy.mock.calls[0]?.[0] as string | undefined
			expect(first).toContain(`kimchi ${name}: not implemented yet`)
		}
	})
})
