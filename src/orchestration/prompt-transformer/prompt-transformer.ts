import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_TEMPLATE_PATH = join(__dirname, "prompts", "transformed-user-prompt.md")
const SYSTEM_PROMPT_PATH = join(__dirname, "prompts", "orchestrator-system-prompt.md")

function formatModel(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const multimodal = model.capabilities.multimodal ? "yes" : "no"
	return [
		`- **${model.name}** (id: \`${model.id}\`, provider: \`${model.provider}\`)`,
		`  Tier: ${model.capabilities.tier} | Strengths: ${strengths} | Multimodal: ${multimodal}`,
		`  ${model.capabilities.description}`,
	].join("\n")
}

function formatModelsSection(models: readonly OrchestrationModelDescriptor[]): string {
	if (models.length === 0) {
		return "(No models available)"
	}
	return models.map(formatModel).join("\n\n")
}

// Cached after first read - templates don't change at runtime.
let cachedTemplate: string | undefined
function loadTemplate(): string {
	if (!cachedTemplate) {
		cachedTemplate = readFileSync(PROMPT_TEMPLATE_PATH, "utf-8")
	}
	return cachedTemplate
}

let cachedSystemPrompt: string | undefined
function loadSystemPromptTemplate(): string {
	if (!cachedSystemPrompt) {
		cachedSystemPrompt = readFileSync(SYSTEM_PROMPT_PATH, "utf-8")
	}
	return cachedSystemPrompt
}

export interface ToolInfo {
	name: string
	description: string
}

export function transformPrompt(userPrompt: string, registry: ModelRegistry): string {
	const template = loadTemplate()
	const models = registry.getAll()
	const modelsSection = formatModelsSection(models)

	return template
		.replace("{{MODELS}}", () => modelsSection)
		.replace("{{USER_PROMPT}}", () => userPrompt)
}

export function buildOrchestratorSystemPrompt(tools: readonly ToolInfo[]): string {
	const template = loadSystemPromptTemplate()
	const toolsSection =
		tools.length > 0
			? tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
			: "(No tools available)"

	return template.replace("{{TOOLS}}", () => toolsSection)
}
