import type { ConfigScope } from "../config/scope.js"
import type { ToolId } from "../integrations/types.js"

/**
 * In-memory state threaded through every wizard step. Each step mutates
 * exactly the fields it owns and bails out (returns false) when the user
 * cancels — the runner stops the wizard without writing anything.
 *
 * Keeping this as a single mutable object instead of immutable updates
 * mirrors the Go-side TUI state machine; no point copying a 6-field object
 * between steps.
 */
export interface WizardState {
	apiKey: string
	scope: ConfigScope
	selectedTools: ToolId[]
	cancelled: boolean
}

export interface WizardResult {
	cancelled: boolean
	apiKey?: string
	scope?: ConfigScope
	configuredTools: ToolId[]
}
