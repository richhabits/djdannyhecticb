#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .dev.pid ]; then
  PID="$(cat .dev.pid)"
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID" || true
    sleep 1
    kill -9 "$PID" 2>/dev/null || true
  fi
  rm -f .dev.pid
  echo "Stopped dev server."
else
  echo "No .dev.pid found."
fi
