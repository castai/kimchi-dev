import { describe, expect, it } from "vitest"
import { filterOutputTags, stripOutputTagWrappers } from "./output-tag-filter.js"

describe("stripOutputTagWrappers", () => {
	const cases: Record<string, { input: string; expected: string }> = {
		"strips tags from complete think block": {
			input: "<think>some reasoning</think>answer",
			expected: "some reasoninganswer",
		},
		"strips tags from multiline think block": {
			input: "<think>\nline one\nline two\n</think>answer",
			expected: "\nline one\nline two\nanswer",
		},
		"strips tags from multiple think blocks": {
			input: "<think>first</think>middle<think>second</think>end",
			expected: "firstmiddlesecondend",
		},
		"strips incomplete opening tag": {
			input: "prefix<think>incomplete reasoning",
			expected: "prefixincomplete reasoning",
		},
		"strips opening tag and closing tag separately": {
			input: "<think>done</think>visible<think>incomplete",
			expected: "donevisibleincomplete",
		},
		"leaves text without think tags unchanged": {
			input: "plain text without tags",
			expected: "plain text without tags",
		},
		"leaves empty string unchanged": {
			input: "",
			expected: "",
		},
		"leaves unrelated tags unchanged": {
			input: "<b>bold</b> and <i>italic</i>",
			expected: "<b>bold</b> and <i>italic</i>",
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(stripOutputTagWrappers(input)).toBe(expected)
		})
	}
})

describe("filterOutputTags", () => {
	const cases: Record<string, { input: string; expected: string }> = {
		"removes complete think block": {
			input: "<think>some reasoning</think>answer",
			expected: "answer",
		},
		"removes multiline think block": {
			input: "<think>\nline one\nline two\n</think>answer",
			expected: "answer",
		},
		"removes multiple think blocks": {
			input: "<think>first</think>middle<think>second</think>end",
			expected: "middleend",
		},
		"removes incomplete think block at end": {
			input: "prefix<think>incomplete reasoning",
			expected: "prefix",
		},
		"removes incomplete think block with preceding complete block": {
			input: "<think>done</think>visible<think>incomplete",
			expected: "visible",
		},
		"leaves text without think tags unchanged": {
			input: "plain text without tags",
			expected: "plain text without tags",
		},
		"leaves empty string unchanged": {
			input: "",
			expected: "",
		},
		"leaves unrelated tags unchanged": {
			input: "<b>bold</b> and <i>italic</i>",
			expected: "<b>bold</b> and <i>italic</i>",
		},
		"handles think block at start with content after": {
			input: "<think>reasoning</think> actual output",
			expected: " actual output",
		},
		"handles text before and after think block": {
			input: "before <think>hidden</think> after",
			expected: "before  after",
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(filterOutputTags(input)).toBe(expected)
		})
	}
})
