import type { AssistantMessage } from "@mariozechner/pi-ai"
import { describe, expect, it } from "vitest"
import { ContinuationNudge } from "./continuation-nudge.js"

function makeAssistant(content: AssistantMessage["content"]): AssistantMessage {
	return {
		role: "assistant",
		content,
		api: "anthropic-messages",
		provider: "anthropic",
		model: "kimi-k2.5",
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
		},
		stopReason: "stop",
		timestamp: Date.now(),
	}
}

const textOnlyMessage = makeAssistant([{ type: "text", text: "I will delegate this to Nemotron." }])

const toolCallMessage = makeAssistant([
	{
		type: "toolCall",
		id: "call_1",
		name: "subagent",
		arguments: { provider: "kimchi-dev", model: "nemotron-3-super-fp4", prompt: "build it" },
	},
])

const textAndToolCallMessage = makeAssistant([
	{ type: "text", text: "Delegating now." },
	{
		type: "toolCall",
		id: "call_2",
		name: "subagent",
		arguments: { provider: "kimchi-dev", model: "nemotron-3-super-fp4", prompt: "build it" },
	},
])

const emptyTextMessage = makeAssistant([{ type: "text", text: "" }])
const whitespaceTextMessage = makeAssistant([{ type: "text", text: "   \n  " }])

describe("ContinuationNudge.evaluateTurn", () => {
	it("nudges a text-only first turn after user input", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(true)
	})

	it("does not nudge when the turn contains a tool call", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(toolCallMessage).shouldNudge).toBe(false)
	})

	it("does not nudge when the turn has both text and a tool call", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textAndToolCallMessage).shouldNudge).toBe(false)
	})

	it("does not nudge when the turn has no text at all", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(makeAssistant([])).shouldNudge).toBe(false)
	})

	it("treats empty-string text as no text", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(emptyTextMessage).shouldNudge).toBe(false)
	})

	it("treats whitespace-only text as no text", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(whitespaceTextMessage).shouldNudge).toBe(false)
	})

	it("nudges at most once per user-input cycle", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(true)
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(false)
	})

	it("does not nudge when any tool has already been called this cycle", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		guard.recordToolCall()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(false)
	})

	it("re-arms after a new user input", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(true)
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(true)
	})

	it("re-arms tool-call tracking on reset", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		guard.recordToolCall()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(false)
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage).shouldNudge).toBe(true)
	})

	it("ignores thinking-only turns (no text, no tool call)", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		const thinkingOnly = makeAssistant([{ type: "thinking", thinking: "Let me reason..." }])
		expect(guard.evaluateTurn(thinkingOnly).shouldNudge).toBe(false)
	})
})
