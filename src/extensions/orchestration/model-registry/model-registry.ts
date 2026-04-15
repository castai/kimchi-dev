/**
 * Separate from Pi's ModelRegistry which handles provider config, API keys,
 * and Model objects for inference. This registry holds orchestration metadata
 * (capabilities, strengths) so the Orchestrator LLM can make routing decisions.
 *
 * The registry is built from two sources:
 *   1. availableModelIds — the live model list fetched from the API at startup.
 *      This is the source of truth for which models actually exist and can be called.
 *   2. MODEL_CAPABILITIES — a local knowledge-base of curated orchestration metadata
 *      (tier, strengths, vision, description) keyed by model ID.
 *
 * Merging rules:
 *   - A model in the API with a capability entry → full OrchestrationModelDescriptor.
 *   - A model in the API without a capability entry → generic descriptor + startup notice.
 *   - A model in the capability map but absent from the API → silently excluded from
 *     routing (it cannot be called).
 *
 * Models with capabilities = intersection of availableModelIds ∩ MODEL_CAPABILITIES keys.
 * Subagent pool           = models with capabilities, excluding the current orchestrator.
 * Orchestrator self-lookup = all models from the API (including unknown ones).
 */

import { MODEL_CAPABILITIES } from "./builtin-models.js"
import type { ModelCapabilities, OrchestrationModelDescriptor } from "./types.js"

const PROVIDER = "kimchi-dev"

const GENERIC_CAPABILITIES: ModelCapabilities = {
	vision: false,
	strengths: ["build"],
	tier: "standard",
	description: "No capability information available for this model.",
}

function modelIdToName(id: string): string {
	return id
		.split(/[-_]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ")
}

export interface ModelRegistryWarning {
	kind: "unknown_model"
	modelId: string
}

export class ModelRegistry {
	/** All models from the API, enriched where possible. Used for orchestrator self-lookup. */
	private readonly allModels: OrchestrationModelDescriptor[]

	/** Models that have a real entry in MODEL_CAPABILITIES (API ∩ capability map). */
	private readonly modelsWithCapabilities: OrchestrationModelDescriptor[]

	/** Drift warnings emitted during construction. */
	readonly warnings: readonly ModelRegistryWarning[]

	constructor(availableModelIds: readonly string[]) {
		const warnings: ModelRegistryWarning[] = []

		// Build full descriptor list from the API model IDs
		const allModels: OrchestrationModelDescriptor[] = []
		for (const id of availableModelIds) {
			const entry = MODEL_CAPABILITIES.get(id)
			if (entry === "ignored") {
				continue
			}
			if (entry === undefined) {
				warnings.push({ kind: "unknown_model", modelId: id })
				allModels.push({ id, provider: PROVIDER, name: modelIdToName(id), capabilities: GENERIC_CAPABILITIES })
			} else {
				allModels.push({ id, provider: PROVIDER, name: modelIdToName(id), capabilities: entry })
			}
		}
		this.allModels = allModels

		this.modelsWithCapabilities = this.allModels.filter((m) => {
			const entry = MODEL_CAPABILITIES.get(m.id)
			return entry !== undefined && entry !== "ignored"
		})
		this.warnings = warnings
	}

	/**
	 * All models available from the API, with capability enrichment where known.
	 */
	getAll(): readonly OrchestrationModelDescriptor[] {
		return this.allModels
	}

	/**
	 * Models that have a real entry in MODEL_CAPABILITIES - the intersection of
	 * the API model list and the local capability knowledge-base. Unknown models
	 * (those with generic descriptors) are excluded.
	 */
	getModelsWithCapabilities(): readonly OrchestrationModelDescriptor[] {
		return this.modelsWithCapabilities
	}
}
