import { spawn } from "node:child_process"
import * as fs from "node:fs"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { Type } from "@sinclair/typebox"

interface AssistantMessage {
	role: "assistant"
	content: Array<{ type: string; text?: string }>
}

function getSubagentInvocation(args: string[]): { command: string; args: string[] } {
	const currentScript = process.argv[1]
	if (currentScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...args] }
	}
	return { command: process.execPath, args }
}

function getFinalAssistantText(messages: AssistantMessage[]): string {
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i]
		if (msg.role === "assistant") {
			for (const part of msg.content) {
				if (part.type === "text" && part.text) return part.text
			}
		}
	}
	return ""
}

const SubagentParams = Type.Object({
	model: Type.String({ description: "Model ID to use for the subagent (e.g. glm-5-fp8, kimi-k2.5)" }),
	prompt: Type.String({ description: "Prompt to send to the subagent" }),
})

export default function (pi: ExtensionAPI) {
	pi.registerTool({
		name: "subagent",
		label: "Subagent",
		description:
			"Spawn an isolated subagent process with the given model and prompt. " +
			"The subagent runs in a separate pi process with no shared context and returns its final response.",
		parameters: SubagentParams,

		async execute(_toolCallId, params, signal, _onUpdate, ctx) {
			const args = ["--mode", "json", "-p", "--no-session", "--model", params.model, params.prompt]
			const invocation = getSubagentInvocation(args)

			const messages: AssistantMessage[] = []
			let stderr = ""

			const exitCode = await new Promise<number>((resolve) => {
				const proc = spawn(invocation.command, invocation.args, {
					cwd: ctx.cwd,
					shell: false,
					stdio: ["ignore", "pipe", "pipe"],
				})

				let buffer = ""

				const processLine = (line: string) => {
					if (!line.trim()) return
					let event: Record<string, unknown>
					try {
						event = JSON.parse(line)
					} catch {
						return
					}
					const msg = event.message as AssistantMessage | undefined
					if (event.type === "message_end" && msg?.role === "assistant") {
						messages.push(msg)
					}
				}

				proc.stdout.on("data", (data: Buffer) => {
					buffer += data.toString()
					const lines = buffer.split("\n")
					buffer = lines.pop() ?? ""
					for (const line of lines) processLine(line)
				})

				proc.stderr.on("data", (data: Buffer) => {
					stderr += data.toString()
				})

				proc.on("close", (code) => {
					if (buffer.trim()) processLine(buffer)
					resolve(code ?? 0)
				})

				proc.on("error", () => resolve(1))

				if (signal) {
					const kill = () => {
						proc.kill("SIGTERM")
						setTimeout(() => {
							if (!proc.killed) proc.kill("SIGKILL")
						}, 5000)
					}
					if (signal.aborted) kill()
					else signal.addEventListener("abort", kill, { once: true })
				}
			})

			const output = getFinalAssistantText(messages)

			if (exitCode !== 0) {
				const errorMsg = output || stderr.trim() || "(no output)"
				return {
					content: [{ type: "text", text: `Subagent failed (exit ${exitCode}): ${errorMsg}` }],
					details: undefined,
					isError: true,
				}
			}

			return {
				content: [{ type: "text", text: output || "(no output)" }],
				details: undefined,
			}
		},
	})
}
