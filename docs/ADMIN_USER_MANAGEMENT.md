# Admin User Management

Secure practices for creating and managing admin users in production.

## Overview

This guide covers secure admin user creation, password handling, and access management for the DJ DANNY HECTIC B platform.

**Key Principle:** Never email passwords. Always use secure invitation/reset links.

---

## Admin Creation Methods

### Option A: Fixed Admin (Recommended)

**Best for:** Single admin or small team

Set a fixed admin email in environment variables:

```bash
# .env.production
DEFAULT_ADMIN_EMAIL=admin@djdannyhecticb.com
DEFAULT_ADMIN_USERNAME=admin
```

**Benefits:**
- ✅ Predictable and documented
- ✅ Easy to reference in notifications
- ✅ No surprises or drift
- ✅ Simple to manage

### Option B: Seed During Deploy

**Best for:** Multiple admins or dynamic creation

Create idempotent seed script that runs on deploy:

```typescript
// scripts/seed-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@djdannyhecticb.com';
  
  // Check if admin exists
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existing) {
    console.log('✅ Admin user already exists:', adminEmail);
    return;
  }
  
  // Create admin (without password - will use invite link)
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      username: 'admin',
      role: 'ADMIN',
      emailVerified: new Date(),
      // No password - will be set via invite link
    }
  });
  
  console.log('✅ Admin user created:', admin.email);
  console.log('⚠️  Send invitation link for password setup');
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Add to package.json:**
```json
{
  "scripts": {
    "seed:admin": "tsx scripts/seed-admin.ts"
  }
}
```

**Add to deploy script:**
```bash
# In deploy.yml
pnpm prisma migrate deploy
pnpm seed:admin
```

---

## Password Handling

### ❌ Never Do This

**Don't email passwords:**
```
Subject: Your Admin Password
Body: Your password is: P@ssw0rd123
```

**Problems:**
- Passwords visible in email (unencrypted)
- Stored in sent folder
- Can be forwarded/shared
- Breach waiting to happen

### ✅ Correct Approach

**Send invitation links:**
```
Subject: Admin Access - Setup Required
Body: Click here to set your password: https://...
Link expires in: 24 hours
```

**Benefits:**
- ✅ One-time use link
- ✅ User sets own password
- ✅ Can't be intercepted and reused
- ✅ Expires automatically

---

## Implementation: Invitation System

### 1. Generate Invitation Token

```typescript
// server/utils/invite.ts
import crypto from 'crypto';
import { prisma } from './prisma';

export async function createInviteToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await prisma.inviteToken.create({
    data: {
      token,
      userId,
      expires,
      used: false
    }
  });
  
  return token;
}

export function generateInviteUrl(token: string) {
  return `https://djdannyhecticb.com/admin/setup?token=${token}`;
}
```

### 2. Send Invitation Email

```typescript
// server/utils/email.ts
import nodemailer from 'nodemailer';

export async function sendAdminInvite(email: string, inviteUrl: string) {
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: '"DJ DANNY HECTIC B" <info@djdannyhecticb.com>',
    to: email,
    subject: '🎵 Admin Access - Complete Your Setup',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to DJ DANNY HECTIC B Admin</h1>
        <p>You've been granted admin access to the DJ DANNY HECTIC B platform.</p>
        
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> Administrator</p>
        </div>
        
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>Click the button below to set your password</li>
          <li>Choose a strong password (12+ characters)</li>
          <li>Save your password in a secure password manager</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background: #667eea; color: white; padding: 14px 28px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            Complete Setup
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          ⚠️ This link expires in 24 hours.<br>
          🔒 For security, this link can only be used once.
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          If you didn't request this, please ignore this email.
        </p>
      </body>
      </html>
    `
  });
}
```

### 3. Setup Page Route

```typescript
// server/routes/admin-setup.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

export async function setupAdmin(req: Request, res: Response) {
  const { token, password } = req.body;
  
  // Verify token
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { user: true }
  });
  
  if (!invite || invite.used || invite.expires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired invitation' });
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Update user
  await prisma.user.update({
    where: { id: invite.userId },
    data: { 
      password: hashedPassword,
      emailVerified: new Date()
    }
  });
  
  // Mark token as used
  await prisma.inviteToken.update({
    where: { token },
    data: { used: true }
  });
  
  res.json({ success: true });
}
```

---

## Alternative: Password Reset Flow

If admin already exists but needs password reset:

### 1. Generate Reset Token

```typescript
export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expires,
      used: false
    }
  });
  
  return token;
}
```

### 2. Send Reset Email

```typescript
export async function sendPasswordReset(email: string, resetUrl: string) {
  // Similar to invitation email but with "Reset Password" theme
  // Include: reset link, expiry time, security warning
}
```

---

## Deployment Integration

### Update deploy.yml

Add admin seeding after migrations:

```yaml
- name: Deploy to server
  run: |
    ssh deploy@server << 'ENDSSH'
    cd /var/www/djdannyhecticb
    
    # Pull code
    git reset --hard origin/main
    
    # Install deps
    pnpm install --frozen-lockfile
    
    # Run migrations
    pnpm prisma migrate deploy
    
    # Seed admin (idempotent)
    pnpm seed:admin
    
    # Build & restart
    pnpm build
    docker compose up -d
    ENDSSH
```

### Update notification email

Reference known admin email:

```yaml
html_body: |
  <div class="info-section">
    <h3>👤 Admin Access</h3>
    <p>Admin Email: admin@djdannyhecticb.com</p>
    <p style="font-size: 14px; color: #666;">
      ℹ️ Password reset link sent separately for security.
    </p>
  </div>
```

---

## Security Checklist

### Admin Creation

- [ ] Admin email documented and known
- [ ] No default passwords used
- [ ] Invitation link expires in 24 hours
- [ ] Token is single-use only
- [ ] HTTPS enforced for setup page
- [ ] Password requirements enforced (12+ chars)

### Password Management

- [ ] Passwords hashed with bcrypt (cost 10+)
- [ ] Never stored in plain text
- [ ] Never logged to console/files
- [ ] Never sent via email
- [ ] Password reset available
- [ ] Account lockout after failed attempts

### Email Security

- [ ] SMTP uses TLS (port 587)
- [ ] App-specific passwords used
- [ ] Credentials in secrets/env only
- [ ] Links expire automatically
- [ ] Sent from professional address

---

## Password Requirements

Enforce strong passwords:

```typescript
function validatePassword(password: string) {
  const errors = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special character');
  }
  
  return errors;
}
```

---

## Multi-Admin Management

For teams with multiple admins:

```typescript
// Define admin roles
const ADMIN_EMAILS = [
  { email: 'romeo@djdannyhecticb.com', role: 'SUPER_ADMIN' },
  { email: 'dj@djdannyhecticb.com', role: 'ADMIN' },
  { email: 'manager@djdannyhecticb.com', role: 'ADMIN' }
];

// Seed all admins
for (const admin of ADMIN_EMAILS) {
  await ensureAdmin(admin.email, admin.role);
  const token = await createInviteToken(admin.email);
  await sendAdminInvite(admin.email, generateInviteUrl(token));
}
```

---

## Monitoring

Track admin access:

```typescript
// Log admin logins
await prisma.auditLog.create({
  data: {
    userId: admin.id,
    action: 'ADMIN_LOGIN',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date()
  }
});
```

Set up alerts for suspicious activity:
- Multiple failed login attempts
- Login from new location
- Unusual access times

---

## Recovery Procedures

### Lost Password

1. User requests reset via `/admin/forgot-password`
2. System sends reset link to registered email
3. User sets new password within 1 hour
4. Old reset links invalidated

### Locked Account

1. After 5 failed attempts, lock for 15 minutes
2. Admin can unlock via database:
   ```sql
   UPDATE users SET locked_until = NULL WHERE email = 'admin@...';
   ```
3. Or wait for automatic unlock

### Compromised Account

1. Immediately reset password
2. Revoke all active sessions
3. Review audit logs
4. Notify security team

---

## References

- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Standards](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

**Last Updated:** 2026-02-11

**Status:** Production Ready ✅
