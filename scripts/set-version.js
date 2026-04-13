// Patch the version field in package.json from a git tag ref.
//
// Usage:  node scripts/set-version.js <git-ref>
// Example: node scripts/set-version.js v0.2.0
//
// Strips the leading "v" and validates basic semver before writing.

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const packageJsonPath = join(__dirname, "..", "package.json")

const ref = process.argv[2]
if (!ref) {
	console.error("Usage: node scripts/set-version.js <git-ref>")
	process.exit(1)
}

const version = ref.replace(/^v/, "")
if (!/^\d+\.\d+\.\d+/.test(version)) {
	console.error(`Invalid semver version: "${version}" (from ref "${ref}")`)
	process.exit(1)
}

const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"))
pkg.version = version
writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)

console.log(`Set version to ${version}`)
