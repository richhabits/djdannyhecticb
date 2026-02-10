#!/bin/bash

# TypeScript Error Budget Script
# Fails if new TypeScript errors are introduced above baseline

set -e

BASELINE_FILE=".ts-error-baseline"
REPORT_FILE="ts-errors-report.txt"

echo "🔍 Running TypeScript error budget check..."

# Run tsc and capture errors
echo "Running tsc --noEmit..."
TSC_OUTPUT=$(npx tsc --noEmit 2>&1 || true)

# Count errors
ERROR_COUNT=$(echo "$TSC_OUTPUT" | grep -c "error TS" || echo "0")

echo "📊 Current error count: $ERROR_COUNT"

# Check if baseline exists
if [ ! -f "$BASELINE_FILE" ]; then
  echo "⚠️  No baseline found. Creating baseline with $ERROR_COUNT errors."
  echo "$ERROR_COUNT" > "$BASELINE_FILE"
  echo "✅ Baseline created. Future runs will enforce no increase."
  exit 0
fi

# Read baseline
BASELINE=$(cat "$BASELINE_FILE")
echo "📌 Baseline error count: $BASELINE"

# Generate detailed report
echo "📝 Generating error report..."
echo "$TSC_OUTPUT" | grep "error TS" | awk -F: '{print $1}' | sort | uniq -c | sort -rn > "$REPORT_FILE" || true

# Compare
if [ "$ERROR_COUNT" -gt "$BASELINE" ]; then
  DIFF=$((ERROR_COUNT - BASELINE))
  echo "❌ FAILED: TypeScript errors increased by $DIFF"
  echo ""
  echo "Current: $ERROR_COUNT errors"
  echo "Baseline: $BASELINE errors"
  echo ""
  echo "Top error locations:"
  head -20 "$REPORT_FILE"
  echo ""
  echo "Fix these errors or update the baseline if intentional."
  exit 1
elif [ "$ERROR_COUNT" -lt "$BASELINE" ]; then
  IMPROVEMENT=$((BASELINE - ERROR_COUNT))
  echo "🎉 IMPROVED: Reduced errors by $IMPROVEMENT"
  echo "Updating baseline from $BASELINE to $ERROR_COUNT"
  echo "$ERROR_COUNT" > "$BASELINE_FILE"
  exit 0
else
  echo "✅ PASSED: Error count unchanged ($ERROR_COUNT)"
  exit 0
fi
