// CLI logic — imported dynamically by entry.ts after PI_PACKAGE_DIR is set.
// All static imports here (extensions, pi-mono) are safe because the env is already configured.

import { resolve } from "node:path"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"
import { loadConfig, readTelemetryConfig, writeMigrationState, writeSkillPaths } from "./config.js"
import bashCollapseExtension from "./extensions/bash-collapse.js"
import loopGuardExtension from "./extensions/loop-guard.js"
import mcpAdapterExtension from "./extensions/mcp-adapter/index.js"
import promptEnrichmentExtension from "./extensions/orchestration/prompt-enrichment.js"
import promptSummaryExtension from "./extensions/prompt-summary.js"
import subagentExtension from "./extensions/subagent.js"
import tagsExtension from "./extensions/tags.js"
import telemetryExtension from "./extensions/telemetry.js"
import webFetchExtension from "./extensions/web-fetch/index.js"
import webSearchExtension from "./extensions/web-search/index.js"
import { updateModelsConfig } from "./models.js"
import { runSetupWizard } from "./setup-wizard.js"
import { setAvailableModelIds } from "./startup-context.js"

const telemetryConfig = readTelemetryConfig()

let sessionId: string | undefined

process.on("exit", (code) => {
	if (code === 0) {
		const resumeCmd = sessionId ? `kimchi-code --session ${sessionId}` : "kimchi-code --continue"
		console.log(`\nTo resume: ${resumeCmd}`)
	}
})

function sessionIdCaptureExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx: ExtensionContext) => {
		try {
			sessionId = ctx.sessionManager.getSessionId()
		} catch {
			// ignore — exit handler falls back to --continue
		}
	})
}

try {
	const config = loadConfig()

	const needsSkillsSetup = config.skillPaths === undefined
	const needsMigrationCheck = config.migrationState === undefined
	let skillPaths = config.skillPaths ?? []

	if (needsSkillsSetup || needsMigrationCheck) {
		const result = await runSetupWizard({ needsSkillsSetup, needsMigrationCheck })
		if (needsSkillsSetup) {
			skillPaths = result.skillPaths
			writeSkillPaths(skillPaths)
		}
		if (result.migrationState !== undefined) {
			writeMigrationState(result.migrationState)
		}
	}

	// Expose the API key as an env var so pi-mono's models.json can resolve it
	// via the "KIMCHI_API_KEY" apiKey field in the Cast AI provider config.
	process.env.KIMCHI_API_KEY = config.apiKey

	// Ensure models.json exists with Cast AI provider configuration
	const agentDir = process.env.KIMCHI_CODING_AGENT_DIR
	if (!agentDir) {
		throw new Error("KIMCHI_CODING_AGENT_DIR is not set; cli.ts must be entered via entry.ts")
	}
	const modelsJsonPath = resolve(agentDir, "models.json")
	const modelsResult = await updateModelsConfig(modelsJsonPath, config.apiKey)
	if (modelsResult.source === "default") {
		console.error(`Warning: using default models (${modelsResult.error})`)
	}

	// Share the discovered model IDs with extensions before main() runs.
	// prompt-enrichment reads this to build ModelRegistry with live model IDs.
	setAvailableModelIds(modelsResult.models)

	// Suppress Node.js warnings (same as pi-mono's own cli.js)
	process.emitWarning = () => {}

	// Set up HTTP proxy support
	const { EnvHttpProxyAgent, setGlobalDispatcher } = await import("undici")
	setGlobalDispatcher(new EnvHttpProxyAgent())

	// Delegate to pi-mono's CLI main function, injecting the kimchi extension
	const { main } = await import("@mariozechner/pi-coding-agent")
	await main(process.argv.slice(2), {
		extensionFactories: [
			sessionIdCaptureExtension,
			bashCollapseExtension,
			loopGuardExtension,
			mcpAdapterExtension,
			promptEnrichmentExtension(skillPaths),
			promptSummaryExtension,
			subagentExtension,
			tagsExtension,
			telemetryExtension(telemetryConfig),
			webFetchExtension,
			webSearchExtension,
		],
	})
} catch (err) {
	console.error(err instanceof Error ? err.message : String(err))
	process.exit(1)
}
