#!/bin/bash
# analyze-product-truth.sh
# Systematically analyze router drift and build product decisions table

set -euo pipefail

echo "=== PHASE 1: Building Product Truth Table ==="
echo ""

# 1. Extract routers from server/routers.ts
echo "## Existing Routers in server/routers.ts"
echo ""
grep -A 200 "export const appRouter = router({" server/routers.ts | grep -E "^\s+[a-zA-Z_][a-zA-Z0-9_]*:" | sed 's/://g' | awk '{print $1}' | sort -u | head -50
echo ""

# 2. Extract routes from App.tsx
echo "## Routed Pages in App.tsx"
echo ""
grep -E "<Route path=|<Route element=" client/src/App.tsx | grep -v "^[[:space:]]*\/\/" | head -100
echo ""

# 3. Find all page files that import trpc
echo "## Pages Using TRPC"
echo ""
find client/src/pages -name "*.tsx" -exec grep -l "trpc\." {} \; | sort | head -100
echo ""

echo "=== Analysis Complete ==="
