// Copy non-TypeScript resources that tsc doesn't handle.
//
// --dev   (used by `build`):        theme files from node_modules → src/modes/interactive/theme/
//                                   so `bun run src/cli.ts` resolves themes via pi-mono's getThemesDir()
//
// default (used by `build-binary`): theme files from node_modules → dist/share/kimchi/theme/
//                                   plus package.json → dist/share/kimchi/
//                                   so the compiled binary resolves assets from the shared data directory

import { cpSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

const themeFiles = ["dark.json", "light.json", "theme-schema.json"]
const themeSrc = join(
	projectRoot,
	"node_modules",
	"@mariozechner",
	"pi-coding-agent",
	"dist",
	"modes",
	"interactive",
	"theme",
)

const isDev = process.argv.includes("--dev")
const themeDest = isDev
	? join(projectRoot, "src", "modes", "interactive", "theme")
	: join(projectRoot, "dist", "share", "kimchi", "theme")

mkdirSync(themeDest, { recursive: true })
for (const file of themeFiles) {
	cpSync(join(themeSrc, file), join(themeDest, file))
}

if (!isDev) {
	cpSync(join(projectRoot, "package.json"), join(projectRoot, "dist", "share", "kimchi", "package.json"))
}
