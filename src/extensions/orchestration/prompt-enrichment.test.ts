import { describe, expect, it } from "vitest"
import { EnrichmentGuard, deduplicateEnrichedPrompts } from "./prompt-enrichment.js"
import type { OrchestratorMessages } from "./continuation-nudge.js"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEnrichedPrompt(): OrchestratorMessages[number] {
	return {
		role: "custom" as const,
		customType: "enriched-prompt",
		content: [{ type: "text" as const, text: "## Your Capabilities\n..." }],
		display: false,
		timestamp: Date.now(),
	}
}

function makeUser(text: string): OrchestratorMessages[number] {
	return { role: "user", content: [{ type: "text", text }], timestamp: Date.now() }
}

function makeAssistant(): OrchestratorMessages[number] {
	return {
		role: "assistant",
		content: [{ type: "text", text: "Done." }],
		api: "openai-completions",
		provider: "kimchi-dev",
		model: "kimi-k2.6",
		usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
		stopReason: "stop",
		timestamp: Date.now(),
	}
}

// ---------------------------------------------------------------------------
// EnrichmentGuard
// ---------------------------------------------------------------------------

describe("EnrichmentGuard", () => {
	it("injects on the first turn (no model seen yet)", () => {
		const guard = new EnrichmentGuard()
		expect(guard.shouldEnrich("kimi-k2.6")).toBe(true)
	})

	it("does not inject again on the same model", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		expect(guard.shouldEnrich("kimi-k2.6")).toBe(false)
	})

	it("does not inject on any subsequent turn with the same model", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		for (let i = 0; i < 5; i++) {
			expect(guard.shouldEnrich("kimi-k2.6")).toBe(false)
		}
	})

	it("re-injects when the model changes", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		expect(guard.shouldEnrich("claude-opus-4-7")).toBe(true)
	})

	it("does not re-inject on the turn after a model change", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		guard.shouldEnrich("claude-opus-4-7")
		expect(guard.shouldEnrich("claude-opus-4-7")).toBe(false)
	})

	it("re-injects if model switches back to a previously seen model", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		guard.shouldEnrich("claude-opus-4-7")
		expect(guard.shouldEnrich("kimi-k2.6")).toBe(true)
	})

	it("treats empty string model ID as a valid first-turn key", () => {
		const guard = new EnrichmentGuard()
		expect(guard.shouldEnrich("")).toBe(true)
		expect(guard.shouldEnrich("")).toBe(false)
	})

	it("re-injects after reset", () => {
		const guard = new EnrichmentGuard()
		guard.shouldEnrich("kimi-k2.6")
		guard.reset()
		expect(guard.shouldEnrich("kimi-k2.6")).toBe(true)
	})
})

// ---------------------------------------------------------------------------
// deduplicateEnrichedPrompts  (safety-net for accumulated duplicates)
// ---------------------------------------------------------------------------

describe("deduplicateEnrichedPrompts", () => {
	it("returns the same array when there are no enriched-prompt messages", () => {
		const messages: OrchestratorMessages = [makeUser("hi"), makeAssistant()]
		expect(deduplicateEnrichedPrompts(messages)).toBe(messages)
	})

	it("returns the same array when there is exactly one enriched-prompt", () => {
		const messages: OrchestratorMessages = [makeEnrichedPrompt(), makeUser("hi"), makeAssistant()]
		expect(deduplicateEnrichedPrompts(messages)).toBe(messages)
	})

	it("keeps only the last enriched-prompt when duplicates exist", () => {
		const first = makeEnrichedPrompt()
		const second = makeEnrichedPrompt()
		const messages: OrchestratorMessages = [first, makeUser("q1"), makeAssistant(), second, makeUser("q2")]
		const result = deduplicateEnrichedPrompts(messages)
		expect(result).not.toContain(first)
		expect(result).toContain(second)
	})

	it("removes all but the last when many duplicates have accumulated", () => {
		const copies = [makeEnrichedPrompt(), makeEnrichedPrompt(), makeEnrichedPrompt(), makeEnrichedPrompt()]
		const messages: OrchestratorMessages = [
			copies[0], makeUser("q1"), makeAssistant(),
			copies[1], makeUser("q2"), makeAssistant(),
			copies[2], makeUser("q3"), makeAssistant(),
			copies[3], makeUser("q4"),
		]
		const result = deduplicateEnrichedPrompts(messages)
		const remaining = result.filter(
			(m) => m.role === "custom" && "customType" in m && (m as { customType: string }).customType === "enriched-prompt",
		)
		expect(remaining).toHaveLength(1)
		expect(remaining[0]).toBe(copies[3])
	})

	it("preserves all non-enriched-prompt messages", () => {
		const user1 = makeUser("q1")
		const assistant1 = makeAssistant()
		const user2 = makeUser("q2")
		const messages: OrchestratorMessages = [makeEnrichedPrompt(), user1, assistant1, makeEnrichedPrompt(), user2]
		const result = deduplicateEnrichedPrompts(messages)
		expect(result).toContain(user1)
		expect(result).toContain(assistant1)
		expect(result).toContain(user2)
	})

	it("does not remove non-enriched-prompt custom messages", () => {
		const nudge = { role: "custom" as const, customType: "nudge", content: "nudge", display: false, timestamp: Date.now() }
		const messages: OrchestratorMessages = [makeEnrichedPrompt(), makeEnrichedPrompt(), nudge, makeUser("q")]
		const result = deduplicateEnrichedPrompts(messages)
		expect(result).toContain(nudge)
	})
})
