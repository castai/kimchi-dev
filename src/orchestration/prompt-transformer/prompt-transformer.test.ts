import { describe, expect, it } from "vitest"
import { transformPrompt } from "./prompt-transformer.js"
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

	it("includes routing instructions", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("subprocess")
		expect(result).toContain("select the single best model")
	})

	it("includes multimodal guidance", () => {
		const result = transformPrompt("some task", registry)
		expect(result).toContain("multimodal")
	})
})
