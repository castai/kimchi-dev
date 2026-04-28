/**
 * HITL Session Manager
 *
 * Encapsulates database initialization, session lifecycle, and event recording.
 * All methods are non-fatal (catch errors, log warnings, return safe defaults).
 */

import * as path from "node:path"
import * as os from "node:os"
import * as fs from "node:fs"
import { HitlDatabase, projectHash, getOrCreateSession, closeSession, closeOrphanSessions } from "./storage/index.js"
import type { HitlSession } from "./types.js"

/**
 * Manages HITL sessions and event recording.
 * Tracks duration via tool execution start times and writes events to database.
 */
export class SessionManager {
	private db: HitlDatabase | null = null
	private session: HitlSession | null = null
	private projectHashValue: string = ""
	private pendingStartTimes: Map<string, number> = new Map()

	/**
	 * Initialize the session manager for the given project directory.
	 * Opens database, initializes schema, closes orphans, creates/resumes session.
	 *
	 * @param cwd - Project working directory
	 */
	init(cwd: string): void {
		try {
			// Generate project hash from cwd
			this.projectHashValue = projectHash(cwd)

			// Build DB path at ~/.hitl-metrics/<hash>.db
			const dbDir = path.join(os.homedir(), ".hitl-metrics")
			const dbPath = path.join(dbDir, `${this.projectHashValue}.db`)

			// Ensure directory exists
			fs.mkdirSync(dbDir, { recursive: true })

			// Initialize database
			this.db = new HitlDatabase(dbPath)
			const opened = this.db.open()
			if (!opened) {
				console.warn("[HITL] Failed to open database, events will be silently dropped")
				return
			}

			// Initialize schema
			const schemaOk = this.db.initSchema()
			if (!schemaOk) {
				console.warn("[HITL] Failed to initialize schema, events will be silently dropped")
				return
			}

			// Close any orphaned sessions from previous crashes
			closeOrphanSessions(this.db)

			// Get or create session
			this.session = getOrCreateSession(this.db, this.projectHashValue)
			if (!this.session) {
				console.warn("[HITL] Failed to create session, events will be silently dropped")
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Initialization error: ${message}`)
			this.db = null
			this.session = null
		}
	}

	/**
	 * Get the current active session, or null if not initialized.
	 *
	 * @returns HitlSession or null
	 */
	getSession(): HitlSession | null {
		return this.session
	}

	/**
	 * Record the start time for a tool execution to enable duration tracking.
	 * Called on tool_execution_start hook.
	 *
	 * @param toolCallId - Unique identifier for the tool call
	 */
	recordStartTime(toolCallId: string): void {
		if (!toolCallId) return
		this.pendingStartTimes.set(toolCallId, Date.now())
	}

	/**
	 * Get and remove the start time for a tool call.
	 * Used internally to compute duration.
	 *
	 * @param toolCallId - Unique identifier for the tool call
	 * @returns Start timestamp or undefined if not found
	 */
	consumeStartTime(toolCallId: string): number | undefined {
		const startTime = this.pendingStartTimes.get(toolCallId)
		if (startTime !== undefined) {
			this.pendingStartTimes.delete(toolCallId)
		}
		return startTime
	}

	/**
	 * Record a HITL event to the database.
	 * Non-fatal: returns false on errors without throwing.
	 *
	 * @param toolName - Name of the tool that triggered the interaction
	 * @param questionCount - Number of questions asked
	 * @param durationMs - Duration in milliseconds
	 * @param selectedOptions - Array of user-selected option labels
	 * @returns true if recorded successfully, false otherwise
	 */
	recordEvent(
		toolName: string,
		questionCount: number,
		durationMs: number,
		selectedOptions: string[],
	): boolean {
		if (!this.db || !this.session) {
			// Silently drop events when DB/session unavailable (graceful degradation)
			return false
		}

		try {
			const createdAt = Date.now()
			const selectedOptionsJson = JSON.stringify(selectedOptions)

			const sql = `INSERT INTO hitl_events
				(session_id, tool_name, question_count, duration_ms, selected_options, created_at)
				VALUES (?, ?, ?, ?, ?, ?)`

			const success = this.db.run(sql, [
				this.session.id,
				toolName,
				questionCount,
				durationMs,
				selectedOptionsJson,
				createdAt,
			])

			if (!success) {
				console.warn("[HITL] Failed to write event to database")
				return false
			}

			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Event recording error: ${message}`)
			return false
		}
	}

	/**
	 * Close the session manager and release resources.
	 * Closes the active session and database connection.
	 */
	close(): void {
		try {
			if (this.session && this.db) {
				closeSession(this.db, this.session.id)
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error closing session: ${message}`)
		}

		try {
			if (this.db) {
				this.db.close()
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Error closing database: ${message}`)
		}

		this.db = null
		this.session = null
		this.pendingStartTimes.clear()
	}
}

export default SessionManager
