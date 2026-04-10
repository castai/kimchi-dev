/**
 * Orchestration prompt enrichment extension.
 *
 * - "input" event: wraps the user prompt with model capabilities so the
 *   orchestrator LLM can make routing decisions.
 * - "before_agent_start" event: replaces Pi's default system prompt with
 *   the orchestrator system prompt, injecting available tool definitions
 *   via {{TOOLS}}.
 *
 * Steering messages are naturally excluded — they go through Agent.steer()
 * and never trigger the "input" event. Extension-sourced messages are
 * passed through unchanged to avoid re-transforming sub-agent output.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { ModelRegistry } from "../orchestration/model-registry/index.js"
import { transformPrompt, buildOrchestratorSystemPrompt } from "../orchestration/prompt-transformer/prompt-transformer.js"

export default function (pi: ExtensionAPI) {
	const registry = new ModelRegistry()

	pi.on("input", async (event) => {
		if (event.source === "extension") {
			return { action: "continue" as const }
		}

		const enrichedPrompt = transformPrompt(event.text, registry)
		return { action: "transform" as const, text: enrichedPrompt, images: event.images }
	})

	pi.on("before_agent_start", async () => {
		const tools = pi.getAllTools()
		const systemPrompt = buildOrchestratorSystemPrompt(tools)
		return { systemPrompt }
	})
}
