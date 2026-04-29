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
	/** Reason for session end (null if active) */
	end_cause: "complete" | "disconnect" | "signal" | "orphaned" | null | undefined
	/** Total time agent spent executing tools (milliseconds) */
	agent_time_ms: number
	/** Total time spent in HITL interactions (milliseconds) */
	hitl_time_ms: number
	/** Total idle time waiting for user input (milliseconds) */
	idle_time_ms: number
	/** Allow string indexing for SQLite query results */
	[key: string]: unknown
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
	/** Allow string indexing for SQLite query results */
	[key: string]: unknown
}

/**
 * Represents an activity tracking event for detailed timeline reconstruction
 */
export interface ActivityEvent {
	/** Auto-incrementing primary key */
	id: number
	/** Foreign key to hitl_sessions.id */
	session_id: string
	/** Type of activity recorded */
	activity_type: "tool_start" | "tool_end" | "user_input" | "idle_start" | "idle_end"
	/** Tool name for tool events */
	tool_name: string | null
	/** Duration in milliseconds (for completed activities) */
	duration_ms: number | null
	/** Event timestamp (Unix epoch milliseconds) */
	timestamp: number
	/** Allow string indexing for SQLite query results */
	[key: string]: unknown
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
	/** Total number of permission/approval interactions */
	permission_count: number
	/** Total time spent waiting for permission responses (ms) */
	total_permission_time_ms: number
}

/**
 * Represents a permission/approval event
 */
export interface HitlPermissionEvent {
	/** Auto-incrementing primary key */
	id: number
	/** Foreign key to hitl_sessions.id */
	session_id: string
	/** Name of the tool that requires permission */
	tool_name: string
	/** Action/command being requested */
	action: string
	/** Outcome of the permission request */
	outcome: "allow" | "allow_once" | "allow_remember" | "deny" | "deny_feedback" | "blocked"
	/** Reason for block/denial (if applicable) */
	reason: string | null
	/** Duration in milliseconds from prompt to response */
	duration_ms: number
	/** Event creation time (Unix epoch milliseconds) */
	created_at: number
	/** Allow string indexing for SQLite query results */
	[key: string]: unknown
}

/**
 * Timeline segment representing time spent in different states
 */
export interface TimelineSegment {
	/** Type of segment: 'agent', 'hitl', or 'idle' */
	type: "agent" | "hitl" | "idle"
	/** Start time in milliseconds (Unix epoch) */
	startMs: number
	/** End time in milliseconds (Unix epoch) */
	endMs: number
	/** Duration in milliseconds */
	durationMs: number
}
