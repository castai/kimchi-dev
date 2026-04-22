import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import * as clack from "@clack/prompts"
import { discoverCcConfig } from "./cc-discovery.js"
import { DEFAULT_SKILL_PATHS, getAgentConfigDir } from "./config.js"
import type { ServerEntry } from "./extensions/mcp-adapter/types.js"

export type MigrationState = "done" | "skip-forever"

export interface SetupResult {
	skillPaths: string[]
	migrationState?: MigrationState
}

type MigrationAction = "migrate" | "skip-once" | "skip-forever"

async function runMigrationPhase(
	mcpServers: Record<string, ServerEntry>,
	skillCount: number,
): Promise<MigrationAction> {
	const serverNames = Object.keys(mcpServers)
	const lines: string[] = []
	if (serverNames.length > 0) {
		lines.push(`MCP servers: ${serverNames.join(", ")}`)
	}
	if (skillCount > 0) {
		lines.push(`Skills: ${skillCount} skill(s) in ~/.claude/skills/`)
	}

	clack.note(lines.join("\n"), "Claude Code configuration found")

	const action = await clack.select<MigrationAction>({
		message: "Migrate Claude Code MCP servers to Kimchi?",
		options: [
			{ value: "migrate", label: "Migrate now" },
			{ value: "skip-once", label: "Skip this time" },
			{ value: "skip-forever", label: "Never ask again" },
		],
	})

	if (clack.isCancel(action)) {
		return "skip-once"
	}

	return action as MigrationAction
}

function writeMcpServers(servers: Record<string, ServerEntry>): void {
	const mcpPath = join(getAgentConfigDir(), "mcp.json")
	mkdirSync(dirname(mcpPath), { recursive: true })

	let existing: Record<string, unknown> = {}
	if (existsSync(mcpPath)) {
		try {
			existing = JSON.parse(readFileSync(mcpPath, "utf-8")) as Record<string, unknown>
		} catch {
			// corrupt — start fresh
		}
	}

	const existingServers = (existing.mcpServers ?? {}) as Record<string, ServerEntry>
	const merged: Record<string, ServerEntry> = { ...servers, ...existingServers }

	existing.mcpServers = merged
	writeFileSync(mcpPath, `${JSON.stringify(existing, null, 2)}\n`, "utf-8")
}

async function runSkillsPhase(): Promise<string[]> {
	const selected = await clack.multiselect<string>({
		message: "Select skill paths to enable:",
		options: DEFAULT_SKILL_PATHS.map((p) => ({ value: p, label: p, initialChecked: true })),
		required: false,
	})

	if (clack.isCancel(selected)) {
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

	return paths
}

export async function runSetupWizard(options: {
	needsSkillsSetup: boolean
	needsMigrationCheck: boolean
}): Promise<SetupResult> {
	clack.intro("Kimchi first-time setup")

	let migrationState: MigrationState | undefined
	const discovery = options.needsMigrationCheck ? discoverCcConfig() : { mcpServers: {}, skillCount: 0 }
	const hasCcConfig =
		options.needsMigrationCheck && (Object.keys(discovery.mcpServers).length > 0 || discovery.skillCount > 0)

	if (hasCcConfig) {
		const action = await runMigrationPhase(discovery.mcpServers, discovery.skillCount)
		if (action === "migrate") {
			writeMcpServers(discovery.mcpServers)
			migrationState = "done"
			clack.log.success(`Migrated ${Object.keys(discovery.mcpServers).length} MCP server(s) to Kimchi.`)
		} else if (action === "skip-forever") {
			migrationState = "skip-forever"
		}
		// skip-once: leave migrationState undefined so wizard runs again next time
	} else if (options.needsMigrationCheck) {
		migrationState = "done"
	}

	let skillPaths = DEFAULT_SKILL_PATHS
	if (options.needsSkillsSetup) {
		clack.note(
			"Kimchi will look for skill files in the selected directories.\n" +
				"Each relative path is scanned under both ~ and the current project.",
			"Skills",
		)
		skillPaths = await runSkillsPhase()
	}

	clack.outro("Setup complete.")
	return { skillPaths, migrationState }
}
