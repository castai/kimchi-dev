import { afterEach, describe, expect, it, vi } from "vitest";
import { _setTTL, cacheClear, cacheGet, cacheKey, cacheSet, cacheSize } from "./cache.js";

afterEach(() => {
	cacheClear();
	_setTTL(undefined); // reset to default
	vi.restoreAllMocks();
});

describe("cacheKey", () => {
	it("combines URL and format with :: separator", () => {
		expect(cacheKey("https://example.com/", "markdown")).toBe("https://example.com/::markdown");
	});

	it("produces different keys for different formats", () => {
		const md = cacheKey("https://example.com/", "markdown");
		const txt = cacheKey("https://example.com/", "text");
		const html = cacheKey("https://example.com/", "html");
		expect(md).not.toBe(txt);
		expect(md).not.toBe(html);
		expect(txt).not.toBe(html);
	});

	it("produces different keys for different URLs", () => {
		const a = cacheKey("https://a.com/", "markdown");
		const b = cacheKey("https://b.com/", "markdown");
		expect(a).not.toBe(b);
	});
});

describe("cacheGet / cacheSet", () => {
	it("returns undefined on cache miss", () => {
		expect(cacheGet("https://example.com/", "markdown")).toBeUndefined();
	});

	it("returns stored value on cache hit", () => {
		cacheSet("https://example.com/", "markdown", "cached output");
		expect(cacheGet("https://example.com/", "markdown")).toBe("cached output");
	});

	it("returns undefined for same URL but different format", () => {
		cacheSet("https://example.com/", "markdown", "md output");
		expect(cacheGet("https://example.com/", "text")).toBeUndefined();
	});

	it("overwrites existing entry for same key", () => {
		cacheSet("https://example.com/", "markdown", "first");
		cacheSet("https://example.com/", "markdown", "second");
		expect(cacheGet("https://example.com/", "markdown")).toBe("second");
	});

	it("stores entries for multiple URLs independently", () => {
		cacheSet("https://a.com/", "markdown", "output A");
		cacheSet("https://b.com/", "markdown", "output B");
		expect(cacheGet("https://a.com/", "markdown")).toBe("output A");
		expect(cacheGet("https://b.com/", "markdown")).toBe("output B");
	});
});

describe("TTL expiry", () => {
	it("returns undefined after TTL has elapsed", () => {
		_setTTL(100); // 100ms TTL
		cacheSet("https://example.com/", "markdown", "cached");

		// Advance time past TTL
		vi.useFakeTimers();
		vi.advanceTimersByTime(150);

		expect(cacheGet("https://example.com/", "markdown")).toBeUndefined();
		vi.useRealTimers();
	});

	it("returns value within TTL", () => {
		_setTTL(1000); // 1s TTL
		cacheSet("https://example.com/", "markdown", "cached");

		// Time is still within TTL
		expect(cacheGet("https://example.com/", "markdown")).toBe("cached");
	});

	it("evicts expired entry on access", () => {
		_setTTL(100);
		cacheSet("https://example.com/", "markdown", "cached");
		expect(cacheSize()).toBe(1);

		vi.useFakeTimers();
		vi.advanceTimersByTime(150);

		cacheGet("https://example.com/", "markdown"); // triggers eviction
		expect(cacheSize()).toBe(0);
		vi.useRealTimers();
	});
});

describe("cacheClear", () => {
	it("removes all entries", () => {
		cacheSet("https://a.com/", "markdown", "a");
		cacheSet("https://b.com/", "text", "b");
		cacheSet("https://c.com/", "html", "c");
		expect(cacheSize()).toBe(3);

		cacheClear();
		expect(cacheSize()).toBe(0);
		expect(cacheGet("https://a.com/", "markdown")).toBeUndefined();
		expect(cacheGet("https://b.com/", "text")).toBeUndefined();
		expect(cacheGet("https://c.com/", "html")).toBeUndefined();
	});

	it("is safe to call on empty cache", () => {
		expect(cacheSize()).toBe(0);
		cacheClear(); // should not throw
		expect(cacheSize()).toBe(0);
	});
});

describe("cacheSize", () => {
	it("returns 0 for empty cache", () => {
		expect(cacheSize()).toBe(0);
	});

	it("reflects number of stored entries", () => {
		cacheSet("https://a.com/", "markdown", "a");
		expect(cacheSize()).toBe(1);
		cacheSet("https://b.com/", "text", "b");
		expect(cacheSize()).toBe(2);
	});
});
