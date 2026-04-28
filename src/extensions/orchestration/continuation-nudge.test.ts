import type { AssistantMessage, ToolResultMessage, UserMessage } from "@mariozechner/pi-ai"
import { describe, expect, it } from "vitest"
import {
	ContinuationNudge,
	EMPTY_TURN_NUDGE_TEXT,
	EmptyTurnNudge,
	type OrchestratorMessages,
	buildEmptyTurnNudgedMessages,
	stripStaleNudges,
} from "./continuation-nudge.js"

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

function makeToolResult(toolCallId: string, text: string): ToolResultMessage {
	return {
		role: "toolResult",
		toolCallId,
		toolName: "subagent",
		content: [{ type: "text", text }],
		isError: false,
		timestamp: Date.now(),
	}
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

function lastMessage(messages: OrchestratorMessages): OrchestratorMessages[number] {
	return messages[messages.length - 1]
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

describe("buildEmptyTurnNudgedMessages", () => {
	it("returns undefined when there is no assistant message yet", () => {
		expect(buildEmptyTurnNudgedMessages([makeUser("start")])).toBeUndefined()
	})

	it("returns undefined when the last assistant message has text", () => {
		const messages: OrchestratorMessages = [makeUser("q"), textOnlyMessage]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("returns undefined when the last assistant message has both text and a tool call", () => {
		const messages: OrchestratorMessages = [makeUser("q"), textAndToolCallMessage, makeToolResult("call_2", "ok")]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("returns undefined when tool calls are present but no tool results have arrived yet", () => {
		const messages: OrchestratorMessages = [makeUser("q"), toolCallMessage]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("appends a custom-role nudge when tool-call-only assistant is followed by tool results", () => {
		const messages: OrchestratorMessages = [makeUser("q"), toolCallMessage, makeToolResult("call_1", "done")]
		const nudged = buildEmptyTurnNudgedMessages(messages)
		expect(nudged).toBeDefined()
		expect(nudged?.length).toBe(messages.length + 1)
		const appended = lastMessage(nudged as OrchestratorMessages)
		expect(appended.role).toBe("custom")
	})

	it("does not mutate the caller's messages array", () => {
		const messages: OrchestratorMessages = [makeUser("q"), toolCallMessage, makeToolResult("call_1", "done")]
		const originalLength = messages.length
		buildEmptyTurnNudgedMessages(messages)
		expect(messages.length).toBe(originalLength)
	})

	it("uses the most recent assistant message (ignores older ones)", () => {
		const messages: OrchestratorMessages = [
			makeUser("q1"),
			textOnlyMessage,
			makeUser("q2"),
			toolCallMessage,
			makeToolResult("call_1", "done"),
		]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeDefined()
	})
})

describe("EmptyTurnNudge", () => {
	const emptyMessage = makeAssistant([])
	const whitespaceOnlyMessage = makeAssistant([{ type: "text", text: "   \n  " }])

	it("arms after an empty assistant turn", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(emptyMessage)
		expect(guard.shouldNudge()).toBe(true)
	})

	it("does not arm after a turn with text", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(textOnlyMessage)
		expect(guard.shouldNudge()).toBe(false)
	})

	it("does not arm after a turn with tool calls", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(toolCallMessage)
		expect(guard.shouldNudge()).toBe(false)
	})

	it("does not arm after a turn with both text and tool calls", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(textAndToolCallMessage)
		expect(guard.shouldNudge()).toBe(false)
	})

	it("treats whitespace-only text as empty", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(whitespaceOnlyMessage)
		expect(guard.shouldNudge()).toBe(true)
	})

	it("disarms after shouldNudge returns true", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(emptyMessage)
		expect(guard.shouldNudge()).toBe(true)
		expect(guard.shouldNudge()).toBe(false)
	})

	it("disarms after a non-empty turn follows an empty one", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(emptyMessage)
		guard.evaluateTurn(textOnlyMessage)
		expect(guard.shouldNudge()).toBe(false)
	})

	it("resets on new user input", () => {
		const guard = new EmptyTurnNudge()
		guard.evaluateTurn(emptyMessage)
		guard.resetForNewUserInput()
		expect(guard.shouldNudge()).toBe(false)
	})
})
