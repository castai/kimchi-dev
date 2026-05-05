import { log, note, outro } from "@clack/prompts"
import { byId } from "../../integrations/registry.js"
import type { ToolId } from "../../integrations/types.js"
import type { WizardState } from "../state.js"

interface ApplyOutcome {
	successes: string[]
	failures: Array<{ id: string; error: string }>
}

/**
 * Apply each selected tool's writer with the resolved scope + API key.
 * Failures are collected rather than thrown so a single broken tool
 * doesn't abort the rest of the install. Mirrors the parallel-with-recap
 * behavior of internal/tui/steps/done.go.
 *
 * In `inject` mode we deliberately skip the per-tool writers — the
 * tools work via env vars that the launcher subcommands set per-process.
 * The summary still lists which tools the user chose so they know what
 * `kimchi <tool>` will be wired to launch.
 */
export async function runDoneStep(state: WizardState): Promise<ApplyOutcome> {
	const outcome: ApplyOutcome = { successes: [], failures: [] }

	for (const id of state.selectedTools as ToolId[]) {
		const tool = byId(id)
		if (!tool) {
			outcome.failures.push({ id, error: "integration not registered" })
			continue
		}
		if (state.mode === "inject") {
			// No disk writes in inject mode — the launcher sets env per-process.
			outcome.successes.push(tool.name)
			log.info(`${tool.name}: ready (launch via 'kimchi ${id}')`)
			continue
		}
		try {
			await tool.write(state.scope, state.apiKey)
			outcome.successes.push(tool.name)
			log.success(`${tool.name}: configured`)
		} catch (err) {
			const msg = (err as Error).message
			outcome.failures.push({ id, error: msg })
			log.error(`${tool.name}: ${msg}`)
		}
	}

	const summaryLines = [
		`Mode: ${state.mode}${state.mode === "override" ? " (configs written)" : " (runtime wrapper)"}`,
		`Scope: ${state.scope}`,
		`Telemetry: ${state.telemetryEnabled ? "enabled" : "disabled"}`,
		outcome.successes.length > 0 ? `Configured: ${outcome.successes.join(", ")}` : "",
		outcome.failures.length > 0 ? `Failed: ${outcome.failures.map((f) => f.id).join(", ")}` : "",
	].filter((l) => l.length > 0)

	note(summaryLines.join("\n"), "Summary")
	outro(outcome.failures.length === 0 ? "Done." : "Done with errors. Check above for details.")
	return outcome
}
