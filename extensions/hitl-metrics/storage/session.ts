/**
 * HITL Session Management
 *
 * Session lifecycle functions: create/resume sessions, close orphans,
 * and query session statistics.
 */

import { randomUUID } from "node:crypto"
import type { HitlDatabase } from "./db.js"
import type { HitlSession, HitlStats, HitlEvent, ActivityEvent, HitlPermissionEvent } from "../types.js"

const FIVE_MINUTES_MS = 2 * 60 * 60 * 1000 // 2 hours — resume if kimchi restarted within 2h

/** Valid session end causes */
export type EndCause = "complete" | "disconnect" | "signal" | "orphaned"

/**
 * Get an existing active session or create a new one.
 * Resumes if an active session exists and started within the last 5 minutes.
 * Non-fatal: returns null on database errors.
 */
export function getOrCreateSession(
	db: HitlDatabase,
	projectHash: string,
): HitlSession | null {
	try {
		const cutoffTime = Date.now() - FIVE_MINUTES_MS
		const existing = db.query<HitlSession>(
			`SELECT id, project_hash, started_at, ended_at, status, end_cause,
			        agent_time_ms, hitl_time_ms, idle_time_ms
			 FROM hitl_sessions
			 WHERE project_hash = ?
			   AND status = 'active'
			   AND started_at >= ?
			 ORDER BY started_at DESC
			 LIMIT 1`,
			[projectHash, cutoffTime],
		)
		if (existing.length > 0) return existing[0]

		const sessionId = randomUUID()
		const startedAt = Date.now()
		const inserted = db.run(
			`INSERT INTO hitl_sessions (id, project_hash, started_at, status, agent_time_ms, hitl_time_ms, idle_time_ms)
			 VALUES (?, ?, ?, ?, 0, 0, 0)`,
			[sessionId, projectHash, startedAt, "active"],
		)
		if (!inserted) return null

		return {
			id: sessionId,
			project_hash: projectHash,
			started_at: startedAt,
			ended_at: null,
			status: "active",
			end_cause: null,
			agent_time_ms: 0,
			hitl_time_ms: 0,
			idle_time_ms: 0,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getOrCreateSession] Error: ${message}`)
		return null
	}
}

/**
 * Close a session by marking it as closed with an end time and cause.
 */
export function closeSession(
	db: HitlDatabase,
	sessionId: string,
	endCause: EndCause = "complete",
): boolean {
	try {
		const result = db.query<{ changes: number }>(
			`UPDATE hitl_sessions SET status = 'closed', ended_at = ?, end_cause = ? WHERE id = ? RETURNING 1 as changes`,
			[Date.now(), endCause, sessionId],
		)
		return result.length > 0
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[closeSession] Error: ${message}`)
		return false
	}
}

/**
 * Update session time metrics.
 */
export function updateSessionTimes(
	db: HitlDatabase,
	sessionId: string,
	agentTimeMs: number,
	hitlTimeMs: number,
	idleTimeMs: number,
): boolean {
	try {
		const result = db.query<{ changes: number }>(
			`UPDATE hitl_sessions SET agent_time_ms = ?, hitl_time_ms = ?, idle_time_ms = ? WHERE id = ? RETURNING 1 as changes`,
			[agentTimeMs, hitlTimeMs, idleTimeMs, sessionId],
		)
		return result.length > 0
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[updateSessionTimes] Error: ${message}`)
		return false
	}
}

/**
 * Find and close orphaned sessions.
 */
export function closeOrphanSessions(
	db: HitlDatabase,
	thresholdMs: number = FIVE_MINUTES_MS,
): number {
	try {
		const cutoffTime = Date.now() - thresholdMs
		const result = db.query<{ count: number }>(
			`UPDATE hitl_sessions SET status = 'orphaned', ended_at = ?, end_cause = 'orphaned'
			 WHERE status = 'active' AND started_at < ? RETURNING 1 as count`,
			[Date.now(), cutoffTime],
		)
		const count = result.length
		if (count > 0) console.warn(`[HITL] Closed ${count} orphan session(s)`)
		return count
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[closeOrphanSessions] Error: ${message}`)
		return 0
	}
}

/**
 * Record a permission event.
 */
export function recordPermissionEvent(
	db: HitlDatabase,
	sessionId: string,
	toolName: string,
	action: string,
	outcome: HitlPermissionEvent["outcome"],
	durationMs: number,
	reason?: string,
): boolean {
	try {
		// Verify session exists before inserting permission event
		const sessions = db.query<{ id: string }>(
			"SELECT id FROM hitl_sessions WHERE id = ?",
			[sessionId],
		)
		if (sessions.length === 0) {
			console.warn(`[recordPermissionEvent] Session ${sessionId} not found`)
			return false
		}
		return db.run(
			`INSERT INTO hitl_permission_events (session_id, tool_name, action, outcome, reason, duration_ms, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[sessionId, toolName, action, outcome, reason ?? null, durationMs, Date.now()],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[recordPermissionEvent] Error: ${message}`)
		return false
	}
}

/**
 * Get permission events for a specific session.
 */
export function getSessionPermissionEvents(db: HitlDatabase, sessionId: string): HitlPermissionEvent[] {
	try {
		return db.query<HitlPermissionEvent>(
			`SELECT id, session_id, tool_name, action, outcome, reason, duration_ms, created_at
			 FROM hitl_permission_events WHERE session_id = ? ORDER BY created_at ASC`,
			[sessionId],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionPermissionEvents] Error: ${message}`)
		return []
	}
}
export function recordActivityEvent(
	db: HitlDatabase,
	sessionId: string,
	activityType: ActivityEvent["activity_type"],
	toolName?: string,
	durationMs?: number,
): boolean {
	try {
		return db.run(
			`INSERT INTO activity_events (session_id, activity_type, tool_name, duration_ms, timestamp)
			 VALUES (?, ?, ?, ?, ?)`,
			[sessionId, activityType, toolName ?? null, durationMs ?? null, Date.now()],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[recordActivityEvent] Error: ${message}`)
		return false
	}
}

/**
 * Get activity events for a specific session.
 */
export function getSessionActivityEvents(db: HitlDatabase, sessionId: string): ActivityEvent[] {
	try {
		return db.query<ActivityEvent>(
			`SELECT id, session_id, activity_type, tool_name, duration_ms, timestamp
			 FROM activity_events WHERE session_id = ? ORDER BY timestamp ASC`,
			[sessionId],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionActivityEvents] Error: ${message}`)
		return []
	}
}

/**
 * Get recent sessions for a project.
 * DB is already scoped to a single project, so no hash filter needed.
 */
export function getRecentSessions(db: HitlDatabase, limit: number = 10): HitlSession[] {
	try {
		const limitVal = Math.min(limit, 100)
		return db.query<HitlSession>(
			`SELECT id, project_hash, started_at, ended_at, status, end_cause,
			        agent_time_ms, hitl_time_ms, idle_time_ms
			 FROM hitl_sessions ORDER BY started_at DESC LIMIT ${limitVal}`,
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getRecentSessions] Error: ${message}`)
		return []
	}
}

/**
 * Get events for a specific session.
 */
export function getSessionEvents(db: HitlDatabase, sessionId: string): HitlEvent[] {
	try {
		return db.query<HitlEvent>(
			`SELECT id, session_id, tool_name, question_count, duration_ms, selected_options, created_at
			 FROM hitl_events WHERE session_id = ? ORDER BY created_at ASC`,
			[sessionId],
		)
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionEvents] Error: ${message}`)
		return []
	}
}

/**
 * Get aggregated statistics.
 */
export function getSessionStats(db: HitlDatabase): HitlStats {
	try {
		// Use scalar subqueries to avoid JOIN multiplying session rows.
		// A naive LEFT JOIN produces a cartesian product of sessions × events × permissions,
		// causing SUM(session_time_ms) to be inflated by event count.
		const result = db.query<{
			total_sessions: number
			total_hitl_time_ms: number
			interaction_count: number
			avg_wait_ms: number | null
			permission_count: number
			total_permission_time_ms: number
		}>(
			`SELECT
			        (SELECT COUNT(*) FROM hitl_sessions) as total_sessions,
			        (SELECT COALESCE(SUM(hitl_time_ms), 0) FROM hitl_sessions) as total_hitl_time_ms,
			        (SELECT COUNT(*) FROM hitl_events) as interaction_count,
			        (SELECT AVG(duration_ms) FROM hitl_events) as avg_wait_ms,
			        (SELECT COUNT(*) FROM hitl_permission_events) as permission_count,
			        (SELECT COALESCE(SUM(duration_ms), 0) FROM hitl_permission_events) as total_permission_time_ms`,
		)
		if (result.length === 0) {
			return {
				total_sessions: 0,
				total_hitl_time_ms: 0,
				interaction_count: 0,
				avg_wait_ms: 0,
				permission_count: 0,
				total_permission_time_ms: 0,
			}
		}
		const row = result[0]
		return {
			total_sessions: row.total_sessions ?? 0,
			total_hitl_time_ms: row.total_hitl_time_ms ?? 0,
			interaction_count: row.interaction_count ?? 0,
			avg_wait_ms: Math.round(row.avg_wait_ms ?? 0),
			permission_count: row.permission_count ?? 0,
			total_permission_time_ms: row.total_permission_time_ms ?? 0,
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		console.warn(`[getSessionStats] Error: ${message}`)
		return {
			total_sessions: 0,
			total_hitl_time_ms: 0,
			interaction_count: 0,
			avg_wait_ms: 0,
			permission_count: 0,
			total_permission_time_ms: 0,
		}
	}
}
