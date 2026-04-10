// Copy non-TypeScript resources that tsc doesn't handle.
//
// 1. Theme files: pi-mono resolves themes at <packageDir>/src/modes/interactive/theme/
//    so we copy them from node_modules into our source tree.
// 2. Prompt templates: .md files read at runtime by prompt-transformer.ts,
//    copied from src/ into dist/.

import { cpSync, mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")

// ── Theme files (node_modules → src/) ────────────────────────────────
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
const themeDest = join(projectRoot, "src", "modes", "interactive", "theme")

mkdirSync(themeDest, { recursive: true })

for (const file of ["dark.json", "light.json", "theme-schema.json"]) {
	cpSync(join(themeSrc, file), join(themeDest, file))
}

// ── Prompt templates (src/ → dist/) ──────────────────────────────────
cpSync(
	join(projectRoot, "src", "orchestration", "prompt-transformer", "prompts"),
	join(projectRoot, "dist", "orchestration", "prompt-transformer", "prompts"),
	{ recursive: true },
)
