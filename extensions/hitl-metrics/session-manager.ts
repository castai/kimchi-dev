/**
 * HITL Session Manager
 *
 * Encapsulates database initialization, session lifecycle, and event recording.
 * All methods are non-fatal (catch errors, log warnings, return safe defaults).
 */

import * as path from "node:path"
import * as os from "node:os"
import * as fs from "node:fs"
import {
	HitlDatabase,
	projectHash,
	getOrCreateSession,
	closeSession,
	closeOrphanSessions,
	recordActivityEvent,
	recordPermissionEvent,
	updateSessionTimes,
	EndCause,
} from "./storage/index.js"
import type { HitlSession, HitlPermissionEvent } from "./types.js"

/** HITL tool name — confirmed from pi framework: extensions/ask-user-questions.ts registers "ask_user_questions" */
export const HITL_TOOL_NAME = "ask_user_questions"

/** Threshold for idle detection; gaps longer than this mark idle periods */
const IDLE_THRESHOLD_MS = 3000

/**
 * Manages HITL sessions and event recording.
 * Tracks duration via tool execution start times and writes events to database.
 * Now supports three-category time tracking: agent, HITL, and idle time.
 */
export class SessionManager {
	private db: HitlDatabase | null = null
	private session: HitlSession | null = null
	private projectHashValue: string = ""
	private pendingStartTimes: Map<string, number> = new Map()
	private isInitialized: boolean = false

	// Activity tracking state
	private lastActivityTimestamp: number = 0
	private agentTimeAccumulator: number = 0
	private hitlTimeAccumulator: number = 0
	private idleTimeAccumulator: number = 0
	private currentIdleStart: number = 0
	private isIdle: boolean = false

	/**
	 * Reset all state — used by tests and when cwd changes between sessions.
	 * Safe to call even when not initialized.
	 */
	reset(): void {
		if (this.db) {
			this.db.close()
			this.db = null
		}
		this.session = null
		this.projectHashValue = ""
		this.pendingStartTimes.clear()
		this.lastActivityTimestamp = 0
		this.agentTimeAccumulator = 0
		this.hitlTimeAccumulator = 0
		this.idleTimeAccumulator = 0
		this.currentIdleStart = 0
		this.isIdle = false
		this.isInitialized = false
	}

	init(cwd: string, options: { dbPath?: string; sessionId?: string } = {}): void {
		// Always reset on init — enables clean re-initialization between sessions
		// and allows test harnesses to redirect the DB path per-session
		this.reset()
		try {
			this.projectHashValue = projectHash(cwd)
			let dbPath: string
			let dbDir: string

			if (options.dbPath) {
				// Test override: write to explicit path
				dbPath = options.dbPath
				dbDir = path.dirname(dbPath)
				if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })
			} else {
				// Production: write to ~/.kimchi/metrics/<hash>/hitl.db
				dbDir = path.join(os.homedir(), ".kimchi", "metrics", this.projectHashValue)
				dbPath = path.join(dbDir, "hitl.db")
				fs.mkdirSync(dbDir, { recursive: true })
			}

			this.db = new HitlDatabase(dbPath)
			if (!this.db.open()) {
				console.warn("[HITL] Failed to open database, events will be silently dropped")
				return
			}
			if (!this.db.initSchema()) {
				console.warn("[HITL] Failed to initialize schema, events will be silently dropped")
				return
			}

			closeOrphanSessions(this.db)
			this.session = getOrCreateSession(this.db, this.projectHashValue, { sessionId: options.sessionId })
			if (!this.session) {
				console.warn("[HITL] Failed to create session, events will be silently dropped")
				return
			}

			// Initialize activity tracking from session
			this.lastActivityTimestamp = Date.now()
			this.agentTimeAccumulator = this.session.agent_time_ms
			this.hitlTimeAccumulator = this.session.hitl_time_ms
			this.idleTimeAccumulator = this.session.idle_time_ms
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Initialization error: ${message}`)
			this.db = null
			this.session = null
		}
	}

	getSession(): HitlSession | null {
		return this.session
	}

	/** Record start of any tool execution */
	recordToolStart(toolCallId: string, toolName: string): void {
		if (!toolCallId) return
		this.pendingStartTimes.set(toolCallId, Date.now())

		if (this.db && this.session) {
			recordActivityEvent(this.db, this.session.id, "tool_start", toolName)
		}
		if (this.isIdle) this.endIdlePeriod()
		this.lastActivityTimestamp = Date.now()
	}

	/** Record end of any tool execution and accumulate agent time */
	recordToolEnd(toolCallId: string, toolName: string, durationMs: number): void {
		this.pendingStartTimes.delete(toolCallId)

		if (this.db && this.session) {
			recordActivityEvent(this.db, this.session.id, "tool_end", toolName, durationMs)
		}

		// Accumulate agent time (exclude HITL tools tracked separately)
		if (toolName !== HITL_TOOL_NAME) {
			this.agentTimeAccumulator += durationMs
		}
		this.lastActivityTimestamp = Date.now()
		this.maybeStartIdleTimer()
	}

	/** Record user input (mark end of idle, reset timers) */
	recordUserInput(): void {
		if (this.isIdle) this.endIdlePeriod()
		if (this.db && this.session) {
			recordActivityEvent(this.db, this.session.id, "user_input")
		}
		this.lastActivityTimestamp = Date.now()
		// Start idle tracking — next tool start will end it
		this.startIdlePeriod()
	}

	/** Check if we should start idle tracking */
	private maybeStartIdleTimer(): void {
		// Called after tool execution; if no immediate next action, idle starts
		// In practice, idle is detected lazily when next activity arrives
	}

	private startIdlePeriod(): void {
		if (this.isIdle || !this.session) return
		this.isIdle = true
		this.currentIdleStart = Date.now()
		recordActivityEvent(this.db!, this.session.id, "idle_start")
	}

	private endIdlePeriod(): void {
		if (!this.isIdle || !this.session || this.currentIdleStart === 0) return
		const duration = Date.now() - this.currentIdleStart
		this.idleTimeAccumulator += duration
		this.isIdle = false
		recordActivityEvent(this.db!, this.session.id, "idle_end", undefined, duration)
	}

	/** Legacy method - kept for backward compatibility */
	recordStartTime(toolCallId: string): void {
		this.recordToolStart(toolCallId, "unknown")
	}

	/** Legacy method - kept for backward compatibility */
	consumeStartTime(toolCallId: string): number | undefined {
		const start = this.pendingStartTimes.get(toolCallId)
		if (start !== undefined) this.pendingStartTimes.delete(toolCallId)
		return start
	}

	/** Record permission/approval event */
	recordPermissionEvent(
		toolName: string,
		action: string,
		outcome: HitlPermissionEvent["outcome"],
		durationMs: number,
		reason?: string,
	): boolean {
		if (!this.db || !this.session) return false
		if (this.isIdle) this.endIdlePeriod()

		try {
			return recordPermissionEvent(
				this.db,
				this.session.id,
				toolName,
				action,
				outcome,
				durationMs,
				reason,
			)
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Permission event recording error: ${message}`)
			return false
		}
	}

	/** Record HITL event (ask_user_questions) */
	recordEvent(
		toolName: string,
		questionCount: number,
		durationMs: number,
		selectedOptions: string[],
	): boolean {
		if (!this.db || !this.session) return false
		if (this.isIdle) this.endIdlePeriod()

		try {
			const createdAt = Date.now()
			const success = this.db.run(
				`INSERT INTO hitl_events (session_id, tool_name, question_count, duration_ms, selected_options, created_at)
				 VALUES (?, ?, ?, ?, ?, ?)`,
				[this.session.id, toolName, questionCount, durationMs, JSON.stringify(selectedOptions), createdAt],
			)
			if (!success) {
				console.warn("[HITL] Failed to write event to database")
				return false
			}
			this.hitlTimeAccumulator += durationMs
			this.lastActivityTimestamp = Date.now()
			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HITL] Event recording error: ${message}`)
			return false
		}
	}

	/** Close session with optional end cause */
	close(endCause: EndCause = "complete"): void {
		if (this.isIdle) this.endIdlePeriod()
		this.persistTimeMetrics()

		if (this.session && this.db) {
			closeSession(this.db, this.session.id, endCause)
		}
		if (this.db) this.db.close()
		this.db = null
		this.session = null
		this.pendingStartTimes.clear()
	}

	/** Persist accumulated time metrics to database */
	private persistTimeMetrics(): void {
		if (!this.db || !this.session) return
		updateSessionTimes(this.db, this.session.id, this.agentTimeAccumulator, this.hitlTimeAccumulator, this.idleTimeAccumulator)
	}
}

export default SessionManager
