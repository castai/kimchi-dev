import type { ConfigScope } from "../config/scope.js"

/**
 * Tools we keep after the merge from kimchi-cli. Other Go-side ToolIDs
 * (Codex, Cline, Windsurf, Zed, Continue, Generic) are intentionally not
 * carried over.
 */
export type ToolId = "opencode" | "claudecode" | "cursor" | "openclaw" | "gsd2"

/**
 * A configurable third-party tool that kimchi can point at the kimchi LLM
 * proxy. Each tool ships its own `write(scope, apiKey)` that mutates the
 * tool's own config files (e.g. ~/.config/opencode/opencode.json) so the
 * tool can run standalone afterwards.
 *
 * Mirrors kimchi-cli internal/tools/types.go without the install-script
 * machinery (only OpenClaw uses InstallURL on the Go side; we'll add it
 * back if needed when the OpenClaw integration lands).
 */
export interface ToolDefinition {
	id: ToolId
	name: string
	description: string
	/** Canonical config path (with `~` for the user's home). */
	configPath: string
	/** Binary name to look up on PATH for `isInstalled`. */
	binaryName: string
	/** Optional installer URL (a curl-able install.sh). */
	installUrl?: string
	/** Extra args passed to the install script. */
	installArgs?: string[]
	/** Detect whether the tool is installed locally (PATH probe, well-known dir, etc). */
	isInstalled: () => boolean
	/** Write configuration so this tool talks to kimchi's LLM endpoints. */
	write: (scope: ConfigScope, apiKey: string) => Promise<void>
}
