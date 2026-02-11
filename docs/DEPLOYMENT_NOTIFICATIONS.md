# Deployment Notifications Setup

Complete guide for setting up automated deployment email notifications with branded templates.

## Overview

This system sends professional email notifications when:
- ✅ Deployment succeeds (with health check proof)
- ❌ Deployment fails (with error details and logs link)

Emails are sent **only after objective proof** that the site is live and healthy.

---

## Required GitHub Secrets

Add these secrets in **GitHub → Settings → Secrets and variables → Actions**:

### SMTP Configuration

| Secret | Description | Example |
|--------|-------------|---------|
| `SMTP_HOST` | SMTP server address | `smtp.mail.me.com` (iCloud) |
| `SMTP_PORT` | SMTP port | `587` (standard TLS) |
| `SMTP_USER` | SMTP username | `your-email@icloud.com` |
| `SMTP_PASS` | SMTP password | App-specific password |
| `NOTIFY_TO` | Recipient email | `romeo.valentine@icloud.com` |
| `NOTIFY_FROM` | Sender email | `info@djdannyhecticb.com` |

### SMTP Providers

**iCloud:**
- Host: `smtp.mail.me.com`
- Port: `587`
- Requires: [App-specific password](https://support.apple.com/en-us/HT204397)

**Gmail:**
- Host: `smtp.gmail.com`
- Port: `587`
- Requires: [App password](https://support.google.com/accounts/answer/185833)

**SendGrid:**
- Host: `smtp.sendgrid.net`
- Port: `587`
- Free tier: 100 emails/day

**Mailgun:**
- Host: `smtp.mailgun.org`
- Port: `587`
- Free tier: 5,000 emails/month

---

## How It Works

### Success Flow

```
Deploy → Health Checks → Email Sent
                ↓
    1. /api/health returns "ok"
    2. Homepage returns 200
    3. Admin endpoint accessible
                ↓
        All checks pass
                ↓
    📧 Success email to Romeo
```

### Failure Flow

```
Deploy → Health Checks → Email Sent
                ↓
        Any check fails
                ↓
   ❌ Failure email with logs link
```

---

## Health Checks

The deployment workflow performs these checks **before** sending email:

### 1. Health Endpoint
```bash
curl -fsS https://djdannyhecticb.com/api/health | grep -qi "ok"
```
**Expected:** Response contains "ok" (case insensitive)

### 2. Homepage
```bash
curl -fsSI https://djdannyhecticb.com/ | head -n 1 | grep -E "200|301|302"
```
**Expected:** HTTP 200, 301, or 302 status

### 3. Admin Endpoint
```bash
curl -fsSI https://djdannyhecticb.com/admin | head -n 1 | grep -E "200|301|302"
```
**Expected:** HTTP 200, 301, or 302 (or auth redirect)

---

## Email Templates

### Success Email Features

- ✅ **Branded header** with logo
- 📋 **Deployment details** (branch, commit, actor, timestamp)
- 🏥 **Health check results**
- 👤 **Admin access info** (email only, never password)
- 🔗 **View live site** button
- 📊 **Commit message**

### Failure Email Features

- ❌ **Clear failure indicator**
- 📋 **Deployment details**
- 🔗 **Direct link to GitHub Actions logs**

---

## Admin User Handling

### ✅ Correct Practice

**Email contains:**
- Admin email address: `admin@djdannyhecticb.com`
- Password reset link (recommended)
- Or invitation link with one-time setup

**Never email:**
- ❌ Plain text passwords
- ❌ Hashed passwords
- ❌ Any credential that could be intercepted

### Implementation Options

#### Option A: Fixed Admin (Recommended)

Set a fixed admin email in environment:
```bash
DEFAULT_ADMIN_EMAIL=admin@djdannyhecticb.com
```

Email template references this known value.

#### Option B: Seed During Deploy

Add to deploy script:
```bash
pnpm prisma migrate deploy
pnpm seed:admin  # Creates admin if missing
```

Then email confirms admin creation.

---

## Customization

### Change Logo

1. Upload logo to: `https://djdannyhecticb.com/logo.png`
2. Recommended size: 200x60px or similar
3. Format: PNG with transparency

### Change Colors

Edit workflow file colors:

**Success email:**
- Header gradient: `#667eea` to `#764ba2` (purple)
- Success badge: `#10b981` (green)

**Failure email:**
- Header gradient: `#ef4444` to `#dc2626` (red)
- Error badge: `#ef4444` (red)

### Change Sender Name

Edit `from` field in workflow:
```yaml
from: "Your Company Name <${{ secrets.NOTIFY_FROM }}>"
```

---

## Testing

### Test SMTP Connection

```bash
# Using swaks (SMTP testing tool)
swaks --to romeo.valentine@icloud.com \
      --from info@djdannyhecticb.com \
      --server smtp.mail.me.com:587 \
      --auth LOGIN \
      --auth-user your-email@icloud.com \
      --auth-password "your-app-password" \
      --tls
```

### Test Health Checks

```bash
# Health endpoint
curl -fsS https://djdannyhecticb.com/api/health

# Homepage
curl -fsSI https://djdannyhecticb.com/

# Admin
curl -fsSI https://djdannyhecticb.com/admin
```

---

## Troubleshooting

### Email Not Sending

**Check secrets:**
```bash
# All required secrets present?
SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, NOTIFY_TO, NOTIFY_FROM
```

**Check SMTP credentials:**
- iCloud: Use app-specific password, not main password
- Gmail: Enable "Less secure apps" or use app password
- Verify SMTP port: Usually 587 for TLS

**Check workflow logs:**
- GitHub Actions → Deploy workflow → Send email step
- Look for authentication errors

### Health Checks Failing

**Health endpoint:**
- Ensure `/api/health` route exists
- Returns text containing "ok"
- Accessible without authentication

**Homepage:**
- Returns HTTP 200 (not 404 or 500)
- Or redirects (301/302) are acceptable

**Admin:**
- Returns 200 or redirect to login
- Not returning 404

### Email Goes to Spam

**Solutions:**
- Use a professional "from" address (`info@djdannyhecticb.com` not `noreply@...`)
- Ensure SMTP provider has good reputation
- Consider SPF/DKIM records for your domain
- Check recipient's spam folder first time

---

## Security Best Practices

### ✅ Do

- Use app-specific passwords (never main password)
- Store all credentials in GitHub Secrets
- Use TLS/STARTTLS (port 587)
- Email password reset links, not passwords
- Rotate SMTP passwords periodically

### ❌ Don't

- Hardcode credentials in workflow files
- Email plain text passwords
- Use non-secure SMTP (port 25)
- Share admin credentials via email
- Use personal email for production notifications

---

## Alternative Solutions

### Slack Notifications

```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "🚀 Deployment successful",
        "blocks": [...]
      }
```

### Discord Notifications

```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    title: "Deployment Successful"
```

### SMS Notifications (Twilio)

For critical alerts, integrate Twilio for SMS.

---

## Cost

**Email notifications:** £0
- GitHub Actions: Free tier (2,000 minutes/month)
- SMTP: Free for iCloud, Gmail, SendGrid free tier
- Total: **£0/month**

---

## Maintenance

### Monthly Tasks
- Review email delivery rates
- Check spam folder occasionally
- Verify SMTP credentials still valid

### Quarterly Tasks
- Rotate SMTP passwords
- Review notification recipients
- Test failure scenarios

---

## References

- [GitHub Actions: action-send-mail](https://github.com/dawidd6/action-send-mail)
- [iCloud Mail Settings](https://support.apple.com/en-us/HT202304)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)

---

**Last Updated:** 2026-02-11

**Status:** Production Ready ✅
