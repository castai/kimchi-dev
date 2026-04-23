import type { ExtensionAPI, ExtensionContext, ToolCallEvent } from "@mariozechner/pi-coding-agent"
import { classifyToolCall } from "./classifier.js"
import { registerCommands } from "./commands.js"
import { type LoadedConfig, loadConfig } from "./config.js"
import { resolveMode } from "./mode.js"
import { promptForApproval } from "./prompts.js"
import planModeSupplement from "./prompts/plan-mode-supplement.js"
import { evaluateRules, parseRules, stringifyRule } from "./rules.js"
import { SessionMemory } from "./session-memory.js"
import { isReadOnlyBashCommand, isReadOnlyTool } from "./taxonomy.js"
import { BUILTIN_DENY, type PermissionMode, type Rule } from "./types.js"

// bash is allowed but gated per-command by isReadOnlyBashCommand.
const PLAN_MODE_TOOLS = ["read", "grep", "find", "ls", "web_search", "web_fetch", "questionnaire", "bash"]

// subagent delegates to a sub-session that enforces permissions on its own calls.
const BUILTIN_ALLOW_TOOL_NAMES = ["subagent", "set_phase"]

const MODES: Array<{ mode: PermissionMode; label: string; color: "success" | "warning" | "error" }> = [
	{ mode: "default", label: "default", color: "success" },
	{ mode: "plan", label: "plan", color: "warning" },
	{ mode: "auto", label: "yolo", color: "error" },
]

export default function permissionsExtension(pi: ExtensionAPI): void {
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

	pi.registerShortcut("shift+tab", {
		description: "Cycle permission mode (default → plan → yolo)",
		handler: (ctx) => cycleMode(ctx),
	})

	const session = new SessionMemory()
	const builtinRules: Rule[] = parseRules(BUILTIN_DENY, "deny", "builtin")
	// Snapshot env before propagateModeToEnv overwrites it; otherwise
	// currentMode() would read its own writes and ignore flag/runtime precedence.
	const envBaseline = process.env.KIMCHI_PERMISSIONS
	let loaded: LoadedConfig
	let configRules: Rule[] = []
	let runtimeMode: PermissionMode | undefined
	let cliMode: PermissionMode | undefined
	let originalActiveTools: string[] | null = null
	let planModeApplied = false

	function rebuildConfigRules(): void {
		configRules = [
			...parseRules(loaded.allowBySource.local, "allow", "local"),
			...parseRules(loaded.allowBySource.project, "allow", "project"),
			...parseRules(loaded.allowBySource.user, "allow", "user"),
			...parseRules(loaded.denyBySource.local, "deny", "local"),
			...parseRules(loaded.denyBySource.project, "deny", "project"),
			...parseRules(loaded.denyBySource.user, "deny", "user"),
		]
	}

	function currentMode(): PermissionMode {
		return resolveMode({
			runtime: runtimeMode,
			flag: cliMode,
			env: envBaseline,
			config: loaded.config.defaultMode,
		}).mode
	}

	// Spawned subagents inherit the mode via process.env.
	function propagateModeToEnv(): void {
		process.env.KIMCHI_PERMISSIONS = currentMode()
	}

	function allRules(): Rule[] {
		return [...session.all(), ...configRules, ...builtinRules]
	}

	function applyPlanModeTools(): void {
		if (planModeApplied) return
		try {
			if (originalActiveTools === null) {
				originalActiveTools = pi.getActiveTools()
			}
			const allTools = pi.getAllTools()
			const planTools = new Set<string>()
			for (const tool of allTools) {
				if (PLAN_MODE_TOOLS.includes(tool.name) || isReadOnlyTool(tool.name)) {
					planTools.add(tool.name)
				}
			}
			pi.setActiveTools([...planTools])
			planModeApplied = true
		} catch {
			// setActiveTools may be unavailable; tool_call handler still enforces the policy.
		}
	}

	function restoreToolsFromPlanMode(): void {
		if (!planModeApplied) return
		if (originalActiveTools) {
			try {
				pi.setActiveTools(originalActiveTools)
			} catch {
				// best-effort restore
			}
		}
		planModeApplied = false
	}

	function updateStatus(ctx: ExtensionContext): void {
		if (!ctx.hasUI) return
		const mode = currentMode()
		const active = MODES.find((m) => m.mode === mode) ?? MODES[0]
		const theme = ctx.ui.theme
		const dots = MODES.map((m) => (m.mode === mode ? theme.fg(m.color, "●") : theme.fg("muted", "○"))).join(" ")
		const name = theme.fg(active.color, active.label)
		const hint = theme.fg("dim", "→ shift+tab")
		ctx.ui.setWidget("permissions-mode-widget", [`${dots}  ${name}  ${hint}`], { placement: "belowEditor" })
	}

	function cycleMode(ctx: ExtensionContext): void {
		const current = currentMode()
		const idx = MODES.findIndex((m) => m.mode === current)
		const next = MODES[(idx + 1) % MODES.length].mode
		runtimeMode = next
		if (current === "plan" && next !== "plan") restoreToolsFromPlanMode()
		if (next === "plan") applyPlanModeTools()
		propagateModeToEnv()
		updateStatus(ctx)
	}

	function doLoadConfig(ctx: ExtensionContext): { errors: string[] } {
		const { loaded: lc, errors } = loadConfig({
			cwd: ctx.cwd,
			cliConfigPath: pi.getFlag("permissions-config") as string | undefined,
			cliAllow: splitFlag(pi.getFlag("allow-tool")),
			cliDeny: splitFlag(pi.getFlag("deny-tool")),
		})
		loaded = lc
		rebuildConfigRules()
		return { errors }
	}

	pi.on("session_start", async (_event, ctx) => {
		const { errors } = doLoadConfig(ctx)

		for (const err of errors) {
			if (ctx.hasUI) ctx.ui.notify(`permissions: ${err}`, "warning")
			else console.error(`permissions: ${err}`)
		}

		// CLI-flag rules live in session memory so /permissions list shows them.
		session.addMany(parseRules(loaded.allowBySource.cli, "allow", "cli"))
		session.addMany(parseRules(loaded.denyBySource.cli, "deny", "cli"))

		if (pi.getFlag("plan")) cliMode = "plan"
		else if (pi.getFlag("auto")) cliMode = "auto"

		if (currentMode() === "plan") applyPlanModeTools()
		propagateModeToEnv()
		updateStatus(ctx)
	})

	pi.on("before_agent_start", async (event): Promise<{ systemPrompt?: string }> => {
		if (currentMode() !== "plan") return {}
		return { systemPrompt: `${event.systemPrompt}\n\n${planModeSupplement.trim()}` }
	})

	pi.on("tool_call", async (event, ctx) => {
		const mode = currentMode()
		const toolName = event.toolName.toLowerCase()
		const input = event.input as Record<string, unknown>

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
			if (!isReadOnlyTool(toolName) && !PLAN_MODE_TOOLS.includes(toolName)) {
				return {
					block: true,
					reason: `Plan mode: tool ${toolName} is not available. Use /permissions mode default to enable writes.`,
				}
			}
			return undefined
		}

		const match = evaluateRules(allRules(), toolName, input)
		if (match.decision === "deny") {
			return { block: true, reason: `Denied by rule ${formatRule(match.rule)}` }
		}
		if (match.decision === "allow") return undefined

		if (BUILTIN_ALLOW_TOOL_NAMES.includes(toolName)) return undefined

		// Auto mode + headless default mode (subagents) both go through the
		// classifier; prompts without a UI fail closed.
		if (mode === "auto" || !ctx.hasUI) {
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
			if (!ctx.hasUI) {
				return { block: true, reason: `Classifier: ${verdict.reason} (no UI to confirm)` }
			}
			return handleConfirm(event, { ctx, subtitle: `Classifier: ${verdict.reason}`, session })
		}

		return handleConfirm(event, { ctx, session })
	})

	registerCommands(pi, {
		getSession: () => session,
		getLoaded: () => loaded,
		getMode: () => currentMode(),
		setRuntimeMode: (m) => {
			runtimeMode = m
			propagateModeToEnv()
		},
		applyPlanMode: () => applyPlanModeTools(),
		restorePlanMode: () => restoreToolsFromPlanMode(),
		rebuildConfigRules,
		reloadConfig: (ctx) => {
			const { errors } = doLoadConfig(ctx)
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
	return `${stringifyRule(rule)} [${rule.source}]`
}
