import { describe, expect, it } from "vitest"
import { parseSubagentEvent } from "./subagent.js"

describe("parseSubagentEvent", () => {
	const cases: Record<string, { input: string; expected: { delta: string | null; tokensUsed: number } }> = {
		"returns delta for message_update text_delta event": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "hello" },
			}),
			expected: { delta: "hello", tokensUsed: 0 },
		},
		"returns empty delta string": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "text_delta", delta: "" },
			}),
			expected: { delta: "", tokensUsed: 0 },
		},
		"ignores message_update events that are not text_delta": {
			input: JSON.stringify({
				type: "message_update",
				assistantMessageEvent: { type: "thinking_delta", delta: "..." },
			}),
			expected: { delta: null, tokensUsed: 0 },
		},
		"returns tokensUsed from message_end with usage": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 100, output: 40 } },
			}),
			expected: { delta: null, tokensUsed: 140 },
		},
		"returns zero tokens from message_end without usage": {
			input: JSON.stringify({
				type: "message_end",
				message: {},
			}),
			expected: { delta: null, tokensUsed: 0 },
		},
		"returns zero tokens from message_end with partial usage": {
			input: JSON.stringify({
				type: "message_end",
				message: { usage: { input: 50 } },
			}),
			expected: { delta: null, tokensUsed: 50 },
		},
		"ignores unrecognised event types": {
			input: JSON.stringify({ type: "tool_execution_start", toolName: "bash" }),
			expected: { delta: null, tokensUsed: 0 },
		},
		"ignores blank lines": {
			input: "   ",
			expected: { delta: null, tokensUsed: 0 },
		},
		"ignores invalid JSON": {
			input: "not json {",
			expected: { delta: null, tokensUsed: 0 },
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(parseSubagentEvent(input)).toEqual(expected)
		})
	}
})
