import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import type { TUI } from "@mariozechner/pi-tui"
import { PromptEditor } from "../components/editor.js"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"
import { SplashHeader } from "../components/splash-header.js"
import { collapseAll, expandNext, resetState } from "../expand-state.js"

/**
 * Check if input is the exit alias and should be transformed to /quit
 */
function shouldTransformToQuit(text: string): boolean {
	const trimmed = text.trim()
	// Transform plain "exit" (without leading slash) to /exit
	return trimmed === "exit"
}

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

export default function uiExtension(pi: ExtensionAPI) {
	let splashActive = false
	let currentEditor: PromptEditor | undefined
	let tuiPatched = false

	pi.on("session_start", (event, ctx) => {
		resetState()

		const isSplash = event.reason === "startup"
		splashActive = isSplash

		ctx.ui.setHeader((_tui, theme) => (isSplash ? new SplashHeader(theme) : new LogoHeader(theme)))
		ctx.ui.setFooter((_tui, theme, footerData) => new StatsFooter(ctx, theme, footerData))
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
		// Handle exit aliases: immediately quit when user types "exit"
		if (shouldTransformToQuit(event.text)) {
			process.exit(0)
		}

		if (!splashActive) return
		splashActive = false
		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		currentEditor?.setSplashMode(false)
	})

	// Register /exit as an alias for /quit
	pi.registerCommand("exit", {
		description: "Exit the application (alias for /quit)",
		handler: async () => {
			process.exit(0)
		},
	})
}
