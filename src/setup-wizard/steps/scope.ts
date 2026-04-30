import { cancel, isCancel, select } from "@clack/prompts"
import type { WizardState } from "../state.js"

/**
 * Scope step — choose where tool configs land. Global = the tool's own
 * user-level config dir (~/.claude/, ~/.config/opencode/, …). Project =
 * a per-repo override under <cwd>/.claude/<basename>. Mirrors
 * internal/tui/steps/scope.go.
 */
export async function runScopeStep(state: WizardState): Promise<void> {
	const choice = await select({
		message: "Where should tool configs be written?",
		options: [
			{ value: "global", label: "Global", hint: "user-level config (most users)" },
			{ value: "project", label: "Project", hint: "per-repo override under <cwd>/.claude/" },
		],
		initialValue: "global",
	})
	if (isCancel(choice)) {
		cancel("Cancelled.")
		state.cancelled = true
		return
	}
	state.scope = choice as "global" | "project"
}
