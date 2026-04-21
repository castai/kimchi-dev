import { extractBashProgram } from "./taxonomy.js"
import type { Rule, RuleBehavior } from "./types.js"

const FILE_TOOLS = new Set(["read", "write", "edit", "ls", "grep", "find"])

export interface Scope {
	toolName: string
	content?: string
	label: string
}

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

// Scope suggestion for "don't ask again this session":
//   bash  → `program[ subcommand]:*` (subcommand dropped when it's a flag)
//   file  → directory glob (`src/cli.ts` → `src/**`)
//   other → tool name only
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
	if (!subcommand || subcommand.startsWith("-")) return program
	return `${program} ${subcommand}`
}

function dirGlob(path: string): string | null {
	if (!path) return null
	const idx = path.lastIndexOf("/")
	if (idx <= 0) return path
	return `${path.slice(0, idx)}/**`
}

function capitalize(s: string): string {
	if (s.startsWith("mcp__")) return s
	if (s.length === 0) return s
	return s[0].toUpperCase() + s.slice(1)
}
