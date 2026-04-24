import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { getVersion } from "./utils.js"

const KIMCHI_API = "https://llm.kimchi.dev"
const MODELS_METADATA_API = `${KIMCHI_API}/v1/models/metadata?include_in_cli=true`
const CHAT_COMPLETIONS_API = `${KIMCHI_API}/openai/v1`
const FETCH_TIMEOUT_MS = 5000

export interface ModelMetadata {
	slug: string
	display_name: string
	description: string
	provider: string
	tool_call: boolean
	reasoning: boolean
	input_modalities: ("text" | "image")[]
	is_serverless: boolean
	limits: {
		context_window: number
		max_output_tokens: number
	}
}

interface ModelsMetadataResponse {
	models: ModelMetadata[]
}

function sortModels(models: ModelMetadata[]): ModelMetadata[] {
	const serverless = models.filter((m) => m.is_serverless)
	const rest = models.filter((m) => !m.is_serverless)
	return [...serverless, ...rest]
}

async function fetchAvailableModels(apiKey: string): Promise<ModelMetadata[]> {
	const response = await fetch(MODELS_METADATA_API, {
		headers: { Authorization: `Bearer ${apiKey}` },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	})
	if (!response.ok) {
		throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
	}
	const body = (await response.json()) as ModelsMetadataResponse
	if (!Array.isArray(body?.models)) {
		throw new Error("Unexpected response shape from models API")
	}
	return body.models
}

interface PiModelConfig {
	id: string
	name: string
	reasoning: boolean
	input: ("text" | "image")[]
	contextWindow: number
	maxTokens: number
	cost: { input: number; output: number; cacheRead: number; cacheWrite: number }
	compat?: { supportsReasoningEffort?: boolean }
}

function metadataToModel(m: ModelMetadata): PiModelConfig {
	// TODO: our LiteLLM gateway does not support `thinking.type.enabled` for Antrhopic >Opus 4.6 models
	// Therefore, we disable it for now. Revisit, once we upgrade our LiteLLM version.
	const compat = m.provider === "anthropic" ? { supportsReasoningEffort: false } : undefined
	return {
		id: m.slug,
		name: m.display_name.trim().length > 0 ? m.display_name : m.slug,
		reasoning: m.reasoning,
		input: m.input_modalities,
		contextWindow: m.limits.context_window,
		maxTokens: m.limits.max_output_tokens,
		// TODO: add costs support
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		...(compat && { compat }),
	}
}

function buildModelsConfig(models: ModelMetadata[]) {
	return {
		providers: {
			"kimchi-dev": {
				baseUrl: CHAT_COMPLETIONS_API,
				apiKey: "KIMCHI_API_KEY",
				api: "openai-completions",
				authHeader: true,
				headers: { "User-Agent": `kimchi/${getVersion()}` },
			    models: models.map(metadataToModel),
			},
		},
	}
}

export interface ModelsConfigResult {
	models: ModelMetadata[]
}

/**
 * Fetch available models from the kimchi metadata API and write the
 * configuration to modelsJsonPath. Always overwrites any existing file so
 * the model list stays current on every startup. Throws on fetch failure
 * or empty response.
 */
export async function updateModelsConfig(modelsJsonPath: string, apiKey: string): Promise<ModelsConfigResult> {
	const dir = dirname(modelsJsonPath)
	mkdirSync(dir, { recursive: true })

	const fetched = await fetchAvailableModels(apiKey)
	if (fetched.length === 0) {
		throw new Error("API returned empty model list")
	}
	const models = sortModels(fetched)
	writeFileSync(modelsJsonPath, JSON.stringify(buildModelsConfig(models), null, "\t"), "utf-8")
	return { models }
}
