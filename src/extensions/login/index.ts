import { resolve } from "node:path"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { writeApiKey } from "../../config.js"
import { updateModelsConfig } from "../../models.js"

export default function loginExtension(pi: ExtensionAPI): void {
	const agentDir = process.env.KIMCHI_CODING_AGENT_DIR
	if (!agentDir) return
	const modelsJsonPath = resolve(agentDir, "models.json")

	pi.registerProvider("kimchi-dev", {
		oauth: {
			name: "Kimchi",
			login: async (callbacks) => {
				const key = await callbacks.onPrompt({
					message: "Enter your Kimchi API key:",
					placeholder: "castai_...",
				})
				writeApiKey(key)
				process.env.KIMCHI_API_KEY = key
				await updateModelsConfig(modelsJsonPath, key)
				return { access: key, refresh: "", expires: Number.MAX_SAFE_INTEGER }
			},
			refreshToken: (credentials) => Promise.resolve(credentials),
			getApiKey: (credentials) => credentials.access,
		},
	})
}
