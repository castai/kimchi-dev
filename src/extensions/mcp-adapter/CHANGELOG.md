# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.4.0] - 2026-04-13

### Added
- `settings.disableProxyTool` to hide the `mcp` proxy tool once configured direct tools are fully available from cache. Thanks @tanavamsikrishna for PR #41.
- Per-server `excludeTools` to hide specific MCP tools/resources by original or prefixed name across direct tools, proxy discovery, and the `/mcp` panel. Thanks @ahmadaccino for issue #36.
- `settings.autoAuth` to optionally trigger OAuth automatically from proxy/direct tool usage, then rerun the original blocked connect/tool operation once after authentication succeeds. Thanks @unimonkiez for issue #34.

### Fixed
- Regenerated `package-lock.json` so the root lockfile metadata matches `package.json` again, including the declared `open`, `@types/bun`, `@types/open`, and `tsx` entries.
- Kept the `mcp` proxy tool available as a first-session fallback when configured direct tools are still missing cache metadata, avoiding no-tool startup gaps.

## [2.3.5] - 2026-04-13

### Fixed
- Session lifecycle now always tears down OAuth callback state on restart and shutdown, preventing callback-server leaks across session transitions.
- OAuth callback server now calls `unref()` after successful bind so it no longer keeps sub-agent processes alive by itself.
- Strict OAuth port mode now rebinds to the configured callback port when safe, while refusing to switch ports when authorizations are still pending.
- Added focused lifecycle/callback-server regression coverage for teardown, `unref()`, strict rebinding, and pending-auth guardrails.
- Thanks @blai for the investigation and PR #43 that surfaced the sub-agent hang/root lifecycle issues.

## [2.3.4] - 2026-04-12

### Fixed
- OAuth callback handling now allows dynamic-registration flows to fall back to a free local port when the preferred callback port is busy, while keeping pre-registered clients on their exact configured redirect port.
- Documented the new callback-port behavior and added focused auth-flow regression coverage.

## [2.3.3] - 2026-04-12

### Fixed
- Remove the blank footer status line when no MCP servers are configured by clearing the MCP status entry instead of setting it to an empty string. Thanks @HazAT for PR #27.

## [2.3.2] - 2026-04-11

### Added
- Optional `oauth.grantType: "client_credentials"` for non-interactive machine-to-machine OAuth on HTTP MCP servers.

### Fixed
- `/mcp-auth <server>` now handles `client_credentials` without browser/callback flow.
- MCP panel status no longer marks `client_credentials` servers as auth-blocked solely because no stored user tokens exist yet.
- OAuth auth flow now closes temporary transports consistently on success, refresh, and auth removal paths.
- Init paths now preserve debug-level context for previously silent direct-tool bootstrap and lazy-connect failures.

## [2.3.1] - 2026-04-11

### Fixed
- Removed `/mcp-auth-callback`. OAuth auth now hard-cuts to `/mcp-auth <server>` only.

## [2.3.0] - 2026-04-11

### Added
- OAuth callback server initialization on session start and a deprecated `/mcp-auth-callback` command that now points users to `/mcp-auth <server>`.

### Fixed
- OAuth `needs-auth` handling across `/mcp` status/panel, `mcp({ connect })`, `mcp({ tool })`, reconnect flow, lazy/direct tool execution, and startup bootstrap.
- OAuth callback cleanup now cancels by stored OAuth state and closes pending transports on failure/cancel paths.
- Callback server now fails fast when the OAuth callback port is occupied by another process.
- Package manifest test now ignores root `*.test.ts` files.

## [2.2.2] - 2026-04-03

### Fixed
- Session lifecycle teardown now handles repeated `session_start` transitions safely and prevents stale async init results from replacing newer state.
- Shutdown now still runs `gracefulShutdown()` even if metadata cache flushing throws, avoiding leaked MCP processes.
- Proxy/direct tool init error paths now preserve and surface underlying error messages instead of returning generic failures.
- Invalid `mcp` tool `args` now fail by throwing with parse/type context instead of returning non-failing tool payloads.
- Added focused lifecycle regressions tests for stale init cleanup and init-error visibility.

## [2.2.1] - 2026-03-23

### Fixed
- Added `promptSnippet` to MCP proxy tool and direct MCP tools so they appear in the system prompt's Available tools section (required since pi 0.59.0)

## [2.2.0] - 2026-03-16

### Added
- **MCP UI Integration** - Support for the [MCP UI](https://github.com/MCP-UI-Org/mcp-ui) standard. Tools with `_meta.ui.resourceUri` open interactive UIs:
  - Bidirectional AppBridge communication (tool calls, messages, context updates)
  - Works with both stdio and HTTP MCP servers
  - User consent management for tool calls from UI (configurable: never/once-per-server/always)
  - Keyboard shortcuts: Cmd/Ctrl+Enter to complete, Escape to cancel
  - UI prompts/intents trigger agent turns via `pi.sendMessage({ triggerTurn: true })`
  - `mcp({ action: "ui-messages" })` retrieves accumulated messages from UI sessions

- **Session reuse** - When the agent calls the same tool while its UI is already open, results push to the existing window instead of replacing it. Per-call stream IDs with independent sequences. Error results scoped to the individual call.

- **Glimpse integration** - MCP UI opens in a native macOS WKWebView window instead of a browser tab when [Glimpse](https://github.com/hazat/glimpse) is installed (`pi install npm:glimpseui`). Falls back to browser on non-macOS or when unavailable. Override with `MCP_UI_VIEWER=browser` or `MCP_UI_VIEWER=glimpse`.

- **Logger module** (`logger.ts`) - Centralized logging with levels (debug/info/warn/error), contextual child loggers, and `MCP_UI_DEBUG=1` env var.

- **Error types** (`errors.ts`) - Structured errors with recovery hints: `ResourceFetchError`, `ResourceParseError`, `BridgeConnectionError`, `ConsentError`, `SessionError`, `ServerError`, and `wrapError()` helper.

- **Test suite** - 178 tests covering consent manager, UI resource handler, host HTML template, logger, and error types.

- **Interactive visualizer example** (`examples/interactive-visualizer`) - Minimal MCP server demonstrating charts (bar/line/pie/doughnut via Chart.js), bidirectional messaging, and streaming.

### Fixed
- Host-iframe timing: bridge now connects before loading iframe, fixing `ui/initialize` timeout on first load
- All internal `log.info` calls demoted to `log.debug` to eliminate stdout noise during normal use

### Technical Notes
- Uses local minified AppBridge bundle (408KB) to avoid CDN Zod bundling issues
- Serves app HTML from `/ui-app` endpoint instead of blob URLs to avoid iframe issues
- SSE for real-time tool result streaming to browser

## [2.1.2] - 2026-02-03

### Changed
- Added demo video and `pi.video` field to package.json for pi package browser.

## [2.1.0] - 2026-02-02

### Added
- **Direct tool registration** - Promote specific MCP tools to first-class Pi tools via `directTools` config (per-server or global). Direct tools appear in the agent's tool list alongside builtins, so the LLM uses them without needing to search through the proxy first. Registers from cached metadata at startup — no server connections needed.
- **`/mcp` interactive panel** - New TUI overlay replacing the text-based status dump. Shows server connection status, tool lists with direct/proxy toggles, token cost estimates, inline reconnect, and auth notices. Changes written to config on save.
- **Auto-enriched proxy description** - The `mcp` proxy tool description now includes server names and tool counts from the metadata cache, so the LLM knows what's available without a search call (~30 extra tokens).
- **`MCP_DIRECT_TOOLS` env var** - Subagent processes receive their direct tool configuration via environment variable, keeping subagents lean by default.
- **First-run bootstrap** - Servers with `directTools` configured but no cache entry are connected during `session_start` to populate the cache. Direct tools become available after restart.
- Config provenance tracking for correct write-back to user/project/import sources
- Builtin name collision guard (skips direct tools that would shadow `read`, `write`, etc.)
- Cross-server name deduplication for `prefix: "none"` and `prefix: "short"` modes

## [2.0.1] - 2026-02-01

### Fixed
- Adapt execute signature to pi v0.51.0: add signal, onUpdate, ctx parameters

## [2.0.0] - 2026-01-29

### Changed
- **BREAKING: Lazy startup by default** - All servers now default to `lifecycle: "lazy"` and only connect when a tool call needs them. Previously all servers connected eagerly on session start. Set `lifecycle: "keep-alive"` or `lifecycle: "eager"` to restore the old behavior per-server.
- **Idle timeout** - Connected servers are automatically disconnected after 10 minutes of inactivity (configurable via `settings.idleTimeout` or per-server `idleTimeout`). Cached metadata keeps search/list working after disconnect. Set `idleTimeout: 0` to disable.
- `/mcp reconnect` accepts an optional server name to connect or reconnect a single server

### Added
- **Metadata cache** - Tool and resource metadata persisted to `~/.pi/agent/mcp-cache.json`. Enables search/list/describe without live connections. Per-server config hashing with 7-day staleness. Multi-session safe via read-merge-write with per-process tmp files.
- **npx binary resolution** - Resolves npx package binaries to direct paths, eliminating the ~143 MB npm parent process per server. Persistent cache at `~/.pi/agent/mcp-npx-cache.json` with 24h TTL.
- **`mcp({ connect: "server-name" })` mode** - Explicitly trigger connection and metadata refresh for a named server
- **Failure backoff** - Servers that fail to connect are skipped for 60 seconds to avoid repeated connection storms
- **In-flight tracking** - Active tool calls prevent idle timeout from shutting down a server mid-request
- **Prefix-match fallback** - Tool calls with unrecognized names try to match a server prefix and lazy-connect the matching server
- Lifecycle options: `lazy` (default), `eager` (connect at startup, no auto-reconnect), `keep-alive` (unchanged)
- Per-server `idleTimeout` override and global `settings.idleTimeout`
- First-run bootstrap: connects all servers on first session to populate the cache

### Fixed
- Connection close race condition: concurrent close + connect no longer orphans server processes
- **Fuzzy tool name matching** - Hyphens and underscores are treated as equivalent during tool lookup. MCP tools like `resolve-library-id` are now found when called as `resolve_library_id`, which LLMs naturally guess since the prefix separator is `_`.
- **Better "tool not found" errors** - When a server is identified (via prefix match or override) but the tool isn't found, the error now lists that server's available tools so the LLM can self-correct immediately instead of needing a separate list call

## [1.6.0] - 2026-01-29

### Added
- **Unified pi tool search** - `mcp({ search: "..." })` now searches both MCP tools and Pi tools (from installed extensions)
- Pi tools appear first in results with `[pi tool]` prefix
- Details object includes `server: "pi"` for pi tools
- Banner image for README

## [1.5.1] - 2026-01-26

### Changed
- Added `pi-package` keyword for npm discoverability (pi v0.50.0 package system)

## [1.5.0] - 2026-01-22

### Changed
- **BREAKING: `args` parameter is now a JSON string** - The `args` parameter which previously accepted an object now accepts a JSON string. This change was required for compatibility with Claude's Vertex AI API (`google-antigravity` provider) which rejects `patternProperties` in JSON schemas (generated by `Type.Record()`).

### Added
- **Type validation for args** - Parsed args are now validated to ensure they're a JSON object (not null, array, or primitive). Clear error messages for invalid input.
- **`isError: true` on error responses** - JSON parse errors and type validation errors now properly set `isError: true` to indicate failure to the LLM.

### Migration
```typescript
// Before (1.4.x)
mcp({ tool: "my_tool", args: { key: "value" } })

// After (1.5.0)
mcp({ tool: "my_tool", args: '{"key": "value"}' })
```

## [1.4.1] - 2026-01-19

### Changed

- Status bar shows server count instead of tool count ("MCP: 5 servers")

## [1.4.0] - 2026-01-19

### Changed

- **Non-blocking startup** - Pi starts immediately, MCP servers connect in background. First MCP call waits only if init isn't done yet.

### Fixed

- Tool metadata now includes `inputSchema` after `/mcp reconnect` (was missing, breaking describe and error hints)

## [1.3.0] - 2026-01-19

### Changed

- **Parallel server connections** - All MCP servers now connect in parallel on startup instead of sequentially, significantly faster with many servers

## [1.2.2] - 2026-01-19

### Fixed

- Installer now downloads from `main` branch (renamed from `master`)

## [1.2.1] - 2026-01-19

### Added

- **npx installer** - Run `npx pi-mcp-adapter` to install (downloads files, installs deps, configures settings.json)

## [1.1.0] - 2026-01-19

### Changed

- **Search includes schemas by default** - Search results now include parameter schemas, reducing tool calls needed (search + call instead of search + describe + call)
- **Space-separated search terms match as OR** - `"navigate screenshot"` finds tools matching either word (like most search engines)
- **Suppress server stderr by default** - MCP server logs no longer clutter terminal on startup
- Use `includeSchemas: false` for compact output without schemas
- Use `debug: true` per-server to show stderr when troubleshooting

## [1.0.0] - 2026-01-19

### Added

- **Single unified `mcp` tool** with token-efficient architecture (~200 tokens vs ~15,000 for individual tools)
- **Five operation modes:**
  - `mcp({})` - Show server status
  - `mcp({ server: "name" })` - List tools from a server
  - `mcp({ search: "query" })` - Search tools by name/description
  - `mcp({ describe: "tool_name" })` - Show tool details and parameter schema
  - `mcp({ tool: "name", args: {...} })` - Call a tool
- **Stdio transport** for local MCP servers (command + args)
- **HTTP transport** with automatic fallback (StreamableHTTP → SSE)
- **Config imports** from Cursor, Claude Code, Claude Desktop, VS Code, Windsurf, Codex
- **Resource tools** - MCP resources exposed as callable tools
- **OAuth support** - Token file-based authentication
- **Bearer token auth** - Static or environment variable tokens
- **Keep-alive connections** with automatic health checks and reconnection
- **Schema on-demand** - Parameter schemas shown in `describe` mode and error responses
- **Commands:**
  - `/mcp` or `/mcp status` - Show server status
  - `/mcp tools` - List all tools
  - `/mcp reconnect` - Force reconnect all servers
  - `/mcp-auth <server>` - Show OAuth setup instructions

### Architecture

- Tools stored in metadata map, not registered individually with Pi
- MCP server validates arguments (no client-side schema conversion)
- Reconnect callback updates metadata after auto-reconnect
- Human-readable schema formatting for LLM consumption
