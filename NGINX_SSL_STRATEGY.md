# Nginx / SSL Configuration Strategy

**Generated:** 2026-02-09  
**Status:** Production Risk Assessment

---

## 🔍 Current Configuration Analysis

### Files Reviewed
1. `nginx.conf` - Production HTTPS configuration (155 lines)
2. `nginx-simple.conf` - Simplified HTTPS configuration (130 lines)
3. `docker-compose.yml` - Service orchestration
4. `Dockerfile.nginx` - Nginx container build
5. `setup-ssl.sh` - SSL certificate provisioning script

---

## ⚠️ CRITICAL ISSUES IDENTIFIED

### 1. **Multi-Domain Certificate Mismatch** 🔴

**Problem:**
- `nginx.conf` lines 71-72: Primary domain (.co.uk) references **djdannyhecticb.co.uk** certificate
- `nginx.conf` lines 107-108: Secondary domains (.com, .info, .uk) reference **same** certificate
- `nginx-simple.conf` line 74-75: References **djdannyhecticb.com** certificate (different!)
- `setup-ssl.sh` line 58-65: Generates cert for **djdannyhecticb.co.uk** as primary

**Risk:** 
- Certificate path inconsistency between configs
- Secondary domains use primary domain's certificate (correct for multi-domain SAN cert)
- nginx-simple.conf references .com instead of .co.uk (WILL FAIL if used)

**Impact:** 
- If nginx-simple.conf is used, SSL will fail (certificate path doesn't exist)
- Current docker-compose.yml mounts nginx.conf, so it works, but fragile

---

### 2. **HSTS Enabled Without SSL Validation** ⚠️

**Problem:**
- `nginx-simple.conf` line 86: `add_header Strict-Transport-Security "max-age=63072000" always;`
- HSTS forces browsers to use HTTPS for ~2 years
- If SSL breaks, site becomes inaccessible

**Risk:**
- If SSL certificate expires or fails, users cannot access site (even HTTP is blocked)
- No escape hatch for emergency HTTP fallback

**Recommendation:**
- Remove HSTS from nginx-simple.conf
- Only enable HSTS in nginx.conf AFTER SSL is verified working
- Use shorter max-age initially (e.g., 1 day = 86400) before committing to 2 years

---

### 3. **8 Domains, 1 Certificate** ⚠️

**Problem:**
- Configuration serves 8 domains:
  - djdannyhecticb.co.uk
  - www.djdannyhecticb.co.uk
  - djdannyhecticb.com
  - www.djdannyhecticb.com
  - djdannyhecticb.info
  - www.djdannyhecticb.info
  - djdannyhecticb.uk
  - www.djdannyhecticb.uk
- All use single Let's Encrypt certificate with SAN (Subject Alternative Names)
- IP address (213.199.45.126) also handled

**Risk:**
- Let's Encrypt has rate limits (50 certs per domain per week, 100 SANs per cert)
- If one domain fails DNS validation, entire certificate generation fails
- Complex failure modes
- DNS must be correct for ALL domains before running setup-ssl.sh

---

### 4. **Dockerfile.nginx Build/Runtime Mismatch** ⚠️

**Problem:**
- `Dockerfile.nginx` copies `nginx-simple.conf` at build time
- `docker-compose.yml` volume-mounts `nginx.conf` at runtime
- Volume mount overrides Dockerfile copy
- Dockerfile.nginx comment says "HTTP-only" but nginx-simple.conf has HTTPS+HSTS

**Risk:**
- Confusing maintenance (what config is actually used?)
- Dockerfile.nginx comment is misleading (nginx-simple.conf is NOT HTTP-only)

**Fix:**
- Update Dockerfile.nginx comment to clarify volume mount behavior
- OR: Remove COPY line from Dockerfile.nginx entirely (volume mount is the source of truth)

---

## ✅ STRENGTHS

1. **Proper HTTP→HTTPS Redirect**: Both configs correctly redirect port 80 to 443
2. **Certbot Integration**: Well-configured with /.well-known/acme-challenge/ location
3. **Security Headers**: Good coverage (X-Frame-Options, X-Content-Type-Options, etc.)
4. **Modern SSL**: TLSv1.2 and TLSv1.3 only (good)
5. **Performance Optimizations**: Gzip, caching, buffers properly configured

---

## 📋 PRODUCTION-SAFE NGINX STRATEGY

### **Recommendation: Use Canonical Domain with Fallback**

**Primary Domain:** djdannyhecticb.co.uk  
**Strategy:** Single certificate, gradual SSL rollout

#### Step 1: Pre-Deployment Validation ✅ BEFORE RUNNING setup-ssl.sh

```bash
# Verify ALL domains resolve to 213.199.45.126
for domain in djdannyhecticb.co.uk www.djdannyhecticb.co.uk djdannyhecticb.com www.djdannyhecticb.com djdannyhecticb.info www.djdannyhecticb.info djdannyhecticb.uk www.djdannyhecticb.uk; do
  echo -n "Checking $domain: "
  dig +short $domain
done

# Verify port 80 is accessible
curl -I http://djdannyhecticb.co.uk/.well-known/acme-challenge/test
```

**REQUIREMENT:** All domains must return 213.199.45.126 before proceeding.

---

#### Step 2: Initial Deployment (HTTP Only)

**Option A: Create nginx-http.conf (Safest)**

Create a truly HTTP-only config with NO SSL blocks:

```nginx
# nginx-http.conf - Safe HTTP-only mode
events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name djdannyhecticb.co.uk www.djdannyhecticb.co.uk djdannyhecticb.com www.djdannyhecticb.com djdannyhecticb.info www.djdannyhecticb.info djdannyhecticb.uk www.djdannyhecticb.uk 213.199.45.126;
        
        # Certbot challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Serve site over HTTP
        location / {
            proxy_pass http://web:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

**Update docker-compose.yml:**
```yaml
nginx:
  volumes:
    - ./nginx-http.conf:/etc/nginx/nginx.conf  # Change this line
    - certbot_conf:/etc/letsencrypt
    - certbot_www:/var/www/certbot
```

**Deploy:**
```bash
docker-compose up -d --build
# Test: curl http://djdannyhecticb.co.uk
# Should return 200 OK
```

---

#### Step 3: Generate SSL Certificate

```bash
sudo ./setup-ssl.sh your-email@example.com
```

**This script will:**
1. Generate Let's Encrypt certificate via Certbot
2. Automatically switch docker-compose.yml to nginx.conf (HTTPS mode)
3. Reload nginx with SSL enabled

**If it fails:**
- Certificate files won't exist
- setup-ssl.sh exits with error code
- Site remains on HTTP (safe fallback)

---

#### Step 4: Gradual HSTS Rollout (Post-SSL Verification)

**Wait 48 hours after SSL is working**, then:

1. Verify certificate is valid:
```bash
curl -I https://djdannyhecticb.co.uk
# Should return 200 OK with valid cert
```

2. Enable HSTS with short duration first:
```nginx
# In nginx.conf, change line 86:
add_header Strict-Transport-Security "max-age=86400" always;  # 1 day
```

3. After 1 week of stable SSL, increase to 1 year:
```nginx
add_header Strict-Transport-Security "max-age=31536000" always;  # 1 year
```

4. After 1 month, increase to 2 years (current config):
```nginx
add_header Strict-Transport-Security "max-age=63072000" always;  # 2 years
```

---

## 🔧 RECOMMENDED FIXES

### Fix 1: Update Dockerfile.nginx for Clarity

```dockerfile
FROM nginx:alpine

# Note: Runtime config is volume-mounted from docker-compose.yml
# This COPY is only used if docker-compose.yml doesn't mount a config
# In production, docker-compose.yml mounts nginx.conf (HTTPS mode)
# For initial HTTP-only deployment, mount nginx-http.conf instead

COPY nginx-simple.conf /etc/nginx/nginx.conf
```

### Fix 2: Fix nginx-simple.conf Certificate Path

Change line 74-75:
```nginx
# FROM:
ssl_certificate /etc/letsencrypt/live/djdannyhecticb.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.com/privkey.pem;

# TO:
ssl_certificate /etc/letsencrypt/live/djdannyhecticb.co.uk/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.co.uk/privkey.pem;
```

### Fix 3: Remove HSTS from nginx-simple.conf

Comment out or remove line 86:
```nginx
# HSTS disabled until SSL is verified stable
# add_header Strict-Transport-Security "max-age=63072000" always;
```

### Fix 4: Reduce nginx.conf HSTS Initially

Change line 86 (in nginx.conf too):
```nginx
# Start with 1 day, increase after verification
add_header Strict-Transport-Security "max-age=86400" always;
```

---

## 🚨 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Verify ALL 8 domains resolve to 213.199.45.126
- [ ] Verify port 80 is accessible from internet
- [ ] Verify port 443 is open in firewall
- [ ] Backup current nginx config
- [ ] Create nginx-http.conf for HTTP-only fallback

### Initial Deployment
- [ ] Deploy with nginx-http.conf (HTTP only)
- [ ] Test all domains over HTTP
- [ ] Verify Certbot challenge location works

### SSL Deployment
- [ ] Run setup-ssl.sh with valid email
- [ ] Verify certificate generation succeeds
- [ ] Test all domains over HTTPS
- [ ] Verify HTTP redirects to HTTPS
- [ ] Check certificate expiry date (should be ~90 days)

### Post-Deployment
- [ ] Monitor Certbot auto-renewal (runs every 12h)
- [ ] Test HTTPS on all 8 domains
- [ ] Verify HTTP→HTTPS redirect
- [ ] Check SSL Labs rating (should be A+)
- [ ] After 48h: Enable HSTS with 1-day max-age
- [ ] After 7 days: Increase HSTS to 1 year
- [ ] After 30 days: Increase HSTS to 2 years

---

## 🎯 CANONICAL DOMAIN STRATEGY (Alternative)

**If multi-domain certificate fails**, simplify to **ONE** domain:

### Recommended: djdannyhecticb.co.uk Only

1. **Remove alternate domains** from nginx config
2. **301 redirect** all other domains to .co.uk:

```nginx
# Redirect all alternate domains to canonical .co.uk
server {
    listen 80;
    listen 443 ssl;
    server_name djdannyhecticb.com www.djdannyhecticb.com djdannyhecticb.info www.djdannyhecticb.info djdannyhecticb.uk www.djdannyhecticb.uk;
    
    # Use wildcard cert or self-signed for HTTPS redirect (non-critical)
    ssl_certificate /etc/nginx/ssl/dummy.crt;
    ssl_certificate_key /etc/nginx/ssl/dummy.key;
    
    return 301 https://djdannyhecticb.co.uk$request_uri;
}

# Canonical domain
server {
    listen 443 ssl;
    server_name djdannyhecticb.co.uk www.djdannyhecticb.co.uk;
    
    ssl_certificate /etc/letsencrypt/live/djdannyhecticb.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djdannyhecticb.co.uk/privkey.pem;
    
    # ... rest of config
}
```

**Benefits:**
- Simpler certificate management
- Faster SSL setup (only 2 SANs: apex + www)
- Lower Let's Encrypt rate limit risk
- Clear brand identity (one domain)

---

## 🚀 GO/NO-GO RECOMMENDATION

### ✅ SAFE TO PROCEED IF:
1. All 8 domains resolve correctly to 213.199.45.126
2. Ports 80 and 443 are accessible from internet
3. DNS has been stable for >24 hours (propagation complete)
4. Team can monitor deployment for first 48 hours

### ⚠️ PROCEED WITH CAUTION IF:
1. DNS is newly updated (<24h ago)
2. Not all domains resolve correctly yet
3. Alternate domains (.com, .info, .uk) are low-priority

**Recommendation:** Use **canonical domain strategy** (.co.uk only) initially.

### 🛑 DO NOT PROCEED IF:
1. DNS not configured for any domain
2. Ports blocked by firewall
3. No monitoring/rollback plan in place

---

## 📊 RISK ASSESSMENT

| Risk | Severity | Mitigation |
|------|----------|------------|
| Certificate generation fails | **HIGH** | Deploy HTTP-only first, test Certbot |
| HSTS locks out users | **MEDIUM** | Disable HSTS initially, enable gradually |
| Multi-domain cert fails | **MEDIUM** | Use canonical domain strategy |
| Certificate expires | **LOW** | Certbot auto-renewal every 12h |
| nginx config syntax error | **LOW** | Test with `nginx -t` before reload |

---

## 🔧 ROLLBACK PLAN

If SSL fails:

```bash
# 1. Switch back to HTTP-only config
docker-compose down
sed -i 's/nginx.conf/nginx-http.conf/g' docker-compose.yml
docker-compose up -d

# 2. Verify HTTP works
curl http://djdannyhecticb.co.uk
# Should return 200 OK

# 3. Debug SSL issue before retry
docker-compose logs certbot
docker-compose logs nginx
```

---

**Status:** Ready for production with recommended fixes applied.
