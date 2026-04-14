import type { Skill } from "@mariozechner/pi-coding-agent"
import { describe, expect, it } from "vitest"
import { MODEL_CAPABILITIES, ModelRegistry } from "../model-registry/index.js"
import { buildOrchestratorSystemPrompt, buildSubagentSystemPrompt, transformPrompt } from "./prompt-transformer.js"

const ALL_KNOWN_IDS = [...MODEL_CAPABILITIES.keys()]

function createSkill(overrides: Partial<Skill> & { name: string; description: string }): Skill {
	return {
		filePath: `/skills/${overrides.name}/SKILL.md`,
		baseDir: `/skills/${overrides.name}`,
		sourceInfo: { path: `/skills/${overrides.name}/SKILL.md`, source: "local", scope: "project", origin: "top-level" },
		disableModelInvocation: false,
		...overrides,
	}
}

describe("transformPrompt", () => {
	const registry = new ModelRegistry(ALL_KNOWN_IDS)
	const currentModel = { id: "kimi-k2.5", name: "Kimi K2.5" }

	it("includes the original user prompt", () => {
		const result = transformPrompt("Fix the login bug", registry)
		expect(result).toContain("Fix the login bug")
	})

	it("includes model descriptions", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			expect(result).toContain(model.capabilities.description)
		}
	})

	it("includes model strengths", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			for (const strength of model.capabilities.strengths) {
				expect(result).toContain(strength)
			}
		}
	})

	it("includes vision info", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("Vision")
	})

	it("includes tier info for every model", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			expect(result).toContain(`Tier: ${model.capabilities.tier}`)
		}
	})

	it("wraps content in structured sections", () => {
		const result = transformPrompt("do something", registry)
		expect(result).toContain("## Model Attributes")
		expect(result).toContain("## Available Models for Subagents")
		expect(result).toContain("## Task")
		expect(result).toContain("## You")
	})

	it("shows current model name when provided", () => {
		const result = transformPrompt("some task", registry, currentModel)
		expect(result).toContain("## You — Kimi K2.5")
	})

	it("excludes the current model from the subagent models list", () => {
		const result = transformPrompt("some task", registry, currentModel)
		// All models except the current one should appear in the subagent section
		const otherModels = registry.getAll().filter((m) => m.id !== currentModel.id)
		for (const model of otherModels) {
			expect(result).toContain(model.name)
		}
		// Kimi's formatted model entry should not appear in the subagent section
		const subagentSection = result.split("## Available Models for Subagents")[1].split("## Task")[0]
		expect(subagentSection).not.toContain("Kimi K2.5")
	})

	it("includes all models when no current model is provided", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			expect(result).toContain(model.name)
		}
	})

	it("shows unknown when current model is not provided", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("## You — unknown")
		expect(result).toContain("No capability information available")
	})

	it("includes current model capabilities when model is in registry", () => {
		const result = transformPrompt("some task", registry, currentModel)
		const kimi = registry.getAll().find((m) => m.id === "kimi-k2.5")
		expect(kimi).toBeDefined()
		expect(result).toContain(kimi?.capabilities.description)
		expect(result).toContain("Tier: heavy")
	})
})

describe("buildOrchestratorSystemPrompt", () => {
	const tools = [
		{ name: "read", description: "Read file contents" },
		{ name: "bash", description: "Execute bash commands" },
		{ name: "subagent", description: "Spawn an isolated subagent process" },
	]

	it("includes all tool names and descriptions", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		for (const tool of tools) {
			expect(result).toContain(tool.name)
			expect(result).toContain(tool.description)
		}
	})

	it("formats tools as a list", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		expect(result).toContain("- read: Read file contents")
		expect(result).toContain("- subagent: Spawn an isolated subagent process")
	})

	it("contains orchestration instructions", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		expect(result).toContain("EASY")
		expect(result).toContain("HARD")
		expect(result).toContain("orchestrator")
	})

	it("replaces the {{TOOLS}} placeholder", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		expect(result).not.toContain("{{TOOLS}}")
	})

	it("handles empty tools list", () => {
		const result = buildOrchestratorSystemPrompt([])
		expect(result).toContain("(No tools available)")
		expect(result).not.toContain("{{TOOLS}}")
	})

	it("replaces the {{PROJECT_CONTEXT}} placeholder when no context files", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		expect(result).not.toContain("{{PROJECT_CONTEXT}}")
	})

	it("injects project context files into the prompt", () => {
		const contextFiles = [
			{ path: "/repo/AGENTS.md", content: "Always run tests before committing." },
			{ path: "/repo/sub/CLAUDE.md", content: "Use pnpm, not npm." },
		]
		const result = buildOrchestratorSystemPrompt(tools, contextFiles)
		expect(result).toContain("# Project Guidelines")
		expect(result).toContain("Always run tests before committing.")
		expect(result).toContain("Use pnpm, not npm.")
		expect(result).not.toContain("/repo/AGENTS.md")
		expect(result).not.toContain("/repo/sub/CLAUDE.md")
		expect(result).not.toContain("{{PROJECT_CONTEXT}}")
	})

	it("places project guidelines after the guidelines section", () => {
		const contextFiles = [{ path: "/repo/AGENTS.md", content: "custom rule" }]
		const result = buildOrchestratorSystemPrompt(tools, contextFiles)
		const guidelinesPos = result.indexOf("## Guidelines")
		const contextPos = result.indexOf("# Project Guidelines")
		expect(guidelinesPos).toBeLessThan(contextPos)
	})

	it("replaces the {{SKILLS}} placeholder when no skills", () => {
		const result = buildOrchestratorSystemPrompt(tools)
		expect(result).not.toContain("{{SKILLS}}")
	})

	it("injects skills into the prompt", () => {
		const skills = [
			createSkill({ name: "deploy", description: "Deploy the app to production" }),
			createSkill({ name: "review", description: "Review a pull request" }),
		]
		const result = buildOrchestratorSystemPrompt(tools, undefined, skills)
		expect(result).toContain("available_skills")
		expect(result).toContain("deploy")
		expect(result).toContain("Deploy the app to production")
		expect(result).toContain("review")
		expect(result).toContain("Review a pull request")
	})

	it("excludes skills with disableModelInvocation", () => {
		const skills = [
			createSkill({ name: "safe-skill", description: "Visible skill" }),
			createSkill({ name: "hidden-skill", description: "Hidden skill", disableModelInvocation: true }),
		]
		const result = buildOrchestratorSystemPrompt(tools, undefined, skills)
		expect(result).toContain("safe-skill")
		expect(result).not.toContain("hidden-skill")
	})
})

describe("buildSubagentSystemPrompt", () => {
	const tools = [
		{ name: "read", description: "Read file contents" },
		{ name: "bash", description: "Execute bash commands" },
		{ name: "edit", description: "Edit files" },
		{ name: "write", description: "Write files" },
		{ name: "subagent", description: "Spawn an isolated subagent process" },
	]

	it("excludes the subagent tool", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).not.toContain("subagent")
	})

	it("includes all other tools", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).toContain("- read: Read file contents")
		expect(result).toContain("- bash: Execute bash commands")
		expect(result).toContain("- edit: Edit files")
		expect(result).toContain("- write: Write files")
	})

	it("replaces the {{TOOLS}} placeholder", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).not.toContain("{{TOOLS}}")
	})

	it("contains coding assistant instructions", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).toContain("expert coding assistant")
	})

	it("does not contain orchestration instructions", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).not.toContain("orchestrator")
		expect(result).not.toContain("EASY")
		expect(result).not.toContain("HARD")
	})

	it("handles tools list with only the subagent tool", () => {
		const result = buildSubagentSystemPrompt([{ name: "subagent", description: "Spawn" }])
		expect(result).toContain("(No tools available)")
	})

	it("replaces the {{PROJECT_CONTEXT}} placeholder when no context files", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).not.toContain("{{PROJECT_CONTEXT}}")
	})

	it("injects project guidelines files into the prompt", () => {
		const contextFiles = [{ path: "/project/AGENTS.md", content: "Use TypeScript strict mode." }]
		const result = buildSubagentSystemPrompt(tools, contextFiles)
		expect(result).toContain("# Project Guidelines")
		expect(result).toContain("Use TypeScript strict mode.")
		expect(result).not.toContain("/project/AGENTS.md")
	})

	it("places project guidelines after the guidelines section", () => {
		const contextFiles = [{ path: "/repo/AGENTS.md", content: "rule" }]
		const result = buildSubagentSystemPrompt(tools, contextFiles)
		const guidelinesPos = result.indexOf("## Guidelines")
		const contextPos = result.indexOf("# Project Guidelines")
		expect(guidelinesPos).toBeLessThan(contextPos)
	})

	it("replaces the {{SKILLS}} placeholder when no skills", () => {
		const result = buildSubagentSystemPrompt(tools)
		expect(result).not.toContain("{{SKILLS}}")
	})

	it("injects skills into the prompt", () => {
		const skills = [createSkill({ name: "deploy", description: "Deploy the app" })]
		const result = buildSubagentSystemPrompt(tools, undefined, skills)
		expect(result).toContain("available_skills")
		expect(result).toContain("deploy")
		expect(result).toContain("Deploy the app")
	})
})
