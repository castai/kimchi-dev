// CLI logic — imported dynamically by entry.ts after PI_PACKAGE_DIR is set.
// All static imports here (extensions, pi-mono) are safe because the env is already configured.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { loadConfig, readTelemetryConfig } from "./config.js"
import bashCollapseExtension from "./extensions/bash-collapse.js"
import uiExtension from "./extensions/ui.js"
import loopGuardExtension from "./extensions/loop-guard.js"
import mcpAdapterExtension from "./extensions/mcp-adapter/index.js"
import promptEnrichmentExtension from "./extensions/orchestration/prompt-enrichment.js"
import promptSummaryExtension from "./extensions/prompt-summary.js"
import subagentExtension from "./extensions/subagent.js"
import tagsExtension from "./extensions/tags.js"
import telemetryExtension from "./extensions/telemetry.js"
import terminalColorsExtension from "./extensions/terminal-colors.js"
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

	// Enable quiet startup to hide [Extensions] listing
	const settingsPath = resolve(agentDir, "settings.json")
	try {
		const settings = JSON.parse(readFileSync(settingsPath, "utf-8"))
		if (!settings.quietStartup || settings.theme !== "kimchi") {
			settings.quietStartup = true
			settings.theme = "kimchi"
			writeFileSync(settingsPath, JSON.stringify(settings, null, "  ") + "\n")
		}
	} catch {
		writeFileSync(settingsPath, JSON.stringify({ quietStartup: true, theme: "kimchi" }, null, "  ") + "\n")
	}

	// Copy kimchi theme into agent dir so initTheme can find it before extensions load
	const themesDir = resolve(agentDir, "themes")
	mkdirSync(themesDir, { recursive: true })
	const kimchiThemeSrc = resolve(dirname(fileURLToPath(import.meta.url)), "../themes/kimchi.json")
	copyFileSync(kimchiThemeSrc, resolve(themesDir, "kimchi.json"))

	// Suppress Node.js warnings (same as pi-mono's own cli.js)
	process.emitWarning = () => {}

	// Set up HTTP proxy support
	const { EnvHttpProxyAgent, setGlobalDispatcher } = await import("undici")
	setGlobalDispatcher(new EnvHttpProxyAgent())

	// Delegate to pi-mono's CLI main function, injecting the kimchi extension
	const { main } = await import("@mariozechner/pi-coding-agent")
	await main(process.argv.slice(2), {
		extensionFactories: [
			terminalColorsExtension,
			bashCollapseExtension,
			loopGuardExtension,
			mcpAdapterExtension,
			promptEnrichmentExtension,
			promptSummaryExtension,
			uiExtension,
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
