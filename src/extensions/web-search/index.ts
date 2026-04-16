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
import { executeWebSearch } from "./execute-handler.js"

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

interface WebSearchState {
	spinnerIdx: number
	spinnerInterval: ReturnType<typeof setInterval> | undefined
}

function clearSpinner(state: WebSearchState) {
	if (state.spinnerInterval) {
		clearInterval(state.spinnerInterval)
		state.spinnerInterval = undefined
	}
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`
	return `${(ms / 1000).toFixed(1)}s`
}

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

		renderCall(args, theme, context) {
			const state = context.state as WebSearchState

			const running = context.executionStarted && context.isPartial
			if (running && !state.spinnerInterval) {
				state.spinnerIdx = 0
				state.spinnerInterval = setInterval(() => {
					state.spinnerIdx = (state.spinnerIdx + 1) % SPINNER_FRAMES.length
					context.invalidate()
				}, 80)
			}

			const spinner = running ? theme.fg("accent", SPINNER_FRAMES[state.spinnerIdx ?? 0]) : theme.fg("muted", "-")

			const header = `${spinner} ${theme.fg("toolTitle", theme.bold("Web search"))}`
			const phraseLine = `  ${theme.fg("muted", "phrase:")} ${theme.fg("accent", "`")}${theme.fg("accent", args.query ?? "")}${theme.fg("accent", "`")}`

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Text(`${header}\n${phraseLine}`, 0, 0))
			return component
		},

		renderResult(result, options, theme, context) {
			const state = context.state as WebSearchState

			if (!options.isPartial) {
				clearSpinner(state)
			}

			if (options.isPartial) return new Container()

			const details = result.details as { durationMs: number; chars: number } | undefined
			const duration = theme.fg("dim", formatDuration(details?.durationMs ?? 0))
			const chars = theme.fg("dim", `↓${(details?.chars ?? 0).toLocaleString()}`)

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Text(theme.fg("dim", `- ${duration}  ${chars}`), 0, 0))
			return component
		},
	})
}
