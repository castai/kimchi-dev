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
	const hardLine =
		budget?.hardLimit !== undefined ? `\n- Hard kill ceiling: ${budget.hardLimit.toLocaleString()} tokens` : ""
	if (budget) {
		return `## Token Budget\n\nYou are running as a **delegated process** with a **strict token budget**.\n\n- Soft advisory limit: ${budget.softLimit.toLocaleString()} tokens${hardLine}\n\nAfter **every tool/assistant round** you will receive a real-time token-usage report showing cumulative input + output tokens so far.\n\n### Critical budget discipline\n\n1. **Track the report after every turn.** It tells you exactly how many tokens you've burned.\n2. **Pace yourself.** If you've consumed 50% of the budget and haven't finished half the work, you are going too deep — start summarising and skip remaining details.\n3. **Stop digging at 80%.** Once you cross 80% (or see the 80% warning), wrap up immediately. Finish any in-flight tool call, then close with a concise JSON response — do NOT explore new files, do NOT refactor, do NOT elaborate.\n4. **Hard ceiling is non-negotiable.** If you hit the hard limit, the harness kills you. Better to return a correct but brief result than be terminated with nothing.\n5. **Return early if overworking.** If you notice yourself repeatedly re-reading the same files or making marginal additions, STOP. Return your findings to the parent. It can spin up a fresh, specialised agent with a clean context window.\n\nToken efficiency is correctness. The best agent is the one that finishes within budget with a clean, actionable result.\n`
	}
	// No budget configured — stronger usage tracking discipline
	return `## Token Usage Tracking\n\nAfter **every tool/assistant round** you will receive a real-time token-usage report showing cumulative input + output tokens so far.\n\n### Critical token discipline\n\n1. **Read the report after every turn.** It tells you exactly how many tokens you've consumed. Use it as a speedometer, not background noise.\n2. **Pace your work.** If you find yourself re-reading files you've already covered, making marginal additions, or chasing tangents, you are overworking the task. STOP and wrap up.\n3. **Return early when diminishing returns set in.** You do NOT need to read every file. Produce a solid, correct result with the information you already have. The parent can always delegate deeper work to a fresh, specialised agent with a clean context window.\n4. **Wrap up immediately if token counts climb rapidly.** If your last few turns each consumed >50K input tokens, you are deep in the context window — finish the current tool call and close with a concise JSON response. No new exploration.\n\nToken efficiency is correctness. The best agent is the one that finishes fast with a clean, actionable result.\n`
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
