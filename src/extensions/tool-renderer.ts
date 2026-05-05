import type { ExtensionAPI, ToolDefinition } from "@mariozechner/pi-coding-agent"
import {
	createEditToolDefinition,
	createFindToolDefinition,
	createGrepToolDefinition,
	createLsToolDefinition,
	createReadToolDefinition,
	createWriteToolDefinition,
} from "@mariozechner/pi-coding-agent"
import { ToolBlockView, buildToolCallHeader, getTextContent } from "../components/tool-block.js"
import { isToolExpanded, registerToolCall } from "../expand-state.js"

type ToolFactory = (cwd: string) => ToolDefinition

function formatArgs(toolName: string, args: Record<string, unknown>): string {
	const raw = (() => {
		switch (toolName) {
			case "read": {
				const path = String(args.path ?? "")
				const range =
					args.offset != null || args.limit != null
						? ` [${args.offset ?? 0}..${args.limit != null ? Number(args.offset ?? 0) + Number(args.limit) : ""}]`
						: ""
				return path + range
			}
			case "edit":
			case "write":
				return String(args.path ?? "")
			case "grep": {
				const pattern = String(args.pattern ?? "")
				const path = String(args.path ?? "")
				const include = args.include ? ` --include=${args.include}` : ""
				return `${pattern} ${path}${include}`.trim()
			}
			case "find":
				return `${String(args.pattern ?? "")} ${String(args.path ?? "")}`.trim()
			case "ls":
				return String(args.path ?? ".")
			default:
				return JSON.stringify(args)
		}
	})()
	return raw.length > 80 ? `${raw.slice(0, 77)}...` : raw
}

function formatSummary(toolName: string, content: string, isError: boolean): string {
	if (isError) return content.split("\n")[0] || "error"
	const trimmed = content.replace(/\n+$/, "")
	const lines = trimmed ? trimmed.split("\n").length : 0
	switch (toolName) {
		case "edit":
			return "changes applied"
		case "write":
			return "file written"
		case "read":
		case "grep":
		case "ls":
			return `${lines} line${lines === 1 ? "" : "s"} of output`
		case "find":
			return `${lines} file${lines === 1 ? "" : "s"} found`
		default:
			return "done"
	}
}

const builtinFactories: ToolFactory[] = [
	createReadToolDefinition as ToolFactory,
	createEditToolDefinition as ToolFactory,
	createWriteToolDefinition as ToolFactory,
	createGrepToolDefinition as ToolFactory,
	createFindToolDefinition as ToolFactory,
	createLsToolDefinition as ToolFactory,
]

export default function toolRendererExtension(pi: ExtensionAPI) {
	for (const factory of builtinFactories) {
		const baseDef = factory(process.cwd())
		const toolName = baseDef.name

		pi.registerTool({
			...baseDef,

			execute(toolCallId, params, signal, onUpdate, ctx) {
				return factory(ctx.cwd).execute(toolCallId, params, signal, onUpdate, ctx)
			},

			renderCall(args, theme, ctx) {
				const view = ctx.lastComponent instanceof ToolBlockView ? ctx.lastComponent : new ToolBlockView()
				buildToolCallHeader(view, toolName, formatArgs(toolName, args as Record<string, unknown>), theme, ctx)
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
					const summary = formatSummary(toolName, content, ctx.isError)
					view.setFooter(theme.fg("dim", summary), theme.fg("dim", "ctrl+o to expand"))
					view.setExtra([])
				}

				return view
			},
		})
	}
}
