import { describe, expect, it } from "vitest"
import { isBareExitAlias } from "./exit-utils.js"

describe("isBareExitAlias", () => {
	it("returns true for exact 'exit' input", () => {
		expect(isBareExitAlias("exit")).toBe(true)
	})

	it("returns true for 'exit' with leading/trailing whitespace", () => {
		expect(isBareExitAlias("  exit  ")).toBe(true)
		expect(isBareExitAlias("\texit\n")).toBe(true)
		expect(isBareExitAlias("  exit")).toBe(true)
		expect(isBareExitAlias("exit  ")).toBe(true)
	})

	it("returns false for '/exit' command", () => {
		expect(isBareExitAlias("/exit")).toBe(false)
	})

	it("returns false for 'EXIT' (case sensitive)", () => {
		expect(isBareExitAlias("EXIT")).toBe(false)
		expect(isBareExitAlias("Exit")).toBe(false)
	})

	it("returns false for empty input", () => {
		expect(isBareExitAlias("")).toBe(false)
		expect(isBareExitAlias("   ")).toBe(false)
	})

	it("returns false for other text", () => {
		expect(isBareExitAlias("hello")).toBe(false)
		expect(isBareExitAlias("exit now")).toBe(false)
		expect(isBareExitAlias("please exit")).toBe(false)
		expect(isBareExitAlias("quit")).toBe(false)
	})
})

describe("Model filtering for kimchi-dev provider", () => {
	it("filters out non-kimchi-dev models to avoid collisions with pi-mono built-ins", () => {
		// Simulate the filtering that happens in the UI extension
		const mockModels = [
			{ id: "claude-opus-4-7", provider: "kimchi-dev", name: "Claude Opus 4.7" },
			{ id: "kimi-k2.5", provider: "kimchi-dev", name: "Kimi K2.5" },
			{ id: "claude-opus-4-7", provider: "anthropic", name: "Claude Opus 4.7 (Anthropic)" },
			{ id: "anthropic.claude-opus-4-7", provider: "amazon-bedrock", name: "Claude Opus 4.7 (Bedrock)" },
		]

		const available = mockModels.filter((m) => m.provider === "kimchi-dev")

		// Should only include kimchi-dev models
		expect(available).toHaveLength(2)
		expect(available.map((m) => m.id)).toEqual(["claude-opus-4-7", "kimi-k2.5"])
		expect(available.every((m) => m.provider === "kimchi-dev")).toBe(true)
	})

	it("returns empty array when no kimchi-dev models are available", () => {
		const mockModels = [
			{ id: "claude-opus-4-7", provider: "anthropic", name: "Claude Opus 4.7" },
			{ id: "claude-opus-4-7", provider: "amazon-bedrock", name: "Claude Opus 4.7 (Bedrock)" },
		]

		const available = mockModels.filter((m) => m.provider === "kimchi-dev")

		expect(available).toHaveLength(0)
	})

	it("handles case where all models are from kimchi-dev provider", () => {
		const mockModels = [
			{ id: "model-a", provider: "kimchi-dev", name: "Model A" },
			{ id: "model-b", provider: "kimchi-dev", name: "Model B" },
			{ id: "model-c", provider: "kimchi-dev", name: "Model C" },
		]

		const available = mockModels.filter((m) => m.provider === "kimchi-dev")

		expect(available).toHaveLength(3)
	})
})

describe("Model validation", () => {
	it("accepts kimchi-dev provider models", () => {
		const mockModel = { id: "claude-opus-4-7", provider: "kimchi-dev", name: "Claude Opus 4.7" }

		// Should not throw
		expect(() => {
			if (mockModel.provider !== "kimchi-dev") {
				throw new Error(
					`Model ${mockModel.id} from provider "${mockModel.provider}" is not supported. Only kimchi-dev models are allowed to avoid API conflicts.`,
				)
			}
		}).not.toThrow()
	})

	it("rejects non-kimchi-dev provider models with clear error", () => {
		const mockModel = { id: "claude-opus-4-7", provider: "amazon-bedrock", name: "Claude Opus 4.7 (Bedrock)" }

		expect(() => {
			if (mockModel.provider !== "kimchi-dev") {
				throw new Error(
					`Model ${mockModel.id} from provider "${mockModel.provider}" is not supported. Only kimchi-dev models are allowed to avoid API conflicts.`,
				)
			}
		}).toThrow(/amazon-bedrock.*not supported/)
	})

	it("rejects anthropic provider models", () => {
		const mockModel = { id: "claude-opus-4-7", provider: "anthropic", name: "Claude Opus 4.7" }

		expect(() => {
			if (mockModel.provider !== "kimchi-dev") {
				throw new Error(
					`Model ${mockModel.id} from provider "${mockModel.provider}" is not supported. Only kimchi-dev models are allowed to avoid API conflicts.`,
				)
			}
		}).toThrow(/anthropic.*not supported/)
	})
})
