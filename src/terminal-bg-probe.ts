// OSC 11 query: ask the terminal what its current background color is.
// Response shape: \x1b]11;rgb:RRRR/GGGG/BBBB(\x07|\x1b\\) — channels are
// 1-4 hex digits each; we take the most-significant byte. Modern terminals
// (iTerm2, Terminal.app, Alacritty, Kitty, WezTerm, GNOME Terminal) all
// support this; we time out after 200ms for ones that don't.

const QUERY_BG = "\x1b]11;?\x07"
const QUERY_TIMEOUT_MS = 200
// OSC 11 response is ~25 bytes. Cap the buffer well above that so a flood of
// unrelated bytes (paste fragments, mouse events) can't grow it unbounded
// during the probe window. We slice from the tail when over the cap.
const MAX_BUFFER_BYTES = 4096

export type Rgb = { r: number; g: number; b: number }

// Module-level cache so other extensions (notably terminal-colors.ts) can
// reuse the probe result instead of re-querying. `probed` separates "didn't
// query yet" from "queried and got nothing back".
//
// We also cache the raw OSC 11 payload (e.g. `rgb:1A1A/1818/1818`) because
// terminal-colors uses it to write the exact original value back on restore;
// re-deriving from the parsed Rgb would lose the low-byte precision that
// 16-bit terminals send (`1A2B` → we'd write back `1A1A`).
let cachedProbedBg: Rgb | undefined
let cachedRawBgPayload: string | undefined
let probed = false

export function getProbedBackground(): Rgb | undefined {
	return cachedProbedBg
}

export function getRawBgPayload(): string | undefined {
	return cachedRawBgPayload
}

// Bail without running the probe in environments known to either swallow
// OSC 11 (so we'd just sit through the 200ms timeout for nothing) or where
// the response can come back garbled. Caller falls back to a static hex.
function shouldSkipProbe(): boolean {
	if (!process.stdin.isTTY || !process.stdout.isTTY) return true
	// tmux without `set-option -g allow-passthrough on` swallows OSC queries.
	// We can't introspect tmux config from here, so always bail when in tmux.
	if (process.env.TMUX) return true
	const term = process.env.TERM ?? ""
	// Linux virtual console (no escape interpretation) and GNU screen (drops
	// or mangles unknown OSC sequences) — both unreliable for this query.
	if (term === "linux" || term === "dumb" || term.startsWith("screen")) return true
	// Windows Conhost doesn't implement OSC 11. Windows Terminal sets WT_SESSION.
	if (process.platform === "win32" && !process.env.WT_SESSION) return true
	return false
}

export async function probeTerminalBackground(): Promise<Rgb | undefined> {
	if (probed) return cachedProbedBg
	probed = true

	if (shouldSkipProbe()) return undefined

	const wasRaw = process.stdin.isRaw
	process.stdin.setRawMode?.(true)
	process.stdin.resume()

	return new Promise<Rgb | undefined>((resolveResult) => {
		let buffer = ""

		// Anything that arrived during the probe window but isn't the OSC 11
		// response (early keystrokes, focus events, mouse, paste fragments)
		// gets pushed BACK into stdin so pi sees it when it takes over. Without
		// this the user's first few bytes after launch silently vanish.
		const finish = (result: Rgb | undefined, rawPayload: string | undefined, leftover: string) => {
			clearTimeout(timeout)
			process.stdin.removeListener("data", handler)
			cachedProbedBg = result
			cachedRawBgPayload = rawPayload
			if (leftover.length > 0) process.stdin.unshift(Buffer.from(leftover, "utf8"))
			if (!wasRaw) process.stdin.setRawMode?.(false)
			process.stdin.pause()
			resolveResult(result)
		}

		const handler = (data: Buffer | string) => {
			buffer += data.toString()
			// Cap buffer growth — a flood of unrelated bytes shouldn't be able
			// to grow this unbounded. Keep the tail since the OSC response, if
			// it arrives, is at the end of whatever's most recent.
			if (buffer.length > MAX_BUFFER_BYTES) {
				buffer = buffer.slice(buffer.length - MAX_BUFFER_BYTES)
			}
			// biome-ignore lint/suspicious/noControlCharactersInRegex: OSC terminal escape sequence
			const re = /\x1b\]11;(rgb:([0-9a-fA-F]+)\/([0-9a-fA-F]+)\/([0-9a-fA-F]+))(?:\x07|\x1b\\)/
			const match = buffer.match(re)
			if (match) {
				const toByte = (h: string) => Number.parseInt(h.padEnd(4, "0").slice(0, 2), 16)
				const idx = match.index ?? 0
				const leftover = buffer.slice(0, idx) + buffer.slice(idx + match[0].length)
				const rgb = { r: toByte(match[2]), g: toByte(match[3]), b: toByte(match[4]) }
				finish(rgb, match[1], leftover)
			}
		}

		const timeout = setTimeout(() => finish(undefined, undefined, buffer), QUERY_TIMEOUT_MS)

		process.stdin.on("data", handler)
		process.stdout.write(QUERY_BG)
	})
}

// Mirrors pi's own detectColorMode in dist/modes/interactive/theme/theme.js.
// Inlined here because we need the mode at theme-write time, before pi loads.
export function detectColorMode(): "truecolor" | "256color" {
	const colorterm = process.env.COLORTERM
	if (colorterm === "truecolor" || colorterm === "24bit") return "truecolor"
	if (process.env.WT_SESSION) return "truecolor"
	const term = process.env.TERM ?? ""
	if (term === "dumb" || term === "" || term === "linux") return "256color"
	if (process.env.TERM_PROGRAM === "Apple_Terminal") return "256color"
	if (term === "screen" || term.startsWith("screen-") || term.startsWith("screen.")) return "256color"
	return "truecolor"
}

// Lift toward white on dark bgs, drop toward black on light bgs.
//
// `delta` controls how strong the shift is. Useful values:
//   ~6   barely-there tile (tool boxes — content is dense, want minimal interference)
//   ~14  subtle but clearly visible block (user message)
//   ~22  pronounced (custom message — skill invocations, summaries)
//   ~30  prominent (selected item in selectors — needs to mark the cursor)
//
// `redBias > 0` skews the result toward red without changing the overall delta
// magnitude. On dark bgs we add MORE to R and LESS to G/B; on light bgs we
// drop R LESS and G/B MORE. End result: a rosy/red-tinged variant of the same
// brightness shift. Used for error-state surfaces (toolErrorBg).
//
// In 256-color mode (Terminal.app, screen, Linux console, dumb terminals) the
// 24-step gray ramp jumps in 10-unit RGB increments. We need both:
//   1. Each surface to land on a different gray slot than the base bg (else
//      it's invisible) — hence the floor of 10.
//   2. Each surface to land on a different slot from EACH OTHER (else
//      toolPending and userMessage collide on the same slot, looking
//      identical) — hence the 1.4× scale that keeps the hierarchy spaced.
// Truecolor mode is unaffected — deltas pass through as-is.
export function tintBackground(bg: Rgb, delta = 14, redBias = 0): string {
	const mode = detectColorMode()
	const effectiveDelta = mode === "256color" ? Math.max(Math.round(delta * 1.4), 10) : delta
	const luminance = 0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b
	const sign = luminance < 128 ? 1 : -1
	const dr = effectiveDelta + sign * redBias
	const dg = Math.max(2, effectiveDelta - sign * redBias)
	const db = Math.max(2, effectiveDelta - sign * redBias)
	const clamp = (n: number) => Math.max(0, Math.min(255, n))
	const r = clamp(bg.r + sign * dr)
	const g = clamp(bg.g + sign * dg)
	const b = clamp(bg.b + sign * db)
	const hex = (n: number) => n.toString(16).padStart(2, "0")
	return `#${hex(r)}${hex(g)}${hex(b)}`
}

// Used when the OSC 11 probe couldn't run (tmux, conhost, non-TTY, ACP, etc).
// We pick a plausible terminal bg from COLORFGBG so downstream tints derive
// from a consistent base. Defaults to a dark estimate since most kimchi users
// run on dark schemes.
export function estimateTerminalBackground(): Rgb {
	const colorfgbg = process.env.COLORFGBG ?? ""
	const parts = colorfgbg.split(";")
	if (parts.length >= 2) {
		const bg = Number.parseInt(parts[1], 10)
		if (!Number.isNaN(bg) && bg >= 8) {
			return { r: 0xff, g: 0xff, b: 0xff }
		}
	}
	return { r: 0x1a, g: 0x18, b: 0x18 }
}
