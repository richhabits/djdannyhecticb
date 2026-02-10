# DEPLOYMENT INSTRUCTIONS - MANUAL EXECUTION REQUIRED

## Current Situation

**Branch:** `copilot/add-beatport-api-integration`  
**Status:** ✅ Code complete, tests passing, ready to deploy  
**Blocker:** PR not merged to main + production access needed

---

## STEP 1: Merge PR to Main (YOU MUST DO THIS)

### On GitHub.com:

1. Go to: https://github.com/richhabits/djdannyhecticb/pulls
2. Find PR: `copilot/add-beatport-api-integration`
3. Verify CI is ✅ green
4. Click **"Merge pull request"**
5. Confirm merge to `main`

**Until this is done, production cannot be updated.**

---

## STEP 2: Find Your Production SSH Details (Run on YOUR Mac)

Open Terminal on your Mac and run these commands:

```bash
# Check SSH config
grep -R "Host djdanny\|djdannyhecticb\|hectic\|asura" ~/.ssh/config 2>/dev/null || echo "No config found"

# Check SSH history
history | grep "ssh " | tail -n 20

# List SSH keys
ls -la ~/.ssh/

# Check for saved hostnames
cat ~/.ssh/known_hosts 2>/dev/null | cut -d' ' -f1 | sort -u | head -20
```

**Paste the output here** (you can redact IP addresses but keep the structure).

---

## STEP 3: Once You Have SSH Access

### Option A: You provide SSH details

If you find SSH access, run this **on the production server**:

```bash
pwd
ls -la
docker-compose --version 2>/dev/null || echo "no docker-compose"
docker compose version 2>/dev/null || echo "no docker compose"
node -v 2>/dev/null || echo "no node"
pnpm -v 2>/dev/null || echo "no pnpm"
pm2 list 2>/dev/null || echo "no pm2"
```

**Paste that output** and I'll give you exact deploy commands.

### Option B: Set up GitHub Actions auto-deploy

If you want automation, add these secrets to GitHub repo settings:

```
PROD_HOST=your.server.ip
PROD_USER=your_username
PROD_SSH_KEY=<contents of your private key>
PROD_PATH=/path/to/repo/on/server
```

Then I can create a `.github/workflows/deploy.yml` that auto-deploys on merge to main.

### Option C: Hosting panel (cPanel/similar)

If production is NOT Docker-based, tell me:
- Hosting provider (Asura? cPanel?)
- How you normally update the site
- Whether you use FTP, Git, or a control panel

---

## What Happens After Merge + Deploy

Once deployed, verify at:
- ✅ https://djdannyhecticb.com/ (homepage loads)
- ✅ https://djdannyhecticb.com/shop (Beatport shop works)
- ✅ https://djdannyhecticb.com/admin/beatport (admin dashboard, requires login)
- ✅ Browser DevTools → Network: NO Beatport tokens visible

---

## Quick Reference: Deployment Commands

### If using Docker (most likely):
```bash
cd /path/to/repo
git pull origin main
pnpm install
pnpm build
docker-compose down
docker-compose up -d --build
```

### If using PM2:
```bash
cd /path/to/repo
git pull origin main
pnpm install
pnpm build
pm2 restart all
```

### If using systemd:
```bash
cd /path/to/repo
git pull origin main
pnpm install
pnpm build
sudo systemctl restart djdannyhecticb
```

---

## I Am Waiting For:

1. ✅ Confirmation that PR is merged
2. ✅ Your production SSH details (from commands above)

**Once I have those, I can provide exact deployment commands for your specific setup.**

---

## Current Limitations

I'm running in a GitHub Actions CI environment (`runner@runnervmwffz4`).

**I cannot:**
- Merge PRs (GitHub UI only)
- Access your Mac
- SSH to your production server
- Run commands on your local machine

**I can:**
- Prepare deployment scripts
- Update CI/CD workflows
- Document procedures
- Guide you through the process

---

**Next Action:** Run the SSH discovery commands on your Mac and paste the output.
