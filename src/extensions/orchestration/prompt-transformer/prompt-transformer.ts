import { type Skill, formatSkillsForPrompt } from "@mariozechner/pi-coding-agent"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"
import type { ContextFile } from "./context-files.js"
import systemPromptTemplate from "./prompts/orchestrator-system-prompt.md.template" with { type: "text" }
import subagentSystemPromptTemplate from "./prompts/subagent-system-prompt.md.template" with { type: "text" }
import userPromptTemplate from "./prompts/transformed-user-prompt.md.template" with { type: "text" }

const SUBAGENT_TOOL_NAME = "subagent"
const SET_PHASE_TOOL_NAME = "set_phase"

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
	const subagentModels = registry.getModelsWithCapabilities().filter((m) => m.id !== currentModel?.id)
	const modelsSection = formatModelsSection(subagentModels)

	const currentModelName = currentModel?.name ?? "unknown"

	// Only show capabilities when the current model has a real capability entry.
	// Unknown models get only the fallback text because generic defaults would be misleading.
	const currentDescriptor = currentModel
		? registry.getModelsWithCapabilities().find((m) => m.id === currentModel.id)
		: undefined
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
	// Filter out subagent and set_phase tools - subagents should not spawn further subagents or manage phases
	const filtered = tools.filter((t) => t.name !== SUBAGENT_TOOL_NAME && t.name !== SET_PHASE_TOOL_NAME)
	const toolsSection = formatToolsSection(filtered)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)

	// Inject phase section based on KIMCHI_PHASE env var (set by parent agent when spawning subagent)
	const phaseTag = process.env.KIMCHI_PHASE
	const phaseSection = phaseTag
		? `You are working in phase: **${phaseTag}**. This phase was set by the orchestrating agent and will be tracked for analytics. Proceed with your assigned task.`
		: "No specific phase has been assigned for this task."

	return subagentSystemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
		.replace("{{PHASE_SECTION}}", () => phaseSection)
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
	// Cast required until upstream accepts readonly Skill[]
	return formatSkillsForPrompt(skills as Skill[])
}

export function isSubagent(): boolean {
	return process.env.KIMCHI_SUBAGENT === "1"
}
