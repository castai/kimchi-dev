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
    status TEXT NOT NULL CHECK (status IN ('active', 'closed', 'orphaned'))
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

/** Index for efficient project-scoped queries */
export const PROJECT_HASH_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_sessions_project_hash ON hitl_sessions(project_hash)
`

/** Index for efficient session-scoped event queries */
export const SESSION_ID_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS idx_events_session_id ON hitl_events(session_id)
`
