# Instant Webhook Deployment

**The fastest deployment system: GitHub push → Server deploys → Live in seconds.**

## Overview

This is an **event-driven, server-authoritative deployment system** where:
- GitHub is the trigger (webhook)
- Your server is the deployer (authoritative)
- CI runs for governance (but doesn't block)
- Deployment takes seconds (not minutes)

**Cost:** £0

**Latency:** 5-15 seconds from push to live

---

## Architecture

### Old Model (CI/CD Wait)
```
git push → CI queue → Wait → Build → Wait → Deploy → Wait → Live
Latency: 3-10 minutes
```

### New Model (Instant Webhook)
```
git push → Webhook (instant) → Server deploys → Live
Latency: 5-15 seconds
```

**Key Difference:** Server is authoritative. No waiting for CI runners.

---

## Components

### 1. Deploy Script (`/opt/djdannyhecticb/deploy.sh`)

**Purpose:** Idempotent deployment script that runs on server

**What it does:**
1. Git pull latest code
2. Install dependencies (pnpm)
3. Build application
4. Restart Docker containers
5. Health check validation
6. Log deployment

**Location on server:** `/opt/djdannyhecticb/deploy.sh`

**Features:**
- ✅ Safe to run multiple times
- ✅ Always matches GitHub main
- ✅ Fails hard on errors
- ✅ Comprehensive logging
- ✅ Health check validation
- ✅ Reports duration

### 2. Webhook Listener (`webhook`)

**Purpose:** Lightweight HTTP server that receives GitHub webhooks

**Installation:**
```bash
apt install webhook -y
```

**Configuration:** `/opt/djdannyhecticb/hooks.json`

**Port:** 9001

**Features:**
- ✅ HMAC signature validation (secure)
- ✅ Main branch filtering
- ✅ JSON response
- ✅ Environment passing

### 3. Systemd Service

**Purpose:** Keep webhook listener running 24/7

**File:** `/etc/systemd/system/webhook.service`

**Features:**
- ✅ Auto-restart on failure
- ✅ Starts on boot
- ✅ Security hardening
- ✅ Log rotation

### 4. GitHub Webhook

**Purpose:** Trigger instant deployment on push

**Configuration:** In GitHub repo settings

**Events:** Push to main branch only

---

## Installation

### Step 1: Server Preparation

```bash
# Create deploy user (if not exists)
sudo adduser --system --group --home /opt/djdannyhecticb deploy

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Create directories
sudo mkdir -p /opt/djdannyhecticb
sudo mkdir -p /var/www/djdannyhecticb
sudo mkdir -p /var/log

# Set permissions
sudo chown -R deploy:deploy /opt/djdannyhecticb
sudo chown -R deploy:deploy /var/www/djdannyhecticb
```

### Step 2: Install Dependencies

```bash
# Install webhook listener
sudo apt update
sudo apt install webhook -y

# Install pnpm (if not installed)
sudo npm install -g pnpm

# Verify installations
webhook --version
pnpm --version
docker --version
```

### Step 3: Deploy Script Setup

```bash
# Copy deploy script to server
sudo cp scripts/deploy.sh /opt/djdannyhecticb/deploy.sh

# Make executable
sudo chmod +x /opt/djdannyhecticb/deploy.sh

# Test manually (as deploy user)
sudo -u deploy /opt/djdannyhecticb/deploy.sh
```

**Expected output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 INSTANT DEPLOY TRIGGERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Step 1/6: Pulling latest code...
   ✅ Updated: abc1234 → def5678
📦 Step 2/6: Installing dependencies...
   ✅ Dependencies installed
🏗️  Step 3/6: Building application...
   ✅ Build complete
🐳 Step 4/6: Restarting Docker containers...
   ✅ Docker containers restarted
⏳ Step 5/6: Waiting for services to start...
   ✅ Services should be ready
🏥 Step 6/6: Running health check...
   ✅ Health check passed (attempt 1/3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ DEPLOYMENT SUCCESSFUL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Commit: def5678
Duration: 12s
URL: https://djdannyhecticb.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Webhook Configuration

```bash
# Generate webhook secret (save this!)
openssl rand -hex 32

# Copy hooks configuration
sudo cp scripts/hooks.json /opt/djdannyhecticb/hooks.json

# Edit hooks.json and add your webhook secret
sudo nano /opt/djdannyhecticb/hooks.json
# Replace: YOUR_WEBHOOK_SECRET_HERE

# Set permissions
sudo chown deploy:deploy /opt/djdannyhecticb/hooks.json
sudo chmod 600 /opt/djdannyhecticb/hooks.json
```

### Step 5: Systemd Service

```bash
# Copy service file
sudo cp scripts/webhook.service /etc/systemd/system/webhook.service

# Reload systemd
sudo systemctl daemon-reload

# Enable service (start on boot)
sudo systemctl enable webhook

# Start service
sudo systemctl start webhook

# Check status
sudo systemctl status webhook
```

**Expected output:**
```
● webhook.service - GitHub Webhook Listener for DJ DANNY HECTIC B
     Loaded: loaded (/etc/systemd/system/webhook.service; enabled)
     Active: active (running) since Mon 2026-02-11 02:30:00 UTC; 5s ago
   Main PID: 12345 (webhook)
      Tasks: 1 (limit: 4915)
     Memory: 8.2M
     CGroup: /system.slice/webhook.service
             └─12345 /usr/bin/webhook -hooks /opt/djdannyhecticb/hooks.json -port 9001 -verbose
```

### Step 6: GitHub Webhook Setup

**In GitHub:**

1. Go to your repo → **Settings** → **Webhooks** → **Add webhook**

2. **Payload URL:**
   ```
   http://YOUR_SERVER_IP:9001/hooks/deploy
   ```
   
   Or with domain:
   ```
   https://webhook.djdannyhecticb.com/hooks/deploy
   ```

3. **Content type:** `application/json`

4. **Secret:** (paste the secret from Step 4)

5. **Which events?** 
   - ☑️ Just the push event

6. **Active:** ✅

7. Click **Add webhook**

### Step 7: Test the System

**From your local machine:**

```bash
# Make a small change
echo "# Test" >> README.md
git add README.md
git commit -m "test: webhook deployment"
git push origin main
```

**On the server:**

```bash
# Watch the logs live
tail -f /var/log/djdannyhecticb-deploy.log

# Or webhook logs
tail -f /var/log/webhook.log
```

**Expected:**
- Webhook receives request instantly
- Deploy script runs
- Docker restarts
- Health check passes
- Site is live within 10-15 seconds

---

## Security

### HMAC Validation

The webhook listener validates GitHub signatures using HMAC-SHA256.

**How it works:**
1. GitHub signs webhook payload with your secret
2. Sends signature in `X-Hub-Signature-256` header
3. Webhook listener verifies signature
4. Only deploys if signature matches

**Security benefits:**
- ✅ Prevents unauthorized deployments
- ✅ Ensures webhook is from GitHub
- ✅ Protects against replay attacks

### Firewall Configuration

**Option A: Public webhook (simple)**
```bash
# Allow webhook port
sudo ufw allow 9001/tcp

# Restrict to GitHub IPs (recommended)
# See: https://api.github.com/meta
```

**Option B: Reverse proxy (production)**
```nginx
# /etc/nginx/sites-available/webhook
server {
    listen 443 ssl http2;
    server_name webhook.djdannyhecticb.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /hooks/ {
        proxy_pass http://localhost:9001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Deploy User Permissions

**Principle of least privilege:**

```bash
# Deploy user should have:
# - Read access to /var/www/djdannyhecticb
# - Execute access to git, pnpm, docker
# - Write access to logs

# Deploy user should NOT have:
# - sudo access
# - Access to other users' files
# - Ability to modify system files
```

---

## Monitoring

### Deployment Logs

```bash
# View recent deployments
tail -n 100 /var/log/djdannyhecticb-deploy.log

# Watch live
tail -f /var/log/djdannyhecticb-deploy.log

# Search for failures
grep "ERROR" /var/log/djdannyhecticb-deploy.log

# Count successful deployments
grep "DEPLOYMENT SUCCESSFUL" /var/log/djdannyhecticb-deploy.log | wc -l
```

### Webhook Logs

```bash
# View webhook activity
tail -n 100 /var/log/webhook.log

# Watch live
tail -f /var/log/webhook.log

# Check for errors
tail -n 100 /var/log/webhook-error.log
```

### Health Monitoring

```bash
# Check if webhook service is running
systemctl status webhook

# Check if site is live
curl -fsS https://djdannyhecticb.com/api/health

# Check Docker containers
docker compose ps
```

---

## Troubleshooting

### Webhook Not Triggered

**Check GitHub webhook status:**
1. GitHub → Settings → Webhooks
2. Click on your webhook
3. Check "Recent Deliveries"
4. Look for failed requests

**Common issues:**
- ❌ Firewall blocking port 9001
- ❌ Webhook service not running
- ❌ Wrong URL in GitHub
- ❌ HMAC secret mismatch

**Solutions:**
```bash
# Check firewall
sudo ufw status

# Check service
systemctl status webhook

# Test webhook endpoint
curl http://localhost:9001/hooks/deploy
```

### Deploy Script Fails

**Check logs:**
```bash
tail -n 50 /var/log/djdannyhecticb-deploy.log | grep "ERROR"
```

**Common issues:**
- ❌ Git authentication fails
- ❌ pnpm not found
- ❌ Docker permission denied
- ❌ Build errors
- ❌ Health check fails

**Solutions:**
```bash
# Test as deploy user
sudo -u deploy bash
cd /var/www/djdannyhecticb

# Test git
git fetch origin main

# Test pnpm
pnpm --version

# Test docker
docker ps

# Test health endpoint
curl https://djdannyhecticb.com/api/health
```

### Health Check Fails

**Diagnosis:**
```bash
# Check if containers are running
docker compose ps

# Check container logs
docker compose logs

# Test health endpoint directly
curl -v https://djdannyhecticb.com/api/health
```

**Common issues:**
- ❌ Containers not started
- ❌ Health endpoint returns wrong status
- ❌ SSL/TLS issues
- ❌ Port conflicts

---

## CI/CD Integration

### CI Governance (Non-Blocking)

CI still runs for quality checks but doesn't block deployment.

**Green Gate workflow** (`.github/workflows/gate.yml`):
- ✅ TypeScript check
- ✅ Build verification
- ✅ Tests
- ✅ Secret scanning
- ✅ Cousin-code detection

**Purpose:**
- Alerts you to issues
- Prevents bad code from being merged (in PRs)
- Documents code quality
- Enables auto-revert (optional)

### Auto-Revert (Optional)

If CI fails after deployment, auto-revert to last good commit:

```bash
#!/bin/bash
# /opt/djdannyhecticb/revert.sh

cd /var/www/djdannyhecticb
LAST_GOOD=$(git rev-parse HEAD~1)
git reset --hard $LAST_GOOD
/opt/djdannyhecticb/deploy.sh
```

Call from GitHub Actions on CI failure.

---

## Performance

### Latency Breakdown

**Typical deployment:**
```
Event          | Duration
---------------|----------
GitHub push    | 0s
Webhook call   | <1s
Git pull       | 1-2s
pnpm install   | 2-3s
pnpm build     | 3-5s
Docker restart | 2-3s
Health check   | 1-2s
---------------|----------
TOTAL          | 10-15s
```

**Optimization tips:**
- Use pnpm (faster than npm)
- Cache Docker layers
- Use frozen lockfile
- Parallel builds (if applicable)

### Scaling

**Single server:**
- ✅ Simple
- ✅ Fast
- ✅ No coordination needed
- ✅ Predictable

**Multiple servers:**
- Add load balancer
- Deploy to all servers in sequence
- Or use blue-green deployment
- Or use rolling updates

---

## Comparison

### vs GitHub Actions Deploy

| Feature | Webhook | GitHub Actions |
|---------|---------|----------------|
| Latency | 10-15s | 3-10 min |
| Cost | £0 | £0 (free tier) |
| Control | Full | Limited |
| Complexity | Low | Medium |
| CI queue | No wait | Wait in queue |
| Server load | Local | GitHub runners |

### vs Vercel/Netlify

| Feature | Webhook | Vercel/Netlify |
|---------|---------|----------------|
| Latency | 10-15s | 30-60s |
| Cost | £0 | £20-100/mo |
| Control | Full | Limited |
| Lock-in | None | High |
| Custom infra | Yes | No |
| Build cache | Local | Cloud |

---

## Advanced

### Email Notifications

Add to deploy.sh:
```bash
# After successful deployment
curl -X POST "https://api.mailgun.net/v3/$DOMAIN/messages" \
  --form from='Deploy Bot <deploy@djdannyhecticb.com>' \
  --form to='romeo.valentine@icloud.com' \
  --form subject='✅ Deployment Successful' \
  --form text="Commit $NEW_COMMIT deployed in ${DURATION}s"
```

### Slack Notifications

```bash
# After successful deployment
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "✅ Deployment successful",
    "attachments": [{
      "fields": [
        {"title": "Commit", "value": "'"$NEW_COMMIT"'", "short": true},
        {"title": "Duration", "value": "'"$DURATION"'s", "short": true}
      ]
    }]
  }'
```

### Deployment Metrics

Track deployment frequency and duration:

```bash
# Add to deploy.sh
echo "$NEW_COMMIT,$DURATION,$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> /var/log/deploy-metrics.csv
```

Analyze:
```bash
# Average deployment time
awk -F',' '{sum+=$2; count++} END {print sum/count}' /var/log/deploy-metrics.csv

# Deployments per day
awk -F',' '{print $3}' /var/log/deploy-metrics.csv | cut -d'T' -f1 | uniq -c
```

---

## Maintenance

### Log Rotation

```bash
# /etc/logrotate.d/djdannyhecticb
/var/log/djdannyhecticb-deploy.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    postrotate
        systemctl reload webhook
    endscript
}
```

### Disk Space Monitoring

```bash
# Add to cron
0 * * * * df -h / | grep -v Filesystem | awk '{if($5+0 > 80) print "Disk usage high: "$5}' | mail -s "Disk Alert" admin@djdannyhecticb.com
```

---

## References

- [webhook GitHub](https://github.com/adnanh/webhook)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)
- [systemd service](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

**Last Updated:** 2026-02-11

**Status:** Production Ready ✅

**Latency:** 10-15 seconds

**Cost:** £0/month
