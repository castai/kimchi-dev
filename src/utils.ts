import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

export function getGitBranch(cwd?: string): string | undefined {
	try {
		return (
			execSync("git symbolic-ref --short HEAD", {
				cwd: cwd ?? process.cwd(),
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
			}).trim() || undefined
		)
	} catch {
		return undefined
	}
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
