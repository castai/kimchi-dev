import { complete } from "@mariozechner/pi-ai"
import type { ExtensionContext } from "@mariozechner/pi-coding-agent"
import type { ClassifierResult, ClassifierVerdict } from "./types.js"

export const CLASSIFIER_SYSTEM_PROMPT = `You are a security gate for a terminal coding assistant. A coding agent is about to invoke a tool on the user's machine. Your job is to classify the call into one of three verdicts:

  safe                   — the call has no meaningful chance of causing harm, data loss, privacy leak, or persistent side effects outside the working directory.
  requires-confirmation  — the call is plausibly fine but has a real chance of being destructive or sensitive and the user should confirm before it runs.
  blocked                — the call is clearly destructive, exfiltrates secrets, attempts to disable safety controls, or otherwise should never run without the user understanding what it does.

Use "blocked" sparingly — only when you are confident harm would result. Use "requires-confirmation" for ambiguous cases where the user's intent would resolve the question (for example: "rm somefile" inside the project directory is almost always fine, but the user should confirm).

Focus on concrete blast radius:
  - Files outside the current working directory, especially in $HOME, /etc, /usr, ~/.ssh, ~/.aws, ~/.gnupg, ~/.config, shell rc files.
  - Destructive git operations that rewrite or discard history (reset --hard, push --force, branch -D, clean -fdx).
  - Package installs or global tool installs.
  - Network calls that send data to untrusted endpoints.
  - Commands that read credentials or environment secrets and could exfiltrate them (curl piped to a file upload, environment dumps to a remote host).
  - Process control: sudo, kill, systemctl, shutdown, reboot.
  - Privilege escalation, sandbox escape, or disabling safety hooks.

Commands that are typically safe inside a project directory:
  - Reading, listing, grepping files the agent already has context on.
  - Building, testing, linting, formatting the current project.
  - Version-control inspection (status, log, diff, show, branch -v).
  - Git operations that only affect the current branch and can be undone (add, commit, switch, stash).
  - Running scripts under ./scripts/, ./bin/, or the project's test runner.

Return a single JSON object with no prose before or after:

{
  "verdict": "safe" | "requires-confirmation" | "blocked",
  "confidence": "high" | "medium" | "low",
  "reason": "<one short sentence the user will see>"
}

If you cannot parse the call or the information is insufficient, return "requires-confirmation" with confidence "low".`

export interface ClassifyInput {
	toolName: string
	input: Record<string, unknown>
	cwd: string
}

export interface ClassifierOptions {
	timeoutMs: number
}

export async function classifyToolCall(
	ctx: ExtensionContext,
	call: ClassifyInput,
	options: ClassifierOptions,
): Promise<ClassifierResult> {
	const model = ctx.model
	if (!model) {
		return unavailable("no model configured")
	}

	const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model)
	if (!auth.ok || !auth.apiKey) {
		return unavailable("no API key for classifier")
	}

	const userPrompt = buildUserPrompt(call)

	const controller = new AbortController()
	const timeoutHandle = setTimeout(() => controller.abort(), options.timeoutMs)

	// Propagate the outer signal too, if present.
	const outerSignal = ctx.signal
	const onOuterAbort = () => controller.abort()
	outerSignal?.addEventListener("abort", onOuterAbort)

	try {
		const response = await complete(
			model,
			{
				systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
				messages: [
					{
						role: "user",
						content: [{ type: "text", text: userPrompt }],
						timestamp: Date.now(),
					},
				],
			},
			{
				apiKey: auth.apiKey,
				headers: auth.headers,
				signal: controller.signal,
			},
		)

		const text = response.content
			.filter((c): c is { type: "text"; text: string } => c.type === "text")
			.map((c) => c.text)
			.join("\n")

		return parseClassifierOutput(text)
	} catch (err) {
		const aborted = (err as Error)?.name === "AbortError" || controller.signal.aborted
		return unavailable(aborted ? "classifier timeout" : `classifier error: ${(err as Error).message}`)
	} finally {
		clearTimeout(timeoutHandle)
		outerSignal?.removeEventListener("abort", onOuterAbort)
	}
}

function buildUserPrompt(call: ClassifyInput): string {
	const inputStr = truncate(safeStringify(call.input), 2048)
	return [`Tool: ${call.toolName}`, `Working directory: ${call.cwd}`, "Arguments:", inputStr].join("\n")
}

/** Parse classifier output as lenient JSON; default to requires-confirmation. */
export function parseClassifierOutput(raw: string): ClassifierResult {
	const json = extractJsonObject(raw)
	if (!json) return unavailable("classifier returned unparseable output")

	const verdict = normalizeVerdict(json.verdict)
	if (!verdict) return unavailable("classifier returned unknown verdict")

	const confidence = normalizeConfidence(json.confidence)
	const reason = typeof json.reason === "string" && json.reason.trim() ? json.reason.trim() : "no reason provided"

	return { verdict, confidence, reason }
}

function unavailable(reason: string): ClassifierResult {
	return { verdict: "requires-confirmation", confidence: "low", reason }
}

function normalizeVerdict(v: unknown): ClassifierVerdict | undefined {
	if (v === "safe" || v === "requires-confirmation" || v === "blocked") return v
	return undefined
}

function normalizeConfidence(v: unknown): "high" | "medium" | "low" {
	if (v === "high" || v === "medium" || v === "low") return v
	return "low"
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
	const trimmed = raw.trim()
	// Try straight parse first.
	try {
		const parsed = JSON.parse(trimmed)
		if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>
	} catch {
		// fall through
	}
	// Find the first balanced JSON object substring.
	const start = trimmed.indexOf("{")
	if (start < 0) return null
	let depth = 0
	for (let i = start; i < trimmed.length; i++) {
		const ch = trimmed[i]
		if (ch === "{") depth++
		else if (ch === "}") {
			depth--
			if (depth === 0) {
				try {
					const parsed = JSON.parse(trimmed.slice(start, i + 1))
					if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>
				} catch {
					return null
				}
			}
		}
	}
	return null
}

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}

function truncate(s: string, max: number): string {
	if (s.length <= max) return s
	return `${s.slice(0, max - 1)}…`
}
