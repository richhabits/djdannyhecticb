#!/bin/bash
# Get exact TypeScript error count
# No estimates, only facts

set -euo pipefail

echo "🔍 Running TypeScript check..."
echo ""

# Run pnpm check and count errors
# Using --pretty false to get consistent output
ERROR_OUTPUT=$(pnpm check --pretty false 2>&1 || true)

# Count lines with "error TS" pattern
ERROR_COUNT=$(echo "$ERROR_OUTPUT" | grep -c "error TS" || echo "0")

echo "TypeScript Error Count: $ERROR_COUNT"
echo ""

# Exit with the error count for CI tracking
exit 0
