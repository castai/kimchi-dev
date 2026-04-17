import { existsSync } from "node:fs"
import { join } from "node:path"

function recoveryHint(dir: string): string {
	return `\n\nPlease ensure kimchi-code is properly installed. Expected auxiliary files at:\n  ${dir}\n\nTo fix this issue:\n  1. Reinstall kimchi-code, or\n  2. Set the PI_PACKAGE_DIR environment variable to point to the correct directory`
}

export function validateAuxiliaryFiles(dir: string): void {
	if (!existsSync(dir)) {
		throw new Error(`Auxiliary files directory not found: ${dir}${recoveryHint(dir)}`)
	}

	const packageJsonPath = join(dir, "package.json")
	if (!existsSync(packageJsonPath)) {
		throw new Error(`Required file missing: package.json\nExpected location: ${packageJsonPath}${recoveryHint(dir)}`)
	}

	const themeDirPath = join(dir, "theme")
	if (!existsSync(themeDirPath)) {
		throw new Error(`Required directory missing: theme/\nExpected location: ${themeDirPath}${recoveryHint(dir)}`)
	}
}
