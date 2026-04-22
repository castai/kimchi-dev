import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { PromptEditor } from "../components/editor.js"

export default function editorExtension(pi: ExtensionAPI) {
	pi.on("session_start", (_, ctx) => {
		ctx.ui.setEditorComponent((tui, theme, keybindings) => new PromptEditor(tui, theme, keybindings))
	})
}
