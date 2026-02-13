# Troubleshooting nginx 403 Forbidden Error

This guide helps diagnose and fix the "403 Forbidden" error on djdannyhecticb.com.

## What is a 403 Error?

**403 Forbidden** means:
- ✅ nginx is running and responding
- ✅ SSL certificates are valid
- ✅ DNS is working
- ❌ nginx cannot serve the requested content

This is usually caused by:
1. Missing or empty document root
2. Missing index.html file
3. Wrong file permissions
4. nginx pointing to wrong directory
5. Backend not running (if using reverse proxy)

## Quick Diagnosis

Run the diagnostic script on your server:

```bash
sudo ./scripts/diagnose-nginx.sh
```

This will check:
- nginx configuration
- File system structure
- PM2 status
- Port availability
- Error logs

## Common Causes & Solutions

### Cause 1: nginx Pointing to Empty/Wrong Directory

**Symptoms:**
```
sudo nginx -T | grep "root "
# Shows: root /srv/hectic/current/web;
# But that directory is empty or doesn't exist
```

**Solution:**
Choose one of two modes:

#### Option A: Static File Serving (Vite SPA)

Serve the built frontend directly from nginx:

```bash
sudo ./scripts/fix-nginx-403.sh static
```

This configures nginx to serve files from `/srv/djdannyhecticb/dist/public`.

**Requirements:**
- Build must be deployed: `./deploy-pm2.sh`
- `/srv/djdannyhecticb/dist/public/index.html` must exist
- Files must have read permissions

#### Option B: Reverse Proxy to PM2 (Recommended)

Configure nginx to proxy requests to your Node.js backend:

```bash
sudo ./scripts/fix-nginx-403.sh proxy
```

This configures nginx to forward requests to `http://127.0.0.1:3005`.

**Requirements:**
- PM2 must be running: `pm2 list`
- Backend must be listening on port 3005: `ss -ltn | grep 3005`
- Application must be started: `pm2 start dist/index.mjs --name djdannyhecticb`

---

### Cause 2: Missing index.html

**Symptoms:**
```bash
ls -la /srv/djdannyhecticb/dist/public/
# Shows directory but no index.html
```

**Solution:**
Build the application:

```bash
# On local machine
pnpm build

# Deploy to server
./deploy-pm2.sh
```

Verify:
```bash
ls -la /srv/djdannyhecticb/dist/public/index.html
```

---

### Cause 3: Permission Issues

**Symptoms:**
```
2024/02/12 23:00:00 [error] 1234#1234: *1 open() "/srv/djdannyhecticb/dist/public/index.html" 
failed (13: Permission denied)
```

**Solution:**
Fix permissions:

```bash
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb
```

Verify:
```bash
ls -la /srv/djdannyhecticb/dist/public/
# Should show files readable by all (r-x)
```

---

### Cause 4: PM2 Not Running (Reverse Proxy Mode)

**Symptoms:**
```bash
pm2 list
# Shows no "djdannyhecticb" process
```

nginx error log shows:
```
connect() failed (111: Connection refused) while connecting to upstream
```

**Solution:**
Start the application:

```bash
cd /srv/djdannyhecticb
pm2 start dist/index.mjs --name djdannyhecticb
pm2 save
pm2 startup  # Run the command it outputs
```

Verify:
```bash
pm2 list
# Should show "djdannyhecticb" status: online

ss -ltn | grep 3005
# Should show: LISTEN 0 511 127.0.0.1:3005
```

---

### Cause 5: Wrong nginx Server Block

**Symptoms:**
```bash
sudo nginx -T | grep -A10 "server_name djdannyhecticb.com"
# Shows unexpected or old configuration
```

**Solution:**
Apply correct configuration:

For static serving:
```bash
sudo ./scripts/fix-nginx-403.sh static
```

For reverse proxy:
```bash
sudo ./scripts/fix-nginx-403.sh proxy
```

Or manually:
```bash
sudo cp nginx-configs/proxy.conf /etc/nginx/sites-available/djdannyhecticb.com
sudo nginx -t
sudo systemctl reload nginx
```

---

## Manual Diagnosis Steps

If automatic tools don't work, follow these steps:

### Step 1: Check nginx Configuration

```bash
sudo nginx -T | sed -n '/server_name djdannyhecticb.com/,/}/p'
```

Look for:
- `root` directive - where nginx looks for files
- `index` directive - default file to serve
- `location /` block - how requests are handled
- `proxy_pass` directive - if proxying to backend

### Step 2: Check File System

```bash
# Check main directory
ls -la /srv/djdannyhecticb

# Check dist directory
ls -la /srv/djdannyhecticb/dist

# Check public directory
ls -la /srv/djdannyhecticb/dist/public

# Look for index.html
find /srv/djdannyhecticb -name "index.html" -ls
```

### Step 3: Check nginx Error Logs

```bash
sudo tail -n 100 /var/log/nginx/error.log
```

Common error patterns:

**"directory index of ... is forbidden"**
→ Missing index.html, nginx can't list directory

**"Permission denied"**
→ File permissions issue, run `chmod -R a+rX`

**"No such file or directory"**
→ Wrong root path in nginx config

**"Connection refused"**
→ Backend not running (PM2 issue)

### Step 4: Test Backend Directly

If using reverse proxy mode:

```bash
# Check PM2
pm2 list

# Check port
ss -ltn | grep 3005

# Test backend directly
curl -v http://127.0.0.1:3005/

# View backend logs
pm2 logs djdannyhecticb --lines 50
```

### Step 5: Test nginx Response

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://djdannyhecticb.com

# Test HTTPS
curl -I https://djdannyhecticb.com

# Get full response
curl -v https://djdannyhecticb.com
```

---

## Configuration Templates

### Static File Serving (nginx-configs/static.conf)

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
- Simple deployment
- No backend needed
- Static site or SPA only

### Reverse Proxy (nginx-configs/proxy.conf)

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

**When to use:** (Recommended)
- Full-stack application
- Backend API needed
- WebSocket support
- Dynamic content

---

## Automated Fixes

### Fix Static Mode

```bash
sudo ./scripts/fix-nginx-403.sh static
```

This will:
1. Backup current nginx config
2. Install static serving configuration
3. Set correct file permissions
4. Verify index.html exists
5. Reload nginx

### Fix Proxy Mode

```bash
sudo ./scripts/fix-nginx-403.sh proxy
```

This will:
1. Backup current nginx config
2. Install reverse proxy configuration
3. Check PM2 status
4. Verify port 3005 is listening
5. Reload nginx

---

## Verification Checklist

After applying fixes, verify:

- [ ] nginx is running: `systemctl status nginx`
- [ ] nginx config is valid: `sudo nginx -t`
- [ ] Site responds: `curl -I https://djdannyhecticb.com`
- [ ] No 403 errors in: `sudo tail /var/log/nginx/error.log`

**For static mode:**
- [ ] index.html exists: `ls /srv/djdannyhecticb/dist/public/index.html`
- [ ] Files readable: `ls -la /srv/djdannyhecticb/dist/public/`

**For proxy mode:**
- [ ] PM2 running: `pm2 list | grep djdannyhecticb`
- [ ] Port listening: `ss -ltn | grep 3005`
- [ ] Backend responds: `curl http://127.0.0.1:3005`

---

## Quick Command Reference

```bash
# Diagnose 403 error
sudo ./scripts/diagnose-nginx.sh

# Fix with static serving
sudo ./scripts/fix-nginx-403.sh static

# Fix with reverse proxy (recommended)
sudo ./scripts/fix-nginx-403.sh proxy

# Check nginx config
sudo nginx -T | less

# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check PM2
pm2 list
pm2 logs djdannyhecticb

# Check listening ports
ss -ltn | grep 3005

# Test backend directly
curl http://127.0.0.1:3005
```

---

## Still Having Issues?

If the 403 error persists:

1. **Check SELinux/AppArmor** (if applicable):
   ```bash
   getenforce  # Should be "Disabled" or "Permissive"
   ```

2. **Check firewall**:
   ```bash
   sudo ufw status
   # Ports 80 and 443 should be allowed
   ```

3. **Verify SSL certificates**:
   ```bash
   sudo certbot certificates
   # Check expiration and domains
   ```

4. **Check disk space**:
   ```bash
   df -h
   # Ensure /srv has space
   ```

5. **Review full error log**:
   ```bash
   sudo tail -n 200 /var/log/nginx/error.log | less
   ```

6. **Check system logs**:
   ```bash
   sudo journalctl -u nginx -n 100
   ```

---

## Related Documentation

- [PM2 Deployment Guide](README_DEPLOY_PM2.md)
- [Quick Start Guide](QUICKSTART_DEPLOY.md)
- [Deployment Fix Summary](DEPLOYMENT_FIX_SUMMARY.md)

---

## Need Help?

Run the diagnostic script and share the output:

```bash
sudo ./scripts/diagnose-nginx.sh > diagnosis.txt 2>&1
cat diagnosis.txt
```

Include this output when asking for help.
