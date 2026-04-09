/**
 * Orchestration Model Registry
 *
 * Holds built-in model descriptors with orchestration-relevant capabilities.
 *
 * This registry is separate from Pi's ModelRegistry (in pi-mono). Pi's
 * registry handles provider config, API keys, and the actual Model objects
 * for inference. This registry adds the orchestration layer: what each model
 * is good at, so the Orchestrator LLM can make routing decisions.
 *
 * Lookup flow:
 *   orchestration/ModelRegistry (capabilities) → Pi ModelRegistry (inference)
 */

import { BUILTIN_MODELS } from "./builtin-models.js"
import type { OrchestrationModelDescriptor } from "./types.js"

export class ModelRegistry {
	private models: OrchestrationModelDescriptor[]

	constructor() {
		this.models = [...BUILTIN_MODELS]
	}

	/** Get all model descriptors. */
	getAll(): OrchestrationModelDescriptor[] {
		return this.models
	}
}
