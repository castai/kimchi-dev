/**
 * Execute handler for the web_fetch tool.
 *
 * Separated from index.ts so it can be tested without importing
 * pi-mono framework packages (pi-ai, pi-coding-agent, typebox).
 */

import { type OutputFormat, convertContent } from "./content-converter.js";
import { type FetchError, fetchPage } from "./page-fetcher.js";
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
			details: {} as Record<string, never>,
		};
	}

	// Fetch
	let result;
	try {
		result = await fetchPage(params.url, { timeoutSeconds, format });
	} catch (err: unknown) {
		const fetchErr = err as FetchError;
		return {
			content: [{ type: "text" as const, text: `Error: ${fetchErr.message}` }],
			details: {} as Record<string, never>,
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
		...(result.fallbackWarning ? [result.fallbackWarning] : []),
	];

	const metadata = lines.join("\n");
	const truncationNotice = truncated
		? `\n\n[Content truncated: showing ${MAX_OUTPUT_CHARS.toLocaleString()} of ${totalChars.toLocaleString()} characters]`
		: "";
	const output = `${metadata}\n\n${content}${truncationNotice}`;

	return {
		content: [{ type: "text" as const, text: output }],
		details: {} as Record<string, never>,
	};
}
