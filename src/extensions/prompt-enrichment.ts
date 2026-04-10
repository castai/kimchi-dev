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

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { ModelRegistry } from "../orchestration/model-registry/index.js"
import {
	type CurrentModelInfo,
	buildOrchestratorSystemPrompt,
	buildSubagentSystemPrompt,
	isSubagent,
	transformPrompt,
} from "../orchestration/prompt-transformer/prompt-transformer.js"

export default function (pi: ExtensionAPI) {
	const subagentMode = isSubagent()

	// For sub agents we don't want to transform the prompt sent from parent with model capabilities
	if (!subagentMode) {
		const registry = new ModelRegistry()

		pi.on("input", async (event, ctx) => {
			if (event.source === "extension") {
				return { action: "continue" as const }
			}

			const currentModel: CurrentModelInfo | undefined = ctx.model
				? { id: ctx.model.id, name: ctx.model.name }
				: undefined

			const enrichedPrompt = transformPrompt(event.text, registry, currentModel)
			return { action: "transform" as const, text: enrichedPrompt, images: event.images }
		})
	}

	pi.on("before_agent_start", async () => {
		const tools = pi.getAllTools()

		if (subagentMode) {
			// Filter the subagent tool out of the active tool set to prevent
			// the subagent from spawning further subagents.
			const activeTools = pi.getActiveTools().filter((name) => name !== "subagent")
			pi.setActiveTools(activeTools)

			const systemPrompt = buildSubagentSystemPrompt(tools)
			return { systemPrompt }
		}

		const systemPrompt = buildOrchestratorSystemPrompt(tools)
		return { systemPrompt }
	})
}
