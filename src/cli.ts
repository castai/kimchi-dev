#!/usr/bin/env node

import { homedir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// Set PI_PACKAGE_DIR before any pi-mono imports so piConfig is discovered
// from this project's package.json (which sets name: "kimchi").
// In a bun-compiled binary, import.meta.url points to a virtual filesystem
// ($bunfs), so we skip the override and let pi-mono's built-in detection use
// dirname(process.execPath) instead — package.json is shipped next to the binary.
const isBunBinary =
	import.meta.url.includes("$bunfs") || import.meta.url.includes("~BUN") || import.meta.url.includes("%7EBUN")
if (!isBunBinary) {
	const __dirname = dirname(fileURLToPath(import.meta.url))
	process.env.PI_PACKAGE_DIR = resolve(__dirname, "..")
}

// Set agent config directory before any pi-mono imports.
// pi-mono computes the env var name as APP_NAME.toUpperCase() + "_CODING_AGENT_DIR",
// and APP_NAME is "kimchi" from piConfig, so the env var is "KIMCHI_CODING_AGENT_DIR".
const agentDir = resolve(homedir(), ".config", "kimchi", "harness")
process.env.KIMCHI_CODING_AGENT_DIR = agentDir

process.title = "kimchi"
process.env.PI_SKIP_VERSION_CHECK = "1"

import { loadConfig } from "./config.js"
import { ensureModelsConfig } from "./models.js"

const extensionsDir = isBunBinary
	? resolve(dirname(process.execPath), "extensions")
	: resolve(dirname(fileURLToPath(import.meta.url)), "extensions")

const extensions = [
	resolve(extensionsDir, "subagent.js"),
]

try {
	const config = loadConfig()

	// Expose the API key as an env var so pi-mono's models.json can resolve it
	// via the "KIMCHI_API_KEY" apiKey field in the Cast AI provider config.
	process.env.KIMCHI_API_KEY = config.apiKey

	// Ensure models.json exists with Cast AI provider configuration
	const modelsJsonPath = resolve(agentDir, "models.json")
	ensureModelsConfig(modelsJsonPath)

	// Suppress Node.js warnings (same as pi-mono's own cli.js)
	process.emitWarning = () => {}

	// Set up HTTP proxy support
	const { EnvHttpProxyAgent, setGlobalDispatcher } = await import("undici")
	setGlobalDispatcher(new EnvHttpProxyAgent())

	// Delegate to pi-mono's CLI main function, injecting the kimchi extension
	const { main } = await import("@mariozechner/pi-coding-agent")
	const extensionArgs = extensions.flatMap((p) => ["--extension", p])
	await main([...extensionArgs, ...process.argv.slice(2)])
} catch (err) {
	console.error(err instanceof Error ? err.message : String(err))
	process.exit(1)
}
