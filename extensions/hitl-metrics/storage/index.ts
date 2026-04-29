/**
 * HITL Metrics Storage Barrel Export
 *
 * Boundary contract for S02 consumption.
 */

export { HitlDatabase } from "./db.js"
export {
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
export { projectHash } from "./hash.js"
export type { EndCause } from "./session.js"
export {
	closeSession,
	closeOrphanSessions,
	getOrCreateSession,
	getRecentSessions,
	getSessionActivityEvents,
	getSessionEvents,
	getSessionPermissionEvents,
	getSessionStats,
	recordActivityEvent,
	recordPermissionEvent,
	updateSessionTimes,
} from "./session.js"
