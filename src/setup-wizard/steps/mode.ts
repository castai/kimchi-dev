import { select } from "../prompt.js"
import type { WizardState } from "../state.js"

/**
 * Mode step — pick how kimchi configures the user's tools.
 *
 *   - **override** (default): write kimchi settings into each tool's own
 *     config file (~/.config/opencode/opencode.json,
 *     ~/.claude/settings.json, …). The tool keeps working standalone
 *     afterwards.
 *   - **inject**: don't touch the user's configs. Users launch via
 *     `kimchi opencode` / `kimchi claude` etc., and the env vars exist
 *     only for that process.
 *
 * The wizard's `done` step honors this — inject mode skips the tool
 * registry writes entirely.
 */
export async function runModeStep(state: WizardState, opts: { backable: boolean }): Promise<void> {
	const r = await select<"override" | "inject">({
		message: "How should kimchi configure your tools?",
		options: [
			{
				value: "override",
				label: "Direct override (recommended)",
				hint: "Write Kimchi settings into tool config files",
			},
			{
				value: "inject",
				label: "Runtime wrapper",
				hint: "Launch via 'kimchi <tool>'; tool configs are never modified",
			},
		],
		initialValue: "override",
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
	state.mode = r.value
}
