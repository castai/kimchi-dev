import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

let cachedBranch: string | undefined
export function resetGitBranch(): void {
	cachedBranch = undefined
}
export function getGitBranch(): string {
	if (cachedBranch !== undefined) return cachedBranch
	try {
		cachedBranch = execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim()
	} catch {
		cachedBranch = ""
	}
	return cachedBranch
}

export function getFolder(): string {
	const cwd = process.cwd()
	const home = homedir()
	if (cwd === home) return "~"
	if (cwd.startsWith(home + sep)) return `~${cwd.slice(home.length)}`
	return cwd
}

let cachedVersion: string | undefined
export function getVersion(): string {
	if (cachedVersion !== undefined) return cachedVersion
	try {
		const pkgDir = process.env.PI_PACKAGE_DIR
		const pkgPath = pkgDir
			? resolve(pkgDir, "package.json")
			: resolve(dirname(fileURLToPath(import.meta.url)), "../package.json")
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"))
		cachedVersion = pkg.version ?? "unknown"
	} catch {
		cachedVersion = "unknown"
	}
	return cachedVersion ?? "unknown"
}
