// Copy non-TypeScript assets into dist/ that tsc doesn't handle.

import { cpSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, "..")

// Prompt templates — .md files read at runtime by prompt-transformer.ts
cpSync(
	join(projectRoot, "src", "orchestration", "prompt-transformer", "prompts"),
	join(projectRoot, "dist", "orchestration", "prompt-transformer", "prompts"),
	{ recursive: true },
)
