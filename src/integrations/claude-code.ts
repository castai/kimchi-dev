import { mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { readJson, writeJson } from "../config/json.js"
import { resolveScopePath } from "../config/scope.js"
import type { ConfigScope } from "../config/scope.js"
import { ANTHROPIC_BASE_URL } from "./constants.js"
import { detectBinaryFactory } from "./detect.js"
import { register } from "./registry.js"
import type { ToolDefinition } from "./types.js"

const CLAUDE_CONFIG_PATH = "~/.claude/settings.json"

/**
 * Build the env-var map Claude Code reads from `~/.claude/settings.json`'s
 * `env` block. Setting ANTHROPIC_API_KEY to "" is important — Claude Code
 * picks the first non-empty of (ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN)
 * and we want it to use AUTH_TOKEN with our key.
 */
export function claudeCodeEnv(apiKey: string, baseUrl: string = ANTHROPIC_BASE_URL): Record<string, string> {
	return {
		ANTHROPIC_BASE_URL: baseUrl,
		ANTHROPIC_API_KEY: "",
		ANTHROPIC_AUTH_TOKEN: apiKey,
		CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS: "1",
	}
}

/**
 * Merge the Claude Code env-var pairs into an existing settings.json `env`
 * object in-place, used both by the writer below and by callers that want
 * to compute the env block without writing to disk (e.g. the inject-mode
 * launcher in `kimchi claude`).
 */
export function injectClaudeCodeEnv(env: Record<string, unknown>, baseUrl: string, apiKey: string): void {
	const pairs = claudeCodeEnv(apiKey, baseUrl)
	for (const [k, v] of Object.entries(pairs)) {
		env[k] = v
	}
}

async function writeClaudeCode(scope: ConfigScope, apiKey: string): Promise<void> {
	if (!apiKey) {
		throw new Error("API key not configured")
	}

	const path = resolveScopePath(scope, CLAUDE_CONFIG_PATH)
	mkdirSync(dirname(path), { recursive: true })

	const existing = readJson(path)
	const envBlock =
		existing.env && typeof existing.env === "object" && !Array.isArray(existing.env)
			? (existing.env as Record<string, unknown>)
			: {}
	injectClaudeCodeEnv(envBlock, ANTHROPIC_BASE_URL, apiKey)
	existing.env = envBlock

	writeJson(path, existing)
}

register({
	id: "claudecode",
	name: "Claude Code",
	description: "Anthropic's Claude Code CLI",
	configPath: CLAUDE_CONFIG_PATH,
	binaryName: "claude",
	isInstalled: detectBinaryFactory("claude"),
	write: writeClaudeCode,
})
