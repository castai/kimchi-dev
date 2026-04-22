import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { buildSubagentArgs, parseSubagentEvent, validateAttachments } from "./subagent.js"

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

describe("validateAttachments", () => {
	let tmp: string
	beforeAll(() => {
		tmp = mkdtempSync(join(tmpdir(), "subagent-validate-"))
		writeFileSync(join(tmp, "here.png"), "x")
		mkdirSync(join(tmp, "a-directory"))
	})
	afterAll(() => {
		rmSync(tmp, { recursive: true, force: true })
	})

	it("returns empty resolved list when attachments is undefined", () => {
		expect(validateAttachments(undefined, tmp)).toEqual({ kind: "ok", resolved: [] })
	})

	it("returns empty resolved list when attachments is empty", () => {
		expect(validateAttachments([], tmp)).toEqual({ kind: "ok", resolved: [] })
	})

	it("resolves cwd-relative paths to absolute", () => {
		const r = validateAttachments(["here.png"], tmp)
		expect(r).toEqual({ kind: "ok", resolved: [join(tmp, "here.png")] })
	})

	it("reports missing files using the original path the caller supplied", () => {
		expect(validateAttachments(["gone.png"], tmp)).toEqual({ kind: "missing", missing: ["gone.png"] })
	})

	it("lists only the missing files on partial miss", () => {
		expect(validateAttachments(["here.png", "gone.png"], tmp)).toEqual({ kind: "missing", missing: ["gone.png"] })
	})

	it("strips a leading @ before resolving", () => {
		const r = validateAttachments(["@here.png"], tmp)
		expect(r).toEqual({ kind: "ok", resolved: [join(tmp, "here.png")] })
	})

	it("rejects a directory as not a file", () => {
		expect(validateAttachments(["a-directory"], tmp)).toEqual({ kind: "missing", missing: ["a-directory"] })
	})

	it("returns the absolute path from the injected resolver in order", () => {
		const r = validateAttachments(["a", "b"], "/cwd", (p, _cwd) => `/abs/${p}`)
		expect(r).toEqual({ kind: "ok", resolved: ["/abs/a", "/abs/b"] })
	})
})

describe("buildSubagentArgs", () => {
	const base = { provider: "kimchi-dev", model: "kimi-k2.5", prompt: "go" }

	it("omits @ tokens when resolvedAttachments is empty", () => {
		const args = buildSubagentArgs(base, [], [])
		expect(args.some((a) => a.startsWith("@"))).toBe(false)
	})

	it("places attachments after extensionArgs and before prompt", () => {
		const args = buildSubagentArgs(base, ["/abs/a.png", "/abs/b.txt"], ["-e", "ext-one"])
		expect(args).toEqual([
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
			"@/abs/a.png",
			"@/abs/b.txt",
			"go",
		])
	})

	it("passes absolute paths straight through with a single @ prefix", () => {
		const abs = resolve("/tmp/img.png")
		const args = buildSubagentArgs(base, [abs], [])
		expect(args).toContain(`@${abs}`)
		expect(args.some((a) => a.startsWith("@@"))).toBe(false)
	})
})
