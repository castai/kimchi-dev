import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

export function getGitBranch(): string {
	try {
		let gitPath = resolve(process.cwd(), ".git")
		let head: string
		try {
			head = readFileSync(resolve(gitPath, "HEAD"), "utf-8").trim()
		} catch {
			const gitFile = readFileSync(gitPath, "utf-8").trim()
			if (!gitFile.startsWith("gitdir: ")) return ""
			gitPath = resolve(process.cwd(), gitFile.slice("gitdir: ".length))
			head = readFileSync(resolve(gitPath, "HEAD"), "utf-8").trim()
		}
		if (head.startsWith("ref: refs/heads/")) return head.slice("ref: refs/heads/".length)
		return head.slice(0, 7)
	} catch {
		return ""
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
