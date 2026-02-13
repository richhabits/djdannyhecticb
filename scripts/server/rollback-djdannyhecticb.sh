#!/usr/bin/env bash
set -euo pipefail
APP="/srv/djdannyhecticb"
LAST="$(ls -1dt $APP/releases/* 2>/dev/null | sed -n '2p' || true)"
[ -n "$LAST" ] || { echo "No previous release to roll back to"; exit 1; }
ln -sfn "$LAST" "$APP/current"
nginx -t
systemctl reload nginx
echo "Rolled back to: $LAST"
