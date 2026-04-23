// CLI logic — imported dynamically by entry.ts after PI_PACKAGE_DIR is set.
// All static imports here (extensions, pi-mono) are safe because the env is already configured.

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"
import { DEFAULT_SKILL_PATHS, loadConfig, readTelemetryConfig, writeMigrationState, writeSkillPaths } from "./config.js"
import { isBunBinary } from "./env.js"
import bashCollapseExtension from "./extensions/bash-collapse.js"
import loopGuardExtension from "./extensions/loop-guard.js"
import mcpAdapterExtension from "./extensions/mcp-adapter/index.js"
import shutdownMarkerExtension from "./extensions/shutdown-marker.js"
import promptEnrichmentExtension from "./extensions/orchestration/prompt-enrichment.js"
import permissionsExtension from "./extensions/permissions/index.js"
import { reserveShiftTabForPermissions } from "./extensions/permissions/keybindings.js"
import promptSummaryExtension from "./extensions/prompt-summary.js"
import subagentExtension from "./extensions/subagent.js"
import tagsExtension from "./extensions/tags.js"
import telemetryExtension from "./extensions/telemetry.js"
import terminalColorsExtension from "./extensions/terminal-colors.js"
import toolRendererExtension from "./extensions/tool-renderer.js"
import uiExtension from "./extensions/ui.js"
import userMessagePatchExtension from "./extensions/user-message-patch.js"
import webFetchExtension from "./extensions/web-fetch/index.js"
import webSearchExtension from "./extensions/web-search/index.js"
import { updateModelsConfig } from "./models.js"
import { runSetupWizard } from "./setup-wizard.js"
import { setAvailableModelIds } from "./startup-context.js"

const telemetryConfig = readTelemetryConfig()

let sessionId: string | undefined
// ACP mode runs JSON-RPC over stdio; the "To resume:" print (even remapped to
// stderr via console.log = console.error inside runAcpMode) is noise in IDE
// logs and not actionable — the IDE owns session continuation. Decide once,
// at module load, before anything else runs.
const acpMode = isAcpMode(process.argv.slice(2))

process.on("exit", (code) => {
	if (code === 0 && !acpMode) {
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

// Intentionally minimal pre-dispatch sniff: we need to know whether to enter
// ACP stdio mode BEFORE pi-mono's main() takes over (which would otherwise
// print a banner, wire up the TUI, and corrupt the JSON-RPC stream). The
// canonical --mode parser lives in pi-mono; this only looks for the one value
// that forces a different entrypoint. Don't extend this sniff for new flags —
// thread them through pi-mono's parser instead.
function isAcpMode(args: string[]): boolean {
	for (let i = 0; i < args.length; i++) {
		const a = args[i]
		if (a === "--mode" && args[i + 1] === "acp") return true
		if (a === "--mode=acp") return true
	}
	return false
}

try {
	const config = loadConfig()

	const needsSkillsSetup = config.skillPaths === undefined
	const needsMigrationCheck = config.migrationState === undefined
	let skillPaths = config.skillPaths ?? []

	if (needsSkillsSetup || needsMigrationCheck) {
		if (!process.stdin.isTTY) {
			if (needsSkillsSetup) {
				skillPaths = DEFAULT_SKILL_PATHS
				writeSkillPaths(skillPaths)
			}
			writeMigrationState("done")
		} else {
			const result = await runSetupWizard({ needsSkillsSetup, needsMigrationCheck })
			if (needsSkillsSetup) {
				skillPaths = result.skillPaths
				writeSkillPaths(skillPaths)
			}
			if (result.migrationState !== undefined) {
				writeMigrationState(result.migrationState)
			}
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

	// Must run before main() so the keybindings file is loaded with the
	// override in place.
	reserveShiftTabForPermissions(agentDir)

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
			writeFileSync(settingsPath, `${JSON.stringify(settings, null, "  ")}\n`)
		}
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === "ENOENT") {
			writeFileSync(settingsPath, `${JSON.stringify({ quietStartup: true, theme: "kimchi" }, null, "  ")}\n`)
		} else {
			console.error(`Warning: could not parse ${settingsPath}, leaving unchanged`)
		}
	}

	// Copy kimchi theme into agent dir so initTheme can find it before extensions load
	const themesDir = resolve(agentDir, "themes")
	mkdirSync(themesDir, { recursive: true })
	const kimchiThemeSrc = isBunBinary
		? resolve(process.env.PI_PACKAGE_DIR ?? "", "theme", "kimchi.json")
		: resolve(dirname(fileURLToPath(import.meta.url)), "../themes/kimchi.json")
	copyFileSync(kimchiThemeSrc, resolve(themesDir, "kimchi.json"))

	// Suppress Node.js warnings (same as pi-mono's own cli.js)
	process.emitWarning = () => {}

	// Set up HTTP proxy support
	const { EnvHttpProxyAgent, setGlobalDispatcher } = await import("undici")
	setGlobalDispatcher(new EnvHttpProxyAgent())

	const extensionFactories = [
		sessionIdCaptureExtension,
		shutdownMarkerExtension,
		userMessagePatchExtension,
		terminalColorsExtension,
		bashCollapseExtension,
		loopGuardExtension,
		mcpAdapterExtension,
		permissionsExtension,
		promptEnrichmentExtension(skillPaths),
		promptSummaryExtension,
		uiExtension,
		subagentExtension,
		tagsExtension,
		telemetryExtension(telemetryConfig),
		toolRendererExtension,
		webFetchExtension,
		webSearchExtension,
	]

	const rawArgs = process.argv.slice(2)
	if (acpMode) {
		const { runAcpMode } = await import("./modes/acp/server.js")
		await runAcpMode({ extensionFactories, agentDir })
	} else {
		// Delegate to pi-mono's CLI main function, injecting the kimchi extension
		const { main } = await import("@mariozechner/pi-coding-agent")
		await main(rawArgs, { extensionFactories })
	}
} catch (err) {
	console.error(err instanceof Error ? err.message : String(err))
	process.exit(1)
}
