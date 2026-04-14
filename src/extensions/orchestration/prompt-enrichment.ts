/**
 * Orchestration prompt enrichment extension.
 *
 * Behavior depends on whether this process is the orchestrator or a subagent
 * (detected via the KIMCHI_SUBAGENT env var set during subagent spawning).
 *
 * Orchestrator mode:
 * - "input": wraps the user prompt with model capabilities for routing decisions.
 * - "before_agent_start": replaces Pi's system prompt with the orchestrator
 *   system prompt, injecting available tool definitions via {{TOOLS}}.
 *
 * Subagent mode:
 * - "input": passes through unchanged (no model capability injection).
 * - "before_agent_start": replaces Pi's system prompt with the subagent
 *   system prompt. Filters out the subagent tool to prevent infinite loops.
 *
 * Steering messages are naturally excluded — they go through Agent.steer()
 * and never trigger the "input" event.
 */

import type { ImageContent, TextContent } from "@mariozechner/pi-ai"
import { type ExtensionAPI, type Skill, loadSkills } from "@mariozechner/pi-coding-agent"
import { getAvailableModelIds } from "../../startup-context.js"
import { ModelRegistry } from "./model-registry/index.js"
import { type ContextFile, loadProjectContextFiles } from "./prompt-transformer/context-files.js"
import {
	type CurrentModelInfo,
	buildOrchestratorSystemPrompt,
	buildSubagentSystemPrompt,
	isSubagent,
	transformPrompt,
} from "./prompt-transformer/prompt-transformer.js"

export default function (pi: ExtensionAPI) {
	const subagentMode = isSubagent()

	pi.registerFlag("debug-prompts", {
		type: "boolean",
		description: "Print enriched prompts in the UI (default: hidden)",
		default: false,
	})

	// For sub agents we don't want to transform the prompt sent from parent with model capabilities
	if (!subagentMode) {
		const registry = new ModelRegistry(getAvailableModelIds())

		// Emit startup warnings for drift between the API model list and the
		// capability knowledge-base. These surface in the terminal so the user
		// knows when to add a capability entry or clean up a stale one.
		for (const warning of registry.warnings) {
			console.error(`Warning [model-registry]: ${warning.message}`)
		}

		pi.on("input", async (event, ctx) => {
			if (event.source === "extension") {
				return { action: "continue" as const }
			}

			const currentModel: CurrentModelInfo | undefined = ctx.model
				? { id: ctx.model.id, name: ctx.model.name }
				: undefined

			const enrichedPrompt = transformPrompt(event.text, registry, currentModel)

			const debugPrompts = pi.getFlag("debug-prompts") === true
			if (debugPrompts) {
				return { action: "transform" as const, text: enrichedPrompt, images: event.images }
			}

			pi.sendMessage(
				{ customType: "enriched-prompt", content: [{ type: "text", text: enrichedPrompt }], display: false },
				{ deliverAs: "nextTurn" },
			)
			const userContent: (TextContent | ImageContent)[] = [{ type: "text", text: event.text }]
			if (event.images) userContent.push(...event.images)
			pi.sendUserMessage(userContent)

			return { action: "handled" as const }
		})
	}

	let cachedContextFiles: ContextFile[] | undefined
	let cachedSkills: Skill[] | undefined

	pi.on("before_agent_start", async (_event, ctx) => {
		const tools = pi.getAllTools()
		cachedContextFiles ??= loadProjectContextFiles(ctx.cwd)
		cachedSkills ??= loadSkills({ cwd: ctx.cwd }).skills

		if (subagentMode) {
			// Filter the subagent tool out of the active tool set to prevent
			// the subagent from spawning further subagents.
			const activeTools = pi.getActiveTools().filter((name) => name !== "subagent")
			pi.setActiveTools(activeTools)

			const systemPrompt = buildSubagentSystemPrompt(tools, cachedContextFiles, cachedSkills)
			return { systemPrompt }
		}

		const systemPrompt = buildOrchestratorSystemPrompt(tools, cachedContextFiles, cachedSkills)
		return { systemPrompt }
	})
}
