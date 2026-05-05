# Agent Guidelines for Kimchi-Dev

You are editing the kimchi-code CLI harness. This repo extends the pi-mono SDK (`@mariozechner/pi-coding-agent`) — core agent loop lives upstream; this repo adds extensions in `src/extensions/`.

## Environment
- **Package manager**: pnpm (NEVER use npm/yarn)
- **Runtime**: Bun for dev (`pnpm run dev`), Node 22+ for built binaries
- **Test runner**: vitest (`pnpm run test` — unit, `pnpm run test:smoke` — e2e)
- **Linter**: biome (`pnpm run lint`, `pnpm run lint:fix`)
- **Type check**: TypeScript (`pnpm run typecheck`)

## Hard Constraints
- **NEVER modify `patches/` files directly** — patches apply at install; changes here don't affect runtime
- **NEVER touch `src/core/export-html/` HTML templates** — bundled JS is auto-generated from source
- **Test files**: Co-locate as `*.test.ts` alongside source (NOT in a separate test/ folder)

## Development Patterns
- **Auto-formatting**: `lint:fix` runs automatically after file edits (PostToolUse hook) — don't run manually
- **Pre-commit**: `.husky/pre-commit` runs `pnpm run lint` — CI runs full `check` (lint + typecheck)
- **README changes**: Run `./scripts/copy-resources.js --dev` after editing to propagate to dist/

## Documents Directory
- `.kimchi/docs/` → Transient AI working files — git-ignored, do NOT commit
- `/docs/` → Permanent project documentation — commit here
