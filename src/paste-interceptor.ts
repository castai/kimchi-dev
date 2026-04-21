// Heuristic fallback for terminals that don't honor bracketed-paste mode (ESC[?2004h).
// Without bracketed paste, a pasted multi-line block arrives as raw keystrokes — every \r matches the Editor's Enter keybinding and submits the first line as a message. The intent (a single multi-line prompt) is lost.
// This interceptor watches process.stdin and, when a single chunk looks like a burst paste, re-emits it wrapped in ESC[200~...ESC[201~ so pi-tui's existing bracketed-paste pipeline handles it. If the heuristic doesn't fire, behavior is unchanged.

// Use String.fromCharCode — biome strips literal control bytes from string literals.
const ESC = String.fromCharCode(0x1b)
const BRACKETED_START = `${ESC}[200~`
const BRACKETED_END = `${ESC}[201~`

const MIN_CHUNK_LEN = 4
const MIN_CR_COUNT = 2

export function looksLikeRawPaste(chunk: string): boolean {
	if (chunk.length < MIN_CHUNK_LEN) return false
	let crCount = 0
	for (let i = 0; i < chunk.length; i++) {
		if (chunk[i] === "\r") crCount++
		if (crCount >= MIN_CR_COUNT) break
	}
	if (crCount < MIN_CR_COUNT) return false
	// Conservative guard: if the chunk contains any escape byte, leave it alone. A real paste is plain text; an ESC here likely means the chunk also carries a key sequence we shouldn't corrupt.
	if (chunk.includes(ESC)) return false
	return true
}

export function wrapAsBracketedPaste(chunk: string): string {
	return BRACKETED_START + chunk.replace(/\r\n?/g, "\n") + BRACKETED_END
}

export function installPasteInterceptor(stdin: NodeJS.ReadStream = process.stdin): void {
	const originalEmit = stdin.emit.bind(stdin)
	stdin.emit = ((event: string | symbol, ...args: unknown[]) => {
		if (event === "data" && args.length > 0) {
			const chunk = args[0]
			const text = typeof chunk === "string" ? chunk : Buffer.isBuffer(chunk) ? chunk.toString("utf8") : null
			if (text !== null && looksLikeRawPaste(text)) {
				return originalEmit("data", wrapAsBracketedPaste(text))
			}
		}
		return originalEmit(event as string, ...args)
	}) as typeof stdin.emit
}
