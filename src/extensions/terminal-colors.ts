import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

// Matches theme vars grey-950 (#1A1818) in XParseColor format
const BG_COLOR = "rgb:1A/18/18"
const SET_BG = `\x1b]11;${BG_COLOR}\x07`
const QUERY_BG = `\x1b]11;?\x07`
const QUERY_TIMEOUT_MS = 200

export default function terminalColorsExtension(pi: ExtensionAPI) {
	let savedBg: string | null = null

	pi.on("session_start", () => {
		if (!process.stdin.isTTY) return

		let buffer = ""
		const handler = (data: Buffer | string) => {
			buffer += data.toString()
			const match = buffer.match(/\x1b\]11;(.+?)(?:\x07|\x1b\\)/)
			if (match) {
				savedBg = match[1]
				cleanup()
			}
		}
		const cleanup = () => {
			process.stdin.removeListener("data", handler)
			clearTimeout(timeout)
		}
		const timeout = setTimeout(cleanup, QUERY_TIMEOUT_MS)

		process.stdin.on("data", handler)
		process.stdout.write(QUERY_BG)
		process.stdout.write(SET_BG)
	})

	pi.on("session_shutdown", () => {
		if (!process.stdin.isTTY) return

		if (savedBg) {
			process.stdout.write(`\x1b]11;${savedBg}\x07`)
		} else {
			// OSC 111: reset background to terminal default (xterm)
			process.stdout.write(`\x1b]111\x07`)
		}
	})
}
