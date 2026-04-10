import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent"
import { Container, Spacer, Text } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"
import { isBunBinary } from "../env.js"

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
const PROMPT_MAX_LENGTH = 60
const FOOTER_STATUS_KEY = "subagent-sessions"
const STDERR_MAX = 8192
const TIMEOUT_MS = 15 * 60 * 1000

interface SubagentState {
	spinnerIdx: number
	spinnerInterval: ReturnType<typeof setInterval> | undefined
}

type SubagentFailureReason = "exit_error" | "timeout" | "token_budget_exceeded"

interface SubagentTokenUsage {
	input: number
	output: number
}

interface SubagentResult {
	exitCode: number
	accumulated: string
	stderr: string
	tokenUsage: SubagentTokenUsage
	failureReason: SubagentFailureReason | undefined
	durationMs: number
}

interface SubagentError {
	reason: SubagentFailureReason
	model: string
	tokenUsage: SubagentTokenUsage
	durationMs: number
	detail: string
}

interface ParsedSubagentEvent {
	delta: string | null
	tokensUsed: number
}

function resolveTsx(): string | undefined {
	let dir = dirname(process.argv[1])
	while (true) {
		const candidate = resolve(dir, "node_modules/.bin/tsx")
		if (existsSync(candidate)) return candidate
		if (existsSync(resolve(dir, "package.json"))) break
		const parent = dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return undefined
}

function getSubagentInvocation(args: string[]): { command: string; args: string[] } {
	if (isBunBinary) {
		return { command: process.execPath, args }
	}
	if (process.argv[1].endsWith(".ts")) {
		const tsx = resolveTsx()
		if (tsx !== undefined) {
			return { command: tsx, args: [process.argv[1], ...args] }
		}
		throw new Error(
			"Dev mode requires tsx to spawn subagents, but node_modules/.bin/tsx was not found. Run `pnpm install`.",
		)
	}
	return { command: process.execPath, args: [process.argv[1], ...args] }
}

// Parses a single JSON line from the subagent's --mode json stdout stream.
// Returns text delta from message_update/text_delta events, and total tokens
// (input + output) from message_end events.
// The event shapes are internal to pi-coding-agent and may change across versions.
export function parseSubagentEvent(line: string): ParsedSubagentEvent {
	if (!line.trim()) return { delta: null, tokensUsed: 0 }
	let event: Record<string, unknown>
	try {
		event = JSON.parse(line)
	} catch {
		return { delta: null, tokensUsed: 0 }
	}

	if (event.type === "message_update") {
		const assistantEvent = event.assistantMessageEvent as Record<string, unknown> | undefined
		if (assistantEvent?.type === "text_delta" && typeof assistantEvent.delta === "string") {
			return { delta: assistantEvent.delta, tokensUsed: 0 }
		}
		return { delta: null, tokensUsed: 0 }
	}

	if (event.type === "message_end") {
		const message = event.message as Record<string, unknown> | undefined
		const usage = message?.usage as Record<string, unknown> | undefined
		if (usage) {
			const input = typeof usage.input === "number" ? usage.input : 0
			const output = typeof usage.output === "number" ? usage.output : 0
			return { delta: null, tokensUsed: input + output }
		}
	}

	return { delta: null, tokensUsed: 0 }
}

function spawnSubagent(
	invocation: { command: string; args: string[] },
	cwd: string,
	signal: AbortSignal | undefined,
	tokenBudget: number | undefined,
	onToken: (accumulated: string) => void,
): Promise<SubagentResult> {
	return new Promise((resolve) => {
		const startedAt = Date.now()

		const timeoutController = new AbortController()
		const timeoutHandle = setTimeout(() => timeoutController.abort(), TIMEOUT_MS)

		const combinedSignal =
			signal !== undefined ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal

		const proc = spawn(invocation.command, invocation.args, {
			cwd,
			shell: false,
			stdio: ["ignore", "pipe", "pipe"],
			env: { ...process.env, KIMCHI_SUBAGENT: "1" },
		})

		let buffer = ""
		let accumulated = ""
		let stderr = ""
		let totalTokensUsed = 0
		let inputTokens = 0
		let outputTokens = 0
		let failureReason: SubagentFailureReason | undefined

		const finish = (exitCode: number) => {
			clearTimeout(timeoutHandle)
			resolve({
				exitCode,
				accumulated,
				stderr,
				tokenUsage: { input: inputTokens, output: outputTokens },
				failureReason,
				durationMs: Date.now() - startedAt,
			})
		}

		const kill = (reason: SubagentFailureReason) => {
			if (failureReason === undefined) {
				failureReason = reason
			}
			proc.kill("SIGTERM")
			setTimeout(() => {
				if (!proc.killed) proc.kill("SIGKILL")
			}, 5000)
		}

		const processLine = (line: string) => {
			const { delta, tokensUsed } = parseSubagentEvent(line)
			if (delta !== null) {
				accumulated += delta
				onToken(accumulated)
			}
			if (tokensUsed > 0) {
				totalTokensUsed += tokensUsed
				// Approximate split: pi-agent-core reports input+output combined in message_end.
				// We track the running total and attribute the increment proportionally on each
				// message_end. For budget enforcement the total is what matters.
				inputTokens = Math.round(totalTokensUsed * 0.6)
				outputTokens = totalTokensUsed - inputTokens
				if (tokenBudget !== undefined && totalTokensUsed > tokenBudget) {
					kill("token_budget_exceeded")
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
				stderr = stderr.slice(0, STDERR_MAX)
			}
		})

		proc.on("close", (code) => {
			if (buffer.trim()) processLine(buffer)
			finish(code ?? 0)
		})

		proc.on("error", (err) => {
			clearTimeout(timeoutHandle)
			resolve({
				exitCode: 1,
				accumulated,
				stderr: stderr || err.message,
				tokenUsage: { input: inputTokens, output: outputTokens },
				failureReason: failureReason ?? "exit_error",
				durationMs: Date.now() - startedAt,
			})
		})

		const onAbort = () => {
			if (timeoutController.signal.aborted && failureReason === undefined) {
				kill("timeout")
			} else if (failureReason === undefined) {
				kill("exit_error")
			}
		}

		if (combinedSignal.aborted) {
			onAbort()
		} else {
			combinedSignal.addEventListener("abort", onAbort, { once: true })
			proc.on("close", () => combinedSignal.removeEventListener("abort", onAbort))
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

function buildErrorResponse(error: SubagentError): string {
	return JSON.stringify(error)
}

const SubagentParams = Type.Object({
	provider: Type.String({
		description:
			'Provider name for the subagent model (e.g. "kimchi-dev"). Must match the provider registered in models.json.',
	}),
	model: Type.String({ description: "Model ID to use for the subagent (e.g. glm-5-fp8, kimi-k2.5)" }),
	prompt: Type.String({ description: "Prompt to send to the subagent" }),
	tokenBudget: Type.Optional(
		Type.Integer({
			description: "Maximum total tokens (input + output) the subagent may consume. Subagent is killed when exceeded.",
			minimum: 1,
		}),
	),
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
			"Spawn an isolated subagent process with the given provider, model, and prompt. " +
			'Both provider and model are required — provider must match the model\'s registered provider name (e.g. "kimchi-dev"). ' +
			`The subagent runs in a separate pi process with no shared context and returns its final response. Hard timeout: ${TIMEOUT_MS / 60000} minutes.`,
		parameters: SubagentParams,

		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			const args = [
				"--mode",
				"json",
				"-p",
				"--no-session",
				"--provider",
				params.provider,
				"--model",
				params.model,
				params.prompt,
			]
			const invocation = getSubagentInvocation(args)

			const { exitCode, accumulated, stderr, tokenUsage, failureReason, durationMs } = await spawnSubagent(
				invocation,
				ctx.cwd,
				signal,
				params.tokenBudget,
				(text) => onUpdate?.({ content: [{ type: "text", text }], details: undefined }),
			)

			sessionCounts.set(params.model, (sessionCounts.get(params.model) ?? 0) + 1)
			if (ctx.hasUI) {
				ctx.ui.setStatus(FOOTER_STATUS_KEY, formatFooterStatus(sessionCounts, ctx.ui.theme))
			}

			if (failureReason !== undefined || exitCode !== 0) {
				const error: SubagentError = {
					reason: failureReason ?? "exit_error",
					model: params.model,
					tokenUsage,
					durationMs,
					detail: stderr.trim() || accumulated || "(no output)",
				}
				return {
					content: [{ type: "text", text: buildErrorResponse(error) }],
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
			const modelLine = `  ${theme.fg("muted", "model:")}  ${theme.fg("accent", "`")}${theme.fg("accent", `${args.provider ?? ""}/${args.model ?? ""}`)}${theme.fg("accent", "`")}`
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
