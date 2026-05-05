/**
 * Skills extension.
 *
 * Owns the full skill surface: bundles a curated set of skills into the kimchi
 * binary, loads disk skills via pi-mono, advertises them via the
 * `<available_skills>` block appended to the system prompt, and registers the
 * `read_skill` tool that returns a skill body on demand.
 */

import { homedir } from "node:os"
import { isAbsolute, normalize, resolve } from "node:path"
import { type ExtensionAPI, getAgentDir, loadSkills } from "@mariozechner/pi-coding-agent"
import { formatSkillsForPrompt } from "./format.js"
import { SkillRegistry } from "./registry.js"
import { registerReadSkillTool } from "./tool.js"

function expandSkillPaths(configuredPaths: readonly string[], cwd: string): string[] {
	const home = homedir()
	const expanded: string[] = []
	for (const p of configuredPaths) {
		if (isAbsolute(p)) {
			expanded.push(normalize(p))
		} else if (p.startsWith("~/")) {
			expanded.push(resolve(home, p.slice(2)))
		} else {
			// Bare relative path: resolve against both $HOME and cwd.
			expanded.push(resolve(home, p), resolve(cwd, p))
		}
	}
	return expanded
}

export default function skillsExtension(skillPaths: readonly string[]) {
	return (pi: ExtensionAPI): void => {
		const registry = new SkillRegistry()

		registerReadSkillTool(pi, registry)

		// Must run AFTER promptEnrichmentExtension's before_agent_start handler so we
		// can append the skills block to the system prompt it built. cli.ts registers
		// promptEnrichmentExtension before this extension to enforce that order.
		pi.on("before_agent_start", async (event, ctx) => {
			const { skills } = loadSkills({
				cwd: ctx.cwd,
				agentDir: getAgentDir(),
				skillPaths: expandSkillPaths(skillPaths, ctx.cwd),
				includeDefaults: false,
			})
			registry.setDisk(skills)

			const block = formatSkillsForPrompt(registry)
			if (!block || !event.systemPrompt) return
			return { systemPrompt: event.systemPrompt + block }
		})
	}
}
