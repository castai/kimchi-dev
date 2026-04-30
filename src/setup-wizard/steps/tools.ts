import { cancel, isCancel, multiselect, note } from "@clack/prompts"
import { all as allTools } from "../../integrations/registry.js"
import type { ToolId } from "../../integrations/types.js"
import type { WizardState } from "../state.js"

/**
 * Tools step — multi-select which tools to configure. The list is built
 * from the integrations registry, with each option's hint reflecting
 * detection state (installed / not detected). Pre-selects the tools we
 * detect as installed; users can flip individual toggles.
 *
 * Mirrors internal/tui/steps/tools.go. Tools whose `isInstalled()` returns
 * false are still selectable — useful when the user is about to install
 * the binary alongside.
 */
export async function runToolsStep(state: WizardState): Promise<void> {
	const tools = allTools()
	if (tools.length === 0) {
		// Defensive: only reachable if no integration modules were imported,
		// which means the wizard was wired wrong. Bail with a clear message
		// rather than a silent empty selection.
		note("No integrations registered. This is a wiring bug; please report it.", "No tools available")
		state.cancelled = true
		return
	}

	const installed = new Set(tools.filter((t) => t.isInstalled()).map((t) => t.id))
	const initial = tools.filter((t) => installed.has(t.id)).map((t) => t.id)

	const selection = await multiselect({
		message: "Which tools should be configured?",
		options: tools.map((t) => ({
			value: t.id,
			label: t.name,
			hint: installed.has(t.id) ? "installed" : "not detected",
		})),
		initialValues: initial,
		required: false,
	})

	if (isCancel(selection)) {
		cancel("Cancelled.")
		state.cancelled = true
		return
	}
	state.selectedTools = selection as ToolId[]
}
