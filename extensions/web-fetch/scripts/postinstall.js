#!/usr/bin/env node

import { exec as execCb } from "child_process";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = resolve(__dirname, "..");

const skip =
	process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "1" ||
	process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD === "true";

if (skip) {
	process.stderr.write("[kimchi] postinstall: skipping Playwright browser download (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD is set)\n");
	process.exit(0);
}

const child = execCb("npx playwright install chromium", { cwd }, (error, stdout, stderr) => {
	if (stdout) process.stdout.write(stdout);
	if (stderr) process.stderr.write(stderr);
	if (error) {
		process.stderr.write(`[kimchi] postinstall: Playwright browser install failed — web_fetch will fall back to native HTTP\n`);
		process.exit(0); // non-fatal: don't break install
	}
});
