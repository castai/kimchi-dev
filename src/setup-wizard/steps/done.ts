import { resolve } from "node:path"
import { log, note, outro, spinner } from "@clack/prompts"
import { getApiKeyMismatchWarning } from "../../config.js"
import { byId } from "../../integrations/registry.js"
import type { ToolId } from "../../integrations/types.js"
import { type ModelMetadata, updateModelsConfig } from "../../models.js"
import { applyToolConfigs } from "../apply-tools.js"
import type { WizardState } from "../state.js"

interface ApplyOutcome {
	successes: string[]
	failures: Array<{ id: string; error: string }>
	warnings: Array<{ id: string; error: string }>
}

/**
 * Apply each selected tool's writer with the resolved scope + API key.
 * Failures are collected rather than thrown so a single broken tool
 * doesn't abort the rest of the install.
 *
 * In `inject` mode we deliberately skip the per-tool writers — the
 * tools work via env vars that the launcher subcommands set per-process.
 * The summary still lists which tools the user chose so they know what
 * `kimchi <tool>` will be wired to launch.
 */
export async function runDoneStep(state: WizardState): Promise<ApplyOutcome> {
	const outcome: ApplyOutcome = { successes: [], failures: [], warnings: [] }

	// Fetch live models before writing any tool config.
	// Throws if no key or network fails; surface the error and abort gracefully.
	const agentDir =
		process.env.KIMCHI_CODING_AGENT_DIR ?? resolve(process.env.HOME ?? "~", ".config/kimchi-coding-agent")
	const modelsJsonPath = resolve(agentDir, "models.json")
	let models: readonly ModelMetadata[] = []
	const modelSpinner = spinner()
	modelSpinner.start("Fetching available models…")
	try {
		const result = await updateModelsConfig(modelsJsonPath, state.apiKey)
		models = result.models
		modelSpinner.stop("Models fetched.")
	} catch (err) {
		const msg = (err as Error).message
		modelSpinner.stop(`Could not fetch available models: ${msg}`)
		outcome.failures.push({ id: "*", error: `model fetch failed: ${msg}` })
		outro("Aborted.")
		return outcome
	}

	if (models.length === 0) {
		log.error("API returned an empty model list — is your API key valid?")
		outcome.failures.push({ id: "*", error: "empty model list from API" })
		outro("Aborted.")
		return outcome
	}

	// Apply tool configurations.
	const toolOutcome = await applyToolConfigs({
		selectedTools: state.selectedTools as ToolId[],
		apiKey: state.apiKey,
		scope: state.scope,
		mode: state.mode,
		telemetryEnabled: state.telemetryEnabled,
		models,
	})
	outcome.successes.push(...toolOutcome.successes)
	outcome.failures.push(...toolOutcome.failures)

	const warning = getApiKeyMismatchWarning()
	if (warning) log.warn(warning)

	const summaryLines = [
		state.selectedTools.length > 0
			? `Mode: ${state.mode}${state.mode === "override" ? " (configs written)" : " (runtime wrapper)"}`
			: "",
		state.selectedTools.length > 0 ? `Scope: ${state.scope}` : "",
		`Telemetry: ${state.telemetryEnabled ? "enabled" : "disabled"}`,
		outcome.successes.length > 0 ? `Configured: ${outcome.successes.join(", ")}` : "",
		outcome.warnings.length > 0 ? `Warnings: ${outcome.warnings.map((f) => f.id).join(", ")}` : "",
		outcome.failures.length > 0
			? `Failed: ${outcome.failures.map((f) => byId(f.id as ToolId)?.name ?? f.id).join(", ")}`
			: "",
	].filter((l) => l.length > 0)

	note(summaryLines.join("\n"), "Summary")
	outro(outcome.failures.length === 0 ? "Done." : "Done with errors. Check above for details.")
	return outcome
}
