#!/usr/bin/env bash
#
# GO/NO-GO Deployment Checklist
# EXECUTES checks and reports RESULTS, not instructions

set -euo pipefail

DOMAIN="${1:-https://djdannyhecticb.com}"
TIMESTAMP=$(date -Iseconds)

echo "========================================="
echo "GO/NO-GO DEPLOYMENT CHECKLIST"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Time: $TIMESTAMP"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
TOTAL_CHECKS=11

check() {
    local name="$1"
    local command="$2"
    
    echo -n "[$name] "
    
    if eval "$command" > /dev/null 2>&1; then
        echo "✅ GO"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ NO-GO"
        ((FAIL_COUNT++))
        return 1
    fi
}

echo "=== BUILD CHECKS ==="
check "Build Clean" "git diff --quiet && git diff --cached --quiet"
check "Dependencies" "test -f pnpm-lock.yaml"
check "Build Works" "test -d dist/public && test -f dist/public/index.html"

echo ""
echo "=== LIVE DOMAIN CHECKS ==="
check "Homepage 200" "curl -sSL -o /dev/null -w '%{http_code}' --max-time 5 '$DOMAIN/' | grep -q '^200$'"
check "Health 200" "curl -sSL -o /dev/null -w '%{http_code}' --max-time 5 '$DOMAIN/health.txt' | grep -q '^200$'"
check "Not Placeholder" "! curl -sSL --max-time 5 '$DOMAIN/' | grep -q 'Ready for real deploy'"
check "Vite Build" "curl -sSL --max-time 5 '$DOMAIN/' | grep -q '<!doctype html'"
check "Hashed Assets" "curl -sSL --max-time 5 '$DOMAIN/' | grep -q '/assets/index-'"

echo ""
echo "=== SECURITY CHECKS ==="
check "HTTPS Working" "curl -sSL --max-time 5 '$DOMAIN/' > /dev/null"
check "TLS Valid" "echo | openssl s_client -servername $(echo $DOMAIN | sed 's|https://||' | sed 's|/.*||') -connect $(echo $DOMAIN | sed 's|https://||' | sed 's|/.*||'):443 -brief 2>/dev/null | grep -q 'Verification: OK'"

echo ""
echo "=== DEPLOYMENT VERIFICATION ==="
echo -n "[Commit SHA Match] "
if VERSION_DATA=$(curl -sSL --max-time 5 "$DOMAIN/api/trpc/system.version" 2>/dev/null); then
    DEPLOYED_SHA=$(echo "$VERSION_DATA" | grep -o '"commit":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    if [ -n "$DEPLOYED_SHA" ] && [ "$DEPLOYED_SHA" != "unknown" ]; then
        if command -v git &> /dev/null && [ -d .git ]; then
            CURRENT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
            if [ "$DEPLOYED_SHA" = "$CURRENT_SHA" ]; then
                echo "✅ GO (SHA: ${DEPLOYED_SHA:0:8})"
                ((PASS_COUNT++))
            else
                echo "❌ NO-GO (Deployed: ${DEPLOYED_SHA:0:8}, Current: ${CURRENT_SHA:0:8})"
                ((FAIL_COUNT++))
            fi
        else
            echo "✅ GO (SHA present: ${DEPLOYED_SHA:0:8}, cannot verify match)"
            ((PASS_COUNT++))
        fi
    else
        echo "❌ NO-GO (No commit SHA)"
        ((FAIL_COUNT++))
    fi
else
    echo "❌ NO-GO (Version API unreachable)"
    ((FAIL_COUNT++))
fi

echo ""
echo "========================================="
echo "RESULTS"
echo "========================================="
echo "Passed: $PASS_COUNT/$TOTAL_CHECKS"
echo "Failed: $FAIL_COUNT/$TOTAL_CHECKS"
echo ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo "🛑 NO-GO: $FAIL_COUNT check(s) failed"
    echo ""
    echo "DO NOT PROCEED with launch"
    echo "Fix failing checks before going live"
    exit 1
else
    echo "🚀 GO: All checks passed"
    echo ""
    echo "CLEARED FOR LAUNCH"
    exit 0
fi
