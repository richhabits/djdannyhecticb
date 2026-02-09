# Security Policy

## Supported Versions

We actively support the latest version of the application. Security updates are applied to the main branch.

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead, please email security concerns to:

**support@djdannyhecticb.co.uk**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue before public disclosure.

## Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use strong, random values for secrets (JWT_SECRET, API keys)
- Rotate secrets regularly in production
- Use different secrets for development and production

### API Keys
- Store API keys in environment variables, never in code
- Use read-only keys when possible
- Rotate keys if exposed or compromised
- Monitor API key usage for anomalies

### Database
- Use strong database passwords
- Limit database access to necessary IPs only
- Enable SSL/TLS for database connections in production
- Regular backups with encryption

### Authentication
- Use HTTPS in production (never HTTP for auth)
- Implement rate limiting on login endpoints
- Use secure session cookies (httpOnly, secure, sameSite)
- Implement account lockout after failed attempts

### Dependencies
- Keep dependencies up to date
- Review security advisories regularly
- Use `pnpm audit` to check for vulnerabilities
- Remove unused dependencies

## Security Features

- **Content Security Policy (CSP)**: Configured to prevent XSS attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: JWT tokens with expiration
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **CORS**: Configured for allowed origins only

## Known Security Considerations

- OAuth integration requires proper configuration
- Stripe webhook signature verification required
- Admin routes protected by role-based access control
- ✅ Rate limiting implemented for all endpoints (tiered by endpoint type)
- ✅ HSTS enabled in production
- ✅ Permissions-Policy restricts browser features
- ✅ Cookie SameSite set to 'lax' for CSRF protection

## Recent Security Updates

- **HSTS Header**: Enforces HTTPS in production with 1-year max-age
- **Permissions-Policy**: Restricts camera, microphone, geolocation, and FLoC
- **Environment Validation**: Critical env vars validated on startup
- **Rate Limiting**: Tiered limits (PUBLIC, AUTH, BOOKING, AI, STRICT, INTEL)
- **Cookie Security**: HttpOnly, Secure, SameSite=Lax


