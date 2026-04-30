import { cancel, isCancel, password, spinner } from "@clack/prompts"
import { validateApiKey } from "../../auth/validator.js"
import { readApiKeyFromConfigFile, writeApiKey } from "../../config.js"
import type { WizardState } from "../state.js"

/**
 * Auth step — resolve the API key from $KIMCHI_API_KEY → config file, or
 * prompt for one and validate it against the Cast AI API. On success the
 * key is persisted to config.json so future kimchi launches skip this
 * step. Mirrors internal/tui/steps/auth.go.
 *
 * On Ctrl-C we mark the wizard cancelled so the caller exits cleanly
 * without writing anything.
 */
export async function runAuthStep(state: WizardState): Promise<void> {
	const envKey = process.env.KIMCHI_API_KEY
	const fileKey = readApiKeyFromConfigFile()
	if (envKey && envKey.length > 0) {
		state.apiKey = envKey
		return
	}
	if (fileKey && fileKey.length > 0) {
		state.apiKey = fileKey
		return
	}

	for (;;) {
		const entered = await password({
			message: "Paste your kimchi API key",
			validate: (v) => (v && v.length > 0 ? undefined : "API key cannot be empty"),
		})
		if (isCancel(entered)) {
			cancel("Cancelled.")
			state.cancelled = true
			return
		}

		const s = spinner()
		s.start("Validating API key…")
		const result = await validateApiKey(entered as string)
		if (result.valid) {
			s.stop("API key valid.")
			state.apiKey = entered as string
			writeApiKey(state.apiKey)
			return
		}
		s.stop(`Validation failed: ${result.error ?? "unknown error"}`)
		// Surface the suggestions so the user knows whether to retry the key
		// or fix something else (network, scopes). Falls back to a generic
		// retry-or-Ctrl-C hint when the validator returns no suggestions.
		for (const sug of result.suggestions ?? ["Try a different key, or press Ctrl-C to abort."]) {
			console.log(`  - ${sug}`)
		}
	}
}
