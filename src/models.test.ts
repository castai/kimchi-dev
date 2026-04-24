import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { updateModelsConfig } from "./models.js"

const KIMI: unknown = {
	slug: "kimi-k2.5",
	display_name: "Kimi K2.5",
	description: "Primary model",
	provider: "ai-enabler",
	tool_call: true,
	reasoning: true,
	input_modalities: ["text", "image"],
	is_serverless: true,
	is_routable: false,
	limits: { context_window: 262144, max_output_tokens: 262144 },
}

const GLM: unknown = {
	slug: "glm-5-fp8",
	display_name: "GLM-5 FP8",
	description: "Coding subagent",
	provider: "ai-enabler",
	tool_call: true,
	reasoning: true,
	input_modalities: ["text"],
	is_serverless: true,
	is_routable: false,
	limits: { context_window: 202752, max_output_tokens: 202752 },
}

const OPUS_47: unknown = {
	slug: "claude-opus-4-7",
	display_name: "",
	description: "",
	provider: "anthropic",
	tool_call: true,
	reasoning: true,
	input_modalities: ["text", "image"],
	is_serverless: false,
	is_routable: false,
	limits: { context_window: 1_000_000, max_output_tokens: 128_000 },
}

const OPUS_46: unknown = {
	slug: "claude-opus-4-6",
	display_name: "",
	description: "",
	provider: "anthropic",
	tool_call: true,
	reasoning: true,
	input_modalities: ["text", "image"],
	is_serverless: false,
	is_routable: false,
	limits: { context_window: 1_000_000, max_output_tokens: 128_000 },
}

describe("updateModelsConfig", () => {
	let tempDir: string
	let modelsJsonPath: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-models-test-"))
		modelsJsonPath = join(tempDir, "models.json")
		vi.stubGlobal("fetch", vi.fn())
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
		vi.restoreAllMocks()
	})

	it("maps each metadata field into the pi-mono model config", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [KIMI] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models).toEqual([
			{
				id: "kimi-k2.5",
				name: "Kimi K2.5",
				reasoning: true,
				input: ["text", "image"],
				contextWindow: 262144,
				maxTokens: 262144,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			},
		])
	})

	it("falls back to derived name when display_name is empty", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [OPUS_47] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models[0].name).toBe("Claude Opus 4 7")
	})

	it("passes input_modalities through directly", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [GLM] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models[0].input).toEqual(["text"])
	})

	it("puts AI-Enabler models first and preserves API order for others, all under kimchi-dev", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [OPUS_46, GLM, OPUS_47, KIMI] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(Object.keys(config.providers)).toEqual(["kimchi-dev"])
		const ids = config.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)
		expect(ids).toEqual(["glm-5-fp8", "kimi-k2.5", "claude-opus-4-6", "claude-opus-4-7"])
	})

	it("uses correct URL, Authorization header, and timeout", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [KIMI] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "my-api-key")

		expect(fetch).toHaveBeenCalledWith(
			"https://llm.kimchi.dev/v1/models/metadata?include_in_cli=true",
			expect.objectContaining({
				headers: { Authorization: "Bearer my-api-key" },
				signal: expect.any(AbortSignal),
			}),
		)
	})

	it("returns discovered metadata when fetch succeeds", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [KIMI, GLM] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result.models.map((m) => m.slug)).toEqual(["kimi-k2.5", "glm-5-fp8"])
	})

	it("overwrites an existing models.json with fetched metadata", async () => {
		writeFileSync(modelsJsonPath, JSON.stringify({ providers: { custom: {} } }))
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [KIMI] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)).toEqual(["kimi-k2.5"])
	})

	it("throws on network error", async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"))
		await expect(updateModelsConfig(modelsJsonPath, "test-key")).rejects.toThrow("network error")
	})

	it("throws on non-ok response", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 401,
			statusText: "Unauthorized",
		} as Response)
		await expect(updateModelsConfig(modelsJsonPath, "bad-key")).rejects.toThrow(
			"Failed to fetch models: 401 Unauthorized",
		)
	})

	it("throws on unexpected response shape", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: "unexpected" }),
		} as Response)
		await expect(updateModelsConfig(modelsJsonPath, "test-key")).rejects.toThrow(
			"Unexpected response shape from models API",
		)
	})

	it("throws when API returns empty list", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [] }),
		} as Response)
		await expect(updateModelsConfig(modelsJsonPath, "test-key")).rejects.toThrow("API returned empty model list")
	})

	it("creates nested directories if they do not exist", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [KIMI] }),
		} as Response)

		const nestedPath = join(tempDir, "a", "b", "models.json")
		await updateModelsConfig(nestedPath, "test-key")

		expect(existsSync(nestedPath)).toBe(true)
	})
})
