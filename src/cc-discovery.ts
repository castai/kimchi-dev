import { existsSync, readFileSync, readdirSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import type { ServerEntry } from "./extensions/mcp-adapter/types.js"

const CC_CONFIG_PATH = join(homedir(), ".claude.json")
const CC_SKILLS_DIR = join(homedir(), ".claude", "skills")

export interface CcDiscovery {
	mcpServers: Record<string, ServerEntry>
	skillCount: number
}

interface CcMcpServerRaw {
	type?: string
	command?: string
	args?: string[]
	env?: Record<string, string>
	cwd?: string
	url?: string
	header?: Record<string, string>
	headers?: Record<string, string>
	[key: string]: unknown
}

function transformServer(raw: CcMcpServerRaw): ServerEntry {
	const entry: ServerEntry = {}
	if (raw.command !== undefined) entry.command = raw.command
	if (raw.args !== undefined) entry.args = raw.args
	if (raw.env !== undefined) entry.env = raw.env
	if (raw.cwd !== undefined) entry.cwd = raw.cwd
	if (raw.url !== undefined) entry.url = raw.url
	const headers = raw.headers ?? raw.header
	if (headers !== undefined) entry.headers = headers
	if (
		raw.url !== undefined &&
		headers !== null &&
		typeof headers === "object" &&
		hasBearerAuthorizationHeader(headers)
	) {
		entry.auth = "bearer"
	}
	return entry
}

function hasBearerAuthorizationHeader(headers: Record<string, string>): boolean {
	return Object.entries(headers).some(
		([k, v]) => k.toLowerCase() === "authorization" && typeof v === "string" && v.toLowerCase().startsWith("bearer "),
	)
}

export function discoverCcConfig(): CcDiscovery {
	const mcpServers: Record<string, ServerEntry> = {}

	try {
		const raw = JSON.parse(readFileSync(CC_CONFIG_PATH, "utf-8"))
		const projects = raw?.projects
		if (projects && typeof projects === "object") {
			for (const project of Object.values(projects)) {
				const servers = (project as Record<string, unknown>)?.mcpServers
				if (!servers || typeof servers !== "object") continue
				for (const [name, def] of Object.entries(servers as Record<string, unknown>)) {
					if (!mcpServers[name] && def !== null && typeof def === "object" && !Array.isArray(def)) {
						mcpServers[name] = transformServer(def as CcMcpServerRaw)
					}
				}
			}
		}

		const topLevel = raw?.mcpServers
		if (topLevel && typeof topLevel === "object") {
			for (const [name, def] of Object.entries(topLevel as Record<string, unknown>)) {
				if (!mcpServers[name] && def !== null && typeof def === "object" && !Array.isArray(def)) {
					mcpServers[name] = transformServer(def as CcMcpServerRaw)
				}
			}
		}
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
			console.warn(`Failed to read Claude Code config: ${err instanceof Error ? err.message : String(err)}`)
		}
	}

	let skillCount = 0
	if (existsSync(CC_SKILLS_DIR)) {
		try {
			skillCount = readdirSync(CC_SKILLS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()).length
		} catch (err) {
			console.warn(`Failed to read Claude Code skills directory: ${err instanceof Error ? err.message : String(err)}`)
		}
	}

	return { mcpServers, skillCount }
}
