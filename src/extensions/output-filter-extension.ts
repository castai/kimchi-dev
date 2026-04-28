import type { AssistantMessage } from "@mariozechner/pi-ai"
import { SettingsManager, type ExtensionAPI } from "@mariozechner/pi-coding-agent"
import { filterOutputTags, stripOutputTagWrappers } from "./output-tag-filter.js"

export default function outputFilterExtension(pi: ExtensionAPI) {
	const rawByIndex = new Map<number, string>()

	const settingsManager = SettingsManager.create()
	let hideThinkingBlock = settingsManager.getHideThinkingBlock()

	pi.on("session_start", async () => {
		await settingsManager.reload()
	})

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

		const processed = hideThinkingBlock ? filterOutputTags(raw) : stripOutputTagWrappers(raw)
		const message = event.message as AssistantMessage
		const content = message.content[idx]
		if (content?.type === "text") {
			content.text = processed
		}
	})
}
