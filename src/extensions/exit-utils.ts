/**
 * Check if input is the bare "exit" alias (without leading slash).
 * When true, the input handler will immediately exit the process.
 */
export function isBareExitAlias(text: string): boolean {
	const trimmed = text.trim()
	return trimmed === "exit"
}

/**
 * Quit the application immediately.
 * Centralized exit point for consistent behavior across all exit paths.
 *
 * Note: Immediate exit is safe here because:
 * 1. This is only called when the user explicitly types "exit" at the input prompt
 * 2. The agent is idle (no in-flight LLM calls or streaming responses)
 * 3. Synchronous cleanup via process.on("exit") handlers still runs
 * 4. Matches user expectation of immediate termination (like shell exit)
 */
export function quitApplication(): never {
	process.exit(0)
}
