/**
 * HITL (Human-in-the-Loop) Metrics Type Definitions
 *
 * Type contracts for tracking interactive user sessions and events.
 */

/**
 * Represents a HITL session - a period of interactive user engagement
 */
export interface HitlSession {
	/** UUID primary key */
	id: string
	/** Project hash (SHA-256 truncated to 16 hex chars) for multi-project isolation */
	project_hash: string
	/** Session start time (Unix epoch milliseconds) */
	started_at: number
	/** Session end time (null if active) */
	ended_at: number | null
	/** Current session status */
	status: "active" | "closed" | "orphaned"
}

/**
 * Represents a single HITL interaction event
 */
export interface HitlEvent {
	/** Auto-incrementing primary key */
	id: number
	/** Foreign key to hitl_sessions.id */
	session_id: string
	/** Name of the tool that triggered the interaction */
	tool_name: string
	/** Number of questions asked in this event */
	question_count: number
	/** Duration in milliseconds from question to completion */
	duration_ms: number
	/** JSON array of selected options */
	selected_options: string
	/** Event creation time (Unix epoch milliseconds) */
	created_at: number
}

/**
 * Aggregated HITL statistics for a project
 */
export interface HitlStats {
	/** Total number of HITL sessions */
	total_sessions: number
	/** Total time spent in HITL interactions (ms) */
	total_hitl_time_ms: number
	/** Total number of interaction events */
	interaction_count: number
	/** Average wait time per interaction (ms) */
	avg_wait_ms: number
}

/**
 * Timeline segment representing either solo or HITL time period
 */
export interface TimelineSegment {
	/** Type of segment: 'solo' for agent-only, 'hitl' for human-in-the-loop */
	type: "solo" | "hitl"
	/** Start time in milliseconds (Unix epoch) */
	startMs: number
	/** End time in milliseconds (Unix epoch) */
	endMs: number
	/** Duration in milliseconds */
	durationMs: number
}
