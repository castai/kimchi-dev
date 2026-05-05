import { readFileSync, realpathSync, statSync } from "node:fs"
import { homedir, platform } from "node:os"
import { basename, join } from "node:path"
import { writeFileAtomic } from "./json.js"

export type DetectedShell = "zsh" | "bash" | "fish"

export interface ShellProfile {
	path: string
	shell: DetectedShell
}

/**
 * Add or update a single export line in the user's shell profile so a value
 * (typically the Kimchi API key) is available in fresh terminals. Returns
 * the path written to, or null when no profile could be detected.
 *
 * Detects the shell from $SHELL with filesystem fallbacks, resolves
 * symlinks before writing so we don't replace a symlink with a regular
 * file, and replaces any existing line for the same key in place to keep
 * the profile tidy.
 */
export function exportEnvToShellProfile(key: string, value: string): string | null {
	const detected = detectShellProfile()
	if (!detected) return null

	let { path } = detected
	const { shell } = detected

	// Resolve symlinks so tmp+rename targets the real file. realpathSync
	// throws ENOENT if the file doesn't exist yet; that's fine — we'll
	// create it.
	try {
		path = realpathSync(path)
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
			throw new Error(`resolve symlink ${path}: ${(err as Error).message}`)
		}
	}

	const exportLine = shell === "fish" ? `set -gx ${key} ${value}` : `export ${key}=${value}`
	const matchPrefix = shell === "fish" ? `set -gx ${key} ` : `export ${key}=`

	let content = ""
	let raw: Buffer | null = null
	try {
		raw = readFileSync(path)
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
			throw new Error(`read ${path}: ${(err as Error).message}`)
		}
	}
	if (raw && raw.length > 0) {
		// Node's "utf-8" decoder is lossy (replaces invalid bytes with U+FFFD),
		// which would let us silently corrupt a profile that contains, say, a
		// Latin-1 prompt character. Use TextDecoder with fatal=true so we abort
		// instead.
		try {
			content = new TextDecoder("utf-8", { fatal: true }).decode(raw)
		} catch {
			throw new Error(`shell profile ${path} contains non-UTF-8 content, skipping`)
		}
	}

	const lines = content.split("\n")
	let found = false
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trimStart().startsWith(matchPrefix)) {
			lines[i] = exportLine
			found = true
			break
		}
	}

	if (!found) {
		// Preserve the trailing newline that well-behaved profiles end with.
		if (lines.length > 0 && lines[lines.length - 1] === "") {
			lines[lines.length - 1] = exportLine
			lines.push("")
		} else {
			lines.push(exportLine)
		}
	}

	writeFileAtomic(path, lines.join("\n"))
	return path
}

function detectShellProfile(): ShellProfile | null {
	const home = homedir()
	if (!home) return null

	const shellEnv = process.env.SHELL ?? ""
	const shell = basename(shellEnv)

	switch (shell) {
		case "zsh":
			return { path: join(home, ".zshrc"), shell: "zsh" }
		case "bash":
			// macOS bash sources .bash_profile (not .bashrc) for login shells,
			// which is what Terminal.app spawns. Linux bash sources .bashrc.
			return platform() === "darwin"
				? { path: join(home, ".bash_profile"), shell: "bash" }
				: { path: join(home, ".bashrc"), shell: "bash" }
		case "fish":
			return { path: join(home, ".config", "fish", "config.fish"), shell: "fish" }
	}

	// $SHELL was empty or unrecognised. Fall back to whichever profile
	// already exists, preferring zsh on macOS where it's been the default
	// since 10.15.
	if (platform() === "darwin" && fileExists(join(home, ".zshrc"))) {
		return { path: join(home, ".zshrc"), shell: "zsh" }
	}
	if (fileExists(join(home, ".bashrc"))) {
		return { path: join(home, ".bashrc"), shell: "bash" }
	}
	if (fileExists(join(home, ".bash_profile"))) {
		return { path: join(home, ".bash_profile"), shell: "bash" }
	}
	return null
}

function fileExists(path: string): boolean {
	try {
		statSync(path)
		return true
	} catch {
		return false
	}
}
