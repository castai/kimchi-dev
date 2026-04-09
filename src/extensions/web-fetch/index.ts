/**
 * web_fetch extension — registers the tool with pi-mono.
 *
 * This is a thin registration shell. All business logic lives in
 * execute-handler.ts so it can be tested without pi-mono dependencies.
 */

import { StringEnum } from "@mariozechner/pi-ai"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Type } from "@sinclair/typebox"
import { shutdownBrowserPool } from "./browser-pool.js"
import { cacheClear } from "./cache.js"
import { executeWebFetch } from "./execute-handler.js"

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
			timeout: Type.Optional(
				Type.Number({
					description:
						"Timeout in seconds for the page fetch. Default is 30 seconds, maximum is 120 seconds. " +
						"Values above 120 are clamped to 120.",
				}),
			),
		}),

		async execute(_toolCallId, params) {
			return executeWebFetch(params)
		},
	})

	pi.on("session_shutdown", () => {
		cacheClear()
		void shutdownBrowserPool()
	})
}
