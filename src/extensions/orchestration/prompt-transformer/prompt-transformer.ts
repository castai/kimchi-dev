import { type Skill, formatSkillsForPrompt } from "@mariozechner/pi-coding-agent"
import type { ModelRegistry } from "../model-registry/index.js"
import type { OrchestrationModelDescriptor } from "../model-registry/types.js"
import type { ContextFile } from "./context-files.js"
import systemPromptTemplate from "./prompts/orchestrator-system-prompt.js"
import singleModelSystemPromptTemplate from "./prompts/single-model-system-prompt.js"
import subagentSystemPromptTemplate from "./prompts/subagent-system-prompt.js"
import { userPromptHeader, userPromptTaskSection } from "./prompts/transformed-user-prompt.js"

export interface EnvironmentInfo {
	os: string
	username: string
	homeDir: string
	cwd: string
	documentsDir: string
	currentTime: string
	localDate: string
	isGitRepo: boolean
	gitBranch?: string
	gitRemote?: string
}

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

export function transformPrompt(
	userPrompt: string,
	registry: ModelRegistry,
	currentModel?: CurrentModelInfo,
	includeTask = true,
): string {
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

	const template = includeTask ? userPromptHeader + userPromptTaskSection : userPromptHeader

	return template
		.replace("{{CURRENT_MODEL_NAME}}", () => currentModelName)
		.replace("{{CURRENT_MODEL_CAPABILITIES}}", () => currentModelCapabilities)
		.replace("{{MODELS}}", () => modelsSection)
		.replace("{{USER_PROMPT}}", () => userPrompt)
}

export function buildOrchestratorSystemPrompt(
	tools: readonly ToolInfo[],
	env: EnvironmentInfo,
	contextFiles?: readonly ContextFile[],
	skills?: readonly Skill[],
): string {
	const toolsSection = formatToolsSection(tools)
	const environmentSection = formatEnvironmentSection(env)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)
	return systemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{ENVIRONMENT}}", () => environmentSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
}

export function buildSingleModelSystemPrompt(
	tools: readonly ToolInfo[],
	env: EnvironmentInfo,
	contextFiles?: readonly ContextFile[],
	skills?: readonly Skill[],
): string {
	const toolsSection = formatToolsSection(tools)
	const environmentSection = formatEnvironmentSection(env)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)
	return singleModelSystemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{ENVIRONMENT}}", () => environmentSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
}

export interface SubagentBudgetInfo {
	softLimit: number
	hardLimit?: number
}

export function buildSubagentSystemPrompt(
	tools: readonly ToolInfo[],
	env: EnvironmentInfo,
	contextFiles?: readonly ContextFile[],
	skills?: readonly Skill[],
	budget?: SubagentBudgetInfo,
): string {
	const filtered = tools.filter((t) => t.name !== SUBAGENT_TOOL_NAME)
	const toolsSection = formatToolsSection(filtered)
	const environmentSection = formatEnvironmentSection(env)
	const projectContext = formatProjectContext(contextFiles)
	const skillsSection = formatSkills(skills)
	const budgetSection = formatBudgetSection(budget)
	return subagentSystemPromptTemplate
		.replace("{{TOOLS}}", () => toolsSection)
		.replace("{{ENVIRONMENT}}", () => environmentSection)
		.replace("{{PROJECT_CONTEXT}}", () => projectContext)
		.replace("{{SKILLS}}", () => skillsSection)
		.replace("{{BUDGET}}", () => budgetSection)
}

function formatToolsSection(tools: readonly ToolInfo[]): string {
	if (tools.length === 0) return "(No tools available)"
	return tools.map((t) => `- ${t.name}: ${t.description}`).join("\n")
}

function formatEnvironmentSection(env: EnvironmentInfo): string {
	const lines = [
		"# Environment",
		"",
		`- OS: ${env.os}`,
		`- Username: ${env.username}`,
		`- Home directory: "${env.homeDir}"`,
		`- Working directory: "${env.cwd}"`,
		`- Documents directory: "${env.documentsDir}"`,
		`- Current time: ${env.currentTime} (local date: ${env.localDate})`,
		`- Git repository: ${env.isGitRepo ? "yes" : "no"}`,
	]
	if (env.gitBranch !== undefined) lines.push(`- Git branch: ${env.gitBranch}`)
	if (env.gitRemote !== undefined) lines.push(`- Git remote: ${env.gitRemote}`)
	return lines.join("\n")
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

function formatBudgetSection(budget?: SubagentBudgetInfo): string {
	if (!budget) return ""
	const hardLine =
		budget.hardLimit !== undefined ? `\n- Hard kill ceiling: ${budget.hardLimit.toLocaleString()} tokens` : ""
	return `## Token Budget\n\nYou are running as a subagent with a token budget.\n\n- Soft advisory limit: ${budget.softLimit.toLocaleString()} tokens${hardLine}\n\nYou will receive a budget warning at ~80% and a wrap-up notice at 100% injected into your conversation. Plan your work to finish gracefully before the hard ceiling is reached.\n`
}

export function parseSubagentBudgetFromEnv(
	softBudget: string | undefined,
	hardBudget: string | undefined,
): SubagentBudgetInfo | undefined {
	if (!softBudget || softBudget.length === 0) return undefined
	const soft = Number(softBudget)
	if (!Number.isFinite(soft) || soft <= 0) return undefined
	const rawHard = hardBudget && hardBudget.length > 0 ? Number(hardBudget) : undefined
	const hard = rawHard !== undefined && Number.isFinite(rawHard) && rawHard > 0 ? rawHard : undefined
	return { softLimit: soft, hardLimit: hard }
}

export function isSubagent(): boolean {
	return process.env.KIMCHI_SUBAGENT === "1"
}
