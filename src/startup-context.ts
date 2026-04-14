/**
 * Startup context shared between cli.ts and extensions.
 *
 * cli.ts runs before pi-mono's main() and before any extension factory is
 * invoked. It writes discovered model IDs here after fetching from the API,
 * so extensions can read a fully populated context when they initialise.
 *
 * Module-level state is safe here because Node/Bun evaluates each module
 * exactly once per process. By the time any extension factory runs, cli.ts
 * has already set these values.
 */

let _availableModelIds: readonly string[] = []

export function setAvailableModelIds(ids: readonly string[]): void {
	_availableModelIds = ids
}

export function getAvailableModelIds(): readonly string[] {
	return _availableModelIds
}
