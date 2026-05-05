/**
 * `<available_skills>` block formatter. Lists skill name + description so the
 * model can decide whether to invoke `read_skill` to load full instructions.
 */

import type { SkillRegistry } from "./registry.js"

const PREAMBLE = [
	"The following skills provide MUST-FOLLOW instructions for specific tasks.",
	"",
	"BEFORE editing, writing, or running anything, scan <available_skills> for any skill whose <description> matches what you are about to do. If one matches, you MUST call the `read_skill` tool with that skill's <name> FIRST and follow its instructions for the rest of the turn. Skipping a relevant skill produces incorrect or unsafe output.",
	"",
	'Match by intent, not keywords: a skill saying "Use when writing or modifying any Python source file (.py)" applies to every Write/Edit on a `.py` file, including new file creation.',
	"",
	"Do not load the same skill twice in one turn — once loaded, its instructions remain in effect.",
	"",
	"<available_skills>",
].join("\n")

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

export function formatSkillsForPrompt(registry: SkillRegistry): string {
	if (registry.size === 0) return ""

	const lines = ["\n\n", PREAMBLE]
	for (const skill of registry.values()) {
		lines.push("  <skill>")
		lines.push(`    <name>${escapeXml(skill.name)}</name>`)
		lines.push(`    <description>${escapeXml(skill.description)}</description>`)
		lines.push("  </skill>")
	}
	lines.push("</available_skills>")
	return lines.join("\n")
}
