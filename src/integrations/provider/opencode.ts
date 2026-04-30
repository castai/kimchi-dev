import { BASE_URL } from "../constants.js"
import { CODING_MODEL, type KimchiModel, MAIN_MODEL, SUB_MODEL } from "../models.js"

/**
 * Build the OpenCode provider config block for the kimchi provider. Mirrors
 * `OpenCodeProviderConfig` in kimchi-cli internal/tools/opencode.go — keep
 * the schema in sync, OpenCode pickers fail silently on unknown keys.
 *
 * The shape is `existing.provider.kimchi = …` in opencode.json. Each model
 * entry only lists the three models the writer cares about (Main/Coding/Sub);
 * Opus and Sonnet are exposed via the harness, not OpenCode directly.
 */
export function openCodeProviderConfig(apiKey: string): Record<string, unknown> {
	return {
		npm: "@ai-sdk/openai-compatible",
		name: "Kimchi",
		options: {
			baseURL: BASE_URL,
			litellmProxy: true,
			apiKey,
		},
		models: {
			[MAIN_MODEL.slug]: openCodeModelEntry(MAIN_MODEL),
			[CODING_MODEL.slug]: openCodeModelEntry(CODING_MODEL),
			[SUB_MODEL.slug]: openCodeModelEntry(SUB_MODEL),
		},
	}
}

function openCodeModelEntry(model: KimchiModel): Record<string, unknown> {
	return {
		name: model.slug,
		tool_call: model.toolCall,
		reasoning: model.reasoning,
		limit: {
			context: model.limits.contextWindow,
			output: model.limits.maxOutputTokens,
		},
	}
}
