/**
 * HITL Metrics Storage Barrel Export
 *
 * Boundary contract for S02 consumption.
 */

export { HitlDatabase } from "./db.ts"
export { SESSIONS_TABLE_SQL, EVENTS_TABLE_SQL, PROJECT_HASH_INDEX_SQL, SESSION_ID_INDEX_SQL } from "./schema.ts"
export { projectHash } from "./hash.ts"
export {
	getOrCreateSession,
	closeSession,
	closeOrphanSessions,
	getRecentSessions,
	getSessionStats,
	getSessionEvents,
} from "./session.ts"
