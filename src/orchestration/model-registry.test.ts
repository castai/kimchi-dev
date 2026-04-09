import { describe, expect, it } from "vitest"
import { ModelRegistry } from "./model-registry.js"
import { BUILTIN_MODELS } from "./builtin-models.js"

describe("ModelRegistry", () => {
	it("returns all built-in models", () => {
		const registry = new ModelRegistry()
		expect(registry.getAll()).toHaveLength(BUILTIN_MODELS.length)
	})

	it("contains expected model data", () => {
		const registry = new ModelRegistry()
		const kimi = registry.getAll().find((m) => m.id === "kimi-k2.5")
		expect(kimi).toBeDefined()
		expect(kimi!.name).toBe("Kimi K2.5")
		expect(kimi!.provider).toBe("kimchi-dev")
		expect(kimi!.capabilities.strengths).toContain("build")
		expect(kimi!.capabilities.description).toBeTruthy()
	})
})
