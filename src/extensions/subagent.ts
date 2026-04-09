import { spawn } from "node:child_process"
import * as fs from "node:fs"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import type { Theme } from "@mariozechner/pi-coding-agent"
import { Container, Spacer, Text, visibleWidth } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const PROMPT_MAX_LENGTH = 60
const FOOTER_STATUS_KEY = "subagent-sessions"
const STDERR_MAX = 8192

interface SubagentState {
	spinnerIdx: number
	spinnerInterval: ReturnType<typeof setInterval> | undefined
}

interface SubagentResult {
	exitCode: number
	accumulated: string
	stderr: string
}

function getSubagentInvocation(args: string[]): { command: string; args: string[] } {
	const currentScript = process.argv[1]
	if (currentScript && fs.existsSync(currentScript)) {
		return { command: process.execPath, args: [currentScript, ...args] }
	}
	return { command: process.execPath, args }
}

function spawnSubagent(
	invocation: { command: string; args: string[] },
	cwd: string,
	signal: AbortSignal | undefined,
	onToken: (accumulated: string) => void,
): Promise<SubagentResult> {
	return new Promise((resolve) => {
		const proc = spawn(invocation.command, invocation.args, {
			cwd,
			shell: false,
			stdio: ["ignore", "pipe", "pipe"],
		})

		let buffer = ""
		let accumulated = ""
		let stderr = ""

		const processLine = (line: string) => {
			if (!line.trim()) return
			let event: Record<string, unknown>
			try {
				event = JSON.parse(line)
			} catch {
				return
			}
			if (event.type === "message_update") {
				const assistantEvent = event.assistantMessageEvent as Record<string, unknown> | undefined
				if (assistantEvent?.type === "text_delta" && typeof assistantEvent.delta === "string") {
					accumulated += assistantEvent.delta
					onToken(accumulated)
				}
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
			if (stderr.length > STDERR_MAX) {
				stderr = stderr.slice(-STDERR_MAX)
			}
		})

		proc.on("close", (code) => {
			if (buffer.trim()) processLine(buffer)
			resolve({ exitCode: code ?? 0, accumulated, stderr })
		})

		proc.on("error", () => resolve({ exitCode: 1, accumulated, stderr }))

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
}

function truncatePrompt(prompt: string): string {
	if (prompt.length <= PROMPT_MAX_LENGTH) return prompt
	return `${prompt.slice(0, PROMPT_MAX_LENGTH)}...`
}

function formatFooterStatus(counts: Map<string, number>, theme: Theme): string {
	const entries = [...counts.entries()]
		.map(([model, n]) => `${model} [${n}]`)
		.join(" | ")
	return theme.fg("dim", `subagents: ${entries}`)
}

const SubagentParams = Type.Object({
	model: Type.String({ description: "Model ID to use for the subagent (e.g. glm-5-fp8, kimi-k2.5)" }),
	prompt: Type.String({ description: "Prompt to send to the subagent" }),
})

export default function (pi: ExtensionAPI) {
	const sessionCounts = new Map<string, number>()

	pi.on("session_start", (_event, ctx) => {
		if (!ctx.hasUI) return
		sessionCounts.clear()
		ctx.ui.setStatus(FOOTER_STATUS_KEY, undefined)
	})

	pi.registerTool({
		name: "subagent",
		label: "Subagent",
		description:
			"Spawn an isolated subagent process with the given model and prompt. " +
			"The subagent runs in a separate pi process with no shared context and returns its final response.",
		parameters: SubagentParams,

		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			const args = ["--mode", "json", "-p", "--no-session", "--model", params.model, params.prompt]
			const invocation = getSubagentInvocation(args)

			const { exitCode, accumulated, stderr } = await spawnSubagent(
				invocation,
				ctx.cwd,
				signal,
				(text) => onUpdate?.({ content: [{ type: "text", text }], details: undefined }),
			)

			sessionCounts.set(params.model, (sessionCounts.get(params.model) ?? 0) + 1)
			if (ctx.hasUI) {
				ctx.ui.setStatus(FOOTER_STATUS_KEY, formatFooterStatus(sessionCounts, ctx.ui.theme))
			}

			if (exitCode !== 0) {
				const errorMsg = accumulated || stderr.trim() || "(no output)"
				return {
					content: [{ type: "text", text: `Subagent failed (exit ${exitCode}): ${errorMsg}` }],
					details: undefined,
					isError: true,
				}
			}

			return {
				content: [{ type: "text", text: accumulated || "(no output)" }],
				details: undefined,
			}
		},

		renderCall(args, theme, context) {
			const state = context.state as SubagentState

			if (context.executionStarted && !context.isPartial && state.spinnerInterval) {
				clearInterval(state.spinnerInterval)
				state.spinnerInterval = undefined
			}

			if (context.executionStarted && context.isPartial && !state.spinnerInterval) {
				state.spinnerIdx = 0
				state.spinnerInterval = setInterval(() => {
					state.spinnerIdx = (state.spinnerIdx + 1) % SPINNER_FRAMES.length
					context.invalidate()
				}, 80)
			}

			const spinner =
				context.executionStarted && context.isPartial
					? theme.fg("accent", SPINNER_FRAMES[state.spinnerIdx ?? 0])
					: theme.fg("muted", "-")

			const header = `${spinner} ${theme.fg("toolTitle", theme.bold("Subagent session"))}`
			const modelLine = `  ${theme.fg("muted", "model:")}  ${theme.fg("accent", "`")}${theme.fg("accent", args.model ?? "")}${theme.fg("accent", "`")}`
			const promptLine = `  ${theme.fg("muted", "prompt:")} ${theme.fg("dim", "`")}${theme.fg("dim", truncatePrompt(args.prompt ?? ""))}${theme.fg("dim", "`")}`

			const component = context.lastComponent ?? new Text("", 0, 0)
			;(component as Text).setText([header, modelLine, promptLine].join("\n"))
			return component
		},

		renderResult(result, options, theme, context) {
			const state = context.state as SubagentState

			if (!options.isPartial && state.spinnerInterval) {
				clearInterval(state.spinnerInterval)
				state.spinnerInterval = undefined
			}

			const text = result.content.find((c) => c.type === "text")
			if (!text || text.type !== "text" || !text.text) return new Text("", 0, 0)

			const displayText = text.text.split("\n").slice(-5).join("\n")

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Spacer(1))
			component.addChild(new Text(theme.fg("toolOutput", displayText), 0, 0))
			return component
		},
	})
}
