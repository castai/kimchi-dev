/**
 * web_fetch extension — fetches web pages and returns content with metadata.
 *
 * Phase 2: native fetch() with HTML-to-markdown conversion, text extraction,
 * and HTML passthrough. Playwright (Phase 4) and caching (Phase 5) will be
 * added in later phases.
 */

import { StringEnum } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { type OutputFormat, convertContent } from "./content-converter.js";
import { type FetchError, fetchPage } from "./page-fetcher.js";
import { validateURL } from "./url-validator.js";

export default function webFetchExtension(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "web_fetch",
		label: "Web Fetch",
		description:
			"Fetch a web page by URL and return its content. " +
			"Use this to read documentation, API references, or any web page. " +
			"Returns markdown by default, but can also return plain text or raw HTML.",
		parameters: Type.Object({
			url: Type.String({ description: "The URL to fetch (must start with http:// or https://)" }),
			format: Type.Optional(
				StringEnum(["markdown", "text", "html"] as const, {
					description:
						'Output format. "markdown" converts HTML to clean markdown (default), ' +
						'"text" extracts plain text, "html" returns raw HTML unchanged.',
					default: "markdown",
				}),
			),
		}),

		async execute(_toolCallId, params) {
			const format: OutputFormat = params.format ?? "markdown";

			// Validate URL
			const validation = validateURL(params.url);
			if (!validation.valid) {
				return {
					content: [{ type: "text" as const, text: `Error: ${validation.error}` }],
					details: {},
				};
			}

			// Fetch
			let result;
			try {
				result = await fetchPage(params.url);
			} catch (err: unknown) {
				const fetchErr = err as FetchError;
				return {
					content: [{ type: "text" as const, text: `Error: ${fetchErr.message}` }],
					details: {},
				};
			}

			// Convert content based on format (HTML content only; non-HTML returned as-is)
			const content = result.isHTML
				? convertContent(result.body, result.finalURL, format)
				: result.body;

			// Build metadata header
			const lines = [
				`URL: ${params.url}`,
				...(result.finalURL !== params.url ? [`Final URL: ${result.finalURL}`] : []),
				`Content-Type: ${result.contentType}`,
				`Format: ${format}`,
				`Characters: ${content.length}`,
			];

			const metadata = lines.join("\n");
			const output = `${metadata}\n\n${content}`;

			return {
				content: [{ type: "text" as const, text: output }],
				details: {},
			};
		},
	});
}
