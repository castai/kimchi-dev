import { realpathSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"

const APP_DIR = "kimchi"

/**
 * Cache base, honoring XDG_CACHE_HOME on Linux. Mirrors paths.go cacheDir().
 * Used as the parent of state.json and any backup files.
 */
export function cacheDir(): string {
	const xdg = process.env.XDG_CACHE_HOME
	if (xdg && xdg.length > 0) return xdg
	return join(homedir(), ".cache")
}

/** State file path: ~/.cache/kimchi/state.json (or under $XDG_CACHE_HOME). */
export function statePath(): string {
	return join(cacheDir(), APP_DIR, "state.json")
}

/** Backups dir: ~/.cache/kimchi/backups/. Created on demand by the installer. */
export function backupDir(): string {
	return join(cacheDir(), APP_DIR, "backups")
}

/**
 * The real path of the running kimchi binary, with symlinks resolved. We
 * follow symlinks so writing to the result lands on the actual file
 * (Homebrew, manual installs, etc. all symlink kimchi from /usr/local/bin).
 *
 * Mirrors update/paths.go ResolveExecutablePath.
 */
export function resolveExecutablePath(): string {
	// process.execPath is the running binary in a Bun-compiled `kimchi` —
	// for `bun run` it points at the bun interpreter, but the self-update
	// path is only meant to run from the compiled binary, so this is fine.
	return realpathSync(process.execPath)
}

/**
 * Distribution root — `dirname(resolveExecutablePath())`. Used by the
 * installer to write the new binary alongside the running one before
 * the rename-into-place.
 */
export function executableDir(): string {
	return dirname(resolveExecutablePath())
}
