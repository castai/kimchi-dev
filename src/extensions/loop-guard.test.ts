import { describe, expect, it } from "vitest"
import { CALL_HISTORY_WINDOW, LoopGuard, MAX_CONSECUTIVE_FAILURES, MAX_REPEATED_CALLS } from "./loop-guard.js"

describe("LoopGuard.reset", () => {
	it("clears consecutive failure count", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES - 1; i++) {
			guard.recordResult(true)
		}
		guard.reset()
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})

	it("clears call history", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		guard.reset()
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})

	it("clears triggered flag", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES; i++) {
			guard.recordResult(true)
		}
		guard.checkAndRecord("bash", { command: "ls" })
		expect(guard.isTriggered()).toBe(true)
		guard.reset()
		expect(guard.isTriggered()).toBe(false)
	})
})

describe("LoopGuard.isTriggered", () => {
	it("returns false initially", () => {
		const guard = new LoopGuard()
		expect(guard.isTriggered()).toBe(false)
	})

	it("returns true after consecutive failure block", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES; i++) {
			guard.recordResult(true)
		}
		guard.checkAndRecord("bash", { command: "ls" })
		expect(guard.isTriggered()).toBe(true)
	})

	it("returns true after repeated call block", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		guard.checkAndRecord("bash", { command: "ls" })
		expect(guard.isTriggered()).toBe(true)
	})

	it("returns false for allowed calls even near thresholds", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES - 1; i++) {
			guard.recordResult(true)
		}
		guard.checkAndRecord("bash", { command: "ls" })
		expect(guard.isTriggered()).toBe(false)
	})
})

describe("LoopGuard.recordResult", () => {
	it("increments consecutive failures on error", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES - 1; i++) {
			guard.recordResult(true)
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })

		guard.recordResult(true)
		const blocked = guard.checkAndRecord("bash", { command: "other" })
		expect(blocked.block).toBe(true)
	})

	it("resets consecutive failures on success", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES - 1; i++) {
			guard.recordResult(true)
		}
		guard.recordResult(false)
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES - 1; i++) {
			guard.recordResult(true)
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})
})

describe("LoopGuard.checkAndRecord - consecutive failure blocking", () => {
	const cases: Array<{ failures: number; expectBlock: boolean }> = [
		{ failures: MAX_CONSECUTIVE_FAILURES - 1, expectBlock: false },
		{ failures: MAX_CONSECUTIVE_FAILURES, expectBlock: true },
		{ failures: MAX_CONSECUTIVE_FAILURES + 1, expectBlock: true },
	]

	for (const { failures, expectBlock } of cases) {
		it(`blocks=${expectBlock} after ${failures} consecutive failures`, () => {
			const guard = new LoopGuard()
			for (let i = 0; i < failures; i++) {
				guard.recordResult(true)
			}
			const result = guard.checkAndRecord("bash", { command: "ls" })
			expect(result.block).toBe(expectBlock)
		})
	}

	it("includes failure count in block reason", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES; i++) {
			guard.recordResult(true)
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result.reason).toContain(String(MAX_CONSECUTIVE_FAILURES))
	})

	it("does not add to call history when blocking on consecutive failures", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_CONSECUTIVE_FAILURES; i++) {
			guard.recordResult(true)
		}
		guard.checkAndRecord("bash", { command: "ls" })
		guard.reset()
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})
})

describe("LoopGuard.checkAndRecord - repeated call blocking", () => {
	const cases: Array<{ calls: number; expectBlock: boolean }> = [
		{ calls: MAX_REPEATED_CALLS - 1, expectBlock: false },
		{ calls: MAX_REPEATED_CALLS, expectBlock: true },
		{ calls: MAX_REPEATED_CALLS + 1, expectBlock: true },
	]

	for (const { calls, expectBlock } of cases) {
		it(`blocks=${expectBlock} after ${calls} identical previous calls`, () => {
			const guard = new LoopGuard()
			for (let i = 0; i < calls; i++) {
				guard.checkAndRecord("bash", { command: "ls" })
			}
			const result = guard.checkAndRecord("bash", { command: "ls" })
			expect(result.block).toBe(expectBlock)
		})
	}

	it("includes tool name and repeat count in block reason", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result.reason).toContain("bash")
		expect(result.reason).toContain(String(MAX_REPEATED_CALLS + 1))
	})

	it("does not block different tool names", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		const result = guard.checkAndRecord("read", { file_path: "/tmp/foo" })
		expect(result).toEqual({ block: false })
	})

	it("does not block same tool with different arguments", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		const result = guard.checkAndRecord("bash", { command: "pwd" })
		expect(result).toEqual({ block: false })
	})

	it("treats argument objects with same keys in different order as identical", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { b: 2, a: 1 })
		}
		const result = guard.checkAndRecord("bash", { a: 1, b: 2 })
		expect(result.block).toBe(true)
	})

	it("treats undefined values as equivalent to missing keys", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		const result = guard.checkAndRecord("bash", { command: "ls", timeout: undefined })
		expect(result.block).toBe(true)
	})

	it("does not add to history when blocking on repeated call", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		guard.checkAndRecord("bash", { command: "ls" })
		guard.checkAndRecord("bash", { command: "ls" })

		guard.reset()
		for (let i = 0; i < MAX_REPEATED_CALLS - 1; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})
})

describe("LoopGuard.checkAndRecord - call history window", () => {
	it("evicts oldest entries beyond window size", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("bash", { command: "ls" })
		}
		for (let i = 0; i < CALL_HISTORY_WINDOW; i++) {
			guard.checkAndRecord("read", { file_path: `/file${i}` })
		}
		const result = guard.checkAndRecord("bash", { command: "ls" })
		expect(result).toEqual({ block: false })
	})
})

describe("LoopGuard.checkAndRecord - empty params", () => {
	it("handles empty argument objects", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < MAX_REPEATED_CALLS; i++) {
			guard.checkAndRecord("mcp", {})
		}
		const result = guard.checkAndRecord("mcp", {})
		expect(result.block).toBe(true)
	})
})
