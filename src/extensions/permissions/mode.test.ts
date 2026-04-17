import { describe, expect, it } from "vitest"
import { parseModeString, resolveMode } from "./mode.js"

describe("parseModeString", () => {
	it("returns mode for known strings", () => {
		expect(parseModeString("default")).toBe("default")
		expect(parseModeString("plan")).toBe("plan")
		expect(parseModeString("auto")).toBe("auto")
	})

	it("is case-insensitive", () => {
		expect(parseModeString("AUTO")).toBe("auto")
		expect(parseModeString("Plan")).toBe("plan")
	})

	it("returns undefined for unknown/empty", () => {
		expect(parseModeString("yolo")).toBeUndefined()
		expect(parseModeString(undefined)).toBeUndefined()
		expect(parseModeString("")).toBeUndefined()
	})
})

describe("resolveMode", () => {
	it("runtime wins over everything", () => {
		const r = resolveMode({ runtime: "plan", flag: "auto", env: "default", config: "default" })
		expect(r).toEqual({ mode: "plan", source: "runtime" })
	})

	it("flag beats env and config", () => {
		const r = resolveMode({ runtime: undefined, flag: "auto", env: "plan", config: "default" })
		expect(r).toEqual({ mode: "auto", source: "flag" })
	})

	it("env beats config", () => {
		const r = resolveMode({ runtime: undefined, flag: undefined, env: "plan", config: "default" })
		expect(r).toEqual({ mode: "plan", source: "env" })
	})

	it("config is the floor", () => {
		const r = resolveMode({ runtime: undefined, flag: undefined, env: undefined, config: "auto" })
		expect(r).toEqual({ mode: "auto", source: "config" })
	})

	it("invalid env string is ignored", () => {
		const r = resolveMode({ runtime: undefined, flag: undefined, env: "garbage", config: "default" })
		expect(r.mode).toBe("default")
		expect(r.source).toBe("config")
	})
})
