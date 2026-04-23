import type { ExtensionAPI, ToolDefinition } from "@mariozechner/pi-coding-agent"
import {
	editToolDefinition,
	findToolDefinition,
	grepToolDefinition,
	lsToolDefinition,
	readToolDefinition,
	writeToolDefinition,
} from "@mariozechner/pi-coding-agent"
import { ToolBlockView, buildToolCallHeader, getTextContent } from "../components/tool-block.js"
import { isToolExpanded, registerToolCall } from "../expand-state.js"

function formatArgs(toolName: string, args: Record<string, unknown>): string {
	switch (toolName) {
		case "read":
		case "edit":
		case "write":
			return String(args.path ?? "")
		case "grep":
		case "find":
			return `${String(args.pattern ?? "")} ${String(args.path ?? "")}`.trim()
		case "ls":
			return String(args.path ?? ".")
		default:
			return JSON.stringify(args)
	}
}

function formatSummary(toolName: string, content: string, isError: boolean): string {
	if (isError) return content.split("\n")[0] || "error"
	const lines = content.split("\n").length
	switch (toolName) {
		case "read":
			return `${lines} lines found`
		case "edit":
			return "changes applied"
		case "write":
			return "file written"
		case "grep":
			return `${lines} matches found`
		case "find":
			return `${lines} files found`
		case "ls":
			return `${lines} entries`
		default:
			return "done"
	}
}

const builtins = [
	readToolDefinition,
	editToolDefinition,
	writeToolDefinition,
	grepToolDefinition,
	findToolDefinition,
	lsToolDefinition,
]

export default function toolRendererExtension(pi: ExtensionAPI) {
	for (const builtin of builtins) {
		pi.registerTool({
			...(builtin as unknown as ToolDefinition),

			renderCall(args, theme, ctx) {
				const view = ctx.lastComponent instanceof ToolBlockView ? ctx.lastComponent : new ToolBlockView()
				buildToolCallHeader(view, builtin.name, formatArgs(builtin.name, args as Record<string, unknown>), theme, ctx)
				return view
			},

			renderResult(result, options, theme, ctx) {
				const view = ctx.lastComponent instanceof ToolBlockView ? ctx.lastComponent : new ToolBlockView()
				const content = getTextContent(result)

				registerToolCall(ctx.toolCallId)
				view.setDivider((s: string) => theme.fg("borderMuted", s))

				if (isToolExpanded(ctx.toolCallId) && content) {
					view.setFooter(theme.fg("toolOutput", content), "")
					view.setExtra([])
				} else {
					const summary = formatSummary(builtin.name, content, ctx.isError)
					view.setFooter(theme.fg("dim", summary), theme.fg("dim", "ctrl+o to expand"))
					view.setExtra([])
				}

				return view
			},
		})
	}
}
