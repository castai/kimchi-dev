import { readFileSync } from "node:fs"
import { join } from "node:path"
import { intro, note } from "@clack/prompts"

/**
 * Welcome step — print the kimchi banner + version. Quick splash, no
 * input. Mirrors internal/tui/steps/welcome.go.
 */
export function runWelcomeStep(): void {
	intro("kimchi setup")
	note(
		[
			"This wizard will:",
			"  · prompt for your kimchi API key (validated online)",
			"  · pick which tools (Claude Code, OpenCode, Cursor, OpenClaw, GSD2) to configure",
			"  · write tool configs so they talk to the kimchi proxy",
			"",
			`kimchi v${readKimchiVersion()}`,
		].join("\n"),
		"What this does",
	)
}

function readKimchiVersion(): string {
	try {
		// package.json sits two dirs up from src/setup-wizard/steps/.
		const pkgPath = join(import.meta.dirname, "..", "..", "..", "package.json")
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string }
		return pkg.version
	} catch {
		return "unknown"
	}
}
