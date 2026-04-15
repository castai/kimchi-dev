import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { resolve } from "node:path"

const KIMCHI_CONFIG_PATH = resolve(homedir(), ".config", "kimchi", "config.json")
const AGENT_CONFIG_DIR = resolve(homedir(), ".config", "kimchi", "harness")
const CAST_AI_LLM_ENDPOINT = "https://llm.cast.ai/openai/v1"
const DEFAULT_TELEMETRY_ENDPOINT = "https://api.cast.ai/ai-optimizer/v1beta/logs:ingest"

export interface TelemetryConfig {
	enabled: boolean
	endpoint: string
	headers: Record<string, string>
}

export interface KimchiConfig {
	apiKey: string
	agentConfigDir: string
	llmEndpoint: string
	maxToolResultChars: number
	mcpSearchLimit: number
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

function readConfigExtras(configPath: string): { maxToolResultChars?: number; mcpSearchLimit?: number } {
	try {
		const raw = readFileSync(configPath, "utf-8")
		const parsed = JSON.parse(raw)
		const maxToolResultChars =
			typeof parsed.maxToolResultChars === "number" && parsed.maxToolResultChars > 0
				? parsed.maxToolResultChars
				: undefined
		const mcpSearchLimit =
			typeof parsed.mcpSearchLimit === "number" && parsed.mcpSearchLimit > 0 ? parsed.mcpSearchLimit : undefined
		return { maxToolResultChars, mcpSearchLimit }
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

	const enabled = envEnabled !== undefined ? envEnabled !== "0" && envEnabled !== "false" : (fileEnabled ?? false)

	// Resolve auth headers: explicit config override takes priority, then API key
	let headers: Record<string, string>
	if (fileHeaders) {
		headers = fileHeaders
	} else {
		const apiKey =
			(typeof process.env.KIMCHI_API_KEY === "string" && process.env.KIMCHI_API_KEY.length > 0
				? process.env.KIMCHI_API_KEY
				: undefined) ?? readApiKeyFromConfigFile(path)
		headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {}
	}

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

	const envKey = env.KIMCHI_API_KEY
	if (typeof envKey === "string" && envKey.length > 0) {
		return {
			apiKey: envKey,
			agentConfigDir: AGENT_CONFIG_DIR,
			llmEndpoint: CAST_AI_LLM_ENDPOINT,
			maxToolResultChars,
			mcpSearchLimit,
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
		}
	}

	throw new Error(
		"No Kimchi API key found. Set the KIMCHI_API_KEY environment variable or log in with the kimchi CLI (`kimchi auth login`).",
	)
}

export function getAgentConfigDir(): string {
	return AGENT_CONFIG_DIR
}
