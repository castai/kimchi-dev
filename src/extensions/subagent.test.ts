import { describe, expect, it } from "vitest"
import { buildSubagentArgs, parseSubagentEvent } from "./subagent.js"

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

describe("buildSubagentArgs", () => {
	const base = { provider: "kimchi-dev", model: "kimi-k2.5", prompt: "go" }
	const allExist = () => true
	const noneExist = () => false

	it("returns missing when a file does not exist", () => {
		const r = buildSubagentArgs({ ...base, attachments: ["nope.png"] }, "/w", [], noneExist)
		expect(r).toEqual({ kind: "missing", missing: ["nope.png"] })
	})

	it("lists only the missing files on partial miss", () => {
		const fake = (p: string) => p === "here.png"
		const r = buildSubagentArgs({ ...base, attachments: ["here.png", "gone.png"] }, "/w", [], fake)
		expect(r).toEqual({ kind: "missing", missing: ["gone.png"] })
	})

	it("omits @ tokens when attachments is undefined", () => {
		const r = buildSubagentArgs(base, "/w", [], allExist)
		expect(r.kind).toBe("ok")
		if (r.kind !== "ok") return
		expect(r.args.some((a) => a.startsWith("@"))).toBe(false)
	})

	it("omits @ tokens when attachments is empty", () => {
		const r = buildSubagentArgs({ ...base, attachments: [] }, "/w", [], allExist)
		expect(r.kind).toBe("ok")
		if (r.kind !== "ok") return
		expect(r.args.some((a) => a.startsWith("@"))).toBe(false)
	})

	it("places attachments after extensionArgs and before prompt", () => {
		const r = buildSubagentArgs({ ...base, attachments: ["a.png", "b.txt"] }, "/w", ["-e", "ext-one"], allExist)
		expect(r.kind).toBe("ok")
		if (r.kind !== "ok") return
		expect(r.args).toEqual([
			"--mode",
			"json",
			"-p",
			"--no-session",
			"--provider",
			"kimchi-dev",
			"--model",
			"kimi-k2.5",
			"-e",
			"ext-one",
			"@a.png",
			"@b.txt",
			"go",
		])
	})

	it("applies @ exactly once even if the caller already prefixed it", () => {
		// Pins current behavior. Update this assertion if we decide to strip a leading @.
		const r = buildSubagentArgs({ ...base, attachments: ["@foo.png"] }, "/w", [], allExist)
		expect(r.kind).toBe("ok")
		if (r.kind !== "ok") return
		expect(r.args).toContain("@@foo.png")
	})

	it("forwards the raw path verbatim (no tilde expansion in argv)", () => {
		const r = buildSubagentArgs({ ...base, attachments: ["~/img.png"] }, "/w", [], allExist)
		expect(r.kind).toBe("ok")
		if (r.kind !== "ok") return
		expect(r.args).toContain("@~/img.png")
	})
})
