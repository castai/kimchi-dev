import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { getRawBgPayload } from "../terminal-bg-probe.js"

const FG_COLOR = "rgb:A1/A1/A1"
const BG_COLOR = "rgb:1A/18/18"
const SET_FG = `\x1b]10;${FG_COLOR}\x07`
const SET_BG = `\x1b]11;${BG_COLOR}\x07`
const QUERY_FG = "\x1b]10;?\x07"
const QUERY_BG = "\x1b]11;?\x07"
const QUERY_TIMEOUT_MS = 200

// OSC 10/11 enforce kimchi's branded fg/bg over the terminal's own colors. Only run
// when the user has explicitly opted into the rich kimchi theme; for kimchi-minimal
// (the default) and any other theme the terminal owns its own bg/fg.
//
// This is read once at session_start. Mid-session theme switches via /settings repaint
// chrome immediately via theme tokens, but the OSC override only re-evaluates on next
// CLI restart.
function getActiveThemeName(): string | undefined {
	const agentDir = process.env.KIMCHI_CODING_AGENT_DIR
	if (!agentDir) return undefined
	try {
		const raw = readFileSync(resolve(agentDir, "settings.json"), "utf-8")
		const parsed: unknown = JSON.parse(raw)
		if (parsed && typeof parsed === "object" && "theme" in parsed) {
			const themeValue = (parsed as { theme: unknown }).theme
			return typeof themeValue === "string" ? themeValue : undefined
		}
		return undefined
	} catch {
		return undefined
	}
}

export default function terminalColorsExtension(pi: ExtensionAPI) {
	let savedFg: string | null = null
	let savedBg: string | null = null
	let active = false
	let exitHandlersInstalled = false

	const restore = () => {
		if (!active) return
		active = false
		if (!process.stdout.isTTY) return
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

	pi.on("session_start", () => {
		if (!process.stdin.isTTY) return
		if (getActiveThemeName() !== "kimchi") return

		active = true
		installExitHandlers()

		if (savedFg !== null || savedBg !== null) {
			process.stdout.write(SET_FG)
			process.stdout.write(SET_BG)
			return
		}

		// cli.ts already probed OSC 11 at startup and cached the raw payload —
		// reuse it instead of running a second probe (one less stdin grab
		// window, one less keystroke-loss opportunity). FG still needs probing
		// since we don't cache OSC 10 yet.
		const cachedBg = getRawBgPayload()
		if (cachedBg) savedBg = cachedBg

		let buffer = ""
		let gotFg = false
		let gotBg = savedBg !== null
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
		if (!gotBg) process.stdout.write(QUERY_BG)
		process.stdout.write(SET_FG)
		process.stdout.write(SET_BG)
	})

	pi.on("session_shutdown", restore)
}
