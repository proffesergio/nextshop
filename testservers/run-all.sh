#!/usr/bin/env bash
# Start every client's storefront concurrently for side-by-side design testing.
# Each gets its own port + NEXT_DIST_DIR so the .next caches don't collide.
# Usage: ./testservers/run-all.sh   (stop with ./testservers/stop-all.sh)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="$HOME/.npm-global/bin:$PATH"

LOGDIR="$ROOT/testservers/logs"
PIDFILE="$ROOT/testservers/.pids"
mkdir -p "$LOGDIR"
: > "$PIDFILE"

# client:port pairs
servers=(
  "finnish-grocer:3000"
  "freestylebd:3001"
  "example-co:3002"
)

for entry in "${servers[@]}"; do
  client="${entry%%:*}"
  port="${entry##*:}"
  echo "▶ starting $client on http://localhost:$port (log: testservers/logs/$client.log)"
  STORE_CLIENT="$client" NEXT_DIST_DIR=".next-$client" \
    pnpm --filter @nextshop/storefront exec next dev -p "$port" \
    > "$LOGDIR/$client.log" 2>&1 &
  echo "$!" >> "$PIDFILE"
done

echo ""
echo "✓ Storefronts starting:"
echo "  🥬 finnish-grocer → http://localhost:3000"
echo "  🧵 freestylebd    → http://localhost:3001"
echo "  🛍️  example-co     → http://localhost:3002"
echo ""
echo "Tail a log:  tail -f testservers/logs/freestylebd.log"
echo "Stop all:    ./testservers/stop-all.sh"
