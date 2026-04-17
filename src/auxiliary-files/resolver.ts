import { join } from "node:path"

/**
 * Resolves the auxiliary files directory for an installed kimchi-code binary.
 *
 * Resolution order:
 *  1. If `PI_PACKAGE_DIR` is set, use it (escape hatch for non-standard deployments).
 *  2. Otherwise, if `$XDG_DATA_HOME` is set, use `$XDG_DATA_HOME/kimchi/`.
 *  3. Otherwise, use `$HOME/.local/share/kimchi/`.
 *
 * This function is pure — it takes the environment and home directory as explicit
 * inputs and performs no I/O. This makes it trivially unit-testable and keeps the
 * XDG/platform logic encapsulated behind a single call.
 *
 * @param env - The process environment.
 * @param homeDir - The user's home directory. Used only when resolving the default `~/.local/share/kimchi/` fallback.
 * @returns The absolute path to the auxiliary files directory.
 */
export function resolveAuxiliaryFilesDir(env: Record<string, string | undefined>, homeDir: string): string {
	if (env.PI_PACKAGE_DIR) {
		return env.PI_PACKAGE_DIR
	}

	if (env.XDG_DATA_HOME) {
		return join(env.XDG_DATA_HOME, "kimchi")
	}

	return join(homeDir, ".local", "share", "kimchi")
}
