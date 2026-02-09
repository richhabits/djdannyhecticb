#!/bin/bash
# Production Verification Script
# One-command helper to verify production readiness

set -e

echo "=============================================="
echo "🚀 PRODUCTION VERIFICATION"
echo "=============================================="
echo ""
echo "Running all pre-deployment checks..."
echo ""

FAILED=0

# Step 1: Boundary Audit
echo "Step 1/4: Running boundary audit..."
if ./scripts/boundary-audit.sh > /dev/null 2>&1; then
  echo "   ✅ Boundary audit PASSED"
else
  echo "   ❌ Boundary audit FAILED"
  echo "   Run: ./scripts/boundary-audit.sh"
  FAILED=1
fi
echo ""

# Step 2: TypeScript Check
echo "Step 2/4: Running TypeScript check..."
if pnpm check > /dev/null 2>&1; then
  echo "   ✅ TypeScript check PASSED (0 errors)"
else
  echo "   ❌ TypeScript check FAILED"
  echo "   Run: pnpm check"
  FAILED=1
fi
echo ""

# Step 3: Build
echo "Step 3/4: Running production build..."
if pnpm build > /dev/null 2>&1; then
  echo "   ✅ Production build SUCCEEDED"
  
  # Check build artifacts
  if [ -f "dist/index.mjs" ] && [ -d "dist/public" ]; then
    SERVER_SIZE=$(du -h dist/index.mjs | cut -f1)
    echo "      Server bundle: $SERVER_SIZE"
    
    CLIENT_SIZE=$(du -sh dist/public | cut -f1)
    echo "      Client assets: $CLIENT_SIZE"
  fi
else
  echo "   ❌ Production build FAILED"
  echo "   Run: pnpm build"
  FAILED=1
fi
echo ""

# Step 4: Smoke Test (Local)
echo "Step 4/4: Running local smoke test..."
echo "   ℹ️  Note: This tests against localhost:3000"
echo "   ℹ️  For production smoke test, run: BASE_URL=https://djdannyhecticb.co.uk ./scripts/smoke-prod.sh"
echo ""

# Quick local check if server is running
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
  echo "   ✅ Local server is running and healthy"
  
  # Run quick smoke tests
  if [ -x "./scripts/smoke-prod.sh" ]; then
    BASE_URL="http://localhost:3000" ./scripts/smoke-prod.sh > /dev/null 2>&1 && \
      echo "   ✅ Local smoke tests PASSED" || \
      echo "   ⚠️  Some local smoke tests failed (check manually)"
  fi
else
  echo "   ℹ️  Local server not running (expected during CI)"
  echo "   ℹ️  To test locally: pnpm dev (in separate terminal)"
fi
echo ""

# Summary
echo "=============================================="
echo "📊 VERIFICATION SUMMARY"
echo "=============================================="
echo ""

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED"
  echo ""
  echo "Production readiness verified:"
  echo "  ✓ Boundary audit clean"
  echo "  ✓ TypeScript compiles"
  echo "  ✓ Production build succeeds"
  echo "  ✓ No violations detected"
  echo ""
  echo "Next steps:"
  echo "  1. Review DEPLOYMENT_CHECKLIST.md"
  echo "  2. Verify DNS configuration"
  echo "  3. Deploy using documented procedure"
  echo "  4. Run: BASE_URL=https://djdannyhecticb.co.uk ./scripts/smoke-prod.sh"
  echo ""
  exit 0
else
  echo "❌ VERIFICATION FAILED"
  echo ""
  echo "Fix the failed checks above before deploying."
  echo "Review output and resolve issues."
  echo ""
  exit 1
fi
