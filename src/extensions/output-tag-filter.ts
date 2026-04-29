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
