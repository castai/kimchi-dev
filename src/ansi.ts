export const TRUECOLOR = process.env.COLORTERM === "truecolor" || process.env.COLORTERM === "24bit"
export const RST = "\x1b[0m"

function tc(rgb: string, fallback256: string): string {
	return TRUECOLOR ? `38;2;${rgb}` : `38;5;${fallback256}`
}

export function fg(code: string, text: string): string {
	if (!code) return text
	return `\x1b[${code}m${text}\x1b[0m`
}

export const TEAL_FG = TRUECOLOR ? "\x1b[38;2;93;202;165m" : "\x1b[38;5;79m"
export const TEAL_DIM_FG = TRUECOLOR ? "\x1b[38;2;74;150;125m" : "\x1b[38;5;35m"
export const RST_FG = "\x1b[39m"

export const ANSI = {
	accent: "38;2;138;190;183",
	dim: tc("102;102;102", "242"),
}
