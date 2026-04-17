export type PermissionMode = "default" | "plan" | "auto"

export type RuleBehavior = "allow" | "deny"

export type RuleSource = "session" | "cli" | "local" | "project" | "user"

export interface Rule {
	toolName: string
	content?: string
	behavior: RuleBehavior
	source: RuleSource
}

export type ToolCategory = "readOnly" | "write" | "execute" | "network" | "unknown"

export type ClassifierVerdict = "safe" | "requires-confirmation" | "blocked"

export interface ClassifierResult {
	verdict: ClassifierVerdict
	confidence: "high" | "medium" | "low"
	reason: string
}

export interface PermissionsConfig {
	defaultMode: PermissionMode
	allow: string[]
	deny: string[]
	classifierTimeoutMs: number
}

export const DEFAULT_CONFIG: PermissionsConfig = {
	defaultMode: "default",
	allow: [],
	deny: ["Bash(rm -rf /*)", "Bash(sudo *)", "Write(.env)", "Write(.env.*)", "Edit(.env)", "Edit(.env.*)"],
	classifierTimeoutMs: 8000,
}
