#!/usr/bin/env bash
#
# PROOF PACK PRE-DEPLOY VERIFICATION v2.0
# Enterprise-grade deployment gate with HSTS enforcement
# 
# COPYRIGHT NOTICE
# Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
# All rights reserved.
#
set -euo pipefail

# Configuration
REPORT_DIR="proofpacks"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REPORT="${REPORT_DIR}/proofpack-${STAMP}.txt"
EXIT_CODE=0

# All domains from nginx.conf (no subdomains in this stack)
DOMAINS=(
  "djdannyhecticb.co.uk"
  "www.djdannyhecticb.co.uk"
  "djdannyhecticb.com"
  "www.djdannyhecticb.com"
  "djdannyhecticb.info"
  "www.djdannyhecticb.info"
  "djdannyhecticb.uk"
  "www.djdannyhecticb.uk"
)

# Primary domain for rate limit testing
PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-djdannyhecticb.co.uk}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

mkdir -p "$REPORT_DIR"

log() { echo -e "[$(date -u +%H:%M:%S)] $*" | tee -a "$REPORT"; }
pass() { echo -e "${GREEN}✓${NC} $*" | tee -a "$REPORT"; }
warn() { echo -e "${YELLOW}⚠${NC} $*" | tee -a "$REPORT"; }
fail() { echo -e "${RED}✗${NC} $*" | tee -a "$REPORT"; EXIT_CODE=1; }

header() {
  echo "" | tee -a "$REPORT"
  echo "════════════════════════════════════════════════════════════" | tee -a "$REPORT"
  echo "  $*" | tee -a "$REPORT"
  echo "════════════════════════════════════════════════════════════" | tee -a "$REPORT"
}

log "PROOF PACK v2.0 START ${STAMP}"
log "Report: ${REPORT}"

###############################################################################
header "1) HSTS GATE - All Domains Must Pass HTTPS Before Enabling HSTS"
###############################################################################

HSTS_SAFE=true
HTTPS_FAILURES=0

for domain in "${DOMAINS[@]}"; do
  log "Checking: ${domain}"
  
  # Test HTTPS handshake
  if curl -sI --connect-timeout 10 "https://${domain}" > /tmp/headers_$$.txt 2>&1; then
    HTTP_CODE=$(head -1 /tmp/headers_$$.txt | awk '{print $2}')
    
    if [[ "$HTTP_CODE" =~ ^(200|301|302|303|307|308)$ ]]; then
      pass "${domain}: HTTPS OK (${HTTP_CODE})"
      
      # Check for existing HSTS (informational)
      if grep -qi "strict-transport-security" /tmp/headers_$$.txt; then
        log "  └─ HSTS already present"
      fi
    else
      fail "${domain}: HTTPS returned ${HTTP_CODE}"
      HSTS_SAFE=false
      ((HTTPS_FAILURES++))
    fi
  else
    fail "${domain}: HTTPS connection failed"
    HSTS_SAFE=false
    ((HTTPS_FAILURES++))
  fi
  
  rm -f /tmp/headers_$$.txt
done

log ""
if [ "$HSTS_SAFE" = true ]; then
  pass "HSTS GATE: All ${#DOMAINS[@]} domains have valid HTTPS"
  log "  → Safe to enable HSTS with includeSubDomains"
else
  fail "HSTS GATE: ${HTTPS_FAILURES}/${#DOMAINS[@]} domains failed HTTPS"
  log "  → DO NOT enable HSTS includeSubDomains until all pass"
  log "  → DO NOT add to preload list"
fi

###############################################################################
header "2) RATE LIMITER VERIFICATION"
###############################################################################

log "Scanning for intelLimiter wiring in server code..."

if [ -d "server" ]; then
  INTEL_WIRING=$(grep -rn "intelLimiter" server 2>/dev/null | grep -E "app\.use|router\.use" || true)
  
  if [ -n "$INTEL_WIRING" ]; then
    pass "intelLimiter is wired to Express routes:"
    echo "$INTEL_WIRING" | sed 's/^/  /' | tee -a "$REPORT"
    
    # Extract the exact path for testing
    INTEL_PATH=$(echo "$INTEL_WIRING" | grep -oE '"/api/trpc/[^"]+' | tr -d '"' | head -1)
    log "  Detected path: ${INTEL_PATH:-unknown}"
  else
    warn "intelLimiter exported but not wired to app.use()"
  fi
fi

###############################################################################
header "3) RATE LIMIT LOAD TEST (Optional - requires live server)"
###############################################################################

# Only run if explicitly requested
if [ "${RUN_RATE_TEST:-0}" = "1" ]; then
  log "Running rate limit test against raveIntel.list..."
  
  TEST_URL="https://${PRIMARY_DOMAIN}/api/trpc/raveIntel.list?input=%7B%7D"
  log "Target: ${TEST_URL}"
  
  # INTEL tier: 60 req/min, so 70 requests should trigger 429
  RESULTS=""
  for i in $(seq 1 70); do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$TEST_URL" 2>/dev/null || echo "000")
    RESULTS="${RESULTS}${CODE}\n"
    # Small delay to not overwhelm
    [ $((i % 10)) -eq 0 ] && log "  Progress: ${i}/70"
  done
  
  # Count 429s
  COUNT_429=$(echo -e "$RESULTS" | grep -c "429" || echo "0")
  COUNT_200=$(echo -e "$RESULTS" | grep -c "200" || echo "0")
  
  log "Results: ${COUNT_200} x 200, ${COUNT_429} x 429"
  
  if [ "$COUNT_429" -gt 0 ]; then
    pass "Rate limiting is working (got ${COUNT_429} x 429 responses)"
  else
    warn "No 429 responses received - rate limiter may not be in hot path"
  fi
else
  log "Rate limit load test skipped (set RUN_RATE_TEST=1 to enable)"
  log "Manual test command:"
  log "  for i in \$(seq 1 70); do curl -s -o /dev/null -w '%{http_code}\\n' 'https://${PRIMARY_DOMAIN}/api/trpc/raveIntel.list?input=%7B%7D'; done | sort | uniq -c"
fi

###############################################################################
header "4) COOKIE SECURITY CHECK"
###############################################################################

log "Testing cookie attributes..."

# Try to get Set-Cookie from an auth-like endpoint
COOKIE_HEADER=$(curl -sI "https://${PRIMARY_DOMAIN}/api/admin/auth/me" 2>/dev/null | grep -i "set-cookie" | head -1 || true)

if [ -n "$COOKIE_HEADER" ]; then
  log "Cookie: ${COOKIE_HEADER}"
  
  echo "$COOKIE_HEADER" | grep -qi "samesite=lax" && pass "SameSite=Lax (CSRF protection)" || \
  echo "$COOKIE_HEADER" | grep -qi "samesite=strict" && pass "SameSite=Strict" || \
  echo "$COOKIE_HEADER" | grep -qi "samesite=none" && warn "SameSite=None (cross-site)" || \
  warn "SameSite not set"
  
  echo "$COOKIE_HEADER" | grep -qi "httponly" && pass "HttpOnly flag present" || warn "HttpOnly missing"
  echo "$COOKIE_HEADER" | grep -qi "secure" && pass "Secure flag present" || warn "Secure missing"
else
  log "No Set-Cookie header on /api/admin/auth/me (may require login)"
fi

###############################################################################
header "5) SSL CERTIFICATE EXPIRY"
###############################################################################

log "Checking SSL certificate expiry for ${PRIMARY_DOMAIN}..."

CERT_INFO=$(echo | openssl s_client -servername "${PRIMARY_DOMAIN}" -connect "${PRIMARY_DOMAIN}:443" 2>/dev/null | openssl x509 -noout -dates -subject 2>/dev/null || true)

if [ -n "$CERT_INFO" ]; then
  EXPIRY=$(echo "$CERT_INFO" | grep notAfter | cut -d= -f2)
  SUBJECT=$(echo "$CERT_INFO" | grep subject | head -1)
  
  # Calculate days until expiry
  if command -v gdate >/dev/null 2>&1; then
    EXPIRY_EPOCH=$(gdate -d "$EXPIRY" +%s 2>/dev/null || echo "0")
  else
    EXPIRY_EPOCH=$(date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null || date -d "$EXPIRY" +%s 2>/dev/null || echo "0")
  fi
  NOW_EPOCH=$(date +%s)
  
  if [ "$EXPIRY_EPOCH" -gt 0 ]; then
    DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))
    
    if [ "$DAYS_LEFT" -gt 30 ]; then
      pass "SSL: ${DAYS_LEFT} days until expiry"
    elif [ "$DAYS_LEFT" -gt 14 ]; then
      warn "SSL: ${DAYS_LEFT} days until expiry (renew soon)"
    else
      fail "SSL: ${DAYS_LEFT} days until expiry (URGENT)"
    fi
    
    log "  Expiry: ${EXPIRY}"
    log "  ${SUBJECT}"
  else
    warn "Could not parse certificate expiry date"
  fi
else
  warn "Could not retrieve SSL certificate info"
fi

###############################################################################
header "6) ENVIRONMENT VALIDATION"
###############################################################################

log "Checking required environment variables..."

REQUIRED_VARS=("JWT_SECRET" "DATABASE_URL")
OPTIONAL_VARS=("INTEGRATIONS_MASTER_KEY" "STRIPE_SECRET_KEY" "NODE_ENV")

for var in "${REQUIRED_VARS[@]}"; do
  if grep -qE "^${var}=" .env.example 2>/dev/null || grep -qE "^${var}=" .env 2>/dev/null; then
    pass "${var}: documented"
  else
    warn "${var}: not found in .env.example"
  fi
done

for var in "${OPTIONAL_VARS[@]}"; do
  if grep -qE "^${var}=" .env.example 2>/dev/null || grep -qE "^${var}=" .env 2>/dev/null; then
    log "  ${var}: documented (optional)"
  fi
done

###############################################################################
header "7) TYPESCRIPT CHECK"
###############################################################################

if [ -f "package.json" ] && command -v npx >/dev/null 2>&1; then
  log "Running TypeScript check..."
  
  TS_OUTPUT=$(npx tsc --noEmit 2>&1 || true)
  TS_ERRORS=$(echo "$TS_OUTPUT" | grep -c "error TS" || echo "0")
  
  if [ "$TS_ERRORS" -eq 0 ]; then
    pass "TypeScript: Clean (0 errors)"
  elif [ "$TS_ERRORS" -lt 50 ]; then
    warn "TypeScript: ${TS_ERRORS} error(s) - within debt threshold"
  else
    warn "TypeScript: ${TS_ERRORS} error(s) - exceeds debt threshold (50)"
    log "  First 5 errors:"
    echo "$TS_OUTPUT" | grep "error TS" | head -5 | sed 's/^/    /' | tee -a "$REPORT"
  fi
else
  log "TypeScript check skipped (no package.json or npx)"
fi

###############################################################################
header "8) DOCKER HEALTH CHECK"
###############################################################################

if command -v docker >/dev/null 2>&1; then
  CONTAINERS=$(docker ps --format "{{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true)
  
  if [ -n "$CONTAINERS" ]; then
    log "Running containers:"
    echo "$CONTAINERS" | while IFS=$'\t' read -r name status ports; do
      if echo "$status" | grep -qi "healthy\|up"; then
        pass "  ${name}: ${status}"
      else
        warn "  ${name}: ${status}"
      fi
    done
  else
    log "No running Docker containers"
  fi
  
  # Check for restart loops
  RESTARTING=$(docker ps --filter 'status=restarting' --format '{{.Names}}' 2>/dev/null | wc -l | tr -d ' ')
  if [ "$RESTARTING" -gt 0 ]; then
    fail "Restart loops detected: ${RESTARTING} container(s)"
  fi
else
  log "Docker not available"
fi

###############################################################################
header "PROOF PACK SUMMARY"
###############################################################################

log ""
log "═══════════════════════════════════════════════════════════════"

if [ $EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}" | tee -a "$REPORT"
  echo -e "${GREEN}║  DEPLOYMENT GATE: OPEN                                         ║${NC}" | tee -a "$REPORT"
  echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}" | tee -a "$REPORT"
  log ""
  log "All critical checks passed. Safe to deploy."
else
  echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗${NC}" | tee -a "$REPORT"
  echo -e "${RED}║  DEPLOYMENT GATE: BLOCKED                                      ║${NC}" | tee -a "$REPORT"
  echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}" | tee -a "$REPORT"
  log ""
  log "Critical checks failed. Review errors before deploying."
fi

log ""
log "Full report: ${REPORT}"
log "PROOF PACK END ${STAMP}"

exit $EXIT_CODE
