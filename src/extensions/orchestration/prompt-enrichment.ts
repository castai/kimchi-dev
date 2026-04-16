/**
 * Orchestration prompt enrichment extension.
 *
 * Behavior depends on whether this process is the main model or a subagent
 * (detected via the KIMCHI_SUBAGENT env var set during subagent spawning).
 *
 * Main model mode:
 * - "input": wraps the user prompt with the current model's own capabilities
 *   and the available subagent models so the model can self-classify the task
 *   and decide which steps to execute itself vs. delegate.
 * - "before_agent_start": injects the self-classification system prompt with
 *   full tool access (read, write, edit, bash, subagent).
 *
 * Subagent mode:
 * - "input": passes through unchanged.
 * - "before_agent_start": injects the pure worker system prompt. Filters out
 *   the subagent tool to prevent infinite delegation chains.
 *
 * Steering messages are excluded — when the agent is streaming, the handler
 * returns "continue" so the message passes through unchanged.
 */

import type { ImageContent, TextContent } from "@mariozechner/pi-ai"
import { type ExtensionAPI, type Skill, loadSkills } from "@mariozechner/pi-coding-agent"
import { ANSI, fg } from "../../ansi.js"
import { getAvailableModelIds } from "../../startup-context.js"
import { ModelRegistry } from "./model-registry/index.js"
import { type ContextFile, loadProjectContextFiles } from "./prompt-transformer/context-files.js"
import {
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

		// Announce newly available API models that have no capability entry yet.
		for (const warning of registry.warnings) {
			console.log(
				`${fg(ANSI.accent, ` New model available: "kimchi-dev/${warning.modelId}"`)}\n${fg(ANSI.dim, " Update the app or add the new model to model capabilities config to unlock orchestration support.")}`,
			)
		}

		pi.on("input", async (event, ctx) => {
			if (event.source === "extension") {
				return { action: "continue" as const }
			}

			// Steering and follow-up messages arrive while the agent is streaming
			// (ctx.isIdle() === false, i.e. session.isStreaming === true).
			// Skip enrichment and let them pass through unchanged
			if (!ctx.isIdle()) {
				return { action: "continue" as const }
			}

			const currentModel = ctx.model ? { id: ctx.model.id, name: ctx.model.id } : undefined
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

		const orchestratorTools = pi.getActiveTools().filter(
			(name) => name !== "write" && name !== "edit" && name !== "bash" && name !== "read",
		)
		pi.setActiveTools(orchestratorTools)

		const systemPrompt = buildOrchestratorSystemPrompt(tools, cachedContextFiles, cachedSkills)
		return { systemPrompt }
	})
}
