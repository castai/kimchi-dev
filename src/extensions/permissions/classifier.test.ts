import { describe, expect, it } from "vitest"
import { parseClassifierOutput } from "./classifier.js"

describe("parseClassifierOutput", () => {
	it("parses a valid safe verdict", () => {
		const r = parseClassifierOutput(`{ "verdict": "safe", "confidence": "high", "reason": "project build" }`)
		expect(r.verdict).toBe("safe")
		expect(r.confidence).toBe("high")
		expect(r.reason).toBe("project build")
	})

	it("parses requires-confirmation", () => {
		const r = parseClassifierOutput(`{"verdict":"requires-confirmation","confidence":"medium","reason":"ambiguous"}`)
		expect(r.verdict).toBe("requires-confirmation")
	})

	it("parses blocked", () => {
		const r = parseClassifierOutput(`{"verdict":"blocked","confidence":"high","reason":"destructive"}`)
		expect(r.verdict).toBe("blocked")
	})

	it("extracts embedded JSON when LLM adds prose", () => {
		const raw = `Sure. Here is my answer:\n\n{"verdict":"safe","confidence":"high","reason":"fine"}\n\nHope that helps.`
		expect(parseClassifierOutput(raw).verdict).toBe("safe")
	})

	it("falls back to requires-confirmation on garbage", () => {
		const r = parseClassifierOutput("not json at all")
		expect(r.verdict).toBe("requires-confirmation")
		expect(r.confidence).toBe("low")
	})

	it("falls back on unknown verdict", () => {
		const r = parseClassifierOutput(`{"verdict":"maybe","confidence":"high","reason":"x"}`)
		expect(r.verdict).toBe("requires-confirmation")
	})

	it("defaults confidence to low when missing", () => {
		const r = parseClassifierOutput(`{"verdict":"safe","reason":"x"}`)
		expect(r.confidence).toBe("low")
	})
})
