/**
 * Orchestration prompt enrichment extension.
 *
 * Behavior depends on whether this process is the main model or a subagent
 * (detected via the KIMCHI_SUBAGENT env var set during subagent spawning).
 *
 * Main model mode:
 * - "input": wraps the user prompt with the current model's own capabilities
 *   and the available subagent models so the model can self-classify the task
 *   and decide which steps to execute itself vs. delegate.
 * - "before_agent_start": injects the self-classification system prompt with
 *   full tool access (read, write, edit, bash, subagent).
 *
 * Subagent mode:
 * - "input": passes through unchanged.
 * - "before_agent_start": injects the pure worker system prompt. Filters out
 *   the subagent tool to prevent infinite delegation chains.
 *
 * Steering messages are excluded — when the agent is streaming, the handler
 * returns "continue" so the message passes through unchanged.
 */

import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { homedir, platform, userInfo } from "node:os"
import { isAbsolute, join, normalize, resolve } from "node:path"
import type { ImageContent, TextContent } from "@mariozechner/pi-ai"
import { type ExtensionAPI, type Skill, loadSkills } from "@mariozechner/pi-coding-agent"
import { ANSI, fg } from "../../ansi.js"
import { getAvailableModels } from "../../startup-context.js"
import { getGitBranch } from "../../utils.js"
import {
	CONTINUATION_NUDGE_TEXT,
	ContinuationNudge,
	NUDGE_CUSTOM_TYPE,
	buildEmptyTurnNudgedMessages,
	stripStaleNudges,
} from "./continuation-nudge.js"
import { ModelRegistry } from "./model-registry/index.js"
import { type ContextFile, loadProjectContextFiles } from "./prompt-transformer/context-files.js"
import {
	type EnvironmentInfo,
	buildOrchestratorSystemPrompt,
	buildSubagentSystemPrompt,
	isSubagent,
	transformPrompt,
} from "./prompt-transformer/prompt-transformer.js"

function expandSkillPaths(configuredPaths: string[], cwd: string): string[] {
	const home = homedir()
	const expanded: string[] = []
	for (const p of configuredPaths) {
		if (isAbsolute(p)) {
			expanded.push(normalize(p))
		} else if (p.startsWith("~/")) {
			expanded.push(resolve(home, p.slice(2)))
		} else {
			const fromHome = resolve(home, p)
			const fromCwd = resolve(cwd, p)
			if (fromHome.startsWith(`${home}/`) || fromHome === home) expanded.push(fromHome)
			if (fromCwd.startsWith(`${cwd}/`) || fromCwd === cwd) expanded.push(fromCwd)
		}
	}
	return expanded
}

function safeUsername(): string {
	try {
		return userInfo().username
	} catch {
		return process.env.USER ?? process.env.USERNAME ?? "unknown"
	}
}

function readGitRemote(cwd: string): string | undefined {
	try {
		return (
			execSync("git remote get-url origin", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() ||
			undefined
		)
	} catch {
		return undefined
	}
}

export default function (skillPaths: string[]) {
	return (pi: ExtensionAPI) => {
		const subagentMode = isSubagent()

		pi.registerFlag("debug-prompts", {
			type: "boolean",
			description: "Print enriched prompts in the UI (default: hidden)",
			default: false,
		})

		// For sub agents we don't want to transform the prompt sent from parent with model capabilities
		if (!subagentMode) {
			const registry = new ModelRegistry(getAvailableModels())

			// Announce newly available API models that have no capability entry yet.
			for (const warning of registry.warnings) {
				console.log(
					`${fg(ANSI.accent, ` New model available: "kimchi-dev/${warning.modelId}"`)}\n${fg(ANSI.dim, " Update the app or add the new model to model capabilities config to unlock orchestration support.")}`,
				)
			}

			// Detect the inverse of the context-event nudge below: the orchestrator reasons
			// in prose, announces it will delegate, and ends its turn without emitting the
			// `subagent` tool call. The agent loop would otherwise exit and wait for another
			// user prompt. Nudge once per user-input cycle, and only when no tool has fired
			// that cycle — so genuine end-of-task summaries are left alone. Mirrors AISI
			// Inspect's `on_continue`.
			//
			// The reset handler is registered BEFORE the enrichment handler below because
			// that one returns `{action: "handled"}` in interactive mode, which short-
			// circuits the input-handler chain.
			const continuationNudge = new ContinuationNudge()

			pi.on("input", async (event) => {
				if (event.source === "extension") return
				continuationNudge.resetForNewUserInput()
			})

			pi.on("tool_execution_start", async () => {
				continuationNudge.recordToolCall()
			})

			pi.on("turn_end", async (event) => {
				if (event.message.role !== "assistant") return
				const { shouldNudge } = continuationNudge.evaluateTurn(event.message)
				if (!shouldNudge) return
				pi.sendMessage(
					{ customType: NUDGE_CUSTOM_TYPE, content: CONTINUATION_NUDGE_TEXT, display: false },
					{ deliverAs: "followUp" },
				)
			})

			pi.on("input", async (event, ctx) => {
				if (event.source === "extension") {
					return { action: "continue" as const }
				}

				// Steering and follow-up messages arrive while the agent is streaming
				// (ctx.isIdle() === false, i.e. session.isStreaming === true).
				// Skip enrichment and let them pass through unchanged
				if (!ctx.isIdle()) {
					return { action: "continue" as const }
				}

				const currentModel = ctx.model ? { id: ctx.model.id, name: ctx.model.id } : undefined
				const enrichedPrompt = transformPrompt(event.text, registry, currentModel)

				// Non-interactive (--print/--mode rpc) and debug-prompts mode: replace the user
				// text inline. The "handled" + sendUserMessage path below relies on the TUI event
				// loop staying alive long enough for the queued message to drain — in --print mode
				// the loop returns as soon as session.prompt resolves and disposeRuntime cancels
				// the in-flight LLM call, so nothing is ever sent. Transforming inline lets the
				// caller's await session.prompt(enrichedPrompt) do the work synchronously.
				const debugPrompts = pi.getFlag("debug-prompts") === true
				if (debugPrompts || !ctx.hasUI) {
					return { action: "transform" as const, text: enrichedPrompt, images: event.images }
				}

				pi.sendMessage(
					{ customType: "enriched-prompt", content: [{ type: "text", text: enrichedPrompt }], display: false },
					{ deliverAs: "nextTurn" },
				)
				const userContent: (TextContent | ImageContent)[] = [{ type: "text", text: event.text }]
				if (event.images) userContent.push(...event.images)
				pi.sendUserMessage(userContent)

				return { action: "handled" as const }
			})


			// Pre-LLM-call complement of the turn_end nudge above: the model returned only
			// tool calls with no text, tool results are queued, and it is about to be
			// called again. Some Kimi deployments return an empty response on this specific
			// follow-up; a custom-role nudge injected transiently into the context prevents it
			// without polluting the session history.
			pi.on("context", async (event) => {
				const cleaned = stripStaleNudges(event.messages)
				const nudged = buildEmptyTurnNudgedMessages(cleaned)
				if (nudged) return { messages: nudged }
				if (cleaned !== event.messages) return { messages: cleaned }
			})	
		}

		const platformNames: Record<string, string> = { darwin: "macOS", win32: "Windows" }
		const cachedOs = platformNames[platform()] ?? platform()
		const cachedUsername = safeUsername()
		const cachedHomeDir = homedir()

		let cachedContextFiles: ContextFile[] | undefined
		let cachedSkills: Skill[] | undefined
		let cachedGitRemote: string | undefined | null = null

		pi.on("before_agent_start", async (_event, ctx) => {
			const tools = pi.getAllTools()
			cachedContextFiles ??= loadProjectContextFiles(ctx.cwd)
			cachedSkills ??= loadSkills({
				cwd: ctx.cwd,
				skillPaths: expandSkillPaths(skillPaths, ctx.cwd),
			}).skills

			const now = new Date()
			const isGitRepo = existsSync(join(ctx.cwd, ".git", "HEAD"))
			if (isGitRepo && cachedGitRemote === null) {
				cachedGitRemote = readGitRemote(ctx.cwd)
			}
			const env: EnvironmentInfo = {
				os: cachedOs,
				username: cachedUsername,
				homeDir: cachedHomeDir,
				cwd: ctx.cwd,
				currentTime: now.toISOString(),
				localDate: now.toLocaleDateString("en-CA"),
				isGitRepo,
				gitBranch: isGitRepo ? getGitBranch(ctx.cwd) : undefined,
				gitRemote: isGitRepo ? (cachedGitRemote ?? undefined) : undefined,
			}

			if (subagentMode) {
				// Filter the subagent tool out of the active tool set to prevent
				// the subagent from spawning further subagents.
				const activeTools = pi.getActiveTools().filter((name) => name !== "subagent")
				pi.setActiveTools(activeTools)

				const systemPrompt = buildSubagentSystemPrompt(tools, env, cachedContextFiles, cachedSkills)
				return { systemPrompt }
			}

			const systemPrompt = buildOrchestratorSystemPrompt(tools, env, cachedContextFiles, cachedSkills)
			return { systemPrompt }
		})
	}
}
