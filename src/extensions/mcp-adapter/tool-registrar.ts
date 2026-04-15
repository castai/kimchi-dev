// tool-registrar.ts - MCP content transformation
// NOTE: Tools are NOT registered with Pi - only the unified `mcp` proxy tool is registered.
// This keeps the LLM context small (1 tool instead of 100s).

import type { ContentBlock, McpContent } from "./types.js"

/**
 * Transform MCP content types to Pi content blocks.
 */
export function transformMcpContent(content: McpContent[]): ContentBlock[] {
	return content.map((c) => {
		if (c.type === "text") {
			return { type: "text" as const, text: c.text ?? "" }
		}
		if (c.type === "image") {
			return {
				type: "image" as const,
				data: c.data ?? "",
				mimeType: c.mimeType ?? "image/png",
			}
		}
		if (c.type === "resource") {
			const resourceUri = c.resource?.uri ?? "(no URI)"
			const resourceContent = c.resource?.text ?? (c.resource ? JSON.stringify(c.resource) : "(no content)")
			return {
				type: "text" as const,
				text: `[Resource: ${resourceUri}]\n${resourceContent}`,
			}
		}
		if (c.type === "resource_link") {
			const linkName = c.name ?? c.uri ?? "unknown"
			const linkUri = c.uri ?? "(no URI)"
			return {
				type: "text" as const,
				text: `[Resource Link: ${linkName}]\nURI: ${linkUri}`,
			}
		}
		if (c.type === "audio") {
			return {
				type: "text" as const,
				text: `[Audio content: ${c.mimeType ?? "audio/*"}]`,
			}
		}
		return { type: "text" as const, text: JSON.stringify(c) }
	})
}
