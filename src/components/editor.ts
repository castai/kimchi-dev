import { CustomEditor, type Theme } from "@mariozechner/pi-coding-agent"
import type { EditorTheme, TUI } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import type { KeybindingsManager } from "@mariozechner/pi-coding-agent"
import { TRUECOLOR } from "../ansi.js"

const RST = "\x1b[39m"
const CHEVRON_WIDTH = 2
const PLACEHOLDER_TEXT = "ask anything or type / for commands"

export class PromptEditor extends CustomEditor {
	private readonly appTheme: Theme
	private expandHandler?: () => void

	constructor(tui: TUI, editorTheme: EditorTheme, keybindings: KeybindingsManager, appTheme: Theme) {
		super(tui, editorTheme, keybindings)
		this.appTheme = appTheme
	}

	setExpandHandler(handler: () => void) {
		this.expandHandler = handler
	}

	handleInput(data: string) {
		if (this.expandHandler && (this as any).keybindings.matches(data, "app.tools.expand")) {
			this.expandHandler()
			return
		}
		super.handleInput(data)
	}

	render(width: number): string[] {
		const border = (s: string) => this.borderColor ? this.borderColor(s) : s
		const chevronColor = this.appTheme.getFgAnsi("accent")
		const textColor = this.appTheme.getFgAnsi("text")
		const cursorColor = TRUECOLOR ? "\x1b[38;2;93;202;165m" : "\x1b[38;5;79m"
		const muted = this.appTheme.getFgAnsi("muted")

		const inner = width - 2
		const editorWidth = inner - CHEVRON_WIDTH
		const lines = super.render(editorWidth)
		if (lines.length < 2) return lines

		const borderedLine = (content: string, contentWidth: number): string => {
			const pad = Math.max(0, inner - contentWidth)
			return `${border("│")}${content}${" ".repeat(pad)}${border("│")}`
		}
		const emptyLine = () => borderedLine("", 0)

		const top = border(`┌${"─".repeat(inner)}┐`)
		const bottom = border(`└${"─".repeat(inner)}┘`)

		const result: string[] = [top]
		result.push(emptyLine())

		for (let i = 1; i < lines.length - 1; i++) {
			const content = lines[i]
			const truncated = truncateToWidth(content, editorWidth)
			const contentWidth = visibleWidth(truncated)
			const prefix = i === 1 ? `${chevronColor}❯${RST} ` : "  "
			const withCursor = truncated.replaceAll("\x1b[7m", `${cursorColor}\x1b[7m`)
			const coloredContent = `${textColor}${withCursor}${RST}`
			result.push(borderedLine(prefix + coloredContent, contentWidth + CHEVRON_WIDTH))
		}

		if (this.getText().length === 0) {
			const cursorMarker = "\x1b_pi:c\x07"
			const cursor = `${cursorMarker}${cursorColor}\x1b[7m \x1b[0m`
			const placeholder = `${chevronColor}❯${RST} ${cursor}${muted}${PLACEHOLDER_TEXT}${RST}`
			const placeholderWidth = CHEVRON_WIDTH + 1 + visibleWidth(PLACEHOLDER_TEXT)
			result[2] = borderedLine(placeholder, placeholderWidth)
		}

		result.push(emptyLine())
		result.push(bottom)

		return result
	}
}
