const FILTERED_OUTPUT_TAGS = ["think"]

export function filterOutputTags(text: string): string {
	let result = text
	for (const tag of FILTERED_OUTPUT_TAGS) {
		result = result.replace(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, "g"), "")
		const lastOpen = result.lastIndexOf(`<${tag}>`)
		if (lastOpen !== -1) {
			result = result.slice(0, lastOpen)
		}
	}
	return result
}
