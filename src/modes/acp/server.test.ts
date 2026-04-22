import type { AgentSideConnection, SessionNotification } from "@agentclientprotocol/sdk"
import type { AgentSession, AgentSessionEvent, AgentSessionEventListener } from "@mariozechner/pi-coding-agent"
import { beforeEach, describe, expect, it } from "vitest"
import { type AcpSessionFactory, KimchiAcpAgent } from "./server.js"

// Minimal fake of AgentSession surface used by KimchiAcpAgent. The factory seam
// means we only need to stand in for the methods the ACP server actually calls:
// sessionId, subscribe, prompt, abort, dispose.
class FakeAgentSession {
	readonly sessionId: string
	private listeners = new Set<AgentSessionEventListener>()
	disposed = false
	aborted = false
	promptImpl: (text: string) => Promise<void> = async () => {}
	abortImpl: () => Promise<void> = async () => {}

	constructor(sessionId: string) {
		this.sessionId = sessionId
	}

	subscribe(listener: AgentSessionEventListener): () => void {
		this.listeners.add(listener)
		return () => {
			this.listeners.delete(listener)
		}
	}

	emit(event: AgentSessionEvent): void {
		for (const l of [...this.listeners]) l(event)
	}

	async prompt(text: string, _opts?: unknown): Promise<void> {
		await this.promptImpl(text)
	}

	async abort(): Promise<void> {
		this.aborted = true
		await this.abortImpl()
	}

	dispose(): void {
		this.disposed = true
		this.listeners.clear()
	}
}

function asSession(fake: FakeAgentSession): AgentSession {
	return fake as unknown as AgentSession
}

function makeConn(): AgentSideConnection {
	const stub = {
		sessionUpdate: async (_p: SessionNotification) => {},
	}
	return stub as unknown as AgentSideConnection
}

// Recording variant of makeConn: captures every sessionUpdate the agent emits
// so tests can assert on the full notification stream (tool_call, partial
// tool_call_update, terminal tool_call_update, etc.).
function makeRecordingConn(): { conn: AgentSideConnection; updates: SessionNotification[] } {
	const updates: SessionNotification[] = []
	const stub = {
		sessionUpdate: async (p: SessionNotification) => {
			updates.push(p)
		},
	}
	return { conn: stub as unknown as AgentSideConnection, updates }
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

describe("KimchiAcpAgent turn lifecycle", () => {
	let fake: FakeAgentSession
	let agent: KimchiAcpAgent
	let sessionId: string

	beforeEach(async () => {
		fake = new FakeAgentSession("session-a")
		const sessionFactory: AcpSessionFactory = async () => asSession(fake)
		agent = new KimchiAcpAgent(makeConn(), {
			extensionFactories: [],
			agentDir: "/tmp/fake-agent-dir",
			sessionFactory,
		})
		const res = await agent.newSession({ cwd: "/tmp", mcpServers: [] })
		sessionId = res.sessionId
	})

	// The fragile scenario the previous setImmediate heuristic could trip on:
	// session.prompt() resolves BEFORE the subscriber receives agent_end (e.g.
	// a slow extension agent_end handler awaits real I/O). The fix trusts
	// pi-agent-core's agent_end contract and waits until the event actually
	// arrives at our listener.
	it("resolves end_turn even when agent_end is delivered after session.prompt resolves", async () => {
		let agentEndDeliveredAt = 0
		let outerResolvedAt = 0
		fake.promptImpl = async () => {
			// Mirror pi-mono: agent_start is the first event of a real run.
			fake.emit({ type: "agent_start" })
			// agent.prompt awaits the LLM call; simulate with a short delay.
			await delay(5)
			// session.prompt is about to resolve; schedule agent_end AFTER that,
			// simulating a slow downstream handler on the agent_end path.
			setTimeout(() => {
				agentEndDeliveredAt = Date.now()
				fake.emit({ type: "agent_end", messages: [] })
			}, 40)
			// Return now — agent_end has NOT reached our subscriber yet.
		}

		const start = Date.now()
		const result = await agent.prompt({
			sessionId,
			prompt: [{ type: "text", text: "hi" }],
		})
		outerResolvedAt = Date.now()

		expect(result.stopReason).toBe("end_turn")
		// The outer prompt must wait for agent_end, not race ahead of it.
		expect(agentEndDeliveredAt).toBeGreaterThan(0)
		expect(outerResolvedAt).toBeGreaterThanOrEqual(agentEndDeliveredAt)
		expect(outerResolvedAt - start).toBeGreaterThanOrEqual(40)
	})

	// Extension-command / input-handler / no-op path: session.prompt returns
	// without emitting any agent events. The ACP handler must synthesize
	// end_turn itself — no agent_end is ever coming.
	it("synthesizes end_turn when the turn short-circuits without agent_start", async () => {
		fake.promptImpl = async () => {
			// No events emitted — exactly like an extension-command path.
		}

		const result = await agent.prompt({
			sessionId,
			prompt: [{ type: "text", text: "/help" }],
		})

		expect(result.stopReason).toBe("end_turn")
	})

	// Client cancels mid-turn: cancelled=true is set on the turn context, then
	// agent_end fires and the subscriber finalizes with stopReason=cancelled.
	it("resolves cancelled when cancel fires before agent_end", async () => {
		let cancelSeen = false
		fake.promptImpl = async () => {
			fake.emit({ type: "agent_start" })
			// Wait until cancel() runs.
			while (!cancelSeen) await delay(5)
			// pi-mono's abort path still emits agent_end on teardown.
			fake.emit({ type: "agent_end", messages: [] })
		}
		fake.abortImpl = async () => {
			cancelSeen = true
		}

		const promptP = agent.prompt({
			sessionId,
			prompt: [{ type: "text", text: "run forever" }],
		})
		// Give the prompt a moment to arm the turn context.
		await delay(10)
		await agent.cancel({ sessionId })

		const result = await promptP
		expect(result.stopReason).toBe("cancelled")
		expect(fake.aborted).toBe(true)
	})

	// Cancel path where pi-mono surfaces abortion as a rejection instead of a
	// final agent_end: the RPC contract still demands stopReason="cancelled",
	// not a JSON-RPC error. The prompt() catch block must honor cancelled=true
	// and resolve, not reject.
	it("resolves cancelled when session.prompt rejects after cancel", async () => {
		let cancelSeen = false
		fake.promptImpl = async () => {
			fake.emit({ type: "agent_start" })
			while (!cancelSeen) await delay(5)
			// Simulate pi-mono's "abort throws out of prompt()" variant — no
			// agent_end is emitted before the rejection.
			throw new Error("AbortError: operation was aborted")
		}
		fake.abortImpl = async () => {
			cancelSeen = true
		}

		const promptP = agent.prompt({
			sessionId,
			prompt: [{ type: "text", text: "run forever" }],
		})
		await delay(10)
		await agent.cancel({ sessionId })

		const result = await promptP
		expect(result.stopReason).toBe("cancelled")
		expect(fake.aborted).toBe(true)
	})

	// If session.prompt throws (pre-turn validation, config error, etc.), the
	// outer RPC promise must reject — not hang — regardless of whether any
	// events were emitted before the throw.
	it("rejects the outer prompt when session.prompt throws", async () => {
		fake.promptImpl = async () => {
			throw new Error("no model configured")
		}

		await expect(agent.prompt({ sessionId, prompt: [{ type: "text", text: "x" }] })).rejects.toThrow(
			/no model configured/,
		)
	})

	// Defensive: a late agent_end arriving after the short-circuit path has
	// already finalized must be a no-op, not a crash or double-resolve.
	it("ignores a late agent_end after a short-circuited turn", async () => {
		fake.promptImpl = async () => {
			// No events.
		}
		const result = await agent.prompt({
			sessionId,
			prompt: [{ type: "text", text: "/help" }],
		})
		expect(result.stopReason).toBe("end_turn")

		// Stray agent_end arrives later (shouldn't happen in production, but
		// the guard in onSessionEvent must keep us safe either way).
		expect(() => fake.emit({ type: "agent_end", messages: [] })).not.toThrow()
	})

	// Resource safety on the newSession error path: if subscribe (or any step
	// between factory-returns-session and sessions.set) throws, the live session
	// must be disposed — nothing else will ever clean it up.
	it("disposes the session if subscribe throws during newSession", async () => {
		const leaky = new FakeAgentSession("session-leak")
		leaky.subscribe = () => {
			throw new Error("subscribe boom")
		}
		const factory: AcpSessionFactory = async () => asSession(leaky)
		const localAgent = new KimchiAcpAgent(makeConn(), {
			extensionFactories: [],
			agentDir: "/tmp/fake-agent-dir",
			sessionFactory: factory,
		})

		await expect(localAgent.newSession({ cwd: "/tmp", mcpServers: [] })).rejects.toThrow(/subscribe boom/)
		expect(leaky.disposed).toBe(true)
	})

	// If the factory itself throws (e.g. bindExtensions failure in the default
	// factory), newSession must propagate the error — the factory owns disposal
	// of anything it allocated before throwing.
	it("propagates errors thrown by the session factory", async () => {
		const throwing: AcpSessionFactory = async () => {
			throw new Error("factory refused")
		}
		const localAgent = new KimchiAcpAgent(makeConn(), {
			extensionFactories: [],
			agentDir: "/tmp/fake-agent-dir",
			sessionFactory: throwing,
		})

		await expect(localAgent.newSession({ cwd: "/tmp", mcpServers: [] })).rejects.toThrow(/factory refused/)
	})

	// Two sessions run prompts concurrently; each turn must finalize against
	// its own agent_end. The slower session must not block the faster one.
	it("isolates turn state across parallel sessions", async () => {
		const fakeA = new FakeAgentSession("session-a")
		const fakeB = new FakeAgentSession("session-b")
		const fakes = [fakeA, fakeB]
		let i = 0
		const rotating: AcpSessionFactory = async () => asSession(fakes[i++] ?? fakes[fakes.length - 1])
		const parallelAgent = new KimchiAcpAgent(makeConn(), {
			extensionFactories: [],
			agentDir: "/tmp/fake-agent-dir",
			sessionFactory: rotating,
		})
		const a = await parallelAgent.newSession({ cwd: "/tmp/a", mcpServers: [] })
		const b = await parallelAgent.newSession({ cwd: "/tmp/b", mcpServers: [] })
		expect(a.sessionId).not.toBe(b.sessionId)

		fakeA.promptImpl = async () => {
			fakeA.emit({ type: "agent_start" })
			await delay(5)
			setTimeout(() => fakeA.emit({ type: "agent_end", messages: [] }), 60)
		}
		fakeB.promptImpl = async () => {
			fakeB.emit({ type: "agent_start" })
			await delay(5)
			setTimeout(() => fakeB.emit({ type: "agent_end", messages: [] }), 10)
		}

		const [resA, resB] = await Promise.all([
			parallelAgent.prompt({ sessionId: a.sessionId, prompt: [{ type: "text", text: "a" }] }),
			parallelAgent.prompt({ sessionId: b.sessionId, prompt: [{ type: "text", text: "b" }] }),
		])
		expect(resA.stopReason).toBe("end_turn")
		expect(resB.stopReason).toBe("end_turn")
	})
})

// Streaming tools (bash in particular) emit tool_execution_update with a
// partialResult payload for every output chunk. The ACP server translates each
// of these into a tool_call_update with status="in_progress" and content carrying
// the partial output — distinct from the terminal completed/failed update that
// accompanies tool_execution_end. The block below covers that branch directly.
describe("KimchiAcpAgent tool execution stream", () => {
	let fake: FakeAgentSession
	let agent: KimchiAcpAgent
	let sessionId: string
	let updates: SessionNotification[]

	beforeEach(async () => {
		fake = new FakeAgentSession("session-tool")
		const sessionFactory: AcpSessionFactory = async () => asSession(fake)
		const rec = makeRecordingConn()
		updates = rec.updates
		agent = new KimchiAcpAgent(rec.conn, {
			extensionFactories: [],
			agentDir: "/tmp/fake-agent-dir",
			sessionFactory,
		})
		const res = await agent.newSession({ cwd: "/tmp", mcpServers: [] })
		sessionId = res.sessionId
	})

	it("forwards partial tool_execution_update events as in_progress tool_call_update notifications with content", async () => {
		fake.promptImpl = async () => {
			fake.emit({ type: "agent_start" })
			fake.emit({
				type: "tool_execution_start",
				toolCallId: "tc-1",
				toolName: "bash",
				args: { command: "printf a; sleep 0; printf b" },
			})
			fake.emit({
				type: "tool_execution_update",
				toolCallId: "tc-1",
				toolName: "bash",
				args: { command: "printf a; sleep 0; printf b" },
				partialResult: { content: [{ type: "text", text: "a" }] },
			})
			fake.emit({
				type: "tool_execution_update",
				toolCallId: "tc-1",
				toolName: "bash",
				args: { command: "printf a; sleep 0; printf b" },
				partialResult: { content: [{ type: "text", text: "ab" }] },
			})
			fake.emit({
				type: "tool_execution_end",
				toolCallId: "tc-1",
				toolName: "bash",
				result: { content: [{ type: "text", text: "ab" }] },
				isError: false,
			})
			fake.emit({ type: "agent_end", messages: [] })
		}

		const res = await agent.prompt({ sessionId, prompt: [{ type: "text", text: "run" }] })
		expect(res.stopReason).toBe("end_turn")

		const toolCallUpdates = updates.filter((u) => u.update.sessionUpdate === "tool_call_update")
		const partials = toolCallUpdates.filter((u) => {
			const up = u.update as { status?: string; content?: unknown[] }
			return up.status === "in_progress" && Array.isArray(up.content) && up.content.length > 0
		})
		expect(partials).toHaveLength(2)
		// Each partial must carry the agent_session partialResult content verbatim
		// as ACP tool_call content blocks — proving the partialResult -> content
		// translation (toolResultContent) ran on the stream path, not only at end.
		const firstContent = (partials[0].update as { content: Array<{ content: { text: string } }> }).content
		expect(firstContent[0].content.text).toBe("a")
		const secondContent = (partials[1].update as { content: Array<{ content: { text: string } }> }).content
		expect(secondContent[0].content.text).toBe("ab")

		// Terminal completed update still fires after the partials.
		const terminal = toolCallUpdates.find((u) => (u.update as { status?: string }).status === "completed")
		expect(terminal).toBeDefined()
	})

	// Guard on server.ts:213-214: an empty partialResult must NOT produce a
	// tool_call_update — an in_progress update with empty content is noise for
	// clients that render the stream as it arrives.
	it("skips tool_execution_update events whose partialResult carries no content", async () => {
		fake.promptImpl = async () => {
			fake.emit({ type: "agent_start" })
			fake.emit({
				type: "tool_execution_start",
				toolCallId: "tc-2",
				toolName: "bash",
				args: { command: "true" },
			})
			// Empty partial shapes we can plausibly see: null, undefined, missing content, empty array.
			fake.emit({
				type: "tool_execution_update",
				toolCallId: "tc-2",
				toolName: "bash",
				args: { command: "true" },
				partialResult: null,
			})
			fake.emit({
				type: "tool_execution_update",
				toolCallId: "tc-2",
				toolName: "bash",
				args: { command: "true" },
				partialResult: { content: [] },
			})
			fake.emit({
				type: "tool_execution_end",
				toolCallId: "tc-2",
				toolName: "bash",
				result: { content: [{ type: "text", text: "" }] },
				isError: false,
			})
			fake.emit({ type: "agent_end", messages: [] })
		}

		const res = await agent.prompt({ sessionId, prompt: [{ type: "text", text: "run" }] })
		expect(res.stopReason).toBe("end_turn")

		const toolCallUpdates = updates.filter((u) => u.update.sessionUpdate === "tool_call_update")
		const partials = toolCallUpdates.filter((u) => (u.update as { status?: string }).status === "in_progress")
		expect(partials).toHaveLength(0)
		// Terminal completed update still present.
		const terminal = toolCallUpdates.find((u) => (u.update as { status?: string }).status === "completed")
		expect(terminal).toBeDefined()
	})
})
