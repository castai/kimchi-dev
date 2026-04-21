import { complete } from "@mariozechner/pi-ai"
import type { ExtensionContext } from "@mariozechner/pi-coding-agent"
import classifierSystemPrompt from "./prompts/classifier-system-prompt.js"
import type { ClassifierResult, ClassifierVerdict } from "./types.js"

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
	if (!model) return unavailable("no model configured")

	const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model)
	if (!auth.ok || !auth.apiKey) return unavailable("no API key for classifier")

	const controller = new AbortController()
	const timeoutHandle = setTimeout(() => controller.abort(), options.timeoutMs)
	const outerSignal = ctx.signal
	const onOuterAbort = () => controller.abort()
	outerSignal?.addEventListener("abort", onOuterAbort)

	try {
		const response = await complete(
			model,
			{
				systemPrompt: classifierSystemPrompt,
				messages: [
					{
						role: "user",
						content: [{ type: "text", text: buildUserPrompt(call) }],
						timestamp: Date.now(),
					},
				],
			},
			{ apiKey: auth.apiKey, headers: auth.headers, signal: controller.signal },
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

export function parseClassifierOutput(raw: string): ClassifierResult {
	const json = extractJsonObject(raw)
	if (!json) return unavailable("classifier returned unparseable output")

	const verdict = normalizeVerdict(json.verdict)
	if (!verdict) return unavailable("classifier returned unknown verdict")

	const reason = typeof json.reason === "string" && json.reason.trim() ? json.reason.trim() : "no reason provided"
	return { verdict, reason }
}

function unavailable(reason: string): ClassifierResult {
	return { verdict: "requires-confirmation", reason }
}

function normalizeVerdict(v: unknown): ClassifierVerdict | undefined {
	if (v === "safe" || v === "requires-confirmation" || v === "blocked") return v
	return undefined
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
	const trimmed = raw.trim()
	try {
		const parsed = JSON.parse(trimmed)
		if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>
	} catch {
		// fall through to balanced-brace extraction
	}
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
