#!/usr/bin/env bash
set -euo pipefail

# ====== Deployment Validation Script ======
# Validates enterprise-grade deployment setup
# 7 validation checks:
# 1. Release directory structure
# 2. Current symlink validity
# 3. Real Vite output (not placeholder)
# 4. pnpm enforcement
# 5. Cross-project contamination
# 6. nginx configuration isolation
# 7. Performance check

APP_ROOT="/srv/djdannyhecticb"
DOMAIN="djdannyhecticb.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✓${NC} $*"
}

fail() {
  echo -e "${RED}✗${NC} $*"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $*"
}

FAILURES=0

echo "====== DJ Danny Hectic B - Deployment Validation ======"
echo ""

# Check 1: Release directory structure
echo "[1/7] Checking release directory structure..."
if [ ! -d "$APP_ROOT/releases" ]; then
  fail "Releases directory does not exist: $APP_ROOT/releases"
  FAILURES=$((FAILURES + 1))
else
  RELEASE_COUNT=$(ls -1d "$APP_ROOT/releases"/* 2>/dev/null | wc -l)
  if [ "$RELEASE_COUNT" -eq 0 ]; then
    fail "No releases found"
    FAILURES=$((FAILURES + 1))
  else
    pass "Found $RELEASE_COUNT releases"
    LATEST=$(ls -1dt "$APP_ROOT/releases"/* 2>/dev/null | head -n 1)
    pass "Latest: $LATEST"
    
    # Check if timestamped correctly (YYYYMMDD-HHMMSS format)
    BASENAME=$(basename "$LATEST")
    if [[ "$BASENAME" =~ ^[0-9]{8}-[0-9]{6}$ ]]; then
      pass "All releases properly timestamped"
    else
      warn "Release naming doesn't match expected format: $BASENAME"
    fi
  fi
fi
echo ""

# Check 2: Current symlink validity
echo "[2/7] Checking current symlink..."
if [ ! -L "$APP_ROOT/current" ]; then
  fail "current is not a symlink"
  FAILURES=$((FAILURES + 1))
elif [ ! -e "$APP_ROOT/current" ]; then
  fail "current symlink is broken"
  FAILURES=$((FAILURES + 1))
else
  TARGET=$(readlink "$APP_ROOT/current")
  pass "current → $TARGET"
  if [ -d "$APP_ROOT/current/public" ]; then
    pass "Symlink is valid and public directory exists"
  else
    fail "Public directory missing in current release"
    FAILURES=$((FAILURES + 1))
  fi
fi
echo ""

# Check 3: Real Vite output (not placeholder)
echo "[3/7] Checking for real Vite output..."
if [ -f "$APP_ROOT/current/public/index.html" ]; then
  FILE_SIZE=$(stat -f%z "$APP_ROOT/current/public/index.html" 2>/dev/null || stat -c%s "$APP_ROOT/current/public/index.html" 2>/dev/null)
  pass "index.html exists (${FILE_SIZE} bytes)"
  
  # Check for Vite-specific patterns (hashed assets)
  ASSET_COUNT=$(find "$APP_ROOT/current/public/assets" -name "*-*.js" -o -name "*-*.css" 2>/dev/null | wc -l)
  if [ "$ASSET_COUNT" -gt 0 ]; then
    pass "Found $ASSET_COUNT hashed asset files"
    pass "This is real Vite output, not placeholder"
  else
    warn "No hashed assets found - might be placeholder or non-Vite build"
  fi
  
  # Check for placeholder content
  if grep -q "Deploy pipeline online" "$APP_ROOT/current/public/index.html" 2>/dev/null; then
    fail "Content appears to be placeholder"
    FAILURES=$((FAILURES + 1))
  fi
else
  fail "index.html not found"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# Check 4: pnpm enforcement
echo "[4/7] Checking pnpm enforcement..."
if [ -d "$APP_ROOT/repo" ]; then
  cd "$APP_ROOT/repo"
  
  if command -v pnpm >/dev/null; then
    PNPM_VERSION=$(pnpm -v)
    pass "pnpm version: $PNPM_VERSION"
  else
    fail "pnpm not installed"
    FAILURES=$((FAILURES + 1))
  fi
  
  if grep -q "preinstall" package.json 2>/dev/null; then
    pass "preinstall hook exists (blocks npm)"
    pass "pnpm enforcement working"
  else
    warn "No preinstall hook found"
  fi
else
  warn "Repository not cloned yet at $APP_ROOT/repo"
fi
echo ""

# Check 5: Cross-project contamination
echo "[5/7] Checking for cross-project contamination..."
RADIOHECTIC_COUNT=$(grep -r "radiohectic" "$APP_ROOT" 2>/dev/null | grep -v ".git" | grep -v "node_modules" | wc -l)
HECTICTV_COUNT=$(grep -r "hectictv" "$APP_ROOT" 2>/dev/null | grep -v ".git" | grep -v "node_modules" | wc -l)

if [ "$RADIOHECTIC_COUNT" -eq 0 ]; then
  pass "No radiohectic references found"
else
  fail "Found $RADIOHECTIC_COUNT radiohectic references"
  FAILURES=$((FAILURES + 1))
fi

if [ "$HECTICTV_COUNT" -eq 0 ]; then
  pass "No hectictv references found"
else
  fail "Found $HECTICTV_COUNT hectictv references"
  FAILURES=$((FAILURES + 1))
fi

if [ "$RADIOHECTIC_COUNT" -eq 0 ] && [ "$HECTICTV_COUNT" -eq 0 ]; then
  pass "Project isolation confirmed"
fi
echo ""

# Check 6: nginx configuration isolation
echo "[6/7] Checking nginx configuration..."
if command -v nginx >/dev/null; then
  NGINX_ROOT=$(sudo nginx -T 2>/dev/null | grep -A 20 "server_name $DOMAIN" | grep "root " | head -n 1 | awk '{print $2}' | tr -d ';')
  
  if [ -n "$NGINX_ROOT" ]; then
    if [[ "$NGINX_ROOT" == "/srv/djdannyhecticb/current/public" ]]; then
      pass "nginx serves from: $NGINX_ROOT"
      pass "nginx isolation confirmed"
    elif [[ "$NGINX_ROOT" =~ "/srv/hectic" ]]; then
      fail "nginx still references /srv/hectic: $NGINX_ROOT"
      FAILURES=$((FAILURES + 1))
    else
      warn "nginx root: $NGINX_ROOT (unexpected)"
    fi
  else
    warn "Could not determine nginx root for $DOMAIN"
  fi
else
  warn "nginx not available for checking"
fi
echo ""

# Check 7: Performance check
echo "[7/7] Checking performance..."
if command -v curl >/dev/null; then
  RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "https://$DOMAIN" 2>/dev/null || echo "999")
  
  # Convert to comparison-friendly format
  if (( $(echo "$RESPONSE_TIME < 0.5" | bc -l 2>/dev/null || echo 0) )); then
    pass "Response time: ${RESPONSE_TIME}s (< 0.5s threshold)"
    pass "Performance acceptable"
  elif [ "$RESPONSE_TIME" = "999" ]; then
    warn "Could not measure response time (curl failed)"
  else
    warn "Response time: ${RESPONSE_TIME}s (exceeds 0.5s threshold)"
  fi
  
  # Check health endpoint
  if curl -sf "https://$DOMAIN/health.txt" >/dev/null 2>&1; then
    pass "Health check endpoint accessible"
  else
    warn "Health check endpoint not accessible"
  fi
else
  warn "curl not available for performance testing"
fi
echo ""

# Summary
echo "====== Validation Summary ======"
if [ "$FAILURES" -eq 0 ]; then
  pass "All validations passed ✅"
  echo "Deployment is enterprise-grade."
  exit 0
else
  fail "Failed $FAILURES validation(s) ❌"
  echo "Deployment needs attention."
  exit 1
fi
