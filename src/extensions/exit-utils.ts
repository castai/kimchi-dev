/**
 * Check if input is the bare "exit" alias (without leading slash).
 * When true, the input handler will trigger a graceful shutdown.
 */
export function isBareExitAlias(text: string): boolean {
	const trimmed = text.trim()
	return trimmed === "exit"
}
