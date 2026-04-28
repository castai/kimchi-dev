import type { TextContent, ToolResultMessage } from "@mariozechner/pi-ai"
import type { AgentMessage } from "@mariozechner/pi-coding-agent"
import { describe, expect, it } from "vitest"
import { computeCutoff, pruneToolResult } from "./context-compactor.js"

// helpers
function makeToolResult(toolName: string, text: string, isError = false): ToolResultMessage {
	return {
		role: "toolResult",
		toolCallId: "id-1",
		toolName,
		content: [{ type: "text", text }],
		details: undefined,
		isError,
		timestamp: 0,
	}
}

function makeUser(): AgentMessage {
	return { role: "user", content: [{ type: "text", text: "hi" }], timestamp: 0 } as AgentMessage
}

function makeAssistant(): AgentMessage {
	return {
		role: "assistant",
		content: [{ type: "text", text: "ok" }],
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
		},
		model: "test",
		timestamp: 0,
	} as AgentMessage
}

// ── computeCutoff ────────────────────────────────────────────────────────────

describe("computeCutoff", () => {
	const PROTECT_WINDOW = 4
	const MAX_PROTECTED_CHARS = 100

	it("returns 0 when messages fit within protected budget", () => {
		const messages: AgentMessage[] = [
			makeUser(),
			makeAssistant(),
			makeToolResult("bash", "small") as AgentMessage,
			makeUser(),
		]
		expect(computeCutoff(messages, PROTECT_WINDOW, MAX_PROTECTED_CHARS)).toBe(0)
	})

	it("returns 0 when array length <= PROTECT_WINDOW", () => {
		const messages: AgentMessage[] = [makeToolResult("bash", "x".repeat(200)) as AgentMessage]
		expect(computeCutoff(messages, PROTECT_WINDOW, MAX_PROTECTED_CHARS)).toBe(0)
	})

	it("cuts at PROTECT_WINDOW boundary when chars are small", () => {
		// 6 messages, PROTECT_WINDOW=4 → cutoff should be 2
		const messages: AgentMessage[] = [
			makeToolResult("bash", "a") as AgentMessage,
			makeToolResult("bash", "b") as AgentMessage,
			makeUser(),
			makeAssistant(),
			makeToolResult("bash", "c") as AgentMessage,
			makeUser(),
		]
		expect(computeCutoff(messages, PROTECT_WINDOW, MAX_PROTECTED_CHARS)).toBe(2)
	})

	it("cuts earlier when recent tool results exceed MAX_PROTECTED_CHARS", () => {
		// large output in the last 4 messages exceeds budget → cutoff forced earlier
		const bigOutput = "x".repeat(150) // > MAX_PROTECTED_CHARS=100
		const messages: AgentMessage[] = [
			makeToolResult("bash", "old") as AgentMessage,
			makeUser(),
			makeAssistant(),
			makeToolResult("bash", bigOutput) as AgentMessage, // index 3 — in protect zone, but exceeds budget
			makeUser(),
		]
		// walking back: index 4 (user, 0 chars), index 3 (toolResult, 150 chars → exceeds 100)
		// → cutoff = 4 (message at index 3 pushed out of protected zone)
		expect(computeCutoff(messages, PROTECT_WINDOW, MAX_PROTECTED_CHARS)).toBe(4)
	})
})

// ── pruneToolResult ──────────────────────────────────────────────────────────

describe("pruneToolResult", () => {
	const MIN_PRUNE_CHARS = 10

	it("returns a new object (no mutation)", () => {
		const msg = makeToolResult("bash", "x".repeat(20))
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		expect(result).not.toBe(msg)
		expect(msg.content[0]).toHaveProperty("text", "x".repeat(20)) // original unchanged
	})

	it("replaces large text content with placeholder", () => {
		const msg = makeToolResult("bash", "x".repeat(20))
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		expect(result.content[0]).toHaveProperty("type", "text")
		expect((result.content[0] as TextContent).text).toContain("[compacted: bash output")
	})

	it("leaves small text content untouched", () => {
		const msg = makeToolResult("bash", "tiny")
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		expect((result.content[0] as TextContent).text).toBe("tiny")
	})

	it("preserves non-text content blocks unchanged", () => {
		const msg: ToolResultMessage = {
			role: "toolResult",
			toolCallId: "id-1",
			toolName: "bash",
			content: [
				// biome-ignore lint/suspicious/noExplicitAny: image block not in TextContent union
				{ type: "image", source: { type: "base64", mediaType: "image/png", data: "abc" } } as any,
				{ type: "text", text: "x".repeat(20) },
			],
			details: undefined,
			isError: false,
			timestamp: 0,
		}
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		expect(result.content[0]).toHaveProperty("type", "image") // untouched
		expect((result.content[1] as TextContent).text).toContain("[compacted")
	})

	it("truncates error output to last 2000 chars with header", () => {
		const longError = "e".repeat(5000)
		const msg = makeToolResult("bash", longError, true)
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		const text = (result.content[0] as TextContent).text
		expect(text).toContain("[compacted: bash error")
		expect(text).toContain("e".repeat(2000))
		expect(text.length).toBeLessThan(longError.length)
	})

	it("preserves all ToolResultMessage fields", () => {
		const msg = makeToolResult("read", "x".repeat(20))
		const result = pruneToolResult(msg, MIN_PRUNE_CHARS)
		expect(result.toolCallId).toBe(msg.toolCallId)
		expect(result.toolName).toBe(msg.toolName)
		expect(result.isError).toBe(msg.isError)
		expect(result.timestamp).toBe(msg.timestamp)
	})
})
