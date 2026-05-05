import { spinner } from "@clack/prompts"
import { validateApiKey } from "../../auth/validator.js"
import { readApiKeyFromConfigFile, writeApiKey } from "../../config.js"
import { confirm, password } from "../prompt.js"
import type { WizardState } from "../state.js"

/**
 * Auth step — secure an API key for the rest of the wizard. Mirrors
 * internal/tui/steps/auth.go's two-frame design:
 *
 *   1. **Saved-key frame** — when a key is already available (env var or
 *      ~/.config/kimchi/config.json), offer "use saved / enter new" (Y/n).
 *      On Y the existing key is validated against the API and accepted;
 *      on N we fall through to the input frame so the user can replace it.
 *   2. **Input frame** — prompt for a key, validate, retry on failure
 *      (with the validator's suggestions printed). On success the key is
 *      persisted to config.json so future runs land in frame 1.
 *
 * Note: $KIMCHI_API_KEY still wins at runtime — it's read fresh on every
 * launch, so a key entered here is saved to config.json but won't take
 * effect until the user unsets the env var.
 */
export async function runAuthStep(state: WizardState, opts: { backable: boolean }): Promise<void> {
	const envKey = process.env.KIMCHI_API_KEY
	const fileKey = readApiKeyFromConfigFile()
	const currentKey = envKey && envKey.length > 0 ? envKey : (fileKey ?? "")
	const source: "env" | "file" | "none" = envKey && envKey.length > 0 ? "env" : fileKey ? "file" : "none"

	if (currentKey.length > 0) {
		const sourceLabel = source === "env" ? "$KIMCHI_API_KEY" : "~/.config/kimchi/config.json"
		const r = await confirm({
			message: `An API key is already configured (from ${sourceLabel}). Keep it?`,
			initialValue: true,
			backable: opts.backable,
		})
		if (r.kind === "back") {
			state.back = true
			return
		}
		if (r.kind === "cancel") {
			state.cancelled = true
			return
		}
		if (r.value) {
			const s = spinner()
			s.start("Validating saved API key…")
			const result = await validateApiKey(currentKey)
			if (result.valid) {
				s.stop("Saved API key valid.")
				state.apiKey = currentKey
				return
			}
			s.stop(`Saved key failed validation: ${result.error ?? "unknown error"}`)
			console.log("  Replace it below, press Esc to go back, or Ctrl-C to abort.")
		} else if (source === "env") {
			console.log(
				"  Note: $KIMCHI_API_KEY is set and will still win at runtime until unset. The new key below is saved to config.json for future shells.",
			)
		}
	}

	await promptAndValidateKey(state, opts.backable)
}

async function promptAndValidateKey(state: WizardState, backable: boolean): Promise<void> {
	for (;;) {
		const entered = await password({
			message: "Paste your kimchi API key (get one at https://app.kimchi.dev → API Keys → Create API Key)",
			validate: (v) => (v && v.length > 0 ? undefined : "API key cannot be empty"),
			backable,
		})
		if (entered.kind === "back") {
			state.back = true
			return
		}
		if (entered.kind === "cancel") {
			state.cancelled = true
			return
		}

		const s = spinner()
		s.start("Validating API key…")
		const result = await validateApiKey(entered.value)
		if (result.valid) {
			s.stop("API key valid.")
			state.apiKey = entered.value
			writeApiKey(state.apiKey)
			return
		}
		s.stop(`Validation failed: ${result.error ?? "unknown error"}`)
		for (const sug of result.suggestions ?? ["Try a different key, press Esc to go back, or Ctrl-C to abort."]) {
			console.log(`  - ${sug}`)
		}
	}
}
