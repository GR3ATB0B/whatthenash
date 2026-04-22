#!/usr/bin/env bash
# scripts/dev-serve.sh — serve the site locally for browser QA.
# Usage: scripts/dev-serve.sh [port]
set -e
PORT="${1:-8000}"
cd "$(dirname "$0")/.."
echo "Serving whatthenash.com at http://localhost:${PORT}"
python3 -m http.server "${PORT}"
