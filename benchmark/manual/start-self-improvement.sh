#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BINARY="$REPO_ROOT/dist/bin/kimchi-code"
if [[ ! -x "$BINARY" ]]; then
  echo "Error: $BINARY not found or not executable." >&2
  echo "Run 'pnpm run build:binary' first." >&2
  exit 1
fi

PROMPT="$(cat "$SCRIPT_DIR/self-improvement.md")"

GOALS_FILE="$SCRIPT_DIR/improvement-goals.md"
if [[ -f "$GOALS_FILE" ]]; then
  PROMPT="$PROMPT

---

$(cat "$GOALS_FILE")"
  echo "Custom improvement goals loaded from $GOALS_FILE"
fi

cd "$REPO_ROOT"
"$BINARY" "$PROMPT" --yolo
