# Plan: kimchi-code Bundling and Distribution

> Source PRD: prd/001-bundling-and-distribution.md

## Architectural decisions

- **Patch target**: pnpm patch on `@mariozechner/pi-coding-agent`'s compiled `dist/main.js`. The patch adds an optional second parameter `options?: { extensionFactories?: ExtensionFactory[] }` to `main()` and spreads `extensionFactories` into the `resourceLoaderOptions` object passed to `createAgentSessionServices()`.
- **Extension registration pattern**: Static imports in `cli.ts` → array of factory functions → passed to patched `main()`. Bun follows static imports at compile time, bundling all extension code into the binary.
- **Disk-based discovery still works**: The patched `main()` merges inline factories with disk-discovered extensions. Dev mode (`pnpm run dev`) continues to use `settings.json`-based discovery.
- **Verification approach**: Smoke tests spawn the compiled binary (`dist/kimchi-code`) in a sandboxed temp HOME with no `settings.json`. Tests that assert tool availability require `KIMCHI_API_KEY` and are skipped without it, matching the existing pattern.

---

## Phase 1: Patch pi-mono's `main()` to accept extension factories

**User stories**: #2 (minimal pnpm patch)

### What to build

Use `pnpm patch` to modify `@mariozechner/pi-coding-agent`'s compiled `dist/main.js`. Add an optional second parameter to `main()` that accepts `{ extensionFactories }` and spreads it into the `resourceLoaderOptions` already passed to `createAgentSessionServices()`. Commit the patch file under `patches/` and add `patchedDependencies` to `package.json` so pnpm applies it automatically on install.

### Acceptance criteria

- [ ] `patches/` contains the patch file for `@mariozechner/pi-coding-agent`
- [ ] `package.json` has a `patchedDependencies` entry
- [ ] `pnpm install` applies the patch without errors
- [ ] The patched `main()` accepts `main(args, { extensionFactories })` and passes factories through to `resourceLoaderOptions`
- [ ] Existing behavior (calling `main(args)` with no second argument) is unchanged

---

## Phase 2: Bundle web-fetch extension via static import in cli.ts

**User stories**: #1 (extensions bundled via static imports)

### What to build

In `cli.ts`, statically import the web-fetch extension factory and pass it to the patched `main()` as `extensionFactories`. Build the binary with `pnpm run build:binary` and verify the compiled binary starts cleanly and includes the bundled extension code.

### Acceptance criteria

- [ ] `cli.ts` statically imports the web-fetch factory and passes it to `main(args, { extensionFactories: [...] })`
- [ ] `pnpm run build:binary` compiles successfully
- [ ] The compiled binary runs `--version` and `--help` without errors
- [ ] `web_fetch` tool is available in the binary without any `settings.json` pointing to the extension on disk (verified manually or in Phase 3)

---

## Phase 3: Smoke tests for bundled extensions

**User stories**: #3 (smoke tests catch bundling regressions)

### What to build

Update the existing `web-fetch.test.ts` smoke test so it no longer writes a `settings.json` with the extension path — the tool should be available purely from the bundled binary. Keep the API-key-gated skip pattern. This is the regression gate: if bundling breaks, this test fails.

### Acceptance criteria

- [ ] `web-fetch.test.ts` does NOT write `settings.json` with extension paths
- [ ] Test asserts `web_fetch` tool is registered when running the compiled binary in a clean temp HOME
- [ ] Test is skipped when `KIMCHI_API_KEY` is not set (existing pattern)
- [ ] `pnpm run test:smoke` passes (with API key)
- [ ] CI pipeline (`pnpm run verify`) passes
