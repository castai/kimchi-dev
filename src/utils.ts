import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

let cachedBranch: string | undefined
export function getGitBranch(): string {
	if (cachedBranch !== undefined) return cachedBranch
	try {
		cachedBranch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim()
	} catch {
		cachedBranch = ""
	}
	return cachedBranch
}

export function getFolder(): string {
	const cwd = process.cwd()
	const home = homedir()
	return cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd
}

let cachedVersion: string | undefined
export function getVersion(): string {
	if (cachedVersion !== undefined) return cachedVersion
	try {
		const dir = dirname(fileURLToPath(import.meta.url))
		const pkg = JSON.parse(readFileSync(resolve(dir, "../package.json"), "utf-8"))
		cachedVersion = pkg.version ?? "unknown"
	} catch {
		cachedVersion = "unknown"
	}
	return cachedVersion!
}
