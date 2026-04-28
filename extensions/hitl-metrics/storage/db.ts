/**
 * HITL Database Wrapper
 *
 * Thin wrapper around bun:sqlite with non-fatal error handling,
 * WAL mode, and schema initialization.
 */

import { Database } from "bun:sqlite"
import { SESSIONS_TABLE_SQL, EVENTS_TABLE_SQL, PROJECT_HASH_INDEX_SQL, SESSION_ID_INDEX_SQL } from "./schema.ts"

/**
 * Non-fatal database wrapper for HITL metrics.
 * All operations catch errors, log warnings, and return safe defaults.
 */
export class HitlDatabase {
	private db: Database | null = null
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
			this.db = new Database(this.dbPath)
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
			this.db.exec(SESSIONS_TABLE_SQL)
			this.db.exec(EVENTS_TABLE_SQL)
			this.db.exec(PROJECT_HASH_INDEX_SQL)
			this.db.exec(SESSION_ID_INDEX_SQL)
			return true
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error)
			console.warn(`[HitlDatabase] Schema initialization failed: ${message}`)
			return false
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
	run(sql: string, params: unknown[] = []): boolean {
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
	query<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
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
			return stmt.all(...params) as T[]
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
	get raw(): Database | null {
		return this.isClosed ? null : this.db
	}
}
