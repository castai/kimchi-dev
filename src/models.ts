import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

/**
 * The default models.json configuration for the Cast AI provider.
 * Models are registered with the "kimchi-dev" provider name. The apiKey field
 * references the KIMCHI_API_KEY environment variable, which is set by the
 * CLI entry point from the resolved kimchi config before pi-mono imports.
 */
const DEFAULT_MODELS_CONFIG = {
	providers: {
		"kimchi-dev": {
			baseUrl: "https://llm.cast.ai/openai/v1",
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

/**
 * Ensure models.json exists in the agent config directory.
 * If the file doesn't exist, writes the default Cast AI provider configuration.
 * If the file already exists, leaves it untouched (user may have customized it).
 */
export function ensureModelsConfig(modelsJsonPath: string): void {
	if (existsSync(modelsJsonPath)) {
		return
	}

	const dir = dirname(modelsJsonPath)
	mkdirSync(dir, { recursive: true })
	writeFileSync(modelsJsonPath, JSON.stringify(DEFAULT_MODELS_CONFIG, null, "\t"), "utf-8")
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
