import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

const CAST_AI_METADATA_API = "https://llm.cast.ai/v1/models/metadata?include_in_cli=true"
const CAST_AI_LLM_BASE_URL = "https://llm.kimchi.dev/openai/v1"
const FETCH_TIMEOUT_MS = 5000

interface ModelMetadata {
	slug: string
	display_name: string
	provider: string
	reasoning: boolean
	supports_images: boolean
	input_modalities: string[]
	limits: {
		context_window: number
		max_output_tokens: number
	}
	deprecated_at?: string
}

interface MetadataResponse {
	models: ModelMetadata[]
}

function modelIdToName(id: string): string {
	return id
		.split(/[-_]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ")
}

async function fetchModelMetadata(apiKey: string): Promise<ModelMetadata[]> {
	const response = await fetch(CAST_AI_METADATA_API, {
		headers: { Authorization: `Bearer ${apiKey}` },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
	})
	if (!response.ok) {
		throw new Error(`Failed to fetch model metadata: ${response.status} ${response.statusText}`)
	}
	const body = await response.json()
	if (!body || typeof body !== "object" || !Array.isArray((body as MetadataResponse).models)) {
		throw new Error("Unexpected response shape from metadata API")
	}
	return (body as MetadataResponse).models
}

function buildModelsConfig(metadata: ModelMetadata[]) {
	const providerMap = new Map<string, ModelMetadata[]>()
	for (const m of metadata) {
		const list = providerMap.get(m.provider) ?? []
		list.push(m)
		providerMap.set(m.provider, list)
	}

	const providerConfig = (models: ModelMetadata[]) => ({
		baseUrl: CAST_AI_LLM_BASE_URL,
		apiKey: "KIMCHI_API_KEY",
		api: "openai-completions",
		authHeader: true,
		headers: { "User-Agent": "kimchi/0.0.1" },
		models: models.map((m) => ({
			id: m.slug,
			name: m.display_name || modelIdToName(m.slug),
			reasoning: m.reasoning,
			input: m.input_modalities.length > 0 ? m.input_modalities : ["text"],
			contextWindow: m.limits.context_window,
			maxTokens: m.limits.max_output_tokens,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		})),
	})

	const providers: Record<string, ReturnType<typeof providerConfig>> = {}
	for (const [provider, models] of providerMap.entries()) {
		const key = provider === "ai-enabler" ? "kimchi-dev" : provider
		providers[key] = providerConfig(models)
	}
	return { providers }
}

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
					id: "minimax-m2.7",
					name: "Minimax M2.7",
					reasoning: true,
					input: ["text"],
					contextWindow: 196608,
					maxTokens: 32768,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
			],
		},
	},
}

export type ModelsConfigResult =
	| { source: "discovered"; models: string[] }
	| { source: "default"; models: string[]; error?: string }

interface ExistingState {
	otherProviders: Record<string, unknown>
	userKimchiModels: Array<{ id: string; [key: string]: unknown }>
}

function readExistingState(modelsJsonPath: string): ExistingState {
	if (!existsSync(modelsJsonPath)) return { otherProviders: {}, userKimchiModels: [] }
	try {
		const raw = readFileSync(modelsJsonPath, "utf-8")
		const config = JSON.parse(raw)
		const providers = config?.providers ?? {}
		// Strip all auto-managed providers; preserve everything else
		const { "kimchi-dev": kimchi, anthropic: _a, ...otherProviders } = providers as Record<string, unknown>
		const rawModels = (kimchi as { models?: unknown })?.models
		const userKimchiModels: Array<{ id: string; [key: string]: unknown }> = Array.isArray(rawModels) ? rawModels : []
		return { otherProviders, userKimchiModels }
	} catch {
		return { otherProviders: {}, userKimchiModels: [] }
	}
}

export async function updateModelsConfig(modelsJsonPath: string, apiKey: string): Promise<ModelsConfigResult> {
	const dir = dirname(modelsJsonPath)
	mkdirSync(dir, { recursive: true })

	const { otherProviders, userKimchiModels } = readExistingState(modelsJsonPath)

	function mergeAndWrite(config: ReturnType<typeof buildModelsConfig> | typeof DEFAULT_MODELS_CONFIG): void {
		const kimchiModels = config.providers["kimchi-dev"].models
		const kimchiIds = new Set(kimchiModels.map((m) => m.id))
		const extraModels = userKimchiModels.filter((m) => !kimchiIds.has(m.id))
		const merged = {
			providers: {
				...otherProviders,
				...config.providers,
				"kimchi-dev": {
					...config.providers["kimchi-dev"],
					models: [...kimchiModels, ...extraModels],
				},
			},
		}
		writeFileSync(modelsJsonPath, JSON.stringify(merged, null, "\t"), "utf-8")
	}

	try {
		const metadata = await fetchModelMetadata(apiKey)
		if (metadata.length > 0) {
			const config = buildModelsConfig(metadata)
			mergeAndWrite(config)
			return { source: "discovered", models: metadata.map((m) => m.slug) }
		}
		mergeAndWrite(DEFAULT_MODELS_CONFIG)
		return {
			source: "default",
			models: DEFAULT_MODELS_CONFIG.providers["kimchi-dev"].models.map((m) => m.id),
			error: "API returned no models",
		}
	} catch (err) {
		mergeAndWrite(DEFAULT_MODELS_CONFIG)
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
