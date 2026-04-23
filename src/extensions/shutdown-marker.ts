import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

export const AGENT_END_ENTRY_TYPE = "agent_end"
export const AGENT_TERMINATED_ENTRY_TYPE = "agent_terminated"

export interface AgentEndData {
	timestamp: number
}

export interface AgentTerminatedData {
	reason: "signal"
	timestamp: number
}

type AppendFn = (type: string, data: unknown) => void

export class ShutdownMarker {
	private agentEndWritten = false

	onSessionStart(): void {
		this.agentEndWritten = false
	}

	onAgentEnd(append: AppendFn): void {
		this.agentEndWritten = true
		append(AGENT_END_ENTRY_TYPE, { timestamp: Date.now() } satisfies AgentEndData)
	}

	onSessionShutdown(append: AppendFn): void {
		if (this.agentEndWritten) return
		append(AGENT_TERMINATED_ENTRY_TYPE, { reason: "signal", timestamp: Date.now() } satisfies AgentTerminatedData)
	}
}

export default function shutdownMarkerExtension(pi: ExtensionAPI): void {
	const marker = new ShutdownMarker()

	pi.on("session_start", () => {
		marker.onSessionStart()
	})

	pi.on("agent_end", () => {
		marker.onAgentEnd((type, data) => pi.appendEntry(type, data))
	})

	pi.on("session_shutdown", () => {
		marker.onSessionShutdown((type, data) => pi.appendEntry(type, data))
	})
}
