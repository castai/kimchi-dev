import type { OrchestrationModelDescriptor } from "./types.js"

export const BUILTIN_MODELS: readonly OrchestrationModelDescriptor[] = [
	{
		id: "kimi-k2.5",
		provider: "kimchi-dev",
		name: "Kimi K2.5",
		capabilities: {
			multimodal: true,
			strengths: ["build", "explore"],
			tier: "heavy",
			description:
				"1T-parameter MoE model (32B active), 256K context. Native multimodal with vision encoder - " +
				"can reason over images, generate code from UI designs, and process visual inputs. " +
				"Strong coding (SWE-Bench Verified 76.8%), math (AIME 2025 96.1%), and agentic search " +
				"(BrowseComp 78.4% with agent swarm). Unique agent-swarm capability decomposes complex " +
				"tasks into parallel sub-tasks. Most capable and most expensive model in the pool.",
		},
	},
	{
		id: "minimax-m2.5",
		provider: "kimchi-dev",
		name: "Minimax M2.5",
		capabilities: {
			multimodal: false,
			strengths: ["build"],
			tier: "standard",
			description:
				"230B-parameter MoE model (only ~10B active), 128K context, Lightning Attention. " +
				"Best-in-class SWE-Bench Verified (80.2%) and strong multilingual coding across 10+ languages " +
				"and 200K+ real-world environments. Spec-writing tendency - plans architecture before coding. " +
				"Very efficient at 4% parameter activation, fast inference matching Claude Opus 4.6 speed. " +
				"Best balance of coding quality and cost efficiency.",
		},
	},
	{
		id: "nemotron-3-super-fp4",
		provider: "kimchi-dev",
		name: "Nemotron 3 Super",
		capabilities: {
			multimodal: false,
			strengths: ["build"],
			tier: "light",
			description:
				"120B-parameter LatentMoE hybrid model (12B active), up to 1M token context, NVFP4 quantized. " +
				"Solid reasoning (AIME 2025 90.2%) and decent coding (SWE-Bench Verified 60.5%). " +
				"Optimized for collaborative agents and high-volume workloads. Smallest active parameter " +
				"count and quantized to NVFP4 for maximum throughput - cheapest to run in the pool.",
		},
	},
] as const
