import { createInterface } from "node:readline/promises"
import { DEFAULT_SKILL_PATHS } from "./config.js"

export async function runSkillsWizard(): Promise<string[]> {
	const rl = createInterface({ input: process.stdin, output: process.stdout })

	console.log("\nSkills configuration")
	console.log("--------------------")
	console.log("Kimchi loads skill files from configured directories.")
	console.log("Each path is also scanned relative to the current project directory.\n")
	console.log("Default paths:")
	for (const p of DEFAULT_SKILL_PATHS) {
		console.log(`  ${p}`)
	}
	console.log()

	const answer = await rl.question("Press Enter to accept defaults, or enter custom paths (comma-separated):\n> ")
	rl.close()

	if (answer.trim() === "") {
		return DEFAULT_SKILL_PATHS
	}

	return answer
		.split(",")
		.map((p) => p.trim())
		.filter((p) => p.length > 0)
}
