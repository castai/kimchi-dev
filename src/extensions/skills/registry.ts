/**
 * Skill registry.
 *
 * Built-ins are embedded into the binary at build time via Bun text imports.
 * Disk skills loaded by pi-mono are merged in by `setDisk`, which replaces any
 * previously-merged disk entries — this keeps the registry consistent across
 * `/reload` cycles when disk skills are added or removed.
 */

import { readFileSync } from "node:fs"
import { parseFrontmatter } from "@mariozechner/pi-coding-agent"
import type { Skill as DiskSkill } from "@mariozechner/pi-coding-agent"
import boundToolOutputSkill from "./resources/bound-tool-output/SKILL.md" with { type: "text" }
import ghCliSkill from "./resources/gh-cli/SKILL.md" with { type: "text" }
import gitHygieneSkill from "./resources/git-hygiene/SKILL.md" with { type: "text" }
import glabCliSkill from "./resources/glab-cli/SKILL.md" with { type: "text" }
import pythonEditSkill from "./resources/python-edit/SKILL.md" with { type: "text" }

interface BuiltinSkill {
	readonly name: string
	readonly description: string
	readonly origin: "builtin"
	/** Embedded body, frontmatter stripped. */
	readonly content: string
}

interface DiskRegisteredSkill {
	readonly name: string
	readonly description: string
	readonly origin: "disk"
	/** Filesystem path; body is read on demand. */
	readonly filePath: string
}

export type RegisteredSkill = BuiltinSkill | DiskRegisteredSkill

interface SkillFrontmatter {
	name?: string
	description?: string
	[key: string]: unknown
}

const BUILTIN_SOURCES: readonly string[] = [
	boundToolOutputSkill,
	ghCliSkill,
	gitHygieneSkill,
	glabCliSkill,
	pythonEditSkill,
]

function parseBuiltin(raw: string): BuiltinSkill {
	const { frontmatter, body } = parseFrontmatter<SkillFrontmatter>(raw)
	const { name, description } = frontmatter
	if (!name || !description) {
		throw new Error(
			`Built-in skill missing required frontmatter (name, description); got: ${JSON.stringify(frontmatter)}`,
		)
	}
	return { name, description, origin: "builtin", content: body }
}

export class SkillRegistry {
	private static readonly builtins: ReadonlyMap<string, RegisteredSkill> = (() => {
		const map = new Map<string, RegisteredSkill>()
		for (const raw of BUILTIN_SOURCES) {
			const skill = parseBuiltin(raw)
			map.set(skill.name, skill)
		}
		return map
	})()

	private skills = new Map<string, RegisteredSkill>(SkillRegistry.builtins)

	/**
	 * Replace all disk-sourced entries with `skills`. Built-ins shadowed by a
	 * prior disk override are restored. Skills with `disableModelInvocation`
	 * are skipped.
	 */
	setDisk(skills: readonly DiskSkill[]): void {
		this.skills = new Map(SkillRegistry.builtins)
		for (const s of skills) {
			if (s.disableModelInvocation) continue
			this.skills.set(s.name, {
				name: s.name,
				description: s.description,
				origin: "disk",
				filePath: s.filePath,
			})
		}
	}

	get(name: string): RegisteredSkill | undefined {
		return this.skills.get(name)
	}

	keys(): IterableIterator<string> {
		return this.skills.keys()
	}

	values(): IterableIterator<RegisteredSkill> {
		return this.skills.values()
	}

	get size(): number {
		return this.skills.size
	}

	readBody(name: string): string {
		const skill = this.skills.get(name)
		if (!skill) throw new Error(`Unknown skill: ${name}`)
		return skill.origin === "builtin" ? skill.content : readFileSync(skill.filePath, "utf-8")
	}
}
