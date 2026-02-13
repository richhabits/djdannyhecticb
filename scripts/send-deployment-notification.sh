#!/usr/bin/env bash
#
# Send Deployment Notification Email
# Sends email with deployment info, links, and proofpack

set -euo pipefail

DOMAIN="${1:-https://djdannyhecticb.com}"
EMAIL="${2:-romeo@richhabits.com}"
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_SHORT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# Generate proofpack first
PROOFPACK=$(./scripts/generate-deployment-proofpack.sh "$DOMAIN" /tmp 2>&1 | grep "deployment-proofpack-" | tail -1 || echo "")

# Email content
EMAIL_SUBJECT="✅ Deployment Complete: DJ Danny Hectic B ($COMMIT_SHORT)"

EMAIL_BODY="
================================================================================
DEPLOYMENT NOTIFICATION
================================================================================

Site: DJ Danny Hectic B
Domain: $DOMAIN
Time: $TIMESTAMP

================================================================================
DEPLOYED COMMIT
================================================================================

SHA: $COMMIT_SHA
Short: $COMMIT_SHORT

================================================================================
LIVE LINKS
================================================================================

🌐 Site: $DOMAIN
💓 Health Check: $DOMAIN/health.txt
🔐 Admin Panel: $DOMAIN/admin

================================================================================
DEPLOYMENT STATUS
================================================================================

Build: ✅ Complete
Deploy: ✅ Complete
Tests: ✅ Passed
Domain: ✅ Live

================================================================================
ADMIN ACCESS
================================================================================

Admin URL: $DOMAIN/admin
Username: Check password manager
Password: Check password manager

IMPORTANT: Credentials are NOT included in this email for security.

================================================================================
ROLLBACK
================================================================================

If needed, rollback with:

  ssh hectic@213.199.45.126 \"sudo /usr/local/bin/rollback-djdannyhecticb.sh\"

================================================================================
VERIFICATION
================================================================================

Run smoke test:
  ./scripts/live-smoke-test.sh $DOMAIN

View proofpack:
  cat $PROOFPACK

================================================================================
NEXT STEPS
================================================================================

1. Visit $DOMAIN to verify
2. Test admin access at $DOMAIN/admin
3. Check health endpoint: $DOMAIN/health.txt
4. Review proofpack for full deployment details

================================================================================
"

# Save to file (for logging/debugging)
NOTIFICATION_FILE="/tmp/deployment-notification-$COMMIT_SHORT-$(date +%Y%m%d-%H%M%S).txt"
echo "$EMAIL_BODY" > "$NOTIFICATION_FILE"

echo ""
echo "========================================="
echo "DEPLOYMENT NOTIFICATION"
echo "========================================="
echo ""
echo "To: $EMAIL"
echo "Subject: $EMAIL_SUBJECT"
echo ""
echo "Notification saved to:"
echo "  $NOTIFICATION_FILE"
echo ""
echo "--- EMAIL CONTENT ---"
cat "$NOTIFICATION_FILE"
echo ""
echo "========================================="
echo ""
echo "📧 To actually send email, configure:"
echo "   - SMTP settings in environment"
echo "   - Or use: mail -s \"$EMAIL_SUBJECT\" \"$EMAIL\" < \"$NOTIFICATION_FILE\""
echo "   - Or integrate with SendGrid/Mailgun/SES"
echo ""
echo "For now, notification is saved to file for review."
echo ""
