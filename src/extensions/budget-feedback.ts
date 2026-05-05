import { createInterface } from "node:readline"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"

export default function (pi: ExtensionAPI) {
	if (process.env.KIMCHI_SUBAGENT !== "1" || process.env.KIMCHI_SUBAGENT_SUPPORTS_BUDGET_FEEDBACK !== "1") {
		return
	}

	const rl = createInterface({ input: process.stdin })

	// The parent process can send us budget events on stdin.  We read them
	// as newline-delimited JSON and inject each one into the session as a
	// user message so the subagent model can react.
	rl.on("line", (line) => {
		let event: Record<string, unknown>
		try {
			event = JSON.parse(line)
		} catch {
			// Not a JSON line — ignore.  Stdin may carry other data.
			return
		}
		const type = event.type
		if (type === "budget_warning") {
			const used = Number(event.used)
			const limit = Number(event.limit)
			const percent = Number(event.percent)
			const text = `[budget warning: ${used.toLocaleString()} / ${limit.toLocaleString()} soft limit used (${percent}%). Consider wrapping up.]`
			pi.sendMessage(
				{ customType: "budget_warning", content: [{ type: "text", text }], display: false },
				{ triggerTurn: true },
			)
		} else if (type === "budget_exceeded") {
			const used = Number(event.used)
			const limit = Number(event.limit)
			const text = `[budget exceeded: ${used.toLocaleString()} / ${limit.toLocaleString()} soft limit. Finishing current action, then stopping.]`
			pi.sendMessage(
				{ customType: "budget_exceeded", content: [{ type: "text", text }], display: false },
				{ triggerTurn: true },
			)
		}
	})
}
