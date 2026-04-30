import "../integrations/opencode.js" // side-effect: register integration
import { byId } from "../integrations/registry.js"
import { runForeground } from "../integrations/spawn.js"
import { popScope, prepareTool } from "./_helpers.js"

/**
 * `kimchi opencode [args]` — write the kimchi provider into the user's
 * opencode.json (override mode), then launch opencode. The Go CLI version
 * uses an inject-style XDG_CONFIG_HOME redirect into a managed config dir;
 * we take the simpler override path for PR2 — the user's opencode.json gets
 * the kimchi provider added, future runs see it without going through us.
 *
 * Accepts an optional `--scope global|project` flag; everything else is
 * forwarded to the opencode binary.
 */
export async function runOpenCode(args: string[]): Promise<number> {
	const scope = popScope(args)
	const prepped = prepareTool("opencode", "override")
	if (!prepped) return 1

	try {
		const tool = byId("opencode")
		if (!tool) {
			console.error("kimchi opencode: integration not registered")
			return 1
		}
		await tool.write(scope, prepped.apiKey)
		return await runForeground("opencode", args)
	} catch (err) {
		console.error(`kimchi opencode: ${(err as Error).message}`)
		return 1
	}
}
