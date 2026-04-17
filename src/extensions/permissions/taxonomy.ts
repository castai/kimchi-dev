import type { ToolCategory } from "./types.js"

const STATIC_CATEGORIES: Record<string, ToolCategory> = {
	read: "readOnly",
	grep: "readOnly",
	find: "readOnly",
	ls: "readOnly",
	edit: "write",
	write: "write",
	bash: "execute",
	web_search: "readOnly",
	web_fetch: "readOnly",
	questionnaire: "readOnly",
	set_phase: "readOnly",
}

const READ_ONLY_NAME_HINT = /^(read|get|list|search|query|describe|find|grep|ls|loki_|view|show)/i

export function classifyTool(toolName: string): ToolCategory {
	const lower = toolName.toLowerCase()
	if (lower in STATIC_CATEGORIES) return STATIC_CATEGORIES[lower]

	if (toolName.startsWith("mcp__")) {
		const last = toolName.split("__").pop() ?? ""
		if (READ_ONLY_NAME_HINT.test(last)) return "readOnly"
		return "unknown"
	}

	if (READ_ONLY_NAME_HINT.test(toolName)) return "readOnly"
	return "unknown"
}

export function isReadOnlyTool(toolName: string): boolean {
	return classifyTool(toolName) === "readOnly"
}

// Read-only bash programs: commands that only inspect state.
// Adapted in spirit from common POSIX read-only utilities — written fresh here.
const READ_ONLY_PROGRAMS = new Set([
	"cat",
	"head",
	"tail",
	"less",
	"more",
	"ls",
	"pwd",
	"echo",
	"printf",
	"wc",
	"sort",
	"uniq",
	"diff",
	"file",
	"stat",
	"du",
	"df",
	"tree",
	"which",
	"whereis",
	"type",
	"env",
	"printenv",
	"uname",
	"whoami",
	"id",
	"date",
	"cal",
	"uptime",
	"ps",
	"top",
	"htop",
	"free",
	"grep",
	"egrep",
	"fgrep",
	"rg",
	"find",
	"fd",
	"jq",
	"yq",
	"awk",
	"bat",
	"eza",
	"column",
	"basename",
	"dirname",
	"realpath",
	"tr",
	"cut",
	"tee",
	"node",
	"python",
	"python3",
	"ruby",
	"perl",
	"go",
])

// Second-arg allowlist for programs where only some subcommands are read-only.
const READ_ONLY_SUBCOMMANDS: Record<string, Set<string>> = {
	git: new Set([
		"status",
		"log",
		"diff",
		"show",
		"branch",
		"remote",
		"ls-files",
		"ls-tree",
		"ls-remote",
		"rev-parse",
		"describe",
		"blame",
		"config",
		"tag",
		"stash",
	]),
	npm: new Set(["list", "ls", "view", "info", "search", "outdated", "audit", "--version", "-v"]),
	yarn: new Set(["list", "info", "why", "audit", "--version", "-v"]),
	pnpm: new Set(["list", "ls", "view", "info", "outdated", "audit", "--version", "-v"]),
	pip: new Set(["list", "show", "search", "freeze", "--version"]),
	cargo: new Set(["tree", "search", "--version"]),
	docker: new Set(["ps", "images", "logs", "inspect", "version", "info"]),
	kubectl: new Set(["get", "describe", "logs", "top", "version", "config"]),
}

// Always-blocked bash patterns regardless of other checks.
const HARD_BLOCK = [
	/\bsudo\b/,
	/\bsu\b\s/,
	/\brm\s+-[rf]*\s*\/(\s|$)/,
	/\bshutdown\b/,
	/\breboot\b/,
	/\bmkfs\b/,
	/\bdd\s+.*of=\/dev\//,
	/:\(\)\s*\{/, // fork-bomb
]

export function isHardBlockedBash(command: string): boolean {
	return HARD_BLOCK.some((p) => p.test(command))
}

export function extractBashProgram(command: string): { program: string; subcommand: string | undefined } {
	// Strip leading env-var assignments: FOO=bar BAZ=qux actual-command
	const trimmed = command.replace(/^(?:\s*[A-Za-z_][\w]*=[^\s]*\s+)+/, "").trimStart()
	const tokens = trimmed.split(/\s+/).filter(Boolean)
	const program = tokens[0] ?? ""
	const subcommand = tokens[1]
	return { program, subcommand }
}

export function isReadOnlyBashCommand(command: string): boolean {
	if (isHardBlockedBash(command)) return false
	if (hasShellSideEffects(command)) return false

	const { program, subcommand } = extractBashProgram(command)
	if (!program) return false

	if (READ_ONLY_SUBCOMMANDS[program]) {
		if (!subcommand) return false
		return READ_ONLY_SUBCOMMANDS[program].has(subcommand)
	}

	return READ_ONLY_PROGRAMS.has(program)
}

// Detect shell-level side effects (output redirection, pipelines to writers).
// This is a conservative best-effort — the goal is to err on the side of "not read-only".
function hasShellSideEffects(command: string): boolean {
	// Output redirection: > or >> but not inside quotes (best effort).
	// Allow /dev/null and /dev/stderr redirects since they're not persistent.
	const redirected = command.replace(/\s*2?>&?\s*(?:\/dev\/(?:null|stderr|stdout))\s*/g, " ")
	if (/(^|[^<>&])>>?(?!\s*&)/.test(redirected)) {
		return true
	}
	// Writes via tee, sponge, etc.
	if (/\|\s*(tee|sponge|pv)\b/.test(command)) return true
	// Background / disown
	if (/\s&\s*$/.test(command)) return true
	return false
}
