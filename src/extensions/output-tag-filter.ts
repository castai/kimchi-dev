const FILTERED_OUTPUT_TAGS = ["think"]

const STRIP_PAIR = FILTERED_OUTPUT_TAGS.map((tag) => new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g"))
const STRIP_OPEN = FILTERED_OUTPUT_TAGS.map((tag) => new RegExp(`<${tag}>`, "g"))
const STRIP_CLOSE = FILTERED_OUTPUT_TAGS.map((tag) => new RegExp(`<\\/${tag}>`, "g"))
const FILTER_PAIR = FILTERED_OUTPUT_TAGS.map((tag) => new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "g"))

export function stripOutputTagWrappers(text: string): string {
	let result = text
	for (let i = 0; i < FILTERED_OUTPUT_TAGS.length; i++) {
		result = result.replace(STRIP_PAIR[i], "$1")
		result = result.replace(STRIP_OPEN[i], "")
		result = result.replace(STRIP_CLOSE[i], "")
	}
	return result
}

export function filterOutputTags(text: string): string {
	let result = text
	for (let i = 0; i < FILTERED_OUTPUT_TAGS.length; i++) {
		const tag = FILTERED_OUTPUT_TAGS[i]
		result = result.replace(FILTER_PAIR[i], "")
		if (result.trimStart().startsWith(`<${tag}>`)) {
			result = result.slice(0, result.indexOf(`<${tag}>`))
		}
	}
	return result
}

/**
 * Splits accumulated text into separate visible and thinking channels.
 *
 * Completed <think>...</think> blocks have their inner content routed to
 * `thinking`. Everything else (including text before/after think blocks, and
 * incomplete think blocks that follow visible text) goes to `visible`.
 *
 * Incomplete think blocks at the very start of the text (only whitespace
 * before them) are held — neither channel grows — so the caller's length
 * comparison won't emit anything until the block is closed or more context
 * arrives.
 */
export function splitOutputTags(text: string): { visible: string; thinking: string } {
	const tag = "think"
	const open = `<${tag}>`
	const close = `</${tag}>`

	let visible = ""
	let thinking = ""
	let remaining = text

	while (remaining.length > 0) {
		const openIdx = remaining.indexOf(open)
		if (openIdx === -1) {
			// No open tag — everything is visible
			visible += remaining
			break
		}

		// Text before the open tag is always visible
		const before = remaining.slice(0, openIdx)
		const afterOpen = remaining.slice(openIdx + open.length)
		const closeIdx = afterOpen.indexOf(close)

		if (closeIdx === -1) {
			// Incomplete block — no closing tag yet.
			// If only whitespace precedes this open tag (and visible is empty so far),
			// hold the entire remainder so neither channel grows (streaming hold).
			// Otherwise keep the prefix visible and hold the incomplete block.
			if (visible === "" && before.trim() === "") {
				// Hold — don't advance either channel
				break
			}
			visible += before + open + afterOpen
			break
		}

		// Completed block
		visible += before
		thinking += afterOpen.slice(0, closeIdx)
		remaining = afterOpen.slice(closeIdx + close.length)
	}

	return { visible, thinking }
}
