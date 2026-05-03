# Infrastructure Security Checklist

**Status**: Production Ready Review  
**Last Updated**: 2026-05-03  
**Criticality**: CRITICAL

## Overview

This comprehensive checklist ensures djdannyhecticb infrastructure meets production-grade security standards. Use this during deployment and quarterly reviews.

---

## Phase 1: Pre-Deployment Security (BEFORE Going Live)

### Authentication & Access Control

- [ ] JWT_SECRET is at least 64 characters (use `openssl rand -hex 32`)
- [ ] JWT_SECRET stored in Vercel "Sensitive" environment variables
- [ ] All environment variables marked as "Sensitive" if containing secrets
- [ ] Database credentials use unique, strong passwords (32+ characters)
- [ ] Database password NOT hardcoded anywhere in codebase
- [ ] OAuth provider credentials securely stored (not in git)
- [ ] API keys for third parties securely stored
- [ ] 2FA enabled on Vercel account
- [ ] 2FA enabled on GitHub account
- [ ] Admin accounts have unique strong passwords
- [ ] Service accounts have minimal necessary permissions

### Database Security

- [ ] PostgreSQL has SSL/TLS connection enforced (`sslmode=require`)
- [ ] Database user has minimal required permissions (principle of least privilege)
- [ ] Separate database user for frontend vs. backend (if possible)
- [ ] Row-level security (RLS) policies implemented for sensitive tables
- [ ] Backups enabled with automated daily schedule
- [ ] Backup encryption configured (KMS or provider encryption)
- [ ] Backup retention set to minimum 30 days
- [ ] Cross-region backup replication enabled
- [ ] Database connection pool configured (max connections limited)
- [ ] Query timeout set to prevent long-running queries
- [ ] Database password rotation scheduled (quarterly minimum)

### API Security

- [ ] HTTPS only (no HTTP allowed)
- [ ] HSTS header enabled with `max-age=31536000`
- [ ] Content-Security-Policy header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] CORS configured to whitelist only trusted origins
- [ ] CORS does NOT use wildcard (*) unless absolutely necessary
- [ ] Rate limiting enabled on API endpoints (express-rate-limit)
- [ ] Rate limit: 100 requests/minute for unauthenticated endpoints
- [ ] Rate limit: 1000 requests/minute for authenticated endpoints
- [ ] API keys require rotation policy (quarterly)
- [ ] Webhook signatures validated (Stripe, PayPal)
- [ ] Request/response logging enabled (excluding sensitive data)

### Secrets Management

- [ ] No secrets in .env files (use Vercel env vars only)
- [ ] No secrets in git history (use git-filter-branch if needed)
- [ ] GitHub Secret Scanning enabled on repository
- [ ] All secrets stored in Vercel with "Sensitive" flag
- [ ] Secrets rotation schedule documented
- [ ] Emergency secret rotation procedure documented
- [ ] Secure vault created for secret management (or use Vercel)
- [ ] Audit trail for secret access maintained

### Frontend Security

- [ ] S3 files set to private ACL (no public-read)
- [ ] File access only via presigned URLs (1-hour expiration)
- [ ] No sensitive data in localStorage (use httpOnly cookies)
- [ ] HttpOnly cookies set for session tokens
- [ ] Secure flag set on cookies
- [ ] SameSite=Strict set on cookies
- [ ] Input validation implemented on all forms
- [ ] Output encoding implemented for all user input
- [ ] No hardcoded API keys in client code
- [ ] Dependencies checked for vulnerabilities (`npm audit`)
- [ ] No eval() or dangerous eval-like functions
- [ ] iframes only from trusted origins
- [ ] Subresource Integrity (SRI) for CDN resources (optional but recommended)

### Third-Party Integration Security

- [ ] Stripe integration uses restricted API keys (not full access)
- [ ] Stripe webhook IP allowlisting configured (optional)
- [ ] PayPal credentials marked as sensitive
- [ ] OAuth providers have callback URL whitelisted
- [ ] Email service uses API key (not password)
- [ ] All third-party APIs use API keys/tokens, not credentials

### Compliance & Legal

- [ ] Privacy Policy published at /privacy
- [ ] Terms of Service published at /terms
- [ ] Cookie consent banner implemented
- [ ] GDPR cookie banner shows opt-in for non-essential
- [ ] Cookie policy links to Privacy Policy
- [ ] Contact information published
- [ ] Data processing agreements (DPAs) executed with vendors
- [ ] GDPR compliance documentation started
- [ ] Payment Card Industry (PCI) compliance verified (via Stripe/PayPal)

---

## Phase 2: Deployment Security (DURING Deployment)

### Vercel Deployment

- [ ] Production environment variables all set (no defaults)
- [ ] NODE_ENV set to "production"
- [ ] Debug mode disabled (`NODE_DEBUG` not set)
- [ ] Source maps NOT included in production build
- [ ] Build logs do not contain secrets (review Vercel logs)
- [ ] Only necessary files deployed (use .vercelignore)
- [ ] Health check endpoint configured and responding
- [ ] Performance monitoring configured (Vercel Analytics)

### Build Security

- [ ] Dependencies pinned to specific versions (not `*` or `latest`)
- [ ] Dependency lock file (pnpm-lock.yaml) committed to git
- [ ] No dev dependencies installed in production
- [ ] Build process does not expose secrets
- [ ] Output directory excludes sensitive files
- [ ] Bundle size monitored (use webpack-bundle-analyzer)

### DNS & Domain Security

- [ ] Domain registered with WHOIS protection enabled
- [ ] DNS records configured correctly
- [ ] CAA record set to limit SSL certificate issuance
- [ ] SPF record configured for email authentication
- [ ] DKIM record configured for email signing
- [ ] DMARC record configured for email fraud prevention
- [ ] DNS provider account has strong password and 2FA

### SSL/TLS Certificate

- [ ] HTTPS certificate valid and not self-signed
- [ ] Certificate covers all domains/subdomains
- [ ] Certificate renewal automated (Vercel handles this)
- [ ] TLS 1.2 or higher only (no SSL 3.0, TLS 1.0, 1.1)
- [ ] Strong cipher suites configured

---

## Phase 3: Post-Deployment Security (AFTER Going Live)

### Monitoring & Logging

- [ ] Error tracking configured (Sentry)
- [ ] Application logs stored and archived
- [ ] Access logs reviewed for suspicious patterns
- [ ] Failed login attempts monitored
- [ ] API rate limit hits monitored
- [ ] Database connection errors monitored
- [ ] Uptime monitoring configured (Vercel provides)
- [ ] Performance metrics collected and reviewed

### Security Scanning

- [ ] Dependency vulnerabilities scanned (npm audit)
- [ ] OWASP Top 10 vulnerabilities checked
- [ ] SQL injection testing performed
- [ ] XSS testing performed
- [ ] CSRF token validation verified
- [ ] Insecure direct object reference (IDOR) tested
- [ ] Broken authentication tested
- [ ] Sensitive data exposure reviewed

### Backup & Disaster Recovery

- [ ] Daily automated backups running
- [ ] Backup integrity verified (monthly test restoration)
- [ ] Cross-region replication configured
- [ ] Recovery time objective (RTO) set to < 2 hours
- [ ] Recovery point objective (RPO) set to < 1 hour
- [ ] Disaster recovery plan documented
- [ ] Team trained on recovery procedures

### Access Control

- [ ] GitHub repository access reviewed (only authorized users)
- [ ] Vercel project access reviewed
- [ ] Database access limited to IP whitelist (if possible)
- [ ] Admin accounts audited
- [ ] Service accounts reviewed for least privilege

---

## Phase 4: Ongoing Security (QUARTERLY Reviews)

### Quarterly Security Audit

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review all environment variables
- [ ] Verify all secrets marked as sensitive in Vercel
- [ ] Check for any hardcoded secrets in code (git grep)
- [ ] Review API rate limiting effectiveness
- [ ] Verify CORS configuration still appropriate
- [ ] Test CSP headers with CSP evaluator
- [ ] Validate backup restoration (full test)
- [ ] Review security headers with securityheaders.com

### Semi-Annual Reviews

- [ ] Secrets rotation completed (see SECRETS_ROTATION_PLAN.md)
- [ ] Penetration testing performed (optional, annual)
- [ ] Security incident review (if any occurred)
- [ ] Third-party security certifications verified
- [ ] DPA agreements reviewed and current
- [ ] Privacy Policy reviewed for updates

### Annual Reviews

- [ ] Full security audit by internal team
- [ ] Penetration testing by external firm (optional)
- [ ] Code security review (static analysis)
- [ ] Infrastructure hardening review
- [ ] Compliance certifications renewed
- [ ] Team security training completed
- [ ] Incident response plan tested

---

## Phase 5: Incident Response & Remediation

### Data Breach Response

- [ ] Immediately notify security team
- [ ] Activate incident response plan
- [ ] Isolate affected systems
- [ ] Preserve evidence and logs
- [ ] Notify users within 72 hours (GDPR requirement)
- [ ] File report with Data Protection Authority
- [ ] Conduct root cause analysis
- [ ] Implement preventative measures

### Security Vulnerability Response

- [ ] Assess severity (CVSS score)
- [ ] Create emergency patch if critical
- [ ] Test patch in staging
- [ ] Deploy patch to production
- [ ] Verify fix via scanning tools
- [ ] Document resolution steps

### Compromised Credentials

- [ ] Immediately revoke compromised credential
- [ ] Rotate replacement credential
- [ ] Review access logs for misuse
- [ ] Force password reset for affected users
- [ ] Enable 2FA if not already enabled
- [ ] Review recent API calls for suspicious activity

---

## Environment-Specific Checklist

### Development Environment

- [ ] Can contain test credentials
- [ ] Can have reduced logging/monitoring
- [ ] Should NOT use production database
- [ ] Should use test API keys for payment processors
- [ ] Can have debug mode enabled
- [ ] Team members can have access

### Staging Environment

- [ ] Uses production-like configuration
- [ ] Should use copy of production data (anonymized)
- [ ] Should use test credentials for third parties
- [ ] Performance monitoring enabled
- [ ] Limited team access
- [ ] Weekly security scanning

### Production Environment

- [ ] Uses strong, unique credentials
- [ ] No debug mode enabled
- [ ] Full logging and monitoring
- [ ] Minimal team access (need-to-know basis)
- [ ] Daily security scans
- [ ] Automated backups

---

## Security Scoring

Rate each section 0-5 (5 = fully implemented, 0 = not started):

| Section | Score | Evidence/Notes |
|---------|-------|---|
| **Authentication & Access Control** | _/5 | |
| **Database Security** | _/5 | |
| **API Security** | _/5 | |
| **Secrets Management** | _/5 | |
| **Frontend Security** | _/5 | |
| **Third-Party Integrations** | _/5 | |
| **Compliance & Legal** | _/5 | |
| **Monitoring & Logging** | _/5 | |
| **Backup & Disaster Recovery** | _/5 | |
| **Incident Response** | _/5 | |
| **TOTAL SCORE** | _/50 | |

**Scoring Guide**:
- 45-50: Excellent (enterprise-ready)
- 40-44: Good (production-ready with minor improvements)
- 35-39: Fair (production-ready but needs attention)
- 30-34: Poor (significant security gaps)
- <30: Critical (do not deploy)

---

## Security Tools & Resources

### Scanning Tools

- **npm audit**: `npm audit` (built-in, checks dependencies)
- **OWASP ZAP**: Free security scanner (download)
- **Snyk**: SaaS dependency scanning (free tier)
- **GitHub Dependabot**: Automated dependency alerts (free with GitHub)
- **SecurityHeaders.com**: HTTP header tester (free online)
- **CSP Evaluator**: Content Security Policy tester (free online)

### Standards & Frameworks

- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **PCI-DSS**: For payment processing
- **GDPR**: EU data protection
- **SOC 2 Type II**: For service providers

### Documentation

- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/
- **CWE/SANS Top 25**: https://cwe.mitre.org/top25/
- **CAPEC**: Attack patterns and examples

---

## Sign-Off & Approval

**Security Checklist Completion**:

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Security Lead | | | |
| DevOps Engineer | | | |
| Product Owner | | | |
| CTO/Tech Lead | | | |

**Approval**: ✓ All items completed and verified

---

## Review History

| Date | Reviewer | Status | Comments |
|------|----------|--------|----------|
| 2026-05-03 | [Your Name] | Draft | Initial security review |
| | | | |

---

**Ownership**: Security / Infrastructure Team  
**Frequency**: Quarterly review minimum  
**Next Review**: 2026-08-03  
**Issues Tracker**: [Link to security issues in GitHub]
