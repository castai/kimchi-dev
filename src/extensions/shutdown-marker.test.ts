import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
	AGENT_END_ENTRY_TYPE,
	AGENT_TERMINATED_ENTRY_TYPE,
	type AgentEndData,
	type AgentTerminatedData,
	ShutdownMarker,
} from "./shutdown-marker.js"

describe("ShutdownMarker", () => {
	const FIXED_TIME = 1_700_000_000_000

	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(FIXED_TIME)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	describe("onAgentEnd", () => {
		const cases: Array<{ label: string; priorSessionStart: boolean }> = [
			{ label: "without prior session_start", priorSessionStart: false },
			{ label: "with prior session_start", priorSessionStart: true },
		]

		for (const { label, priorSessionStart } of cases) {
			it(`writes agent_end entry (${label})`, () => {
				const marker = new ShutdownMarker()
				if (priorSessionStart) marker.onSessionStart()

				const calls: Array<{ type: string; data: unknown }> = []
				marker.onAgentEnd((type, data) => calls.push({ type, data }))

				expect(calls).toEqual([
					{
						type: AGENT_END_ENTRY_TYPE,
						data: { timestamp: FIXED_TIME } satisfies AgentEndData,
					},
				])
			})
		}
	})

	describe("onSessionShutdown", () => {
		const cases: Array<{
			label: string
			setup: (marker: ShutdownMarker, append: (type: string, data: unknown) => void) => void
			expectedCalls: Array<{ type: string; data: unknown }>
		}> = [
			{
				label: "writes agent_terminated when no agent_end was written",
				setup: () => {},
				expectedCalls: [
					{
						type: AGENT_TERMINATED_ENTRY_TYPE,
						data: { reason: "signal", timestamp: FIXED_TIME } satisfies AgentTerminatedData,
					},
				],
			},
			{
				label: "writes agent_terminated after session_start with no agent_end",
				setup: (marker) => marker.onSessionStart(),
				expectedCalls: [
					{
						type: AGENT_TERMINATED_ENTRY_TYPE,
						data: { reason: "signal", timestamp: FIXED_TIME } satisfies AgentTerminatedData,
					},
				],
			},
			{
				label: "skips agent_terminated when agent_end was already written",
				setup: (marker, append) => marker.onAgentEnd(append),
				expectedCalls: [
					{
						type: AGENT_END_ENTRY_TYPE,
						data: { timestamp: FIXED_TIME } satisfies AgentEndData,
					},
				],
			},
		]

		for (const { label, setup, expectedCalls } of cases) {
			it(label, () => {
				const marker = new ShutdownMarker()
				const calls: Array<{ type: string; data: unknown }> = []
				const append = (type: string, data: unknown) => calls.push({ type, data })

				setup(marker, append)
				marker.onSessionShutdown(append)

				expect(calls).toEqual(expectedCalls)
			})
		}
	})

	describe("onSessionStart resets state", () => {
		it("allows agent_terminated to be written again after session_start clears agent_end flag", () => {
			const marker = new ShutdownMarker()
			const calls: Array<{ type: string; data: unknown }> = []
			const append = (type: string, data: unknown) => calls.push({ type, data })

			marker.onAgentEnd(append)
			marker.onSessionStart()
			marker.onSessionShutdown(append)

			expect(calls).toEqual([
				{
					type: AGENT_END_ENTRY_TYPE,
					data: { timestamp: FIXED_TIME } satisfies AgentEndData,
				},
				{
					type: AGENT_TERMINATED_ENTRY_TYPE,
					data: { reason: "signal", timestamp: FIXED_TIME } satisfies AgentTerminatedData,
				},
			])
		})
	})
})
