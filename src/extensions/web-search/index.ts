/**
 * web_search extension — registers the tool with pi-mono.
 *
 * This is a thin registration shell. All business logic lives in
 * execute-handler.ts so it can be tested without pi-mono dependencies.
 */

import { StringEnum } from "@mariozechner/pi-ai"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Text } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"
import { executeWebSearch } from "./execute-handler.js"

export default function webSearchExtension(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "web_search",
		label: "Web Search",
		description:
			"Searches the web for up-to-date information beyond the model's knowledge cutoff. " +
			"Prefer primary sources (official docs, papers) and corroborate key claims with multiple sources. " +
			"Include links for cited sources in the final response. " +
			"Use the recency parameter when the query is time-sensitive.",
		promptSnippet: "Search the web for current information",
		parameters: Type.Object({
			query: Type.String({ description: "Search query" }),
			recency: Type.Optional(
				StringEnum(["day", "week", "month", "year"] as const, {
					description: "Recency filter - limit results to this time window. Use for time-sensitive queries.",
				}),
			),
			limit: Type.Optional(
				Type.Integer({
					minimum: 1,
					maximum: 20,
					description: "Maximum number of results to return (default: 8)",
				}),
			),
		}),

		async execute(_toolCallId, params, signal) {
			return executeWebSearch(params, signal)
		},

		renderCall(args, theme, context) {
			const text = (context.lastComponent ?? new Text("", 0, 0)) as Text
			const parts = [
				theme.fg("toolTitle", theme.bold("web_search")),
				theme.fg("muted", "("),
				theme.fg("accent", `"${args.query}"`),
				theme.fg("muted", ")"),
				...(args.recency ? [theme.fg("muted", ` recency:${args.recency}`)] : []),
				...(args.limit !== undefined ? [theme.fg("muted", ` limit:${args.limit}`)] : []),
			]
			text.setText(parts.join(""))
			return text
		},
	})
}
