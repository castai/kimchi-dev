/**
 * Execute handler for the web_fetch tool.
 *
 * Separated from index.ts so it can be tested without importing
 * pi-mono framework packages (pi-ai, pi-coding-agent, typebox).
 */

import { cacheGet, cacheSet } from "./cache.js";
import { type OutputFormat, convertContent } from "./content-converter.js";
import { FetchError, fetchPage } from "./page-fetcher.js";
import { validateURL } from "./url-validator.js";

/** Maximum timeout in seconds. Values above this are clamped. */
export const MAX_TIMEOUT_SECONDS = 120;

/** Maximum output characters before truncation. */
export const MAX_OUTPUT_CHARS = 100_000;

export interface WebFetchParams {
	url: string;
	format?: OutputFormat;
	timeout?: number;
}

export interface WebFetchResult {
	content: { type: "text"; text: string }[];
	details: Record<string, never>;
}

const EMPTY_DETAILS = {} as Record<string, never>;

function buildOutput(metadataLines: string[], content: string, truncationNotice: string): string {
	return `${metadataLines.join("\n")}\n\n${content}${truncationNotice}`;
}

export async function executeWebFetch(params: WebFetchParams): Promise<WebFetchResult> {
	const format: OutputFormat = params.format ?? "markdown";
	const timeoutSeconds = params.timeout != null
		? Math.min(params.timeout, MAX_TIMEOUT_SECONDS)
		: undefined;

	// Validate URL
	const validation = validateURL(params.url);
	if (!validation.valid) {
		return {
			content: [{ type: "text" as const, text: `Error: ${validation.error}` }],
			details: EMPTY_DETAILS,
		};
	}

	// Check cache
	const cached = cacheGet(params.url, format);
	if (cached != null) {
		return {
			content: [{ type: "text" as const, text: cached }],
			details: EMPTY_DETAILS,
		};
	}

	// Fetch
	let result;
	try {
		result = await fetchPage(params.url, { timeoutSeconds, format });
	} catch (err: unknown) {
		const message = err instanceof FetchError ? err.message
			: err instanceof Error ? err.message
			: String(err);
		return {
			content: [{ type: "text" as const, text: `Error: ${message}` }],
			details: EMPTY_DETAILS,
		};
	}

	// Convert content based on format.
	// When Playwright extracted text directly (format: text), the body is already
	// plain text — skip the content converter. For non-HTML, return as-is.
	const playwrightExtractedText = result.isHTML && format === "text" && !result.fallbackWarning;
	let content = result.isHTML && !playwrightExtractedText
		? convertContent(result.body, result.finalURL, format)
		: result.body;

	// Truncate output if it exceeds the character limit
	const totalChars = content.length;
	let truncated = false;
	if (content.length > MAX_OUTPUT_CHARS) {
		content = content.slice(0, MAX_OUTPUT_CHARS);
		truncated = true;
	}

	// Build metadata header
	const lines = [
		`URL: ${params.url}`,
		...(result.finalURL !== params.url ? [`Final URL: ${result.finalURL}`] : []),
		`Content-Type: ${result.contentType}`,
		`Format: ${format}`,
		`Characters: ${totalChars.toLocaleString()}`,
		...(truncated
			? [`Truncated: content truncated to ${MAX_OUTPUT_CHARS.toLocaleString()} of ${totalChars.toLocaleString()} characters`]
			: []),
		`Cache: miss`,
		...(result.fallbackWarning ? [result.fallbackWarning] : []),
	];

	const truncationNotice = truncated
		? `\n\n[Content truncated: showing ${MAX_OUTPUT_CHARS.toLocaleString()} of ${totalChars.toLocaleString()} characters]`
		: "";
	const output = buildOutput(lines, content, truncationNotice);

	// Store in cache with Cache: hit metadata (swap at array level to avoid
	// corrupting page body that might contain the literal "Cache: miss" string)
	const cacheIndex = lines.indexOf("Cache: miss");
	const cachedLines = [...lines];
	cachedLines[cacheIndex] = "Cache: hit";
	cacheSet(params.url, format, buildOutput(cachedLines, content, truncationNotice));

	return {
		content: [{ type: "text" as const, text: output }],
		details: EMPTY_DETAILS,
	};
}
