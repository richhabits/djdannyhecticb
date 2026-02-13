#!/usr/bin/env bash
#
# Generate Deployment Proofpack
# Creates a deployment proof document with all verification data

set -euo pipefail

DOMAIN="${1:-https://djdannyhecticb.com}"
OUTPUT_DIR="${2:-/tmp}"
TIMESTAMP=$(date -Iseconds)
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "unknown")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

PROOFPACK_FILE="$OUTPUT_DIR/deployment-proofpack-$COMMIT_SHORT-$(date +%Y%m%d-%H%M%S).txt"

cat > "$PROOFPACK_FILE" << PROOFPACK
================================================================================
DEPLOYMENT PROOFPACK
================================================================================

Generated: $TIMESTAMP
Domain: $DOMAIN

================================================================================
GIT INFORMATION
================================================================================

Commit SHA:     $COMMIT_SHA
Short SHA:      $COMMIT_SHORT
Branch:         $BRANCH
Commit Message: $COMMIT_MSG

================================================================================
DEPLOYMENT VERIFICATION
================================================================================

PROOFPACK

# Run smoke test and capture output
echo "" >> "$PROOFPACK_FILE"
echo "Running live smoke test..." >> "$PROOFPACK_FILE"
echo "" >> "$PROOFPACK_FILE"

if ./scripts/live-smoke-test.sh "$DOMAIN" >> "$PROOFPACK_FILE" 2>&1; then
    SMOKE_RESULT="✅ PASSED"
else
    SMOKE_RESULT="❌ FAILED"
fi

cat >> "$PROOFPACK_FILE" << PROOFPACK

================================================================================
LIVE DOMAIN CHECKS
================================================================================

Homepage URL: $DOMAIN/
Health URL:   $DOMAIN/health.txt
Admin URL:    $DOMAIN/admin (if applicable)

Current Response:
PROOFPACK

# Get homepage content sample
echo "" >> "$PROOFPACK_FILE"
echo "Homepage content (first 20 lines):" >> "$PROOFPACK_FILE"
curl -sSL "$DOMAIN/" 2>/dev/null | head -20 >> "$PROOFPACK_FILE" 2>&1 || echo "Failed to fetch" >> "$PROOFPACK_FILE"

cat >> "$PROOFPACK_FILE" << PROOFPACK

================================================================================
DEPLOYMENT METADATA
================================================================================

Server: 213.199.45.126
User: hectic
Deploy Path: /srv/djdannyhecticb/current/public

Verification Method: Live HTTP requests
Smoke Test Result: $SMOKE_RESULT

================================================================================
ROLLBACK COMMAND
================================================================================

If deployment needs to be rolled back:

ssh hectic@213.199.45.126 "sudo /usr/local/bin/rollback-djdannyhecticb.sh"

Previous releases available in:
/srv/djdannyhecticb/releases/

================================================================================
ADMIN ACCESS
================================================================================

Admin URL: $DOMAIN/admin
Credentials: Stored in password manager (not in this proofpack)

================================================================================
END OF PROOFPACK
================================================================================
PROOFPACK

echo ""
echo "✅ Deployment proofpack generated:"
echo "   $PROOFPACK_FILE"
echo ""
echo "Summary:"
echo "  Commit: $COMMIT_SHORT"
echo "  Domain: $DOMAIN"
echo "  Smoke Test: $SMOKE_RESULT"
echo ""

cat "$PROOFPACK_FILE"
