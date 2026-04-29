// Apply per-process dynamic background tints for the `kimchi-minimal` theme.
//
// We mutate the loaded Theme's bgColors Map directly instead of writing tints
// into the on-disk theme file. Why: when kimchi runs simultaneously in two
// terminals (iTerm2 + Terminal.app), each instance would otherwise overwrite
// the shared file with its own terminal-bg-derived tints. Pi's theme watcher
// would then live-reload the OTHER instance's theme, showing tints derived
// from a different terminal's bg — visually wrong. Mutating in memory keeps
// each process's runtime state isolated.
//
// We get the live Theme via `ctx.ui.theme` at session_start. `theme.bgColors`
// returns the underlying Map; calling `.set(key, ansi)` is observed by every
// later `theme.bg(token, text)` call from the rest of the app.
//
// Hex→ANSI conversion mirrors pi's internal bgAnsi (theme.js): truecolor uses
// `48;2;R;G;B`, 256-color quantizes to the 6×6×6 cube + 24-step gray ramp.

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent"
import { getActiveThemeName, onThemeChange } from "../settings-watcher.js"
import {
	type Rgb,
	detectColorMode,
	estimateTerminalBackground,
	getProbedBackground,
	tintBackground,
} from "../terminal-bg-probe.js"

const SURFACE_TINTS: ReadonlyArray<[token: string, delta: number, redBias: number]> = [
	["toolPendingBg", 6, 0],
	["toolSuccessBg", 6, 0],
	["toolErrorBg", 14, 10],
	["userMessageBg", 14, 0],
	["customMessageBg", 22, 0],
	["selectedBg", 30, 0],
]

const CUBE = [0, 95, 135, 175, 215, 255]
const GRAY = Array.from({ length: 24 }, (_, i) => 8 + i * 10)

function findClosest(value: number, candidates: readonly number[]): number {
	let minDist = Number.POSITIVE_INFINITY
	let minIdx = 0
	for (let i = 0; i < candidates.length; i++) {
		const d = Math.abs(value - candidates[i])
		if (d < minDist) {
			minDist = d
			minIdx = i
		}
	}
	return minIdx
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
	const dr = r1 - r2
	const dg = g1 - g2
	const db = b1 - b2
	return dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114
}

function rgbTo256(r: number, g: number, b: number): number {
	const ri = findClosest(r, CUBE)
	const gi = findClosest(g, CUBE)
	const bi = findClosest(b, CUBE)
	const cubeIdx = 16 + 36 * ri + 6 * gi + bi
	const cubeDist = colorDistance(r, g, b, CUBE[ri], CUBE[gi], CUBE[bi])
	const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
	const gi2 = findClosest(gray, GRAY)
	const grayValue = GRAY[gi2]
	const grayIdx = 232 + gi2
	const grayDist = colorDistance(r, g, b, grayValue, grayValue, grayValue)
	const spread = Math.max(r, g, b) - Math.min(r, g, b)
	if (spread < 10 && grayDist < cubeDist) return grayIdx
	return cubeIdx
}

function hexToBgAnsi(hex: string, mode: "truecolor" | "256color"): string {
	const r = Number.parseInt(hex.slice(1, 3), 16)
	const g = Number.parseInt(hex.slice(3, 5), 16)
	const b = Number.parseInt(hex.slice(5, 7), 16)
	if (mode === "truecolor") return `\x1b[48;2;${r};${g};${b}m`
	return `\x1b[48;5;${rgbTo256(r, g, b)}m`
}

export default function kimchiMinimalTintsExtension(pi: ExtensionAPI) {
	const applyTints = (ctx: ExtensionContext) => {
		const baseBg: Rgb = getProbedBackground() ?? estimateTerminalBackground()
		const mode = detectColorMode()

		// ctx.ui.theme is the live Theme instance. Its `bgColors` is the underlying
		// Map; mutating it is observed by every later `theme.bg(token, text)` call.
		// On theme switch via /settings, pi creates a fresh Theme — we re-apply.
		const themeWithBg = ctx.ui.theme as unknown as { bgColors?: Map<string, string> }
		if (!themeWithBg?.bgColors) return
		for (const [token, delta, redBias] of SURFACE_TINTS) {
			const hex = tintBackground(baseBg, delta, redBias)
			themeWithBg.bgColors.set(token, hexToBgAnsi(hex, mode))
		}
	}

	let unsubscribeThemeChange: (() => void) | undefined

	pi.on("session_start", (_event, ctx: ExtensionContext) => {
		if (getActiveThemeName() === "kimchi-minimal") applyTints(ctx)

		unsubscribeThemeChange?.()
		unsubscribeThemeChange = onThemeChange((newName) => {
			if (newName === "kimchi-minimal") {
				applyTints(ctx)
				// Nudge pi to repaint surfaces with the freshly-mutated bgColors.
				ctx.ui.setStatus("kimchi-tints-rerender", undefined)
			}
		})
	})

	pi.on("session_shutdown", () => {
		unsubscribeThemeChange?.()
		unsubscribeThemeChange = undefined
	})
}
