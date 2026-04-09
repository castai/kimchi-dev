/**
 * Prompt Transformer
 *
 * Enriches the user prompt with orchestration instructions before it
 * reaches the Orchestrator LLM. Reads the prompt template from
 * orchestration-prompt.md and fills in model registry data + user prompt.
 */

import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { ModelRegistry } from "./model-registry.js"
import type { OrchestrationModelDescriptor } from "./types.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_TEMPLATE_PATH = join(__dirname, "orchestration-prompt.md")

function formatModel(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const multimodal = model.capabilities.multimodal ? "yes" : "no"
	return [
		`- **${model.name}** (id: \`${model.id}\`, provider: \`${model.provider}\`)`,
		`  Strengths: ${strengths} | Multimodal: ${multimodal}`,
		`  ${model.capabilities.description}`,
	].join("\n")
}

function formatModelsSection(models: OrchestrationModelDescriptor[]): string {
	if (models.length === 0) {
		return "(No models available)"
	}
	return models.map(formatModel).join("\n\n")
}

/**
 * Load the prompt template from disk. Cached after first read.
 */
let cachedTemplate: string | undefined
function loadTemplate(): string {
	if (!cachedTemplate) {
		cachedTemplate = readFileSync(PROMPT_TEMPLATE_PATH, "utf-8")
	}
	return cachedTemplate
}

/**
 * Transform a user prompt into an orchestration prompt.
 *
 * Reads the prompt template, injects the available models from the registry,
 * and wraps the original user prompt. The result is what the Orchestrator LLM
 * receives — it contains routing instructions + the original task.
 */
export function transformPrompt(userPrompt: string, registry: ModelRegistry): string {
	const template = loadTemplate()
	const models = registry.getAll()
	const modelsSection = formatModelsSection(models)

	return template.replace("{{MODELS}}", modelsSection).replace("{{USER_PROMPT}}", userPrompt)
}
