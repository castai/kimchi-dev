/**
 * Bash command log collapse extension.
 *
 * Overrides the built-in bash tool renderer so that:
 * - While a command is running, output is expanded so the user can follow progress.
 * - Once execution completes, the result collapses to the built-in 5-line preview.
 * - The user can still re-expand at any time with Ctrl+O.
 *
 * Extension tools override built-in tools with the same name, so registering
 * "bash" here shadows the built-in. The execute handler delegates to a
 * fresh definition built with the current session cwd so directory navigation
 * works correctly. Only the rendering behavior is modified.
 */

import { createBashToolDefinition } from "@mariozechner/pi-coding-agent"
import type { BashToolDetails } from "@mariozechner/pi-coding-agent"
import type { ExtensionAPI, ToolDefinition } from "@mariozechner/pi-coding-agent"

export default function (pi: ExtensionAPI) {
	const baseDef = createBashToolDefinition(process.cwd())

	const def: ToolDefinition<typeof baseDef.parameters, BashToolDetails | undefined> = {
		...baseDef,

		execute(toolCallId, params, signal, onUpdate, ctx) {
			// Rebuild with the current session cwd so directory navigation is respected.
			return createBashToolDefinition(ctx.cwd).execute(toolCallId, params, signal, onUpdate, ctx)
		},

		renderResult: baseDef.renderResult
			? (result, options, theme, context) => {
					const effectiveOptions = options.isPartial ? { ...options, expanded: true } : options
					return baseDef.renderResult!(result, effectiveOptions, theme, context)
				}
			: undefined,
	}

	pi.registerTool(def)
}
