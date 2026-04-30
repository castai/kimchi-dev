import { runWizard } from "../setup-wizard/index.js"

export async function runSetup(_args: string[]): Promise<number> {
	const result = await runWizard()
	if (result.cancelled) return 130 // Conventional exit code for SIGINT/Ctrl-C.
	return 0
}
