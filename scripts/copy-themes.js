// Copy pi-mono's built-in theme files into our source tree so that
// getThemesDir() can find them when PI_PACKAGE_DIR points to the project root.
// pi-mono resolves themes at: <packageDir>/src/modes/interactive/theme/
// (it picks "src" over "dist" because our project root has a src/ directory).

import { cpSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")

const src = join(projectRoot, "node_modules", "@mariozechner", "pi-coding-agent", "dist", "modes", "interactive", "theme")
const dest = join(projectRoot, "src", "modes", "interactive", "theme")

mkdirSync(dest, { recursive: true })

for (const file of ["dark.json", "light.json", "theme-schema.json"]) {
	cpSync(join(src, file), join(dest, file))
}
