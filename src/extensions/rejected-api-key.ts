import type { ExtensionFactory } from "@earendil-works/pi-coding-agent"
import { loadConfig } from "../config.js"
import { isKimchiProvider } from "../pi-auth.js"

/** Preserve auth.json after a 401 without silently using another Kimchi account. */
export default function createRejectedApiKeyExtension(rejectedKey: string | undefined): ExtensionFactory {
	return (pi) => {
		if (!rejectedKey) return
		const assertKeyUpdated = () => {
			if (loadConfig().apiKey === rejectedKey) {
				throw new Error("Kimchi API key was rejected. Log in with a valid key.")
			}
		}

		pi.on("session_start", (_event, ctx) => {
			const providerIds = new Set(
				ctx.modelRegistry
					.getAll()
					.map((model) => model.provider)
					.filter(isKimchiProvider),
			)
			for (const providerId of providerIds) {
				const provider = ctx.modelRegistry.getProvider(providerId)
				if (!provider) continue
				const { apiKey, oauth } = provider.auth
				ctx.modelRegistry.registerProvider({
					...provider,
					auth: {
						apiKey: apiKey && {
							...apiKey,
							resolve: async (input) => {
								assertKeyUpdated()
								return apiKey.resolve(input)
							},
						},
						oauth: oauth && {
							...oauth,
							refresh: async (credential, signal) => {
								assertKeyUpdated()
								return oauth.refresh(credential, signal)
							},
							toAuth: async (credential) => {
								assertKeyUpdated()
								return oauth.toAuth(credential)
							},
						},
					},
				})
			}
		})
	}
}
