/**
 * HITL Database Wrapper
 *
 * Thin wrapper around bun:sqlite with non-fatal error handling,
 * WAL mode, and schema initialization.
 */

// Bun's built-in SQLite module - only available at runtime under Bun
// We use dynamic require to avoid TypeScript errors during Node.js builds
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Database } = require("bun:sqlite")
import {
	SESSIONS_TABLE_SQL,
	EVENTS_TABLE_SQL,
	ACTIVITY_EVENTS_TABLE_SQL,
	PERMISSION_EVENTS_TABLE_SQL,
	PROJECT_HASH_INDEX_SQL,
	SESSION_ID_INDEX_SQL,
	ACTIVITY_SESSION_ID_INDEX_SQL,
	ACTIVITY_TIMESTAMP_INDEX_SQL,
	PERMISSION_SESSION_ID_INDEX_SQL,
} from "./schema.js"

// Minimal type for Database at build time
type DatabaseInstance = {
	exec(sql: string): void
	run(sql: string, params?: (string | number | null)[]): void
	query(sql: string): { all(...params: (string | number | null)[]): unknown[] }
	close(): void
}

/**
 * Non-fatal database wrapper for HITL metrics.
 * All operations catch errors, log warnings, and return safe defaults.
 */
export class HitlDatabase {
	private db: DatabaseInstance | null = null
	private dbPath: string
	private isClosed = false

	/**
	 * @param dbPath - Path to SQLite file, or ":memory:" for tests
	 */
	constructor(dbPath: string) {
		this.dbPath = dbPath
	}

	/**
	 * Open the database connection with WAL mode enabled.
	 * @returns true if successfully opened, false otherwise
	 */
	open(): boolean {
		try {
			this.db = new Database(this.dbPath) as DatabaseInstance
			this.db.exec("PRAGMA journal_mode=WAL")
			this.db.exec("PRAGMA busy_timeout=3000")
			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Failed to open database at ${this.dbPath}: ${message}`)
			this.db = null
			return false
		}
	}

	/**
	 * Initialize schema (tables and indexes).
	 * Safe to call multiple times (uses IF NOT EXISTS).
	 * Detects and migrates old-schema databases created before the
	 * status/end_cause redesign.
	 * @returns true if successful, false otherwise
	 */
	initSchema(): boolean {
		if (!this.db) {
			console.warn("[HitlDatabase] Cannot init schema: database not open")
			return false
		}
		if (this.isClosed) {
			console.warn("[HitlDatabase] Cannot init schema: database is closed")
			return false
		}
		try {
			// Attempt CREATE TABLE IF NOT EXISTS first — works for new databases
			this.db.exec(SESSIONS_TABLE_SQL)
			this.db.exec(EVENTS_TABLE_SQL)
			this.db.exec(ACTIVITY_EVENTS_TABLE_SQL)
			this.db.exec(PERMISSION_EVENTS_TABLE_SQL)
			this.db.exec(PROJECT_HASH_INDEX_SQL)
			this.db.exec(SESSION_ID_INDEX_SQL)
			this.db.exec(ACTIVITY_SESSION_ID_INDEX_SQL)
			this.db.exec(ACTIVITY_TIMESTAMP_INDEX_SQL)
			this.db.exec(PERMISSION_SESSION_ID_INDEX_SQL)

			// Migration: detect old-schema tables that exist but lack the new columns.
			// The old schema had "complete INTEGER" and "metadata_json TEXT" columns.
			// The new schema uses "status TEXT" and "end_cause TEXT" instead.
			this.migrateOldSchema()

			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Schema initialization failed: ${message}`)
			return false
		}
	}

	/**
	 * Migrate databases created with the old hitl_sessions schema.
	 * The old table had: id, project_hash, started_at, ended_at, complete, metadata_json
	 * The new table has: id, project_hash, started_at, ended_at, status, end_cause, agent_time_ms, hitl_time_ms, idle_time_ms
	 *
	 * Migration strategy:
	 * - Add missing columns (status, end_cause, agent_time_ms, hitl_time_ms, idle_time_ms)
	 * - Populate status from old 'complete' flag (1=closed, 0=active), NULL ended_at → active
	 * - Leave orphaned rows to be cleaned up by closeOrphanSessions()
	 */
	private migrateOldSchema(): void {
		if (!this.db) return
		try {
			// Check if this is the old schema by probing for the 'complete' column
			const pragmaRows = this.db.query("PRAGMA table_info(hitl_sessions)").all() as Array<{ name: string }>
			const columnNames = new Set(pragmaRows.map((r) => r.name))

			if (!columnNames.has("complete")) return // Already new schema

			console.warn("[HitlDatabase] Detected old-schema database, migrating...")

			// Add new columns that are missing
			const alterOps: Array<[string, string]> = [
				["status", "TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'orphaned'))"],
				["end_cause", "TEXT CHECK (end_cause IN ('complete', 'disconnect', 'signal', 'orphaned'))"],
				["agent_time_ms", "INTEGER NOT NULL DEFAULT 0"],
				["hitl_time_ms", "INTEGER NOT NULL DEFAULT 0"],
				["idle_time_ms", "INTEGER NOT NULL DEFAULT 0"],
			]

			for (const [colName, colDef] of alterOps) {
				if (!columnNames.has(colName)) {
					this.db.exec(`ALTER TABLE hitl_sessions ADD COLUMN ${colName} ${colDef}`)
				}
			}

			// Migrate data: closed sessions where complete=1
			this.db.exec(`
				UPDATE hitl_sessions
				SET status = 'closed', end_cause = 'complete'
				WHERE complete = 1 AND status IS NULL
			`)

			// Sessions with NULL ended_at and complete=0 stay 'active'
			// Sessions with NULL ended_at and complete=1 get status from above

			console.warn("[HitlDatabase] Migration complete.")
		} catch (error) {
			// Non-fatal: log and continue
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Migration failed (non-fatal): ${message}`)
		}
	}

	/**
	 * Execute a SQL statement with optional parameters.
	 * Non-fatal: logs on error, returns boolean success.
	 *
	 * @param sql - SQL statement
	 * @param params - Bound parameters
	 * @returns true if executed successfully, false otherwise
	 */
	run(sql: string, params: (string | number | null)[] = []): boolean {
		if (!this.db) {
			console.warn("[HitlDatabase] Cannot run: database not open")
			return false
		}
		if (this.isClosed) {
			console.warn("[HitlDatabase] Cannot run: database is closed")
			return false
		}
		try {
			this.db.run(sql, params)
			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Query failed: ${message} | SQL: ${sql.slice(0, 100)}`)
			return false
		}
	}

	/**
	 * Execute a query and return typed results.
	 * Non-fatal: logs on error, returns empty array on failure.
	 *
	 * @param sql - SELECT statement
	 * @param params - Bound parameters
	 * @returns Array of results (empty on error)
	 */
	query<T extends Record<string, unknown>>(sql: string, params: (string | number | null)[] = []): T[] {
		if (!this.db) {
			console.warn("[HitlDatabase] Cannot query: database not open")
			return []
		}
		if (this.isClosed) {
			console.warn("[HitlDatabase] Cannot query: database is closed")
			return []
		}
		try {
			const stmt = this.db.query(sql)
			// Use Function.prototype.apply to spread array params as individual arguments.
			// stmt.all(...[a, b]) fails in Bun — .apply(stmt, [a, b]) works correctly.
			return (stmt.all as (...args: unknown[]) => unknown[]).apply(stmt, params) as T[]
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Query failed: ${message} | SQL: ${sql.slice(0, 100)}`)
			return []
		}
	}

	/**
	 * Close the database connection.
	 * Safe to call multiple times.
	 */
	close(): void {
		if (this.isClosed || !this.db) {
			return
		}
		try {
			this.db.close()
			this.isClosed = true
			this.db = null
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Error closing database: ${message}`)
		}
	}

	/**
	 * Check if database is open and ready for operations.
	 */
	get isOpen(): boolean {
		return this.db !== null && !this.isClosed
	}

	/**
	 * Get the underlying Database instance for advanced operations.
	 * Returns null if closed or not open.
	 */
	get raw(): DatabaseInstance | null {
		return this.isClosed ? null : this.db
	}
}
