import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { convertContent } from "./content-converter.js";
import { fetchPage } from "./page-fetcher.js";

let server: Server;
let baseURL: string;

/** Rich HTML page with boilerplate, relative URLs, and varied content for format testing. */
const RICH_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Rich Test Page</title>
  <style>body { font-family: sans-serif; }</style>
  <meta charset="utf-8">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <script>console.log('tracking');</script>
  <nav><a href="/">Home</a> | <a href="/about">About</a></nav>

  <h1>Documentation</h1>
  <p>Welcome to the docs. See the <a href="/api/reference">API reference</a> for details.</p>
  <p>You can also check the <a href="https://external.example.com/guide">external guide</a>.</p>

  <h2>Getting Started</h2>
  <ul>
    <li>Install the package</li>
    <li>Import the module</li>
    <li>Call <code>init()</code></li>
  </ul>

  <h3>Code Example</h3>
  <pre><code>import { init } from "lib";
init({ debug: true });</code></pre>

  <p>Here is an <em>important</em> note with <strong>bold text</strong>.</p>
  <img src="/images/diagram.png" alt="Architecture diagram">

  <header><h2>Header Section</h2></header>
  <aside>This sidebar is preserved.</aside>

  <footer><p>Copyright 2026 Example Corp</p></footer>
  <iframe src="https://ads.example.com/banner"></iframe>
  <svg><circle r="50"/></svg>
  <noscript>Enable JavaScript for full experience.</noscript>
</body>
</html>`;

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

		case "/rich":
			res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
			res.end(RICH_HTML);
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

describe("integration: fetchPage + convertContent with format parameter", () => {
	it("returns markdown with boilerplate stripped and URLs resolved", async () => {
		const result = await fetchPage(`${baseURL}/rich`);
		const md = convertContent(result.body, result.finalURL, "markdown");

		// Content is present
		expect(md).toContain("# Documentation");
		expect(md).toContain("## Getting Started");
		expect(md).toContain("`init()`");
		expect(md).toContain("*important*");
		expect(md).toContain("**bold text**");

		// Code block preserved
		expect(md).toContain("```");
		expect(md).toContain('import { init } from "lib"');

		// Relative URLs resolved to absolute
		expect(md).toContain(`${baseURL}/api/reference`);
		expect(md).toContain(`${baseURL}/images/diagram.png`);

		// Absolute external URLs preserved
		expect(md).toContain("https://external.example.com/guide");

		// Boilerplate stripped
		expect(md).not.toContain("tracking");       // script
		expect(md).not.toContain("sans-serif");      // style
		expect(md).not.toContain("Copyright");       // footer
		expect(md).not.toContain("ads.example.com"); // iframe
		expect(md).not.toContain("circle");          // svg
		expect(md).not.toContain("Enable JavaScript"); // noscript
		expect(md).not.toMatch(/\bHome\b/);          // nav

		// Header and aside preserved
		expect(md).toContain("Header Section");
		expect(md).toContain("sidebar is preserved");
	});

	it("returns plain text with boilerplate stripped", async () => {
		const result = await fetchPage(`${baseURL}/rich`);
		const text = convertContent(result.body, result.finalURL, "text");

		// Content present as plain text
		expect(text).toContain("Documentation");
		expect(text).toContain("Getting Started");
		expect(text).toContain("init()");
		expect(text).toContain("important");

		// No HTML tags
		expect(text).not.toContain("<");
		expect(text).not.toContain(">");

		// Boilerplate stripped
		expect(text).not.toContain("tracking");
		expect(text).not.toContain("Copyright");

		// Preserved sections
		expect(text).toContain("Header Section");
		expect(text).toContain("sidebar is preserved");
	});

	it("returns raw HTML unchanged for html format", async () => {
		const result = await fetchPage(`${baseURL}/rich`);
		const html = convertContent(result.body, result.finalURL, "html");

		// Exact passthrough
		expect(html).toBe(result.body);

		// Nothing stripped
		expect(html).toContain("<nav>");
		expect(html).toContain("<footer>");
		expect(html).toContain("<script>");
		expect(html).toContain("<style>");
		expect(html).toContain('href="/api/reference"'); // relative URL not modified
	});

	it("does not convert non-HTML content regardless of format", async () => {
		const result = await fetchPage(`${baseURL}/json`);
		expect(result.isHTML).toBe(false);

		// Non-HTML content should be returned as-is regardless of format
		const asMarkdown = result.isHTML ? convertContent(result.body, result.finalURL, "markdown") : result.body;
		const asText = result.isHTML ? convertContent(result.body, result.finalURL, "text") : result.body;

		expect(asMarkdown).toBe(result.body);
		expect(asText).toBe(result.body);
	});
});
