import { describe, expect, it } from "vitest"
import { BUILTIN_MODELS } from "./builtin-models.js"
import { ModelRegistry } from "./model-registry.js"

describe("ModelRegistry", () => {
	it("returns all built-in models", () => {
		const registry = new ModelRegistry()
		expect(registry.getAll()).toHaveLength(BUILTIN_MODELS.length)
	})

	it("contains expected model data", () => {
		const registry = new ModelRegistry()
		const kimi = registry.getAll().find((m) => m.id === "kimi-k2.5")
		expect(kimi).toBeDefined()
		expect(kimi?.name).toBe("Kimi K2.5")
		expect(kimi?.provider).toBe("kimchi-dev")
		expect(kimi?.capabilities.strengths).toContain("build")
		expect(kimi?.capabilities.description).toBeTruthy()
	})

	it("every model has a valid tier", () => {
		const registry = new ModelRegistry()
		const validTiers = ["light", "standard", "heavy"]
		for (const model of registry.getAll()) {
			expect(validTiers).toContain(model.capabilities.tier)
		}
	})

	it("every model has a non-placeholder description", () => {
		const registry = new ModelRegistry()
		for (const model of registry.getAll()) {
			expect(model.capabilities.description).not.toBe("TODO")
			expect(model.capabilities.description.length).toBeGreaterThan(50)
		}
	})
})
