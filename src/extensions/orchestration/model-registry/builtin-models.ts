import type { ModelCapabilities } from "./types.js"

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
 *
 * This map is a local capability knowledge-base keyed by model ID. It acts
 * as an enrichment layer on top of the dynamic model list fetched from the
 * API at startup. Models present in the API but absent here get a generic
 * descriptor and a startup warning. Models present here but absent from the
 * API are excluded from subagent routing (they cannot be called). The
 * intention is to iterate on these descriptions locally and promote them to
 * the API once the shape is stable.
 */

const KIMI_K25_DESCRIPTION = `\
The only model in the pool with vision support — use it when the task involves images, \
screenshots, or visual input. Best for exploration and research tasks, particularly those \
requiring image understanding or visual context. Excellent for autonomous multi-tool workflows.`

const MINIMAX_M27_DESCRIPTION = `\
The strongest coding model in the pool. \
Best accuracy on multi-file bugs, complex refactors, and extended tool call chains. \
Best default choice for any well-scoped coding task.`

const NEMOTRON_3_SUPER_DESCRIPTION = `\
Cheapest and fastest. 1M token context window with near-perfect retrieval — \
can ingest entire large codebases in a single pass. \
Weakest at coding; not reliable for complex multi-file changes. \
Best for codebase exploration, research, and simple well-defined tasks.`

const CLAUDE_OPUS_47_DESCRIPTION = `\
Anthropic's flagship Claude model. Dominates at architectural planning and complex task \
decomposition — when a hard problem needs a superior plan, this is the model to delegate to. \
Also excels at deep reasoning, research, and exploration across large codebases. Best for \
complex multi-step tasks requiring careful analysis and methodical planning.`

// TODO: these capabilities could be returned by our models metadata API.
/**
 * Capability knowledge-base keyed by model ID. Used to enrich the dynamic
 * model list from the API with orchestration metadata (tier, strengths,
 * vision, description). Models not present here get a generic descriptor
 * and a startup warning.
 *
 * Set the value to "ignored" to suppress the startup warning for a model
 * without adding routing support for it.
 */
export const MODEL_CAPABILITIES: ReadonlyMap<string, ModelCapabilities | "ignored"> = new Map<
	string,
	ModelCapabilities | "ignored"
>([
	[
		"kimi-k2.5",
		{
			vision: true,
			strengths: ["explore", "research", "plan", "review"],
			tier: "heavy",
			description: KIMI_K25_DESCRIPTION,
		},
	],
	[
		"minimax-m2.7",
		{
			vision: false,
			strengths: ["build", "review"],
			tier: "standard",
			description: MINIMAX_M27_DESCRIPTION,
		},
	],
	[
		"nemotron-3-super-fp4",
		{
			vision: false,
			strengths: ["build"],
			tier: "light",
			description: NEMOTRON_3_SUPER_DESCRIPTION,
		},
	],
	[
		"claude-opus-4-7",
		{
			vision: true,
			strengths: ["explore", "research", "plan", "review"],
			tier: "heavy",
			description: CLAUDE_OPUS_47_DESCRIPTION,
		},
	],
	["glm-5-fp8", "ignored"],
	["minimax-m2.5", "ignored"],
	["claude-opus-4-6", "ignored"],
	["claude-sonnet-4-6", "ignored"],
	["claude-sonnet-4-5", "ignored"],
])
