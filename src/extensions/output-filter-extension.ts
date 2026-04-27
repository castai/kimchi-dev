import type { AssistantMessage } from "@mariozechner/pi-ai"
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { filterOutputTags } from "./output-tag-filter.js"

export default function outputFilterExtension(pi: ExtensionAPI) {
	const rawByIndex = new Map<number, string>()

	pi.on("message_start", (event) => {
		if (event.message.role === "assistant") {
			rawByIndex.clear()
		}
	})

	pi.on("message_update", (event) => {
		const ame = event.assistantMessageEvent
		if (ame.type !== "text_delta") return

		const idx = ame.contentIndex
		const raw = (rawByIndex.get(idx) ?? "") + ame.delta
		rawByIndex.set(idx, raw)

		const filtered = filterOutputTags(raw)
		const message = event.message as AssistantMessage
		const content = message.content[idx]
		if (content?.type === "text") {
			content.text = filtered
		}
	})
}
