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
 *
 * Mirrors `config.ConfigMode` in the kimchi-cli Go source.
 */
export type ConfigMode = "override" | "inject"

/**
 * In-memory state threaded through every wizard step. Each step mutates
 * exactly the fields it owns. `cancelled` is flipped on Ctrl-C; the
 * runner stops at the first cancel without writing anything. `back` is
 * flipped on Esc; the runner rewinds to the previous non-skipped step.
 *
 * Keeping this as a single mutable object instead of immutable updates
 * mirrors the Go-side TUI state machine; no point copying a 7-field object
 * between steps.
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
