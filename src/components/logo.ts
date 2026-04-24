import type { Theme } from "@mariozechner/pi-coding-agent"
import type { Component } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { getFolder, getGitBranch, getVersion } from "../utils.js"

const R = "\x1b[39m"

export class LogoHeader implements Component {
	private readonly version: string
	private readonly theme: Theme
	private readonly logoLines: string[]

	constructor(theme: Theme) {
		this.theme = theme
		this.version = getVersion()

		const L = theme.getFgAnsi("accent")
		const G = theme.getFgAnsi("bashMode")
		this.logoLines = [
			`${G}     █▀${R}  ${L}█  █ ▀█▀ █▄ ▄█ ▄▀▀ █  █ ▀█▀${R}`,
			`${L}    ███  █▀▄   █  █ ▀ █ █   █▀▀█  █${R}`,
			`${L}▄  ▄███  █  █  █  █   █ █▄▄ █  █  █${R}`,
			`${L}▀████▀   ▀  ▀ ▀▀▀ ▀   ▀  ▀▀ ▀  ▀ ▀▀▀${R}`,
		]
	}

	invalidate(): void {}

	render(width: number): string[] {
		const { theme, version } = this
		const branch = getGitBranch()
		const folder = getFolder()
		const dim = theme.getFgAnsi("dim")
		const branchColor = theme.getFgAnsi("mdLink")

		const versionPart = `${dim}v${version}${R}`
		const branchPart = branch ? ` ${dim}·${R} ${branchColor}${branch}${R}` : ""
		const info = `${versionPart} ${dim}·${R} ${dim}${folder}${R}${branchPart}`

		const result = [""]
		for (let i = 0; i < this.logoLines.length; i++) {
			const logo = this.logoLines[i]
			if (i === 1) {
				const logoWidth = visibleWidth(logo)
				const infoWidth = visibleWidth(info)
				const gap = width - logoWidth - infoWidth
				if (gap <= 0) {
					const available = width - logoWidth - 2
					const truncatedInfo = available > 0 ? truncateToWidth(info, available) : ""
					result.push(truncatedInfo ? `${logo}  ${truncatedInfo}` : logo)
				} else {
					result.push(logo + " ".repeat(gap) + info)
				}
			} else {
				result.push(logo)
			}
		}
		result.push("")

		return result
	}
}
