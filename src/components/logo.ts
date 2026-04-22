import type { Component } from "@mariozechner/pi-tui"
import { visibleWidth } from "@mariozechner/pi-tui"
import { ANSI, RST } from "../ansi.js"
import { getFolder, getGitBranch } from "../utils.js"

const LOGO_FG = `\x1b[${ANSI.brand}m`
const LOGO_TOP = `\x1b[${ANSI.brandGreen}m`
const DIM = `\x1b[${ANSI.dim}m`

const L = LOGO_FG
const G = LOGO_TOP
const R = RST

const LOGO_LINES = [
	`${G}     █▀${R}  ${L}█  █ ▀█▀ █▄ ▄█ ▄▀▀ █  █ ▀█▀${R}`,
	`${L}    ███  █▀▄   █  █ ▀ █ █   █▀▀█  █${R}`,
	`${L}▄  ▄███  █  █  █  █   █ █▄▄ █  █  █${R}`,
	`${L}▀████▀   ▀  ▀ ▀▀▀ ▀   ▀  ▀▀ ▀  ▀ ▀▀▀${R}`,
]

export class LogoHeader implements Component {
	private readonly branch: string
	private readonly folder: string

	constructor() {
		this.branch = getGitBranch()
		this.folder = getFolder()
	}

	invalidate(): void {}

	render(width: number): string[] {
		const branch = this.branch
		const folder = this.folder

		const branchPart = branch ? ` (${branch})` : ""
		const info = `${DIM}${folder}${branchPart}${R}`
		const infoWidth = visibleWidth(info)

		const result = [""]
		for (let i = 0; i < LOGO_LINES.length; i++) {
			const logo = LOGO_LINES[i]
			if (i === 1) {
				const logoWidth = visibleWidth(logo)
				const gap = Math.max(2, width - logoWidth - infoWidth)
				result.push(logo + " ".repeat(gap) + info)
			} else {
				result.push(logo)
			}
		}
		result.push("")

		return result
	}
}
