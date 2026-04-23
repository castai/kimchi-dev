import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { PromptEditor } from "../components/editor.js"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"
import { collapseAll, expandNext, resetState } from "../expand-state.js"

export default function uiExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, ctx) => {
		resetState()

		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		ctx.ui.setFooter((_tui, theme, footerData) => new StatsFooter(ctx, theme, footerData))
		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
			tui.setShowHardwareCursor(true)
			const editor = new PromptEditor(tui, editorTheme, keybindings, ctx.ui.theme)
			editor.setExpandHandler(() => {
				if (!expandNext()) {
					collapseAll()
				}
				ctx.ui.setToolsExpanded(false)
			})
			return editor
		})
	})
}
