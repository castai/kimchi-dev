import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./page-fetcher.js", () => ({
	FetchError: class FetchError extends Error {
		constructor(message: string, public readonly category: string) {
			super(message);
			this.name = "FetchError";
		}
	},
	fetchPage: vi.fn(),
}));

vi.mock("./browser-pool.js", () => ({
	getBrowser: vi.fn().mockResolvedValue(null),
}));

vi.mock("./url-validator.js", () => ({
	validateURL: vi.fn(() => ({ valid: true, url: new URL("https://example.com/") })),
}));

vi.mock("./content-converter.js", () => ({
	convertContent: vi.fn((html: string) => html),
}));

import { executeWebFetch } from "./execute-handler.js";
import { fetchPage } from "./page-fetcher.js";
import { convertContent } from "./content-converter.js";

const fetchPageMock = fetchPage as unknown as MockInstance;
const convertContentMock = convertContent as unknown as MockInstance;

afterEach(() => {
	vi.restoreAllMocks();
});

function mockFetchResult(body: string, overrides?: Partial<{ finalURL: string; contentType: string; statusCode: number; isHTML: boolean }>) {
	return {
		body,
		finalURL: overrides?.finalURL ?? "https://example.com/",
		contentType: overrides?.contentType ?? "text/html; charset=utf-8",
		statusCode: overrides?.statusCode ?? 200,
		isHTML: overrides?.isHTML ?? true,
	};
}

describe("executeWebFetch", () => {
	describe("timeout parameter", () => {
		it("passes timeout to fetchPage when provided", async () => {
			fetchPageMock.mockResolvedValue(mockFetchResult("<p>Hello</p>"));

			await executeWebFetch({ url: "https://example.com/", timeout: 60 });

			expect(fetchPageMock).toHaveBeenCalledWith("https://example.com/", { timeoutSeconds: 60, format: "markdown" });
		});

		it("clamps timeout values above 120 to 120", async () => {
			fetchPageMock.mockResolvedValue(mockFetchResult("<p>Hello</p>"));

			await executeWebFetch({ url: "https://example.com/", timeout: 300 });

			expect(fetchPageMock).toHaveBeenCalledWith("https://example.com/", { timeoutSeconds: 120, format: "markdown" });
		});

		it("clamps timeout of exactly 121 to 120", async () => {
			fetchPageMock.mockResolvedValue(mockFetchResult("<p>Hello</p>"));

			await executeWebFetch({ url: "https://example.com/", timeout: 121 });

			expect(fetchPageMock).toHaveBeenCalledWith("https://example.com/", { timeoutSeconds: 120, format: "markdown" });
		});

		it("passes through timeout values at or below 120", async () => {
			fetchPageMock.mockResolvedValue(mockFetchResult("<p>Hello</p>"));

			await executeWebFetch({ url: "https://example.com/", timeout: 120 });

			expect(fetchPageMock).toHaveBeenCalledWith("https://example.com/", { timeoutSeconds: 120, format: "markdown" });
		});

		it("does not pass timeoutSeconds when timeout is not provided", async () => {
			fetchPageMock.mockResolvedValue(mockFetchResult("<p>Hello</p>"));

			await executeWebFetch({ url: "https://example.com/" });

			expect(fetchPageMock).toHaveBeenCalledWith("https://example.com/", { timeoutSeconds: undefined, format: "markdown" });
		});

		it("returns timeout error message from fetchPage", async () => {
			const { FetchError } = await import("./page-fetcher.js");
			fetchPageMock.mockRejectedValue(new FetchError('Timeout: request to "https://slow.example.com/" timed out after 10 seconds', "timeout"));

			const result = await executeWebFetch({ url: "https://slow.example.com/", timeout: 10 });

			expect(result.content[0].text).toContain("timed out");
			expect(result.content[0].text).toContain("10 seconds");
		});
	});

	describe("output truncation", () => {
		it("does not truncate content under 100K characters", async () => {
			const body = "x".repeat(1000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).toContain(`Characters: ${(1000).toLocaleString()}`);
			expect(text).not.toContain("Truncated:");
			expect(text).not.toContain("[Content truncated");
		});

		it("truncates content exceeding 100K characters", async () => {
			const body = "a".repeat(150_000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).toContain("Characters: 150,000");
			expect(text).toContain("Truncated: content truncated to 100,000 of 150,000 characters");
			expect(text).toContain("[Content truncated: showing 100,000 of 150,000 characters]");
		});

		it("truncates content at exactly 100,001 characters", async () => {
			const body = "b".repeat(100_001);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).toContain("Truncated:");
			expect(text).toContain("[Content truncated");
		});

		it("does not truncate content at exactly 100,000 characters", async () => {
			const body = "c".repeat(100_000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).toContain("Characters: 100,000");
			expect(text).not.toContain("Truncated:");
			expect(text).not.toContain("[Content truncated");
		});

		it("truncated output contains exactly 100K characters of content", async () => {
			const body = "d".repeat(200_000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			const metadataEnd = text.indexOf("\n\n") + 2;
			const truncNoticeStart = text.indexOf("\n\n[Content truncated");
			const contentSection = text.slice(metadataEnd, truncNoticeStart);

			expect(contentSection.length).toBe(100_000);
			expect(contentSection).toBe("d".repeat(100_000));
		});

		it("truncates non-HTML content too", async () => {
			const body = "e".repeat(150_000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body, { isHTML: false, contentType: "application/json" }));

			const result = await executeWebFetch({ url: "https://example.com/data.json" });
			const text = result.content[0].text;

			expect(text).toContain("Truncated:");
			expect(text).toContain("[Content truncated");
			expect(convertContentMock).not.toHaveBeenCalled();
		});
	});

	describe("metadata header", () => {
		it("includes character count for normal responses", async () => {
			const body = "Hello world";
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });

			expect(result.content[0].text).toContain("Characters: 11");
		});

		it("reports total character count even when truncated", async () => {
			const body = "f".repeat(250_000);
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue(body);

			const result = await executeWebFetch({ url: "https://example.com/" });

			expect(result.content[0].text).toContain("Characters: 250,000");
		});

		it("includes fallback warning in metadata when present", async () => {
			const body = "<p>Content</p>";
			fetchPageMock.mockResolvedValue({
				...mockFetchResult(body),
				fallbackWarning: "Warning: Playwright is not installed.",
			});
			convertContentMock.mockReturnValue("Content");

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).toContain("Warning: Playwright is not installed.");
		});

		it("does not include fallback warning when Playwright was used", async () => {
			const body = "<p>Content</p>";
			fetchPageMock.mockResolvedValue(mockFetchResult(body));
			convertContentMock.mockReturnValue("Content");

			const result = await executeWebFetch({ url: "https://example.com/" });
			const text = result.content[0].text;

			expect(text).not.toContain("Warning:");
		});
	});

	describe("Playwright text extraction", () => {
		it("skips content converter when Playwright extracted text directly", async () => {
			// Playwright path: isHTML true, format text, no fallbackWarning
			fetchPageMock.mockResolvedValue({
				...mockFetchResult("Plain text from Playwright"),
				fallbackWarning: undefined,
			});

			const result = await executeWebFetch({ url: "https://example.com/", format: "text" });

			// convertContent should not be called because Playwright extracted text
			expect(convertContentMock).not.toHaveBeenCalled();
			expect(result.content[0].text).toContain("Plain text from Playwright");
		});

		it("uses content converter for text format when falling back to native fetch", async () => {
			fetchPageMock.mockResolvedValue({
				...mockFetchResult("<p>Content</p>"),
				fallbackWarning: "Warning: Playwright is not installed.",
			});
			convertContentMock.mockReturnValue("Converted text");

			const result = await executeWebFetch({ url: "https://example.com/", format: "text" });

			expect(convertContentMock).toHaveBeenCalledWith("<p>Content</p>", "https://example.com/", "text");
			expect(result.content[0].text).toContain("Converted text");
		});
	});
});
