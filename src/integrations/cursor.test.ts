import { describe, expect, it } from "vitest"
import { mergeCursorConfig } from "./cursor.js"
import { byId } from "./registry.js"

describe("mergeCursorConfig", () => {
	it("sets the base URL and useOpenAIKey on a fresh blob", () => {
		const out = mergeCursorConfig({})
		expect(out.openAIBaseUrl).toBe("https://llm.kimchi.dev/openai/v1")
		expect(out.useOpenAIKey).toBe(true)
	})

	it("populates aiSettings.modelConfig with the kimchi-routed surfaces", () => {
		const out = mergeCursorConfig({}) as { aiSettings: { modelConfig: Record<string, { modelName: string }> } }
		const mc = out.aiSettings.modelConfig
		// Composer / spec / deep-search / background / ensemble run on Main; cmd-k +
		// plan-execution on Coding; quick-agent on Sub.
		expect(mc.composer.modelName).toBe("kimchi/kimi-k2.5")
		expect(mc.spec.modelName).toBe("kimchi/kimi-k2.5")
		expect(mc["deep-search"].modelName).toBe("kimchi/kimi-k2.5")
		expect(mc["background-composer"].modelName).toBe("kimchi/kimi-k2.5")
		expect(mc["composer-ensemble"].modelName).toBe("kimchi/kimi-k2.5")
		expect(mc["cmd-k"].modelName).toBe("kimchi/nemotron-3-super-fp4")
		expect(mc["plan-execution"].modelName).toBe("kimchi/nemotron-3-super-fp4")
		expect(mc["quick-agent"].modelName).toBe("kimchi/minimax-m2.7")
	})

	it("appends our model slugs to userAddedModels without duplicating existing ones", () => {
		const initial = {
			aiSettings: {
				userAddedModels: ["other/model-a", "kimchi/kimi-k2.5"],
			},
		}
		const out = mergeCursorConfig(initial) as { aiSettings: { userAddedModels: string[] } }
		// "other/model-a" is preserved, "kimchi/kimi-k2.5" isn't duplicated, the
		// other two kimchi slugs are appended.
		expect(out.aiSettings.userAddedModels).toEqual([
			"other/model-a",
			"kimchi/kimi-k2.5",
			"kimchi/nemotron-3-super-fp4",
			"kimchi/minimax-m2.7",
		])
	})

	it("removes our slugs from modelOverrideDisabled while leaving unrelated entries alone", () => {
		const initial = {
			aiSettings: {
				modelOverrideDisabled: ["kimchi/kimi-k2.5", "other/keep-me", "kimchi/minimax-m2.7"],
			},
		}
		const out = mergeCursorConfig(initial) as { aiSettings: { modelOverrideDisabled: string[] } }
		expect(out.aiSettings.modelOverrideDisabled).toEqual(["other/keep-me"])
	})

	it("preserves arbitrary unrelated modelConfig surfaces", () => {
		const initial = {
			aiSettings: {
				modelConfig: {
					"unknown-surface": { modelName: "user/custom" },
				},
			},
		}
		const out = mergeCursorConfig(initial) as { aiSettings: { modelConfig: Record<string, { modelName: string }> } }
		expect(out.aiSettings.modelConfig["unknown-surface"].modelName).toBe("user/custom")
	})
})

describe("cursor tool registration", () => {
	it("registers itself with the integrations registry on import", () => {
		const tool = byId("cursor")
		expect(tool).toBeDefined()
		expect(tool?.binaryName).toBe("cursor")
		// Path differs by OS — we don't pin the exact value so the test is stable
		// across CI runners. We only check the suffix.
		expect(tool?.configPath).toContain("state.vscdb")
	})

	it("write() rejects an empty API key", async () => {
		const tool = byId("cursor")
		await expect(tool?.write("global", "")).rejects.toThrow(/API key/)
	})
})
