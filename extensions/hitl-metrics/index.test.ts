/**
 * HITL Metrics Extension Integration Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import hitlMetricsExtension from "./index.ts"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"

function createMockPi(): ExtensionAPI & {
	handlers: Map<string, ((event: unknown, ctx?: ExtensionContext) => Promise<void>)[]>
	commands: Map<string, { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }>
	trigger: (eventName: string, event: unknown, ctx?: ExtensionContext) => Promise<void>
} {
	const handlers = new Map<string, ((event: unknown, ctx?: ExtensionContext) => Promise<void>)[]>()
	const commands = new Map<string, { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }>()
	return {
		handlers,
		commands,
		on: (eventName: string, handler: (event: unknown, ctx?: ExtensionContext) => Promise<void>) => {
			if (!handlers.has(eventName)) handlers.set(eventName, [])
			handlers.get(eventName)!.push(handler)
		},
		registerCommand: (name: string, config: { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }) => {
			commands.set(name, config)
		},
		trigger: async (eventName: string, event: unknown, ctx?: ExtensionContext) => {
			const eventHandlers = handlers.get(eventName) || []
			for (const handler of eventHandlers) await handler(event, ctx)
		},
	} as ExtensionAPI & {
		handlers: Map<string, ((event: unknown, ctx?: ExtensionContext) => Promise<void>)[]>
		commands: Map<string, { description: string; handler: (args: string, ctx: ExtensionContext) => Promise<void> }>
		trigger: (eventName: string, event: unknown, ctx?: ExtensionContext) => Promise<void>
	}
}

describe("HITL Metrics Extension", () => {
	let mockPi: ReturnType<typeof createMockPi>
	let consoleWarnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		mockPi = createMockPi()
		consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
	})

	afterEach(() => {
		consoleWarnSpy.mockRestore()
	})

	describe("hook registration", () => {
		it("registers all four lifecycle hooks", () => {
			hitlMetricsExtension(mockPi)
			expect(mockPi.handlers.has("session_start")).toBe(true)
			expect(mockPi.handlers.has("tool_execution_start")).toBe(true)
			expect(mockPi.handlers.has("tool_result")).toBe(true)
			expect(mockPi.handlers.has("session_shutdown")).toBe(true)
		})

		it("registers exactly one handler per hook", () => {
			hitlMetricsExtension(mockPi)
			expect(mockPi.handlers.get("session_start")?.length).toBe(1)
			expect(mockPi.handlers.get("tool_execution_start")?.length).toBe(1)
			expect(mockPi.handlers.get("tool_result")?.length).toBe(1)
			expect(mockPi.handlers.get("session_shutdown")?.length).toBe(1)
		})
	})

	describe("session lifecycle flow", () => {
		it("completes start -> execution_start -> result flow", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			await mockPi.trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-1" })
			await new Promise(r => setTimeout(r, 100))
			await mockPi.trigger("tool_result", { toolName: "ask_user_questions", toolCallId: "call-1", isError: false, input: { questions: [{ id: 1 }] }, result: { selectedOptions: ["A"] } }, {} as ExtensionContext)
			const warnings = consoleWarnSpy.mock.calls.filter(c => typeof c[0] === "string" && (c[0].includes("Failed") || c[0].includes("error")))
			expect(warnings.length).toBe(0)
		})

		it("session_shutdown closes session", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			await mockPi.trigger("session_shutdown", { cause: "signal" }, {} as ExtensionContext)
			expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining("Error in session_shutdown"))
		})

		it("accumulates multiple events in one session", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			for (let i = 0; i < 2; i++) {
				await mockPi.trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: `call-${i}` })
				await new Promise(r => setTimeout(r, 60))
				await mockPi.trigger("tool_result", { toolName: "ask_user_questions", toolCallId: `call-${i}`, isError: false, input: { questions: [{ id: i }] }, result: { selectedOptions: ["A"] } }, {} as ExtensionContext)
			}
			const warnings = consoleWarnSpy.mock.calls.filter(c => typeof c[0] === "string" && c[0].includes("Failed to record"))
			expect(warnings.length).toBe(0)
		})
	})

	describe("filtering and edge cases", () => {
		it("ignores non-ask_user_questions events", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			await mockPi.trigger("tool_execution_start", { toolName: "read_file", toolCallId: "call-1" })
			await new Promise(r => setTimeout(r, 100))
			await mockPi.trigger("tool_result", { toolName: "read_file", toolCallId: "call-1", isError: false, input: { path: "test.ts" }, result: { content: "" } }, {} as ExtensionContext)
			expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining("read_file"))
		})

		it("skips error results", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			await mockPi.trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-1" })
			await new Promise(r => setTimeout(r, 100))
			await mockPi.trigger("tool_result", { toolName: "ask_user_questions", toolCallId: "call-1", isError: true, input: {}, result: {} }, {} as ExtensionContext)
			expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining("error"))
		})

		it("skips cached results (fast <50ms)", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			await mockPi.trigger("tool_execution_start", { toolName: "ask_user_questions", toolCallId: "call-1" })
			// Immediate response (<50ms) should be skipped
			await mockPi.trigger("tool_result", { toolName: "ask_user_questions", toolCallId: "call-1", isError: false, input: { questions: [{}] }, result: { selectedOptions: ["A"] } }, {} as ExtensionContext)
			expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining("error"))
		})

		it("handles missing start time gracefully", async () => {
			hitlMetricsExtension(mockPi)
			await mockPi.trigger("session_start", {}, { cwd: "/tmp/test" } as ExtensionContext)
			// No tool_execution_start - simulates cached result
			await mockPi.trigger("tool_result", { toolName: "ask_user_questions", toolCallId: "call-1", isError: false, input: {}, result: { selectedOptions: ["A"] } }, {} as ExtensionContext)
			expect(consoleWarnSpy).not.toHaveBeenCalledWith(expect.stringContaining("error"))
		})
	})
})
