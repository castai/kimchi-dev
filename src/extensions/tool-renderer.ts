import type { AgentToolResult, ExtensionAPI, Theme, ToolRenderResultOptions } from "@mariozechner/pi-coding-agent"
import {
	editToolDefinition,
	findToolDefinition,
	grepToolDefinition,
	lsToolDefinition,
	readToolDefinition,
	writeToolDefinition,
} from "@mariozechner/pi-coding-agent"
import { ToolBlockView, buildToolCallHeader, getTextContent } from "../components/tool-block.js"
import { registerToolCall, isToolExpanded } from "../expand-state.js"

function formatArgs(toolName: string, args: Record<string, any>): string {
	switch (toolName) {
		case "read":
			return args.path ?? ""
		case "edit":
			return args.path ?? ""
		case "write":
			return args.path ?? ""
		case "grep":
			return `${args.pattern ?? ""} ${args.path ?? ""}`.trim()
		case "find":
			return `${args.pattern ?? ""} ${args.path ?? ""}`.trim()
		case "ls":
			return args.path ?? "."
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
			...(builtin as any),

			renderCall(args: any, theme: Theme, ctx: any) {
				const view = ctx.lastComponent instanceof ToolBlockView ? ctx.lastComponent : new ToolBlockView()
				buildToolCallHeader(view, builtin.name, formatArgs(builtin.name, args), theme, ctx)
				return view
			},

			renderResult(result: AgentToolResult<any>, options: ToolRenderResultOptions, theme: Theme, ctx: any) {
				const view = ctx.lastComponent instanceof ToolBlockView ? ctx.lastComponent : new ToolBlockView()
				const content = getTextContent(result)

				registerToolCall(ctx.toolCallId)
				view.setDivider((s: string) => theme.fg("borderMuted", s))

				if (isToolExpanded(ctx.toolCallId) && content) {
					view.setFooter(theme.fg("toolOutput", content), "")
					view.setExtra([])
				} else {
					const summary = formatSummary(builtin.name, content, ctx.isError)
					view.setFooter(
						theme.fg("dim", summary),
						theme.fg("dim", "ctrl+o to expand"),
					)
					view.setExtra([])
				}

				return view
			},
		})
	}
}
