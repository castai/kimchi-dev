// extensions/lsp/servers.ts
import * as fs from "node:fs"
import path from "node:path"
import type { ServerConfig } from "./types.js"

const SERVERS: ServerConfig[] = [
	{
		name: "typescript-language-server",
		command: "typescript-language-server",
		args: ["--stdio"],
		extensions: ["ts", "tsx", "mts", "cts", "js", "jsx", "mjs", "cjs"],
	},
	{
		name: "gopls",
		command: "gopls",
		args: [],
		extensions: ["go"],
	},
]

function exists(cmd: string): boolean {
	try {
		const result = (globalThis as any).Bun.spawnSync(["which", cmd], { stdout: "pipe", stderr: "pipe" })
		return result.exitCode === 0
	} catch {
		return false
	}
}

function cwdHasExtension(cwd: string, exts: string[]): boolean {
	try {
		const entries = fs.readdirSync(cwd, { recursive: true, withFileTypes: true })
		return (entries as fs.Dirent[]).some(
			e => e.isFile() && exts.some(ext => e.name.endsWith(`.${ext}`)),
		)
	} catch {
		return false
	}
}

/** Detect which LSP servers apply to the given cwd based on file extensions present. */
export function detectServers(cwd: string): ServerConfig[] {
	const applicable: ServerConfig[] = []

	for (const server of SERVERS) {
		let apply = false

		if (server.name === "typescript-language-server") {
			apply =
				fs.existsSync(path.join(cwd, "tsconfig.json")) ||
				fs.existsSync(path.join(cwd, "package.json")) ||
				cwdHasExtension(cwd, server.extensions)
		} else if (server.name === "gopls") {
			apply = fs.existsSync(path.join(cwd, "go.mod")) || cwdHasExtension(cwd, server.extensions)
		}

		if (apply && exists(server.command)) {
			applicable.push(server)
		}
	}

	return applicable
}

/** Get the server config for a specific file path, or null if no server applies. */
export function serverForFile(filePath: string, servers: ServerConfig[]): ServerConfig | null {
	const ext = path.extname(filePath).slice(1).toLowerCase()
	return servers.find(s => s.extensions.includes(ext)) ?? null
}
