import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"
import { isEditToolResult, isWriteToolResult } from "@mariozechner/pi-coding-agent"
import type { TUI } from "@mariozechner/pi-tui"
import { spawn } from "node:child_process"
import { PromptEditor } from "../components/editor.js"
import { ScriptFooter, StatsFooter, buildScriptPayload, readStatusLineCommand } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"
import { SplashHeader } from "../components/splash-header.js"
import { collapseAll, expandNext, resetState } from "../expand-state.js"
import { isBareExitAlias, quitApplication } from "./exit-utils.js"

const HORIZONTAL_PADDING = 2

// Strip OSC 133 shell-integration marks emitted by pi-mono around each message.
// iTerm2 renders a visible blue triangle at each mark, which is noisy in the TUI.
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI/OSC
const OSC133_RE = /\x1b\]133;[A-Z]\x07/g

function patchTuiPadding(tui: TUI) {
	const original = tui.render.bind(tui)
	const pad = " ".repeat(HORIZONTAL_PADDING)
	tui.render = (width: number): string[] => {
		const lines = original(Math.max(1, width - HORIZONTAL_PADDING * 2))
		return lines.map((line: string) => pad + line.replace(OSC133_RE, ""))
	}
}

function runScript(
	scriptPath: string,
	payload: object,
	tui: TUI,
	footer: ScriptFooter,
): void {
	const child = spawn(scriptPath, [], {
		env: process.env,
		timeout: 1000,
	})

	let stdout = ""
	let stderr = ""
	child.stdout.on("data", (d: Buffer) => { stdout += d.toString() })
	child.stderr.on("data", (d: Buffer) => { stderr += d.toString() })

	child.stdin.write(JSON.stringify(payload))
	child.stdin.end()

	child.on("close", (code) => {
		if (code === 0 && stdout) {
			const lines = stdout.split("\n").filter((l) => l.trim() !== "")
			footer.setLines(lines)
		} else if (stderr) {
			footer.setLines([`\x1b[31m[statusline error] ${stderr.trim()}\x1b[0m`])
		}
		tui.requestRender()
	})
}

export default function uiExtension(pi: ExtensionAPI) {
	let splashActive = false
	let currentEditor: PromptEditor | undefined
	let tuiPatched = false
	let scriptFooter: ScriptFooter | null = null
	let scriptTui: TUI | null = null
	let scriptCmd: string | null = null
	let currentCtx: ExtensionContext | null = null
	let sessionStartMs = 0
	let linesAdded = 0
	let linesRemoved = 0

	const refresh = (status: "idle" | "generating") => {
		if (!currentCtx?.hasUI || !scriptFooter || !scriptTui || !scriptCmd) return
		runScript(scriptCmd, buildScriptPayload(currentCtx, status, sessionStartMs, linesAdded, linesRemoved), scriptTui, scriptFooter)
	}

	pi.on("session_start", (event, ctx) => {
		resetState()
		currentCtx = ctx
		sessionStartMs = Date.now()
		linesAdded = 0
		linesRemoved = 0

		const isSplash = event.reason === "startup"
		splashActive = isSplash

		ctx.ui.setHeader((_tui, theme) => (isSplash ? new SplashHeader(theme) : new LogoHeader(theme)))
		ctx.ui.setFooter((tui, theme, footerData) => {
			const cmd = readStatusLineCommand()
			if (!cmd) {
				scriptCmd = null
				return new StatsFooter(ctx, theme, footerData)
			}
			scriptCmd = cmd
			scriptFooter = new ScriptFooter()
			scriptTui = tui
			runScript(cmd, buildScriptPayload(ctx, "idle", sessionStartMs, linesAdded, linesRemoved), tui, scriptFooter)
			return scriptFooter
		})

		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
			if (!tuiPatched) {
				tuiPatched = true
				patchTuiPadding(tui)
			}
			tui.setShowHardwareCursor(true)
			const editor = new PromptEditor(tui, editorTheme, keybindings, ctx.ui.theme)
			editor.setSplashMode(isSplash)
			editor.setExpandHandler(() => {
				if (!expandNext()) {
					collapseAll()
				}
				ctx.ui.setToolsExpanded(false)
			})
			currentEditor = editor
			return editor
		})
	})

	pi.on("input", (event, ctx) => {
		if (isBareExitAlias(event.text)) {
			quitApplication()
		}

		if (!splashActive) return
		splashActive = false
		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		currentEditor?.setSplashMode(false)
	})

	pi.on("turn_start", (_, ctx) => { currentCtx = ctx; refresh("generating") })
	pi.on("turn_end",   (_, ctx) => { currentCtx = ctx; refresh("idle") })
	pi.on("model_select", (_, ctx) => { currentCtx = ctx; refresh("idle") })

	pi.on("tool_result", (event) => {
		if (isEditToolResult(event) && event.details?.diff) {
			for (const line of event.details.diff.split("\n")) {
				if (line.startsWith("+") && !line.startsWith("+++")) linesAdded++
				else if (line.startsWith("-") && !line.startsWith("---")) linesRemoved++
			}
		} else if (isWriteToolResult(event)) {
			const content = event.input.content
			if (typeof content === "string") linesAdded += content.split("\n").length
		}
	})

	pi.registerCommand("exit", {
		description: "Exit the application (alias for /quit)",
		handler: async () => {
			quitApplication()
		},
	})
}
