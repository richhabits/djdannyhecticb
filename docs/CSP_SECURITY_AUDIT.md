# Content Security Policy (CSP) Security Audit

**Status**: Review Required + Implementation  
**Last Updated**: 2026-05-03  
**Criticality**: HIGH

## Current CSP Configuration

**File**: `/vercel.json`  
**Status**: ⚠️ Missing CSP header (currently only has HSTS, X-Frame-Options, X-XSS-Protection, etc.)

### Current Headers (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**MISSING**: Content-Security-Policy header

## CSP Implementation Plan

### Phase 1: Report-Only Mode (Testing)

Deploy CSP in report-only mode to identify violations without breaking functionality:

```json
{
  "source": "/(.*)",
  "headers": [
    {
      "key": "Content-Security-Policy-Report-Only",
      "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://cdn.vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self' https://api.djdannyhecticb.com https://vercel.com; report-uri https://example.com/csp-report"
    }
  ]
}
```

**Why report-only?**
- Identifies inline scripts causing violations
- Tests policy without breaking site
- Collects data for optimization
- Duration: 1-2 weeks

### Phase 2: Identify & Fix Inline Scripts

**Common sources of inline scripts in djdannyhecticb:**

1. **Vite HMR (Hot Module Reloading)**
   - Injected by Vite dev server
   - **Status**: Needs `script-src 'unsafe-inline'` in dev mode only
   - **Fix**: Use `<script>` tags in HTML instead of inline

2. **React Event Handlers** (if using inline onClick, etc.)
   - **Current**: May have inline event handlers in JSX
   - **Fix**: Move to separate .ts/.tsx files with proper imports

3. **Analytics/Tracking Scripts**
   - **Identified**: React GA4 (react-ga4 in package.json)
   - **Status**: Should be async external script
   - **Fix**: Verify script is loaded from external CDN

4. **Third-Party Embed Scripts**
   - **Potential**: Stripe, PayPal forms might inject inline
   - **Status**: Needs to be whitelisted
   - **Fix**: Add provider domains to script-src

### Recommended Strict CSP Policy

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 
    https://cdn.vercel.live 
    https://cdn.jsdelivr.net
    https://stripe.com 
    https://js.stripe.com
    https://www.paypal.com
    https://www.paypalobjects.com;
  style-src 'self' 
    https://fonts.googleapis.com
    https://cdn.jsdelivr.net;
  font-src 'self' 
    https://fonts.gstatic.com
    data:;
  img-src 'self' 
    https: 
    data:;
  media-src 'self' 
    https:;
  connect-src 'self' 
    https://api.djdannyhecticb.com
    https://vercel.com
    https://vitals.vercel-analytics.com
    https://api.stripe.com
    https://api.paypal.com
    wss:;
  frame-src 'self'
    https://stripe.com
    https://js.stripe.com
    https://www.paypal.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://api.paypal.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
  block-all-mixed-content
```

### Phase 3: Implementation Steps

#### Step 1: Update vercel.json

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        // ... existing security headers ...
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://cdn.vercel.live https://cdn.jsdelivr.net https://stripe.com https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self' https://api.djdannyhecticb.com https://vercel.com https://vitals.vercel-analytics.com https://api.stripe.com https://api.paypal.com wss:; frame-src 'self' https://stripe.com https://js.stripe.com https://www.paypal.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.paypal.com; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' https://cdn.vercel.live https://cdn.jsdelivr.net https://stripe.com https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com; style-src 'self' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data:; media-src 'self' https:; connect-src 'self' https://api.djdannyhecticb.com https://vercel.com https://vitals.vercel-analytics.com https://api.stripe.com https://api.paypal.com wss:; frame-src 'self' https://stripe.com https://js.stripe.com https://www.paypal.com; object-src 'none'; base-uri 'self'; form-action 'self' https://api.paypal.com; frame-ancestors 'none'; upgrade-insecure-requests; block-all-mixed-content"
        }
      ]
    }
  ]
}
```

#### Step 2: Check for Inline Scripts

Search for inline script violations:
```bash
# Find inline event handlers in TypeScript/TSX
grep -r "on[A-Z].*=" src/ --include="*.tsx" --include="*.ts" | head -20

# Find <script> tags with inline content
grep -r "<script>" --include="*.html" --include="*.tsx"

# Find unsafe-eval patterns
grep -r "eval\|Function(" src/ --include="*.ts" --include="*.tsx"
```

#### Step 3: Fix React GA4 Implementation

Current: `react-ga4` package  
**Status**: External script injection should be safe

**Verify implementation**:
```bash
grep -r "ReactGA\|GA4" src/ --include="*.tsx" --include="*.ts"
```

Ensure it's initialized server-side with external script tag, not inline.

#### Step 4: Configure Stripe/PayPal CSP

**Stripe iFrame CSP**:
```html
<!-- In HTML head or via meta tag -->
<meta http-equiv="Content-Security-Policy" content="...">

<!-- Stripe requires script-src https://js.stripe.com -->
<!-- And frame-src https://js.stripe.com -->
```

**PayPal Button CSP**:
```html
<!-- PayPal requires similar whitelisting -->
<script src="https://www.paypal.com/sdk/js?..."></script>
```

### Phase 4: Testing & Validation

#### Browser Console Testing
```javascript
// After deploying, open DevTools console and check for CSP violations
// Should see no errors like:
// "Refused to load the script 'inline:1' because it violates 
//  the Content-Security-Policy directive"
```

#### CSP Violation Reporting

Set up CSP report endpoint:
```bash
# Create API endpoint to receive CSP violations
POST /api/security/csp-report
Content-Type: application/csp-report

{
  "csp-report": {
    "document-uri": "https://djdannyhecticb.com",
    "violated-directive": "script-src 'self'",
    "effective-directive": "script-src",
    "original-policy": "...",
    "blocked-uri": "inline",
    "status-code": 200,
    "disposition": "enforce"
  }
}
```

#### Tools for Testing

1. **CSP Evaluator** (Google)
   - https://csp-evaluator.withgoogle.com/
   - Paste policy and get recommendations

2. **SecurityHeaders.com**
   - https://securityheaders.com/
   - Test your domain and get grade

3. **Local Testing**
   ```bash
   curl -I https://djdannyhecticb.com | grep -i "content-security"
   ```

### Phase 5: Progressive Tightening

**Week 1**: Deploy report-only CSP with permissive rules
**Week 2**: Fix identified inline scripts
**Week 3**: Deploy enforce CSP with relaxed rules
**Week 4**: Monitor and tighten further
**Week 5+**: Move to strict CSP

### CSP Directives Explained

| Directive | Purpose | Current Value |
|-----------|---------|---|
| `default-src` | Fallback for all directives | `'self'` |
| `script-src` | JavaScript sources | `'self'` + CDNs + Stripe + PayPal |
| `style-src` | CSS sources | `'self'` + Google Fonts |
| `font-src` | Web fonts | `'self'` + Google Fonts + data: |
| `img-src` | Images | `'self'` + https: + data: |
| `connect-src` | AJAX/WebSocket | `'self'` + API domains |
| `frame-src` | iFrames | `'self'` + payment providers |
| `object-src` | Flash/plugins | `'none'` (disabled) |
| `base-uri` | Base URL | `'self'` |
| `form-action` | Form targets | `'self'` + payment providers |
| `frame-ancestors` | Can be framed by | `'none'` (cannot be framed) |

### Common Violations & Fixes

**Problem**: "Refused to load the script because it violates CSP"
```
Solution: Add script domain to script-src in CSP header
Example: script-src 'self' https://cdn.example.com
```

**Problem**: "Refused to apply inline style"
```
Solution: Move inline styles to external CSS or add 'unsafe-inline' 
(NOT recommended - move to external CSS files instead)
```

**Problem**: React DevTools not working
```
Solution: DevTools requires 'unsafe-eval' - only in development
Configure: script-src 'self' 'unsafe-eval' (dev mode only)
```

## Monitoring & Compliance

### CSP Violation Alerts

```bash
# Monitor CSP violations in production logs
# Alert if violations > 5 per hour (indicates issue)
```

### Quarterly CSP Review

- [ ] Audit new third-party scripts added
- [ ] Review CSP violation reports
- [ ] Tighten directives where possible
- [ ] Update documentation

## Resources

- [CSP Documentation - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator - Google](https://csp-evaluator.withgoogle.com/)
- [SecurityHeaders.com](https://securityheaders.com/)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

---

**Ownership**: Security / Frontend Engineering  
**Status**: ⏳ Awaiting Implementation  
**Timeline**: 2 weeks for full deployment  
**Next Review**: 2026-05-17
