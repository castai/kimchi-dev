import { describe, expect, it } from "vitest"
import { parseSubagentEvent } from "./subagent.js"

describe("parseSubagentEvent", () => {
	const cases: Record<
		string,
		{
			input: string
			expected: {
				delta: string | null
				inputTokens: number
				outputTokens: number
				cacheReadTokens: number
				cacheWriteTokens: number
				toolCall: { name: string; args: Record<string, unknown> } | null
			}
		}
	> = {
		"returns delta for message_update text_delta event": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "hello" },
			}),
			expected: {
				delta: "hello",
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"returns empty delta string": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "" },
			}),
			expected: { delta: "", inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, toolCall: null },
		},
		"ignores message_update events that are not text_delta": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "thinking_delta", delta: "..." },
			}),
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"returns separate input and output tokens from message_end with usage": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 100, output: 40 } },
			}),
			expected: {
				delta: null,
				inputTokens: 100,
				outputTokens: 40,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"returns cache tokens from message_end with full usage": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 100, output: 40, cacheRead: 200, cacheWrite: 50 } },
			}),
			expected: {
				delta: null,
				inputTokens: 100,
				outputTokens: 40,
				cacheReadTokens: 200,
				cacheWriteTokens: 50,
				toolCall: null,
			},
		},
		"returns zero tokens from message_end without usage": {
			input: JSON.stringify({
				type: "message_end",
				message: {},
			}),
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"returns partial tokens from message_end with input only": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 50 } },
			}),
			expected: {
				delta: null,
				inputTokens: 50,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"returns tool call for tool_execution_start event": {
			input: JSON.stringify({ type: "tool_execution_start", toolName: "bash", args: { command: "ls -la" } }),
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: { name: "bash", args: { command: "ls -la" } },
			},
		},
		"returns tool call with empty args for tool_execution_start without args": {
			input: JSON.stringify({ type: "tool_execution_start", toolName: "read", args: null }),
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: { name: "read", args: {} },
			},
		},
		"ignores blank lines": {
			input: "   ",
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
		"ignores invalid JSON": {
			input: "not json {",
			expected: {
				delta: null,
				inputTokens: 0,
				outputTokens: 0,
				cacheReadTokens: 0,
				cacheWriteTokens: 0,
				toolCall: null,
			},
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(parseSubagentEvent(input)).toEqual(expected)
		})
	}
})
