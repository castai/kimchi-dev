/**
 * Orchestration model registry types.
 *
 * These types describe models from the orchestrator's perspective:
 * what a model is good at, what inputs it supports, and how to identify it
 * in Pi's model registry for actual inference.
 */

/**
 * What a model excels at in the context of coding agent tasks.
 *
 * - "review"  — code review, finding bugs, suggesting improvements
 * - "build"   — writing new code, implementing features
 * - "plan"    — breaking down tasks, creating implementation plans
 * - "explore" — navigating codebases, finding relevant code, research
 */
export type ModelStrength = "review" | "build" | "plan" | "explore"

/**
 * Capability metadata for orchestration routing decisions.
 */
export interface ModelCapabilities {
	/** Whether the model can process image inputs. */
	multimodal: boolean
	/** What the model excels at — used by the orchestrator to match tasks to models. */
	strengths: ModelStrength[]
	/**
	 * Free-form description of the model's capabilities, personality, or routing hints.
	 * Injected into the Orchestrator LLM's context to inform model selection.
	 * e.g. "Fast and cheap, good for simple edits. Struggles with large refactors."
	 */
	description: string
}

/**
 * A model descriptor for orchestration purposes.
 *
 * This is NOT a replacement for Pi's Model type. It adds orchestration-specific
 * metadata (capabilities) and references the Pi model via (id, provider) so the
 * orchestrator can look up the actual Model object when spawning a sub-agent.
 */
export interface OrchestrationModelDescriptor {
	/** Model ID matching Pi's Model.id (e.g. "kimi-k2.5"). */
	id: string
	/** Provider name matching Pi's Model.provider (e.g. "kimchi-dev"). */
	provider: string
	/** Human-readable display name. */
	name: string
	/** Orchestration-relevant capabilities. */
	capabilities: ModelCapabilities
}
