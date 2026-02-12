# Complete Solution for nginx 403 Forbidden Error

## What Was the Problem?

Your site at https://djdannyhecticb.com was returning **403 Forbidden** error. This means:
- ✅ nginx is running
- ✅ SSL certificates are working
- ✅ DNS is configured correctly
- ❌ nginx can't serve the content

The 403 error (not 502) indicates nginx is configured to serve files statically, but either:
1. The document root points to wrong/empty directory
2. The index.html file is missing
3. File permissions are incorrect
4. OR nginx should be reverse proxying to PM2 instead

## What We Built

### 1. Diagnostic Tool (`scripts/diagnose-nginx.sh`)

**What it does:**
```bash
sudo ./scripts/diagnose-nginx.sh
```

Automatically checks:
- ✅ nginx service status
- ✅ Your djdannyhecticb.com server block configuration
- ✅ Document root directory and what's in it
- ✅ Whether proxy_pass is configured
- ✅ File system structure (/srv/djdannyhecticb/dist/public)
- ✅ PM2 process status
- ✅ Whether port 3005 is listening
- ✅ nginx error logs
- ✅ Provides specific fix recommendations

**Output example:**
```
[1/6] Checking nginx service status...
✓ nginx is running

[2/6] Finding djdannyhecticb.com server block...
✓ Found server block
Root directory: /srv/hectic/current/web
No proxy_pass found (static file mode)

[3/6] Extracting configuration details...
✗ Missing index.html in /srv/hectic/current/web
This is likely causing the 403 error

[Diagnosis Summary]
Configuration Mode: Static File Serving
✗ Missing index.html in /srv/hectic/current/web

Choose one option:
Option A: Serve static files from dist/public
  Run: sudo ./scripts/fix-nginx-403.sh static

Option B: Use reverse proxy to PM2 (recommended)
  Run: sudo ./scripts/fix-nginx-403.sh proxy
```

### 2. Automated Fix Script (`scripts/fix-nginx-403.sh`)

**Usage:**
```bash
# For reverse proxy to PM2 (recommended)
sudo ./scripts/fix-nginx-403.sh proxy

# Or for static file serving
sudo ./scripts/fix-nginx-403.sh static
```

**What it does:**
1. Backs up your current nginx configuration
2. Installs the correct configuration template
3. Sets proper file permissions
4. Tests the configuration is valid
5. Reloads nginx safely
6. Verifies the fix worked

**Safe operations:**
- Configuration is backed up before any changes
- nginx config is tested before reload
- If test fails, backup is restored automatically

### 3. nginx Configuration Templates

**Static Mode** (`nginx-configs/static.conf`):
```nginx
server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    root /srv/djdannyhecticb/dist/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**When to use:**
- You just want to serve the frontend statically
- No backend API needed
- Simple SPA deployment

**Proxy Mode** (`nginx-configs/proxy.conf`) - **Recommended**:
```nginx
server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;

    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**When to use:**
- Full-stack application with backend
- tRPC API endpoints
- WebSocket support needed
- Production deployment

### 4. Comprehensive Documentation

**TROUBLESHOOTING_403.md** (8.8KB):
- What causes 403 errors
- 5 common scenarios with solutions
- Step-by-step manual diagnosis
- Configuration templates explained
- Verification checklist
- Command reference

**QUICKFIX_403.md** (1.5KB):
- Emergency one-page reference
- 2-command solution
- Common verification commands
- Perfect for server admins

## How to Use (Step-by-Step)

### On Your Server (213.199.45.126)

1. **Navigate to the repository:**
   ```bash
   cd /path/to/djdannyhecticb
   ```

2. **Run diagnostic (takes 10 seconds):**
   ```bash
   sudo ./scripts/diagnose-nginx.sh
   ```

3. **Apply the fix (takes 5 seconds):**
   ```bash
   # Use proxy mode (recommended for full-stack app)
   sudo ./scripts/fix-nginx-403.sh proxy
   ```

4. **Verify it worked:**
   ```bash
   curl -I https://djdannyhecticb.com
   # Should return: HTTP/2 200
   ```

### If PM2 Needs to Start

If using proxy mode and PM2 isn't running:

```bash
cd /srv/djdannyhecticb
pm2 start dist/index.mjs --name djdannyhecticb
pm2 save
pm2 startup  # Run the command it outputs
```

Verify:
```bash
pm2 list
# Should show: djdannyhecticb │ online

ss -ltn | grep 3005
# Should show: LISTEN 0 511 127.0.0.1:3005
```

### If Files Need to be Built

If using static mode and dist/public is empty:

On your local machine:
```bash
pnpm build
./deploy-pm2.sh
```

Then on server:
```bash
ls -la /srv/djdannyhecticb/dist/public/index.html
# Should exist
```

## What Changed in the Repository

### New Files (8 total):

**Scripts (2):**
- `scripts/diagnose-nginx.sh` (6.4KB) - Diagnostic tool
- `scripts/fix-nginx-403.sh` (5.6KB) - Automated fix

**nginx Templates (2):**
- `nginx-configs/static.conf` (1.4KB) - Static serving
- `nginx-configs/proxy.conf` (2.2KB) - Reverse proxy

**Documentation (4):**
- `TROUBLESHOOTING_403.md` (8.8KB) - Complete guide
- `QUICKFIX_403.md` (1.5KB) - Quick reference
- `README.md` - Updated with troubleshooting links
- `README_DEPLOY_PM2.md` - Added common issues section

### Total Added: ~26KB of tools and documentation

## Common Scenarios

### Scenario 1: nginx Points to Wrong Directory

**Symptom:**
```bash
sudo nginx -T | grep "root"
# Shows: root /srv/hectic/current/web;
# But that's empty or doesn't exist
```

**Solution:**
```bash
sudo ./scripts/fix-nginx-403.sh proxy
```

**Result:** nginx now proxies to PM2 instead of serving files

---

### Scenario 2: Missing index.html

**Symptom:**
```bash
ls /srv/djdannyhecticb/dist/public/
# Directory empty or index.html missing
```

**Solution:**
```bash
# On local machine
pnpm build
./deploy-pm2.sh

# Then on server
sudo ./scripts/fix-nginx-403.sh static
```

**Result:** Files deployed, nginx serves them

---

### Scenario 3: PM2 Not Running

**Symptom:**
```bash
pm2 list
# Shows no "djdannyhecticb" process
```

**Solution:**
```bash
cd /srv/djdannyhecticb
pm2 start dist/index.mjs --name djdannyhecticb
pm2 save

# Then ensure nginx proxies to it
sudo ./scripts/fix-nginx-403.sh proxy
```

**Result:** PM2 running, nginx proxying to it

---

### Scenario 4: Permission Issues

**Symptom:**
```
nginx error log shows:
open() "/srv/djdannyhecticb/dist/public/index.html" failed (13: Permission denied)
```

**Solution:**
```bash
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb
sudo systemctl reload nginx
```

**Result:** Files readable by nginx

## Quick Command Reference

```bash
# Diagnose 403 error
sudo ./scripts/diagnose-nginx.sh

# Fix with proxy mode (recommended)
sudo ./scripts/fix-nginx-403.sh proxy

# Fix with static mode
sudo ./scripts/fix-nginx-403.sh static

# Check nginx config
sudo nginx -T | grep -A20 "server_name djdannyhecticb.com"

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check PM2
pm2 list
pm2 logs djdannyhecticb

# Check port 3005
ss -ltn | grep 3005

# Test backend directly
curl http://127.0.0.1:3005

# Test site
curl -I https://djdannyhecticb.com
```

## Success Criteria

After running the fix, you should see:

```bash
$ curl -I https://djdannyhecticb.com
HTTP/2 200
server: nginx
content-type: text/html
```

**Not 403 anymore! ✅**

## Benefits

1. **Fast Diagnosis** - Know what's wrong in < 1 minute
2. **Automated Fix** - One command to fix it
3. **Safe Operations** - Backups and validation
4. **Clear Documentation** - No guessing
5. **Both Modes Supported** - Static or proxy

## Related Documentation

- [PM2 Deployment Guide](README_DEPLOY_PM2.md) - Full deployment instructions
- [Quick Start Guide](QUICKSTART_DEPLOY.md) - Fast deployment reference
- [Deployment Fix Summary](DEPLOYMENT_FIX_SUMMARY.md) - Build fixes

## Need More Help?

1. Run the diagnostic:
   ```bash
   sudo ./scripts/diagnose-nginx.sh > diagnosis.txt 2>&1
   ```

2. Review the output in `diagnosis.txt`

3. Consult [TROUBLESHOOTING_403.md](TROUBLESHOOTING_403.md) for detailed guidance

4. Check nginx error logs:
   ```bash
   sudo tail -n 100 /var/log/nginx/error.log
   ```

---

**Summary:** You now have complete tools to diagnose and fix nginx 403 errors in under 3 minutes!
