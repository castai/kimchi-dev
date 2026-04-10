import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

const CAST_AI_MODELS_API = "https://api.cast.ai/v1/llm/openai/models?providerName=AI%20Enabler"
const CAST_AI_LLM_BASE_URL = "https://llm.kimchi.dev/openai/v1"
const FETCH_TIMEOUT_MS = 5000

const EXCLUDED_MODEL_PATTERNS = [/^smoll/i, /^qwen/i]

function filterAndSortModels(models: string[]): string[] {
	return models.filter((id) => !EXCLUDED_MODEL_PATTERNS.some((re) => re.test(id))).sort((a, b) => a.localeCompare(b))
}

interface CastAIModelsResponse {
	models: string[]
}

function modelIdToName(id: string): string {
	return id
		.split(/[-_]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ")
}

async function fetchAvailableModels(apiKey: string): Promise<string[]> {
	const response = await fetch(CAST_AI_MODELS_API, {
		headers: { Authorization: `Bearer ${apiKey}` },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	})
	if (!response.ok) {
		throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`)
	}
	const body = await response.json()
	if (!body || typeof body !== "object" || !Array.isArray(body.models)) {
		throw new Error("Unexpected response shape from models API")
	}
	return (body as CastAIModelsResponse).models
}

function buildModelsConfig(models: string[]) {
	return {
		providers: {
			"kimchi-dev": {
				baseUrl: CAST_AI_LLM_BASE_URL,
				apiKey: "KIMCHI_API_KEY",
				api: "openai-completions",
				authHeader: true,
				models: models.map((id) => ({
					id,
					name: modelIdToName(id),
					reasoning: false,
					input: ["text"],
					contextWindow: 131072,
					maxTokens: 16384,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				})),
			},
		},
	}
}

/**
 * The default models.json configuration for the Cast AI provider.
 * Models are registered with the "kimchi-dev" provider name. The apiKey field
 * references the KIMCHI_API_KEY environment variable, which is set by the
 * CLI entry point from the resolved kimchi config before pi-mono imports.
 */
const DEFAULT_MODELS_CONFIG = {
	providers: {
		"kimchi-dev": {
			baseUrl: CAST_AI_LLM_BASE_URL,
			apiKey: "KIMCHI_API_KEY",
			api: "openai-completions",
			authHeader: true,
			models: [
				{
					id: "kimi-k2.5",
					name: "Kimi K2.5",
					reasoning: false,
					input: ["text"],
					contextWindow: 131072,
					maxTokens: 16384,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
				{
					id: "glm-5-fp8",
					name: "GLM 5 FP8",
					reasoning: false,
					input: ["text"],
					contextWindow: 131072,
					maxTokens: 16384,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
				{
					id: "minimax-m2.5",
					name: "Minimax M2.5",
					reasoning: false,
					input: ["text"],
					contextWindow: 131072,
					maxTokens: 16384,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
			],
		},
	},
}

export type ModelsConfigResult =
	| { source: "discovered"; models: string[] }
	| { source: "default"; models: string[]; error?: string }

/**
 * Fetch available models from the Cast AI API and write the configuration to
 * modelsJsonPath. Falls back to the static default configuration if the fetch
 * fails. Always overwrites any existing file so the model list stays current
 * on every startup.
 */
export async function updateModelsConfig(modelsJsonPath: string, apiKey: string): Promise<ModelsConfigResult> {
	const dir = dirname(modelsJsonPath)
	mkdirSync(dir, { recursive: true })

	try {
		const fetched = await fetchAvailableModels(apiKey)
		const models = filterAndSortModels(fetched)
		if (models.length > 0) {
			writeFileSync(modelsJsonPath, JSON.stringify(buildModelsConfig(models), null, "\t"), "utf-8")
			return { source: "discovered", models }
		}
		writeFileSync(modelsJsonPath, JSON.stringify(DEFAULT_MODELS_CONFIG, null, "\t"), "utf-8")
		return {
			source: "default",
			models: DEFAULT_MODELS_CONFIG.providers["kimchi-dev"].models.map((m) => m.id),
			error: fetched.length === 0 ? "API returned empty model list" : "API returned no usable models after filtering",
		}
	} catch (err) {
		writeFileSync(modelsJsonPath, JSON.stringify(DEFAULT_MODELS_CONFIG, null, "\t"), "utf-8")
		return {
			source: "default",
			models: DEFAULT_MODELS_CONFIG.providers["kimchi-dev"].models.map((m) => m.id),
			error: err instanceof Error ? err.message : String(err),
		}
	}
}

/**
 * Check whether the models.json at the given path already contains a "kimchi-dev" provider.
 */
export function hasKimchiProvider(modelsJsonPath: string): boolean {
	if (!existsSync(modelsJsonPath)) {
		return false
	}
	try {
		const raw = readFileSync(modelsJsonPath, "utf-8")
		const config = JSON.parse(raw)
		return config?.providers?.["kimchi-dev"] !== undefined
	} catch {
		return false
	}
}
