import type { OrchestrationModelDescriptor } from "./types.js"

export const BUILTIN_MODELS: readonly OrchestrationModelDescriptor[] = [
	{
		id: "kimi-k2.5",
		provider: "kimchi-dev",
		name: "Kimi K2.5",
		capabilities: {
			multimodal: true,
			strengths: ["build", "explore"],
			description:
				"Strong general-purpose coding model. Good at building features and exploring codebases. Handles multi-file edits well.",
		},
	},
	{
		id: "glm-5-fp8",
		provider: "kimchi-dev",
		name: "GLM 5 FP8",
		capabilities: {
			multimodal: false,
			strengths: ["build"],
			description: "Fast builder model. Best for straightforward coding tasks and single-file changes.",
		},
	},
	{
		id: "minimax-m2.5",
		provider: "kimchi-dev",
		name: "Minimax M2.5",
		capabilities: {
			multimodal: false,
			strengths: ["build"],
			description: "Lightweight builder model. Suitable for simple edits and quick code generation.",
		},
	},
] as const
