export const isBunBinary =
	import.meta.url.includes("$bunfs") || import.meta.url.includes("~BUN") || import.meta.url.includes("%7EBUN")

export const isRunningUnderBun = typeof process.versions.bun === "string"
