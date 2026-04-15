import { describe, expect, it } from "vitest"
import { MODEL_CAPABILITIES } from "./builtin-models.js"
import { ModelRegistry } from "./model-registry.js"

const KNOWN_IDS = [...MODEL_CAPABILITIES.keys()]

describe("ModelRegistry — known models only", () => {
	it("returns all known models when all are available in the API", () => {
		const registry = new ModelRegistry(KNOWN_IDS)
		expect(registry.getAll()).toHaveLength(KNOWN_IDS.length)
		expect(registry.getModelsWithCapabilities()).toHaveLength(KNOWN_IDS.length)
		expect(registry.warnings).toHaveLength(0)
	})

	it("getAll() preserves the API order", () => {
		const ids = [...KNOWN_IDS].reverse()
		const registry = new ModelRegistry(ids)
		expect(registry.getAll().map((m) => m.id)).toEqual(ids)
	})

	it("every known model has a non-placeholder description", () => {
		const registry = new ModelRegistry(KNOWN_IDS)
		for (const model of registry.getModelsWithCapabilities()) {
			expect(model.capabilities.description).not.toBe("TODO")
			expect(model.capabilities.description.length).toBeGreaterThan(50)
		}
	})
})

describe("ModelRegistry — unknown model in API", () => {
	it("includes the unknown model in getAll() with a generic descriptor", () => {
		const registry = new ModelRegistry([...KNOWN_IDS, "brand-new-model"])
		const unknown = registry.getAll().find((m) => m.id === "brand-new-model")
		expect(unknown).toBeDefined()
		expect(unknown?.capabilities.description).toContain("No capability information")
	})

	it("emits a user-friendly discovery notice for the unknown model", () => {
		const registry = new ModelRegistry([...KNOWN_IDS, "brand-new-model"])
		const warning = registry.warnings.find((w) => w.modelId === "brand-new-model")
		expect(warning?.message).toContain("New model available")
		expect(warning?.message).toContain("brand-new-model")
	})

	it("excludes the unknown model from getModelsWithCapabilities()", () => {
		const registry = new ModelRegistry([...KNOWN_IDS, "brand-new-model"])
		expect(registry.getModelsWithCapabilities().map((m) => m.id)).not.toContain("brand-new-model")
	})

	it("emits an unknown_model warning", () => {
		const registry = new ModelRegistry([...KNOWN_IDS, "brand-new-model"])
		const warning = registry.warnings.find((w) => w.modelId === "brand-new-model")
		expect(warning).toBeDefined()
		expect(warning?.kind).toBe("unknown_model")
	})
})

describe("ModelRegistry — orphaned capability entry", () => {
	it("excludes the orphaned model from both getAll() and getModelsWithCapabilities()", () => {
		const presentId = KNOWN_IDS[0]
		const registry = new ModelRegistry([presentId])
		expect(registry.getAll().map((m) => m.id)).toEqual([presentId])
		expect(registry.getModelsWithCapabilities().map((m) => m.id)).toEqual([presentId])
	})

	it("does not emit any warning for capability entries absent from the API", () => {
		const presentId = KNOWN_IDS[0]
		const registry = new ModelRegistry([presentId])
		expect(registry.warnings).toHaveLength(0)
	})
})

describe("ModelRegistry — getModelsWithCapabilities()", () => {
	it("is the intersection of API models and capability map", () => {
		const registry = new ModelRegistry([...KNOWN_IDS, "unknown-extra"])
		expect(registry.getModelsWithCapabilities().map((m) => m.id)).toEqual(expect.arrayContaining(KNOWN_IDS))
		expect(registry.getModelsWithCapabilities().map((m) => m.id)).not.toContain("unknown-extra")
	})

	it("returns empty when API list is empty", () => {
		const registry = new ModelRegistry([])
		expect(registry.getModelsWithCapabilities()).toHaveLength(0)
	})
})
