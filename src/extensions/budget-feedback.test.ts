import { beforeEach, describe, expect, it, vi } from "vitest"
import budgetFeedbackExtension from "./budget-feedback.js"

describe("budgetFeedbackExtension", () => {
	const mockSendMessage = vi.fn()
	const mockAPI = (): Parameters<typeof budgetFeedbackExtension>[0] =>
		({ sendMessage: mockSendMessage }) as unknown as Parameters<typeof budgetFeedbackExtension>[0]

	beforeEach(() => {
		vi.resetAllMocks()
		process.env.KIMCHI_SUBAGENT = undefined
		process.env.KIMCHI_SUBAGENT_SUPPORTS_BUDGET_FEEDBACK = undefined
	})

	it("is a no-op when KIMCHI_SUBAGENT is not set", () => {
		process.env.KIMCHI_SUBAGENT_SUPPORTS_BUDGET_FEEDBACK = "1"
		budgetFeedbackExtension(mockAPI())
		// Nothing to assert; no crash is the test.
		expect(mockSendMessage).not.toHaveBeenCalled()
	})

	it("is a no-op when KIMCHI_SUBAGENT_SUPPORTS_BUDGET_FEEDBACK is not set", () => {
		process.env.KIMCHI_SUBAGENT = "1"
		budgetFeedbackExtension(mockAPI())
		expect(mockSendMessage).not.toHaveBeenCalled()
	})
})
