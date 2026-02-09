#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="${PORT:-3000}"

if lsof -ti :"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT already in use. Kill it first: lsof -ti :$PORT | xargs kill -9"
  exit 1
fi

nohup pnpm run dev > .dev.log 2>&1 &
echo $! > .dev.pid
echo "Dev running: PID $(cat .dev.pid). Logs: .dev.log"
