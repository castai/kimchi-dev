/**
 * web_search extension — registers the tool with pi-mono.
 *
 * This is a thin registration shell. All business logic lives in
 * execute-handler.ts so it can be tested without pi-mono dependencies.
 */

import { StringEnum } from "@mariozechner/pi-ai"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Container, Text } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"
import { type SearchResponse, executeWebSearch } from "./execute-handler.js"

export default function webSearchExtension(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "web_search",
		label: "Web Search",
		description:
			"Searches the web for up-to-date information beyond the model's knowledge cutoff. " +
			"Prefer primary sources (official docs, papers) and corroborate key claims with multiple sources. " +
			"Include links for cited sources in the final response. " +
			"Use the recency parameter when the query is time-sensitive. " +
			"Use search_depth='deep' only for complex queries requiring high precision — it costs more and is slower. " +
			"Use max_content_chars to control how much content is returned per result (default: 2000).",
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
			search_depth: Type.Optional(
				StringEnum(["basic", "deep"] as const, {
					description:
						"Search quality vs cost tradeoff. 'basic' (default) is fast and cheap. " +
						"'deep' uses multi-step reasoning for higher precision — use only for complex queries where quality matters more than speed.",
				}),
			),
			max_content_chars: Type.Optional(
				Type.Integer({
					minimum: 200,
					maximum: 10000,
					description:
						"Maximum characters of content to return per result (default: 2000). " +
						"Increase for deep research; decrease to save context window space.",
				}),
			),
		}),

		async execute(_toolCallId, params, signal) {
			return executeWebSearch(params, signal)
		},

		renderResult(result, options, theme, context) {
			const sources = result.details?.sources ?? []
			const count = sources.length

			if (options.expanded) {
				const lines = sources.map((s) => `${theme.fg("accent", s.url)}  ${theme.fg("muted", s.title)}`).join("\n")
				const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
				component.clear()
				component.addChild(new Text(lines, 0, 0))
				component.invalidate()
				return component
			}

			const summary = `${theme.fg("dim", `${count} result${count === 1 ? "" : "s"}`)}  ${theme.fg("muted", "(ctrl+o to expand)")}`
			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Text(summary, 0, 0))
			component.invalidate()
			return component
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
				...(args.search_depth ? [theme.fg("muted", ` depth:${args.search_depth}`)] : []),
			]
			text.setText(parts.join(""))
			return text
		},
	})
}
