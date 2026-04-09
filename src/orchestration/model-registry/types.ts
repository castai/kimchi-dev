export type ModelStrength = "review" | "build" | "plan" | "explore"

/** Injected into the Orchestrator LLM's context to steer model selection. */
export interface ModelCapabilities {
	multimodal: boolean
	strengths: ModelStrength[]
	description: string
}

/**
 * Not a replacement for Pi's Model type — this adds orchestration metadata
 * and references the Pi model via (id, provider) for sub-agent spawning.
 */
export interface OrchestrationModelDescriptor {
	id: string
	provider: string
	name: string
	capabilities: ModelCapabilities
}
