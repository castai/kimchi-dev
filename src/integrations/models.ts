/**
 * Static model catalogue used when writing tool config files. The runtime
 * model list served to the harness is fetched from the metadata API at
 * startup (src/models.ts); this static list is only used by tool config
 * writers, which configure tools to talk to a known set of model IDs
 * without an online round-trip.
 */
export interface ModelLimits {
	contextWindow: number
	maxOutputTokens: number
}

export interface KimchiModel {
	slug: string
	displayName: string
	description: string
	toolCall: boolean
	reasoning: boolean
	supportsImages?: boolean
	inputModalities: ReadonlyArray<"text" | "image">
	limits: ModelLimits
}

export const MAIN_MODEL: KimchiModel = {
	slug: "kimi-k2.6",
	displayName: "Kimi K2.6",
	description: "Primary model for reasoning, planning, code generation, and image processing.",
	toolCall: true,
	reasoning: true,
	supportsImages: true,
	inputModalities: ["text", "image"],
	limits: { contextWindow: 262_144, maxOutputTokens: 32_768 },
}

export const KIMI_K25_MODEL: KimchiModel = {
	slug: "kimi-k2.5",
	displayName: "Kimi K2.5",
	description: "Previous Kimi model for reasoning, planning, and code generation.",
	toolCall: true,
	reasoning: true,
	supportsImages: true,
	inputModalities: ["text", "image"],
	limits: { contextWindow: 262_144, maxOutputTokens: 32_768 },
}

export const CODING_MODEL: KimchiModel = {
	slug: "nemotron-3-super-fp4",
	displayName: "Nemotron 3 Super FP4",
	description: "High-performance reasoning model for complex tasks.",
	toolCall: true,
	reasoning: true,
	inputModalities: ["text"],
	limits: { contextWindow: 1_048_576, maxOutputTokens: 256_000 },
}

export const SUB_MODEL: KimchiModel = {
	slug: "minimax-m2.7",
	displayName: "MiniMax M2.7",
	description: "Secondary subagent for code generation and debugging.",
	toolCall: true,
	reasoning: true,
	inputModalities: ["text"],
	limits: { contextWindow: 196_608, maxOutputTokens: 32_768 },
}

export const OPUS_MODEL: KimchiModel = {
	slug: "claude-opus-4-6",
	displayName: "Claude Opus 4.6",
	description: "High-capability model for complex planning and validation tasks.",
	toolCall: true,
	reasoning: true,
	inputModalities: ["text"],
	limits: { contextWindow: 1_000_000, maxOutputTokens: 128_000 },
}

export const SONNET_MODEL: KimchiModel = {
	slug: "claude-sonnet-4-6",
	displayName: "Claude Sonnet 4.6",
	description: "Balanced model for general reasoning and code tasks.",
	toolCall: true,
	reasoning: true,
	inputModalities: ["text"],
	limits: { contextWindow: 1_000_000, maxOutputTokens: 128_000 },
}

export const ALL_MODELS: ReadonlyArray<KimchiModel> = [
	MAIN_MODEL,
	CODING_MODEL,
	SUB_MODEL,
	OPUS_MODEL,
	SONNET_MODEL,
	KIMI_K25_MODEL,
]
