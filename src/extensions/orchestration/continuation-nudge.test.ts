import type { AssistantMessage, UserMessage } from "@mariozechner/pi-ai"
import { describe, expect, it } from "vitest"
import { ContinuationNudge, type OrchestratorMessages, stripStaleNudges } from "./continuation-nudge.js"

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
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(true)
	})

	it("does not nudge when the turn contains a tool call", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(toolCallMessage)).toBe(false)
	})

	it("does not nudge when the turn has both text and a tool call", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textAndToolCallMessage)).toBe(false)
	})

	it("does not nudge when the turn has no text at all", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(makeAssistant([]))).toBe(false)
	})

	it("treats empty-string text as no text", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(emptyTextMessage)).toBe(false)
	})

	it("treats whitespace-only text as no text", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(whitespaceTextMessage)).toBe(false)
	})

	it("nudges at most once per user-input cycle", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(true)
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(false)
	})

	it("does not nudge when any tool has already been called this cycle", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		guard.recordToolCall()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(false)
	})

	it("re-arms after a new user input", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(true)
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(true)
	})

	it("re-arms tool-call tracking on reset", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		guard.recordToolCall()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(false)
		guard.resetForNewUserInput()
		expect(guard.evaluateTurn(textOnlyMessage)).toBe(true)
	})

	it("ignores thinking-only turns (no text, no tool call)", () => {
		const guard = new ContinuationNudge()
		guard.resetForNewUserInput()
		const thinkingOnly = makeAssistant([{ type: "thinking", thinking: "Let me reason..." }])
		expect(guard.evaluateTurn(thinkingOnly)).toBe(false)
	})
})

function makeUser(text: string): UserMessage {
	return { role: "user", content: [{ type: "text", text }], timestamp: Date.now() }
}

function makeNudge(): OrchestratorMessages[number] {
	return {
		role: "custom" as const,
		customType: "nudge",
		content: [{ type: "text" as const, text: "nudge" }],
		display: false,
		timestamp: Date.now(),
	}
}

describe("stripStaleNudges", () => {
	it("returns the same array when there are no nudge messages", () => {
		const messages: OrchestratorMessages = [makeUser("q"), textOnlyMessage]
		expect(stripStaleNudges(messages)).toBe(messages)
	})

	it("strips a nudge that precedes an assistant response", () => {
		const nudge = makeNudge()
		const messages: OrchestratorMessages = [makeUser("q"), nudge, textOnlyMessage]
		const result = stripStaleNudges(messages)
		expect(result).not.toBe(messages)
		expect(result).toHaveLength(2)
		expect(result).not.toContainEqual(nudge)
	})

	it("keeps a nudge that comes after the last assistant message", () => {
		const nudge = makeNudge()
		const messages: OrchestratorMessages = [makeUser("q"), textOnlyMessage, nudge]
		const result = stripStaleNudges(messages)
		expect(result).toBe(messages)
	})

	it("strips multiple stale nudges", () => {
		const messages: OrchestratorMessages = [
			makeUser("q1"),
			makeNudge(),
			textOnlyMessage,
			makeUser("q2"),
			makeNudge(),
			toolCallMessage,
		]
		const result = stripStaleNudges(messages)
		expect(result.filter((m) => m.role === "custom")).toHaveLength(0)
	})

	it("does not strip non-nudge custom messages", () => {
		const other = { role: "custom" as const, customType: "other", content: "x", display: false, timestamp: Date.now() }
		const messages: OrchestratorMessages = [makeUser("q"), other, textOnlyMessage]
		const result = stripStaleNudges(messages)
		expect(result).toContainEqual(other)
	})
})
