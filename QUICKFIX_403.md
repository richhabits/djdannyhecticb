# 403 Forbidden - Quick Fix Guide

## Problem
Website shows "403 Forbidden" error at https://djdannyhecticb.com

## Root Cause
nginx is configured incorrectly - either:
- Pointing to wrong/empty directory
- Missing files
- Backend not running

## Quick Fix (2 Commands)

### Step 1: Diagnose
```bash
sudo ./scripts/diagnose-nginx.sh
```

This shows you exactly what's wrong.

### Step 2: Fix
Choose one:

**Option A: Reverse Proxy (Recommended)**
```bash
sudo ./scripts/fix-nginx-403.sh proxy
```
Use this if PM2 is running your backend on port 3005.

**Option B: Static Files**
```bash
sudo ./scripts/fix-nginx-403.sh static
```
Use this if you just want nginx to serve files from dist/public.

## Verify Fix
```bash
curl -I https://djdannyhecticb.com
# Should return 200 OK, not 403
```

## If PM2 Needed (Option A)
```bash
cd /srv/djdannyhecticb
pm2 start dist/index.mjs --name djdannyhecticb
pm2 save
```

## If Files Missing (Option B)
```bash
# On local machine, build and deploy:
pnpm build
./deploy-pm2.sh
```

## Common Commands
```bash
# Check nginx config
sudo nginx -T | grep -A20 "server_name djdannyhecticb.com"

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check PM2
pm2 list
pm2 logs djdannyhecticb

# Check files
ls -la /srv/djdannyhecticb/dist/public/

# Reload nginx
sudo systemctl reload nginx
```

## Full Documentation
See [TROUBLESHOOTING_403.md](TROUBLESHOOTING_403.md) for detailed guide.

---

**TL;DR:**
1. Run: `sudo ./scripts/diagnose-nginx.sh`
2. Run: `sudo ./scripts/fix-nginx-403.sh proxy`
3. Done! ✅
