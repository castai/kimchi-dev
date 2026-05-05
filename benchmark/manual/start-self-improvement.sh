#!/bin/zsh
set -e

PROMPT="$(cat benchmark/manual/self-improvement.md)"

GOALS_FILE="benchmark/manual/improvement-goals.md"
if [[ -f "$GOALS_FILE" ]]; then
  PROMPT="$PROMPT

---

$(cat "$GOALS_FILE")"
  echo "Custom improvement goals loaded from $GOALS_FILE"
fi

dist/bin/kimchi-code "$PROMPT" --yolo
