# Production Deployment Checklist

## Status: Ready for Merge & Deploy

**Branch:** `copilot/add-beatport-api-integration`  
**Status:** All merge gates passed ✅  
**Ready:** Production deployment pending

---

## Pre-Deployment Verification ✅

- [x] Build succeeds (`pnpm build`)
- [x] TypeScript check passes (0 errors)
- [x] Beatport unit tests pass (11/11)
- [x] No secrets in client bundle
- [x] CI/CD gates configured
- [x] Documentation complete

---

## Deployment Steps

### Step 1: Merge to Main

If not already merged:
```bash
# On GitHub, merge PR: copilot/add-beatport-api-integration → main
```

### Step 2: SSH to Production

User needs to provide SSH details or execute commands on production:

```bash
# SSH into production server
ssh user@djdannyhecticb.com  # (adjust with actual credentials)
```

### Step 3: Locate Repository

```bash
# Find the repo directory
find / -maxdepth 4 -type d -name ".git" 2>/dev/null | grep djdannyhecticb

# Expected output example: /var/www/djdannyhecticb/.git
```

### Step 4: Deploy Code

```bash
# Navigate to repo
cd /var/www/djdannyhecticb  # (use actual path from step 3)

# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Build application
pnpm build

# Restart services
docker-compose down
docker-compose up -d --build

# OR if using docker compose (no hyphen)
docker compose down
docker compose up -d --build
```

### Step 5: Verify Environment Variables

Ensure production `.env` includes:

```bash
# Beatport API credentials (REQUIRED)
BEATPORT_CLIENT_ID=your_production_client_id
BEATPORT_CLIENT_SECRET=your_production_client_secret
BEATPORT_API_BASE=https://api.beatport.com/v4

# Other existing variables...
```

---

## Post-Deployment Verification (2 minutes)

### 1. Homepage Check
- [ ] Visit https://djdannyhecticb.com/
- [ ] Events section loads
- [ ] No console errors
- [ ] Build artifacts refreshed (check for Jan 6 vs new build date)

### 2. Shop Functionality
- [ ] https://djdannyhecticb.com/shop loads
- [ ] Charts display correctly
- [ ] Genre navigation works
- [ ] Search returns results
- [ ] "Open on Beatport" links work

### 3. Security Verification
- [ ] Open Browser DevTools → Network tab
- [ ] Navigate shop pages
- [ ] Confirm: NO `BEATPORT_CLIENT_ID` or `BEATPORT_CLIENT_SECRET` in responses
- [ ] Confirm: NO tokens in localStorage or sessionStorage

### 4. Admin Dashboard
- [ ] Visit https://djdannyhecticb.com/admin/beatport (requires admin login)
- [ ] Cache statistics display
- [ ] Health metrics show "Connected"
- [ ] Clear cache button works

### 5. Click Tracking
- [ ] Click several "Open on Beatport" links
- [ ] Check admin dashboard or database
- [ ] Confirm: Click events are being logged
- [ ] Verify: UTM parameters present in outbound URLs

### 6. Links Validation
- [ ] Check GET TICKETS links validate http/https only
- [ ] No broken links in navigation

---

## Rollback Procedure (If Needed)

If deployment fails or issues arise:

```bash
cd /var/www/djdannyhecticb

# Revert to previous commit
git reset --hard HEAD~1

# Reinstall dependencies
pnpm install

# Rebuild
pnpm build

# Restart services
docker-compose down
docker-compose up -d --build
```

---

## Common Issues & Solutions

### Issue: "pnpm: command not found"
```bash
npm install -g pnpm@10.27.0
```

### Issue: "docker-compose: command not found"
Try `docker compose` (without hyphen) instead:
```bash
docker compose --version
```

### Issue: Build fails with missing dependencies
```bash
pnpm install --no-frozen-lockfile
pnpm build
```

### Issue: Beatport API returns 401
- Check `.env` has correct credentials
- Verify credentials with Beatport
- Check server logs: `docker-compose logs -f` or `docker compose logs -f`

### Issue: Shop pages show "No data"
- Verify environment variables are set
- Check server logs for API errors
- Test token refresh: Clear cache in admin dashboard

---

## Success Criteria

Deployment is successful when:

✅ Build timestamp reflects new deployment (not Jan 6)  
✅ /shop pages load and function correctly  
✅ No Beatport tokens visible in browser  
✅ Admin dashboard accessible and operational  
✅ Click tracking logs events  
✅ All existing features still work  

---

## Contact Information

**Repository:** https://github.com/richhabits/djdannyhecticb  
**Branch:** copilot/add-beatport-api-integration  
**Documentation:** See `BEATPORT_INTEGRATION.md` for complete guide

---

## Notes

- The sandboxed CI environment cannot access production servers
- User must execute deployment commands on actual production infrastructure
- All code is verified and ready - deployment is the final gate
- Monitor logs after deployment for any runtime issues

**Last Updated:** 2026-02-09  
**Status:** AWAITING PRODUCTION DEPLOYMENT
