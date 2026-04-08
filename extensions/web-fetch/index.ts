/**
 * web_fetch extension — fetches web pages and returns content with metadata.
 *
 * Phase 1: native fetch() only. Playwright (Phase 4) and caching (Phase 5)
 * will be added in later phases.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { type FetchError, fetchPage } from "./page-fetcher.js";
import { validateURL } from "./url-validator.js";

export default function webFetchExtension(pi: ExtensionAPI): void {
	pi.registerTool({
		name: "web_fetch",
		label: "Web Fetch",
		description:
			"Fetch a web page by URL and return its content. Returns raw HTML with metadata. " +
			"Use this to read documentation, API references, or any web page.",
		parameters: Type.Object({
			url: Type.String({ description: "The URL to fetch (must start with http:// or https://)" }),
		}),

		async execute(_toolCallId, params) {
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

			// Build metadata header
			const lines = [
				`URL: ${params.url}`,
				...(result.finalURL !== params.url ? [`Final URL: ${result.finalURL}`] : []),
				`Content-Type: ${result.contentType}`,
				`Characters: ${result.body.length}`,
			];

			const metadata = lines.join("\n");
			const output = `${metadata}\n\n${result.body}`;

			return {
				content: [{ type: "text" as const, text: output }],
				details: {},
			};
		},
	});
}
