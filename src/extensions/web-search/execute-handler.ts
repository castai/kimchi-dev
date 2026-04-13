/**
 * Execute handler for the web_search tool.
 *
 * Separated from index.ts so it can be tested without importing
 * pi-mono framework packages (pi-coding-agent, typebox).
 */

import {
	truncateHead,
	truncateLine,
} from "@mariozechner/pi-coding-agent"

export const SEARCH_ENDPOINT = "https://kimchi.dev/search/v1"
export const SEARCH_TIMEOUT_MS = 25_000
export const DEFAULT_LIMIT = 8
const MAX_LINE_LENGTH = 240
const MAX_LINES = 500

export type Recency = "day" | "week" | "month" | "year"

export interface SearchSource {
	title: string
	url: string
	snippet?: string
}

export interface SearchResponse {
	answer?: string
	sources: SearchSource[]
}

export interface WebSearchParams {
	query: string
	limit?: number
	recency?: Recency
}

export interface WebSearchResult {
	content: { type: "text"; text: string }[]
	details: Record<string, never>
}

export function formatForLLM(response: SearchResponse): string {
	const parts: string[] = []

	if (response.answer) {
		parts.push(response.answer)
	}

	if (response.sources.length > 0) {
		if (response.answer) parts.push("\n## Sources")
		for (const [i, src] of response.sources.entries()) {
			parts.push(`[${i + 1}] ${src.title}\n    ${src.url}`)
			if (src.snippet) {
				parts.push(`    ${truncateLine(src.snippet, MAX_LINE_LENGTH).text}`)
			}
		}
	}

	return parts.join("\n")
}

async function fetchSearchResponse(body: object, apiKey: string, signal: AbortSignal): Promise<SearchResponse> {
	let response: Response
	try {
		response = await fetch(SEARCH_ENDPOINT, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
			signal,
		})
	} catch (err) {
		if (err instanceof Error && err.name === "AbortError") {
			throw new Error("Web search timed out")
		}
		throw err
	}

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			throw new Error(`Authentication failed (${response.status}). Check your API key.`)
		}
		if (response.status === 429) {
			const retryAfter = response.headers.get("Retry-After")
			let retryHint = " Try again in a moment."
			if (retryAfter !== null) {
				const seconds = Number(retryAfter)
				retryHint = Number.isNaN(seconds)
					? ` Retry after ${retryAfter}.`
					: ` Retry after ${seconds} seconds.`
			}
			throw new Error(`Web search rate limited.${retryHint}`)
		}
		throw new Error(`Web search failed with status ${response.status}`)
	}

	const data = await response.json()
	if (!data || typeof data !== "object" || !Array.isArray(data.sources)) {
		throw new Error("Search API returned unexpected response format")
	}
	return data as SearchResponse
}

export async function executeWebSearch(params: WebSearchParams, signal?: AbortSignal): Promise<WebSearchResult> {
	const apiKey = process.env.KIMCHI_API_KEY
	if (!apiKey) {
		throw new Error("KIMCHI_API_KEY is not set")
	}

	const body = {
		query: params.query,
		limit: Math.max(1, Math.min(params.limit ?? DEFAULT_LIMIT, 20)),
		...(params.recency !== undefined ? { recency: params.recency } : {}),
	}

	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS)
	const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal

	try {
		const data = await fetchSearchResponse(body, apiKey, combinedSignal)
		const raw = formatForLLM(data)
		const truncation = truncateHead(raw, { maxLines: MAX_LINES})

		let text = truncation.content || "No results found."
		if (truncation.truncated) {
			text += `\n\n[Output truncated: showing ${truncation.outputLines} of ${truncation.totalLines} lines]`
		}

		return {
			content: [{ type: "text" as const, text }],
			details: {},
		}
	} finally {
		clearTimeout(timeout)
	}
}
