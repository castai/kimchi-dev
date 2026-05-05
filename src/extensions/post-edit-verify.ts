// extensions/post-edit-verify.ts
/**
 * Post-Edit Verification Extension
 *
 * Runs lint and typecheck after every file edit (write or edit tools).
 * "Success is silent, failures are verbose" — only injects output on failure.
 *
 * Usage: kimchi -e extensions/post-edit-verify.ts
 */
import { spawn } from "node:child_process"
import path from "node:path"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

interface CommandResult {
	success: boolean
	output: string
}

const LINT_TIMEOUT_MS = 30000
const TYPECHECK_TIMEOUT_MS = 60000

function runCommand(command: string, cwd: string, timeoutMs: number): Promise<CommandResult> {
	return new Promise((resolve) => {
		const [cmd, ...args] = command.split(" ")
		const proc = spawn(cmd, args, { cwd, shell: false })

		let stdout = ""
		let stderr = ""
		let timedOut = false

		const timeoutHandle = setTimeout(() => {
			timedOut = true
			proc.kill("SIGTERM")
		}, timeoutMs)

		proc.stdout.on("data", (data: Buffer) => {
			stdout += data.toString()
		})

		proc.stderr.on("data", (data: Buffer) => {
			stderr += data.toString()
		})

		proc.on("close", (code) => {
			clearTimeout(timeoutHandle)
			const output = stdout + (stderr ? `\n${stderr}` : "")
			if (timedOut) {
				resolve({ success: false, output: `Command timed out after ${timeoutMs}ms` })
			} else {
				resolve({ success: code === 0, output: output.trim() })
			}
		})

		proc.on("error", (err) => {
			clearTimeout(timeoutHandle)
			resolve({ success: false, output: err.message })
		})
	})
}

export default function (pi: ExtensionAPI) {
	let cwd = ""

	pi.on("session_start", async (_event, ctx) => {
		cwd = ctx.cwd
	})

	pi.on("tool_result", async (event) => {
		if (!("toolName" in event)) return
		if (event.toolName !== "edit" && event.toolName !== "write") return
		if (event.isError) return

		const input = event.input as Record<string, unknown>
		const filePath = (input.file_path ?? input.path) as string | undefined
		if (!filePath) return

		const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath)

		// Only verify files in src/ directory
		if (!absolutePath.includes("/src/") && !absolutePath.startsWith("src/")) {
			return
		}

		// Run lint:fix first
		const lintResult = await runCommand("pnpm run lint:fix", cwd, LINT_TIMEOUT_MS)
		if (!lintResult.success) {
			pi.sendMessage(
				{
					customType: "post-edit-lint-error",
					content: [
						{ type: "text", text: `Lint errors after editing ${path.basename(filePath)}:\n\n${lintResult.output}` },
					],
					display: true,
				},
				{ deliverAs: "followUp" },
			)
			return
		}

		// Then run typecheck
		const typeResult = await runCommand("pnpm run typecheck", cwd, TYPECHECK_TIMEOUT_MS)
		if (!typeResult.success) {
			pi.sendMessage(
				{
					customType: "post-edit-type-error",
					content: [
						{ type: "text", text: `Type errors after editing ${path.basename(filePath)}:\n\n${typeResult.output}` },
					],
					display: true,
				},
				{ deliverAs: "followUp" },
			)
		}
		// Success is silent — no message injected
	})
}
