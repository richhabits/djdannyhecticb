# GitHub Actions Deployment Guide

This guide explains the automated deployment workflow for DJ Danny Hectic B using GitHub Actions.

## 🎯 Overview

**Deployment Strategy**: Static Build Deploy
- Frontend static files are built with Vite and deployed to the server
- nginx serves files directly (no Node.js runtime needed)
- Atomic deployments with automatic rollback capability
- Automatic cleanup of old releases

## 📋 Prerequisites

### Server Setup (One-Time)

SSH into your server (213.199.45.126) and run:

```bash
# Create deployment directories
sudo mkdir -p /srv/djdannyhecticb/{releases,shared}
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb

# Create initial release placeholder
REL="/srv/djdannyhecticb/releases/initial"
mkdir -p "$REL/public"
cat > "$REL/public/index.html" <<'EOF'
<!DOCTYPE html>
<html>
<head><title>DJ Danny Hectic B</title></head>
<body>
<h1>Ready for deployment</h1>
<p>Waiting for first GitHub Actions deploy...</p>
</body>
</html>
EOF

# Create symlink to current release
ln -sfn "$REL" /srv/djdannyhecticb/current

# Set permissions
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb

# Test nginx configuration
sudo nginx -t && sudo systemctl reload nginx
```

Verify setup:
```bash
curl -sI http://127.0.0.1/ | head -5
```

### nginx Configuration

Your nginx should already be configured with:

```nginx
server {
    listen 443 ssl http2;
    server_name djdannyhecticb.com www.djdannyhecticb.com;
    
    root /srv/djdannyhecticb/current/public;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Required GitHub Secrets

In your GitHub repository, go to:
**Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DEPLOY_HOST` | `213.199.45.126` | Server IP address |
| `DEPLOY_USER` | `hectic` | SSH username |
| `DEPLOY_SSH_KEY` | `<private key>` | SSH private key content |
| `DEPLOY_PORT` | `22` | SSH port (optional, defaults to 22) |

**Getting your SSH private key:**
```bash
# On your local machine (Mac)
cat ~/.ssh/id_ed25519
# or
cat ~/.ssh/id_rsa

# Copy the entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

**Add public key to server** (if not already done):
```bash
# On server
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Paste your public key
chmod 600 ~/.ssh/authorized_keys
```

Test SSH connection:
```bash
# From your local machine
ssh hectic@213.199.45.126
```

## 🚀 Deployment Workflow

The deployment automatically runs when you push to the `main` branch.

### What Happens

1. **Build Phase**:
   - Checks out code
   - Installs pnpm and Node.js 20
   - Installs dependencies (`pnpm install --frozen-lockfile`)
   - Builds application (`pnpm build`)
   - Verifies `dist/public/index.html` exists

2. **Deploy Phase**:
   - Creates timestamped release directory on server
   - Format: `YYYYMMDD-HHMMSS-<run_id>-<commit>`
   - Example: `20260213-120000-12345678-a1b2c3d`

3. **Upload Phase**:
   - Syncs `dist/public/` to `/srv/djdannyhecticb/releases/<timestamp>/public/`
   - Uses rsync with `--delete` flag (removes old files)

4. **Activation Phase**:
   - Updates symlink: `/srv/djdannyhecticb/current` → new release
   - Tests nginx configuration
   - Reloads nginx (zero downtime)

5. **Cleanup Phase**:
   - Keeps last 5 releases
   - Deletes older releases automatically

6. **Verification Phase**:
   - Checks symlink is correct
   - Lists files in current/public
   - Tests HTTP response

### Manual Trigger

You can also trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy DJ Danny Hectic B** workflow
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow** button

## 📁 Directory Structure on Server

```
/srv/djdannyhecticb/
├── current → releases/20260213-120000-12345678-a1b2c3d/  # Symlink to latest
├── releases/
│   ├── 20260213-120000-12345678-a1b2c3d/
│   │   └── public/
│   │       ├── index.html
│   │       ├── assets/
│   │       └── ...
│   ├── 20260213-110000-12345677-xyz123/
│   │   └── public/
│   └── ... (older releases)
└── shared/  # For persistent data (currently unused)
```

## 🔄 Rollback Process

If a deployment has issues, you can quickly rollback:

```bash
# SSH into server
ssh hectic@213.199.45.126

# List available releases
ls -lt /srv/djdannyhecticb/releases/

# Rollback to previous release
cd /srv/djdannyhecticb
ln -sfn releases/<previous-release-name> current

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

Verify rollback:
```bash
curl -I https://djdannyhecticb.com
```

## 🔍 Troubleshooting

### Deployment Failed - Build Error

**Symptoms**: Build step fails in GitHub Actions

**Check**:
```bash
# Run build locally
pnpm install
pnpm build
ls -la dist/public/index.html
```

**Fix**: Resolve TypeScript or build errors in your code

### Deployment Failed - SSH Connection

**Symptoms**: "Permission denied" or "Host key verification failed"

**Check**:
1. Verify `DEPLOY_SSH_KEY` secret is correct
2. Verify public key is in server's `~/.ssh/authorized_keys`
3. Test SSH manually: `ssh hectic@213.199.45.126`

### Deployment Succeeded but Site Shows Old Content

**Symptoms**: Deployment completes but site doesn't update

**Check on server**:
```bash
# Check symlink
ls -la /srv/djdannyhecticb/current

# Should point to latest release
# current -> releases/20260213-120000-12345678-a1b2c3d

# Check nginx is using correct root
sudo nginx -T | grep "root.*djdannyhecticb"
# Should show: root /srv/djdannyhecticb/current/public;

# Check file permissions
ls -la /srv/djdannyhecticb/current/public/

# Files should be readable (r--r--r-- or similar)
```

**Fix**:
```bash
# Fix permissions
sudo chown -R hectic:hectic /srv/djdannyhecticb
sudo chmod -R a+rX /srv/djdannyhecticb

# Reload nginx
sudo systemctl reload nginx
```

### Site Shows 403 Forbidden

**Symptoms**: nginx returns 403 error

**Diagnosis**:
```bash
# Run diagnostic tool
sudo ./scripts/diagnose-nginx.sh
```

**Quick Fix**:
```bash
# Fix permissions
sudo chmod -R a+rX /srv/djdannyhecticb

# Reload nginx
sudo systemctl reload nginx
```

See [TROUBLESHOOTING_403.md](TROUBLESHOOTING_403.md) for detailed 403 troubleshooting.

### Site Shows 502 Bad Gateway

**Symptoms**: nginx returns 502 error

**This shouldn't happen** with static deployment (no backend).

**If it does occur**:
- Check nginx configuration
- Ensure it's NOT proxying to a backend
- It should serve static files from `root /srv/djdannyhecticb/current/public;`

## 📊 Monitoring Deployments

### View Deployment History

```bash
# On server
ls -lt /srv/djdannyhecticb/releases/
```

### Check Current Release

```bash
# On server
readlink /srv/djdannyhecticb/current
# Shows: /srv/djdannyhecticb/releases/20260213-120000-12345678-a1b2c3d
```

### View Deployment Logs

1. Go to **Actions** tab in GitHub
2. Click on latest workflow run
3. Expand each step to see detailed logs

### Test Site Locally on Server

```bash
# SSH into server
ssh hectic@213.199.45.126

# Test local nginx response
curl -sI http://127.0.0.1/ | head -10

# Test full HTML
curl -s http://127.0.0.1/ | head -20

# Test public access
curl -I https://djdannyhecticb.com
```

## 🔐 Security Best Practices

1. **SSH Key Security**:
   - Use Ed25519 keys (stronger than RSA)
   - Never commit private keys to repository
   - Use GitHub Secrets for sensitive data

2. **Server Access**:
   - Limit SSH access to specific IPs if possible
   - Use key-based authentication only (disable password auth)
   - Keep server packages updated

3. **File Permissions**:
   - Web files should be readable by nginx user
   - Use `chmod a+rX` for public content
   - Never use `chmod 777`

## 🎯 Build Output Information

**Build System**: Vite + esbuild
**Build Command**: `pnpm build`
**Package Manager**: pnpm (enforced by preinstall script)

**Build Output**:
- Frontend: `dist/public/` - Static files (HTML, CSS, JS, assets)
- Backend: `dist/index.mjs` - Node.js server (not used in static deployment)

**Deployment**: Only `dist/public/` is deployed to server

## 📚 Related Documentation

- [PM2 Deployment Guide](README_DEPLOY_PM2.md) - Alternative deployment with Node.js backend
- [Quick Start Deploy](QUICKSTART_DEPLOY.md) - Fast deployment reference
- [403 Troubleshooting](TROUBLESHOOTING_403.md) - Fix nginx 403 errors
- [Deployment Fix Summary](DEPLOYMENT_FIX_SUMMARY.md) - Build system fixes

## 🆘 Need Help?

**Quick Commands**:
```bash
# Check deployment status on server
ssh hectic@213.199.45.126 "ls -la /srv/djdannyhecticb/current"

# View nginx error logs
ssh hectic@213.199.45.126 "sudo tail -50 /var/log/nginx/error.log"

# Test site
curl -I https://djdannyhecticb.com

# Rollback to previous release
ssh hectic@213.199.45.126 "cd /srv/djdannyhecticb && ls -t releases/ | head -2"
```

**GitHub Actions Status**:
- View workflow runs: Repository → Actions tab
- Each run shows detailed logs for each step

**Common Issues**:
1. Build fails → Check TypeScript errors locally
2. SSH fails → Verify secrets and SSH keys
3. 403 error → Run `./scripts/diagnose-nginx.sh`
4. Old content → Check symlink and permissions

---

**Summary**: Push to `main` branch → GitHub Actions builds → Deploys to server → nginx serves static files

**Zero downtime**: Atomic symlink switching ensures no service interruption

**Automatic cleanup**: Old releases are automatically removed (keeps last 5)

**Easy rollback**: Switch symlink to previous release directory
