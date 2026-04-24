import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { PromptEditor } from "../components/editor.js"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"
import { SplashHeader } from "../components/splash-header.js"
import { collapseAll, expandNext, resetState } from "../expand-state.js"

export default function uiExtension(pi: ExtensionAPI) {
	let splashActive = false
	let currentEditor: PromptEditor | undefined

	pi.on("session_start", (event, ctx) => {
		resetState()

		const isSplash = event.reason === "startup"
		splashActive = isSplash

		ctx.ui.setHeader((_tui, theme) => (isSplash ? new SplashHeader(theme) : new LogoHeader(theme)))
		ctx.ui.setFooter((_tui, theme, footerData) => new StatsFooter(ctx, theme, footerData))
		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
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

	pi.on("input", (_event, ctx) => {
		if (!splashActive) return
		splashActive = false
		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		currentEditor?.setSplashMode(false)
	})
}
