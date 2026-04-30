// Side-effect imports register each integration. Import order doesn't matter
// — the registry is a Map keyed by ToolId — but the imports themselves do,
// otherwise byId() returns undefined for an unimported tool.
import "../integrations/claude-code.js"
import "../integrations/cursor.js"
import "../integrations/gsd2.js"
import "../integrations/openclaw.js"
import "../integrations/opencode.js"

import type { WizardResult, WizardState } from "./state.js"
import { runAuthStep } from "./steps/auth.js"
import { runDoneStep } from "./steps/done.js"
import { runScopeStep } from "./steps/scope.js"
import { runToolsStep } from "./steps/tools.js"
import { runWelcomeStep } from "./steps/welcome.js"

/**
 * Drive the full setup wizard end-to-end. Each step mutates a shared
 * WizardState and may flip `cancelled = true` on Ctrl-C; the runner
 * stops at the first cancel without writing anything.
 *
 * The MVP wizard covers welcome / auth / scope / tools / done — the
 * richer Go-side steps (mode toggle, GSD installer, install offers,
 * telemetry opt-in) ship in a follow-up.
 */
export async function runWizard(): Promise<WizardResult> {
	const state: WizardState = {
		apiKey: "",
		scope: "global",
		selectedTools: [],
		cancelled: false,
	}

	runWelcomeStep()
	await runAuthStep(state)
	if (state.cancelled) return { cancelled: true, configuredTools: [] }

	await runScopeStep(state)
	if (state.cancelled) return { cancelled: true, configuredTools: [], apiKey: state.apiKey }

	await runToolsStep(state)
	if (state.cancelled) {
		return { cancelled: true, configuredTools: [], apiKey: state.apiKey, scope: state.scope }
	}

	const outcome = await runDoneStep(state)
	return {
		cancelled: false,
		apiKey: state.apiKey,
		scope: state.scope,
		configuredTools: outcome.successes.map((name) => name as never),
	}
}
