import { ConsentError } from "./errors.js"
import { logger } from "./logger.js"

export type ToolConsentMode = "never" | "once-per-server" | "always"

export class ConsentManager {
	private approvedServers = new Set<string>()
	private deniedServers = new Set<string>()
	private log = logger.child({ component: "ConsentManager" })

	constructor(private mode: ToolConsentMode = "once-per-server") {
		this.log.debug("Initialized", { mode })
	}

	requiresPrompt(serverName: string): boolean {
		if (this.mode === "never") return false
		if (this.deniedServers.has(serverName)) return true
		if (this.mode === "always") return true
		return !this.approvedServers.has(serverName)
	}

	shouldCacheConsent(): boolean {
		return this.mode !== "always"
	}

	registerDecision(serverName: string, approved: boolean): void {
		this.deniedServers.delete(serverName)
		this.approvedServers.delete(serverName)

		if (approved) {
			this.approvedServers.add(serverName)
			this.log.debug("Consent granted", { server: serverName })
			return
		}

		this.deniedServers.add(serverName)
		this.log.debug("Consent denied", { server: serverName })
	}

	ensureApproved(serverName: string): void {
		if (this.mode === "never") return
		if (this.deniedServers.has(serverName)) {
			throw new ConsentError(serverName, { denied: true })
		}
		if (!this.approvedServers.has(serverName)) {
			throw new ConsentError(serverName, { requiresApproval: true })
		}
		if (this.mode === "always") {
			this.approvedServers.delete(serverName)
		}
	}

	clear(serverName?: string): void {
		if (serverName) {
			this.approvedServers.delete(serverName)
			this.deniedServers.delete(serverName)
			this.log.debug("Cleared consent for server", { server: serverName })
			return
		}
		this.approvedServers.clear()
		this.deniedServers.clear()
		this.log.debug("Cleared all consent records")
	}
}
