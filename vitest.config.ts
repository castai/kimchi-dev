import { existsSync, readFileSync } from "node:fs"
import { isAbsolute } from "node:path"
import { defineConfig } from "vitest/config"

// Tests-only shim. Bun's production bundle handles `import "./x.md" with { type: "text" }`
// natively; vitest/Vite does not. This plugin loads the markdown body as a string export
// for filesystem `.md` paths so the same import syntax resolves identically in tests.
export default defineConfig({
	plugins: [
		{
			name: "kimchi-md-as-text",
			enforce: "pre",
			load(id) {
				if (id.startsWith("\0")) return null
				const path = id.split("?", 1)[0]
				if (!path.endsWith(".md")) return null
				if (!isAbsolute(path) || !existsSync(path)) return null
				const content = readFileSync(path, "utf8")
				return `export default ${JSON.stringify(content)}`
			},
		},
	],
})
