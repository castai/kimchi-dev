import { readFileSync } from "node:fs"
import { type Plugin, defineConfig } from "vitest/config"

/** Vite plugin that imports .md files as raw text strings, matching Bun's bundler behavior. */
function markdownRawPlugin(): Plugin {
	return {
		name: "markdown-raw",
		transform(_code, id) {
			if (id.endsWith(".md")) {
				const content = readFileSync(id, "utf-8")
				return { code: `export default ${JSON.stringify(content)};`, map: null }
			}
		},
	}
}

export default defineConfig({
	plugins: [markdownRawPlugin()],
})
