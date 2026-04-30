import { log, note, outro } from "@clack/prompts"
import { byId } from "../../integrations/registry.js"
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
 */
export async function runDoneStep(state: WizardState): Promise<ApplyOutcome> {
	const outcome: ApplyOutcome = { successes: [], failures: [] }

	for (const id of state.selectedTools) {
		const tool = byId(id)
		if (!tool) {
			outcome.failures.push({ id, error: "integration not registered" })
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

	if (outcome.successes.length > 0) {
		note(
			[
				`Configured: ${outcome.successes.join(", ")}`,
				`Scope: ${state.scope}`,
				outcome.failures.length > 0 ? `Failed: ${outcome.failures.map((f) => f.id).join(", ")}` : "",
			]
				.filter((l) => l.length > 0)
				.join("\n"),
			"Summary",
		)
	}
	outro(outcome.failures.length === 0 ? "Done." : "Done with errors. Check above for details.")
	return outcome
}
