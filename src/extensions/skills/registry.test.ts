import type { Skill as DiskSkill } from "@mariozechner/pi-coding-agent"
import { describe, expect, it } from "vitest"
import { formatSkillsForPrompt } from "./format.js"
import { SkillRegistry } from "./registry.js"

const EXPECTED_BUILTINS = ["bound-tool-output", "gh-cli", "git-hygiene", "glab-cli", "python-edit"] as const

function diskSkill(overrides: Partial<DiskSkill> & { name: string; description: string }): DiskSkill {
	return {
		filePath: `/skills/${overrides.name}/SKILL.md`,
		baseDir: `/skills/${overrides.name}`,
		sourceInfo: { path: `/skills/${overrides.name}/SKILL.md`, source: "local", scope: "project", origin: "top-level" },
		disableModelInvocation: false,
		...overrides,
	}
}

describe("SkillRegistry initial state", () => {
	it("seeds all built-ins from frontmatter", () => {
		const registry = new SkillRegistry()
		for (const name of EXPECTED_BUILTINS) {
			const skill = registry.get(name)
			if (skill?.origin !== "builtin") throw new Error(`expected builtin for ${name}`)
			expect(skill.content).toBeTypeOf("string")
			expect(skill.content.length).toBeGreaterThan(0)
			expect(skill.description).toBeTypeOf("string")
			expect(skill.description.length).toBeGreaterThan(0)
		}
	})
})

describe("SkillRegistry.setDisk", () => {
	it("disk skill with same name overrides built-in", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "gh-cli", description: "user override" })])

		const after = registry.get("gh-cli")
		if (after?.origin !== "disk") throw new Error("expected disk override")
		expect(after.description).toBe("user override")
		expect(after.filePath).toBe("/skills/gh-cli/SKILL.md")
	})

	it("adds new disk skills alongside built-ins", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "deploy", description: "Deploy the app" })])
		expect(registry.get("deploy")?.description).toBe("Deploy the app")
		for (const name of EXPECTED_BUILTINS) {
			expect(registry.get(name)).toBeDefined()
		}
	})

	it("skips skills with disableModelInvocation", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "hidden", description: "hidden skill", disableModelInvocation: true })])
		expect(registry.get("hidden")).toBeUndefined()
	})

	it("removes a previously-added disk skill on subsequent setDisk", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "stale", description: "old skill" })])
		expect(registry.get("stale")).toBeDefined()
		registry.setDisk([])
		expect(registry.get("stale")).toBeUndefined()
	})

	it("restores a built-in when a prior disk override is dropped", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "gh-cli", description: "user override" })])
		expect(registry.get("gh-cli")?.origin).toBe("disk")
		registry.setDisk([])
		const restored = registry.get("gh-cli")
		if (restored?.origin !== "builtin") throw new Error("expected builtin restore")
		expect(restored.content).toBeTypeOf("string")
	})
})

describe("SkillRegistry.readBody", () => {
	it("returns embedded content for a built-in", () => {
		const registry = new SkillRegistry()
		expect(registry.readBody("gh-cli")).toContain("# gh CLI")
	})

	it("throws for an unknown skill", () => {
		const registry = new SkillRegistry()
		expect(() => registry.readBody("does-not-exist")).toThrow(/does-not-exist/)
	})
})

describe("formatSkillsForPrompt", () => {
	it("advertises all built-ins inside a single <available_skills> block", () => {
		const registry = new SkillRegistry()
		const block = formatSkillsForPrompt(registry)
		expect(block).toContain("<available_skills>")
		expect(block).toContain("</available_skills>")
		expect(block).toMatch(/MUST call the `read_skill` tool/)
		expect(block).toContain("BEFORE editing, writing, or running")
		for (const name of EXPECTED_BUILTINS) {
			expect(block).toContain(`<name>${name}</name>`)
		}
		expect(block).not.toContain("<location>")
	})

	it("reflects user override in the block (single entry per name)", () => {
		const registry = new SkillRegistry()
		registry.setDisk([diskSkill({ name: "gh-cli", description: "user override" })])
		const block = formatSkillsForPrompt(registry)
		const occurrences = block.split("<name>gh-cli</name>").length - 1
		expect(occurrences).toBe(1)
		expect(block).toContain("user override")
	})

	it("xml-escapes special characters in name and description", () => {
		const registry = new SkillRegistry()
		registry.setDisk([
			diskSkill({
				name: "weird<name>",
				description: `a & b "c" 'd' <e>`,
			}),
		])
		const block = formatSkillsForPrompt(registry)
		expect(block).toContain("<name>weird&lt;name&gt;</name>")
		expect(block).toContain("a &amp; b &quot;c&quot; &apos;d&apos; &lt;e&gt;")
	})
})
