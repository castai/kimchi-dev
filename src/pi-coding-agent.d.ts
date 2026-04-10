/**
 * Type augmentation for the pnpm-patched main() in @mariozechner/pi-coding-agent.
 *
 * The patch adds an optional second parameter that accepts inline extension
 * factories, so they are bundled into the compiled binary instead of being
 * discovered from disk at runtime.
 *
 * Remove this file when pi-mono accepts the extensionFactories option upstream.
 */
import type { ExtensionFactory } from "@mariozechner/pi-coding-agent"

declare module "@mariozechner/pi-coding-agent" {
	export function main(args: string[], options?: { extensionFactories?: ExtensionFactory[] }): Promise<void>
}
