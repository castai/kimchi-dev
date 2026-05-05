import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import budgetFeedbackExtension, { buildWarningText, nextBudgetState, parseBudgetConfig } from "./budget-feedback.js"

describe("parseBudgetConfig", () => {
	it("returns null for undefined", () => {
		expect(parseBudgetConfig(undefined)).toBeNull()
	})

	it("returns null for empty string", () => {
		expect(parseBudgetConfig("")).toBeNull()
	})

	it("returns null for non-numeric", () => {
		expect(parseBudgetConfig("abc")).toBeNull()
	})

	it("returns null for zero or negative", () => {
		expect(parseBudgetConfig("0")).toBeNull()
		expect(parseBudgetConfig("-100")).toBeNull()
	})

	it("returns config with warning threshold at 80%", () => {
		expect(parseBudgetConfig("100000")).toEqual({ softLimit: 100_000, warningThreshold: 80_000 })
	})
})

describe("nextBudgetState", () => {
	const config = { softLimit: 100_000, warningThreshold: 80_000 }

	it("stays normal below 80%", () => {
		expect(nextBudgetState(79_999, config, "normal")).toBe("normal")
	})

	it("transitions to warning above 80%", () => {
		expect(nextBudgetState(80_001, config, "normal")).toBe("warning")
	})

	it("stays warning between 80% and 100%", () => {
		expect(nextBudgetState(95_000, config, "warning")).toBe("warning")
	})

	it("transitions to exceeded above 100%", () => {
		expect(nextBudgetState(100_001, config, "warning")).toBe("exceeded")
	})

	it("can jump from normal directly to exceeded", () => {
		expect(nextBudgetState(150_000, config, "normal")).toBe("exceeded")
	})

	it("never regresses from exceeded back to warning", () => {
		expect(nextBudgetState(85_000, config, "exceeded")).toBe("exceeded")
	})
})

describe("buildWarningText", () => {
	const config = { softLimit: 100_000, warningThreshold: 80_000 }

	it("returns null for normal state", () => {
		expect(buildWarningText(50_000, config, "normal")).toBeNull()
	})

	it("returns warning text with percent for warning state", () => {
		const text = buildWarningText(85_000, config, "warning")
		expect(text).toContain("budget warning")
		expect(text).toContain("85%")
		expect(text).toContain("100,000")
	})

	it("returns exceeded text for exceeded state", () => {
		const text = buildWarningText(120_000, config, "exceeded")
		expect(text).toContain("budget exceeded")
		expect(text).toContain("Finishing current action")
	})
})

describe("budgetFeedbackExtension turn_end handler", () => {
	let savedKimchiSubagent: string | undefined
	let savedSoftBudget: string | undefined

	beforeEach(() => {
		savedKimchiSubagent = process.env.KIMCHI_SUBAGENT
		savedSoftBudget = process.env.KIMCHI_SUBAGENT_SOFT_BUDGET
	})

	afterEach(() => {
		if (savedKimchiSubagent === undefined) {
			// biome-ignore lint/performance/noDelete: process.env coerces assignments to strings, so `= undefined` would set it to the literal "undefined"
			delete process.env.KIMCHI_SUBAGENT
		} else {
			process.env.KIMCHI_SUBAGENT = savedKimchiSubagent
		}
		if (savedSoftBudget === undefined) {
			// biome-ignore lint/performance/noDelete: see above
			delete process.env.KIMCHI_SUBAGENT_SOFT_BUDGET
		} else {
			process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = savedSoftBudget
		}
	})

	const setup = () => {
		const handlers = new Map<string, (event: unknown) => void>()
		const sendMessage = vi.fn()
		const api = {
			on: (eventType: string, handler: (event: unknown) => void) => {
				handlers.set(eventType, handler)
			},
			sendMessage,
		} as unknown as Parameters<typeof budgetFeedbackExtension>[0]
		return { api, handlers, sendMessage }
	}

	const fireTurnEnd = (handler: (event: unknown) => void, input: number, output: number) => {
		handler({
			type: "turn_end",
			turnIndex: 0,
			message: { role: "assistant", usage: { input, output, cacheRead: 0, cacheWrite: 0 } },
			toolResults: [],
		})
	}

	it("does not register handler when KIMCHI_SUBAGENT is unset", () => {
		// biome-ignore lint/performance/noDelete: process.env coerces assignments to strings
		delete process.env.KIMCHI_SUBAGENT
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers } = setup()
		budgetFeedbackExtension(api)
		expect(handlers.has("turn_end")).toBe(false)
	})

	it("does not register handler when soft budget is unset", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		// biome-ignore lint/performance/noDelete: process.env coerces assignments to strings
		delete process.env.KIMCHI_SUBAGENT_SOFT_BUDGET
		const { api, handlers } = setup()
		budgetFeedbackExtension(api)
		expect(handlers.has("turn_end")).toBe(false)
	})

	it("does not inject below warning threshold", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")
		fireTurnEnd(handler, 50_000, 0)
		expect(sendMessage).not.toHaveBeenCalled()
	})

	it("injects exactly once when crossing 80%", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")

		fireTurnEnd(handler, 70_000, 0) // below — no inject
		fireTurnEnd(handler, 15_000, 0) // crosses 80% (cumulative 85k) — inject
		fireTurnEnd(handler, 5_000, 0) // still in warning band (90k) — no inject

		expect(sendMessage).toHaveBeenCalledTimes(1)
		const call = sendMessage.mock.calls[0]
		expect(call[0].customType).toBe("budget_warning")
		expect(call[0].display).toBe(false)
		expect(call[0].content[0].text).toContain("budget warning")
		expect(call[1]).toEqual({ triggerTurn: true })
	})

	it("injects again when crossing 100% (exceeded notice)", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")

		fireTurnEnd(handler, 85_000, 0) // crosses 80% — warning
		fireTurnEnd(handler, 20_000, 0) // crosses 100% (105k) — exceeded
		fireTurnEnd(handler, 10_000, 0) // already exceeded — no inject

		expect(sendMessage).toHaveBeenCalledTimes(2)
		expect(sendMessage.mock.calls[0][0].customType).toBe("budget_warning")
		expect(sendMessage.mock.calls[0][0].content[0].text).toContain("budget warning")
		expect(sendMessage.mock.calls[1][0].customType).toBe("budget_exceeded")
		expect(sendMessage.mock.calls[1][0].content[0].text).toContain("budget exceeded")
	})

	it("excludes cache-read tokens from the count", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")

		// 50k input + 0 output, plus 200k cache-read which should be ignored
		handler({
			type: "turn_end",
			turnIndex: 0,
			message: {
				role: "assistant",
				usage: { input: 50_000, output: 0, cacheRead: 200_000, cacheWrite: 0 },
			},
			toolResults: [],
		})
		expect(sendMessage).not.toHaveBeenCalled()
	})

	it("ignores turn_end events without usage", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")

		handler({ type: "turn_end", turnIndex: 0, message: { role: "user" }, toolResults: [] })
		expect(sendMessage).not.toHaveBeenCalled()
	})

	it("can jump straight from normal to exceeded in one turn", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		process.env.KIMCHI_SUBAGENT_SOFT_BUDGET = "100000"
		const { api, handlers, sendMessage } = setup()
		budgetFeedbackExtension(api)
		const handler = handlers.get("turn_end")
		if (!handler) throw new Error("handler not registered")

		fireTurnEnd(handler, 150_000, 0)
		expect(sendMessage).toHaveBeenCalledTimes(1)
		expect(sendMessage.mock.calls[0][0].customType).toBe("budget_exceeded")
		expect(sendMessage.mock.calls[0][0].content[0].text).toContain("budget exceeded")
	})
})
