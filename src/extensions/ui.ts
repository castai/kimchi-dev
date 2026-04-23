import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { PromptEditor } from "../components/editor.js"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"
import { collapseAll, expandNext, resetState } from "../expand-state.js"
import { resetGitBranch } from "../utils.js"

export default function uiExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, ctx) => {
		resetState()
		resetGitBranch()

		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		ctx.ui.setFooter((_tui, theme, footerData) => new StatsFooter(ctx, theme, footerData))
		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => {
			tui.setShowHardwareCursor(true)
			const editor = new PromptEditor(tui, editorTheme, keybindings, ctx.ui.theme)
			editor.setExpandHandler(() => {
				if (!expandNext()) {
					collapseAll()
				}
				// Keep framework's own expansion state off — kimchi manages expand/collapse via ExpandState
				ctx.ui.setToolsExpanded(false)
			})
			return editor
		})
	})
}
