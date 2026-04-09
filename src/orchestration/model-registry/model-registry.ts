/**
 * Separate from Pi's ModelRegistry which handles provider config, API keys,
 * and Model objects for inference. This registry holds orchestration metadata
 * (capabilities, strengths) so the Orchestrator LLM can make routing decisions.
 */

import { BUILTIN_MODELS } from "./builtin-models.js"
import type { OrchestrationModelDescriptor } from "./types.js"

export class ModelRegistry {
	private readonly models: OrchestrationModelDescriptor[]

	constructor() {
		this.models = [...BUILTIN_MODELS]
	}

	getAll(): OrchestrationModelDescriptor[] {
		return this.models
	}
}
