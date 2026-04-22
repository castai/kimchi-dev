import { constants, accessSync } from "node:fs"
import { homedir } from "node:os"
import { isAbsolute, resolve } from "node:path"

function expandTilde(filePath: string): string {
	if (filePath === "~") return homedir()
	if (filePath.startsWith("~/")) return resolve(homedir(), filePath.slice(2))
	return filePath
}

export function resolveAttachmentPath(filePath: string, cwd: string): string {
	const expanded = expandTilde(filePath)
	return isAbsolute(expanded) ? expanded : resolve(cwd, expanded)
}

export function attachmentExists(filePath: string, cwd: string): boolean {
	try {
		accessSync(resolveAttachmentPath(filePath, cwd), constants.F_OK)
		return true
	} catch {
		return false
	}
}
