import { describe, expect, it } from "vitest"
import { LoopGuard, type ToolHistoryRecord, fingerprint } from "./loop-guard.js"

const FP_A = "fp_a"
const FP_B = "fp_b"
const FP_C = "fp_c"

function rec(overrides: Partial<ToolHistoryRecord> = {}): ToolHistoryRecord {
	return {
		toolName: "bash",
		toolArgs: '{"command":"ls"}',
		statusCode: 0,
		outputFingerprint: FP_A,
		...overrides,
	}
}

function feed(guard: LoopGuard, records: ToolHistoryRecord[]): Array<ReturnType<LoopGuard["record"]>> {
	return records.map((r) => guard.record(r))
}

function repeat<T>(value: T, n: number): T[] {
	return Array.from({ length: n }, () => value)
}

describe("LoopGuard initial state", () => {
	it("isTriggered is false initially", () => {
		expect(new LoopGuard().isTriggered()).toBe(false)
	})

	it("isWarned is false initially", () => {
		expect(new LoopGuard().isWarned()).toBe(false)
	})
})

describe("LoopGuard.reset", () => {
	it("clears history so n-gram detection restarts", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ toolArgs: '{"command":"a"}', statusCode: 1, outputFingerprint: FP_A }), 6))
		guard.reset()
		const states = feed(guard, repeat(rec({ toolArgs: '{"command":"a"}', statusCode: 1, outputFingerprint: FP_A }), 2))
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("clears warning fuse", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1 }), 3))
		expect(guard.isWarned()).toBe(true)
		guard.reset()
		expect(guard.isWarned()).toBe(false)
	})

	it("clears triggered flag", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1 }), 4))
		expect(guard.isTriggered()).toBe(true)
		guard.reset()
		expect(guard.isTriggered()).toBe(false)
	})
})

describe("LoopGuard.record return values", () => {
	it("returns ok while under all thresholds", () => {
		const guard = new LoopGuard()
		const states = feed(guard, [
			rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A }),
			rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B }),
			rec({ toolArgs: '{"command":"c"}', outputFingerprint: FP_C }),
		])
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("includes a reason on warn", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1 }), 2))
		const last = guard.record(rec({ statusCode: 1 }))
		expect(last.state).toBe("warn")
		expect(typeof last.reason).toBe("string")
		expect((last.reason ?? "").length).toBeGreaterThan(0)
	})

	it("includes a reason on terminate", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1 }), 3))
		const last = guard.record(rec({ statusCode: 1 }))
		expect(last.state).toBe("terminate")
		expect(typeof last.reason).toBe("string")
	})
})

describe("LoopGuard window of 30 records", () => {
	it("evicts oldest entries beyond 30 so old patterns cannot trigger detectors", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ toolArgs: '{"command":"old"}', statusCode: 1, outputFingerprint: FP_A }), 4))
		for (let i = 0; i < 30; i++) {
			guard.record(rec({ toolArgs: `{"command":"unique-${i}"}`, outputFingerprint: `u${i}` }))
		}
		const next = guard.record(rec({ toolArgs: '{"command":"old"}', statusCode: 1, outputFingerprint: FP_A }))
		expect(next.state).toBe("ok")
	})

	it("n-gram detection only considers records inside the window", () => {
		const guard = new LoopGuard()
		// Vary fingerprints so detector 1 (consecutive identical) does not fire.
		for (let i = 0; i < 4; i++) {
			guard.record(rec({ toolArgs: '{"command":"x"}', outputFingerprint: `x-${i}` }))
		}
		for (let i = 0; i < 30; i++) {
			guard.record(rec({ toolArgs: `{"command":"f-${i}"}`, outputFingerprint: `f${i}` }))
		}
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 4; i < 8; i++) {
			states.push(guard.record(rec({ toolArgs: '{"command":"x"}', outputFingerprint: `x-${i}` })))
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})
})

describe("fingerprint", () => {
	it("returns the same value for identical input", () => {
		const text = ["line1", "line2", "line3"].join("\n")
		expect(fingerprint(text)).toBe(fingerprint(text))
	})

	it("returns different values for different inputs", () => {
		expect(fingerprint("a")).not.toBe(fingerprint("b"))
	})

	it("hashes empty input deterministically", () => {
		expect(fingerprint("")).toBe(fingerprint(""))
	})

	it("only depends on the last 20 lines", () => {
		const tail = Array.from({ length: 20 }, (_, i) => `tail${i}`).join("\n")
		const headA = Array.from({ length: 50 }, (_, i) => `headA${i}`).join("\n")
		const headB = Array.from({ length: 80 }, (_, i) => `headB${i}`).join("\n")
		expect(fingerprint(`${headA}\n${tail}`)).toBe(fingerprint(`${headB}\n${tail}`))
	})

	it("differs when the last 20 lines differ", () => {
		const head = Array.from({ length: 100 }, (_, i) => `same${i}`).join("\n")
		const tailA = Array.from({ length: 20 }, (_, i) => `a${i}`).join("\n")
		const tailB = Array.from({ length: 20 }, (_, i) => `b${i}`).join("\n")
		expect(fingerprint(`${head}\n${tailA}`)).not.toBe(fingerprint(`${head}\n${tailB}`))
	})

	it("hashes the entire output when fewer than 20 lines", () => {
		expect(fingerprint("only-line")).not.toBe(fingerprint("different-line"))
	})

	it("returns a hex string", () => {
		expect(fingerprint("anything")).toMatch(/^[0-9a-f]+$/)
	})
})

describe("Detector 1 — consecutive identical errors", () => {
	it("warns on the 3rd consecutive identical failing call", () => {
		const guard = new LoopGuard()
		const r = rec({ statusCode: 1, outputFingerprint: FP_A })
		expect(guard.record(r).state).toBe("ok")
		expect(guard.record(r).state).toBe("ok")
		expect(guard.record(r).state).toBe("warn")
	})

	it("terminates on the 4th consecutive identical failing call", () => {
		const guard = new LoopGuard()
		const r = rec({ statusCode: 1, outputFingerprint: FP_A })
		feed(guard, repeat(r, 3))
		expect(guard.record(r).state).toBe("terminate")
		expect(guard.isTriggered()).toBe(true)
	})

	it("fires on consecutive identical successful calls", () => {
		const guard = new LoopGuard()
		const r = rec({ statusCode: 0, outputFingerprint: FP_A })
		expect(guard.record(r).state).toBe("ok")
		expect(guard.record(r).state).toBe("ok")
		expect(guard.record(r).state).toBe("warn")
		expect(guard.record(r).state).toBe("terminate")
	})

	it("breaks the streak on a successful call", () => {
		const guard = new LoopGuard()
		const fail = rec({ statusCode: 1, outputFingerprint: FP_A })
		feed(guard, [fail, fail, rec({ statusCode: 0, outputFingerprint: FP_A }), fail, fail])
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("breaks the streak when output fingerprint differs", () => {
		const guard = new LoopGuard()
		const states = feed(guard, [
			rec({ statusCode: 1, outputFingerprint: FP_A }),
			rec({ statusCode: 1, outputFingerprint: FP_B }),
			rec({ statusCode: 1, outputFingerprint: FP_A }),
		])
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("breaks the streak when toolArgs differ", () => {
		const guard = new LoopGuard()
		const states = feed(guard, [
			rec({ statusCode: 1, toolArgs: '{"command":"a"}' }),
			rec({ statusCode: 1, toolArgs: '{"command":"b"}' }),
			rec({ statusCode: 1, toolArgs: '{"command":"a"}' }),
		])
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})
})

describe("Detector 2 — fuzzy ngram (toolName + toolArgs only)", () => {
	it("does not fire at exactly 5 reps of a 2-gram (10 records)", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 5; i++) {
			states.push(guard.record(a))
			states.push(guard.record(b))
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("fires above 5 reps of a 2-gram", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		for (let i = 0; i < 5; i++) {
			guard.record(a)
			guard.record(b)
		}
		guard.record(a)
		const last = guard.record(b)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
		expect(guard.isWarned()).toBe(true)
	})

	it("does not fire at exactly 3 reps of a 3-gram (9 records)", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		const c = rec({ toolArgs: '{"command":"c"}', outputFingerprint: FP_C })
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 3; i++) {
			states.push(guard.record(a))
			states.push(guard.record(b))
			states.push(guard.record(c))
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("fires above 3 reps of a 3-gram", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		const c = rec({ toolArgs: '{"command":"c"}', outputFingerprint: FP_C })
		for (let i = 0; i < 3; i++) {
			guard.record(a)
			guard.record(b)
			guard.record(c)
		}
		guard.record(a)
		guard.record(b)
		const last = guard.record(c)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
	})

	it("ignores statusCode and outputFingerprint differences", () => {
		const guard = new LoopGuard()
		for (let i = 0; i < 7; i++) {
			guard.record(
				rec({
					toolArgs: '{"command":"a"}',
					statusCode: i % 2,
					outputFingerprint: `out-${i}`,
				}),
			)
			guard.record(
				rec({
					toolArgs: '{"command":"b"}',
					statusCode: (i + 1) % 2,
					outputFingerprint: `outb-${i}`,
				}),
			)
		}
		expect(guard.isWarned()).toBe(true)
	})

	it("does not fire when the alternation breaks before threshold", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}' })
		const b = rec({ toolArgs: '{"command":"b"}' })
		const c = rec({ toolArgs: '{"command":"c"}' })
		for (let i = 0; i < 4; i++) {
			guard.record(a)
			guard.record(b)
		}
		guard.record(c)
		guard.record(b)
		expect(guard.isWarned()).toBe(false)
	})
})

describe("Detector 3 — exact ngram (all 4 fields)", () => {
	it("does not fire at exactly 5 reps of an exact 2-gram (10 records)", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', statusCode: 1, outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', statusCode: 1, outputFingerprint: FP_B })
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 5; i++) {
			states.push(guard.record(a))
			states.push(guard.record(b))
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("fires above 5 reps of an exact 2-gram", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', statusCode: 1, outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', statusCode: 1, outputFingerprint: FP_B })
		for (let i = 0; i < 5; i++) {
			guard.record(a)
			guard.record(b)
		}
		guard.record(a)
		const last = guard.record(b)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
	})

	it("does not fire at exactly 3 reps of an exact 3-gram (9 records)", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		const c = rec({ toolArgs: '{"command":"c"}', outputFingerprint: FP_C })
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 3; i++) {
			states.push(guard.record(a))
			states.push(guard.record(b))
			states.push(guard.record(c))
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("fires above 3 reps of an exact 3-gram", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		const c = rec({ toolArgs: '{"command":"c"}', outputFingerprint: FP_C })
		for (let i = 0; i < 3; i++) {
			guard.record(a)
			guard.record(b)
			guard.record(c)
		}
		guard.record(a)
		guard.record(b)
		const last = guard.record(c)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
	})

	it("differing statusCode keeps it under threshold", () => {
		const guard = new LoopGuard()
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 6; i++) {
			states.push(
				guard.record(
					rec({
						toolArgs: '{"command":"a"}',
						statusCode: i % 2,
						outputFingerprint: FP_A,
					}),
				),
			)
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})

	it("differing outputFingerprint keeps it under threshold", () => {
		const guard = new LoopGuard()
		const states: Array<ReturnType<LoopGuard["record"]>> = []
		for (let i = 0; i < 6; i++) {
			states.push(
				guard.record(
					rec({
						toolArgs: '{"command":"a"}',
						statusCode: 1,
						outputFingerprint: `fp-${i}`,
					}),
				),
			)
		}
		expect(states.every((s) => s.state === "ok")).toBe(true)
	})
})

describe("Shared warning fuse", () => {
	it("warn from one detector + fire from another → terminate", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1, outputFingerprint: FP_A }), 3))
		expect(guard.isWarned()).toBe(true)
		expect(guard.isTriggered()).toBe(false)

		const a = rec({ toolArgs: '{"command":"x"}', outputFingerprint: "x1" })
		const b = rec({ toolArgs: '{"command":"y"}', outputFingerprint: "y1" })
		let last: ReturnType<LoopGuard["record"]> = { state: "ok" }
		for (let i = 0; i < 5; i++) {
			last = guard.record(a)
			last = guard.record(b)
		}
		last = guard.record(a)
		last = guard.record(b)
		expect(last.state).toBe("terminate")
		expect(guard.isTriggered()).toBe(true)
	})

	it("two near-misses below threshold stay ok", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', statusCode: 1, outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', statusCode: 1, outputFingerprint: FP_B })
		for (let i = 0; i < 4; i++) {
			guard.record(a)
			guard.record(b)
		}
		guard.record(rec({ toolArgs: '{"command":"reset"}', outputFingerprint: "r1" }))
		const c = rec({ toolArgs: '{"command":"c"}', statusCode: 1, outputFingerprint: FP_C })
		const d = rec({ toolArgs: '{"command":"d"}', statusCode: 1, outputFingerprint: "fp_d" })
		for (let i = 0; i < 4; i++) {
			guard.record(c)
			guard.record(d)
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("warn → next ok call → next detector fire still terminates (fuse does not reset)", () => {
		const guard = new LoopGuard()
		feed(guard, repeat(rec({ statusCode: 1, outputFingerprint: FP_A }), 3))
		expect(guard.isWarned()).toBe(true)
		guard.record(rec({ toolArgs: '{"command":"recover"}', outputFingerprint: "r1" }))
		const r = rec({ statusCode: 1, outputFingerprint: "fp_r" })
		feed(guard, repeat(r, 2))
		const last = guard.record(r)
		expect(last.state).toBe("terminate")
	})
})

describe("Bug-driven cases that must NOT fire", () => {
	it("break-filter-js-from-html: identical bash args, fingerprint changes each iter", () => {
		const guard = new LoopGuard()
		const args =
			'{"command":"python -c \\"from test_outputs import test_out_html_bypasses_filter; test_out_html_bypasses_filter()\\""}'
		const editArgs = (i: number) => `{"file_path":"/work/test.py","new_string":"v${i}"}`
		for (let i = 0; i < 5; i++) {
			guard.record({
				toolName: "edit",
				toolArgs: editArgs(i),
				statusCode: 0,
				outputFingerprint: `edit-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: args,
				statusCode: 1,
				outputFingerprint: `pyerr-${i}`,
			})
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("overfull-hbox: pdflatex | grep Overfull repeated with changing fingerprints", () => {
		const guard = new LoopGuard()
		const bashArgs = '{"command":"pdflatex main.tex | grep Overfull"}'
		for (let i = 0; i < 5; i++) {
			guard.record({
				toolName: "edit",
				toolArgs: `{"file_path":"main.tex","new_string":"edit-${i}"}`,
				statusCode: 0,
				outputFingerprint: `edit-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: bashArgs,
				statusCode: 0,
				outputFingerprint: `overfull-${i}`,
			})
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("tune-mjcf: python eval.py repeated with metric drift", () => {
		const guard = new LoopGuard()
		const bashArgs = '{"command":"python eval.py"}'
		for (let i = 0; i < 5; i++) {
			guard.record({
				toolName: "edit",
				toolArgs: `{"file_path":"model.xml","new_string":"tune-${i}"}`,
				statusCode: 0,
				outputFingerprint: `edit-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: bashArgs,
				statusCode: 0,
				outputFingerprint: `metric-${i}`,
			})
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("write-compressor: gcc + run + diff cycle with changing diff output", () => {
		const guard = new LoopGuard()
		const gcc = '{"command":"gcc -o c c.c"}'
		const run = '{"command":"./c < in > out"}'
		const diff = '{"command":"diff out expected"}'
		for (let i = 0; i < 4; i++) {
			guard.record({
				toolName: "edit",
				toolArgs: `{"file_path":"c.c","new_string":"v${i}"}`,
				statusCode: 0,
				outputFingerprint: `edit-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: gcc,
				statusCode: 0,
				outputFingerprint: `gcc-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: run,
				statusCode: 0,
				outputFingerprint: `run-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: diff,
				statusCode: 1,
				outputFingerprint: `diff-${i}`,
			})
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})

	it("winning-avg-corewars: pmars syntax errors with different fingerprints each edit", () => {
		const guard = new LoopGuard()
		const pmars = '{"command":"pmars warrior.red"}'
		for (let i = 0; i < 5; i++) {
			guard.record({
				toolName: "edit",
				toolArgs: `{"file_path":"warrior.red","new_string":"e${i}"}`,
				statusCode: 0,
				outputFingerprint: `edit-${i}`,
			})
			guard.record({
				toolName: "bash",
				toolArgs: pmars,
				statusCode: 1,
				outputFingerprint: `syntax-err-${i}`,
			})
		}
		expect(guard.isWarned()).toBe(false)
		expect(guard.isTriggered()).toBe(false)
	})
})

describe("Bug-driven cases that SHOULD fire", () => {
	it("torch-pipeline-parallelism: 4 identical reads (same args + fingerprint) → exact ngram catches", () => {
		const guard = new LoopGuard()
		const r = {
			toolName: "read",
			toolArgs: '{"file_path":"/work/pipeline.py"}',
			statusCode: 0,
			outputFingerprint: "same-content",
		}
		feed(guard, repeat(r, 3))
		const last = guard.record(r)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
		expect(guard.isWarned()).toBe(true)
	})

	it("4 contiguous identical failing bash calls → terminate", () => {
		const guard = new LoopGuard()
		const r = rec({ statusCode: 1, outputFingerprint: FP_A })
		feed(guard, repeat(r, 3))
		const last = guard.record(r)
		expect(last.state).toBe("terminate")
		expect(guard.isTriggered()).toBe(true)
	})

	it("long alternating (A, B) ≥ 6 reps → fuzzy 2-gram fires", () => {
		const guard = new LoopGuard()
		const a = rec({ toolArgs: '{"command":"a"}', outputFingerprint: FP_A })
		const b = rec({ toolArgs: '{"command":"b"}', outputFingerprint: FP_B })
		for (let i = 0; i < 5; i++) {
			guard.record(a)
			guard.record(b)
		}
		expect(guard.isWarned()).toBe(false)
		guard.record(a)
		const last = guard.record(b)
		expect(last.state === "warn" || last.state === "terminate").toBe(true)
	})
})
