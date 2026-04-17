import { join } from "node:path"

export function resolveAuxiliaryFilesDir(env: Record<string, string | undefined>, homeDir: string): string {
	if (env.PI_PACKAGE_DIR) {
		return env.PI_PACKAGE_DIR
	}

	if (env.XDG_DATA_HOME) {
		return join(env.XDG_DATA_HOME, "kimchi")
	}

	return join(homeDir, ".local", "share", "kimchi")
}
