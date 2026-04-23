import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { UserMessageComponent } from "@mariozechner/pi-coding-agent"
import { RST_FG, TEAL_DIM_FG } from "../ansi.js"

const BORDER_FG = TEAL_DIM_FG
const RESET_FG = RST_FG
const BORDER_CHAR = "▎"

function findFirstVisibleIndex(line: string): number {
	let i = 0
	while (i < line.length) {
		if (line[i] === "\x1b") {
			if (i + 1 < line.length && line[i + 1] === "[") {
				const end = line.indexOf("m", i)
				if (end !== -1) {
					i = end + 1
					continue
				}
			}
			if (i + 1 < line.length && line[i + 1] === "]") {
				const bel = line.indexOf("\x07", i)
				if (bel !== -1) {
					i = bel + 1
					continue
				}
				const st = line.indexOf("\x1b\\", i)
				if (st !== -1) {
					i = st + 2
					continue
				}
			}
		}
		return i
	}
	return i
}

function addLeftBorder(lines: string[]): string[] {
	return lines.map((line) => {
		const idx = findFirstVisibleIndex(line)
		if (idx < line.length && line[idx] === " ") {
			return line.slice(0, idx) + BORDER_FG + BORDER_CHAR + RESET_FG + line.slice(idx + 1)
		}
		return line
	})
}

let patched = false

export default function userMessagePatchExtension(_pi: ExtensionAPI) {
	if (patched) return
	patched = true

	const originalRender = UserMessageComponent.prototype.render
	UserMessageComponent.prototype.render = function (width: number): string[] {
		const lines = originalRender.call(this, width)
		return addLeftBorder(lines)
	}
}
