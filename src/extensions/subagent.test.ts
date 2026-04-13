import { describe, expect, it } from "vitest"
import { parseSubagentEvent } from "./subagent.js"

describe("parseSubagentEvent", () => {
	const cases: Record<
		string,
		{ input: string; expected: { delta: string | null; inputTokens: number; outputTokens: number } }
	> = {
		"returns delta for message_update text_delta event": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "hello" },
			}),
			expected: { delta: "hello", inputTokens: 0, outputTokens: 0 },
		},
		"returns empty delta string": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "" },
			}),
			expected: { delta: "", inputTokens: 0, outputTokens: 0 },
		},
		"ignores message_update events that are not text_delta": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "thinking_delta", delta: "..." },
			}),
			expected: { delta: null, inputTokens: 0, outputTokens: 0 },
		},
		"returns separate input and output tokens from message_end with usage": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 100, output: 40 } },
			}),
			expected: { delta: null, inputTokens: 100, outputTokens: 40 },
		},
		"returns zero tokens from message_end without usage": {
			input: JSON.stringify({
				type: "message_end",
				message: {},
			}),
			expected: { delta: null, inputTokens: 0, outputTokens: 0 },
		},
		"returns partial tokens from message_end with input only": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 50 } },
			}),
			expected: { delta: null, inputTokens: 50, outputTokens: 0 },
		},
		"ignores unrecognised event types": {
			input: JSON.stringify({ type: "tool_execution_start", toolName: "bash" }),
			expected: { delta: null, inputTokens: 0, outputTokens: 0 },
		},
		"ignores blank lines": {
			input: "   ",
			expected: { delta: null, inputTokens: 0, outputTokens: 0 },
		},
		"ignores invalid JSON": {
			input: "not json {",
			expected: { delta: null, inputTokens: 0, outputTokens: 0 },
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(parseSubagentEvent(input)).toEqual(expected)
		})
	}
})
