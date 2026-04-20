#!/usr/bin/env node

// Thin entrypoint that sets environment variables BEFORE any pi-mono code is imported.
// Static ESM imports are hoisted and initialized before the module body runs, so cli.ts
// (which statically imports extensions that transitively pull in pi-mono's config.js)
// cannot set PI_PACKAGE_DIR early enough. This module has zero pi-mono transitive deps,
// guaranteeing the env var is in place before config.js reads it.

import { homedir } from "node:os"
import { resolve } from "node:path"
import { resolveAuxiliaryFilesDir } from "./auxiliary-files/resolver.js"
import { validateAuxiliaryFiles } from "./auxiliary-files/validator.js"

const preSet = !!process.env.PI_PACKAGE_DIR
const auxiliaryDir = resolveAuxiliaryFilesDir(process.env, homedir())
if (!preSet) {
	try {
		validateAuxiliaryFiles(auxiliaryDir)
	} catch (err) {
		console.error((err as Error).message)
		process.exit(1)
	}
}
process.env.PI_PACKAGE_DIR = auxiliaryDir

const agentDir = resolve(homedir(), ".config", "kimchi", "harness")
process.env.KIMCHI_CODING_AGENT_DIR = agentDir

process.title = "kimchi"
process.env.PI_SKIP_VERSION_CHECK = "1"

await import("./cli.js")
