import { describe, expect, it } from "vitest"
import { formatCount } from "../format.js"
import { getTimeRange } from "./api.js"
import { formatCurrency, getProviderDisplayName } from "./visual.js"

describe("getTimeRange", () => {
	it("returns correct time range for 30 days", () => {
		const { startTime, endTime } = getTimeRange(30)
		const diffMs = endTime.getTime() - startTime.getTime()
		const diffDays = diffMs / (1000 * 60 * 60 * 24)
		expect(diffDays).toBeCloseTo(30, 0)
	})

	it("returns correct time range for 7 days", () => {
		const { startTime, endTime } = getTimeRange(7)
		const diffMs = endTime.getTime() - startTime.getTime()
		const diffDays = diffMs / (1000 * 60 * 60 * 24)
		expect(diffDays).toBeCloseTo(7, 0)
	})

	it("returns correct time range for 1 day", () => {
		const { startTime, endTime } = getTimeRange(1)
		const diffMs = endTime.getTime() - startTime.getTime()
		const diffDays = diffMs / (1000 * 60 * 60 * 24)
		expect(diffDays).toBeCloseTo(1, 0)
	})
})

describe("formatCount", () => {
	it("formats thousands with k suffix", () => {
		expect(formatCount(1500)).toBe("1.5k")
		expect(formatCount(10000)).toBe("10k")
	})

	it("formats millions with M suffix", () => {
		expect(formatCount(1500000)).toBe("1.5M")
		expect(formatCount(10000000)).toBe("10M")
	})

	it("returns plain number for small values", () => {
		expect(formatCount(500)).toBe("500")
		expect(formatCount(999)).toBe("999")
	})
})

describe("formatCurrency", () => {
	it("formats number with dollar sign and 2 decimals", () => {
		expect(formatCurrency(1500.5)).toBe("$1500.50")
		expect(formatCurrency(0)).toBe("$0.00")
	})

	it("formats string amount", () => {
		expect(formatCurrency("1234.56")).toBe("$1234.56")
	})

	it("handles invalid input", () => {
		expect(formatCurrency("invalid")).toBe("$0.00")
		expect(formatCurrency(Number.NaN)).toBe("$0.00")
	})
})

describe("getProviderDisplayName", () => {
	it("maps claude-code-otel to Claude Code", () => {
		expect(getProviderDisplayName("claude-code-otel")).toBe("Claude Code")
	})

	it("maps opencode-otel to OpenCode", () => {
		expect(getProviderDisplayName("opencode-otel")).toBe("OpenCode")
	})

	it("maps pi-otel to Kimchi", () => {
		expect(getProviderDisplayName("pi-otel")).toBe("Kimchi")
	})

	it("returns original name for unknown providers", () => {
		expect(getProviderDisplayName("unknown-provider")).toBe("unknown-provider")
	})

	it("handles empty string", () => {
		expect(getProviderDisplayName("")).toBe("")
	})
})
