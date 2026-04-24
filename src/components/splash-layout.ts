// content(7) + widgetAbove spacer(1) + editor(3) + footer(1) = 12
export const SPLASH_FIXED_LINES = 12

export function splashTopPadding(): number {
	const termRows = process.stdout.rows ?? 24
	return Math.max(1, Math.floor((termRows - SPLASH_FIXED_LINES) / 2))
}
