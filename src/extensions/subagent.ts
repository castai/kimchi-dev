import { spawn } from "node:child_process"
import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent"
import { Container, Spacer, Text } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"
import { isBunBinary } from "../env.js"

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
	if (isBunBinary) {
		// In a compiled Bun binary, process.execPath is the binary itself —
		// pass args directly without a script path.
		return { command: process.execPath, args }
	}
	// In Node.js dev mode, process.argv[1] is the script entrypoint.
	return { command: process.execPath, args: [process.argv[1], ...args] }
}

// Parses a single JSON line from the subagent's --mode json stdout stream and
// returns the text delta if present, or null otherwise.
// The event shape (message_update / assistantMessageEvent / text_delta) is
// internal to pi-coding-agent and may change across versions.
export function parseSubagentEvent(line: string): string | null {
	if (!line.trim()) return null
	let event: Record<string, unknown>
	try {
		event = JSON.parse(line)
	} catch {
		return null
	}
	if (event.type === "message_update") {
		const assistantEvent = event.assistantMessageEvent as Record<string, unknown> | undefined
		if (assistantEvent?.type === "text_delta" && typeof assistantEvent.delta === "string") {
			return assistantEvent.delta
		}
	}
	return null
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
			env: { ...process.env, KIMCHI_SUBAGENT: "1" },
		})

		let buffer = ""
		let accumulated = ""
		let stderr = ""

		const processLine = (line: string) => {
			const delta = parseSubagentEvent(line)
			if (delta !== null) {
				accumulated += delta
				onToken(accumulated)
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
				stderr = stderr.slice(0, STDERR_MAX)
			}
		})

		proc.on("close", (code) => {
			if (buffer.trim()) processLine(buffer)
			resolve({ exitCode: code ?? 0, accumulated, stderr })
		})

		proc.on("error", (err) => resolve({ exitCode: 1, accumulated, stderr: stderr || err.message }))

		if (signal) {
			const kill = () => {
				proc.kill("SIGTERM")
				setTimeout(() => {
					if (!proc.killed) proc.kill("SIGKILL")
				}, 5000)
			}
			if (signal.aborted) kill()
			else {
				signal.addEventListener("abort", kill, { once: true })
				proc.on("close", () => signal.removeEventListener("abort", kill))
			}
		}
	})
}

function truncatePrompt(prompt: string): string {
	if (prompt.length <= PROMPT_MAX_LENGTH) return prompt
	return `${prompt.slice(0, PROMPT_MAX_LENGTH)}...`
}

function formatFooterStatus(counts: Map<string, number>, theme: Theme): string {
	const entries = [...counts.entries()].map(([model, n]) => `${model} [${n}]`).join(" | ")
	return theme.fg("dim", `subagents: ${entries}`)
}

function clearSpinner(state: SubagentState) {
	if (state.spinnerInterval) {
		clearInterval(state.spinnerInterval)
		state.spinnerInterval = undefined
	}
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

			const { exitCode, accumulated, stderr } = await spawnSubagent(invocation, ctx.cwd, signal, (text) =>
				onUpdate?.({ content: [{ type: "text", text }], details: undefined }),
			)

			sessionCounts.set(params.model, (sessionCounts.get(params.model) ?? 0) + 1)
			if (ctx.hasUI) {
				ctx.ui.setStatus(FOOTER_STATUS_KEY, formatFooterStatus(sessionCounts, ctx.ui.theme))
			}

			if (exitCode !== 0) {
				const errorMsg = stderr.trim() || accumulated || "(no output)"
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

			if (!context.executionStarted || !context.isPartial) {
				clearSpinner(state)
			} else if (!state.spinnerInterval) {
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

			if (!options.isPartial) {
				clearSpinner(state)
			}

			const textContent = result.content.find((c): c is { type: "text"; text: string } => c.type === "text")
			if (!textContent?.text) return new Text("", 0, 0)

			const displayText = textContent.text.split("\n").slice(-5).join("\n")

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Spacer(1))
			component.addChild(new Text(theme.fg("toolOutput", displayText), 0, 0))
			return component
		},
	})
}
