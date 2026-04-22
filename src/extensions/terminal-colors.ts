import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

const FG_COLOR = "rgb:A1/A1/A1"
const BG_COLOR = "rgb:1A/18/18"
const SET_FG = `\x1b]10;${FG_COLOR}\x07`
const SET_BG = `\x1b]11;${BG_COLOR}\x07`
const QUERY_FG = `\x1b]10;?\x07`
const QUERY_BG = `\x1b]11;?\x07`
const QUERY_TIMEOUT_MS = 200

export default function terminalColorsExtension(pi: ExtensionAPI) {
	let savedFg: string | null = null
	let savedBg: string | null = null

	pi.on("session_start", () => {
		if (!process.stdin.isTTY) return

		let buffer = ""
		let gotFg = false
		let gotBg = false
		const handler = (data: Buffer | string) => {
			buffer += data.toString()

			if (!gotFg) {
				const fgMatch = buffer.match(/\x1b\]10;(.+?)(?:\x07|\x1b\\)/)
				if (fgMatch) {
					savedFg = fgMatch[1]
					gotFg = true
				}
			}
			if (!gotBg) {
				const bgMatch = buffer.match(/\x1b\]11;(.+?)(?:\x07|\x1b\\)/)
				if (bgMatch) {
					savedBg = bgMatch[1]
					gotBg = true
				}
			}
			if (gotFg && gotBg) {
				cleanup()
			}
		}
		const cleanup = () => {
			process.stdin.removeListener("data", handler)
			clearTimeout(timeout)
		}
		const timeout = setTimeout(cleanup, QUERY_TIMEOUT_MS)

		process.stdin.on("data", handler)
		process.stdout.write(QUERY_FG)
		process.stdout.write(QUERY_BG)
		process.stdout.write(SET_FG)
		process.stdout.write(SET_BG)
	})

	pi.on("session_shutdown", () => {
		if (!process.stdin.isTTY) return

		if (savedFg) {
			process.stdout.write(`\x1b]10;${savedFg}\x07`)
		} else {
			process.stdout.write(`\x1b]110\x07`)
		}

		if (savedBg) {
			process.stdout.write(`\x1b]11;${savedBg}\x07`)
		} else {
			process.stdout.write(`\x1b]111\x07`)
		}
	})
}
