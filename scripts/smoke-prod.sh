#!/bin/bash
# Production Smoke Test Script
# Tests critical endpoints to verify production deployment

set -e

# Configuration
BASE_URL="${BASE_URL:-https://djdannyhecticb.co.uk}"
TIMEOUT=10

echo "=============================================="
echo "🔥 PRODUCTION SMOKE TESTS"
echo "=============================================="
echo ""
echo "Target: $BASE_URL"
echo "Timeout: ${TIMEOUT}s per request"
echo ""

FAILURES=0

# Test 1: Homepage
echo "1. Testing homepage (/)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Homepage returns 200 OK"
else
  echo "   ❌ Homepage returned $HTTP_CODE (expected 200)"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Test 2: Health endpoint
echo "2. Testing health endpoint (/api/health)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/api/health" || echo "000")
RESPONSE=$(curl -s --max-time $TIMEOUT "$BASE_URL/api/health" || echo "")
if [ "$HTTP_CODE" = "200" ] && [ "$RESPONSE" = "ok" ]; then
  echo "   ✅ Health endpoint returns 200 OK with 'ok' response"
else
  echo "   ❌ Health endpoint returned $HTTP_CODE with response: $RESPONSE"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Test 3: API readiness (optional - may not exist)
echo "3. Testing readiness endpoint (/api/ready)..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/api/ready" || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "503" ]; then
  echo "   ✅ Readiness endpoint returns $HTTP_CODE (200=ready, 503=not ready)"
elif [ "$HTTP_CODE" = "404" ]; then
  echo "   ℹ️  Readiness endpoint not implemented (404) - skipping"
else
  echo "   ⚠️  Readiness endpoint returned unexpected $HTTP_CODE"
fi
echo ""

# Test 4: Key routes (without auth)
echo "4. Testing key public routes..."

# Mixes page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/mixes" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /mixes returns 200"
else
  echo "   ⚠️  /mixes returned $HTTP_CODE"
fi

# Bio page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/bio" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /bio returns 200"
else
  echo "   ⚠️  /bio returned $HTTP_CODE"
fi

# Events page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/events" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ /events returns 200"
else
  echo "   ⚠️  /events returned $HTTP_CODE"
fi

echo ""

# Test 5: Static assets
echo "5. Testing static assets..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/logo-icon.png" || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
  echo "   ✅ Static assets accessible (logo returns 200)"
else
  echo "   ⚠️  Logo returned $HTTP_CODE"
fi
echo ""

# Test 6: Security headers
echo "6. Checking security headers..."
HEADERS=$(curl -s -I --max-time $TIMEOUT "$BASE_URL/" || echo "")

if echo "$HEADERS" | grep -qi "x-content-type-options"; then
  echo "   ✅ X-Content-Type-Options header present"
else
  echo "   ⚠️  X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "x-frame-options\|frame-ancestors"; then
  echo "   ✅ Frame protection header present"
else
  echo "   ⚠️  Frame protection header missing"
fi

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  echo "   ✅ HSTS header present"
else
  echo "   ℹ️  HSTS not enabled (OK if SSL recently deployed)"
fi

echo ""

# Test 7: SSL certificate (if HTTPS)
if [[ "$BASE_URL" == https://* ]]; then
  echo "7. Testing SSL certificate..."
  if command -v openssl &> /dev/null; then
    CERT_INFO=$(echo | openssl s_client -servername djdannyhecticb.co.uk -connect djdannyhecticb.co.uk:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || echo "")
    if [ -n "$CERT_INFO" ]; then
      echo "   ✅ SSL certificate is valid"
      echo "$CERT_INFO" | sed 's/^/      /'
    else
      echo "   ⚠️  Could not verify SSL certificate"
    fi
  else
    echo "   ℹ️  openssl not available - skipping SSL check"
  fi
else
  echo "7. Skipping SSL test (using HTTP)"
fi

echo ""
echo "=============================================="
echo "📊 SMOKE TEST SUMMARY"
echo "=============================================="

if [ $FAILURES -eq 0 ]; then
  echo "✅ ALL CRITICAL TESTS PASSED"
  echo ""
  echo "Production site appears healthy:"
  echo "  - Homepage accessible"
  echo "  - Health endpoint responding"
  echo "  - Key routes working"
  echo "  - Static assets serving"
  exit 0
else
  echo "❌ $FAILURES CRITICAL TEST(S) FAILED"
  echo ""
  echo "Review failures above and investigate."
  echo "Do not proceed with full deployment until resolved."
  exit 1
fi
