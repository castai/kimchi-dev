export function fg(code: string, text: string): string {
	if (!code) return text
	return `\x1b[${code}m${text}\x1b[0m`
}

export const ANSI = {
	accent: "38;2;138;190;183",
	dim: "38;2;102;102;102",
}
