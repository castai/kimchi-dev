import type { ExtensionContext } from "@mariozechner/pi-coding-agent"
import type { ConsentManager } from "./consent-manager.js"
import type { McpLifecycleManager } from "./lifecycle.js"
import type { McpServerManager } from "./server-manager.js"
import type { McpConfig, ToolMetadata, UiSessionMessages, UiStreamSummary } from "./types.js"
import type { UiResourceHandler } from "./ui-resource-handler.js"
import type { UiServerHandle } from "./ui-server.js"

export interface CompletedUiSession {
	serverName: string
	toolName: string
	completedAt: Date
	reason: string
	messages: UiSessionMessages
	stream?: UiStreamSummary
}

export type SendMessageFn = (
	message: {
		customType: string
		content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }>
		display: boolean
		details?: unknown
	},
	options?: { triggerTurn?: boolean },
) => void

export interface McpExtensionState {
	manager: McpServerManager
	lifecycle: McpLifecycleManager
	toolMetadata: Map<string, ToolMetadata[]>
	config: McpConfig
	failureTracker: Map<string, number>
	uiResourceHandler: UiResourceHandler
	consentManager: ConsentManager
	uiServer: UiServerHandle | null
	completedUiSessions: CompletedUiSession[]
	openBrowser: (url: string) => Promise<void>
	ui?: ExtensionContext["ui"]
	sendMessage?: SendMessageFn
}
