# Server-Side Deployment Guide (Enterprise Approach)

**Complete paste-only runbook for DJ Danny Hectic B deployment**

## Overview

This deployment approach builds on the server (not in GitHub Actions), providing:
- ✅ **Fast deploys** - No upload from GitHub, local build + rsync
- ✅ **Enterprise isolation** - Each domain owns its build process
- ✅ **Atomic releases** - Timestamped directories + symlink switching
- ✅ **Easy rollback** - One command to previous release
- ✅ **Zero downtime** - Symlink flip is instant

## Enterprise Features

The deployment system includes production-grade features:

1. **Deploy Lock** - flock-based prevents parallel builds
2. **Auto-Prune** - Automatically keeps only last 5 releases
3. **Health Check** - `/health.txt` endpoint for monitoring
4. **Structured Logging** - All operations logged to `/var/log/djdannyhecticb/`
5. **Fail-Fast Validation** - Validates build output before deploying
6. **Validation Script** - 7-point deployment quality check

See `VALIDATION_GUIDE.md` for complete validation documentation.

## Architecture

```
Developer          GitHub                  Server
──────────────────────────────────────────────────────────────────
git push main ──→ GitHub Actions ──SSH──→ /usr/local/bin/deploy-djdannyhecticb-static.sh
                                            │
                                            ├─ git pull origin/main
                                            ├─ pnpm install --frozen-lockfile
                                            ├─ pnpm build
                                            ├─ rsync dist/public/ → releases/TS/public/
                                            ├─ ln -sfn releases/TS current
                                            └─ nginx reload
                                            
Result: https://djdannyhecticb.com serves from /srv/djdannyhecticb/current/public
```

## Server Directory Structure

```
/srv/djdannyhecticb/
├── current → releases/20260213-001234/  # Symlink (atomic switch)
├── releases/
│   ├── 20260213-001234/  # Latest deploy
│   │   └── public/       # Static files from dist/public
│   ├── 20260213-001123/  # Previous (for rollback)
│   └── 20260213-001012/  # Older releases
├── repo/                 # Git clone (for building)
└── shared/              # Persistent data (env, logs, uploads)
```

---

## A) One-Time Server Setup (Ubuntu/Debian)

### 1. Create Directory Structure

```bash
sudo mkdir -p /srv/djdannyhecticb/{releases,shared,repo}
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb
```

### 2. Install Node.js + pnpm

```bash
# Check if Node.js is installed
node -v || sudo apt install -y nodejs

# Enable corepack (built into Node 16.9+)
corepack enable

# Install specific pnpm version (matches package.json)
corepack prepare pnpm@9.15.5 --activate

# Verify
pnpm -v
```

### 3. Configure nginx

```bash
sudo tee /etc/nginx/sites-available/djdannyhecticb.com >/dev/null <<'NGINX'
server {
  listen 80;
  listen [::]:80;
  server_name djdannyhecticb.com www.djdannyhecticb.com;
  location /.well-known/acme-challenge/ { allow all; }
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name djdannyhecticb.com www.djdannyhecticb.com;

  ssl_certificate     /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;

  root /srv/djdannyhecticb/current/public;
  index index.html;

  server_tokens off;
  client_max_body_size 20m;

  # Drop bot/probe garbage fast
  location ~* ^/(\.env|\.git|wp-admin|wordpress|wp-content|phpmyadmin|pma|db\.sql|dump\.sql|backup\.sql) { return 444; }

  location / { try_files $uri $uri/ /index.html; }
}
NGINX

# Enable site
sudo ln -sf /etc/nginx/sites-available/djdannyhecticb.com /etc/nginx/sites-enabled/djdannyhecticb.com

# Test and reload
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Create Placeholder Index

```bash
sudo install -d -o hectic -g hectic -m 755 /srv/djdannyhecticb/current/public
sudo bash -lc 'cat > /srv/djdannyhecticb/current/public/index.html << "EOF"
<!DOCTYPE html>
<html>
<head><title>DJ Danny Hectic B</title></head>
<body>
<h1>Deploy pipeline online</h1>
<p>Waiting for first deployment...</p>
</body>
</html>
EOF'
sudo chown -R hectic:hectic /srv/djdannyhecticb/current
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Verify Setup

```bash
# Check directory structure
ls -la /srv/djdannyhecticb/

# Check nginx serves placeholder
curl -sk https://127.0.0.1 --resolve djdannyhecticb.com:443:127.0.0.1 | head
```

---

## B) Install Deploy Scripts

### Deploy Script (Server-Side)

```bash
sudo tee /usr/local/bin/deploy-djdannyhecticb-static.sh >/dev/null <<'BASH'
#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/srv/djdannyhecticb"
REPO_DIR="$APP_ROOT/repo"
RELEASES="$APP_ROOT/releases"

BRANCH="${1:-main}"
TS="$(date +%Y%m%d-%H%M%S)"
REL="$RELEASES/$TS"

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

echo "[deploy] branch=$BRANCH release=$REL"

# Ensure tools
command -v node >/dev/null
command -v corepack >/dev/null || { echo "corepack missing"; exit 1; }
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@9.15.5 --activate >/dev/null

# Repo
if [ ! -d "$REPO_DIR/.git" ]; then
  rm -rf "$REPO_DIR"
  mkdir -p "$REPO_DIR"
  git clone --depth 1 --branch "$BRANCH" https://github.com/richhabits/djdannyhecticb.git "$REPO_DIR"
fi

cd "$REPO_DIR"
git fetch --all --prune
git reset --hard "origin/$BRANCH"

# Clean install + build (pnpm only; npm will fail by design)
pnpm install --frozen-lockfile
pnpm build

# Assert output exists (vite outDir => dist/public)
test -d "dist/public" || { echo "[deploy] ERROR: dist/public missing"; exit 1; }
test -f "dist/public/index.html" || { echo "[deploy] ERROR: dist/public/index.html missing"; exit 1; }

# Create release dir and copy static output
mkdir -p "$REL/public"
rsync -a --delete "dist/public/" "$REL/public/"

# Atomic switch
ln -sfn "$REL" "$APP_ROOT/current"

# Permissions
chown -R hectic:hectic "$REL" "$APP_ROOT/current"
chmod -R a+rX "$REL" "$APP_ROOT/current"

# Reload nginx
nginx -t
systemctl reload nginx

echo "[deploy] OK => $APP_ROOT/current/public"
BASH

sudo chmod +x /usr/local/bin/deploy-djdannyhecticb-static.sh
```

### Rollback Script

```bash
sudo tee /usr/local/bin/rollback-djdannyhecticb.sh >/dev/null <<'BASH'
#!/usr/bin/env bash
set -euo pipefail
APP="/srv/djdannyhecticb"
LAST="$(ls -1dt $APP/releases/* 2>/dev/null | sed -n '2p' || true)"
[ -n "$LAST" ] || { echo "No previous release to roll back to"; exit 1; }
ln -sfn "$LAST" "$APP/current"
nginx -t
systemctl reload nginx
echo "Rolled back to: $LAST"
BASH

sudo chmod +x /usr/local/bin/rollback-djdannyhecticb.sh
```

### Test Manual Deploy

```bash
# Run deploy manually
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main

# Verify
curl -sk https://127.0.0.1 --resolve djdannyhecticb.com:443:127.0.0.1 | head -n 30
ls -la /srv/djdannyhecticb/current/public | head
```

---

## C) GitHub Actions Configuration

### 1. Required GitHub Secrets

In your GitHub repository:
1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add these three secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DEPLOY_HOST` | `213.199.45.126` | Server IP address |
| `DEPLOY_USER` | `hectic` | SSH username |
| `DEPLOY_SSH_KEY` | `<private key>` | SSH private key for authentication |

**Optional:**
- `DEPLOY_PORT` - SSH port (defaults to 22)

### 2. Workflow File (Already in Repo)

The workflow file `.github/workflows/deploy-djdannyhecticb.yml` should contain:

```yaml
name: Deploy Static (Server-Side Build)

on:
  push:
    branches: ["main"]
  workflow_dispatch:

concurrency:
  group: deploy-static-main
  cancel-in-progress: true

jobs:
  deploy:
    name: Trigger Server-Side Deploy
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Deploy on server (build + deploy)
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          port: ${{ secrets.DEPLOY_PORT || '22' }}
          script: |
            sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

---

## D) Usage

### Automatic Deployment

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# ✅ GitHub Actions automatically triggers deployment
# ✅ Server builds and deploys
# ✅ Live in 2-3 minutes
```

### Manual Deployment (Server)

```bash
# SSH to server
ssh hectic@213.199.45.126

# Run deploy script
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

### Manual Trigger (GitHub UI)

1. Go to **Actions** tab in GitHub
2. Select "Deploy Static (Server-Side Build)"
3. Click **Run workflow**
4. Select branch (main)
5. Click **Run workflow** button

### Rollback

```bash
# SSH to server
ssh hectic@213.199.45.126

# Rollback to previous release
sudo /usr/local/bin/rollback-djdannyhecticb.sh

# Verify
curl -I https://djdannyhecticb.com
```

---

## E) Monitoring and Verification

### Check Deployment Status

```bash
# On server - Check current release
ls -la /srv/djdannyhecticb/current

# List all releases
ls -lt /srv/djdannyhecticb/releases/

# Check what's deployed
ls -lh /srv/djdannyhecticb/current/public/ | head
```

### Watch nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Both
sudo tail -f /var/log/nginx/{access,error}.log
```

### Test Site

```bash
# From server (local)
curl -I https://127.0.0.1 --resolve djdannyhecticb.com:443:127.0.0.1

# From anywhere
curl -I https://djdannyhecticb.com
```

---

## F) Troubleshooting

### Deploy Script Fails

```bash
# Check logs
sudo journalctl -xe

# Run manually with verbose output
sudo bash -x /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

### Build Fails

```bash
# SSH to server
cd /srv/djdannyhecticb/repo

# Check pnpm
pnpm -v

# Try manual build
pnpm install --frozen-lockfile
pnpm build

# Check output
ls -lh dist/public/
```

### nginx 403 Forbidden

```bash
# Check permissions
ls -la /srv/djdannyhecticb/current/public

# Fix permissions
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb

# Verify nginx config
sudo nginx -t

# Check what nginx is serving
sudo nginx -T | grep -A 10 "server_name djdannyhecticb.com"
```

### Site Not Updating

```bash
# Check current symlink
ls -la /srv/djdannyhecticb/current

# Check latest release
ls -lt /srv/djdannyhecticb/releases/ | head

# Force new deploy
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main

# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Chrome/Firefox)
```

---

## G) Maintenance

### Cleanup Old Releases

```bash
# List releases (oldest first)
ls -lt /srv/djdannyhecticb/releases/ | tail

# Delete releases older than 7 days
find /srv/djdannyhecticb/releases/ -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \;

# Keep only last 5 releases
cd /srv/djdannyhecticb/releases && ls -t | tail -n +6 | xargs -r rm -rf
```

### Update pnpm Version

```bash
# Check current version
pnpm -v

# Update to specific version
corepack prepare pnpm@9.15.5 --activate

# Or to latest
corepack prepare pnpm@latest --activate
```

### Disk Space Check

```bash
# Check disk usage
df -h /srv

# Check directory sizes
du -sh /srv/djdannyhecticb/*

# Largest releases
du -sh /srv/djdannyhecticb/releases/* | sort -h | tail
```

---

## H) Security Considerations

### SSH Key Management

- Use dedicated deploy key (not your personal key)
- Restrict key permissions: `chmod 600 ~/.ssh/deploy_key`
- Add key to server: `~/.ssh/authorized_keys`
- Consider key rotation every 90 days

### File Permissions

```bash
# Correct permissions
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb

# nginx needs read access to files
# Files: 644 (rw-r--r--)
# Directories: 755 (rwxr-xr-x)
```

### nginx Security

The nginx configuration includes:
- `server_tokens off` - Hide nginx version
- `client_max_body_size 20m` - Limit upload size
- Bot/probe blocking for common attack paths
- HTTPS redirect for all HTTP traffic

---

## I) Comparison: Server-Side vs GitHub Actions Build

| Aspect | Server-Side (This Approach) | GitHub Actions Build (Previous) |
|--------|----------------------------|--------------------------------|
| Build Location | On server | In GitHub runner |
| Deploy Speed | ~2-3 minutes | ~5-7 minutes |
| Bandwidth | Minimal (local) | 22MB upload per deploy |
| Complexity | Simple (20 line workflow) | Complex (120+ line workflow) |
| Server Control | Full control | Limited |
| Rollback | Instant (symlink) | Requires redeploy |
| Secrets | 3 (SSH only) | 4 (SSH + config) |

---

## J) Quick Reference

### Common Commands

```bash
# Deploy manually
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main

# Rollback
sudo /usr/local/bin/rollback-djdannyhecticb.sh

# Check current release
ls -la /srv/djdannyhecticb/current

# List releases
ls -lt /srv/djdannyhecticb/releases/

# Test site
curl -I https://djdannyhecticb.com

# Watch logs
sudo tail -f /var/log/nginx/access.log

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Check disk space
df -h /srv
```

### Quick Troubleshooting

```bash
# Full diagnostic
ls -la /srv/djdannyhecticb/current/public
sudo nginx -T | grep -A 10 "djdannyhecticb.com"
sudo tail -20 /var/log/nginx/error.log
curl -I https://djdannyhecticb.com
```

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review nginx error logs
- Verify GitHub Actions run logs
- Check server disk space and permissions

**Server setup**: This guide
**403 errors**: See `TROUBLESHOOTING_403.md`
**Quick reference**: See `DEPLOY_QUICK_REFERENCE.md`
