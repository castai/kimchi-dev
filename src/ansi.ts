export const TRUECOLOR = process.env.COLORTERM === "truecolor" || process.env.COLORTERM === "24bit"
export const RST = "\x1b[0m"

function tc(rgb: string, fallback256: string): string {
	return TRUECOLOR ? `38;2;${rgb}` : `38;5;${fallback256}`
}

export function fg(code: string, text: string): string {
	if (!code) return text
	return `\x1b[${code}m${text}\x1b[0m`
}

export const ANSI = {
	accent: "38;2;138;190;183",
	dim: tc("102;102;102", "242"),
	brand: tc("244;87;46", "202"),
	brandGreen: tc("187;227;59", "148"),
	placeholder: tc("71;71;71", "239"),
	border: tc("41;41;41", "236"),
	branch: tc("127;119;221", "104"),
}
