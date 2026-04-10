# kimchi-code

A coding agent CLI powered by [kimchi-dev](https://github.com/castai/kimchi-dev). Built on the [pi-mono](https://github.com/badlogic/pi-mono) coding agent SDK, kimchi-code gives you an AI-powered development assistant in your terminal that connects to kimchi-dev's LLM infrastructure.

## Quick start

The easiest way to use kimchi-code is through the `kimchi` CLI, which handles downloading and launching the agent automatically:

```bash
kimchi
```

You can also run `kimchi-code` directly if it's on your PATH.

## Configuration

### Authentication

kimchi-code shares authentication with the `kimchi` CLI. The API key is resolved in this order:

1. `KIMCHI_API_KEY` environment variable (takes precedence)
2. `~/.config/kimchi/config.json` field `api_key`

If you're already logged in via `kimchi`, no additional setup is needed.

### Agent config

kimchi-code stores its own configuration (settings, sessions, models) under:

```
~/.config/kimchi/harness/
```

### Models

The following models are available through kimchi-dev:

- `kimi-k2.5` — Kimi K2.5
- `glm-5-fp8` — GLM 5 FP8
- `minimax-m2.5` — Minimax M2.5

A default `models.json` is created automatically on first run at `~/.config/kimchi/harness/models.json`. You can edit this file to customize model settings.

### HTTP proxy

kimchi-code respects `HTTP_PROXY` / `HTTPS_PROXY` environment variables for network requests.

## Development

### Prerequisites

- Node.js 22 (LTS)
- [Bun](https://bun.sh/) (used for dev server and binary compilation)
- [corepack](https://nodejs.org/api/corepack.html) enabled (`corepack enable`)
- pnpm (installed automatically via corepack)

### Setup

```bash
git clone git@github.com:castai/kimchi-dev.git
cd kimchi-dev
corepack enable
pnpm install
```

### Commands

| Command | Description |
|---------|-------------|
| `pnpm run build` | Compile TypeScript to `dist/` and copy theme assets |
| `pnpm run dev` | Run the CLI locally via Bun |
| `pnpm run check` | Biome lint + TypeScript type check |
| `pnpm run lint` | Biome lint only |
| `pnpm run lint:fix` | Biome lint with auto-fix |
| `pnpm run test` | Run tests with vitest |

### Running locally

Run the CLI directly via Bun:

```bash
pnpm run dev
```

Or build a standalone binary and run it:

```bash
pnpm run build:binary
./dist/kimchi-code
```

### Project structure

```
src/
  cli.ts          — Entry point
  config.ts       — Auth & config loading
  env.ts          — Environment variable helpers
  models.ts       — Default model definitions
  extensions/     — Agent extensions (orchestration, web-fetch)
  modes/          — Interactive mode & theme assets
```

## Release

Standalone binaries are built automatically by GitHub Actions when a version tag is pushed (`v*`). Binaries are compiled with `bun build --compile` and require no runtime on the user's machine.

Supported platforms:

- macOS (amd64, arm64)
- Linux (amd64, arm64)

Release assets follow the naming convention `kimchi-code_{os}_{arch}.tar.gz` with a `checksums.txt` (SHA256) for verification.

## License

MIT
