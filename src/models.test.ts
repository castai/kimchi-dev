import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { hasKimchiProvider, updateModelsConfig } from "./models.js"

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

	it("overwrites existing file with fetched models", async () => {
		const existing = { providers: { custom: {} } }
		writeFileSync(modelsJsonPath, JSON.stringify(existing))

		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["new-model"] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "test-key")

		const content = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(content.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)).toEqual(["new-model"])
	})

	it("writes discovered models when fetch succeeds", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				models: ["my-model-1", "my-model-2"],
			}),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({ source: "discovered", models: ["my-model-1", "my-model-2"] })
		expect(existsSync(modelsJsonPath)).toBe(true)
		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models).toEqual([
			{
				id: "my-model-1",
				name: "My Model 1",
				reasoning: false,
				input: ["text"],
				contextWindow: 131072,
				maxTokens: 16384,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			},
			{
				id: "my-model-2",
				name: "My Model 2",
				reasoning: false,
				input: ["text"],
				contextWindow: 131072,
				maxTokens: 16384,
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
			},
		])
	})

	it("uses correct auth header and timeout when fetching models", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["m1"] }),
		} as Response)

		await updateModelsConfig(modelsJsonPath, "my-api-key")

		expect(fetch).toHaveBeenCalledWith(
			"https://api.cast.ai/v1/llm/openai/models?providerName=AI%20Enabler",
			expect.objectContaining({
				headers: { Authorization: "Bearer my-api-key" },
				signal: expect.any(AbortSignal),
			}),
		)
	})

	it("falls back to default models when fetch fails with network error", async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error("network error"))

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({
			source: "default",
			models: ["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"],
			error: "network error",
		})
		expect(existsSync(modelsJsonPath)).toBe(true)
		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)).toEqual([
			"kimi-k2.5",
			"glm-5-fp8",
			"minimax-m2.5",
		])
	})

	it("falls back to default models when fetch returns non-ok status", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			status: 401,
			statusText: "Unauthorized",
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "bad-key")

		expect(result).toEqual({
			source: "default",
			models: ["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"],
			error: "Failed to fetch models: 401 Unauthorized",
		})
		expect(existsSync(modelsJsonPath)).toBe(true)
		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)).toEqual([
			"kimi-k2.5",
			"glm-5-fp8",
			"minimax-m2.5",
		])
	})

	it("falls back to default models when fetch returns empty list", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: [] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({
			source: "default",
			models: ["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"],
			error: "API returned empty model list",
		})
		const config = JSON.parse(readFileSync(modelsJsonPath, "utf-8"))
		expect(config.providers["kimchi-dev"].models.map((m: { id: string }) => m.id)).toEqual([
			"kimi-k2.5",
			"glm-5-fp8",
			"minimax-m2.5",
		])
	})

	it("falls back to default models when all fetched models are filtered out", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["smollm2-360m", "qwen3-coder-next-fp8"] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({
			source: "default",
			models: ["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"],
			error: "API returned no usable models after filtering",
		})
	})

	it("falls back to default models when response has unexpected shape", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: "unexpected" }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({
			source: "default",
			models: ["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"],
			error: "Unexpected response shape from models API",
		})
	})

	it("falls back to default models on fetch timeout", async () => {
		const abortError = new DOMException("The operation was aborted.", "AbortError")
		vi.mocked(fetch).mockRejectedValueOnce(abortError)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result.source).toBe("default")
		expect(result.models).toEqual(["kimi-k2.5", "glm-5-fp8", "minimax-m2.5"])
	})

	it("sorts models alphabetically", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["zebra-model", "alpha-model", "mango-model"] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({
			source: "discovered",
			models: ["alpha-model", "mango-model", "zebra-model"],
		})
	})

	it("excludes models matching smoll* pattern", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["good-model", "smollm2-360m", "smollm2-135m"] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({ source: "discovered", models: ["good-model"] })
	})

	it("excludes models matching qwen* pattern", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["good-model", "qwen3-coder-next-fp8"] }),
		} as Response)

		const result = await updateModelsConfig(modelsJsonPath, "test-key")

		expect(result).toEqual({ source: "discovered", models: ["good-model"] })
	})

	it("creates nested directories if they do not exist", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ models: ["m1"] }),
		} as Response)

		const nestedPath = join(tempDir, "a", "b", "models.json")
		await updateModelsConfig(nestedPath, "test-key")

		expect(existsSync(nestedPath)).toBe(true)
	})
})

describe("hasKimchiProvider", () => {
	let tempDir: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "kimchi-models-test-"))
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("returns false when file does not exist", () => {
		expect(hasKimchiProvider(join(tempDir, "missing.json"))).toBe(false)
	})

	it("returns false when file has no kimchi-dev provider", () => {
		const p = join(tempDir, "models.json")
		writeFileSync(p, JSON.stringify({ providers: { other: {} } }))
		expect(hasKimchiProvider(p)).toBe(false)
	})

	it("returns true when file contains kimchi-dev provider", () => {
		const p = join(tempDir, "models.json")
		writeFileSync(p, JSON.stringify({ providers: { "kimchi-dev": { models: [] } } }))
		expect(hasKimchiProvider(p)).toBe(true)
	})
})
