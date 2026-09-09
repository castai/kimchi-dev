import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { ModelRegistry, ModelRuntime, type SessionStartEvent } from "@earendil-works/pi-coding-agent"
import { afterEach, describe, expect, it, vi } from "vitest"
import { syncPiAuth } from "../pi-auth.js"
import { createContext } from "./__mocks__/context.js"
import { createExtensionApi } from "./__mocks__/extension-api.js"
import createRejectedApiKeyExtension from "./rejected-api-key.js"

const { effectiveKey } = vi.hoisted(() => ({ effectiveKey: { value: "rejected-key" } }))
vi.mock("../config.js", () => ({ loadConfig: () => ({ apiKey: effectiveKey.value }) }))

const tempDirs: string[] = []
afterEach(() => {
	for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
	vi.unstubAllEnvs()
})

describe("rejected Kimchi key", () => {
	it.each([
		"api_key",
		"oauth",
	])("preserves stored %s credentials without silently using them", async (credentialType) => {
		vi.stubEnv("KIMCHI_DISABLE_BUILTIN_PROVIDERS", "1")
		vi.stubEnv("KIMCHI_API_KEY", undefined)
		effectiveKey.value = "rejected-key"
		const dir = mkdtempSync(join(tmpdir(), "kimchi-rejected-key-"))
		tempDirs.push(dir)
		const authPath = join(dir, "auth.json")
		const modelsPath = join(dir, "models.json")
		const kimchiProviders = ["kimchi-dev", "kimchi-dev/openai", "kimchi-experimental"]
		const storedCredential =
			credentialType === "api_key"
				? { type: "api_key", key: "valid-stored-key" }
				: { type: "oauth", access: "valid-stored-key", refresh: "refresh-token", expires: Number.MAX_SAFE_INTEGER }
		const savedAuth = JSON.stringify({
			...Object.fromEntries(kimchiProviders.map((id) => [id, storedCredential])),
			custom: { type: "api_key", key: "custom-key" },
		})
		writeFileSync(authPath, savedAuth, { mode: 0o600 })
		const provider = {
			api: "openai-completions",
			baseUrl: "https://example.invalid/v1",
			apiKey: "unused-config-key",
			models: [
				{
					id: "test-model",
					name: "Test model",
					reasoning: false,
					input: ["text"],
					contextWindow: 8192,
					maxTokens: 1024,
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				},
			],
		}
		writeFileSync(
			modelsPath,
			JSON.stringify({
				providers: Object.fromEntries([...kimchiProviders, "custom"].map((id) => [id, provider])),
			}),
		)
		const runtime = await ModelRuntime.create({
			authPath,
			modelsPath,
			allowModelNetwork: false,
			refreshOnCreate: false,
		})
		const registry = new ModelRegistry(runtime)
		for (const id of kimchiProviders) {
			registry.registerProvider(id, {
				oauth: {
					name: "Kimchi",
					login: vi.fn(),
					refreshToken: vi.fn(),
					getApiKey: (credential) => credential.access,
				},
			})
			expect(await registry.getApiKeyForProvider(id)).toBe("valid-stored-key")
		}
		const extension = createExtensionApi()
		const ctx = createContext()
		ctx.modelRegistry = registry
		await createRejectedApiKeyExtension("rejected-key")(extension.api)
		await extension.getHandler<SessionStartEvent>("session_start")({ type: "session_start", reason: "startup" }, ctx)

		for (const id of kimchiProviders) {
			await expect(registry.getProviderAuth(id)).rejects.toThrow("Kimchi API key was rejected")
		}
		expect(await registry.getApiKeyForProvider("custom")).toBe("custom-key")
		expect(readFileSync(authPath, "utf-8")).toBe(savedAuth)

		// A subsequent successful login can activate a different key in this session.
		effectiveKey.value = "updated-key"
		await syncPiAuth(authPath, modelsPath, "updated-key")
		await registry.refresh()
		for (const id of kimchiProviders) {
			expect(await registry.getApiKeyForProvider(id)).toBe("updated-key")
		}
	})
})
