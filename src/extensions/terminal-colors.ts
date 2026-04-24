import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

const FG_COLOR = "rgb:A1/A1/A1"
const BG_COLOR = "rgb:1A/18/18"
const SET_FG = `\x1b]10;${FG_COLOR}\x07`
const SET_BG = `\x1b]11;${BG_COLOR}\x07`
const QUERY_FG = "\x1b]10;?\x07"
const QUERY_BG = "\x1b]11;?\x07"
const QUERY_TIMEOUT_MS = 200

const ENTER_ALT_SCREEN = "\x1b[?1049h"
const EXIT_ALT_SCREEN = "\x1b[?1049l"

export default function terminalColorsExtension(pi: ExtensionAPI) {
	let savedFg: string | null = null
	let savedBg: string | null = null
	let active = false
	let altScreenActive = false
	let exitHandlersInstalled = false

	const restore = () => {
		if (!active) return
		active = false
		if (!process.stdout.isTTY) return
		if (altScreenActive) {
			altScreenActive = false
			process.stdout.write(EXIT_ALT_SCREEN)
		}
		process.stdout.write(savedFg ? `\x1b]10;${savedFg}\x07` : "\x1b]110\x07")
		process.stdout.write(savedBg ? `\x1b]11;${savedBg}\x07` : "\x1b]111\x07")
	}

	const installExitHandlers = () => {
		if (exitHandlersInstalled) return
		exitHandlersInstalled = true
		process.on("exit", restore)
		const signalRestore = (signal: NodeJS.Signals) => {
			restore()
			process.kill(process.pid, signal)
		}
		process.once("SIGINT", () => signalRestore("SIGINT"))
		process.once("SIGTERM", () => signalRestore("SIGTERM"))
		process.once("SIGHUP", () => signalRestore("SIGHUP"))
	}

	pi.on("session_start", (event) => {
		if (!process.stdin.isTTY) return

		active = true
		installExitHandlers()

		if (event.reason === "startup") {
			altScreenActive = true
			process.stdout.write(ENTER_ALT_SCREEN)
		}

		if (savedFg !== null || savedBg !== null) {
			process.stdout.write(SET_FG)
			process.stdout.write(SET_BG)
			return
		}

		let buffer = ""
		let gotFg = false
		let gotBg = false
		const handler = (data: Buffer | string) => {
			buffer += data.toString()

			if (!gotFg) {
				// biome-ignore lint/suspicious/noControlCharactersInRegex: OSC terminal escape sequence
				const fgMatch = buffer.match(/\x1b\]10;(.+?)(?:\x07|\x1b\\)/)
				if (fgMatch) {
					savedFg = fgMatch[1]
					gotFg = true
				}
			}
			if (!gotBg) {
				// biome-ignore lint/suspicious/noControlCharactersInRegex: OSC terminal escape sequence
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

	pi.on("session_shutdown", restore)
}
