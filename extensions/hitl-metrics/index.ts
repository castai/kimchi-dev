/**
 * HITL Metrics Extension
 *
 * Extension entrypoint that registers tools to capture Human-in-the-Loop
 * interaction events from ask_user_questions tool calls.
 *
 * Hooks:
 * - session_start: Initialize database and session
 * - tool_execution_start: Track start times for duration calculation
 * - tool_result: Filter ask_user_questions calls and write events
 * - session_shutdown: Clean up and close session
 */

import { SessionManager } from "./session-manager.ts"
import { handleMetricsCommand } from "./commands/metrics.ts"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"

/**
 * Cache detection threshold in milliseconds.
 * Results faster than this are likely served from cache.
 */
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
			manager.init(cwd)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in session_start handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Tool Execution Start: Track start times for duration calculation
	// -------------------------------------------------------------------------
	pi.on("tool_execution_start", async (event) => {
		try {
			// Only track ask_user_questions executions
			if (event.toolName !== "ask_user_questions") return

			// Store start time keyed by toolCallId
			if (event.toolCallId) {
				manager.recordStartTime(event.toolCallId)
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in tool_execution_start handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Tool Result: Filter ask_user_questions and write events to DB
	// -------------------------------------------------------------------------
	pi.on("tool_result", async (event) => {
		try {
			// Skip non-ask_user_questions tools
			if (event.toolName !== "ask_user_questions") return

			// Skip error results
			if (event.isError) return

			// Get toolCallId for duration lookup
			const toolCallId = (event as { toolCallId?: string }).toolCallId
			if (!toolCallId) {
				console.warn("[HITL] ask_user_questions result missing toolCallId")
				return
			}

			// Consume start time and compute duration
			const startTime = manager.consumeStartTime(toolCallId)
			let durationMs: number

			if (startTime !== undefined) {
				durationMs = Date.now() - startTime
			} else {
				// No matching start time — indicates cached result or restart
				// Silently skip (don't record cached events)
				return
			}

			// Skip cached results (duration below threshold indicates cache hit)
			if (durationMs < CACHE_THRESHOLD_MS) {
				return
			}

			// Extract question count from input (if available)
			let questionCount = 0
			const input = (event as { input?: { questions?: unknown[] } }).input
			if (input?.questions && Array.isArray(input.questions)) {
				questionCount = input.questions.length
			}

			// Extract selected options from result
			const selectedOptions: string[] = []
			const result = (event as { result?: { selectedOptions?: string[] } }).result
			if (result?.selectedOptions && Array.isArray(result.selectedOptions)) {
				for (const option of result.selectedOptions) {
					if (typeof option === "string") {
						selectedOptions.push(option)
					}
				}
			}

			// Record the event
			const recorded = manager.recordEvent(
				"ask_user_questions",
				questionCount,
				durationMs,
				selectedOptions,
			)

			if (!recorded) {
				console.warn("[HITL] Failed to record event (database error)")
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in tool_result handler: ${message}`)
		}
	})

	// -------------------------------------------------------------------------
	// Session Shutdown: Clean up and close session
	// -------------------------------------------------------------------------
	pi.on("session_shutdown", async (event) => {
		try {
			const cause = (event as { cause?: "signal" | "disconnect" }).cause ?? "signal"
			manager.close()
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error in session_shutdown handler: ${message}`)
		}
	})
}
