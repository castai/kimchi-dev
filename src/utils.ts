import { execSync } from "node:child_process"
import { homedir } from "node:os"

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
