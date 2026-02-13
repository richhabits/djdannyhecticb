# GitHub Actions Deployment - Quick Reference

## 🎯 One-Time Setup

### 1. Server Setup (Run on server)
```bash
# SSH into server
ssh hectic@213.199.45.126

# Run setup script
./scripts/setup-github-actions-deploy.sh

# Or manually:
sudo mkdir -p /srv/djdannyhecticb/{releases,shared}
sudo chown -R hectic:hectic /srv/djdannyhecticb
```

### 2. GitHub Secrets (Configure once)
Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:
- `DEPLOY_HOST` = `213.199.45.126`
- `DEPLOY_USER` = `hectic`
- `DEPLOY_SSH_KEY` = Your SSH private key (entire content)
- `DEPLOY_PORT` = `22` (optional)

### 3. SSH Key Setup
```bash
# Get your private key
cat ~/.ssh/id_ed25519

# Ensure public key is on server
ssh-copy-id hectic@213.199.45.126
```

## 🚀 Deploy

### Automatic Deployment
```bash
# Make changes, commit, and push to main
git add .
git commit -m "Your changes"
git push origin main

# GitHub Actions automatically:
# - Builds the application
# - Deploys to server
# - Reloads nginx
```

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Click **Deploy DJ Danny Hectic B**
3. Click **Run workflow**
4. Select `main` branch
5. Click **Run workflow** button

## 📊 Monitor

### Check Deployment Status
- **GitHub**: Repository → Actions tab → Latest workflow run

### View Logs
```bash
# On server
ssh hectic@213.199.45.126

# Check current release
readlink /srv/djdannyhecticb/current

# List releases
ls -lt /srv/djdannyhecticb/releases/

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Test Site
```bash
# From anywhere
curl -I https://djdannyhecticb.com

# On server
curl -I http://127.0.0.1/
```

## 🔄 Rollback

```bash
# SSH into server
ssh hectic@213.199.45.126

# List releases
ls -lt /srv/djdannyhecticb/releases/

# Rollback to previous release
cd /srv/djdannyhecticb
ln -sfn releases/<previous-release-name> current
sudo systemctl reload nginx
```

## 🐛 Troubleshooting

### Build Fails
**Check**: GitHub Actions logs for errors
**Fix**: Run `pnpm build` locally to identify issues

### Deployment Fails - SSH Error
**Check**: GitHub Secrets are correct
**Test**: `ssh hectic@213.199.45.126` from your machine
**Fix**: Verify `DEPLOY_SSH_KEY` contains correct private key

### Site Shows 403 Error
**Check**: File permissions on server
**Fix**: 
```bash
sudo chmod -R a+rX /srv/djdannyhecticb
sudo systemctl reload nginx
```

### Site Shows Old Content
**Check**: Symlink and permissions
```bash
ls -la /srv/djdannyhecticb/current
sudo chmod -R a+rX /srv/djdannyhecticb
sudo systemctl reload nginx
```

## 📁 How It Works

### Build Process
```
pnpm build → dist/public/ (static files)
```

### Deployment Process
```
1. Create timestamped release: /srv/djdannyhecticb/releases/20260213-120000-xxx/
2. Upload: dist/public/ → releases/20260213-120000-xxx/public/
3. Switch: current → releases/20260213-120000-xxx/
4. Reload: nginx serves from current/public/
```

### Directory Structure
```
/srv/djdannyhecticb/
├── current → releases/20260213-120000-xxx/  # Symlink
├── releases/
│   ├── 20260213-120000-xxx/  # Latest
│   │   └── public/
│   ├── 20260213-110000-yyy/  # Previous
│   │   └── public/
│   └── ...                    # Older (auto-cleaned, keeps last 5)
└── shared/                     # Persistent data
```

## 🎛️ nginx Configuration

Should be configured as:
```nginx
root /srv/djdannyhecticb/current/public;
```

This serves static files directly (no Node.js/PM2 needed).

## 📚 Full Documentation

See [DEPLOY_GITHUB_ACTIONS.md](DEPLOY_GITHUB_ACTIONS.md) for complete guide.

## ✅ Checklist

Before first deployment:
- [ ] Server setup complete (`./scripts/setup-github-actions-deploy.sh`)
- [ ] GitHub Secrets configured
- [ ] SSH key added to server
- [ ] nginx configured with correct root path
- [ ] Test SSH connection works

After each deployment:
- [ ] Check GitHub Actions workflow succeeded
- [ ] Verify site loads: https://djdannyhecticb.com
- [ ] Check symlink points to new release
- [ ] Monitor nginx logs for errors

---

**Quick Deploy**: `git push origin main` ✅
**Zero Downtime**: Atomic symlink switching ✅
**Auto Cleanup**: Keeps last 5 releases ✅
**Easy Rollback**: Just switch the symlink ✅
