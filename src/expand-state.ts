const toolCallOrder: string[] = []
const expandedToolIds = new Set<string>()

export function registerToolCall(id: string) {
	if (!toolCallOrder.includes(id)) {
		toolCallOrder.push(id)
	}
}

export function isToolExpanded(id: string): boolean {
	return expandedToolIds.has(id)
}

export function expandNext(): boolean {
	for (let i = toolCallOrder.length - 1; i >= 0; i--) {
		if (!expandedToolIds.has(toolCallOrder[i])) {
			expandedToolIds.add(toolCallOrder[i])
			return true
		}
	}
	return false
}

export function collapseAll() {
	expandedToolIds.clear()
}

export function resetState() {
	toolCallOrder.length = 0
	expandedToolIds.clear()
}
