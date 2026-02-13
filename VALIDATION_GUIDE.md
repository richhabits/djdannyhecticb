# Deployment Validation Guide

This guide validates that the DJ Danny Hectic B deployment is truly enterprise-grade, not just well-documented.

## Quick Validation Checklist

Run these commands on the server to verify deployment quality:

```bash
# 1. Check releases exist
ls -1dt /srv/djdannyhecticb/releases/*

# 2. Check current symlink
ls -l /srv/djdannyhecticb/current

# 3. Check real Vite output
ls -la /srv/djdannyhecticb/current/public | head -n 20

# 4. Automated validation (all 7 checks)
sudo ./scripts/server/validate-deployment.sh
```

---

## Automated Validation Script

**Location**: `scripts/server/validate-deployment.sh`

**Usage**:
```bash
sudo ./scripts/server/validate-deployment.sh
```

**What it checks** (7 validations):

1. ✅ **Release Directory Structure** 
   - Releases exist and are timestamped
   - Format: YYYYMMDD-HHMMSS

2. ✅ **Current Symlink Validity**
   - Symlink exists and points to valid release
   - Public directory is accessible

3. ✅ **Real Vite Output**
   - index.html exists with reasonable size
   - Hashed assets present (not placeholder)
   - No placeholder content

4. ✅ **pnpm Enforcement**
   - pnpm installed and working
   - preinstall hook blocks npm

5. ✅ **No Cross-Project Contamination**
   - No radiohectic references
   - No hectictv references
   - Clean project isolation

6. ✅ **nginx Configuration Isolation**
   - Serves from /srv/djdannyhecticb/current/public
   - Not /srv/hectic/*

7. ✅ **Performance Check**
   - Response time < 0.5s
   - Health check endpoint accessible

---

## Manual Validation Steps

### 1. Verify Release Structure

**Command**:
```bash
ls -1dt /srv/djdannyhecticb/releases/*
```

**Expected output**:
```
/srv/djdannyhecticb/releases/20260213-002100
/srv/djdannyhecticb/releases/20260213-001500
/srv/djdannyhecticb/releases/20260213-000900
```

**✅ Pass**: Multiple timestamped directories exist
**❌ Fail**: No directories or wrong naming format

---

### 2. Verify Current Symlink

**Command**:
```bash
ls -l /srv/djdannyhecticb/current
```

**Expected output**:
```
lrwxrwxrwx 1 hectic hectic 47 Feb 13 00:21 /srv/djdannyhecticb/current -> releases/20260213-002100
```

**✅ Pass**: Symlink points to latest timestamped release
**❌ Fail**: Not a symlink or broken link

---

### 3. Verify Real Vite Output

**Command**:
```bash
ls -la /srv/djdannyhecticb/current/public | head -n 20
```

**Expected output**:
```
total 156
drwxr-xr-x 3 hectic hectic  4096 Feb 13 00:21 .
drwxr-xr-x 3 hectic hectic  4096 Feb 13 00:21 ..
drwxr-xr-x 2 hectic hectic 20480 Feb 13 00:21 assets
-rw-r--r-- 1 hectic hectic 42156 Feb 13 00:21 index.html
-rw-r--r-- 1 hectic hectic    38 Feb 13 00:21 health.txt
```

**Check assets directory**:
```bash
ls /srv/djdannyhecticb/current/public/assets/ | head -n 10
```

**Expected**: Hashed filenames like:
```
index-a1b2c3d4.js
vendor-e5f6g7h8.js
main-i9j0k1l2.css
```

**✅ Pass**: Hashed assets present, index.html > 10KB
**❌ Fail**: Placeholder content or no hashed assets

---

### 4. Verify pnpm Enforcement

**Commands**:
```bash
cd /srv/djdannyhecticb/repo
grep preinstall package.json
pnpm -v
```

**Expected output**:
```json
"preinstall": "npx only-allow pnpm"
```

**pnpm version**:
```
9.15.5
```

**Test enforcement**:
```bash
cd /srv/djdannyhecticb/repo
npm install  # Should fail
pnpm install --frozen-lockfile  # Should succeed
```

**✅ Pass**: npm blocked, pnpm works
**❌ Fail**: npm installs successfully

---

### 5. Verify No Cross-Project Contamination

**Commands**:
```bash
grep -R "radiohectic" /srv/djdannyhecticb 2>/dev/null | grep -v ".git" | grep -v "node_modules"
grep -R "hectictv" /srv/djdannyhecticb 2>/dev/null | grep -v ".git" | grep -v "node_modules"
```

**Expected output**:
```
(no output - empty)
```

**✅ Pass**: No results
**❌ Fail**: References to other projects found

---

### 6. Verify nginx Isolation

**Command**:
```bash
sudo nginx -T | sed -n '/server_name djdannyhecticb\.com/,/}/p'
```

**Expected**: Root must be:
```nginx
root /srv/djdannyhecticb/current/public;
```

**✅ Pass**: Serves from /srv/djdannyhecticb
**❌ Fail**: References /srv/hectic

---

### 7. Verify Performance

**Command**:
```bash
curl -s -o /dev/null -w "%{time_total}\n" https://djdannyhecticb.com
```

**Expected**: Under 0.3-0.5s
```
0.234
```

**Check health endpoint**:
```bash
curl https://djdannyhecticb.com/health.txt
```

**Expected**:
```
OK - Deployed at 2026-02-13T00:21:00Z
```

**✅ Pass**: < 0.5s and health check returns 200 OK
**❌ Fail**: > 0.5s or health check fails

---

## What Makes This Enterprise-Grade

### ✅ Current Implementation

| Feature | Status | Details |
|---------|--------|---------|
| Atomic deploys | ✅ | Symlink switching |
| Rollback script | ✅ | One command |
| pnpm enforced | ✅ | preinstall hook |
| Static isolation | ✅ | /srv/djdannyhecticb |
| SSH-only workflow | ✅ | GitHub Actions |
| Separate project root | ✅ | No /srv/hectic |
| **Health check endpoint** | ✅ | /health.txt |
| **Deploy lock** | ✅ | flock-based |
| **Log rotation** | ✅ | /var/log/djdannyhecticb/ |
| **Fail-fast validation** | ✅ | dist/public check |
| **Auto-prune releases** | ✅ | Keep last 5 |

### Enterprise Features Explained

**1. Health Check Endpoint**
- File: `/health.txt`
- Returns: 200 OK with timestamp
- Use: Monitoring, load balancers, CI/CD validation
- Updates: Every deployment

**2. Deploy Lock**
- Method: flock on `/var/lock/djdannyhecticb-deploy.lock`
- Purpose: Prevent parallel builds
- Behavior: Second deploy waits or fails immediately
- Release: Automatic on completion/error

**3. Structured Logging**
- Location: `/var/log/djdannyhecticb/deploy.log`
- Format: Timestamped entries
- Content: All deploy operations, errors, timing
- Rotation: System logrotate handles it

**4. Fail-Fast Validation**
- Checks: `dist/public` and `index.html` exist
- When: Before rsync to release
- Behavior: Exit immediately if missing
- Result: No broken deployments

**5. Auto-Prune Releases**
- Keep: Last 5 releases
- When: After successful deploy
- Method: `ls -1dt | tail -n +6 | xargs rm -rf`
- Result: Stable disk usage, always have rollback options

---

## Troubleshooting

### Issue: No Releases Found

**Symptom**: `ls /srv/djdannyhecticb/releases/` is empty

**Cause**: Deploy never ran successfully

**Fix**:
```bash
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

---

### Issue: Current Symlink Broken

**Symptom**: `ls -l /srv/djdannyhecticb/current` shows broken link

**Cause**: Release was deleted manually

**Fix**: Recreate symlink to latest release
```bash
LATEST=$(ls -1dt /srv/djdannyhecticb/releases/* | head -n 1)
ln -sfn "$LATEST" /srv/djdannyhecticb/current
sudo systemctl reload nginx
```

---

### Issue: Placeholder Content Still Showing

**Symptom**: Site shows "Deploy pipeline online"

**Cause**: Real deployment hasn't completed yet

**Fix**: Run manual deploy
```bash
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

**Verify**:
```bash
grep -q "Deploy pipeline online" /srv/djdannyhecticb/current/public/index.html
echo $?  # Should be 1 (not found) if real deployment succeeded
```

---

### Issue: pnpm Not Working

**Symptom**: `pnpm: command not found`

**Cause**: corepack not enabled

**Fix**:
```bash
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm -v  # Should show 9.15.5
```

---

### Issue: Cross-Project References Found

**Symptom**: Validation finds radiohectic/hectictv

**Cause**: Contamination from shared infrastructure

**Fix**: Clean up references
```bash
# Find exact locations
grep -rn "radiohectic" /srv/djdannyhecticb --exclude-dir=node_modules --exclude-dir=.git

# Manual cleanup of affected files
```

---

### Issue: nginx Serves Wrong Directory

**Symptom**: nginx root is `/srv/hectic/...`

**Cause**: Wrong vhost configuration

**Fix**: Update nginx config
```bash
sudo nano /etc/nginx/sites-available/djdannyhecticb.com
# Change root to: /srv/djdannyhecticb/current/public

sudo nginx -t && sudo systemctl reload nginx
```

---

### Issue: Poor Performance (> 0.5s)

**Symptom**: Response time exceeds threshold

**Possible causes**:
1. Server overloaded
2. Slow disk I/O
3. Large build output
4. Network issues

**Diagnose**:
```bash
# Check server load
uptime

# Check disk I/O
iostat -x 1 5

# Check response breakdown
curl -w "@-" -o /dev/null -s https://djdannyhecticb.com <<'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
EOF
```

---

## Emergency Procedures

### Emergency Rollback

**Scenario**: Latest deployment is broken

**Solution**: Use rollback script
```bash
sudo /usr/local/bin/rollback-djdannyhecticb.sh
```

**Manual rollback**:
```bash
# List releases
ls -1dt /srv/djdannyhecticb/releases/*

# Pick previous release
PREV=/srv/djdannyhecticb/releases/20260213-001500

# Switch symlink
ln -sfn "$PREV" /srv/djdannyhecticb/current

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx
```

**Verify**:
```bash
curl -I https://djdannyhecticb.com
```

---

### Emergency: Fix Broken Deployment

**Scenario**: All releases are broken

**Solution**: Deploy known good commit
```bash
cd /srv/djdannyhecticb/repo
git log --oneline | head -n 10  # Find good commit
git reset --hard <commit-sha>
sudo /usr/local/bin/deploy-djdannyhecticb-static.sh main
```

---

### Emergency: nginx Down

**Scenario**: nginx not responding

**Diagnose**:
```bash
sudo systemctl status nginx
sudo nginx -t
```

**Fix**:
```bash
# Fix config errors
sudo nano /etc/nginx/sites-available/djdannyhecticb.com

# Test and restart
sudo nginx -t && sudo systemctl restart nginx
```

---

## Monitoring Commands

### Check Deployment Status
```bash
# Current release
ls -l /srv/djdannyhecticb/current

# Release count
ls -1d /srv/djdannyhecticb/releases/* | wc -l

# Disk usage
du -sh /srv/djdannyhecticb/*
```

### Check Logs
```bash
# Deploy logs
tail -f /var/log/djdannyhecticb/deploy.log

# nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Check Health
```bash
# Health endpoint
curl https://djdannyhecticb.com/health.txt

# Full headers
curl -I https://djdannyhecticb.com

# Performance
curl -s -o /dev/null -w "%{time_total}\n" https://djdannyhecticb.com
```

---

## Success Criteria

Your deployment is enterprise-grade if:

- [x] Multiple timestamped releases exist
- [x] Current is a valid symlink to latest
- [x] Real Vite build (hashed assets) deployed
- [x] pnpm enforced (npm blocked)
- [x] No cross-project contamination
- [x] nginx isolated to /srv/djdannyhecticb
- [x] Performance < 0.5s
- [x] Health check endpoint works
- [x] Deploy lock prevents parallel builds
- [x] Auto-prune keeps disk clean
- [x] Structured logs for audit trail

**If all criteria pass, deployment is production-ready.**

---

## References

- **DEPLOY_SERVER_SIDE.md** - Complete deployment guide
- **DEPLOYMENT_COMPLETE_SUMMARY.md** - Feature overview
- **README.md** - Quick start

---

**Run the automated validation script for instant pass/fail assessment:**

```bash
sudo ./scripts/server/validate-deployment.sh
```
