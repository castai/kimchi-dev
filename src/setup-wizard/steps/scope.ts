import { select } from "../prompt.js"
import type { WizardState } from "../state.js"

/**
 * Scope step — choose where tool configs land. Global = the tool's own
 * user-level config dir (~/.claude/, ~/.config/opencode/, …). Project =
 * a per-repo override under <cwd>/.claude/<basename>.
 */
export async function runScopeStep(state: WizardState, opts: { backable: boolean }): Promise<void> {
	const r = await select<"global" | "project">({
		message: "Where should tool configs be written?",
		options: [
			{ value: "global", label: "Global", hint: "user-level config (most users)" },
			{ value: "project", label: "Project", hint: "per-repo override under <cwd>/.claude/" },
		],
		initialValue: "global",
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
	state.scope = r.value
}
