import type { ConfigScope } from "../config/scope.js"
import type { ToolId } from "../integrations/types.js"

/**
 * How tool subcommands talk to kimchi at runtime.
 *
 * - `override` (recommended): write kimchi settings into each tool's own
 *   config file (`~/.config/opencode/opencode.json`, `~/.claude/settings.json`,
 *   …). The tool keeps working standalone afterwards.
 * - `inject`: launch via `kimchi <tool>` only — env vars are set per-process,
 *   the user's tool configs are never modified.
 */
export type ConfigMode = "override" | "inject"

/**
 * In-memory state threaded through every wizard step. Each step mutates
 * exactly the fields it owns. `cancelled` is flipped on Ctrl-C; the
 * runner stops at the first cancel without writing anything. `back` is
 * flipped on Esc; the runner rewinds to the previous non-skipped step.
 */
export interface WizardState {
	apiKey: string
	mode: ConfigMode
	scope: ConfigScope
	selectedTools: ToolId[]
	telemetryEnabled: boolean
	cancelled: boolean
	back: boolean
}

export interface WizardResult {
	cancelled: boolean
	apiKey?: string
	mode?: ConfigMode
	scope?: ConfigScope
	telemetryEnabled?: boolean
	configuredTools: ToolId[]
}
