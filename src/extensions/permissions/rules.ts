import micromatch from "micromatch"
import type { Rule, RuleBehavior, RuleSource } from "./types.js"

// ----------------------------------------------------------------------------
// Rule string parsing
// ----------------------------------------------------------------------------

/**
 * Parse a rule string of the form:
 *   ToolName                  → matches any invocation of that tool
 *   ToolName(content)         → content is matched tool-specifically
 *
 * Tool names are case-insensitive (normalized to lowercase) — users may write
 * `Bash(...)` or `bash(...)`. MCP tool names containing `__` are preserved.
 */
export function parseRule(raw: string, behavior: RuleBehavior, source: RuleSource): Rule | null {
	const trimmed = raw.trim()
	if (!trimmed) return null
	const match = trimmed.match(/^([A-Za-z0-9_]+)(?:\(([\s\S]*)\))?\s*$/)
	if (!match) return null
	const toolName = match[1].toLowerCase()
	const content = match[2]
	return { toolName, content, behavior, source }
}

export function parseRules(strings: string[], behavior: RuleBehavior, source: RuleSource): Rule[] {
	return strings.map((s) => parseRule(s, behavior, source)).filter((r): r is Rule => r !== null)
}

export function stringifyRule(rule: Rule): string {
	const name = titleCase(rule.toolName)
	return rule.content === undefined ? name : `${name}(${rule.content})`
}

function titleCase(name: string): string {
	if (name.startsWith("mcp__")) return name
	if (name.length === 0) return name
	return name[0].toUpperCase() + name.slice(1)
}

// ----------------------------------------------------------------------------
// Rule matching
// ----------------------------------------------------------------------------

const BASH_TOOL = "bash"
const FILE_TOOLS = new Set(["read", "write", "edit", "ls", "grep", "find"])

/**
 * Check whether a rule matches a tool call. Content-less rules match any
 * invocation of the tool. Content rules use per-tool matching semantics:
 *
 *   bash  — legacy prefix (`prefix:*`), wildcard (`*`), exact
 *   read/write/edit/ls/grep/find — path glob via micromatch
 *   other — exact string match against a stringified input
 */
export function matchRule(rule: Rule, toolName: string, input: Record<string, unknown>): boolean {
	if (rule.toolName !== toolName.toLowerCase()) return false
	if (rule.content === undefined) return true

	if (toolName === BASH_TOOL) {
		const command = typeof input.command === "string" ? input.command : ""
		return matchBashRule(rule.content, command)
	}

	if (FILE_TOOLS.has(toolName)) {
		const path = typeof input.path === "string" ? input.path : ""
		return matchPathRule(rule.content, path)
	}

	// Fallback: exact match against JSON-stringified input.
	return rule.content === stableStringify(input)
}

// ----------------------------------------------------------------------------
// Bash matching: exact / legacy-prefix / wildcard
// ----------------------------------------------------------------------------

/**
 * Match a bash command against a rule content string.
 *
 * Semantics:
 *   "prefix:*"      — legacy prefix; matches if command starts with "prefix"
 *                     (followed by end-of-string or whitespace)
 *   contains "*"    — wildcard match; `*` = `.*`, trailing ` *` makes
 *                     arguments optional (so `git *` matches bare `git`)
 *                     Escape a literal `*` with `\*`.
 *   otherwise       — exact match after trim
 *
 * Case-sensitive. Matches the full command string (anchored).
 */
export function matchBashRule(pattern: string, command: string): boolean {
	const pat = pattern.trim()
	const cmd = command.trim()

	// Legacy prefix syntax: "prefix:*"
	const prefixMatch = pat.match(/^(.+):\*$/)
	if (prefixMatch) {
		const prefix = prefixMatch[1]
		if (cmd === prefix) return true
		return cmd.startsWith(`${prefix} `) || cmd.startsWith(`${prefix}\t`)
	}

	if (!hasUnescapedStar(pat) && !hasEscapedSpecial(pat)) {
		return cmd === pat
	}

	return regexFromWildcard(pat).test(cmd)
}

function hasEscapedSpecial(pattern: string): boolean {
	return /\\[*\\]/.test(pattern)
}

function hasUnescapedStar(pattern: string): boolean {
	for (let i = 0; i < pattern.length; i++) {
		if (pattern[i] !== "*") continue
		let backslashes = 0
		let j = i - 1
		while (j >= 0 && pattern[j] === "\\") {
			backslashes++
			j--
		}
		if (backslashes % 2 === 0) return true
	}
	return false
}

const ESC_STAR = "\u0000ESC_STAR\u0000"
const ESC_BACKSLASH = "\u0000ESC_BS\u0000"

function regexFromWildcard(pattern: string): RegExp {
	let processed = ""
	let i = 0
	while (i < pattern.length) {
		const ch = pattern[i]
		if (ch === "\\" && i + 1 < pattern.length) {
			const next = pattern[i + 1]
			if (next === "*") {
				processed += ESC_STAR
				i += 2
				continue
			}
			if (next === "\\") {
				processed += ESC_BACKSLASH
				i += 2
				continue
			}
		}
		processed += ch
		i++
	}

	let regex = processed.replace(/[.+?^${}()|[\]\\'"]/g, "\\$&").replace(/\*/g, ".*")
	regex = regex.split(ESC_STAR).join("\\*").split(ESC_BACKSLASH).join("\\\\")

	// Trailing ` *` → make args optional when it's the only wildcard, so
	// `git *` matches both `git` and `git status`.
	const unescapedStarCount = (processed.match(/\*/g) ?? []).length
	if (regex.endsWith(" .*") && unescapedStarCount === 1) {
		regex = `${regex.slice(0, -3)}( .*)?`
	}

	return new RegExp(`^${regex}$`, "s")
}

// ----------------------------------------------------------------------------
// Path matching for file tools
// ----------------------------------------------------------------------------

export function matchPathRule(pattern: string, path: string): boolean {
	if (!path) return false
	// Support both literal path and glob. micromatch.isMatch handles both.
	return micromatch.isMatch(path, pattern, { dot: true, nocase: false })
}

// ----------------------------------------------------------------------------
// Rule-set evaluation
// ----------------------------------------------------------------------------

export type MatchedRule = {
	rule: Rule
}

export type RuleMatch = { decision: "allow"; rule: Rule } | { decision: "deny"; rule: Rule } | { decision: "no-match" }

/**
 * Evaluate a tool call against a set of rules.
 *
 * Precedence order (highest first): session > cli > local > project > user.
 * Within a single source, deny rules beat allow rules.
 * First match in precedence order wins; fall through if no source matches.
 */
export function evaluateRules(rules: Rule[], toolName: string, input: Record<string, unknown>): RuleMatch {
	const bySource = groupBySource(rules)
	const order: RuleSource[] = ["session", "cli", "local", "project", "user"]

	for (const source of order) {
		const group = bySource[source]
		if (!group) continue

		// Deny first within a source.
		const deny = group.find((r) => r.behavior === "deny" && matchRule(r, toolName, input))
		if (deny) return { decision: "deny", rule: deny }

		const allow = group.find((r) => r.behavior === "allow" && matchRule(r, toolName, input))
		if (allow) return { decision: "allow", rule: allow }
	}
	return { decision: "no-match" }
}

function groupBySource(rules: Rule[]): Partial<Record<RuleSource, Rule[]>> {
	const out: Partial<Record<RuleSource, Rule[]>> = {}
	for (const rule of rules) {
		const key = rule.source
		let bucket = out[key]
		if (!bucket) {
			bucket = []
			out[key] = bucket
		}
		bucket.push(rule)
	}
	return out
}

function stableStringify(value: unknown): string {
	if (value === null || typeof value !== "object") return JSON.stringify(value)
	if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`
	const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
	return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`
}
