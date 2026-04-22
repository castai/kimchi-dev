import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { AssistantMessage, ToolCall } from "@mariozechner/pi-ai"
import type { ExtensionAPI, SessionEntry, Theme } from "@mariozechner/pi-coding-agent"
import { Container, Spacer, Text, truncateToWidth, wrapTextWithAnsi } from "@mariozechner/pi-tui"
import { Type } from "@sinclair/typebox"
import { isBunBinary } from "../env.js"
import { formatCount } from "./format.js"
import { type SpinnerState, clearSpinner, spinnerFrame, tickSpinner } from "./spinner.js"

const PROMPT_MAX_LENGTH = 60
const FOOTER_STATUS_KEY = "subagent-sessions"
const STDERR_MAX = 8192
const TIMEOUT_MS = 30 * 60 * 1000
const CHECKPOINT_END_TYPE = "subagent-end"
const RECOVERY_MESSAGE_TYPE = "subagent-recovery"
const INTERRUPTED_MESSAGE_TYPE = "subagent-interrupted"

interface SubagentEndCheckpoint {
	toolCallId: string
	accumulated: string
	exitCode: number
	failureReason: SubagentFailureReason | undefined
}

interface SubagentState extends SpinnerState {
	lastToolCall: string | undefined
}

type SubagentFailureReason = "exit_error" | "timeout" | "token_budget_exceeded" | "aborted"

interface SubagentTokenUsage {
	input: number
	output: number
	cacheRead: number
	cacheWrite: number
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
	inputTokens: number
	outputTokens: number
	cacheReadTokens: number
	cacheWriteTokens: number
	toolCall: { name: string; args: Record<string, unknown> } | null
}

function findDanglingSubagentCalls(branch: SessionEntry[]): ToolCall[] {
	const toolResultIds = new Set<string>()
	let lastToolUseMessage: AssistantMessage | undefined
	for (const entry of branch) {
		if (entry.type !== "message") continue
		const { message } = entry
		if (message.role === "toolResult") toolResultIds.add(message.toolCallId)
		else if (message.role === "assistant" && message.stopReason === "toolUse")
			lastToolUseMessage = message as AssistantMessage
	}
	if (!lastToolUseMessage) return []
	return lastToolUseMessage.content
		.filter((c): c is ToolCall => c.type === "toolCall" && c.name === "subagent")
		.filter((tc) => !toolResultIds.has(tc.id))
}

function findCheckpointInBranch<T extends { toolCallId: string }>(
	branch: SessionEntry[],
	customType: string,
	toolCallId: string,
): T | undefined {
	for (const entry of branch) {
		if (entry.type !== "custom" || entry.customType !== customType) continue
		const data = entry.data as T
		if (data?.toolCallId === toolCallId) return data
	}
	return undefined
}

function isAlreadyRecovered(branch: SessionEntry[]): boolean {
	return branch.some(
		(e) =>
			e.type === "custom_message" &&
			(e.customType === RECOVERY_MESSAGE_TYPE || e.customType === INTERRUPTED_MESSAGE_TYPE),
	)
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

function collectExtensionArgs(): string[] {
	const result: string[] = []
	const argv = process.argv
	for (let i = 0; i < argv.length; i++) {
		if (argv[i] === "-e" || argv[i] === "--extension") {
			if (i + 1 < argv.length) {
				result.push("-e", argv[i + 1])
				i++
			}
		} else if (argv[i].startsWith("--extension=")) {
			result.push("-e", argv[i].slice("--extension=".length))
		}
	}
	return result
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
// Returns text delta from message_update/text_delta events, and separate
// input/output token counts from message_end events.
// The event shapes are internal to pi-coding-agent and may change across versions.
export function parseSubagentEvent(line: string): ParsedSubagentEvent {
	const empty = {
		delta: null,
		inputTokens: 0,
		outputTokens: 0,
		cacheReadTokens: 0,
		cacheWriteTokens: 0,
		toolCall: null,
	}
	if (!line.trim()) return empty
	let event: Record<string, unknown>
	try {
		event = JSON.parse(line)
	} catch {
		return empty
	}

	if (event.type === "message_update") {
		const assistantEvent = event.assistantMessageEvent as Record<string, unknown> | undefined
		if (assistantEvent?.type === "text_delta" && typeof assistantEvent.delta === "string") {
			return { ...empty, delta: assistantEvent.delta }
		}
		return empty
	}

	if (event.type === "message_end") {
		const message = event.message as Record<string, unknown> | undefined
		const usage = message?.usage as Record<string, unknown> | undefined
		if (usage) {
			const inputTokens = typeof usage.input === "number" ? usage.input : 0
			const outputTokens = typeof usage.output === "number" ? usage.output : 0
			const cacheReadTokens = typeof usage.cacheRead === "number" ? usage.cacheRead : 0
			const cacheWriteTokens = typeof usage.cacheWrite === "number" ? usage.cacheWrite : 0
			return { ...empty, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens }
		}
	}

	if (event.type === "tool_execution_start") {
		const name = typeof event.toolName === "string" && event.toolName.length > 0 ? event.toolName : null
		const args = event.args !== null && typeof event.args === "object" ? (event.args as Record<string, unknown>) : {}
		if (name !== null) {
			return { ...empty, toolCall: { name, args } }
		}
	}

	return empty
}

function spawnSubagent(
	invocation: { command: string; args: string[] },
	cwd: string,
	signal: AbortSignal | undefined,
	tokenBudget: number | undefined,
	onToken: (accumulated: string) => void,
	onToolCall: (name: string, args: Record<string, unknown>, accumulated: string) => void,
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
		let inputTokens = 0
		let outputTokens = 0
		let cacheReadTokens = 0
		let cacheWriteTokens = 0
		let failureReason: SubagentFailureReason | undefined
		let closed = false

		const finish = (exitCode: number) => {
			clearTimeout(timeoutHandle)
			combinedSignal.removeEventListener("abort", onAbort)
			resolve({
				exitCode,
				accumulated,
				stderr,
				tokenUsage: {
					input: inputTokens,
					output: outputTokens,
					cacheRead: cacheReadTokens,
					cacheWrite: cacheWriteTokens,
				},
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
				if (!closed) proc.kill("SIGKILL")
			}, 5000)
		}

		const processLine = (line: string) => {
			const {
				delta,
				inputTokens: lineInput,
				outputTokens: lineOutput,
				cacheReadTokens: lineCacheRead,
				cacheWriteTokens: lineCacheWrite,
				toolCall,
			} = parseSubagentEvent(line)
			if (delta !== null) {
				accumulated += delta
				onToken(accumulated)
			}
			if (lineInput > 0 || lineOutput > 0) {
				inputTokens += lineInput
				outputTokens += lineOutput
				if (tokenBudget !== undefined && tokenBudget > 0 && inputTokens + outputTokens > tokenBudget) {
					kill("token_budget_exceeded")
				}
			}
			cacheReadTokens += lineCacheRead
			cacheWriteTokens += lineCacheWrite
			if (toolCall !== null) {
				onToolCall(toolCall.name, toolCall.args, accumulated)
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
			closed = true
			if (buffer.trim()) processLine(buffer)
			finish(code ?? 0)
		})

		proc.on("error", (err) => {
			closed = true
			if (failureReason === undefined) failureReason = "exit_error"
			stderr = stderr || err.message
			finish(1)
		})

		const onAbort = () => {
			if (timeoutController.signal.aborted) {
				kill("timeout")
			} else if (failureReason === undefined) {
				kill("aborted")
			}
		}

		if (combinedSignal.aborted) {
			onAbort()
		} else {
			combinedSignal.addEventListener("abort", onAbort, { once: true })
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

interface SubagentStats {
	durationMs: number
	tokenUsage: SubagentTokenUsage
}

function formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`
	return `${(ms / 1000).toFixed(1)}s`
}

function formatStats(stats: SubagentStats, theme: Theme): string {
	const duration = theme.fg("dim", formatDuration(stats.durationMs))
	const input = theme.fg("dim", `↑${formatCount(stats.tokenUsage.input)}`)
	const output = theme.fg("dim", `↓${formatCount(stats.tokenUsage.output)}`)
	return `- ${duration}  ${input}  ${output}`
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
			description:
				"Maximum total tokens (input + output) the subagent may consume. Subagent is killed when exceeded. Omit unless you have an explicit reason to cap token usage — do not set this speculatively.",
			minimum: 1,
		}),
	),
})

export default function (pi: ExtensionAPI) {
	const sessionCounts = new Map<string, number>()

	pi.on("session_start", (event, ctx) => {
		if (ctx.hasUI) {
			sessionCounts.clear()
			ctx.ui.setStatus(FOOTER_STATUS_KEY, undefined)
		}
		if (event.reason === "new") return
		const branch = ctx.sessionManager.getBranch()
		if (isAlreadyRecovered(branch)) return
		const danglingCalls = findDanglingSubagentCalls(branch)
		if (danglingCalls.length === 0) return
		for (const toolCall of danglingCalls) {
			const endCheckpoint = findCheckpointInBranch<SubagentEndCheckpoint>(branch, CHECKPOINT_END_TYPE, toolCall.id)
			const modelName = ((toolCall.arguments as Record<string, unknown>)?.model as string) ?? "unknown"
			if (endCheckpoint) {
				pi.sendMessage(
					{
						customType: RECOVERY_MESSAGE_TYPE,
						content: [
							{
								type: "text",
								text: `[Subagent (${modelName}) completed but the result was not captured due to session interruption. Recovered output:]\n\n${endCheckpoint.accumulated || "(no output)"}`,
							},
						],
						display: true,
					},
					{ triggerTurn: true },
				)
			} else {
				pi.sendMessage({
					customType: INTERRUPTED_MESSAGE_TYPE,
					content: [
						{
							type: "text",
							text: `[Subagent (${modelName}) was interrupted before completing. The tool call did not return a result.]`,
						},
					],
					display: true,
				})
			}
		}
	})

	pi.registerTool({
		name: "subagent",
		label: "Subagent",
		description: `Spawn an isolated subagent process with the given provider, model, and prompt. Both provider and model are required — provider must match the model's registered provider name (e.g. "kimchi-dev"). The subagent runs in a separate pi process with no shared context and returns its final response. Hard timeout: ${TIMEOUT_MS / 60000} minutes.`,
		parameters: SubagentParams,

		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			const extensionArgs = collectExtensionArgs()
			const args = [
				"--mode",
				"json",
				"-p",
				"--no-session",
				"--provider",
				params.provider,
				"--model",
				params.model,
				...extensionArgs,
				params.prompt,
			]
			const invocation = getSubagentInvocation(args)

			let lastToolCall: string | undefined
			const { exitCode, accumulated, stderr, tokenUsage, failureReason, durationMs } = await spawnSubagent(
				invocation,
				ctx.cwd,
				signal,
				params.tokenBudget,
				(text) => {
					lastToolCall = undefined
					onUpdate?.({ content: [{ type: "text", text }], details: undefined })
				},
				(name, toolArgs, text) => {
					const firstArg = Object.values(toolArgs)[0]
					const argHint =
						typeof firstArg === "string" ? ` ${firstArg.slice(0, 60)}${firstArg.length > 60 ? "…" : ""}` : ""
					lastToolCall = `${name}${argHint}`
					onUpdate?.({ content: [{ type: "text", text }], details: lastToolCall })
				},
			)

			pi.appendEntry<SubagentEndCheckpoint>(CHECKPOINT_END_TYPE, {
				toolCallId: _toolCallId,
				accumulated,
				exitCode,
				failureReason,
			})

			sessionCounts.set(params.model, (sessionCounts.get(params.model) ?? 0) + 1)
			if (ctx.hasUI) {
				ctx.ui.setStatus(FOOTER_STATUS_KEY, formatFooterStatus(sessionCounts, ctx.ui.theme))
			}

			const stats: SubagentStats = { durationMs, tokenUsage }

			if (failureReason !== undefined || exitCode !== 0) {
				const error: SubagentError = {
					reason: failureReason ?? "exit_error",
					model: params.model,
					tokenUsage,
					durationMs,
					detail: stderr.trim() || accumulated || "(no output)",
				}
				return {
					content: [{ type: "text", text: JSON.stringify(error) }],
					details: stats,
					isError: true,
				}
			}

			return {
				content: [{ type: "text", text: accumulated || "(no output)" }],
				details: stats,
			}
		},

		renderCall(args, theme, context) {
			const state = context.state as SubagentState

			const running = context.executionStarted && context.isPartial
			if (!running) {
				clearSpinner(state)
			} else {
				tickSpinner(state, context.invalidate)
			}

			const spinner = running ? theme.fg("accent", spinnerFrame(state)) : theme.fg("muted", "-")

			const header = `${spinner} ${theme.fg("toolTitle", theme.bold("Subagent session"))}`
			const modelLine = `  ${theme.fg("muted", "model:")}  ${theme.fg("accent", "`")}${theme.fg("accent", `${args.provider ?? ""}/${args.model ?? ""}`)}${theme.fg("accent", "`")}`
			const promptLine = `  ${theme.fg("muted", "prompt:")} ${theme.fg("dim", "`")}${theme.fg("dim", truncatePrompt(args.prompt ?? ""))}${theme.fg("dim", "`")}`

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Text(`${header}\n${modelLine}\n${promptLine}`, 0, 0))
			return component
		},

		renderResult(result, options, theme, context) {
			const state = context.state as SubagentState

			if (options.isPartial) {
				state.lastToolCall = result.details as string | undefined
			} else {
				clearSpinner(state)
				state.lastToolCall = undefined
			}

			const textContent = result.content.find((c): c is { type: "text"; text: string } => c.type === "text")
			if (!textContent?.text) return new Text("", 0, 0)

			const toolCall = state.lastToolCall
			const stats = !options.isPartial ? (result.details as SubagentStats | undefined) : undefined

			let displayText: string
			let displayStyle: "dim" | "toolOutput"
			const terminalWidth = process.stdout.columns ?? 80
			if (toolCall) {
				const truncated = truncateToWidth(`> ${toolCall}`, terminalWidth * 5)
				const toolCallVisualLines = wrapTextWithAnsi(truncated, terminalWidth)
				const paddedLines = [
					...toolCallVisualLines.slice(0, 5),
					...Array(5 - Math.min(toolCallVisualLines.length, 5)).fill(""),
				]
				displayText = paddedLines.join("\n")
				displayStyle = "dim"
			} else {
				const nonEmptyLines = textContent.text.split("\n").filter((l) => l.trim())
				const visualLines = nonEmptyLines.flatMap((l) => wrapTextWithAnsi(l, terminalWidth))
				const last5 = visualLines.slice(-5)
				const paddedLines = [...Array(5 - last5.length).fill(""), ...last5]
				displayText = paddedLines.join("\n")
				displayStyle = "toolOutput"
			}

			const detailText = stats !== undefined ? formatStats(stats, theme) : ""

			const component = context.lastComponent instanceof Container ? context.lastComponent : new Container()
			component.clear()
			component.addChild(new Spacer(1))
			component.addChild(new Text(theme.fg(displayStyle, displayText), 0, 0))
			component.addChild(new Spacer(1))
			component.addChild(new Text(detailText, 0, 0))

			return component
		},
	})
}
