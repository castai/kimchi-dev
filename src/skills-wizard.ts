import * as clack from "@clack/prompts"
import { DEFAULT_SKILL_PATHS } from "./config.js"

export async function runSkillsWizard(): Promise<string[]> {
	clack.intro("Skills configuration")
	clack.note(
		"Kimchi will look for skill files in the selected directories.\n" +
			"Each relative path is scanned under both ~ and the current project.",
		"First-time setup",
	)

	const selected = await clack.multiselect<string>({
		message: "Select skill paths to enable:",
		options: DEFAULT_SKILL_PATHS.map((p) => ({ value: p, label: p, initialChecked: true })),
		required: false,
	})

	if (clack.isCancel(selected)) {
		clack.cancel("Setup cancelled. Using default paths.")
		return DEFAULT_SKILL_PATHS
	}

	const paths = selected as string[]

	const customInput = await clack.text({
		message: "Add a custom path (leave empty to skip):",
		placeholder: "e.g. .my-skills or /absolute/path/to/skills",
	})

	if (!clack.isCancel(customInput) && typeof customInput === "string" && customInput.trim().length > 0) {
		paths.push(customInput.trim())
	}

	clack.outro(`Saved ${paths.length} skill path(s).`)
	return paths
}
