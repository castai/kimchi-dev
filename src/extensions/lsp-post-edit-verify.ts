// extensions/lsp-post-edit-verify.ts
/**
 * LSP-based Post-Edit Verification Extension
 *
 * Uses LSP incremental diagnostics instead of expensive tsc --noEmit.
 * Runs after every file edit, waits for diagnostics, injects errors on failure.
 *
 * "Success is silent, failures are verbose"
 *
 * Usage: Loaded by default in cli.ts
 */
import path from "node:path"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { getOrCreateClient, refreshFile } from "./lsp/client.js"
import { detectServers, serverForFile } from "./lsp/servers.js"
import { fileToUri } from "./lsp/utils.js"

const DIAGNOSTICS_WAIT_MS = 1000 // Wait 1s for LSP to publish diagnostics
const MAX_WAIT_MS = 3000 // Cap total wait at 3s

export default function (pi: ExtensionAPI) {
	let cwd = ""
	let activeServers: ReturnType<typeof detectServers> = []

	pi.on("session_start", async (_event, ctx) => {
		cwd = ctx.cwd
		activeServers = detectServers(cwd)
	})

	pi.on("session_shutdown", async () => {
		// Cleanup if needed
	})

	pi.on("tool_result", async (event) => {
		if (!("toolName" in event)) return
		if (event.toolName !== "edit" && event.toolName !== "write") return
		if (event.isError) return

		const input = event.input as Record<string, unknown>
		const filePath = (input.file_path ?? input.path) as string | undefined
		if (!filePath) return

		const resolved = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath)

		// Only verify supported file types
		const server = serverForFile(resolved, activeServers)
		if (!server) return

		try {
			const client = await getOrCreateClient(server, cwd)

			// Refresh the file in LSP (reuses LSP extension's logic)
			await refreshFile(client, resolved)

			// Wait for diagnostics to be published
			const uri = fileToUri(resolved)
			const startVersion = client.diagnosticsVersion
			const startTime = Date.now()

			// Poll for diagnostics with incremental backoff
			let diagnostics: ReturnType<typeof client.diagnostics.get>
			while (Date.now() - startTime < MAX_WAIT_MS) {
				diagnostics = client.diagnostics.get(uri)
				// Check if we have new diagnostics
				if (diagnostics && client.diagnosticsVersion > startVersion) {
					break
				}
				// Wait a bit
				await new Promise((r) => setTimeout(r, 100))
			}

			// Check if we got diagnostics with errors
			diagnostics = client.diagnostics.get(uri)
			if (!diagnostics || diagnostics.diagnostics.length === 0) {
				// Success is silent
				return
			}

			// Filter to errors only (not warnings)
			const errors = diagnostics.diagnostics.filter((d) => d.severity === 1) // 1 = Error
			if (errors.length === 0) {
				// Only warnings, silent
				return
			}

			// Format errors for injection
			const lines = errors.map((d) => {
				const loc = d.range?.start
				const pos = loc ? `${loc.line + 1}:${loc.character + 1}` : ""
				return `${pos} ${d.message}`
			})

			pi.sendMessage(
				{
					customType: "lsp-type-error",
					content: [
						{
							type: "text",
							text: `Type errors in ${path.basename(filePath)} (${errors.length}):\n\n${lines.join("\n")}`,
						},
					],
					display: true,
				},
				{ deliverAs: "followUp" },
			)
		} catch {
			// LSP failure is non-fatal
		}
	})
}
