import { CustomEditor } from "@mariozechner/pi-coding-agent"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { ANSI, RST } from "../ansi.js"

export const PROMPT_FG = ANSI.brand
const PLACEHOLDER_FG = ANSI.placeholder
const BORDER_FG = ANSI.border

const CHEVRON_WIDTH = 2 // "› " takes 2 visible chars
const B = `\x1b[${BORDER_FG}m`

function borderedLine(inner: number, content: string, contentWidth: number): string {
	const pad = Math.max(0, inner - contentWidth)
	return `${B}│${RST}${content}${" ".repeat(pad)}${B}│${RST}`
}

function emptyLine(inner: number): string {
	return borderedLine(inner, "", 0)
}

export class PromptEditor extends CustomEditor {
	render(width: number): string[] {
		const inner = width - 2
		const editorWidth = inner - CHEVRON_WIDTH
		const lines = super.render(editorWidth)
		if (lines.length < 2) return lines

		const top = `${B}┌${"─".repeat(inner)}┐${RST}`
		const bottom = `${B}└${"─".repeat(inner)}┘${RST}`

		const result: string[] = [top]

		result.push(emptyLine(inner))

		for (let i = 1; i < lines.length - 1; i++) {
			const content = lines[i]
			const truncated = truncateToWidth(content, editorWidth)
			const contentWidth = visibleWidth(truncated)
			const chevron = `\x1b[${PROMPT_FG}m›${RST} `
			result.push(borderedLine(inner, chevron + truncated, contentWidth + CHEVRON_WIDTH))
		}

		if (this.getText().length === 0) {
			const placeholder = `\x1b[${PROMPT_FG}m›${RST} \x1b[${PLACEHOLDER_FG}mask anything or type / for commands${RST}`
			const placeholderWidth = CHEVRON_WIDTH + visibleWidth("ask anything or type / for commands")
			result[2] = borderedLine(inner, placeholder, placeholderWidth)
		}

		result.push(emptyLine(inner))
		result.push(bottom)

		return result
	}
}
