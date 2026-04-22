export const isBunBinary =
	import.meta.url.includes("$bunfs") || import.meta.url.includes("~BUN") || import.meta.url.includes("%7EBUN")

/** True whenever the current process is running under Bun (dev or compiled binary). */
export const isRunningUnderBun = process.execPath.includes("bun")
