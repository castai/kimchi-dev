# PRD: kimchi-code Bundling and Distribution

## Problem Statement

kimchi-code is a coding agent CLI built as a thin wrapper around pi-mono with custom extensions (e.g., web-fetch). Today the build pipeline produces standalone binaries but does not bundle extensions into them — extensions must be discovered from disk at runtime via settings.json. The compiled binary should carry all extensions inline so they work without disk-based extension discovery.

## Solution

Bundle extensions directly into the kimchi-code standalone binary using pi-mono's inline extension factory mechanism. Patch pi-mono's `main()` to accept `extensionFactories` as an option, then statically import extensions in `cli.ts` so Bun compiles everything into a single executable. Add smoke tests that verify bundled extensions load in the compiled binary.

## User Stories

1. As a developer, I want extensions bundled via static imports, so that adding a new extension is just adding an import and a factory entry in `cli.ts`.
2. As a developer, I want the pnpm patch on pi-mono to be minimal (2 lines), so that it's easy to maintain and eventually remove when upstream accepts the change.
3. As a developer, I want smoke tests to verify the compiled binary loads extensions correctly, so that bundling regressions are caught before release.

## Already Implemented (context only)

The following capabilities already exist and are NOT in scope for this PRD:

- **Single binary distribution**: Bun compile pipeline produces standalone binaries (`pnpm run build:binary`).
- **Release pipeline**: GitHub Actions release workflow triggers on `v*` tags, builds for macOS/Linux (x64, arm64), produces `kimchi-code_{os}_{arch}.tar.gz` tarballs with SHA256 checksums.
- **Playwright graceful degradation**: web-fetch extension falls back to native `fetch()` when Playwright browsers are not installed (browser-pool.ts, page-fetcher.ts).
- **API key error handling**: `loadConfig()` throws a clear error directing users to run `kimchi auth login` when no API key is found.
- **Basic smoke tests**: binary.test.ts verifies the binary exists, runs --version/--help, and errors on missing API key.

## Implementation Decisions

### Extension bundling via inline factories

- Patch pi-mono's `main()` function using `pnpm patch` to accept an optional second parameter: `main(args: string[], options?: { extensionFactories?: ExtensionFactory[] })`. The patch passes `extensionFactories` through to `resourceLoaderOptions` which already supports it in `DefaultResourceLoader`.
- In kimchi-code's `cli.ts`, statically import extension factory functions and pass them to `main()`. Bun's compiler follows static imports and bundles all extension code and dependencies into the binary.
- Adding a new extension means: (1) implement the factory, (2) add a static import in `cli.ts`, (3) add it to the `extensionFactories` array.
- Disk-based extension discovery still works for development (`pnpm run dev`), but the compiled binary carries all extensions inline.

### pnpm patch strategy

- Use `pnpm patch @mariozechner/pi-coding-agent` to modify the compiled `main.js` in node_modules.
- The patch adds an optional `options` parameter to `main()` and spreads `extensionFactories` into `resourceLoaderOptions`.
- The patch file is committed to the repo under `patches/` and applied automatically by pnpm on install.
- When pi-mono upstream accepts the change, delete the patch file and bump the dependency version.

### Binary placement and naming

- The release pipeline produces tarballs named `kimchi-code_{os}_{arch}.tar.gz` (already the case).
- Each tarball contains: `kimchi-code` binary, `package.json` (for version info), `theme/` directory, `export-html/` directory.
- The kimchi Go CLI downloads the appropriate tarball from GitHub Releases and places `kimchi-code` in the same directory as the `kimchi` binary (discovered via `os.Executable()`).
- No custom install paths, no PATH manipulation required.

### Release pipeline

- Trigger: push of `v*` tags (existing behavior).
- Build matrix: macOS (x64, arm64), Linux (x64, arm64) — no Windows.
- Steps: checkout → pnpm install (applies patch) → build TypeScript → compile with Bun → package tarball → upload artifact.
- Release job: download all artifacts → generate SHA256 checksums → create GitHub Release with tarballs and checksums.
- CI pipeline runs on PRs and main: lint, type check, build, unit tests, extension tests, smoke tests (including binary smoke test that verifies extensions load).

### No self-update, no first-run flow

- kimchi-code has no self-update mechanism. The kimchi Go CLI manages downloading and updating the binary.
- kimchi-code has no first-run configuration flow. It reads the API key from `KIMCHI_API_KEY` env var or `~/.config/kimchi/config.json` (written by the kimchi Go CLI wizard). If missing, it exits with a clear error directing the user to run `kimchi`.

## Testing Decisions

Good tests verify external behavior (what the binary does), not implementation details (how it does it).

### Modules to test

- **Binary smoke test**: Compile the binary, run it with `--help` or `--version`, verify it starts and exits cleanly. Verify that bundled extensions are listed/loadable (e.g., `web_fetch` tool appears in tool listing).
- **Extension factory registration**: Test that passing extension factories to `main()` (via the patched path) results in the tools being available in the agent session.
- **pnpm patch validity**: CI runs `pnpm install --frozen-lockfile` which applies the patch — if the patch fails to apply (e.g., after a pi-mono version bump), CI fails.

### Prior art

- Existing smoke tests in `tests/smoke/` verify the binary compiles and runs.
- Existing extension tests in `extensions/web-fetch/` verify the execute handler in isolation.

## Out of Scope

- **Windows support**: Not needed — kimchi Go CLI doesn't support Windows either.
- **npm distribution**: Not needed — kimchi Go CLI manages binary distribution.
- **Self-update mechanism in kimchi-code**: Managed by the kimchi Go CLI.
- **First-run configuration wizard**: Managed by the kimchi Go CLI.
- **Playwright browser bundling**: Browsers are opt-in, not bundled in the tarball.
- **Extension marketplace or plugin install command**: Extensions are bundled at build time, not installed at runtime.
- **Changes to the kimchi Go CLI**: This PRD covers kimchi-code only. The Go CLI's download/spawn logic is tracked separately.

## Further Notes

- The pnpm patch is the only upstream dependency. If pi-mono adds `extensionFactories` support to `main()` natively, the patch can be removed with no other changes.
- Future extensions follow the same pattern: implement the factory, add a static import in `cli.ts`. No build system changes needed.
