import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

// Seed pi-mono's global settings.json with kimchi defaults on first run.
// Only writes a key if it's absent, so users who explicitly toggle in
// /settings keep their choice.
export function seedDefaultSettings(agentDir: string): void {
	const settingsPath = resolve(agentDir, "settings.json")
	try {
		let current: Record<string, unknown> = {}
		if (existsSync(settingsPath)) {
			try {
				const parsed = JSON.parse(readFileSync(settingsPath, "utf-8"))
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
					current = parsed as Record<string, unknown>
				}
			} catch {
				// unreadable or malformed — leave untouched, don't clobber user data
				return
			}
		}

		if ("quietStartup" in current) return

		current.quietStartup = true
		mkdirSync(dirname(settingsPath), { recursive: true })
		writeFileSync(settingsPath, `${JSON.stringify(current, null, 2)}\n`, "utf-8")
	} catch {
		// best-effort: settings seeding is non-critical
	}
}
