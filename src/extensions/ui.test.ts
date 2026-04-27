import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Extract the function for testing
function shouldTransformToQuit(text: string): boolean {
	const trimmed = text.trim()
	return trimmed === "exit"
}

describe("shouldTransformToQuit", () => {
	it("returns true for exact 'exit' input", () => {
		expect(shouldTransformToQuit("exit")).toBe(true)
	})

	it("returns true for 'exit' with leading/trailing whitespace", () => {
		expect(shouldTransformToQuit("  exit  ")).toBe(true)
		expect(shouldTransformToQuit("\texit\n")).toBe(true)
		expect(shouldTransformToQuit("  exit")).toBe(true)
		expect(shouldTransformToQuit("exit  ")).toBe(true)
	})

	it("returns false for '/exit' command", () => {
		expect(shouldTransformToQuit("/exit")).toBe(false)
	})

	it("returns false for 'EXIT' (case sensitive)", () => {
		expect(shouldTransformToQuit("EXIT")).toBe(false)
		expect(shouldTransformToQuit("Exit")).toBe(false)
	})

	it("returns false for empty input", () => {
		expect(shouldTransformToQuit("")).toBe(false)
		expect(shouldTransformToQuit("   ")).toBe(false)
	})

	it("returns false for other text", () => {
		expect(shouldTransformToQuit("hello")).toBe(false)
		expect(shouldTransformToQuit("exit now")).toBe(false)
		expect(shouldTransformToQuit("please exit")).toBe(false)
		expect(shouldTransformToQuit("quit")).toBe(false)
	})
})

describe("exit command behavior", () => {
	let exitSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		exitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never)
	})

	afterEach(() => {
		exitSpy.mockRestore()
	})

	it("calls process.exit(0) when 'exit' is typed", () => {
		// Simulate what the input handler does
		if (shouldTransformToQuit("exit")) {
			process.exit(0)
		}

		expect(exitSpy).toHaveBeenCalledWith(0)
	})

	it("does not call process.exit for non-exit input", () => {
		if (shouldTransformToQuit("hello")) {
			process.exit(0)
		}

		expect(exitSpy).not.toHaveBeenCalled()
	})

	it("does not call process.exit for '/exit' command", () => {
		if (shouldTransformToQuit("/exit")) {
			process.exit(0)
		}

		expect(exitSpy).not.toHaveBeenCalled()
	})
})
