#!/usr/bin/env bash
set -euo pipefail

# Block common key patterns and accidental env commits
if git diff --cached --name-only | grep -E '(^|/)\.env($|\.)' >/dev/null; then
  echo "ERROR: .env file staged. Unstage it."
  exit 1
fi

# Add your key patterns here (examples)
PATTERNS=(
  "TICKETMASTER"
  "sk_live_"
  "sk_test_"
  "BEGIN PRIVATE KEY"
)

for p in "${PATTERNS[@]}"; do
  if git diff --cached | grep -n "$p" >/dev/null 2>&1; then
    echo "ERROR: Potential secret in staged diff: $p"
    exit 1
  fi
done

echo "Secrets guard: OK"
