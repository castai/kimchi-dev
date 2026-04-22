import { readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"

const KIMCHI_CONFIG_PATH = resolve(homedir(), ".config", "kimchi", "config.json")
const AGENT_CONFIG_DIR = resolve(homedir(), ".config", "kimchi", "harness")
const CAST_AI_LLM_ENDPOINT = "https://llm.cast.ai/openai/v1"
const DEFAULT_TELEMETRY_ENDPOINT = "https://api.cast.ai/ai-optimizer/v1beta/logs:ingest"

export const DEFAULT_SKILL_PATHS = [
	join(homedir(), ".pi", "agent", "skills"),
	join(homedir(), ".config", "kimchi", "harness", "skills"),
	join(homedir(), ".claude", "skills"),
]

export interface TelemetryConfig {
	enabled: boolean
	endpoint: string
	headers: Record<string, string>
}

export interface SearchStrategyConfig {
	strategy: "bm25" | "regex"
	bm25K1: number
	bm25B: number
	fieldWeights: { name: number; description: number; schemaKey: number }
}

export const SEARCH_STRATEGY_DEFAULTS: SearchStrategyConfig = {
	strategy: "bm25",
	bm25K1: 1.2,
	bm25B: 0.75,
	fieldWeights: { name: 6, description: 2, schemaKey: 1 },
}

export interface KimchiConfig {
	apiKey: string
	agentConfigDir: string
	llmEndpoint: string
	maxToolResultChars: number
	mcpSearchLimit: number
	mcpSearch: SearchStrategyConfig
	skillPaths?: string[]
}

/**
 * Read the Cast AI API key from the kimchi CLI config file.
 * Returns undefined if the file doesn't exist or the field is missing.
 */
function readApiKeyFromConfigFile(configPath: string): string | undefined {
	try {
		const raw = readFileSync(configPath, "utf-8")
		const parsed = JSON.parse(raw)
		if (typeof parsed.api_key === "string" && parsed.api_key.length > 0) {
			return parsed.api_key
		}
		return undefined
	} catch {
		return undefined
	}
}

function readConfigExtras(configPath: string): {
	maxToolResultChars?: number
	mcpSearchLimit?: number
	mcpSearch?: Partial<SearchStrategyConfig>
	skillPaths?: string[]
} {
	try {
		const raw = readFileSync(configPath, "utf-8")
		const parsed = JSON.parse(raw)
		const maxToolResultChars =
			typeof parsed.maxToolResultChars === "number" && parsed.maxToolResultChars > 0
				? parsed.maxToolResultChars
				: undefined
		const mcpSearchLimit =
			typeof parsed.mcpSearchLimit === "number" && parsed.mcpSearchLimit > 0 ? parsed.mcpSearchLimit : undefined
		let mcpSearch: Partial<SearchStrategyConfig> | undefined
		const s = parsed.mcpSearch
		if (s && typeof s === "object") {
			mcpSearch = {
				...(s.strategy === "bm25" || s.strategy === "regex" ? { strategy: s.strategy } : {}),
				...(typeof s.bm25K1 === "number" ? { bm25K1: s.bm25K1 } : {}),
				...(typeof s.bm25B === "number" ? { bm25B: s.bm25B } : {}),
				...(s.fieldWeights && typeof s.fieldWeights === "object"
					? {
							fieldWeights: {
								name:
									typeof s.fieldWeights.name === "number"
										? s.fieldWeights.name
										: SEARCH_STRATEGY_DEFAULTS.fieldWeights.name,
								description:
									typeof s.fieldWeights.description === "number"
										? s.fieldWeights.description
										: SEARCH_STRATEGY_DEFAULTS.fieldWeights.description,
								schemaKey:
									typeof s.fieldWeights.schemaKey === "number"
										? s.fieldWeights.schemaKey
										: SEARCH_STRATEGY_DEFAULTS.fieldWeights.schemaKey,
							},
						}
					: {}),
			}
		}
		const skillPaths =
			Array.isArray(parsed.skillPaths) && parsed.skillPaths.every((p: unknown) => typeof p === "string")
				? (parsed.skillPaths as string[])
				: undefined
		return { maxToolResultChars, mcpSearchLimit, mcpSearch, skillPaths }
	} catch {
		return {}
	}
}

/**
 * Read telemetry configuration from config.json without requiring an API key.
 * Safe to call before authentication is set up.
 *
 * Telemetry is disabled by default. It is enabled when:
 *   - KIMCHI_TELEMETRY_ENABLED env var is set to a truthy value, or
 *   - config.json has telemetry.enabled = true
 *
 * Auth header resolution order:
 *   1. telemetry.headers in config.json (explicit override)
 *   2. KIMCHI_API_KEY env var → Authorization: Bearer <key>
 *   3. api_key in config.json → Authorization: Bearer <key>
 */
export function readTelemetryConfig(configPath?: string): TelemetryConfig {
	const path = configPath ?? KIMCHI_CONFIG_PATH
	const envEnabled = process.env.KIMCHI_TELEMETRY_ENABLED
	let fileEnabled: boolean | undefined
	let fileEndpoint: string | undefined
	let fileHeaders: Record<string, string> | undefined

	try {
		const raw = readFileSync(path, "utf-8")
		const parsed = JSON.parse(raw)
		const t = parsed.telemetry
		if (t && typeof t === "object") {
			if (typeof t.enabled === "boolean") fileEnabled = t.enabled
			if (typeof t.endpoint === "string" && t.endpoint.length > 0) fileEndpoint = t.endpoint
			if (t.headers && typeof t.headers === "object" && !Array.isArray(t.headers)) {
				fileHeaders = t.headers as Record<string, string>
			}
		}
	} catch {
		// missing or invalid config — use defaults
	}

	// Resolve auth headers: explicit config override takes priority, then API key
	let headers: Record<string, string>
	let apiKey: string | undefined
	if (fileHeaders) {
		headers = fileHeaders
	} else {
		apiKey =
			(typeof process.env.KIMCHI_API_KEY === "string" && process.env.KIMCHI_API_KEY.length > 0
				? process.env.KIMCHI_API_KEY
				: undefined) ?? readApiKeyFromConfigFile(path)
		headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
	}

	// Enabled by default when an API key is available; explicit config/env overrides either way
	const defaultEnabled = fileHeaders ? Object.keys(fileHeaders).length > 0 : !!apiKey
	const enabled =
		envEnabled !== undefined ? envEnabled !== "0" && envEnabled !== "false" : (fileEnabled ?? defaultEnabled)

	return {
		enabled,
		endpoint: fileEndpoint ?? DEFAULT_TELEMETRY_ENDPOINT,
		headers,
	}
}

/**
 * Load the kimchi-code configuration.
 *
 * API key resolution order:
 *   1. KIMCHI_API_KEY environment variable (highest precedence)
 *   2. ~/.config/kimchi/config.json field "APIKey"
 *
 * Throws if no API key is found in either location.
 */
export function loadConfig(options?: { configPath?: string; env?: Record<string, string | undefined> }): KimchiConfig {
	const env = options?.env ?? process.env
	const configPath = options?.configPath ?? KIMCHI_CONFIG_PATH
	const extras = readConfigExtras(configPath)
	const maxToolResultChars = extras.maxToolResultChars ?? 10_000
	const mcpSearchLimit = extras.mcpSearchLimit ?? 5
	const mcpSearch: SearchStrategyConfig = { ...SEARCH_STRATEGY_DEFAULTS, ...extras.mcpSearch }

	const skillPaths = extras.skillPaths

	const envKey = env.KIMCHI_API_KEY
	if (typeof envKey === "string" && envKey.length > 0) {
		return {
			apiKey: envKey,
			agentConfigDir: AGENT_CONFIG_DIR,
			llmEndpoint: CAST_AI_LLM_ENDPOINT,
			maxToolResultChars,
			mcpSearchLimit,
			mcpSearch,
			skillPaths,
		}
	}

	const fileKey = readApiKeyFromConfigFile(configPath)
	if (fileKey) {
		return {
			apiKey: fileKey,
			agentConfigDir: AGENT_CONFIG_DIR,
			llmEndpoint: CAST_AI_LLM_ENDPOINT,
			maxToolResultChars,
			mcpSearchLimit,
			mcpSearch,
			skillPaths,
		}
	}

	throw new Error(
		"No Kimchi API key found. Set the KIMCHI_API_KEY environment variable or log in with the kimchi CLI (`kimchi auth login`).",
	)
}

export function getAgentConfigDir(): string {
	return AGENT_CONFIG_DIR
}

export function writeSkillPaths(paths: string[], configPath?: string): void {
	const resolvedPath = configPath ?? KIMCHI_CONFIG_PATH
	let raw: Record<string, unknown> = {}
	try {
		raw = JSON.parse(readFileSync(resolvedPath, "utf-8")) as Record<string, unknown>
	} catch {
		// file missing or invalid — start fresh
	}
	raw.skillPaths = paths
	writeFileSync(resolvedPath, `${JSON.stringify(raw, null, 2)}\n`, "utf-8")
}
