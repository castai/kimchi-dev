import type { Theme } from "@mariozechner/pi-coding-agent"
import type { Component } from "@mariozechner/pi-tui"
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui"
import { buildLogoLines, buildPathLine, buildVersionLine } from "./logo-art.js"

export class LogoHeader implements Component {
	private readonly theme: Theme
	private readonly logoLines: string[]

	constructor(theme: Theme) {
		this.theme = theme
		this.logoLines = buildLogoLines(theme)
	}

	invalidate(): void {}

	render(width: number): string[] {
		const versionLine = buildVersionLine(this.theme)
		const pathLine = buildPathLine(this.theme)
		const info = `${versionLine} ${pathLine}`

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
