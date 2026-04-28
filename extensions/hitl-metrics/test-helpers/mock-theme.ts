/**
 * Test helper for creating mock Theme instances
 *
 * Provides a mock Theme that satisfies the interface for deterministic tests.
 */

import type { Theme, ThemeColor } from "@mariozechner/pi-coding-agent"

type NoOp = (text: string) => string

const noOp: NoOp = (text) => text

// ThemeBg type is not exported from main package, but we know the valid values
type ThemeBg = "selectedBg" | "userMessageBg" | "customMessageBg" | "toolPendingBg" | "toolSuccessBg" | "toolErrorBg"

/**
 * Create a minimal mock Theme for testing.
 * Returns plain strings without ANSI codes for deterministic tests.
 */
export function createMockTheme(): Theme {
	return {
		name: "mock",
		fg: (_color: ThemeColor, text: string) => text,
		bg: (_color: ThemeBg, text: string) => text,
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
