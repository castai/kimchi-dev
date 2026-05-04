import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { statePath } from "./paths.js"

export interface RepoState {
	checkedAt: number
	latestVersion: string
	releaseUrl?: string
}

interface PersistedState {
	repos?: Record<string, RepoState>
}

const TTL_MS = 24 * 60 * 60 * 1_000

export function isStale(rs: RepoState, now: number = Date.now()): boolean {
	return now - rs.checkedAt > TTL_MS
}

function repoKey(owner: string, name: string): string {
	return `${owner}/${name}`
}

function loadState(): PersistedState | null {
	try {
		const raw = readFileSync(statePath(), "utf-8")
		return JSON.parse(raw) as PersistedState
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") return null
		// Treat corruption as missing — the next save will overwrite.
		return null
	}
}

function saveState(state: PersistedState): void {
	const path = statePath()
	mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
	const tmp = `${path}.tmp`
	writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
	renameSync(tmp, path)
}

/** Read cached state for a repo, returning null when missing or unparseable. */
export function loadRepoState(owner: string, name: string): RepoState | null {
	const state = loadState()
	if (!state?.repos) return null
	return state.repos[repoKey(owner, name)] ?? null
}

/**
 * Read-modify-write the per-repo state. Best-effort: errors are swallowed
 * so a corrupt state file can't block an actual update. Mirrors the Go
 * side's mutex-guarded saveRepoState; we don't bother with a mutex because
 * the kimchi process is single-threaded and there's no second consumer of
 * this file (no harness any more).
 */
export function saveRepoState(owner: string, name: string, rs: RepoState): void {
	try {
		const state = loadState() ?? {}
		const repos = state.repos ?? {}
		repos[repoKey(owner, name)] = rs
		saveState({ ...state, repos })
	} catch {
		// Cache is best-effort.
	}
}

/** Honors $KIMCHI_NO_UPDATE_CHECK=<anything-truthy>. */
export function isUpdateCheckDisabled(): boolean {
	const v = process.env.KIMCHI_NO_UPDATE_CHECK
	return v !== undefined && v !== ""
}
