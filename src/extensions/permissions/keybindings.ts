import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

// Reserve shift+tab for the permissions extension by unbinding the built-in
// `app.thinking.cycle` shortcut. Must run before pi-mono's main() so the
// KeybindingsManager loads the updated file. Idempotent; never throws.
export function reserveShiftTabForPermissions(agentDir: string): string {
	const keybindingsPath = resolve(agentDir, "keybindings.json")
	try {
		let current: Record<string, unknown> = {}
		if (existsSync(keybindingsPath)) {
			try {
				const raw = readFileSync(keybindingsPath, "utf-8")
				const parsed = JSON.parse(raw)
				if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
					current = parsed as Record<string, unknown>
				}
			} catch {
				// malformed; we'll overwrite with a known-good default
			}
		}
		if (current["app.thinking.cycle"] === "") return "already-reserved"

		current["app.thinking.cycle"] = ""
		mkdirSync(dirname(keybindingsPath), { recursive: true })
		writeFileSync(keybindingsPath, `${JSON.stringify(current, null, 2)}\n`, "utf-8")
		return "reserved"
	} catch (err) {
		return `error: ${(err as Error).message}`
	}
}
