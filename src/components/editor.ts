import { CustomEditor, type Theme } from "@mariozechner/pi-coding-agent"
import type { KeybindingsManager } from "@mariozechner/pi-coding-agent"
import type { EditorTheme, TUI } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { RST_FG, TEAL_FG, clampLines } from "../ansi.js"
import { splashTopPadding } from "./splash-layout.js"

const CHEVRON_WIDTH = 2
const PLACEHOLDER_TEXT = "ask anything or type / for commands"
const EDITOR_WIDTH = 60

export class PromptEditor extends CustomEditor {
	private readonly appTheme: Theme
	private readonly kb: KeybindingsManager
	private expandHandler?: () => void
	private _splashMode = false

	constructor(tui: TUI, editorTheme: EditorTheme, keybindings: KeybindingsManager, appTheme: Theme) {
		super(tui, editorTheme, keybindings)
		this.appTheme = appTheme
		this.kb = keybindings
	}

	setSplashMode(enabled: boolean) {
		this._splashMode = enabled
	}

	setExpandHandler(handler: () => void) {
		this.expandHandler = handler
	}

	override handleInput(data: string) {
		if (this.expandHandler && this.kb.matches(data, "app.tools.expand")) {
			this.expandHandler()
			return
		}
		super.handleInput(data)
	}

	render(width: number): string[] {
		const border = (s: string) => (this.borderColor ? this.borderColor(s) : s)
		const chevronColor = this.appTheme.getFgAnsi("accent")
		const textColor = this.appTheme.getFgAnsi("text")
		const cursorColor = TEAL_FG
		const muted = this.appTheme.getFgAnsi("muted")

		const innerWidth = this._splashMode ? Math.min(EDITOR_WIDTH, width - 4) : width
		const contentWidth = innerWidth - CHEVRON_WIDTH
		const lines = super.render(contentWidth)

		const leftPad = this._splashMode ? Math.max(0, Math.floor((width - innerWidth) / 2)) : 0
		const pad = leftPad > 0 ? " ".repeat(leftPad) : ""
		const borderLine = pad + border("─".repeat(innerWidth))

		// Find bottom border: scan backwards for a line starting with ─
		let bottomIdx = Math.min(2, lines.length - 1)
		for (let i = lines.length - 1; i >= 2; i--) {
			// biome-ignore lint/suspicious/noControlCharactersInRegex: strip ANSI escapes
			const stripped = lines[i].replace(/\x1b\[[^m]*m/g, "")
			if (/^─/.test(stripped)) {
				bottomIdx = i
				break
			}
		}

		// Use the line with cursor marker, or first content line
		const cursorLine = lines.slice(1, bottomIdx).find((l) => l.includes("\x1b_pi:c"))
		const rawContent = cursorLine ?? lines[1] ?? ""
		const truncated = truncateToWidth(rawContent, contentWidth)
		const withCursor = truncated.replaceAll("\x1b[7m", `${cursorColor}\x1b[7m`)
		const visWidth = visibleWidth(truncated)

		let contentLine: string
		if (this.getText().length === 0) {
			const cursorMarker = "\x1b_pi:c\x07"
			const cursor = `${cursorMarker}${cursorColor}\x1b[7m \x1b[0m`
			const placeholderWidth = CHEVRON_WIDTH + 1 + visibleWidth(PLACEHOLDER_TEXT)
			contentLine = `${pad}${chevronColor}❯${RST_FG} ${cursor}${muted}${PLACEHOLDER_TEXT}${RST_FG}${" ".repeat(Math.max(0, innerWidth - placeholderWidth))}`
		} else {
			contentLine = `${pad}${chevronColor}❯${RST_FG} ${textColor}${withCursor}${RST_FG}${" ".repeat(Math.max(0, innerWidth - CHEVRON_WIDTH - visWidth))}`
		}

		const result = [borderLine, contentLine, borderLine]

		for (let i = bottomIdx + 1; i < lines.length; i++) {
			result.push(pad + lines[i])
		}

		if (this._splashMode) {
			const termRows = process.stdout.rows ?? 24
			const headerLines = splashTopPadding() + 7
			const used = headerLines + 1 + result.length + 1
			const bottomPad = Math.max(0, termRows - used)
			for (let i = 0; i < bottomPad; i++) result.push("")
		}

		return clampLines(result, width)
	}
}
