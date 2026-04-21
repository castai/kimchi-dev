import { describe, expect, it } from "vitest"
import { type InteractiveSession, spawnInteractive } from "./harness.js"

// Built via String.fromCharCode — biome strips literal control bytes from string literals.
const ESC = String.fromCharCode(0x1b)
const BEL = String.fromCharCode(0x07)

const OSC_RE = new RegExp(`${ESC}\\][^${BEL}]*${BEL}`, "g") // hyperlinks, title updates: ESC ] ... BEL
const CSI_RE = new RegExp(`${ESC}\\[[\\d;?>]*[a-zA-Z]`, "g") // colors, cursor motion, clears: ESC [ ... letter
const KEYPAD_RE = new RegExp(`${ESC}[=>]`, "g") // keypad mode toggles: ESC =, ESC >
const CHARSET_RE = new RegExp(`${ESC}\\([AB012]`, "g") // G0 charset select: ESC ( B etc.

// Strip ANSI SGR/CSI/OSC escapes and normalize line endings. The TUI uses bare `\r` to move the cursor to column 0 before overwriting a row, so treat any `\r` (alone or as part of `\r\n`) as a logical row break for matching purposes.
function stripAnsi(s: string): string {
	return s
		.replace(OSC_RE, "")
		.replace(CSI_RE, "")
		.replace(KEYPAD_RE, "")
		.replace(CHARSET_RE, "")
		.replace(/\r\n?/g, "\n")
}

// Wait for the interactive prompt to be fully mounted. The hint "ctrl+c/ctrl+d clear/exit" only appears once the TUI's Editor is accepting input. First-time spawns on a cold sandbox HOME download fd/rg (~30s), so the timeout is generous.
async function waitForPrompt(session: InteractiveSession): Promise<void> {
	await session.waitFor((out) => out.includes("ctrl+c/ctrl+d"), 45_000)
	// Banner can render before the Editor binds its input handler.
	await new Promise((r) => setTimeout(r, 500))
}

const PASTED = "one\ntwo\nthree\nhow many lines of text do I have?"

const FOUR_LINE_ROW_REGEXES = [
	/(^|\n).*one\s+\n/,
	/(^|\n)\s*two\s+\n/,
	/(^|\n)\s*three\s+\n/,
	/how many lines of text do I have\?/,
]

function allFourLinesVisible(plain: string): boolean {
	return FOUR_LINE_ROW_REGEXES.every((re) => re.test(plain))
}

describe("interactive multi-line paste (LLM-1358)", () => {
	it("bracketed paste of 4 lines keeps all 4 lines in the editor buffer", { timeout: 60_000 }, async () => {
		const session = spawnInteractive()
		try {
			await waitForPrompt(session)
			session.bracketedPaste(PASTED)
			await session.waitFor((out) => allFourLinesVisible(stripAnsi(out)), 5_000)

			const plain = stripAnsi(session.output())
			for (const re of FOUR_LINE_ROW_REGEXES) {
				expect(plain).toMatch(re)
			}
			// LLM-1358 regression guard: if the paste handler stripped newlines, every pasted line would collide into a single row with no separators.
			expect(plain).not.toMatch(/onetwothree/)
			expect(plain).not.toMatch(/threehow many/)
		} finally {
			await session.kill()
		}
	})

	it("bracketed paste split across multiple writes still preserves all lines", { timeout: 60_000 }, async () => {
		const session = spawnInteractive()
		try {
			await waitForPrompt(session)

			// Split the paste marker + content across two writes with a delay, exercising StdinBuffer's cross-chunk pasteBuffer accumulation (pi-tui stdin-buffer.js:230-273). If that logic regresses, the end marker won't be found and handlePaste won't fire.
			const firstHalf = `${ESC}[200~one\ntwo\n`
			const secondHalf = `three\nhow many lines of text do I have?${ESC}[201~`
			session.pty.write(firstHalf)
			await new Promise((r) => setTimeout(r, 80))
			session.pty.write(secondHalf)

			await session.waitFor((out) => allFourLinesVisible(stripAnsi(out)), 5_000)

			const plain = stripAnsi(session.output())
			for (const re of FOUR_LINE_ROW_REGEXES) {
				expect(plain).toMatch(re)
			}
		} finally {
			await session.kill()
		}
	})

	// Reproduces the failure mode behind LLM-1358. If the colleague's terminal (or an intermediate layer — tmux, ssh wrapper, a remote-dev terminal) doesn't honor pi-tui's bracketed-paste enable sequence `\x1b[?2004h`, the paste arrives as raw keystrokes. The Editor's `tui.input.submit` keybinding matches bare `\r` (Enter), so the first `\r` submits the first line as a chat message and the remaining lines get typed into a now-empty editor, which in turn submits them one by one. The user sees their paste split across messages with nothing resembling a single multi-line prompt — colloquially, "multi-line paste doesn't work."
	it(
		"raw paste without bracketed-paste markers submits after the first newline (failure repro)",
		{ timeout: 60_000 },
		async () => {
			const session = spawnInteractive()
			try {
				await waitForPrompt(session)

				// Terminals send Enter as `\r`, not `\n`. Replace accordingly so this really simulates "bracketed paste is disabled and the paste came in as keystrokes."
				session.pty.write(PASTED.replace(/\n/g, "\r"))

				// Wait for evidence that a submission occurred. The agent will try to process the first submitted line and either render a spinner ("Working...") or an auth error — both are unambiguous signals that the Editor treated the pasted content as "type this then press Enter" rather than a single paste.
				await session.waitFor((out) => {
					const plain = stripAnsi(out)
					return /Working\.\.\./.test(plain) || /Error:/.test(plain)
				}, 10_000)

				const plain = stripAnsi(session.output())

				// Primary symptom: the 4 lines do NOT all appear as standalone editor rows — they got split across submitted messages instead. Specifically, the intermediate lines ("two" and "three") don't survive anywhere as distinct editor rows.
				expect(allFourLinesVisible(plain)).toBe(false)
				expect(plain).not.toMatch(/(^|\n)\s*two\s+\n/)
				expect(plain).not.toMatch(/(^|\n)\s*three\s+\n/)

				// Evidence that kimchi treated the paste as "submit the first line as a message" — either the agent is processing, or the dummy API key produced an auth error.
				expect(plain).toMatch(/Working\.\.\.|Error:/)
			} finally {
				await session.kill()
			}
		},
	)
})
