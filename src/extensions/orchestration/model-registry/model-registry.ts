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
 *   - A model in the API without a capability entry → generic descriptor + startup warning.
 *   - A model in the capability map but absent from the API → orphaned, excluded from
 *     routing (it cannot be called) + startup warning.
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
	kind: "unknown_model" | "orphaned_capability"
	modelId: string
	message: string
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
		const apiIdSet = new Set(availableModelIds)

		// Build full descriptor list from the API model IDs
		this.allModels = availableModelIds.map((id) => {
			const capabilities = MODEL_CAPABILITIES.get(id)
			if (capabilities === undefined) {
				warnings.push({
					kind: "unknown_model",
					modelId: id,
					message: `Model "${id}" is available via the API but has no capability entry. It can be used as the orchestrator model but will not be offered as a subagent. Add an entry to MODEL_CAPABILITIES in builtin-models.ts to enable subagent routing.`,
				})
				return {
					id,
					provider: PROVIDER,
					name: modelIdToName(id),
					capabilities: GENERIC_CAPABILITIES,
				}
			}
			return { id, provider: PROVIDER, name: modelIdToName(id), capabilities }
		})

		// Warn about orphaned capability entries (in map but not in API)
		for (const capabilityId of MODEL_CAPABILITIES.keys()) {
			if (!apiIdSet.has(capabilityId)) {
				warnings.push({
					kind: "orphaned_capability",
					modelId: capabilityId,
					message: `Model "${capabilityId}" has a capability entry but was not returned by the API. It may have been renamed or removed. Update MODEL_CAPABILITIES in builtin-models.ts.`,
				})
			}
		}

		this.modelsWithCapabilities = this.allModels.filter((m) => MODEL_CAPABILITIES.has(m.id))
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
