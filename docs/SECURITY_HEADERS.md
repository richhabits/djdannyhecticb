# Security Headers Strategy

**Status:** Implemented  
**Last Updated:** 2026-02-09

---

## Current Implementation

### Helmet.js Configuration

The application uses `helmet` middleware for security headers. Current configuration in `server/_core/index.ts`:

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://*.stripe.com"],
      "connect-src": ["'self'", "https:", "https://*.stripe.com"],
      "frame-src": ["'self'", "https://js.stripe.com", "https://*.stripe.com"],
      "img-src": ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

---

## Active Security Headers

### 1. Content Security Policy (CSP)
**Status:** ✅ ACTIVE (permissive mode)

**Current Policy:**
- `script-src`: self, inline scripts (required for Vite), unsafe-eval (required for dev), Stripe
- `connect-src`: self, HTTPS, Stripe
- `frame-src`: self, Stripe
- `img-src`: self, data URIs, HTTPS

**Rationale:**
- Allows Vite development mode
- Allows Stripe payment integration
- Allows external HTTPS resources
- Blocks most XSS attack vectors

**Future Enhancement:**
- Migrate to `report-only` mode first
- Monitor CSP violation reports
- Tighten directives after validation
- Remove `unsafe-inline` and `unsafe-eval` in production

### 2. X-Frame-Options / Frame-Ancestors
**Status:** ✅ ACTIVE (via Helmet defaults)

**Policy:** `DENY`
- Prevents clickjacking attacks
- Site cannot be embedded in iframes
- Configured in nginx.conf as backup

### 3. X-Content-Type-Options
**Status:** ✅ ACTIVE (via Helmet defaults)

**Policy:** `nosniff`
- Prevents MIME type sniffing
- Browsers must respect declared content types

### 4. X-XSS-Protection
**Status:** ✅ ACTIVE (via nginx.conf)

**Policy:** `1; mode=block`
- Legacy XSS protection for older browsers
- Modern browsers use CSP instead

### 5. Referrer-Policy
**Status:** ✅ ACTIVE (via nginx.conf)

**Policy:** `strict-origin-when-cross-origin`
- Sends full referrer for same-origin requests
- Sends only origin for cross-origin requests
- Sends nothing for downgrade (HTTPS → HTTP)

### 6. Permissions-Policy
**Status:** ✅ ACTIVE (via nginx.conf)

**Policy:** Denies geolocation, microphone, camera
- Prevents unwanted feature access
- Reduces attack surface

### 7. Strict-Transport-Security (HSTS)
**Status:** ⚠️ DISABLED BY DEFAULT

**Rationale:** HSTS is **not enabled by default** to prevent lockout if SSL fails.

**Rollout Plan (Conservative):**

#### Phase 1: Post-Deployment Verification (48 hours)
- Deploy with SSL
- Verify all domains work over HTTPS
- Verify HTTP→HTTPS redirects work
- Monitor for SSL errors

#### Phase 2: Enable HSTS (1 day max-age)
After 48h of stable SSL:
```nginx
add_header Strict-Transport-Security "max-age=86400" always;  # 1 day
```

#### Phase 3: Increase to 1 year
After 1 week of stable HSTS:
```nginx
add_header Strict-Transport-Security "max-age=31536000" always;  # 1 year
```

#### Phase 4: Increase to 2 years (Optional)
After 1 month of stable operation:
```nginx
add_header Strict-Transport-Security "max-age=63072000" always;  # 2 years
```

**NEVER enable HSTS before:**
- SSL certificates are verified working
- All domains respond over HTTPS
- HTTP→HTTPS redirects are tested
- Rollback plan is documented

---

## Nginx Configuration

Security headers are also set in nginx.conf as defense-in-depth:

```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# HSTS - DISABLED by default (see rollout plan above)
# add_header Strict-Transport-Security "max-age=86400" always;
```

---

## Rate Limiting

**Status:** ✅ ACTIVE

Rate limiting is implemented via `express-rate-limit`:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Public API | 120 req/min | Per IP |
| Auth endpoints | 10 req/min | Per IP |
| Shoutbox | 5 req/min | Per IP |
| AI features | 10 req/min | Per IP |

**Configuration:** `server/_core/middleware/rateLimit.ts`

---

## CORS Policy

**Status:** ✅ ACTIVE (restrictive)

```typescript
app.use(cors({
  origin: ENV.NODE_ENV === "production"
    ? ["https://djdannyhecticb.co.uk", "https://www.djdannyhecticb.co.uk"]
    : true,
  credentials: true,
}));
```

**Production:** Only allows same-origin requests  
**Development:** Allows all origins for local testing

---

## CSP Report-Only Mode (Future Enhancement)

To implement CSP violation monitoring:

### Step 1: Add report endpoint
```typescript
app.post("/api/csp-report", express.json(), (req, res) => {
  console.warn("CSP Violation:", req.body);
  // TODO: Send to monitoring service
  res.status(204).end();
});
```

### Step 2: Enable report-only mode
```typescript
contentSecurityPolicy: {
  reportOnly: true,
  directives: {
    ...strictDirectives,
    "report-uri": ["/api/csp-report"],
  },
}
```

### Step 3: Monitor violations
- Review logs for legitimate vs malicious violations
- Adjust directives based on findings
- Switch to enforcement mode when clean

---

## Security Checklist

### Pre-Deployment
- [x] Helmet middleware configured
- [x] CSP directives reviewed
- [x] X-Frame-Options set
- [x] X-Content-Type-Options set
- [x] Rate limiting active
- [x] CORS restrictive in production
- [ ] HSTS disabled (enable post-SSL verification)

### Post-Deployment
- [ ] Verify security headers via curl/browser devtools
- [ ] Test rate limiting (should get 429 after limit)
- [ ] Verify CORS blocks unauthorized origins
- [ ] Monitor logs for CSP violations
- [ ] Enable HSTS after 48h stable SSL (conservative rollout)

### Ongoing
- [ ] Review security headers quarterly
- [ ] Update CSP directives as needed
- [ ] Monitor for new vulnerabilities
- [ ] Keep helmet.js updated via Dependabot

---

## Testing Security Headers

### Command Line
```bash
# Check headers
curl -I https://djdannyhecticb.co.uk/

# Check specific header
curl -I https://djdannyhecticb.co.uk/ | grep -i "x-frame-options"

# Check HSTS (should be absent initially)
curl -I https://djdannyhecticb.co.uk/ | grep -i "strict-transport"
```

### Browser DevTools
1. Open site in browser
2. F12 → Network tab
3. Reload page
4. Click on main document
5. Headers → Response Headers
6. Verify security headers present

### Security Header Scanner
Use online tools (after deployment):
- https://securityheaders.com/
- https://observatory.mozilla.org/

**Expected Grade:** A (without HSTS initially), A+ (after HSTS enabled)

---

## Emergency Procedures

### If HSTS Causes Lockout
1. Certificate expired or invalid
2. Users can't access site (HSTS prevents HTTP fallback)

**Solution:**
- Fix SSL certificate immediately
- Cannot disable HSTS (browsers cache it)
- Users must wait for max-age to expire OR clear browser cache
- **This is why we use conservative rollout (1 day → 1 week → 1 month)**

### If CSP Breaks Functionality
1. Switch to `reportOnly: true` mode
2. Deploy immediately
3. Review violations
4. Fix directives
5. Re-enable enforcement

---

**Status:** ✅ Security headers implemented and documented  
**HSTS:** ⚠️ Conservative rollout required (48h+ after SSL verification)  
**Next Review:** 2026-05-09 (quarterly)
