#!/usr/bin/env bash
set -euo pipefail

BINARY="dist/bin/kimchi-code"
if [[ ! -x "$BINARY" ]]; then
  echo "Error: $BINARY not found or not executable." >&2
  echo "Run 'pnpm run build:binary' first." >&2
  exit 1
fi

PROMPT="$(cat benchmark/manual/self-improvement.md)"

GOALS_FILE="benchmark/manual/improvement-goals.md"
if [[ -f "$GOALS_FILE" ]]; then
  PROMPT="$PROMPT

---

$(cat "$GOALS_FILE")"
  echo "Custom improvement goals loaded from $GOALS_FILE"
fi

"$BINARY" "$PROMPT" --yolo
