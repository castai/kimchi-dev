import { createBashToolDefinition } from "@mariozechner/pi-coding-agent"
import type { BashToolDetails } from "@mariozechner/pi-coding-agent"
import type { ExtensionAPI, ToolDefinition } from "@mariozechner/pi-coding-agent"
import { Container, Spacer, Text } from "@mariozechner/pi-tui"

export default function (pi: ExtensionAPI) {
	const baseDef = createBashToolDefinition(process.cwd())

	const def: ToolDefinition<typeof baseDef.parameters, BashToolDetails | undefined> = {
		...baseDef,

		execute(toolCallId, params, signal, onUpdate, ctx) {
			return createBashToolDefinition(ctx.cwd).execute(toolCallId, params, signal, onUpdate, ctx)
		},

		renderResult(result, options, theme, context) {
			if (options.isPartial) {
				const textContent = result.content.find((c): c is { type: "text"; text: string } => c.type === "text")
				const displayText = (textContent?.text ?? "").split("\n").slice(-5).join("\n")

				const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
				component.clear()
				component.addChild(new Spacer(1))
				component.addChild(new Text(theme.fg("toolOutput", displayText), 0, 0))
				component.invalidate()
				return component
			}

			if (options.expanded) {
				return baseDef.renderResult?.(result, options, theme, context) ?? new Text("", 0, 0)
			}

			const textContent = result.content.find((c): c is { type: "text"; text: string } => c.type === "text")
			const trimmed = (textContent?.text ?? "").replace(/\n$/, "")
			const lineCount = trimmed ? trimmed.split("\n").length : 0
			const summary = `${theme.fg("dim", `${lineCount} line${lineCount === 1 ? "" : "s"}`)}  ${theme.fg("muted", "(ctrl+o to expand)")}`

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Text(summary, 0, 0))
			component.invalidate()
			return component
		},
	}

	pi.registerTool(def)
}
