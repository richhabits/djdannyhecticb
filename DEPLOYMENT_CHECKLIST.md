# 🚀 Production Deployment Checklist

**Repository:** richhabits/djdannyhecticb  
**Target:** Production deployment  
**Last Updated:** 2026-02-09

---

## 🛡️ Architectural Boundary Verification

**Before deploying, verify the architectural boundary is maintained:**

- [ ] Reviewed [BOUNDARY_POLICY.md](./BOUNDARY_POLICY.md)
- [ ] Confirmed no shared backend services with other Hectic properties
- [ ] Confirmed no shared databases or auth systems
- [ ] Confirmed `VITE_HECTIC_RADIO_STREAM_URL` is external URL only
- [ ] Confirmed no Docker services shared with other properties
- [ ] Confirmed docker-compose.yml contains only this property's services

**This site is standalone. Any integration with Hectic Radio must be link-only (external media provider).**

---

## ✅ Pre-Deployment Validation

### DNS Configuration
- [ ] Verify all domains resolve to server IP (213.199.45.126):
```bash
for domain in djdannyhecticb.co.uk www.djdannyhecticb.co.uk djdannyhecticb.com www.djdannyhecticb.com djdannyhecticb.info www.djdannyhecticb.info djdannyhecticb.uk www.djdannyhecticb.uk; do
  echo -n "Checking $domain: "
  dig +short $domain
done
```
- [ ] DNS has been stable for >24 hours (propagation complete)

### Server Configuration
- [ ] Ports 80 and 443 open in firewall
- [ ] Docker and Docker Compose installed
- [ ] Git installed for repository clone
- [ ] Sufficient disk space (>10GB recommended)
- [ ] Sufficient RAM (>2GB recommended)

### Environment Variables
- [ ] Create `.env` file from `.env.example`
- [ ] Set `JWT_SECRET` (generate strong random string)
- [ ] Set `DATABASE_URL` (will use docker-compose default if not set)
- [ ] Set `OAUTH_SERVER_URL` and `APP_ID` if using OAuth
- [ ] Set `DB_ROOT_PASSWORD` environment variable on server:
```bash
export DB_ROOT_PASSWORD="your-secure-password"
echo 'export DB_ROOT_PASSWORD="your-secure-password"' >> ~/.bashrc
```

### Security Audit
- [ ] Review PRODUCTION_AUDIT_REPORT.md
- [ ] Review NGINX_SSL_STRATEGY.md
- [ ] Confirm no sensitive data in repository

---

## 🌐 Phase 1: HTTP-Only Deployment

### Step 1: Clone and Setup
```bash
cd /var/www
sudo git clone https://github.com/richhabits/djdannyhecticb.git
cd djdannyhecticb
sudo cp .env.example .env
sudo nano .env  # Edit with production values
```

- [ ] Repository cloned to `/var/www/djdannyhecticb`
- [ ] `.env` file created and configured

### Step 2: Deploy HTTP-Only
```bash
# Update docker-compose.yml to use nginx-http.conf
sudo sed -i 's|./nginx.conf:/etc/nginx/nginx.conf|./nginx-http.conf:/etc/nginx/nginx.conf|g' docker-compose.yml

# Build and start containers
sudo ./deploy.sh
```

- [ ] docker-compose.yml updated to use nginx-http.conf
- [ ] Containers built and started successfully

### Step 3: Verify HTTP Deployment
```bash
# Check all services are running
docker-compose ps

# Test local connection
curl http://localhost:3000

# Test domain (from external machine)
curl -I http://djdannyhecticb.co.uk
```

- [ ] All containers running (db, web, nginx, certbot)
- [ ] Application responds on port 3000
- [ ] Domain accessible via HTTP
- [ ] All 8 domains respond correctly

### Step 4: Smoke Test
- [ ] Visit http://djdannyhecticb.co.uk in browser
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] No JavaScript errors in console
- [ ] Admin panel accessible (if configured)

**If issues:** Check `docker-compose logs` for errors. Refer to PRODUCTION_AUDIT_REPORT.md support section.

---

## 🔒 Phase 2: SSL/TLS Deployment

### Step 1: Verify Certbot Challenge
```bash
# Create test file
sudo mkdir -p certbot/www/.well-known/acme-challenge
echo "test" | sudo tee certbot/www/.well-known/acme-challenge/test

# Test from external machine
curl http://djdannyhecticb.co.uk/.well-known/acme-challenge/test
# Should return: test
```

- [ ] Certbot challenge location accessible
- [ ] Returns test file content

### Step 2: Generate SSL Certificates
```bash
# Run SSL setup script
sudo ./setup-ssl.sh your-email@example.com
```

**This script will:**
1. Generate Let's Encrypt certificates for all domains
2. Automatically update docker-compose.yml to use nginx.conf (HTTPS mode)
3. Restart nginx with SSL enabled

- [ ] Certificate generation completed successfully
- [ ] No errors in output
- [ ] docker-compose.yml updated to nginx.conf

### Step 3: Verify HTTPS Deployment
```bash
# Test HTTPS connection
curl -I https://djdannyhecticb.co.uk

# Verify certificate
openssl s_client -connect djdannyhecticb.co.uk:443 -servername djdannyhecticb.co.uk < /dev/null | grep "Verify return code"
# Should return: Verify return code: 0 (ok)
```

- [ ] HTTPS responds with 200 OK
- [ ] Certificate is valid (verify return code: 0)
- [ ] HTTP redirects to HTTPS
- [ ] All 8 domains work over HTTPS

### Step 4: SSL Certificate Verification
- [ ] Visit https://djdannyhecticb.co.uk in browser
- [ ] No certificate warnings
- [ ] Green padlock icon visible
- [ ] Certificate details show correct domains
- [ ] Certificate expires in ~90 days

**If SSL fails:** Follow rollback procedure in NGINX_SSL_STRATEGY.md

---

## 📊 Phase 3: Post-Deployment Verification

### Application Health
```bash
# Check application logs
docker-compose logs -f web

# Check database connection
docker-compose exec web npm run db:push
```

- [ ] No errors in application logs
- [ ] Database migrations successful
- [ ] Application serving requests

### Monitoring Setup
```bash
# Add monitor script to crontab (every 5 minutes)
sudo crontab -e
# Add line: */5 * * * * /var/www/djdannyhecticb/monitor.sh

# Add daily maintenance to crontab (daily at 3am)
# Add line: 0 3 * * * /var/www/djdannyhecticb/daily-maintenance.sh
```

- [ ] Monitor script added to crontab
- [ ] Daily maintenance added to crontab
- [ ] Log files created in `/var/www/djdannyhecticb/logs/`

### Certbot Auto-Renewal
```bash
# Certbot container runs renewal every 12 hours automatically
# Verify it's running:
docker-compose ps certbot

# Test renewal (dry-run):
docker-compose run --rm certbot renew --dry-run
```

- [ ] Certbot container running
- [ ] Dry-run renewal successful

### Performance Testing
```bash
# Test response time
time curl -I https://djdannyhecticb.co.uk

# Check resource usage
docker stats --no-stream
```

- [ ] Response time < 1 second
- [ ] CPU usage reasonable (<50%)
- [ ] Memory usage within limits (db: <512MB, web: <512MB)

---

## 🛡️ Phase 4: Security Hardening (Optional - After 48h)

### HSTS Gradual Rollout

**Wait 48 hours** after SSL is stable, then:

#### Day 3: Enable HSTS (1 day)
```bash
# Edit nginx.conf, find line ~82, uncomment and set:
add_header Strict-Transport-Security "max-age=86400" always;  # 1 day

# Restart nginx
docker-compose restart nginx
```

- [ ] HSTS enabled with 1-day max-age
- [ ] Site still accessible
- [ ] HTTPS working correctly

#### Week 2: Increase HSTS (1 year)
```bash
# Edit nginx.conf, update HSTS line:
add_header Strict-Transport-Security "max-age=31536000" always;  # 1 year

# Restart nginx
docker-compose restart nginx
```

- [ ] HSTS increased to 1 year
- [ ] No issues reported

#### Month 2: Increase HSTS (2 years)
```bash
# Edit nginx.conf, update HSTS line:
add_header Strict-Transport-Security "max-age=63072000" always;  # 2 years

# Restart nginx
docker-compose restart nginx
```

- [ ] HSTS at maximum recommended duration
- [ ] Production stability confirmed

---

## 🚨 Rollback Procedures

### Rollback from HTTPS to HTTP
```bash
cd /var/www/djdannyhecticb

# Stop services
docker-compose down

# Switch to HTTP-only config
sudo sed -i 's|./nginx.conf:/etc/nginx/nginx.conf|./nginx-http.conf:/etc/nginx/nginx.conf|g' docker-compose.yml

# Restart services
docker-compose up -d

# Verify HTTP works
curl -I http://djdannyhecticb.co.uk
```

### Rollback to Previous Git Commit
```bash
cd /var/www/djdannyhecticb

# Stop services
docker-compose down

# Checkout previous commit
git log --oneline -5  # Find commit hash
git checkout <commit-hash>

# Rebuild and restart
docker-compose up -d --build
```

### Emergency Stop
```bash
# Stop all services immediately
docker-compose down

# Remove all containers (data persists in volumes)
docker-compose down --remove-orphans
```

---

## 📞 Support Contacts & Resources

### Documentation
- **Main Audit Report:** PRODUCTION_AUDIT_REPORT.md
- **SSL Strategy:** NGINX_SSL_STRATEGY.md
- **Server Commands:** SERVER_COMMANDS.md (if exists)
- **Deployment Guide:** README_DEPLOY.md (if exists)

### Log Locations
- Application logs: `docker-compose logs web`
- Nginx logs: `docker-compose logs nginx`
- Database logs: `docker-compose logs db`
- Certbot logs: `docker-compose logs certbot`
- Monitor logs: `/var/www/djdannyhecticb/logs/auto-fix.log`
- Maintenance logs: `/var/www/djdannyhecticb/logs/maintenance.log`

### Common Issues
| Issue | Check | Solution |
|-------|-------|----------|
| Site not accessible | Ports 80/443 | Check firewall, verify ports open |
| SSL generation fails | DNS records | Verify all domains resolve correctly |
| Database connection error | DB container | Check `docker-compose logs db` |
| Application crashes | Logs | Check `docker-compose logs web` |
| Out of memory | Resource usage | Increase server RAM or reduce limits |

### Health Check Endpoints
- Application: `https://djdannyhecticb.co.uk/api/health`
- Database: Check via application logs

---

## ✅ Final Verification Checklist

Before marking deployment complete:

### Functionality
- [ ] Homepage loads
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] Forms work (contact, login, etc.)
- [ ] API endpoints respond
- [ ] Database reads/writes work
- [ ] Admin panel accessible

### Security
- [ ] HTTPS enabled
- [ ] Certificate valid
- [ ] HTTP redirects to HTTPS
- [ ] Security headers present (check browser dev tools)
- [ ] No mixed content warnings
- [ ] CORS configured correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] No JavaScript errors
- [ ] Images optimized
- [ ] Gzip compression working
- [ ] Browser caching working

### Monitoring
- [ ] Monitor script running
- [ ] Daily maintenance scheduled
- [ ] Certbot auto-renewal verified
- [ ] Log rotation working
- [ ] Backup script running

### Documentation
- [ ] Deployment documented
- [ ] Team notified of deployment
- [ ] Rollback procedures tested
- [ ] Monitoring alerts configured

---

## 🎉 Deployment Complete!

**Congratulations!** Your DJ Danny Hectic B platform is now live in production.

### Next Steps
1. Monitor application for 48 hours
2. Review logs daily for first week
3. Test all functionality thoroughly
4. Gather user feedback
5. Plan feature releases

### Maintenance Schedule
- **Every 5 minutes:** Health check (monitor.sh)
- **Daily at 3am:** Maintenance (backups, log rotation, cleanup)
- **Every 12 hours:** SSL certificate renewal check (automatic)
- **Weekly:** Review logs and metrics
- **Monthly:** Security audit and dependency updates

---

**Last Updated:** 2026-02-09  
**Status:** ✅ Ready for Production Deployment
