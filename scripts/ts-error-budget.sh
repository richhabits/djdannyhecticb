#!/bin/bash

# TypeScript Error Budget Script (Hardened)
# Fails if new TypeScript errors are introduced above baseline
#
# Features:
# - Strict error handling (set -euo pipefail)
# - Guards against NaN/empty counts
# - Locale-independent grep
# - Deterministic error counting
# - Clear error messages

set -euo pipefail

BASELINE_FILE=".ts-error-baseline"
REPORT_FILE="ts-errors-report.txt"

echo "🔍 Running TypeScript error budget check..."
echo ""

# Run TypeScript check (use tsc directly for consistency)
echo "Running tsc --noEmit..."
TSC_OUTPUT=$(npx --yes tsc --noEmit 2>&1 || true)

# Count errors with locale-independent grep
ERROR_COUNT=$(echo "$TSC_OUTPUT" | LC_ALL=C grep -c "error TS" || echo "0")

# GUARD: Validate error count is a valid integer
if ! [[ "$ERROR_COUNT" =~ ^[0-9]+$ ]]; then
  echo "❌ ERROR: Could not parse error count (got: '$ERROR_COUNT')"
  echo "This usually means TypeScript failed for reasons other than type errors."
  echo ""
  echo "TypeScript output (first 50 lines):"
  echo "$TSC_OUTPUT" | head -50
  exit 1
fi

echo "📊 Current error count: $ERROR_COUNT"

# GUARD: Check if baseline exists
if [ ! -f "$BASELINE_FILE" ]; then
  echo "⚠️  No baseline found. Creating baseline with $ERROR_COUNT errors."
  echo "$ERROR_COUNT" > "$BASELINE_FILE"
  echo "✅ Baseline created. Future runs will enforce no increase."
  exit 0
fi

# Read baseline and strip any whitespace/newlines
BASELINE=$(cat "$BASELINE_FILE" | tr -d ' \t\n\r')

# GUARD: Validate baseline is a valid integer
if ! [[ "$BASELINE" =~ ^[0-9]+$ ]]; then
  echo "❌ ERROR: Baseline file is corrupted (got: '$BASELINE')"
  echo "Expected a single integer in $BASELINE_FILE"
  exit 1
fi

echo "📌 Baseline error count: $BASELINE"
echo ""

# Generate detailed report
echo "📝 Generating error report..."
echo "$TSC_OUTPUT" | LC_ALL=C grep "error TS" | awk -F: '{print $1}' | sort | uniq -c | sort -rn > "$REPORT_FILE" 2>/dev/null || echo "No errors to report" > "$REPORT_FILE"

# Compare counts
if [ "$ERROR_COUNT" -gt "$BASELINE" ]; then
  DIFF=$((ERROR_COUNT - BASELINE))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ FAILED: TypeScript errors INCREASED by $DIFF"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Current:  $ERROR_COUNT errors"
  echo "  Baseline: $BASELINE errors"
  echo "  Diff:     +$DIFF errors"
  echo ""
  echo "Top error locations:"
  head -20 "$REPORT_FILE"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Action required:"
  echo "  1. Fix the new TypeScript errors, OR"
  echo "  2. If intentional, update baseline with 'allow-baseline-bump' label"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
elif [ "$ERROR_COUNT" -lt "$BASELINE" ]; then
  IMPROVEMENT=$((BASELINE - ERROR_COUNT))
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎉 IMPROVED: Reduced errors by $IMPROVEMENT"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Previous: $BASELINE errors"
  echo "  Current:  $ERROR_COUNT errors"
  echo "  Fixed:    -$IMPROVEMENT errors"
  echo ""
  echo "✅ Updating baseline from $BASELINE to $ERROR_COUNT"
  echo "$ERROR_COUNT" > "$BASELINE_FILE"
  echo ""
  echo "Great work! 🚀"
  exit 0
else
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ PASSED: Error count unchanged"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  Baseline: $BASELINE errors"
  echo "  Current:  $ERROR_COUNT errors"
  echo "  Status:   No change (budget maintained)"
  echo ""
  exit 0
fi
