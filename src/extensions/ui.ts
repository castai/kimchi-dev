import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { PromptEditor } from "../components/editor.js"
import { StatsFooter } from "../components/footer.js"
import { LogoHeader } from "../components/logo.js"

export default function uiExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, ctx) => {
		ctx.ui.setHeader((_tui, theme) => new LogoHeader(theme))
		ctx.ui.setFooter((_tui, theme, footerData) => new StatsFooter(ctx, theme, footerData))
		ctx.ui.setEditorComponent((tui, editorTheme, keybindings) => new PromptEditor(tui, editorTheme, keybindings, ctx.ui.theme))
	})
}
