import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { isBareExitAlias, quitApplication } from "./exit-utils.js"

describe("isBareExitAlias", () => {
	it("returns true for exact 'exit' input", () => {
		expect(isBareExitAlias("exit")).toBe(true)
	})

	it("returns true for 'exit' with leading/trailing whitespace", () => {
		expect(isBareExitAlias("  exit  ")).toBe(true)
		expect(isBareExitAlias("\texit\n")).toBe(true)
		expect(isBareExitAlias("  exit")).toBe(true)
		expect(isBareExitAlias("exit  ")).toBe(true)
	})

	it("returns false for '/exit' command", () => {
		expect(isBareExitAlias("/exit")).toBe(false)
	})

	it("returns false for 'EXIT' (case sensitive)", () => {
		expect(isBareExitAlias("EXIT")).toBe(false)
		expect(isBareExitAlias("Exit")).toBe(false)
	})

	it("returns false for empty input", () => {
		expect(isBareExitAlias("")).toBe(false)
		expect(isBareExitAlias("   ")).toBe(false)
	})

	it("returns false for other text", () => {
		expect(isBareExitAlias("hello")).toBe(false)
		expect(isBareExitAlias("exit now")).toBe(false)
		expect(isBareExitAlias("please exit")).toBe(false)
		expect(isBareExitAlias("quit")).toBe(false)
	})
})

describe("exit command behavior", () => {
	// biome-ignore lint/suspicious/noExplicitAny: vi.spyOn types differ between vitest versions
	let exitSpy: any

	beforeEach(() => {
		exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
	})

	afterEach(() => {
		exitSpy.mockRestore()
	})

	it("calls process.exit(0) when 'exit' is typed", () => {
		// Simulate what the input handler does
		if (isBareExitAlias("exit")) {
			quitApplication()
		}

		expect(exitSpy).toHaveBeenCalledWith(0)
	})

	it("does not call process.exit for non-exit input", () => {
		if (isBareExitAlias("hello")) {
			quitApplication()
		}

		expect(exitSpy).not.toHaveBeenCalled()
	})

	it("does not call process.exit for '/exit' command", () => {
		if (isBareExitAlias("/exit")) {
			quitApplication()
		}

		expect(exitSpy).not.toHaveBeenCalled()
	})

	it("calls process.exit(0) via quitApplication for /exit command", async () => {
		// Simulate what the command handler does
		quitApplication()

		expect(exitSpy).toHaveBeenCalledWith(0)
	})
})
