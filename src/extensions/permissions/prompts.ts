import type { ExtensionContext } from "@mariozechner/pi-coding-agent"
import { titleCase } from "./rules.js"
import { suggestScope } from "./session-memory.js"
import type { Rule } from "./types.js"

export type ApprovalOutcome =
	| { kind: "allow-once" }
	| { kind: "allow-remember"; rule: Rule }
	| { kind: "deny-with-feedback"; feedback: string }
	| { kind: "deny" }

interface PromptOptions {
	toolName: string
	input: Record<string, unknown>
	ctx: ExtensionContext
	/** Extra context line shown above the choices (e.g. classifier reason). */
	subtitle?: string
}

export async function promptForApproval(opts: PromptOptions): Promise<ApprovalOutcome> {
	const { ctx, toolName, input, subtitle } = opts
	if (!ctx.hasUI) return { kind: "deny" }

	const scope = suggestScope(toolName, input)
	const callDescription = describeCall(toolName, input)

	const lines = [`The assistant wants to run: ${callDescription}`]
	if (subtitle) lines.push(subtitle)

	const yesOnce = "Yes — just this call"
	const yesRemember = `Yes — don't ask again for ${scope.label} this session`
	const noWithFeedback = "No — tell the assistant what to do differently"

	const choice = await ctx.ui.select(lines.join("\n"), [yesOnce, yesRemember, noWithFeedback])

	if (choice === yesOnce) return { kind: "allow-once" }

	if (choice === yesRemember) {
		const rule: Rule = {
			toolName: scope.toolName,
			content: scope.content,
			behavior: "allow",
			source: "session",
		}
		return { kind: "allow-remember", rule }
	}

	if (choice === noWithFeedback) {
		const feedback = await ctx.ui.input("Tell the assistant what to do differently:")
		const text = feedback?.trim()
		if (text) return { kind: "deny-with-feedback", feedback: text }
		return { kind: "deny" }
	}

	return { kind: "deny" }
}

function describeCall(toolName: string, input: Record<string, unknown>): string {
	if (toolName === "bash" && typeof input.command === "string") {
		return `Bash(${truncate(input.command, 200)})`
	}
	if (typeof input.path === "string") {
		return `${titleCase(toolName)}(${truncate(input.path, 200)})`
	}
	try {
		const preview = truncate(JSON.stringify(input), 120)
		return `${titleCase(toolName)}(${preview})`
	} catch {
		return titleCase(toolName)
	}
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s
	return `${s.slice(0, max - 1)}…`
}
