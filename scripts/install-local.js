// Install the compiled binary and share directory to ~/.local/.
// Run after `pnpm run build:binary`.
//
// Usage: node scripts/install-local.js

import { cpSync, existsSync, mkdirSync, symlinkSync, unlinkSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const distBin = join(projectRoot, "dist", "bin", "kimchi-code")
const distShare = join(projectRoot, "dist", "share", "kimchi")

if (!existsSync(distBin)) {
	console.error("dist/bin/kimchi-code not found — run `pnpm run build:binary` first.")
	process.exit(1)
}
if (!existsSync(distShare)) {
	console.error("dist/share/kimchi/ not found — run `pnpm run build:binary` first.")
	process.exit(1)
}

const prefix = join(homedir(), ".local")
const binDest = join(prefix, "bin")
const shareDest = join(prefix, "share", "kimchi")

mkdirSync(binDest, { recursive: true })
cpSync(distBin, join(binDest, "kimchi-code"))
// Create symlink for kimchi
const kimchiPath = join(binDest, "kimchi")
if (existsSync(kimchiPath)) {
	unlinkSync(kimchiPath)
}
// Create symlink with relative target (same directory)
symlinkSync("kimchi-code", kimchiPath)

cpSync(distShare, shareDest, { recursive: true })

console.log(`Installed binary  → ${join(binDest, "kimchi-code")}`)
console.log(`Installed symlink → ${join(binDest, "kimchi")}`)
console.log(`Installed share   → ${shareDest}`)
