import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import "../../integrations/claude-code.js"
import { byId } from "../../integrations/registry.js"
import type { WizardState } from "../state.js"
import { runDoneStep } from "./done.js"

describe("runDoneStep", () => {
	beforeEach(() => {
		// @clack/prompts writes its UI to stdout; silence it so the test
		// runner output stays focused on assertions.
		vi.spyOn(process.stdout, "write").mockImplementation(() => true)
		vi.spyOn(console, "warn").mockImplementation(() => {})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	function baseState(): WizardState {
		return {
			apiKey: "test-key",
			mode: "override",
			scope: "global",
			selectedTools: ["claudecode"],
			telemetryEnabled: true,
			cancelled: false,
			back: false,
		}
	}

	function getClaudeCodeTool() {
		const tool = byId("claudecode")
		if (!tool) throw new Error("claudecode integration not registered — wiring bug")
		return tool
	}

	it("override mode invokes the integration writer", async () => {
		const tool = getClaudeCodeTool()
		const writeSpy = vi.spyOn(tool, "write").mockResolvedValue()

		const outcome = await runDoneStep(baseState())
		expect(writeSpy).toHaveBeenCalledWith("global", "test-key")
		expect(outcome.successes).toEqual(["Claude Code"])
		expect(outcome.failures).toEqual([])

		writeSpy.mockRestore()
	})

	it("inject mode skips the writer entirely", async () => {
		const tool = getClaudeCodeTool()
		const writeSpy = vi.spyOn(tool, "write").mockResolvedValue()

		const state = baseState()
		state.mode = "inject"
		const outcome = await runDoneStep(state)

		expect(writeSpy).not.toHaveBeenCalled()
		// Tool still listed as a "success" so the user knows it's wired —
		// just via the launcher rather than a config file.
		expect(outcome.successes).toEqual(["Claude Code"])
		expect(outcome.failures).toEqual([])

		writeSpy.mockRestore()
	})

	it("collects failures rather than aborting on a single broken writer", async () => {
		const tool = getClaudeCodeTool()
		const writeSpy = vi.spyOn(tool, "write").mockRejectedValue(new Error("disk full"))

		const outcome = await runDoneStep(baseState())
		expect(outcome.successes).toEqual([])
		expect(outcome.failures).toEqual([{ id: "claudecode", error: "disk full" }])

		writeSpy.mockRestore()
	})

	it("returns failures for unregistered tool ids without throwing", async () => {
		const state = baseState()
		// Cast through unknown to bypass the ToolId compile check — production
		// callers only ever pass valid ids, but defensive code in the step
		// shouldn't blow up if a future caller misuses this entry point.
		state.selectedTools = ["never-registered" as unknown as "claudecode"]
		const outcome = await runDoneStep(state)
		expect(outcome.successes).toEqual([])
		expect(outcome.failures[0]?.id).toBe("never-registered")
	})
})
