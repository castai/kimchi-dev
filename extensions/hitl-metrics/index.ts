/**
 * HITL Metrics Extension
 *
 * Extension entrypoint that registers tools to capture Human-in-the-Loop
 * interaction events and tracks three categories of time:
 * - Agent time: tool execution (excluding HITL)
 * - HITL time: HITL tool duration (${HITL_TOOL_NAME})
 * - Idle time: gaps between activities
 *
 * Hooks:
 * - session_start: Initialize database and session
 * - input: Track user input, mark end of idle
 * - tool_execution_start: Track all tool starts
 * - tool_result: Filter all tools, categorize time, write events
 * - session_shutdown: Clean up and close session with end cause
 */

import { SessionManager, HITL_TOOL_NAME } from "./session-manager.js"
import type { EndCause } from "./storage/index.js"
import { handleMetricsCommand } from "./commands/metrics.js"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"

/** Cache detection threshold in milliseconds */
const CACHE_THRESHOLD_MS = 50

/**
 * Default function exported for pi extension loading.
 *
 * @param pi - ExtensionAPI from pi-coding-agent
 */
export default function hitlMetricsExtension(pi: ExtensionAPI): void {
	const manager = new SessionManager()

	// Register /metrics slash command
	pi.registerCommand("metrics", {
		description: "Show HITL interaction metrics",
		handler: async (args, ctx) => {
			handleMetricsCommand(args, ctx)
		},
	})

	// -------------------------------------------------------------------------
	// Session Start: Initialize DB, schema, and session
	// -------------------------------------------------------------------------
	pi.on("session_start", async (_event, ctx: ExtensionContext) => {
		try {
			const cwd = ctx.cwd
			if (!cwd) {
				console.warn("[HITL] No cwd provided in session_start, skipping initialization")
				return
			}
			// HITL_DB_PATH overrides the DB path entirely (useful for testing).
			// When set, the dirname is created if missing and the file is "hitl.db" inside it.
			const initOptions = process.env.HITL_DB_PATH ? { dbPath: process.env.HITL_DB_PATH } : {}
			manager.init(cwd, initOptions)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in session_start handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Input: Track user input (marks end of idle time)
	// -------------------------------------------------------------------------
	pi.on("input", async (event) => {
		try {
			// Skip extension-generated messages
			if (event.source === "extension") return
			manager.recordUserInput()
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in input handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Tool Execution Start: Track start times for all tools
	// -------------------------------------------------------------------------
	pi.on("tool_execution_start", async (event) => {
		try {
			if (!event.toolCallId) return
			manager.recordToolStart(event.toolCallId, event.toolName)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in tool_execution_start handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Tool Result: Categorize and record all tool results
	// -------------------------------------------------------------------------
	pi.on("tool_result", async (event) => {
		try {
			const toolCallId = (event as { toolCallId?: string }).toolCallId
			if (!toolCallId) return

			// Compute duration
			const startTime = manager.consumeStartTime(toolCallId)
			if (!startTime) return // Cached or orphaned result

			const durationMs = Date.now() - startTime
			if (durationMs < CACHE_THRESHOLD_MS) return // Likely cached

			// Handle HITL tools specially
			if (event.toolName === HITL_TOOL_NAME && !event.isError) {
				// Extract question count from input
				const input = (event as { input?: { questions?: unknown[] } }).input
				const questionCount = input?.questions && Array.isArray(input.questions) 
					? input.questions.length 
					: 0

				// Extract selected options from result
				const result = (event as { result?: { selectedOptions?: string[] } }).result
				const selectedOptions: string[] = result?.selectedOptions?.filter((o): o is string => typeof o === "string") || []

				manager.recordEvent(event.toolName, questionCount, durationMs, selectedOptions)
			} else {
				// Record as regular tool execution (contributing to agent time)
				manager.recordToolEnd(toolCallId, event.toolName, durationMs)
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in tool_result handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Session Shutdown: Clean up and close session with end cause
	// -------------------------------------------------------------------------
	pi.on("session_shutdown", async (event) => {
		try {
			const rawCause = (event as { cause?: string }).cause
			// "disconnect" = normal exit (connection closed), "signal" = killed
			const endCause: EndCause = rawCause === "disconnect" ? "complete" : (rawCause as EndCause) ?? "signal"
			manager.close(endCause)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in session_shutdown handler: ${message}`)
		}
	})
}
