#!/usr/bin/env node

import { homedir } from "node:os"
import { resolve } from "node:path"
import { resolveAuxiliaryFilesDir } from "./auxiliary-files/resolver.js"
import { validateAuxiliaryFiles } from "./auxiliary-files/validator.js"

// Resolve and validate auxiliary files before any pi-mono imports.
// Skip if PI_PACKAGE_DIR is already set (e.g., by development preload).
if (!process.env.PI_PACKAGE_DIR) {
	const auxiliaryDir = resolveAuxiliaryFilesDir(process.env, homedir())
	try {
		validateAuxiliaryFiles(auxiliaryDir)
	} catch (err) {
		console.error((err as Error).message)
		process.exit(1)
	}
	process.env.PI_PACKAGE_DIR = auxiliaryDir
}

// Set agent config directory before any pi-mono imports.
// pi-mono computes the env var name as APP_NAME.toUpperCase() + "_CODING_AGENT_DIR",
// and APP_NAME is "kimchi" from piConfig, so the env var is "KIMCHI_CODING_AGENT_DIR".
const agentDir = resolve(homedir(), ".config", "kimchi", "harness")
process.env.KIMCHI_CODING_AGENT_DIR = agentDir

process.title = "kimchi"
process.env.PI_SKIP_VERSION_CHECK = "1"

import { loadConfig, readTelemetryConfig } from "./config.js"
import bashCollapseExtension from "./extensions/bash-collapse.js"
import mcpAdapterExtension from "./extensions/mcp-adapter/index.js"
import promptEnrichmentExtension from "./extensions/orchestration/prompt-enrichment.js"
import promptSummaryExtension from "./extensions/prompt-summary.js"
import subagentExtension from "./extensions/subagent.js"
import tagsExtension from "./extensions/tags.js"
import telemetryExtension from "./extensions/telemetry.js"
import webFetchExtension from "./extensions/web-fetch/index.js"
import webSearchExtension from "./extensions/web-search/index.js"
import { updateModelsConfig } from "./models.js"
import { setAvailableModelIds } from "./startup-context.js"

const telemetryConfig = readTelemetryConfig()

try {
	const config = loadConfig()

	// Expose the API key as an env var so pi-mono's models.json can resolve it
	// via the "KIMCHI_API_KEY" apiKey field in the Cast AI provider config.
	process.env.KIMCHI_API_KEY = config.apiKey

	// Ensure models.json exists with Cast AI provider configuration
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
			bashCollapseExtension,
			mcpAdapterExtension,
			promptEnrichmentExtension,
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
