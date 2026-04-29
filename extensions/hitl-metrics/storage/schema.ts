/**
 * Database Schema SQL
 *
 * CREATE TABLE statements for HITL metrics storage.
 */

/** SQL to create the hitl_sessions table */
export const SESSIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hitl_sessions (
    id TEXT PRIMARY KEY,
    project_hash TEXT NOT NULL,
    started_at INTEGER NOT NULL,
    ended_at INTEGER,
    status TEXT NOT NULL CHECK (status IN ('active', 'closed', 'orphaned')),
    end_cause TEXT CHECK (end_cause IN ('complete', 'disconnect', 'signal', 'orphaned')),
    agent_time_ms INTEGER NOT NULL DEFAULT 0,
    hitl_time_ms INTEGER NOT NULL DEFAULT 0,
    idle_time_ms INTEGER NOT NULL DEFAULT 0
)
`

/** SQL to create the hitl_events table */
export const EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hitl_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    question_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    selected_options TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES hitl_sessions(id) ON DELETE CASCADE
)
`

/** SQL to create the activity_events table for detailed timeline tracking */
export const ACTIVITY_EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('tool_start', 'tool_end', 'user_input', 'idle_start', 'idle_end')),
    tool_name TEXT,
    duration_ms INTEGER,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES hitl_sessions(id) ON DELETE CASCADE
)
`

/** SQL to create the permission_events table for tracking permission approvals/denials */
export const PERMISSION_EVENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS hitl_permission_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    tool_name TEXT NOT NULL,
    action TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('allow', 'allow_once', 'allow_remember', 'deny', 'deny_feedback', 'blocked')),
    reason TEXT,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES hitl_sessions(id) ON DELETE CASCADE
)
`

/** Index for efficient project-scoped queries */
export const PROJECT_HASH_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_sessions_project_hash ON hitl_sessions(project_hash)
`

/** Index for efficient session-scoped event queries */
export const SESSION_ID_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_events_session_id ON hitl_events(session_id)
`

/** Index for efficient activity event queries */
export const ACTIVITY_SESSION_ID_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_activity_session_id ON activity_events(session_id)
`

/** Index for efficient activity timestamp queries */
export const ACTIVITY_TIMESTAMP_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_events(session_id, timestamp)
`

/** Index for efficient permission event queries by session */
export const PERMISSION_SESSION_ID_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_permission_session_id ON hitl_permission_events(session_id)
`
