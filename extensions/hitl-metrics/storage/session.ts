/**
 * HITL Session Management
 *
 * Session lifecycle functions: create/resume sessions, close orphans,
 * and query session statistics.
 */

import { randomUUID } from "node:crypto"
import type { HitlDatabase } from "./db.ts"
import type { HitlSession, HitlStats, HitlEvent } from "../types.ts"

const FIVE_MINUTES_MS = 5 * 60 * 1000

/**
 * Get an existing active session or create a new one.
 * Resumes if an active session exists and started within the last 5 minutes.
 * Non-fatal: returns null on database errors.
 *
 * @param db - HitlDatabase instance
 * @param projectHash - Project identifier hash
 * @returns HitlSession or null on error
 */
export function getOrCreateSession(
	db: HitlDatabase,
	projectHash: string,
): HitlSession | null {
	try {
		// Check for existing active session
		const cutoffTime = Date.now() - FIVE_MINUTES_MS
		const existing = db.query<HitlSession>(
			`SELECT id, project_hash, started_at, ended_at, status
			 FROM hitl_sessions
			 WHERE project_hash = ?
			   AND status = 'active'
			   AND started_at >= ?
			 ORDER BY started_at DESC
			 LIMIT 1`,
			[projectHash, cutoffTime],
		)

		if (existing.length > 0) {
			return existing[0]
		}

		// Create new session
		const sessionId = randomUUID()
		const startedAt = Date.now()
		const inserted = db.run(
			`INSERT INTO hitl_sessions (id, project_hash, started_at, status)
			 VALUES (?, ?, ?, ?)`,
			[sessionId, projectHash, startedAt, "active"],
		)

		if (!inserted) {
			return null
		}

		return {
			id: sessionId,
			project_hash: projectHash,
			started_at: startedAt,
			ended_at: null,
			status: "active",
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getOrCreateSession] Error: ${message}`)
		return null
	}
}

/**
 * Close a session by marking it as closed with an end time.
 * Non-fatal: returns false on database errors.
 *
 * @param db - HitlDatabase instance
 * @param sessionId - Session UUID to close
 * @returns true if successful, false otherwise
 */
export function closeSession(db: HitlDatabase, sessionId: string): boolean {
	try {
		const result = db.query<{ changes: number }>(
			`UPDATE hitl_sessions
			 SET status = 'closed', ended_at = ?
			 WHERE id = ?
			 RETURNING 1 as changes`,
			[Date.now(), sessionId],
		)
		return result.length > 0
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[closeSession] Error: ${message}`)
		return false
	}
}

/**
 * Find and close orphaned sessions (active sessions older than threshold).
 * Orphaned sessions are those that have been active longer than expected,
 * likely due to a crash or unclean shutdown.
 * Logs a warning with the count of closed orphans.
 * Non-fatal: returns 0 on database errors.
 *
 * @param db - HitlDatabase instance
 * @param thresholdMs - Age threshold in milliseconds (default: 5 minutes)
 * @returns Number of sessions marked as orphaned
 */
export function closeOrphanSessions(
	db: HitlDatabase,
	thresholdMs: number = FIVE_MINUTES_MS,
): number {
	try {
		const cutoffTime = Date.now() - thresholdMs
		const result = db.query<{ count: number }>(
			`UPDATE hitl_sessions
			 SET status = 'orphaned', ended_at = ?
			 WHERE status = 'active'
			   AND started_at < ?
			 RETURNING 1 as count`,
			[Date.now(), cutoffTime],
		)

		const count = result.length
		if (count > 0) {
			console.warn(`[HITL] Closed ${count} orphan session(s)`)
		}
		return count
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[closeOrphanSessions] Error: ${message}`)
		return 0
	}
}

/**
 * Get recent sessions for a project, ordered by start time descending.
 * Non-fatal: returns empty array on database errors.
 *
 * @param db - HitlDatabase instance
 * @param projectHash - Project identifier hash
 * @param limit - Maximum number of sessions to return (default: 10)
 * @returns Array of HitlSession objects
 */
export function getRecentSessions(
	db: HitlDatabase,
	projectHash: string,
	limit: number = 10,
): HitlSession[] {
	try {
		return db.query<HitlSession>(
			`SELECT id, project_hash, started_at, ended_at, status
			 FROM hitl_sessions
			 WHERE project_hash = ?
			 ORDER BY started_at DESC
			 LIMIT ?`,
			[projectHash, Math.min(limit, 100)], // Cap at 100 to prevent abuse
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getRecentSessions] Error: ${message}`)
		return []
	}
}

/**
 * Get events for a specific session, ordered by creation time ascending.
 * Non-fatal: returns empty array on database errors.
 *
 * @param db - HitlDatabase instance
 * @param sessionId - Session UUID to query events for
 * @returns Array of HitlEvent objects ordered by created_at ASC
 */
export function getSessionEvents(
	db: HitlDatabase,
	sessionId: string,
): HitlEvent[] {
	try {
		return db.query<HitlEvent>(
			`SELECT id, session_id, tool_name, question_count, duration_ms, selected_options, created_at
			 FROM hitl_events
			 WHERE session_id = ?
			 ORDER BY created_at ASC`,
			[sessionId],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionEvents] Error: ${message}`)
		return []
	}
}

/**
 * Get aggregated statistics for a project's HITL sessions.
 * Calculates total sessions, total HITL time, interaction count, and average wait time.
 * Non-fatal: returns zero-valued stats on database errors or empty results.
 *
 * @param db - HitlDatabase instance
 * @param projectHash - Project identifier hash
 * @returns HitlStats aggregate
 */
export function getSessionStats(
	db: HitlDatabase,
	projectHash: string,
): HitlStats {
	try {
		// Aggregate sessions and events for this project
		const result = db.query<{
			total_sessions: number
			total_hitl_time_ms: number
			interaction_count: number
			avg_wait_ms: number | null
		}>(
			`SELECT
				COUNT(DISTINCT s.id) as total_sessions,
				COALESCE(SUM(e.duration_ms), 0) as total_hitl_time_ms,
				COUNT(e.id) as interaction_count,
				AVG(e.duration_ms) as avg_wait_ms
			 FROM hitl_sessions s
			 LEFT JOIN hitl_events e ON e.session_id = s.id
			 WHERE s.project_hash = ?`,
			[projectHash],
		)

		if (result.length === 0) {
			return {
				total_sessions: 0,
				total_hitl_time_ms: 0,
				interaction_count: 0,
				avg_wait_ms: 0,
			}
		}

		const row = result[0]
		return {
			total_sessions: row.total_sessions ?? 0,
			total_hitl_time_ms: row.total_hitl_time_ms ?? 0,
			interaction_count: row.interaction_count ?? 0,
			avg_wait_ms: Math.round(row.avg_wait_ms ?? 0),
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionStats] Error: ${message}`)
		return {
			total_sessions: 0,
			total_hitl_time_ms: 0,
			interaction_count: 0,
			avg_wait_ms: 0,
		}
	}
}
