import type { ExtensionAPI, ExtensionContext, ToolCallEvent } from "@mariozechner/pi-coding-agent"
import { classifyToolCall } from "./classifier.js"
import { registerCommands } from "./commands.js"
import { type LoadedConfig, ensureUserConfig, loadConfig } from "./config.js"
import { parseModeString, resolveMode } from "./mode.js"
import { promptForApproval } from "./prompts.js"
import { evaluateRules, parseRules } from "./rules.js"
import { SessionMemory } from "./session-memory.js"
import { classifyTool, isReadOnlyBashCommand, isReadOnlyTool } from "./taxonomy.js"
import type { PermissionMode, Rule } from "./types.js"

const READ_ONLY_TOOL_NAMES = ["read", "grep", "find", "ls", "web_search", "web_fetch", "questionnaire"]

// Built-in tools that are always allowed in default/auto modes regardless of config.
const BUILTIN_ALLOW_TOOL_NAMES = ["subagent", "set_phase"]

const MODE_LABELS: Record<PermissionMode, string> = {
	default: "default",
	plan: "plan",
	auto: "yolo",
}

const MODE_ORDER: PermissionMode[] = ["default", "plan", "auto"]
const MODE_COLORS: Record<PermissionMode, "success" | "warning" | "error"> = {
	default: "success",
	plan: "warning",
	auto: "error",
}

interface PlanModeSupplement {
	systemPrompt: string
}

const PLAN_MODE_SYSTEM_PROMPT_SUPPLEMENT =
	"Plan mode is active. You have read-only access to this codebase: you can read files, search, list directories, and run read-only shell commands. You cannot edit, write, or run any command that changes state. Use this mode to investigate and propose a plan. The user will switch off plan mode before you execute it."

export default function permissionsExtension(pi: ExtensionAPI): void {
	// Ensure user config file exists on first run (best-effort).
	ensureUserConfig()

	// -----------------------------------------------------------------------
	// Flags
	// -----------------------------------------------------------------------
	pi.registerFlag("plan", {
		description: "Start in plan mode (read-only exploration).",
		type: "boolean",
		default: false,
	})
	pi.registerFlag("auto", {
		description: "Start in autonomous mode (YOLO with classifier).",
		type: "boolean",
		default: false,
	})
	pi.registerFlag("permissions-config", {
		description: "Path to a permissions.json file that replaces user/project configs.",
		type: "string",
	})
	pi.registerFlag("allow-tool", {
		description: "Add a session allow rule (may repeat via comma-separated list).",
		type: "string",
	})
	pi.registerFlag("deny-tool", {
		description: "Add a session deny rule (may repeat via comma-separated list).",
		type: "string",
	})

	// -----------------------------------------------------------------------
	// Shortcuts
	// -----------------------------------------------------------------------
	pi.registerShortcut("shift+tab", {
		description: "Cycle permission mode (default → plan → yolo)",
		handler: (ctx) => cycleMode(ctx),
	})

	// -----------------------------------------------------------------------
	// State
	// -----------------------------------------------------------------------
	const session = new SessionMemory()
	let loaded: LoadedConfig
	let configRules: Rule[] = []
	let runtimeMode: PermissionMode | undefined
	let cliMode: PermissionMode | undefined
	let originalActiveTools: string[] | null = null
	let planModeApplied = false

	function rebuildConfigRules(): void {
		const allowRules: Rule[] = [
			...parseRules(loaded.allowBySource.cli, "allow", "cli"),
			...parseRules(loaded.allowBySource.local, "allow", "local"),
			...parseRules(loaded.allowBySource.project, "allow", "project"),
			...parseRules(loaded.allowBySource.user, "allow", "user"),
		]
		const denyRules: Rule[] = [
			...parseRules(loaded.denyBySource.cli, "deny", "cli"),
			...parseRules(loaded.denyBySource.local, "deny", "local"),
			...parseRules(loaded.denyBySource.project, "deny", "project"),
			...parseRules(loaded.denyBySource.user, "deny", "user"),
		]
		configRules = [...allowRules, ...denyRules]
	}

	function currentMode(): PermissionMode {
		return resolveMode({
			runtime: runtimeMode,
			flag: cliMode,
			env: process.env.KIMCHI_PERMISSIONS,
			config: loaded.config.defaultMode,
		}).mode
	}

	function allRules(): Rule[] {
		return [...session.all(), ...configRules]
	}

	function applyPlanModeTools(ctx: ExtensionContext): void {
		if (planModeApplied) return
		try {
			if (originalActiveTools === null) {
				originalActiveTools = pi.getActiveTools()
			}
			const available = new Set(pi.getAllTools().map((t) => t.name))
			const planTools = READ_ONLY_TOOL_NAMES.filter((n) => available.has(n))
			// Include any already-active read-only custom tools we classified as read-only.
			for (const tool of pi.getAllTools()) {
				if (!planTools.includes(tool.name) && isReadOnlyTool(tool.name)) {
					planTools.push(tool.name)
				}
			}
			// bash is included as a read-only tool — the tool_call handler gates
			// individual commands to the read-only program allowlist.
			if (available.has("bash") && !planTools.includes("bash")) planTools.push("bash")
			pi.setActiveTools(planTools)
			planModeApplied = true
		} catch {
			// setActiveTools may be unavailable in some modes (RPC/print); fall
			// through — the tool_call handler still enforces the policy.
		}
	}

	function restoreToolsFromPlanMode(ctx: ExtensionContext): void {
		if (!planModeApplied) return
		if (originalActiveTools) {
			try {
				pi.setActiveTools(originalActiveTools)
			} catch {
				// ignore
			}
		}
		planModeApplied = false
	}

	function updateStatus(ctx: ExtensionContext): void {
		if (ctx.hasUI) {
			updateBelowWidget(ctx)
		}
	}

	function updateBelowWidget(ctx: ExtensionContext): void {
		if (!ctx.hasUI) return
		const mode = currentMode()
		const theme = ctx.ui.theme

		// Three-dot indicator: the active mode is filled in its risk-color,
		// the others are muted empty circles.
		const dots = MODE_ORDER.map((m) => (m === mode ? theme.fg(MODE_COLORS[m], "●") : theme.fg("muted", "○"))).join(" ")
		const name = theme.fg(MODE_COLORS[mode], MODE_LABELS[mode])
		const hint = theme.fg("dim", "→ shift+tab")
		const line = `${dots}  ${name}  ${hint}`
		ctx.ui.setWidget("permissions-mode-widget", [line], { placement: "belowEditor" })
	}

	function cycleMode(ctx: ExtensionContext): void {
		const current = currentMode()
		const idx = MODE_ORDER.indexOf(current)
		const next = MODE_ORDER[(idx + 1) % MODE_ORDER.length]
		const wasPlan = current === "plan"
		runtimeMode = next
		if (wasPlan && next !== "plan") restoreToolsFromPlanMode(ctx)
		if (next === "plan") applyPlanModeTools(ctx)
		updateStatus(ctx)
	}

	// -----------------------------------------------------------------------
	// Session start — compute initial state once pi's flag system has resolved.
	// -----------------------------------------------------------------------
	pi.on("session_start", async (_event, ctx) => {
		const { loaded: lc, errors } = loadConfig({
			cwd: ctx.cwd,
			cliConfigPath: pi.getFlag("permissions-config") as string | undefined,
			cliAllow: splitFlag(pi.getFlag("allow-tool")),
			cliDeny: splitFlag(pi.getFlag("deny-tool")),
		})
		loaded = lc
		rebuildConfigRules()

		for (const err of errors) {
			if (ctx.hasUI) ctx.ui.notify(`permissions: ${err}`, "warning")
			else console.error(`permissions: ${err}`)
		}

		// Add CLI-flag session rules (these live in session memory so /permissions list shows them).
		session.addMany(parseRules(loaded.allowBySource.cli, "allow", "cli"))
		session.addMany(parseRules(loaded.denyBySource.cli, "deny", "cli"))

		if (pi.getFlag("plan")) cliMode = "plan"
		else if (pi.getFlag("auto")) cliMode = "auto"

		const resolved = resolveMode({
			runtime: runtimeMode,
			flag: cliMode,
			env: process.env.KIMCHI_PERMISSIONS,
			config: loaded.config.defaultMode,
		})

		if (resolved.mode === "plan") applyPlanModeTools(ctx)
		updateStatus(ctx)
	})

	// -----------------------------------------------------------------------
	// Before agent start — inject plan-mode supplement to system prompt.
	// -----------------------------------------------------------------------
	pi.on("before_agent_start", async (event): Promise<{ systemPrompt?: string }> => {
		if (currentMode() !== "plan") return {}
		return {
			systemPrompt: `${event.systemPrompt}\n\n${PLAN_MODE_SYSTEM_PROMPT_SUPPLEMENT}`,
		} satisfies PlanModeSupplement
	})

	// -----------------------------------------------------------------------
	// Tool call gate — the core permission check.
	// -----------------------------------------------------------------------
	pi.on("tool_call", async (event, ctx) => {
		const mode = currentMode()
		const toolName = event.toolName.toLowerCase()
		const input = event.input as Record<string, unknown>

		// ----- Plan mode: hard-restrict to read-only tools. -----
		if (mode === "plan") {
			if (toolName === "bash") {
				const command = typeof input.command === "string" ? input.command : ""
				if (!isReadOnlyBashCommand(command)) {
					return {
						block: true,
						reason: `Plan mode: bash command "${command}" is not in the read-only allowlist. Use /permissions mode default (or auto) to run writes.`,
					}
				}
				return undefined
			}
			if (!isReadOnlyTool(toolName) && !READ_ONLY_TOOL_NAMES.includes(toolName)) {
				return {
					block: true,
					reason: `Plan mode: tool ${toolName} is not available. Use /permissions mode default to enable writes.`,
				}
			}
			return undefined
		}

		// ----- Rule-set evaluation (shared by default and auto modes). -----
		const match = evaluateRules(allRules(), toolName, input)
		if (match.decision === "deny") {
			return { block: true, reason: `Denied by rule ${formatRule(match.rule)}` }
		}
		if (match.decision === "allow") {
			return undefined
		}

		// Built-in always-allowed tools (after deny check so user deny still wins).
		if (BUILTIN_ALLOW_TOOL_NAMES.includes(toolName)) {
			return undefined
		}

		// ----- Auto mode: skip classifier for read-only tools. -----
		if (mode === "auto") {
			if (isReadOnlyTool(toolName)) return undefined
			if (toolName === "bash") {
				const command = typeof input.command === "string" ? input.command : ""
				if (isReadOnlyBashCommand(command)) return undefined
			}

			const verdict = await classifyToolCall(
				ctx,
				{ toolName, input, cwd: ctx.cwd },
				{ timeoutMs: loaded.config.classifierTimeoutMs },
			)

			if (verdict.verdict === "safe") return undefined
			if (verdict.verdict === "blocked") {
				return { block: true, reason: `Classifier blocked: ${verdict.reason}` }
			}
			// requires-confirmation → prompt if UI available, else block (Q3-C).
			if (!ctx.hasUI) {
				return { block: true, reason: `Classifier: ${verdict.reason} (no UI to confirm)` }
			}
			return handleConfirm(event, { ctx, subtitle: `Classifier: ${verdict.reason}`, session })
		}

		// ----- Default mode: always prompt. -----
		if (!ctx.hasUI) {
			return { block: true, reason: "Permission required but no UI available to prompt." }
		}
		return handleConfirm(event, { ctx, session })
	})

	// -----------------------------------------------------------------------
	// Commands (/permissions ...)
	// -----------------------------------------------------------------------
	registerCommands(pi, {
		getSession: () => session,
		getLoaded: () => loaded,
		getMode: () => currentMode(),
		setRuntimeMode: (m) => {
			runtimeMode = m
		},
		applyPlanMode: (ctx) => applyPlanModeTools(ctx),
		restorePlanMode: (ctx) => restoreToolsFromPlanMode(ctx),
		rebuildConfigRules,
		reloadConfig: (ctx) => {
			const { loaded: lc, errors } = loadConfig({
				cwd: ctx.cwd,
				cliConfigPath: pi.getFlag("permissions-config") as string | undefined,
				cliAllow: splitFlag(pi.getFlag("allow-tool")),
				cliDeny: splitFlag(pi.getFlag("deny-tool")),
			})
			loaded = lc
			rebuildConfigRules()
			if (errors.length && ctx.hasUI) {
				for (const err of errors) ctx.ui.notify(`permissions: ${err}`, "warning")
			}
		},
		updateStatus,
	})
}

interface ConfirmOptions {
	ctx: ExtensionContext
	session: SessionMemory
	subtitle?: string
}

async function handleConfirm(
	event: ToolCallEvent,
	opts: ConfirmOptions,
): Promise<{ block: true; reason: string } | undefined> {
	const outcome = await promptForApproval({
		toolName: event.toolName,
		input: event.input as Record<string, unknown>,
		ctx: opts.ctx,
		subtitle: opts.subtitle,
	})

	if (outcome.kind === "allow-once") return undefined
	if (outcome.kind === "allow-remember") {
		opts.session.add(outcome.rule)
		return undefined
	}
	if (outcome.kind === "deny-with-feedback") {
		return { block: true, reason: outcome.feedback }
	}
	return { block: true, reason: "Declined by user" }
}

function splitFlag(raw: boolean | string | undefined): string[] {
	if (typeof raw !== "string" || !raw) return []
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
}

function formatRule(rule: Rule): string {
	const name = rule.toolName.startsWith("mcp__")
		? rule.toolName
		: rule.toolName[0].toUpperCase() + rule.toolName.slice(1)
	const base = rule.content === undefined ? name : `${name}(${rule.content})`
	return `${base} [${rule.source}]`
}
