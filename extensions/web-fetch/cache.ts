/**
 * Session-scoped in-memory cache for web_fetch results.
 *
 * Keyed by URL + format composite key. Entries expire after a configurable TTL
 * (default 15 minutes). The cache is cleared on session shutdown.
 */

/** Default TTL in milliseconds (15 minutes). */
const DEFAULT_TTL_MS = 15 * 60 * 1000;

export interface CacheEntry {
	/** The fully rendered tool output (metadata header + content body). */
	output: string;
	/** Timestamp when the entry was stored (Date.now()). */
	storedAt: number;
}

/** Build a composite cache key from URL and format. */
export function cacheKey(url: string, format: string): string {
	return `${url}::${format}`;
}

const store = new Map<string, CacheEntry>();

let ttlMs = DEFAULT_TTL_MS;

/**
 * Look up a cached result. Returns the output string on hit, or `undefined`
 * on miss or expiry. Expired entries are evicted on access.
 */
export function cacheGet(url: string, format: string): string | undefined {
	const key = cacheKey(url, format);
	const entry = store.get(key);
	if (!entry) return undefined;

	if (Date.now() - entry.storedAt > ttlMs) {
		store.delete(key);
		return undefined;
	}

	return entry.output;
}

/** Store a result in the cache. */
export function cacheSet(url: string, format: string, output: string): void {
	const key = cacheKey(url, format);
	store.set(key, { output, storedAt: Date.now() });
}

/** Clear all cached entries. Called on session shutdown. */
export function cacheClear(): void {
	store.clear();
}

/** Number of entries currently in the cache (for testing). */
export function cacheSize(): number {
	return store.size;
}

/**
 * Override the TTL for testing. Pass `undefined` to reset to default.
 * @internal
 */
export function _setTTL(ms: number | undefined): void {
	ttlMs = ms ?? DEFAULT_TTL_MS;
}
