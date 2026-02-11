#!/usr/bin/env bash
# no-bleed.sh: Scan for forbidden cousin-code keywords (blocks merges)
set -euo pipefail

echo "🔍 Scanning for forbidden cousin-code keywords..."

# Define forbidden keywords that indicate code from other projects
FORBIDDEN_KEYWORDS=(
  "radiohectic"
  "hectictv"
  "blackmoss"
  "piing"
  "liquidsoap"
  "icecast"
)

# Files to scan (code only, not docs)
FILES_TO_SCAN=$(find client server shared -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) 2>/dev/null || true)

FOUND_VIOLATIONS=0

for keyword in "${FORBIDDEN_KEYWORDS[@]}"; do
  if echo "$FILES_TO_SCAN" | xargs grep -in "$keyword" 2>/dev/null; then
    echo "❌ BLEED DETECTED: Found forbidden keyword '$keyword'"
    FOUND_VIOLATIONS=1
  fi
done

if [ $FOUND_VIOLATIONS -eq 1 ]; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ COUSIN-CODE BLEED DETECTED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Code from other projects detected in this repository."
  echo "This violates the zero-bleed policy."
  echo ""
  echo "Action: Remove all references to other projects"
  echo "        from production code files."
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi

echo "✅ No cousin-code bleed detected"
exit 0
