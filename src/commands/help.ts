import { ANSI, fg } from "../ansi.js"
import { COMMANDS } from "./registry.js"

const SECTION_HEADER = "\x1b[1m"
const RESET = "\x1b[0m"

function bold(text: string): string {
	return `${SECTION_HEADER}${text}${RESET}`
}

function dim(text: string): string {
	return fg(ANSI.dim, text)
}

/**
 * Render kimchi's own commands section, then delegate the rest of --help
 * (top-level options, examples, env vars) to pi-coding-agent's printHelp.
 *
 * Pi's printHelp uses APP_NAME from piConfig (= "kimchi"), so its output is
 * already branded correctly — we just prepend our subcommand catalogue.
 */
export async function printMergedHelp(): Promise<void> {
	console.log(`${bold("kimchi")} — coding agent CLI powered by Cast AI`)
	console.log()
	console.log(bold("Subcommands:"))
	const widest = Math.max(...COMMANDS.map((c) => c.name.length))
	for (const cmd of COMMANDS) {
		const name = cmd.name.padEnd(widest + 4)
		console.log(`  kimchi ${name}${cmd.summary}`)
	}
	console.log(`  kimchi ${"".padEnd(widest + 4)}${dim("(no subcommand)")} Launch the coding harness`)
	console.log()
	console.log(`${bold("Harness flags")} (apply to the default mode — when no subcommand is given):`)
	console.log(`${dim("Note: pi-coding-agent's own install/remove/list/config commands listed below")}`)
	console.log(`${dim("are not exposed by kimchi; the kimchi subcommands above take precedence.")}`)
	console.log()

	// Hand off to pi for the full options/examples/env-vars dump. pi prints
	// directly to stdout via console.log; there's no exported helper. Calling
	// main with --help and zero extension factories lets pi handle the full
	// banner the same way cli.ts has always done — we just print our section
	// first.
	const { main } = await import("@mariozechner/pi-coding-agent")
	await main(["--help"], { extensionFactories: [] })
}
