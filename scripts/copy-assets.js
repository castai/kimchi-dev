// Copy non-TypeScript assets into dist/ that tsc doesn't handle.

import { cpSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")

// orchestration-prompt.md — read at runtime by prompt-transformer.ts
cpSync(
	join(projectRoot, "src", "orchestration", "prompt-transformer", "orchestration-prompt.md"),
	join(projectRoot, "dist", "orchestration", "prompt-transformer", "orchestration-prompt.md"),
)
