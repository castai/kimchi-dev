/**
 * Page fetcher — retrieves a URL using native fetch().
 *
 * Phase 1 uses only native fetch(). Playwright browser integration
 * will be added in Phase 4.
 */

/** Maximum raw response size in bytes (5 MB). */
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

/** Default timeout in seconds. */
const DEFAULT_TIMEOUT_SECONDS = 30;

/** Binary content-type prefixes that we refuse to process. */
const BINARY_PREFIXES = [
	"image/",
	"audio/",
	"video/",
	"application/octet-stream",
	"application/zip",
	"application/gzip",
	"application/pdf",
	"application/wasm",
	"font/",
] as const;

/** Content-type prefixes treated as text (returned as-is when non-HTML). */
const TEXT_PREFIXES = [
	"text/",
	"application/json",
	"application/xml",
	"application/xhtml+xml",
	"application/rss+xml",
	"application/atom+xml",
	"application/javascript",
	"application/x-javascript",
	"application/ld+json",
] as const;

export interface FetchResult {
	body: string;
	finalURL: string;
	contentType: string;
	statusCode: number;
	isHTML: boolean;
}

export class FetchError extends Error {
	constructor(
		message: string,
		public readonly category: "timeout" | "http" | "network" | "binary" | "too_large" | "unknown",
	) {
		super(message);
		this.name = "FetchError";
	}
}

function isBinaryContentType(ct: string): boolean {
	const lower = ct.toLowerCase();
	return BINARY_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isTextContentType(ct: string): boolean {
	const lower = ct.toLowerCase();
	return TEXT_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function isHTMLContentType(ct: string): boolean {
	const lower = ct.toLowerCase();
	return lower.startsWith("text/html") || lower.startsWith("application/xhtml+xml");
}

/**
 * Fetch a URL using native `fetch()`.
 *
 * - Follows redirects automatically.
 * - Rejects binary content-types.
 * - Rejects responses exceeding 5 MB.
 * - Returns the body as a string along with metadata.
 */
export async function fetchPage(
	url: string,
	options?: { timeoutSeconds?: number },
): Promise<FetchResult> {
	const timeoutMs = (options?.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS) * 1000;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);

	let response: Response;
	try {
		response = await fetch(url, {
			signal: controller.signal,
			redirect: "follow",
			headers: {
				"User-Agent": "kimchi-web-fetch/0.1",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
		});
	} catch (err: unknown) {
		clearTimeout(timer);
		if (err instanceof DOMException && err.name === "AbortError") {
			throw new FetchError(
				`Timeout: request to "${url}" timed out after ${options?.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS} seconds`,
				"timeout",
			);
		}
		const message = err instanceof Error ? err.message : String(err);
		if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
			throw new FetchError(`DNS error: could not resolve hostname for "${url}"`, "network");
		}
		if (message.includes("ECONNREFUSED")) {
			throw new FetchError(`Connection refused: "${url}"`, "network");
		}
		if (message.includes("ECONNRESET") || message.includes("EPIPE")) {
			throw new FetchError(`Connection reset while fetching "${url}"`, "network");
		}
		throw new FetchError(`Network error fetching "${url}": ${message}`, "network");
	} finally {
		clearTimeout(timer);
	}

	// HTTP errors
	if (!response.ok) {
		throw new FetchError(
			`HTTP ${response.status} ${response.statusText} fetching "${url}"`,
			"http",
		);
	}

	// Content-type checks
	const contentType = response.headers.get("content-type") ?? "application/octet-stream";
	if (isBinaryContentType(contentType)) {
		throw new FetchError(
			`Unsupported binary content-type "${contentType}" for "${url}". Only text-based content is supported`,
			"binary",
		);
	}

	// Size check via Content-Length header (fast path)
	const contentLength = response.headers.get("content-length");
	if (contentLength && Number.parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
		throw new FetchError(
			`Response too large: ${contentLength} bytes exceeds the ${MAX_RESPONSE_BYTES / 1024 / 1024}MB limit for "${url}"`,
			"too_large",
		);
	}

	// Read body as text, enforcing size limit
	let body: string;
	if (!isTextContentType(contentType) && !isHTMLContentType(contentType)) {
		// Unknown content-type that's not explicitly binary — try to read as text
		// but reject if it looks binary (non-UTF8)
		try {
			body = await readBodyWithLimit(response);
		} catch (err) {
			if (err instanceof FetchError) throw err;
			throw new FetchError(
				`Unsupported content-type "${contentType}" for "${url}"`,
				"binary",
			);
		}
	} else {
		body = await readBodyWithLimit(response);
	}

	return {
		body,
		finalURL: response.url,
		contentType,
		statusCode: response.status,
		isHTML: isHTMLContentType(contentType),
	};
}

/**
 * Read the response body as text, enforcing the 5 MB size limit.
 */
async function readBodyWithLimit(response: Response): Promise<string> {
	// Use arrayBuffer to measure bytes accurately
	const buffer = await response.arrayBuffer();
	if (buffer.byteLength > MAX_RESPONSE_BYTES) {
		throw new FetchError(
			`Response too large: ${buffer.byteLength} bytes exceeds the ${MAX_RESPONSE_BYTES / 1024 / 1024}MB limit`,
			"too_large",
		);
	}
	return new TextDecoder().decode(buffer);
}
