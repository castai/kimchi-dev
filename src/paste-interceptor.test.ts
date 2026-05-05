import { EventEmitter } from "node:events"
import { describe, expect, it } from "vitest"
import { installPasteInterceptor, looksLikeRawPaste, wrapAsBracketedPaste } from "./paste-interceptor.js"

const ESC = String.fromCharCode(0x1b)

describe("looksLikeRawPaste", () => {
	it("is false for a single character", () => {
		expect(looksLikeRawPaste("a")).toBe(false)
		expect(looksLikeRawPaste("\r")).toBe(false)
	})

	it("is false for two \\r in a short chunk (below length threshold)", () => {
		// Length 3 — a human could plausibly type this; not enough signal to treat as paste.
		expect(looksLikeRawPaste("\r\r\r")).toBe(false)
	})

	it("is false for text with only one \\r", () => {
		expect(looksLikeRawPaste("hello world\r")).toBe(false)
	})

	it("is true for a multi-line paste without markers", () => {
		expect(looksLikeRawPaste("one\rtwo\rthree\rhow many lines?")).toBe(true)
	})

	it("is true for exactly two \\r separators in a 4+ byte chunk", () => {
		expect(looksLikeRawPaste("a\rb\r")).toBe(true)
	})

	it("is false when the chunk contains an ESC byte (conservative guard)", () => {
		// An ESC here usually means a key sequence is mixed in — don't corrupt it.
		expect(looksLikeRawPaste(`one\rtwo\r${ESC}[A`)).toBe(false)
	})
})

describe("wrapAsBracketedPaste", () => {
	it("wraps with ESC[200~ … ESC[201~ and normalizes \\r to \\n", () => {
		const out = wrapAsBracketedPaste("one\rtwo\rthree")
		expect(out).toBe(`${ESC}[200~one\ntwo\nthree\n${ESC}[201~`)
	})

	it("normalizes \\r\\n as well as bare \\r", () => {
		const out = wrapAsBracketedPaste("a\r\nb\rc")
		expect(out).toBe(`${ESC}[200~a\nb\nc\n${ESC}[201~`)
	})
})

describe("installPasteInterceptor", () => {
	function makeFakeStdin(): EventEmitter {
		// A plain EventEmitter is enough — the interceptor only uses .emit and .on isn't touched.
		return new EventEmitter()
	}

	it("wraps raw-paste-burst chunks in bracketed-paste markers before listeners see them", () => {
		const stdin = makeFakeStdin()
		installPasteInterceptor(stdin as unknown as NodeJS.ReadStream)
		const received: string[] = []
		stdin.on("data", (chunk) => received.push(chunk.toString()))

		stdin.emit("data", "one\rtwo\rthree")

		expect(received).toHaveLength(1)
		expect(received[0]).toBe(`${ESC}[200~one\ntwo\nthree\n${ESC}[201~`)
	})

	it("passes through chunks that don't look like a paste", () => {
		const stdin = makeFakeStdin()
		installPasteInterceptor(stdin as unknown as NodeJS.ReadStream)
		const received: string[] = []
		stdin.on("data", (chunk) => received.push(chunk.toString()))

		stdin.emit("data", "\r")
		stdin.emit("data", "hello")
		stdin.emit("data", `${ESC}[A`) // arrow key — should not be swallowed

		expect(received).toEqual(["\r", "hello", `${ESC}[A`])
	})

	it("passes non-data events through unchanged", () => {
		const stdin = makeFakeStdin()
		installPasteInterceptor(stdin as unknown as NodeJS.ReadStream)
		let endCalled = 0
		stdin.on("end", () => endCalled++)

		stdin.emit("end")

		expect(endCalled).toBe(1)
	})

	it("is idempotent — calling install twice does not double-wrap emit", () => {
		const stdin = makeFakeStdin()
		installPasteInterceptor(stdin as unknown as NodeJS.ReadStream)
		const emitAfterFirst = stdin.emit
		installPasteInterceptor(stdin as unknown as NodeJS.ReadStream)
		expect(stdin.emit).toBe(emitAfterFirst)

		// Sanity: a paste chunk still produces exactly one wrapped data event, not two.
		const received: string[] = []
		stdin.on("data", (chunk) => received.push(chunk.toString()))
		stdin.emit("data", "one\rtwo\rthree")
		expect(received).toHaveLength(1)
		expect(received[0]).toBe(`${ESC}[200~one\ntwo\nthree\n${ESC}[201~`)
	})
})
