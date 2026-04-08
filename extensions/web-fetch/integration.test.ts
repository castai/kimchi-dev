import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { fetchPage } from "./page-fetcher.js";

let server: Server;
let baseURL: string;

function handler(req: IncomingMessage, res: ServerResponse) {
	const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

	switch (url.pathname) {
		case "/html":
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(`<!DOCTYPE html>
<html>
<head><title>Test Page</title></head>
<body>
<h1>Hello World</h1>
<p>This is a test page with a <a href="/other">link</a>.</p>
</body>
</html>`);
			break;

		case "/json":
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ message: "hello", items: [1, 2, 3] }));
			break;

		case "/plain":
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("Just plain text.");
			break;

		case "/redirect":
			res.writeHead(302, { Location: "/html" });
			res.end();
			break;

		case "/not-found":
			res.writeHead(404, { "Content-Type": "text/plain" });
			res.end("Not Found");
			break;

		case "/server-error":
			res.writeHead(500, { "Content-Type": "text/plain" });
			res.end("Internal Server Error");
			break;

		case "/slow": {
			const delay = Number.parseInt(url.searchParams.get("delay") ?? "5000", 10);
			setTimeout(() => {
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end("<p>Slow response</p>");
			}, delay);
			break;
		}

		case "/binary":
			res.writeHead(200, { "Content-Type": "application/octet-stream" });
			res.end(Buffer.from([0x00, 0x01, 0x02, 0x03]));
			break;

		default:
			res.writeHead(404);
			res.end("Unknown route");
	}
}

beforeAll(async () => {
	server = createServer(handler);
	await new Promise<void>((resolve) => {
		server.listen(0, "127.0.0.1", () => resolve());
	});
	const addr = server.address();
	if (!addr || typeof addr === "string") throw new Error("Failed to start test server");
	baseURL = `http://127.0.0.1:${addr.port}`;
});

afterAll(async () => {
	await new Promise<void>((resolve, reject) => {
		server.close((err) => (err ? reject(err) : resolve()));
	});
});

describe("integration: fetchPage with local HTTP server", () => {
	it("fetches a static HTML page", async () => {
		const result = await fetchPage(`${baseURL}/html`);
		expect(result.statusCode).toBe(200);
		expect(result.isHTML).toBe(true);
		expect(result.body).toContain("<h1>Hello World</h1>");
		expect(result.body).toContain("test page");
		expect(result.contentType).toContain("text/html");
	});

	it("fetches JSON content", async () => {
		const result = await fetchPage(`${baseURL}/json`);
		expect(result.isHTML).toBe(false);
		expect(result.contentType).toContain("application/json");
		const parsed = JSON.parse(result.body);
		expect(parsed.message).toBe("hello");
		expect(parsed.items).toEqual([1, 2, 3]);
	});

	it("fetches plain text content", async () => {
		const result = await fetchPage(`${baseURL}/plain`);
		expect(result.isHTML).toBe(false);
		expect(result.body).toBe("Just plain text.");
	});

	it("follows redirects and reports final URL", async () => {
		const result = await fetchPage(`${baseURL}/redirect`);
		expect(result.statusCode).toBe(200);
		expect(result.finalURL).toContain("/html");
		expect(result.body).toContain("Hello World");
	});

	it("throws on 404", async () => {
		await expect(fetchPage(`${baseURL}/not-found`)).rejects.toThrow("HTTP 404");
	});

	it("throws on 500", async () => {
		await expect(fetchPage(`${baseURL}/server-error`)).rejects.toThrow("HTTP 500");
	});

	it("throws on binary content", async () => {
		await expect(fetchPage(`${baseURL}/binary`)).rejects.toThrow("binary");
	});

	it("throws on timeout", async () => {
		await expect(
			fetchPage(`${baseURL}/slow?delay=5000`, { timeoutSeconds: 0.1 }),
		).rejects.toThrow("timed out");
	}, 10_000);
});
