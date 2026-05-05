import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { copySupportingFiles } from "./install.js"

describe("copySupportingFiles", () => {
	let srcDir: string
	let dstDir: string

	beforeEach(() => {
		srcDir = mkdtempSync(join(tmpdir(), "kimchi-install-src-"))
		dstDir = mkdtempSync(join(tmpdir(), "kimchi-install-dst-"))
	})

	afterEach(() => {
		rmSync(srcDir, { recursive: true, force: true })
		rmSync(dstDir, { recursive: true, force: true })
	})

	// Regression: copyFileSync's third argument is COPYFILE_* flags (range 0–7),
	// not file mode. Passing stat.mode (e.g. 33188) used to throw
	// "mode is out of range: >= 0 && <= 7" on the very first regular file.
	it("copies a top-level file without throwing on file mode", () => {
		writeFileSync(join(srcDir, "config.json"), '{"hello":"world"}')

		expect(() => copySupportingFiles(srcDir, dstDir)).not.toThrow()
		expect(readFileSync(join(dstDir, "config.json"), "utf-8")).toBe('{"hello":"world"}')
	})

	it("recursively copies nested files", () => {
		mkdirSync(join(srcDir, "nested", "deeper"), { recursive: true })
		writeFileSync(join(srcDir, "nested", "a.txt"), "alpha")
		writeFileSync(join(srcDir, "nested", "deeper", "b.txt"), "beta")

		copySupportingFiles(srcDir, dstDir)

		expect(readFileSync(join(dstDir, "nested", "a.txt"), "utf-8")).toBe("alpha")
		expect(readFileSync(join(dstDir, "nested", "deeper", "b.txt"), "utf-8")).toBe("beta")
	})

	it("skips entries matching skipName", () => {
		writeFileSync(join(srcDir, "kimchi"), "binary")
		writeFileSync(join(srcDir, "keepme.txt"), "ok")

		copySupportingFiles(srcDir, dstDir, "kimchi")

		expect(readFileSync(join(dstDir, "keepme.txt"), "utf-8")).toBe("ok")
		expect(() => readFileSync(join(dstDir, "kimchi"))).toThrow()
	})
})
