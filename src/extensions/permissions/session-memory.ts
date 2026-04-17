import { extractBashProgram } from "./taxonomy.js"
import type { Rule, RuleBehavior } from "./types.js"

const FILE_TOOLS = new Set(["read", "write", "edit", "ls", "grep", "find"])

export interface Scope {
	toolName: string
	content?: string
	label: string
}

/**
 * Session rule store. In-memory only; cleared when the process exits.
 * Session rules have the highest precedence (see evaluateRules).
 */
export class SessionMemory {
	private rules: Rule[] = []

	add(rule: Rule): void {
		this.rules.push(rule)
	}

	addMany(rules: Rule[]): void {
		this.rules.push(...rules)
	}

	all(): Rule[] {
		return [...this.rules]
	}

	clear(): void {
		this.rules = []
	}

	removeByScope(toolName: string, content: string | undefined, behavior: RuleBehavior): number {
		const before = this.rules.length
		this.rules = this.rules.filter(
			(r) => !(r.toolName === toolName && r.content === content && r.behavior === behavior),
		)
		return before - this.rules.length
	}
}

/**
 * Compute a per-tool scope suggestion for "don't ask again this session".
 *
 * - bash: prefix up to the first argument starting with `-`, or first two
 *   tokens if none; offered as `Bash(prefix:*)`.
 * - file tools: directory glob (`Write(src/**)` when the path is `src/cli.ts`).
 * - other tools: just the tool name with no content.
 */
export function suggestScope(toolName: string, input: Record<string, unknown>): Scope {
	const lower = toolName.toLowerCase()

	if (lower === "bash") {
		const command = typeof input.command === "string" ? input.command : ""
		const prefix = bashPrefixScope(command)
		if (prefix) {
			return { toolName: lower, content: `${prefix}:*`, label: `Bash(${prefix}:*)` }
		}
		return { toolName: lower, content: undefined, label: "Bash" }
	}

	if (FILE_TOOLS.has(lower)) {
		const path = typeof input.path === "string" ? input.path : ""
		const glob = dirGlob(path)
		if (glob) {
			const cap = capitalize(lower)
			return { toolName: lower, content: glob, label: `${cap}(${glob})` }
		}
		return { toolName: lower, content: undefined, label: capitalize(lower) }
	}

	return { toolName: lower, content: undefined, label: capitalize(lower) }
}

function bashPrefixScope(command: string): string | null {
	const trimmed = command.trim()
	if (!trimmed) return null

	const { program, subcommand } = extractBashProgram(trimmed)
	if (!program) return null

	// If the second token is a flag or missing, prefix is just the program.
	if (!subcommand || subcommand.startsWith("-")) {
		return program
	}

	// Two-token scope (e.g. `git status`, `npm test`).
	return `${program} ${subcommand}`
}

function dirGlob(path: string): string | null {
	if (!path) return null
	const idx = path.lastIndexOf("/")
	if (idx <= 0) return path // bare filename or root
	return `${path.slice(0, idx)}/**`
}

function capitalize(s: string): string {
	if (s.startsWith("mcp__")) return s
	if (s.length === 0) return s
	return s[0].toUpperCase() + s.slice(1)
}
