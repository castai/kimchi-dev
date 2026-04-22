import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export function getGitBranch(): string {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }).trim()
	} catch {
		return ""
	}
}

export function getFolder(): string {
	const cwd = process.cwd()
	const home = homedir()
	return cwd.startsWith(home) ? `~${cwd.slice(home.length)}` : cwd
}

export function getVersion(): string {
	try {
		const dir = dirname(fileURLToPath(import.meta.url))
		const pkg = JSON.parse(readFileSync(resolve(dir, "../package.json"), "utf-8"))
		return pkg.version ?? "unknown"
	} catch {
		return "unknown"
	}
}
