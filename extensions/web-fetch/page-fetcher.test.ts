import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FetchError, fetchPage } from "./page-fetcher.js";

describe("fetchPage", () => {
	let fetchSpy: MockInstance;

	beforeEach(() => {
		fetchSpy = vi.spyOn(globalThis, "fetch");
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	function mockResponse(body: string, init?: ResponseInit & { url?: string }) {
		const headers = new Headers(init?.headers);
		if (!headers.has("content-type")) {
			headers.set("content-type", "text/html; charset=utf-8");
		}
		const response = new Response(body, { ...init, headers });
		// Override the url property to simulate redirect resolution
		if (init?.url) {
			Object.defineProperty(response, "url", { value: init.url });
		}
		return response;
	}

	describe("successful fetches", () => {
		it("returns HTML body with metadata", async () => {
			fetchSpy.mockResolvedValue(mockResponse("<h1>Hello</h1>", { url: "https://example.com/" }));

			const result = await fetchPage("https://example.com/");
			expect(result.body).toBe("<h1>Hello</h1>");
			expect(result.contentType).toBe("text/html; charset=utf-8");
			expect(result.statusCode).toBe(200);
			expect(result.isHTML).toBe(true);
		});

		it("returns final URL after redirect", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("<p>Redirected</p>", { url: "https://example.com/final" }),
			);

			const result = await fetchPage("https://example.com/old");
			expect(result.finalURL).toBe("https://example.com/final");
		});

		it("returns JSON content as-is", async () => {
			const json = '{"key": "value"}';
			fetchSpy.mockResolvedValue(
				mockResponse(json, {
					headers: { "content-type": "application/json" },
					url: "https://api.example.com/data",
				}),
			);

			const result = await fetchPage("https://api.example.com/data");
			expect(result.body).toBe(json);
			expect(result.isHTML).toBe(false);
		});

		it("returns XML content as-is", async () => {
			const xml = "<root><item>1</item></root>";
			fetchSpy.mockResolvedValue(
				mockResponse(xml, {
					headers: { "content-type": "application/xml" },
					url: "https://example.com/feed.xml",
				}),
			);

			const result = await fetchPage("https://example.com/feed.xml");
			expect(result.body).toBe(xml);
			expect(result.isHTML).toBe(false);
		});

		it("returns plain text as-is", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("Hello, world!", {
					headers: { "content-type": "text/plain" },
					url: "https://example.com/file.txt",
				}),
			);

			const result = await fetchPage("https://example.com/file.txt");
			expect(result.body).toBe("Hello, world!");
			expect(result.isHTML).toBe(false);
		});
	});

	describe("HTTP errors", () => {
		it("throws FetchError for 404", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("Not Found", { status: 404, statusText: "Not Found", url: "https://example.com/missing" }),
			);

			await expect(fetchPage("https://example.com/missing")).rejects.toThrow(FetchError);
			await expect(fetchPage("https://example.com/missing")).rejects.toThrow("HTTP 404");
		});

		it("throws FetchError for 500", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("Internal Server Error", {
					status: 500,
					statusText: "Internal Server Error",
					url: "https://example.com/error",
				}),
			);

			try {
				await fetchPage("https://example.com/error");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("http");
				expect((err as FetchError).message).toContain("500");
			}
		});

		it("throws FetchError for 403", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("Forbidden", { status: 403, statusText: "Forbidden", url: "https://example.com/" }),
			);

			try {
				await fetchPage("https://example.com/");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("http");
			}
		});
	});

	describe("network errors", () => {
		it("categorizes DNS failure", async () => {
			fetchSpy.mockRejectedValue(new Error("getaddrinfo ENOTFOUND no-such-host.example"));

			try {
				await fetchPage("https://no-such-host.example/");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("network");
				expect((err as FetchError).message).toContain("DNS");
			}
		});

		it("categorizes connection refused", async () => {
			fetchSpy.mockRejectedValue(new Error("ECONNREFUSED"));

			try {
				await fetchPage("https://example.com:12345/");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("network");
				expect((err as FetchError).message).toContain("Connection refused");
			}
		});

		it("categorizes connection reset", async () => {
			fetchSpy.mockRejectedValue(new Error("ECONNRESET"));

			try {
				await fetchPage("https://example.com/");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("network");
				expect((err as FetchError).message).toContain("Connection reset");
			}
		});

		it("categorizes generic network error", async () => {
			fetchSpy.mockRejectedValue(new Error("Something weird happened"));

			try {
				await fetchPage("https://example.com/");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("network");
			}
		});
	});

	describe("timeout handling", () => {
		it("throws timeout error when request exceeds timeout", async () => {
			fetchSpy.mockImplementation(
				(_url: string, init?: RequestInit) =>
					new Promise((_resolve, reject) => {
						// Simulate the abort signal triggering
						init?.signal?.addEventListener("abort", () => {
							const err = new DOMException("The operation was aborted.", "AbortError");
							reject(err);
						});
					}),
			);

			try {
				await fetchPage("https://slow.example.com/", { timeoutSeconds: 0.05 });
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("timeout");
				expect((err as FetchError).message).toContain("timed out");
			}
		});
	});

	describe("binary content rejection", () => {
		it("rejects image/png", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("binary data", {
					headers: { "content-type": "image/png" },
					url: "https://example.com/image.png",
				}),
			);

			try {
				await fetchPage("https://example.com/image.png");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("binary");
				expect((err as FetchError).message).toContain("binary");
			}
		});

		it("rejects application/pdf", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("pdf bytes", {
					headers: { "content-type": "application/pdf" },
					url: "https://example.com/doc.pdf",
				}),
			);

			try {
				await fetchPage("https://example.com/doc.pdf");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("binary");
			}
		});

		it("rejects application/octet-stream", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("bytes", {
					headers: { "content-type": "application/octet-stream" },
					url: "https://example.com/file.bin",
				}),
			);

			try {
				await fetchPage("https://example.com/file.bin");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("binary");
			}
		});
	});

	describe("response size limits", () => {
		it("rejects response when Content-Length exceeds 5MB", async () => {
			fetchSpy.mockResolvedValue(
				mockResponse("small body", {
					headers: {
						"content-type": "text/html",
						"content-length": String(6 * 1024 * 1024),
					},
					url: "https://example.com/huge",
				}),
			);

			try {
				await fetchPage("https://example.com/huge");
				expect.unreachable("should have thrown");
			} catch (err) {
				expect(err).toBeInstanceOf(FetchError);
				expect((err as FetchError).category).toBe("too_large");
				expect((err as FetchError).message).toContain("5MB");
			}
		});
	});
});
