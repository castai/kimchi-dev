import type { AssistantMessage, ThinkingContent } from "@mariozechner/pi-ai"
import { type ExtensionAPI, SettingsManager } from "@mariozechner/pi-coding-agent"
import { filterOutputTags, splitOutputTags } from "./output-tag-filter.js"

export default function outputFilterExtension(pi: ExtensionAPI) {
	const rawByIndex = new Map<number, string>()
	// Tracks the ThinkingContent block inserted for a given content index, plus
	// a direct reference to the original TextContent block so we can continue
	// updating it after the splice shifts its position in message.content.
	type IndexEntry = { thinkingBlock: ThinkingContent; textRef: { text: string } }
	const insertedByIndex = new Map<number, IndexEntry>()

	const settingsManager = SettingsManager.create()

	pi.on("session_start", async () => {
		await settingsManager.reload()
	})

	pi.on("message_start", (event) => {
		if (event.message.role === "assistant") {
			rawByIndex.clear()
			insertedByIndex.clear()
		}
	})

	pi.on("message_update", (event) => {
		const ame = event.assistantMessageEvent
		if (ame.type !== "text_delta") return

		const idx = ame.contentIndex
		const raw = (rawByIndex.get(idx) ?? "") + ame.delta
		rawByIndex.set(idx, raw)

		const message = event.message as AssistantMessage

		if (settingsManager.getHideThinkingBlock()) {
			const content = message.content[idx]
			if (!content || content.type !== "text") return
			content.text = filterOutputTags(raw)
		} else {
			// Split inline <think>...</think> blocks from the visible text so the
			// framework renders them as proper ThinkingContent blocks (italic,
			// collapsible) rather than as plain inline text.
			const { visible, thinking } = splitOutputTags(raw)

			const existing = insertedByIndex.get(idx)
			if (existing) {
				// We already spliced a ThinkingContent block before the text block;
				// use the saved references — don't look up by index which has shifted.
				existing.thinkingBlock.thinking = thinking
				existing.textRef.text = visible
			} else {
				const content = message.content[idx]
				if (!content || content.type !== "text") return
				content.text = visible

				if (thinking) {
					// Insert a ThinkingContent block immediately before the text block
					// and save references to both so future deltas can update them
					// without relying on the now-shifted content index.
					const thinkingBlock: ThinkingContent = { type: "thinking", thinking }
					message.content.splice(idx, 0, thinkingBlock)
					insertedByIndex.set(idx, { thinkingBlock, textRef: content })
				}
			}
		}
	})

	pi.on("message_end", (event) => {
		// Restore the raw accumulated text (with <think>...</think> tags intact) into
		// the text content blocks before the message is persisted to history.
		// This ensures models like MiniMax that require interleaved thinking tokens
		// to be passed back in their original <think>...</think> format receive them
		// correctly on subsequent turns.
		// The ThinkingContent blocks we inserted are removed since the raw text
		// already carries the thinking inline; leaving them would cause double-sending.
		if (event.message.role !== "assistant") return
		if (insertedByIndex.size === 0) return

		const message = event.message as AssistantMessage

		for (const [, { thinkingBlock }] of insertedByIndex) {
			const thinkIdx = message.content.indexOf(thinkingBlock)
			if (thinkIdx !== -1) {
				message.content.splice(thinkIdx, 1)
			}
		}

		// Restore raw text (with tags) to each text block
		for (const [idx, raw] of rawByIndex) {
			const entry = insertedByIndex.get(idx)
			if (entry) {
				entry.textRef.text = raw
			}
		}

		// Re-apply display filtering after the framework has had a chance to
		// persist the raw text to history. queueMicrotask runs after the current
		// synchronous call stack (where history persistence happens) but before
		// the next I/O callback, which is before the TUI renders.
		const snapshot = new Map(rawByIndex)
		queueMicrotask(() => {
			for (const [idx, raw] of snapshot) {
				const entry = insertedByIndex.get(idx)
				if (!entry) continue
				const { visible } = splitOutputTags(raw)
				if (visible.trim()) entry.textRef.text = visible
			}
		})
	})
}
