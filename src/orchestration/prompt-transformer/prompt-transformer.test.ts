import { describe, expect, it } from "vitest"
import { transformPrompt, buildOrchestratorSystemPrompt, buildSubagentSystemPrompt } from "./prompt-transformer.js"
import { ModelRegistry } from "../model-registry/index.js"

describe("transformPrompt", () => {
	const registry = new ModelRegistry()

	it("includes the original user prompt", () => {
		const result = transformPrompt("Fix the login bug", registry)
		expect(result).toContain("Fix the login bug")
	})

	it("includes all model names from the registry", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			expect(result).toContain(model.name)
		}
	})

	it("includes model ids and providers", () => {
		const result = transformPrompt("some task", registry)
		for (const model of registry.getAll()) {
			expect(result).toContain(model.id)
			expect(result).toContain(model.provider)
		}
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

	it("includes multimodal info", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("Multimodal")
	})

	it("includes tier info for every model", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("Tier: heavy")
		expect(result).toContain("Tier: standard")
		expect(result).toContain("Tier: light")
	})

	it("wraps content in structured sections", () => {
		const result = transformPrompt("do something", registry)
		expect(result).toContain("## Available Models")
		expect(result).toContain("## Task")
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
})
