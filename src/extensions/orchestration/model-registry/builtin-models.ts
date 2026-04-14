import type { OrchestrationModelDescriptor } from "./types.js"

/**
 * Model descriptions are written as natural-language decision briefs, not
 * benchmark data sheets. While the orchestrator LLM could interpret raw
 * benchmark names and scores if we provided them with definitions, doing
 * so would significantly bloat the user prompt - each model would need
 * dozens of benchmark scores plus a glossary explaining what each one
 * measures. Instead, we pre-digest the benchmark evidence into concise
 * statements the orchestrator can act on directly: "strongest pure coding
 * model in the pool", "reliably formats tool calls correctly",
 * "near-perfect retrieval accuracy" etc.
 */
const KIMI_K25_DESCRIPTION = `\
The only model in the pool with vision support — use it when the task involves images, \
screenshots, or visual input. Most capable and most expensive. \
Best for complex multi-step tasks, deep reasoning, or anything requiring autonomous multi-tool workflows.`

const MINIMAX_M27_DESCRIPTION = `\
The strongest coding model in the pool. \
Best accuracy on multi-file bugs, complex refactors, and extended tool call chains. \
Best default choice for any well-scoped coding task.`

const NEMOTRON_3_SUPER_DESCRIPTION = `\
Cheapest and fastest. 1M token context window with near-perfect retrieval — \
can ingest entire large codebases in a single pass. \
Weakest at coding; not reliable for complex multi-file changes. \
Best for codebase exploration, research, and simple well-defined tasks.`

export const BUILTIN_MODELS: readonly OrchestrationModelDescriptor[] = [
	{
		id: "kimi-k2.5",
		provider: "kimchi-dev",
		name: "Kimi K2.5",
		capabilities: {
			vision: true,
			strengths: ["build", "explore"],
			tier: "heavy",
			description: KIMI_K25_DESCRIPTION,
		},
	},
	{
		id: "minimax-m2.7",
		provider: "kimchi-dev",
		name: "Minimax M2.7",
		capabilities: {
			vision: false,
			strengths: ["build"],
			tier: "standard",
			description: MINIMAX_M27_DESCRIPTION,
		},
	},
	{
		id: "nemotron-3-super-fp4",
		provider: "kimchi-dev",
		name: "Nemotron 3 Super",
		capabilities: {
			vision: false,
			strengths: ["build", "explore", "research"],
			tier: "light",
			description: NEMOTRON_3_SUPER_DESCRIPTION,
		},
	},
] as const
