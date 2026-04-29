import type { Theme } from "@mariozechner/pi-coding-agent"

/**
 * Creates a mock theme for testing purposes.
 */
export function createMockTheme(): Theme {
	const noOp = (text: string) => text
	return {
		name: "mock",
		fg: (_c: "success" | "error" | "warning" | "muted" | "accent" | "dim" | "toolTitle" | string, text: string) => text,
		bg: (_c: string, text: string) => text,
		bold: noOp,
		italic: noOp,
		underline: noOp,
		inverse: noOp,
		strikethrough: noOp,
		getFgAnsi: () => "",
		getBgAnsi: () => "",
		getColorMode: () => "truecolor",
		getThinkingBorderColor: () => noOp,
		getBashModeBorderColor: () => noOp,
	} as unknown as Theme
}
