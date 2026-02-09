#!/bin/bash
# Boundary Audit Script
# Checks for violations of architectural boundary policy
# Run quarterly or before major deployments

set -e

echo "=============================================="
echo "🛡️  ARCHITECTURAL BOUNDARY AUDIT"
echo "=============================================="
echo ""
echo "Repository: richhabits/djdannyhecticb"
echo "Policy: BOUNDARY_POLICY.md"
echo "Date: $(date)"
echo ""

VIOLATIONS=0

# 1. Check package.json for forbidden dependencies
echo "1. Checking package.json for forbidden dependencies..."
if cat package.json | grep -i "\"@piing\|\"@hectictv\|\"@hecticradio" > /dev/null 2>&1; then
  echo "   ⚠️  VIOLATION: Found forbidden package dependencies"
  cat package.json | grep -i "\"@piing\|\"@hectictv\|\"@hecticradio"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No forbidden dependencies"
fi
echo ""

# 2. Check environment variables
echo "2. Checking environment variables..."
if grep -i "piing_\|hectictv_\|shared_" .env.example docker-compose.yml > /dev/null 2>&1; then
  echo "   ⚠️  VIOLATION: Found forbidden environment variables"
  grep -i "piing_\|hectictv_\|shared_" .env.example docker-compose.yml
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No forbidden environment variables"
fi

# Note: HECTIC_RADIO_STREAM_URL is allowed (external stream URL)
if grep "VITE_HECTIC_RADIO_STREAM_URL" .env.example > /dev/null 2>&1; then
  echo "   ℹ️  Note: VITE_HECTIC_RADIO_STREAM_URL found (allowed - external stream)"
fi
echo ""

# 3. Check database references
echo "3. Checking database references..."
if grep -r "piing\." drizzle/ server/ 2>/dev/null | grep -v "node_modules" > /dev/null; then
  echo "   ⚠️  VIOLATION: Found cross-property database references"
  grep -r "piing\." drizzle/ server/ 2>/dev/null | grep -v "node_modules"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No cross-property database references"
fi
echo ""

# 4. Check imports
echo "4. Checking imports from other properties..."
if grep -r "from ['\"]@piing\|from ['\"]@hectictv" client/ server/ shared/ 2>/dev/null | grep -v "node_modules" > /dev/null; then
  echo "   ⚠️  VIOLATION: Found imports from other properties"
  grep -r "from ['\"]@piing\|from ['\"]@hectictv" client/ server/ shared/ 2>/dev/null | grep -v "node_modules"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No forbidden imports"
fi
echo ""

# 5. Check Docker configuration
echo "5. Checking Docker configuration..."
if grep -i "piing-\|hectictv-\|external: true" docker-compose.yml > /dev/null 2>&1; then
  echo "   ⚠️  VIOLATION: Found shared Docker services or networks"
  grep -i "piing-\|hectictv-\|external: true" docker-compose.yml
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No shared Docker infrastructure"
fi
echo ""

# 6. Check git submodules
echo "6. Checking git submodules..."
if [ -f .gitmodules ]; then
  echo "   ⚠️  WARNING: .gitmodules file detected"
  cat .gitmodules
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo "   ✅ Clean - No git submodules"
fi
echo ""

# 7. Check for shared auth references
echo "7. Checking for shared authentication..."
if grep -ri "sso\|single.sign.on\|shared.*auth\|shared.*session" server/ 2>/dev/null | grep -v "node_modules" | grep -v "comment" > /dev/null; then
  echo "   ⚠️  WARNING: Potential shared auth references found"
  grep -ri "sso\|single.sign.on\|shared.*auth" server/ 2>/dev/null | grep -v "node_modules" | grep -v "comment" | head -5
  echo "   (Review manually - may be false positive)"
else
  echo "   ✅ Clean - No shared authentication detected"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 AUDIT SUMMARY"
echo "=============================================="
if [ $VIOLATIONS -eq 0 ]; then
  echo "✅ PASS - No boundary violations detected"
  echo ""
  echo "The architectural boundary is maintained."
  echo "This repository is standalone and independent."
  exit 0
else
  echo "❌ FAIL - ${VIOLATIONS} violation(s) detected"
  echo ""
  echo "ACTION REQUIRED:"
  echo "1. Review violations listed above"
  echo "2. Consult BOUNDARY_POLICY.md for rules"
  echo "3. Remove or refactor violations"
  echo "4. Re-run this audit"
  echo ""
  echo "For architectural exceptions, see ARCHITECTURE_GUARDRAILS.md"
  exit 1
fi
