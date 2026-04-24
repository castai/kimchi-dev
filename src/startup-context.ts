/**
 * Startup context shared between cli.ts and extensions.
 *
 * cli.ts runs before pi-mono's main() and before any extension factory is
 * invoked. It writes discovered model metadata here after fetching from the
 * API, so extensions can read a fully populated context when they initialise.
 *
 * Module-level state is safe here because Node/Bun evaluates each module
 * exactly once per process. By the time any extension factory runs, cli.ts
 * has already set these values.
 */

import type { ModelMetadata } from "./models.js"

let _availableModels: readonly ModelMetadata[] = []

export function setAvailableModels(models: readonly ModelMetadata[]): void {
	_availableModels = models
}

export function getAvailableModels(): readonly ModelMetadata[] {
	return _availableModels
}
