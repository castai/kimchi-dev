import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_TEMPLATE_PATH = join(__dirname, "prompts", "transformed-user-prompt.md")
const SYSTEM_PROMPT_PATH = join(__dirname, "prompts", "orchestrator-system-prompt.md")
const SUBAGENT_SYSTEM_PROMPT_PATH = join(__dirname, "prompts", "subagent-system-prompt.md")

const SUBAGENT_TOOL_NAME = "subagent"

function formatModel(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const multimodal = model.capabilities.multimodal ? "yes" : "no"
	return [
		`- **${model.name}** (id: \`${model.id}\`, provider: \`${model.provider}\`)`,
		`  Tier: ${model.capabilities.tier} | Strengths: ${strengths} | Multimodal: ${multimodal}`,
		`  ${model.capabilities.description}`,
	].join("\n")
}

function formatCurrentModelCapabilities(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const multimodal = model.capabilities.multimodal ? "yes" : "no"
	return [
		`Tier: ${model.capabilities.tier} | Strengths: ${strengths} | Multimodal: ${multimodal}`,
		model.capabilities.description,
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

let cachedSubagentSystemPrompt: string | undefined
function loadSubagentSystemPromptTemplate(): string {
	if (!cachedSubagentSystemPrompt) {
		cachedSubagentSystemPrompt = readFileSync(SUBAGENT_SYSTEM_PROMPT_PATH, "utf-8")
	}
	return cachedSubagentSystemPrompt
}

export interface ToolInfo {
	name: string
	description: string
}

export interface CurrentModelInfo {
	id: string
	name: string
}

export function transformPrompt(userPrompt: string, registry: ModelRegistry, currentModel?: CurrentModelInfo): string {
	const template = loadTemplate()
	const allModels = registry.getAll()

	// Exclude the current orchestrator model from the subagent model list —
	// the orchestrator doesn't need to see itself as a delegation target.
	const subagentModels = currentModel
		? allModels.filter((m) => m.id !== currentModel.id)
		: allModels
	const modelsSection = formatModelsSection(subagentModels)

	const currentModelName = currentModel?.name ?? "unknown"

	// Look up the current model's capabilities from our registry
	const currentDescriptor = currentModel
		? allModels.find((m) => m.id === currentModel.id)
		: undefined
	const currentModelCapabilities = currentDescriptor
		? formatCurrentModelCapabilities(currentDescriptor)
		: "No capability information available for this model."

	return template
		.replace("{{CURRENT_MODEL_NAME}}", () => currentModelName)
		.replace("{{CURRENT_MODEL_CAPABILITIES}}", () => currentModelCapabilities)
		.replace("{{MODELS}}", () => modelsSection)
		.replace("{{USER_PROMPT}}", () => userPrompt)
}

export function buildOrchestratorSystemPrompt(tools: readonly ToolInfo[]): string {
	const template = loadSystemPromptTemplate()
	const toolsSection = formatToolsSection(tools)
	return template.replace("{{TOOLS}}", () => toolsSection)
}

export function buildSubagentSystemPrompt(tools: readonly ToolInfo[]): string {
	const template = loadSubagentSystemPromptTemplate()
	const filtered = tools.filter((t) => t.name !== SUBAGENT_TOOL_NAME)
	const toolsSection = formatToolsSection(filtered)
	return template.replace("{{TOOLS}}", () => toolsSection)
}

function formatToolsSection(tools: readonly ToolInfo[]): string {
	if (tools.length === 0) return "(No tools available)"
	return tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
}

export function isSubagent(): boolean {
	return process.env.KIMCHI_SUBAGENT === "1"
}
