import { describe, expect, it } from "vitest"
import { filterOutputTags, splitOutputTags, stripOutputTagWrappers } from "./output-tag-filter.js"

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
		"removes incomplete think block at start": {
			input: "<think>incomplete reasoning",
			expected: "",
		},
		"removes incomplete think block when at start after complete block": {
			input: "<think>done</think><think>incomplete",
			expected: "",
		},
		"does not truncate when incomplete think block follows visible text": {
			input: "prefix<think>incomplete reasoning",
			expected: "prefix<think>incomplete reasoning",
		},
		"does not truncate literal think tag mention": {
			input: "look for <think> tags in the output",
			expected: "look for <think> tags in the output",
		},
		"does not truncate visible text when second incomplete think block follows": {
			input: "<think>done</think>visible<think>incomplete",
			expected: "visible<think>incomplete",
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

describe("splitOutputTags", () => {
	const cases: Record<string, { input: string; expected: { visible: string; thinking: string } }> = {
		"splits complete think block from answer": {
			input: "<think>some reasoning</think>answer",
			expected: { visible: "answer", thinking: "some reasoning" },
		},
		"splits multiline think block": {
			input: "<think>\nline one\nline two\n</think>answer",
			expected: { visible: "answer", thinking: "\nline one\nline two\n" },
		},
		"splits multiple think blocks": {
			input: "<think>first</think>middle<think>second</think>end",
			expected: { visible: "middleend", thinking: "firstsecond" },
		},
		"holds incomplete think block at start (streaming hold)": {
			input: "<think>incomplete reasoning",
			expected: { visible: "", thinking: "" },
		},
		"holds incomplete think block after complete block at start": {
			input: "<think>done</think><think>incomplete",
			expected: { visible: "", thinking: "done" },
		},
		"keeps incomplete think block in visible when it follows visible text": {
			input: "prefix<think>incomplete reasoning",
			expected: { visible: "prefix<think>incomplete reasoning", thinking: "" },
		},
		"keeps visible text when second incomplete think block follows": {
			input: "<think>done</think>visible<think>incomplete",
			expected: { visible: "visible<think>incomplete", thinking: "done" },
		},
		"passes through text without think tags": {
			input: "plain text without tags",
			expected: { visible: "plain text without tags", thinking: "" },
		},
		"returns empty for empty string": {
			input: "",
			expected: { visible: "", thinking: "" },
		},
		"leaves unrelated tags in visible": {
			input: "<b>bold</b> and <i>italic</i>",
			expected: { visible: "<b>bold</b> and <i>italic</i>", thinking: "" },
		},
		"splits think block at start with content after": {
			input: "<think>reasoning</think> actual output",
			expected: { visible: " actual output", thinking: "reasoning" },
		},
		"splits text before and after think block": {
			input: "before <think>hidden</think> after",
			expected: { visible: "before  after", thinking: "hidden" },
		},
	}

	for (const [name, { input, expected }] of Object.entries(cases)) {
		it(name, () => {
			expect(splitOutputTags(input)).toEqual(expected)
		})
	}
})
