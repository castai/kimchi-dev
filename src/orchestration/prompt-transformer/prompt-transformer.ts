import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_TEMPLATE_PATH = join(__dirname, "transformed-user-prompt.md")

function formatModel(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const multimodal = model.capabilities.multimodal ? "yes" : "no"
	return [
		`- **${model.name}** (id: \`${model.id}\`, provider: \`${model.provider}\`)`,
		`  Strengths: ${strengths} | Multimodal: ${multimodal}`,
		`  ${model.capabilities.description}`,
	].join("\n")
}

function formatModelsSection(models: readonly OrchestrationModelDescriptor[]): string {
	if (models.length === 0) {
		return "(No models available)"
	}
	return models.map(formatModel).join("\n\n")
}

// Cached after first read - the template doesn't change at runtime.
let cachedTemplate: string | undefined
function loadTemplate(): string {
	if (!cachedTemplate) {
		cachedTemplate = readFileSync(PROMPT_TEMPLATE_PATH, "utf-8")
	}
	return cachedTemplate
}

export function transformPrompt(userPrompt: string, registry: ModelRegistry): string {
	const template = loadTemplate()
	const models = registry.getAll()
	const modelsSection = formatModelsSection(models)

	return template
		.replace("{{MODELS}}", () => modelsSection)
		.replace("{{USER_PROMPT}}", () => userPrompt)
}
