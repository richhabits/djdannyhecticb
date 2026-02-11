#!/bin/bash
# Router Drift Check
# Prevents pages from calling non-existent tRPC routers

set -euo pipefail

echo "🔍 Checking for router drift..."
echo ""

# Extract router keys from server/routers.ts
# Parse the router({ ... }) declaration
ROUTER_FILE="server/routers.ts"

if [ ! -f "$ROUTER_FILE" ]; then
  echo "❌ ERROR: $ROUTER_FILE not found"
  exit 1
fi

# Extract router keys from the appRouter definition
# Look for patterns like: routerName: routerValue,
ROUTERS=$(grep -A 100 "export const appRouter = router({" "$ROUTER_FILE" | \
  grep -E "^\s+[a-zA-Z][a-zA-Z0-9]*:" | \
  sed 's/^\s*//' | \
  sed 's/:.*//' | \
  sort -u)

if [ -z "$ROUTERS" ]; then
  echo "❌ ERROR: Could not parse routers from $ROUTER_FILE"
  exit 1
fi

echo "✅ Found $(echo "$ROUTERS" | wc -l) routers in server/routers.ts"
echo ""

# Check client pages for trpc.* usage
PAGES_DIR="client/src/pages"

if [ ! -d "$PAGES_DIR" ]; then
  echo "❌ ERROR: $PAGES_DIR not found"
  exit 1
fi

# Find all trpc.* references in pages
# Format: filename:line:trpc.routerName.method
VIOLATIONS=""

while IFS= read -r file; do
  if [ -f "$file" ]; then
    # Look for trpc.routerName patterns
    while IFS= read -r line_content; do
      # Extract router name from trpc.routerName pattern
      router_name=$(echo "$line_content" | grep -oP 'trpc\.\K[a-zA-Z][a-zA-Z0-9]*' | head -1)
      
      if [ -n "$router_name" ]; then
        # Check if router exists
        if ! echo "$ROUTERS" | grep -q "^${router_name}$"; then
          line_num=$(echo "$line_content" | cut -d: -f1)
          VIOLATIONS="${VIOLATIONS}${file}:${line_num}: trpc.${router_name}\n"
        fi
      fi
    done < <(grep -n "trpc\." "$file" 2>/dev/null || true)
  fi
done < <(find "$PAGES_DIR" -name "*.tsx" -o -name "*.ts")

# Report results
if [ -n "$VIOLATIONS" ]; then
  echo "❌ Router drift detected!"
  echo ""
  echo "The following pages reference routers that don't exist in $ROUTER_FILE:"
  echo ""
  echo -e "$VIOLATIONS"
  echo ""
  echo "Available routers:"
  echo "$ROUTERS" | sed 's/^/  - /'
  echo ""
  echo "Fix by either:"
  echo "  1. Implementing the router in $ROUTER_FILE"
  echo "  2. Deleting the page if it's not needed"
  echo "  3. Using an existing router instead"
  echo ""
  exit 1
else
  echo "✅ No router drift detected"
  echo "All trpc.* references are valid"
  exit 0
fi
