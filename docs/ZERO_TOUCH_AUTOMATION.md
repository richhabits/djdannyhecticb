# Zero-Touch CI/CD Automation System

## Overview

This repository implements a comprehensive **zero-touch** CI/CD automation system with GREEN gates, auto-deploy, and maintenance scripts for hands-off operation.

## Architecture

### GREEN Gate (Required Checks)

All PRs and pushes to `main` must pass:

1. **TypeScript Check** (`pnpm check`)
2. **Build** (`pnpm build`)
3. **Tests** (`pnpm test`)
4. **Secret Scan** (Gitleaks)
5. **No-Bleed Scan** (Cousin-code detection)

### Auto-Deploy

When code is merged to `main` and all checks pass:

1. SSH into production server
2. Pull latest code (`git reset --hard origin/main`)
3. Install dependencies (`pnpm install`)
4. Build application (`pnpm build`)
5. Restart Docker containers (`docker compose up -d`)
6. Run health check

## Setup (One-Time Bootstrap)

### 1. GitHub Secrets

Configure these secrets in GitHub Settings → Secrets:

```bash
DEPLOY_HOST          # e.g., djdannyhecticb.com
DEPLOY_USER          # e.g., deploy
DEPLOY_KEY           # SSH private key for deploy user
DEPLOY_PATH          # e.g., /var/www/djdannyhecticb (optional, default)
HEALTH_ENDPOINT      # e.g., /api/health (optional, default)

# Optional: GitLab mirror
GITLAB_TOKEN         # GitLab personal access token
GITLAB_REPO_URL      # e.g., https://gitlab.com/user/repo.git
```

### 2. Server Setup

On your production server:

```bash
# Create deploy user
sudo adduser deploy
sudo usermod -aG docker deploy

# Setup SSH key
sudo -u deploy mkdir -p /home/deploy/.ssh
sudo -u deploy nano /home/deploy/.ssh/authorized_keys
# Paste the public key corresponding to DEPLOY_KEY

# Set permissions
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# Clone repository
sudo -u deploy git clone https://github.com/richhabits/djdannyhecticb.git /var/www/djdannyhecticb
cd /var/www/djdannyhecticb
sudo -u deploy pnpm install
```

### 3. Branch Protection

In GitHub Settings → Branches → Add rule for `main`:

- ✅ Require pull request before merging
- ✅ Require status checks to pass:
  - `GREEN Gate (All Required Checks)`
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings

### 4. Nightly Maintenance

Setup cron job on server:

```bash
# Edit crontab
crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * /var/www/djdannyhecticb/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

## Scripts

### `pnpm ci:gate`

Combined gate check (runs all required checks):
- TypeScript check
- Build
- Tests
- No-bleed scan

### `scripts/no-bleed.sh`

Scans for forbidden cousin-code keywords from other projects. Blocks merges if found.

### `scripts/maintenance.sh`

Nightly server maintenance:
- Docker cleanup (prune containers, images, volumes)
- Log rotation (gzip old logs, delete 30+ day logs)
- Temp files cleanup
- Disk usage report

### `scripts/ai-triage.sh` (Optional)

AI-powered CI failure triage using Ollama:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
ollama pull qwen2.5:7b

# Use in CI or locally
./scripts/ai-triage.sh ci-log.txt PR_NUMBER
```

## Workflows

### `.github/workflows/gate.yml`

GREEN gate checks. Runs on:
- Pull requests to `main`
- Pushes to `main`

### `.github/workflows/deploy.yml`

Auto-deploy to production. Runs on:
- Push to `main` (after GREEN gate passes)

### `.github/workflows/mirror.yml` (Optional)

Mirrors `main` branch to GitLab as backup.

## Usage

### Normal Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... code ...

# 3. Test locally
pnpm ci:gate

# 4. Commit and push
git add .
git commit -m "feat: my feature"
git push origin feature/my-feature

# 5. Open PR on GitHub
# GitHub will automatically run GREEN gate checks

# 6. When PR is approved and merged to main:
# - GREEN gate runs again
# - Auto-deploy workflow deploys to production
# - Health check validates deployment
```

### You Do Nothing™

Once setup, the system handles:

- ✅ Code hygiene enforcement
- ✅ Secret prevention
- ✅ PR checks + merge gating
- ✅ Deploy on GREEN
- ✅ Server cleanup nightly
- ✅ Dependency updates (Dependabot)

## Monitoring

### Check Deployment Status

```bash
# View workflow runs
gh run list --workflow=deploy.yml

# View latest deployment
gh run view --workflow=deploy.yml
```

### Check Server Health

```bash
curl https://djdannyhecticb.com/api/health
```

### View Maintenance Logs

```bash
ssh deploy@djdannyhecticb.com
tail -f /var/log/maintenance.log
```

## Troubleshooting

### Deployment Failed

1. Check GitHub Actions logs
2. SSH into server and check logs:
   ```bash
   docker compose logs -f
   ```
3. Manually run health check:
   ```bash
   curl -v https://djdannyhecticb.com/api/health
   ```

### GREEN Gate Failed

1. Check which check failed in GitHub Actions
2. Run locally to reproduce:
   ```bash
   pnpm ci:gate
   ```
3. Fix issues and push again

### Disk Space Issues

1. Check disk usage:
   ```bash
   df -h
   docker system df
   ```
2. Manually run maintenance:
   ```bash
   sudo -u deploy /var/www/djdannyhecticb/scripts/maintenance.sh
   ```

## Cost

- **GitHub Actions**: Free tier (2,000 minutes/month)
- **Server**: Your existing VPS
- **AI Triage** (optional): Free (Ollama local)
- **GitLab Mirror** (optional): Free tier

Total: **£0** additional cost

## Security

- Secrets never committed to git (Gitleaks enforcement)
- Cousin-code bleed detection (no-bleed.sh)
- SSH key-based deployment (no passwords)
- Branch protection (no direct pushes to main)
- Required checks (no broken code in production)

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review this README
3. Check server logs (`docker compose logs`)
4. Create GitHub issue if needed
