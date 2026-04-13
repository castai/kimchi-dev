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
1T-parameter MoE model (32B active), 256K context. \
The only vision model in the pool - can reason over images, generate code \
from UI designs and screenshots, and process visual inputs. \
Strong at resolving real-world GitHub issues across multiple languages. \
Excels at deep mathematical and scientific reasoning, including graduate-level \
science questions and frontier-difficulty problems that most models cannot solve. \
Leading agentic capabilities - can autonomously browse the web, chain tool calls, \
and decompose complex tasks into parallel sub-tasks via its agent-swarm architecture. \
Most capable and most expensive model in the pool. Best choice for complex \
multi-step tasks, anything involving visual inputs, or problems that require \
deep reasoning and autonomous multi-tool workflows.`

const MINIMAX_M27_DESCRIPTION = `\
230B-parameter MoE model (only ~10B active), 192K context, Lightning Attention. \
The strongest pure coding model in the pool - has the highest accuracy at resolving \
real-world GitHub issues, including complex multi-file bugs and hard edge cases. \
Strong across 10+ programming languages in 200K+ real-world environments. \
Plans architecture before coding with a natural spec-writing tendency. \
Excellent at autonomous tool calling and multi-step function chains - reliably \
formats tool calls correctly and handles extended multi-turn tool conversations. \
Solid mathematical and scientific reasoning, though slightly behind the heavy-tier model. \
Very fast inference thanks to only 4% parameter activation. \
Best choice for coding tasks of any complexity where quality and speed both matter, \
especially when the task is purely text-based with no visual inputs.`

const NEMOTRON_3_SUPER_DESCRIPTION = `\
120B-parameter LatentMoE hybrid model (12B active), up to 1M token context, NVFP4 quantized. \
The weakest coding model in the pool - adequate for simple, well-scoped code changes \
but not reliable for complex multi-file bug fixes or feature implementations. \
Surprisingly strong reasoning for its size - handles advanced math and graduate-level \
science questions well. Decent at following instructions in agentic workflows, \
though struggles with autonomous web search and information retrieval tasks. \
Standout capability is its 1M token context window with near-perfect retrieval \
accuracy - can ingest entire large codebases, trace cross-file dependencies, \
and answer questions about massive documents in a single pass. \
Cheapest and fastest model in the pool. Best choice for codebase exploration, \
research, reading large files, and simple straightforward tasks.`

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
