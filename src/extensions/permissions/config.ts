import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { z } from "zod"
import { DEFAULT_CONFIG, type PermissionsConfig } from "./types.js"

const modeSchema = z.enum(["default", "plan", "auto"])

const configSchema = z
	.object({
		defaultMode: modeSchema.optional(),
		allow: z.array(z.string()).optional(),
		deny: z.array(z.string()).optional(),
		classifierTimeoutMs: z.number().int().positive().optional(),
	})
	.strict()

export interface LoadedConfig {
	config: PermissionsConfig
	// Rules tagged with their source (user/project/local) at load time so the
	// evaluator can apply precedence and the UI can explain decisions.
	allowBySource: { user: string[]; project: string[]; local: string[]; cli: string[] }
	denyBySource: { user: string[]; project: string[]; local: string[]; cli: string[] }
	paths: { user?: string; project?: string; local?: string; cliOverride?: string }
}

export interface LoadConfigOptions {
	cwd: string
	cliConfigPath?: string
	cliAllow?: string[]
	cliDeny?: string[]
}

const USER_CONFIG_PATH = resolve(homedir(), ".config", "kimchi", "harness", "permissions.json")
const PROJECT_CONFIG_SUFFIX = join(".kimchi", "permissions.json")
const LOCAL_CONFIG_SUFFIX = join(".kimchi", "permissions.local.json")

function readConfigFile(path: string): { data: PermissionsConfig | null; error?: string } {
	if (!existsSync(path)) return { data: null }
	try {
		const raw = readFileSync(path, "utf-8")
		const parsed = JSON.parse(raw)
		const validated = configSchema.safeParse(parsed)
		if (!validated.success) {
			return { data: null, error: `${path}: ${validated.error.message}` }
		}
		return {
			data: {
				defaultMode: validated.data.defaultMode ?? DEFAULT_CONFIG.defaultMode,
				allow: validated.data.allow ?? [],
				deny: validated.data.deny ?? [],
				classifierTimeoutMs: validated.data.classifierTimeoutMs ?? DEFAULT_CONFIG.classifierTimeoutMs,
			},
		}
	} catch (err) {
		return { data: null, error: `${path}: ${(err as Error).message}` }
	}
}

export function loadConfig(options: LoadConfigOptions): { loaded: LoadedConfig; errors: string[] } {
	const errors: string[] = []

	// Seed with user file, falling back to built-in defaults when absent.
	const userPath = USER_CONFIG_PATH
	const userRead = readConfigFile(userPath)
	if (userRead.error) errors.push(userRead.error)

	const projectPath = resolve(options.cwd, PROJECT_CONFIG_SUFFIX)
	const projectRead = readConfigFile(projectPath)
	if (projectRead.error) errors.push(projectRead.error)

	const localPath = resolve(options.cwd, LOCAL_CONFIG_SUFFIX)
	const localRead = readConfigFile(localPath)
	if (localRead.error) errors.push(localRead.error)

	const cliPath = options.cliConfigPath
	const cliRead = cliPath ? readConfigFile(resolve(cliPath)) : { data: null }
	if (cliRead.error) errors.push(cliRead.error)

	// CLI override replaces entirely; otherwise user/project/local merge.
	let effective: PermissionsConfig
	if (cliRead.data) {
		effective = cliRead.data
	} else {
		const user = userRead.data ?? DEFAULT_CONFIG
		const project = projectRead.data
		const local = localRead.data
		effective = {
			defaultMode: local?.defaultMode ?? project?.defaultMode ?? user.defaultMode,
			allow: [...(user.allow ?? []), ...(project?.allow ?? []), ...(local?.allow ?? [])],
			deny: [...(user.deny ?? []), ...(project?.deny ?? []), ...(local?.deny ?? [])],
			classifierTimeoutMs: local?.classifierTimeoutMs ?? project?.classifierTimeoutMs ?? user.classifierTimeoutMs,
		}
	}

	// Merge CLI-flag rules (highest precedence via `cli` source).
	const cliAllow = options.cliAllow ?? []
	const cliDeny = options.cliDeny ?? []

	const loaded: LoadedConfig = {
		config: effective,
		allowBySource: {
			user: userRead.data?.allow ?? [],
			project: projectRead.data?.allow ?? [],
			local: localRead.data?.allow ?? [],
			cli: cliAllow,
		},
		denyBySource: {
			user: userRead.data?.deny ?? [],
			project: projectRead.data?.deny ?? [],
			local: localRead.data?.deny ?? [],
			cli: cliDeny,
		},
		paths: {
			user: userRead.data ? userPath : undefined,
			project: projectRead.data ? projectPath : undefined,
			local: localRead.data ? localPath : undefined,
			cliOverride: cliRead.data && cliPath ? resolve(cliPath) : undefined,
		},
	}

	return { loaded, errors }
}

/**
 * Write the built-in default config to the user path if the user file is
 * missing. Returns the path written, or undefined if a file already exists.
 */
export function ensureUserConfig(): string | undefined {
	if (existsSync(USER_CONFIG_PATH)) return undefined
	const dir = dirname(USER_CONFIG_PATH)
	try {
		if (!existsSync(dir)) {
			// node:fs mkdirSync with recursive is fine; but avoid importing extra.
			require("node:fs").mkdirSync(dir, { recursive: true })
		}
		writeFileSync(USER_CONFIG_PATH, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, "utf-8")
		return USER_CONFIG_PATH
	} catch {
		return undefined
	}
}

export function userConfigPath(): string {
	return USER_CONFIG_PATH
}

export function projectConfigPath(cwd: string): string {
	return resolve(cwd, PROJECT_CONFIG_SUFFIX)
}

export function localConfigPath(cwd: string): string {
	return resolve(cwd, LOCAL_CONFIG_SUFFIX)
}

/**
 * Append rules to a config file, creating the file and parent directory if
 * needed. Returns the resolved path on success.
 */
export function appendToConfig(path: string, toAdd: { allow?: string[]; deny?: string[] }): string {
	const fs = require("node:fs")
	let existing: PermissionsConfig = { ...DEFAULT_CONFIG }
	if (existsSync(path)) {
		const read = readConfigFile(path)
		if (read.data) existing = read.data
	} else {
		existing = { ...DEFAULT_CONFIG, allow: [], deny: [] }
		fs.mkdirSync(dirname(path), { recursive: true })
	}
	const merged: PermissionsConfig = {
		...existing,
		allow: dedupe([...(existing.allow ?? []), ...(toAdd.allow ?? [])]),
		deny: dedupe([...(existing.deny ?? []), ...(toAdd.deny ?? [])]),
	}
	writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`, "utf-8")
	return path
}

function dedupe(items: string[]): string[] {
	return Array.from(new Set(items.map((s) => s.trim()).filter(Boolean)))
}
