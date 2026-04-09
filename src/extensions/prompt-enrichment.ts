/**
 * Steering messages are naturally excluded — they go through Agent.steer()
 * and never trigger the "input" event. Extension-sourced messages are
 * passed through unchanged to avoid re-transforming sub-agent output.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { ModelRegistry } from "../orchestration/model-registry/index.js"
import { transformPrompt } from "../orchestration/prompt-transformer/prompt-transformer.js"

export default function (pi: ExtensionAPI) {
	const registry = new ModelRegistry()

	pi.on("input", async (event) => {
		if (event.source === "extension") {
			return { action: "continue" as const }
		}

		const enrichedPrompt = transformPrompt(event.text, registry)
		return { action: "transform" as const, text: enrichedPrompt, images: event.images }
	})
}
