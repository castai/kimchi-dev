import { execFileSync, spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { readJson, writeFileAtomic, writeJson } from "../config/json.js"
import type { ConfigScope } from "../config/scope.js"
import { resolveScopePath } from "../config/scope.js"
import { API_KEY_ENV, BASE_URL, PROVIDER_NAME } from "./constants.js"
import { findBinary } from "./detect.js"
import { ALL_MODELS, CODING_MODEL, MAIN_MODEL, SUB_MODEL } from "./models.js"
import { compareSemverGte } from "./opencode.js"
import { register } from "./registry.js"

const OPENCLAW_CONFIG_PATH = "~/.openclaw/openclaw.json"
const OPENCLAW_BATCH_MIN_VERSION = "2026.3.17"
const OPENCLAW_VERSION_REGEX = /OpenClaw\s+(\d{4}\.\d+\.\d+)/

/**
 * Build the OpenClaw provider block — the JSON dropped at
 * `models.providers.kimchi`. Same shape whether we write it via the CLI
 * batch flag or directly into ~/.openclaw/openclaw.json. Pure so we can
 * snapshot-test it without exec or fs.
 *
 * `apiKey` deliberately points at `${KIMCHI_API_KEY}` rather than the raw
 * key so the JSON can be checked into version control without leaking
 * credentials; the daemon resolves the env var from ~/.openclaw/.env at
 * launch time. Mirrors writeOpenClaw* in kimchi-cli internal/tools/openclaw.go.
 */
export function buildOpenClawProviderBlock(): Record<string, unknown> {
	return {
		baseUrl: BASE_URL,
		apiKey: `\${${API_KEY_ENV}}`,
		api: "openai-completions",
		models: ALL_MODELS.map((m) => ({
			id: `${PROVIDER_NAME}/${m.slug}`,
			name: m.displayName,
			reasoning: m.reasoning,
			input: m.inputModalities,
			contextWindow: m.limits.contextWindow,
			maxTokens: m.limits.maxOutputTokens,
		})),
	}
}

/** Map of `<provider>/<slug>` → `{ alias: displayName }` for agents.defaults.models. */
export function buildOpenClawModelsCatalog(): Record<string, unknown> {
	const out: Record<string, unknown> = {}
	for (const m of ALL_MODELS) {
		out[`${PROVIDER_NAME}/${m.slug}`] = { alias: m.displayName }
	}
	return out
}

/** `openclaw --version` SemVer parse; null if missing or unparseable. */
export function getOpenClawVersion(execFile: typeof execFileSync = execFileSync): string | null {
	try {
		const out = execFile("openclaw", ["--version"], { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] })
		const match = out.match(OPENCLAW_VERSION_REGEX)
		return match ? match[1] : null
	} catch {
		return null
	}
}

/**
 * Whether OpenClaw supports the `config set --batch-json` flag (>= 2026.3.17).
 * Crucially, the Go side returns `true` when the version can't be detected —
 * an unknown version is treated as "probably newest", which is the right
 * call when users have just installed via curl. Older versions flip back
 * to sequential `config set` calls.
 */
export function isBatchJsonSupported(version: string | null): boolean {
	if (!version) return true
	return compareSemverGte(version, OPENCLAW_BATCH_MIN_VERSION) || version === OPENCLAW_BATCH_MIN_VERSION
}

/** Detection: ~/.openclaw/ dir present OR `openclaw` on PATH. */
function detectOpenClaw(): boolean {
	const dir = join(homedir(), ".openclaw")
	if (existsSync(dir)) return true
	return findBinary("openclaw") !== undefined
}

/**
 * Write `KIMCHI_API_KEY=<key>` into ~/.openclaw/.env, replacing any prior
 * line for the same key. Mirrors writeOpenClawEnv in openclaw.go. The .env
 * file feeds the OpenClaw daemon, which interpolates `${KIMCHI_API_KEY}`
 * from openclaw.json at runtime.
 */
export function writeOpenClawEnv(apiKey: string): void {
	const envPath = join(homedir(), ".openclaw", ".env")
	let content = ""
	try {
		content = readFileSync(envPath, "utf-8")
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err
	}

	const newLine = `${API_KEY_ENV}=${apiKey}`
	const lines = content === "" ? [] : content.split("\n")
	// Drop a trailing empty line so we don't double up on the newline when
	// we re-join below (Go's joinEnvLines re-adds it).
	if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()

	let found = false
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith(`${API_KEY_ENV}=`)) {
			lines[i] = newLine
			found = true
			break
		}
	}
	if (!found) lines.push(newLine)

	writeFileAtomic(envPath, `${lines.join("\n")}\n`)
}

function isOpenClawGatewayRunning(execFile: typeof execFileSync = execFileSync): boolean {
	try {
		const out = execFile("openclaw", ["gateway", "status"], { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] })
		return out.includes("running")
	} catch {
		return false
	}
}

function runOpenClawCmd(args: string[]): void {
	const result = spawnSync("openclaw", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] })
	if (result.status !== 0) {
		const detail = (result.stderr || result.stdout || "").trim()
		throw new Error(`openclaw ${args.slice(0, 2).join(" ")} failed: ${detail || `exit ${result.status}`}`)
	}
}

/** Configure OpenClaw via the `openclaw config set` CLI (preferred when binary is present). */
async function writeOpenClawViaCLI(apiKey: string): Promise<void> {
	const providerBlock = buildOpenClawProviderBlock()
	const modelsCatalog = buildOpenClawModelsCatalog()
	const fallbacks = [`${PROVIDER_NAME}/${CODING_MODEL.slug}`, `${PROVIDER_NAME}/${SUB_MODEL.slug}`]
	const primary = `${PROVIDER_NAME}/${MAIN_MODEL.slug}`

	if (isBatchJsonSupported(getOpenClawVersion())) {
		const batch = [
			{ path: "models.providers.kimchi", value: providerBlock },
			{ path: "agents.defaults.model.primary", value: primary },
			{ path: "agents.defaults.model.fallbacks", value: fallbacks },
			{ path: "agents.defaults.models", value: modelsCatalog },
		]
		runOpenClawCmd(["config", "set", "--batch-json", JSON.stringify(batch)])
	} else {
		runOpenClawCmd(["config", "set", "models.providers.kimchi", JSON.stringify(providerBlock)])
		runOpenClawCmd(["config", "set", "agents.defaults.model.primary", primary])
		runOpenClawCmd(["config", "set", "agents.defaults.model.fallbacks", JSON.stringify(fallbacks)])
		runOpenClawCmd(["config", "set", "agents.defaults.models", JSON.stringify(modelsCatalog)])
	}

	writeOpenClawEnv(apiKey)

	if (isOpenClawGatewayRunning()) {
		// Pick up the new config without prompting the user to restart.
		runOpenClawCmd(["gateway", "restart"])
	} else {
		// Fresh install — run `openclaw onboard` to scaffold the workspace and
		// install the daemon. --auth-choice skip: we already configured the
		// kimchi provider; choosing custom-api-key would create a duplicate
		// provider that overrides our settings.
		runOpenClawCmd([
			"onboard",
			"--non-interactive",
			"--accept-risk",
			"--auth-choice",
			"skip",
			"--install-daemon",
			"--skip-channels",
			"--skip-skills",
			"--skip-search",
			"--skip-ui",
		])
	}
}

/** Configure OpenClaw by writing JSON directly when no CLI is available. */
async function writeOpenClawDirect(scope: ConfigScope, apiKey: string): Promise<void> {
	const path = resolveScopePath(scope, OPENCLAW_CONFIG_PATH)
	const existing = readJson(path)

	const modelsRoot =
		existing.models && typeof existing.models === "object" && !Array.isArray(existing.models)
			? (existing.models as Record<string, unknown>)
			: {}
	const providers =
		modelsRoot.providers && typeof modelsRoot.providers === "object" && !Array.isArray(modelsRoot.providers)
			? (modelsRoot.providers as Record<string, unknown>)
			: {}
	providers[PROVIDER_NAME] = buildOpenClawProviderBlock()
	modelsRoot.providers = providers
	existing.models = modelsRoot

	const agents =
		existing.agents && typeof existing.agents === "object" && !Array.isArray(existing.agents)
			? (existing.agents as Record<string, unknown>)
			: {}
	const defaults =
		agents.defaults && typeof agents.defaults === "object" && !Array.isArray(agents.defaults)
			? (agents.defaults as Record<string, unknown>)
			: {}
	defaults.model = {
		primary: `${PROVIDER_NAME}/${MAIN_MODEL.slug}`,
		fallbacks: [`${PROVIDER_NAME}/${CODING_MODEL.slug}`, `${PROVIDER_NAME}/${SUB_MODEL.slug}`],
	}
	defaults.models = buildOpenClawModelsCatalog()
	agents.defaults = defaults
	existing.agents = agents

	writeJson(path, existing)
	writeOpenClawEnv(apiKey)
}

async function writeOpenClaw(scope: ConfigScope, apiKey: string): Promise<void> {
	if (!apiKey) {
		throw new Error("API key not configured")
	}
	// CLI route preferred when the binary is on PATH — OpenClaw uses JSON5
	// internally and the CLI's setter is the only path that round-trips
	// cleanly through that parser. Fall back to direct JSON write only when
	// there's no openclaw binary to ask.
	if (findBinary("openclaw")) {
		await writeOpenClawViaCLI(apiKey)
	} else {
		await writeOpenClawDirect(scope, apiKey)
	}
}

register({
	id: "openclaw",
	name: "OpenClaw",
	description: "AI agent framework",
	configPath: OPENCLAW_CONFIG_PATH,
	binaryName: "openclaw",
	installUrl: "https://openclaw.ai/install.sh",
	installArgs: ["--no-prompt", "--no-onboard"],
	isInstalled: detectOpenClaw,
	write: writeOpenClaw,
})
