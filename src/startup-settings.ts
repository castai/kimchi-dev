import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

/**
 * Seed pi-mono's global settings.json with kimchi defaults on first run.
 *
 * Only writes a key if it's absent, so users who explicitly toggle a setting
 * in /settings keep their choice.
 */
export function seedDefaultSettings(agentDir: string): string {
	const settingsPath = resolve(agentDir, "settings.json")
	try {
		let current: Record<string, unknown> = {}
		if (existsSync(settingsPath)) {
			try {
				const raw = readFileSync(settingsPath, "utf-8")
				const parsed = JSON.parse(raw)
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
					current = parsed as Record<string, unknown>
				}
			} catch {
				// unreadable or malformed — leave untouched, don't clobber user data
				return "skipped: unreadable settings.json"
			}
		}

		if ("quietStartup" in current) return "already-set"

		current.quietStartup = true
		mkdirSync(dirname(settingsPath), { recursive: true })
		writeFileSync(settingsPath, `${JSON.stringify(current, null, 2)}\n`, "utf-8")
		return "seeded"
	} catch (err) {
		return `error: ${(err as Error).message}`
	}
}
