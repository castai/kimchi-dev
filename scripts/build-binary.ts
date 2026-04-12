// Build the CLI into a standalone Bun binary under dist/.
// Steps: clean → typecheck → compile → fix macOS codesign → copy binary resources.

import { execSync } from "node:child_process"
import { platform } from "node:os"

function run(label: string, cmd: string): void {
	console.log(`\n→ ${label}`)
	try {
		execSync(cmd, { stdio: "inherit" })
	} catch (error) {
		throw new Error(`Build step "${label}" failed: ${cmd}`, { cause: error })
	}
}

run("clean", "bun run clean")
run("typecheck", "bun run typecheck")

// Externalize packages that cannot be bundled into a Bun compiled binary (native addons, browser automation harnesses).
// If a new dependency causes a build failure, check whether it also needs --external here.
run("compile", "bun build src/cli.ts --compile --outfile dist/kimchi-code --external chromium-bidi --external electron")

// Bun --compile produces binaries with an invalid code signature on macOS.
// The kernel kills badly-signed arm64 binaries immediately (SIGKILL, exit 137).
// Strip the corrupt signature and re-sign ad-hoc. See: https://github.com/oven-sh/bun/issues/7208
if (platform() === "darwin") {
	run("codesign (strip)", "codesign --remove-signature dist/kimchi-code")
	run("codesign (ad-hoc)", "codesign -s - dist/kimchi-code")
}

run("copy resources", "bun run scripts/copy-resources.ts")
