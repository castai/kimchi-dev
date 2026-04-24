import type { AgentMessage } from "@mariozechner/pi-agent-core"
import type { AssistantMessage, ToolResultMessage, UserMessage } from "@mariozechner/pi-ai"
import { describe, expect, it } from "vitest"
import { ContinuationNudge, EMPTY_TURN_NUDGE_TEXT, buildEmptyTurnNudgedMessages } from "./continuation-nudge.js"

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

function lastMessage(messages: AgentMessage[]): AgentMessage {
	return messages[messages.length - 1]
}

describe("buildEmptyTurnNudgedMessages", () => {
	it("returns undefined when there is no assistant message yet", () => {
		expect(buildEmptyTurnNudgedMessages([makeUser("start")])).toBeUndefined()
	})

	it("returns undefined when the last assistant message has text", () => {
		const messages: AgentMessage[] = [makeUser("q"), textOnlyMessage]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("returns undefined when the last assistant message has both text and a tool call", () => {
		const messages: AgentMessage[] = [makeUser("q"), textAndToolCallMessage, makeToolResult("call_2", "ok")]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("returns undefined when tool calls are present but no tool results have arrived yet", () => {
		const messages: AgentMessage[] = [makeUser("q"), toolCallMessage]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeUndefined()
	})

	it("appends a user-role nudge when tool-call-only assistant is followed by tool results", () => {
		const messages: AgentMessage[] = [makeUser("q"), toolCallMessage, makeToolResult("call_1", "done")]
		const nudged = buildEmptyTurnNudgedMessages(messages)
		expect(nudged).toBeDefined()
		expect(nudged?.length).toBe(messages.length + 1)
		const appended = lastMessage(nudged as AgentMessage[])
		expect(appended.role).toBe("user")
		expect((appended as UserMessage).content).toEqual([{ type: "text", text: EMPTY_TURN_NUDGE_TEXT }])
	})

	it("does not mutate the caller's messages array", () => {
		const messages: AgentMessage[] = [makeUser("q"), toolCallMessage, makeToolResult("call_1", "done")]
		const originalLength = messages.length
		buildEmptyTurnNudgedMessages(messages)
		expect(messages.length).toBe(originalLength)
	})

	it("uses the most recent assistant message (ignores older ones)", () => {
		// An earlier text-only assistant turn should not disqualify a later tool-call-only drift.
		const messages: AgentMessage[] = [
			makeUser("q1"),
			textOnlyMessage,
			makeUser("q2"),
			toolCallMessage,
			makeToolResult("call_1", "done"),
		]
		expect(buildEmptyTurnNudgedMessages(messages)).toBeDefined()
	})
})
