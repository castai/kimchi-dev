/**
 * `read_skill` tool — returns the body of a skill advertised in the system
 * prompt's `<available_skills>` block. Built-ins are served from the embedded
 * registry; disk skills are read from their `filePath`.
 *
 * The `read_` prefix is intentional: kimchi's permission classifier
 * (`extensions/permissions/taxonomy.ts`) matches names starting with
 * `read|get|list|...` as read-only, so this tool runs without a permission
 * prompt — same treatment the built-in `read` tool gets.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Type } from "typebox"
import type { SkillRegistry } from "./registry.js"

export function registerReadSkillTool(pi: ExtensionAPI, registry: SkillRegistry): void {
	pi.registerTool({
		name: "read_skill",
		label: "Read Skill",
		description:
			"Loads the full instructions for a skill listed in the <available_skills> block. " +
			"Call this BEFORE acting on any task whose intent matches a skill's <description>.",
		parameters: Type.Object({
			name: Type.String({
				description: "Name of the skill to load (the <name> value from <available_skills>).",
			}),
		}),

		async execute(_toolCallId, params) {
			const { name } = params
			const skill = registry.get(name)
			if (!skill) {
				throw new Error(`Unknown skill: ${name}. Available: ${[...registry.keys()].join(", ")}`)
			}
			return {
				content: [{ type: "text", text: registry.readBody(name) }],
				details: {},
			}
		},
	})
}
