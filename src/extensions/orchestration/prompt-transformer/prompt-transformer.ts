import { type Skill, formatSkillsForPrompt } from "@mariozechner/pi-coding-agent"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"
import type { ContextFile } from "./context-files.js"
import systemPromptTemplate from "./prompts/orchestrator-system-prompt.md.template" with { type: "text" }
import subagentSystemPromptTemplate from "./prompts/subagent-system-prompt.md.template" with { type: "text" }
import userPromptTemplate from "./prompts/transformed-user-prompt.md.template" with { type: "text" }

const SUBAGENT_TOOL_NAME = "subagent"

function formatModel(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const vision = model.capabilities.vision ? "yes" : "no"
	return [
		`- **${model.name}** (id: \`${model.id}\`, provider: \`${model.provider}\`)`,
		`  Tier: ${model.capabilities.tier} | Strengths: ${strengths} | Vision: ${vision}`,
		`  ${model.capabilities.description}`,
	].join("\n")
}

function formatCurrentModelCapabilities(model: OrchestrationModelDescriptor): string {
	const strengths = model.capabilities.strengths.join(", ")
	const vision = model.capabilities.vision ? "yes" : "no"
	return [
		`Tier: ${model.capabilities.tier} | Strengths: ${strengths} | Vision: ${vision}`,
		model.capabilities.description,
	].join("\n")
}

function formatModelsSection(models: readonly OrchestrationModelDescriptor[]): string {
	if (models.length === 0) {
		return "(No models available)"
	}
	return models.map(formatModel).join("\n\n")
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
	const allModels = registry.getAll()

	// Exclude the current orchestrator model from the subagent model list —
	// the orchestrator doesn't need to see itself as a delegation target.
	const subagentModels = currentModel ? allModels.filter((m) => m.id !== currentModel.id) : allModels
	const modelsSection = formatModelsSection(subagentModels)

	const currentModelName = currentModel?.name ?? "unknown"

	// Look up the current model's capabilities from our registry
	const currentDescriptor = currentModel ? allModels.find((m) => m.id === currentModel.id) : undefined
	const currentModelCapabilities = currentDescriptor
		? formatCurrentModelCapabilities(currentDescriptor)
		: "No capability information available for this model."

	return userPromptTemplate
		.replace("{{CURRENT_MODEL_NAME}}", () => currentModelName)
		.replace("{{CURRENT_MODEL_CAPABILITIES}}", () => currentModelCapabilities)
		.replace("{{MODELS}}", () => modelsSection)
		.replace("{{USER_PROMPT}}", () => userPrompt)
}

export function buildOrchestratorSystemPrompt(
	tools: readonly ToolInfo[],
	contextFiles?: readonly ContextFile[],
	skills?: readonly Skill[],
): string {
	const toolsSection = formatToolsSection(tools)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)
	return systemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
}

export function buildSubagentSystemPrompt(
	tools: readonly ToolInfo[],
	contextFiles?: readonly ContextFile[],
	skills?: readonly Skill[],
): string {
	const filtered = tools.filter((t) => t.name !== SUBAGENT_TOOL_NAME)
	const toolsSection = formatToolsSection(filtered)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)
	return subagentSystemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
}

function formatToolsSection(tools: readonly ToolInfo[]): string {
	if (tools.length === 0) return "(No tools available)"
	return tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
}

function formatProjectContext(contextFiles?: readonly ContextFile[]): string {
	if (!contextFiles || contextFiles.length === 0) return ""
	const combined = contextFiles.map((f) => f.content).join("\n\n")
	return `# Project Guidelines\n\n${combined}`
}

function formatSkills(skills?: readonly Skill[]): string {
	if (!skills || skills.length === 0) return ""
	return formatSkillsForPrompt(skills as Skill[])
}

export function isSubagent(): boolean {
	return process.env.KIMCHI_SUBAGENT === "1"
}
