#!/usr/bin/env bash
#
# Live Smoke Test - Tests ACTUAL LIVE DOMAIN
# Returns: 0 (all pass) or 1 (any fail)
# Output: Test results with PASS/FAIL

set -euo pipefail

DOMAIN="${1:-https://djdannyhecticb.com}"
TIMESTAMP=$(date -Iseconds)

echo "====== LIVE SMOKE TEST ======"
echo "Domain: $DOMAIN"
echo "Time: $TIMESTAMP"
echo ""

PASS=0
FAIL=0

test_url() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    echo -n "[$name] Testing $url ... "
    
    if HTTP_CODE=$(curl -sSL -w "%{http_code}" -o /dev/null --max-time 10 "$url" 2>/dev/null); then
        if [ "$HTTP_CODE" = "$expected_code" ]; then
            echo "✓ PASS (HTTP $HTTP_CODE)"
            ((PASS++))
            return 0
        else
            echo "✗ FAIL (HTTP $HTTP_CODE, expected $expected_code)"
            ((FAIL++))
            return 1
        fi
    else
        echo "✗ FAIL (Connection failed)"
        ((FAIL++))
        return 1
    fi
}

test_content() {
    local name="$1"
    local url="$2"
    local pattern="$3"
    
    echo -n "[$name] Checking content at $url ... "
    
    if CONTENT=$(curl -sSL --max-time 10 "$url" 2>/dev/null); then
        if echo "$CONTENT" | grep -q "$pattern"; then
            echo "✓ PASS (found: $pattern)"
            ((PASS++))
            return 0
        else
            echo "✗ FAIL (missing: $pattern)"
            ((FAIL++))
            return 1
        fi
    else
        echo "✗ FAIL (Connection failed)"
        ((FAIL++))
        return 1
    fi
}

test_ssl() {
    local domain_only=$(echo "$DOMAIN" | sed 's|https://||' | sed 's|/.*||')
    echo -n "[SSL] Checking TLS certificate ... "
    
    if echo | openssl s_client -servername "$domain_only" -connect "$domain_only:443" -brief 2>/dev/null | grep -q "Verification: OK"; then
        echo "✓ PASS"
        ((PASS++))
        return 0
    else
        echo "✗ FAIL"
        ((FAIL++))
        return 1
    fi
}

test_header() {
    local name="$1"
    local url="$2"
    local header="$3"
    
    echo -n "[$name] Checking header '$header' ... "
    
    if HEADERS=$(curl -sSL -I --max-time 10 "$url" 2>/dev/null); then
        if echo "$HEADERS" | grep -qi "^$header:"; then
            echo "✓ PASS"
            ((PASS++))
            return 0
        else
            echo "✗ FAIL (header missing)"
            ((FAIL++))
            return 1
        fi
    else
        echo "✗ FAIL (Connection failed)"
        ((FAIL++))
        return 1
    fi
}

# Run tests
echo "=== Core Tests ==="
test_url "Homepage" "$DOMAIN/" "200"
test_url "Health" "$DOMAIN/health.txt" "200"
test_url "Version API" "$DOMAIN/api/trpc/system.version" "200"

echo ""
echo "=== Content Tests ==="
test_content "Vite Build" "$DOMAIN/" "<!doctype html"
test_content "Assets" "$DOMAIN/" "/assets/index-"

echo ""
echo "=== Deployment Verification ==="
echo -n "[Commit SHA] Checking deployed version ... "
if VERSION_DATA=$(curl -sSL --max-time 10 "$DOMAIN/api/trpc/system.version" 2>/dev/null); then
    DEPLOYED_SHA=$(echo "$VERSION_DATA" | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    if [ -n "$DEPLOYED_SHA" ] && [ "$DEPLOYED_SHA" != "unknown" ]; then
        echo "✓ PASS"
        echo "  Deployed SHA: $DEPLOYED_SHA"
        ((PASS++))
        
        # If git is available, compare
        if command -v git &> /dev/null && [ -d .git ]; then
            CURRENT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
            if [ "$DEPLOYED_SHA" = "$CURRENT_SHA" ]; then
                echo "  ✓ Matches current HEAD"
            else
                echo "  ⚠ Differs from current HEAD: $CURRENT_SHA"
            fi
        fi
    else
        echo "✗ FAIL (No commit SHA)"
        ((FAIL++))
    fi
else
    echo "✗ FAIL (Cannot fetch version)"
    ((FAIL++))
fi

echo ""
echo "=== Security Tests ==="
test_ssl
test_header "Content-Type" "$DOMAIN/" "content-type"

echo ""
echo "=== Results ==="
echo "PASSED: $PASS"
echo "FAILED: $FAIL"
echo ""

if [ $FAIL -gt 0 ]; then
    echo "❌ SMOKE TEST FAILED"
    exit 1
else
    echo "✅ SMOKE TEST PASSED"
    exit 0
fi
