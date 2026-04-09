import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { resolve } from "node:path"

const KIMCHI_CONFIG_PATH = resolve(homedir(), ".config", "kimchi", "config.json")
const AGENT_CONFIG_DIR = resolve(homedir(), ".config", "kimchi", "harness")
const CAST_AI_LLM_ENDPOINT = "https://llm.cast.ai/openai/v1"

export interface KimchiConfig {
	apiKey: string
	agentConfigDir: string
	llmEndpoint: string
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

	const envKey = env.KIMCHI_API_KEY
	if (typeof envKey === "string" && envKey.length > 0) {
		return {
			apiKey: envKey,
			agentConfigDir: AGENT_CONFIG_DIR,
			llmEndpoint: CAST_AI_LLM_ENDPOINT,
		}
	}

	const fileKey = readApiKeyFromConfigFile(configPath)
	if (fileKey) {
		return {
			apiKey: fileKey,
			agentConfigDir: AGENT_CONFIG_DIR,
			llmEndpoint: CAST_AI_LLM_ENDPOINT,
		}
	}

	throw new Error(
		"No Kimchi API key found. Set the KIMCHI_API_KEY environment variable or log in with the kimchi CLI (`kimchi auth login`).",
	)
}

export function getAgentConfigDir(): string {
	return AGENT_CONFIG_DIR
}
