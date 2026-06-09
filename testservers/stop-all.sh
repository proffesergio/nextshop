#!/usr/bin/env bash
# Stop the storefronts started by run-all.sh.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIDFILE="$ROOT/testservers/.pids"

if [[ ! -f "$PIDFILE" ]]; then
  echo "No $PIDFILE — nothing to stop."
  exit 0
fi

while read -r pid; do
  [[ -z "$pid" ]] && continue
  if kill "$pid" 2>/dev/null; then
    echo "■ stopped pid $pid"
  fi
done < "$PIDFILE"

rm -f "$PIDFILE"
echo "✓ all test storefronts stopped"
