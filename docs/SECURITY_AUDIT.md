# Security Audit: Exposed Secrets & Rotation Plan

**Audit Date**: 2026-05-03  
**Status**: CRITICAL - Multiple API keys exposed in .env file  
**Risk Level**: HIGH  
**Action Required**: IMMEDIATE ROTATION OF ALL SECRETS

---

## Executive Summary

A comprehensive security audit has identified **8 exposed API keys and secrets** stored in `/Users/romeovalentine/djdannyhecticb/.env`. While the file is correctly excluded from version control via `.gitignore`, the secrets are currently in plaintext on the local filesystem and may have been exposed through:
- Development machine sharing
- Backup systems
- CI/CD logs
- GitHub Actions cache (if ever used)

**Recommendation**: Rotate ALL secrets immediately using the step-by-step procedures below.

---

## Secrets Inventory

### CRITICAL SEVERITY (Must Rotate Immediately)

| Secret | Current Status | Exposure Risk | Action |
|--------|----------------|----------------|--------|
| `GOOGLE_CLIENT_SECRET` | Exposed in .env | HIGH - OAuth compromise | Rotate immediately |
| `GOOGLE_CLIENT_ID` | Exposed in .env | HIGH - OAuth compromise | Rotate immediately |
| `GOOGLE_AI_API_KEY` | Exposed in .env | HIGH - Gemini API abuse | Rotate immediately |
| `DATABASE_URL` (Supabase) | Exposed in .env | CRITICAL - DB access | Rotate immediately |
| `JWT_SECRET` | Exposed in .env | HIGH - Session hijacking | Rotate immediately |
| `YOUTUBE_DATA_API_KEY` | Exposed in .env | HIGH - API abuse | Rotate immediately |
| `TWITCH_CLIENT_SECRET` | Exposed in .env | HIGH - OAuth compromise | Rotate immediately |
| `TICKETMASTER_API_KEY` | Exposed in .env | MEDIUM - API quota abuse | Rotate immediately |

### MEDIUM SEVERITY (Rotate for Defense in Depth)

| Secret | Current Status | Notes |
|--------|----------------|-------|
| `TWITCH_CLIENT_ID` | Exposed in .env | Rotate to invalidate secret |
| `ADMIN_EMAILS` | In .env | Not a secret, but sensitive |

### NOT YET CONFIGURED (Monitor These)

| Service | Status | Action |
|---------|--------|--------|
| `STRIPE_SECRET_KEY` | Empty | Securely configure before use |
| `STRIPE_PUBLISHABLE_KEY` | Empty | Securely configure before use |
| `STRIPE_WEBHOOK_SECRET` | Empty | Securely configure before use |
| `GROQ_API_KEY` | Empty | Securely configure before use |
| `COHERE_API_KEY` | Empty | Securely configure before use |
| `HUGGINGFACE_API_KEY` | Empty | Securely configure before use |

---

## Exposure Analysis

### Git Status ✅ SAFE
- `.env` file: **NOT in version control** (.gitignore correctly blocks it)
- No commits found containing `.env`
- No commit history exposure detected
- Git guard script present: `/scripts/guard-secrets.sh` ✅

### Code Hardcoding ✅ SAFE
- No hardcoded secrets found in source code
- All secrets properly loaded from environment variables
- Code correctly references `process.env.*` variables

### .gitignore Status ✅ CONFIGURED
```
.env              # Blocks .env
.env.local        # Blocks local overrides
.env.*.local      # Blocks all .env.*.local patterns
.env.production   # Blocks production env
.env.development  # Blocks development env
.env.test         # Blocks test env
```

### Current Vulnerabilities
1. **Local filesystem exposure**: .env exists on unencrypted disk
2. **Plaintext storage**: No encryption of secrets at rest
3. **No secret rotation history**: Can't detect when/if keys were compromised
4. **No audit trail**: No logging of secret access
5. **Manual management**: Error-prone, no central secret store

---

## IMMEDIATE ROTATION PROCEDURES

### Step 1: Google OAuth (CRITICAL)

**Timeline**: Complete within 24 hours  
**Affected Services**: Login, OAuth

#### 1.1 Revoke Current Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project containing OAuth credentials
3. Navigate to: **Credentials** → **OAuth 2.0 Client IDs**
4. Find the web client ID currently in use
5. Click the trash icon to delete: `223520511634-plit8kpi986o5vhleoadlmfs7bpa92h3.apps.googleusercontent.com`
6. Click **Delete** to confirm

#### 1.2 Create New OAuth Credentials
1. In Google Cloud Console: **Credentials** → **+ Create Credentials** → **OAuth 2.0 Client ID**
2. Select **Web application**
3. Name it: `djdannyhecticb-oauth-2026-05-03-rotated`
4. **Authorized JavaScript origins**:
   - `http://localhost:3000` (dev)
   - `https://djdannyhecticb.vercel.app` (prod)
5. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (dev)
   - `https://djdannyhecticb.vercel.app/api/auth/google/callback` (prod)
6. Click **Create**
7. Copy the new **Client ID** and **Client Secret**

#### 1.3 Update Environment Variables

**Local Development** (.env):
```bash
GOOGLE_CLIENT_ID=<NEW_CLIENT_ID_HERE>
GOOGLE_CLIENT_SECRET=<NEW_CLIENT_SECRET_HERE>
VITE_GOOGLE_CLIENT_ID=<NEW_CLIENT_ID_HERE>
```

**Production** (Vercel):
```bash
# Use Vercel CLI or Dashboard
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add VITE_GOOGLE_CLIENT_ID
```

#### 1.4 Verify
```bash
# Restart local dev server
npm run dev

# Test OAuth login at http://localhost:3000
# Should redirect to Google login
```

---

### Step 2: Google AI / Gemini API (CRITICAL)

**Timeline**: Complete within 24 hours  
**Affected Services**: AI responses, content generation

#### 2.1 Revoke Current API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** → **Credentials**
3. Find the API key: `AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8`
4. Click the pencil icon to edit
5. Click **Delete API Key**

#### 2.2 Create New API Key
1. **APIs & Services** → **Credentials** → **+ Create Credentials** → **API Key**
2. Copy the new key
3. (Optional) Restrict to Gemini API:
   - Click the key to edit
   - Under "API restrictions": Select **Restrict key**
   - Choose **Google AI** or **Generative Language API**

#### 2.3 Update Environment Variables

**Local** (.env):
```bash
GOOGLE_AI_API_KEY=<NEW_API_KEY_HERE>
```

**Vercel**:
```bash
vercel env add GOOGLE_AI_API_KEY
```

#### 2.4 Verify
```bash
# Restart dev server, test any AI features
```

---

### Step 3: Database Credentials (CRITICAL)

**Timeline**: Complete within 4 hours  
**Affected Services**: All database operations, authentication, data storage

#### 3.1 Supabase Password Reset
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (db.mzfpsfnmeacbknpcpibj.supabase.co)
3. Navigate to: **Database** → **Password**
4. Click **Generate a new password**
5. Confirm by entering your dashboard password
6. Copy the new database password

#### 3.2 Update DATABASE_URL
Format: `postgresql://postgres:<NEW_PASSWORD>@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres`

**Local** (.env):
```bash
DATABASE_URL=postgresql://postgres:<NEW_PASSWORD>@db.mzfpsfnmeacbknpcpibj.supabase.co:5432/postgres
```

**Vercel**:
```bash
vercel env add DATABASE_URL
```

#### 3.3 Test Database Connection
```bash
# Run migrations to verify connection
npm run db:migrate

# Or test with:
npm run db:query "SELECT version();"
```

---

### Step 4: JWT Secret (HIGH)

**Timeline**: Complete within 24 hours  
**Affected Services**: Session tokens, authentication

#### 4.1 Generate New JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Output: A 64-character hex string

#### 4.2 Update Environment Variables

**Local** (.env):
```bash
JWT_SECRET=<64_CHARACTER_HEX_STRING>
```

**Vercel**:
```bash
vercel env add JWT_SECRET
```

#### 4.3 Handle Existing Sessions
- **Old tokens become invalid** after deployment
- Users will need to log in again
- This is **expected and safe**
- No data loss occurs

---

### Step 5: YouTube Data API Key (HIGH)

**Timeline**: Complete within 48 hours  
**Affected Services**: YouTube livestream integration

#### 5.1 Revoke Current Key
1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Find key: `AIzaSyBGSh5G9yb8h5mOopY2VgQM4ZXe5cCYkq8`
4. Delete it

#### 5.2 Create New Key
1. **+ Create Credentials** → **API Key**
2. (Optional) Restrict to YouTube Data API v3
3. Copy the new key

#### 5.3 Update Environment Variables

**Local** (.env):
```bash
YOUTUBE_DATA_API_KEY=<NEW_API_KEY>
```

**Vercel**:
```bash
vercel env add YOUTUBE_DATA_API_KEY
```

---

### Step 6: Twitch Credentials (HIGH)

**Timeline**: Complete within 48 hours  
**Affected Services**: Twitch livestream integration

#### 6.1 Revoke Current Credentials
1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Find your registered application
3. Click **Manage**
4. Under "OAuth Credentials":
   - Click **Revoke** on both Client ID and Client Secret
5. Confirm revocation

#### 6.2 Generate New Credentials
1. Click **+ Create Application** or use existing one
2. Set OAuth Redirect URL: `https://djdannyhecticb.vercel.app/api/auth/twitch/callback`
3. Copy new **Client ID**
4. Click **Generate a new secret**
5. Copy new **Client Secret**

#### 6.3 Update Environment Variables

**Local** (.env):
```bash
TWITCH_CLIENT_ID=<NEW_CLIENT_ID>
TWITCH_CLIENT_SECRET=<NEW_SECRET>
```

**Vercel**:
```bash
vercel env add TWITCH_CLIENT_ID
vercel env add TWITCH_CLIENT_SECRET
```

---

### Step 7: Ticketmaster API Key (MEDIUM)

**Timeline**: Complete within 72 hours  
**Affected Services**: Event discovery

#### 7.1 Revoke Current Key
1. Go to [Ticketmaster Developer Portal](https://developer.ticketmaster.com/admin/applications)
2. Find your app
3. Click **Delete** on the API key: `JSpS3YlOxqijvAGVzBmELBQLcH535FF`
4. Confirm

#### 7.2 Generate New Key
1. Click **Create Application**
2. Fill in application details
3. Accept terms
4. Copy the new **API Key**

#### 7.3 Update Environment Variables

**Local** (.env):
```bash
TICKETMASTER_API_KEY=<NEW_API_KEY>
```

**Vercel**:
```bash
vercel env add TICKETMASTER_API_KEY
```

---

## Rotation Checklist

- [ ] **Step 1**: Google OAuth credentials rotated
  - [ ] Old credentials deleted from Google Cloud Console
  - [ ] New credentials created
  - [ ] .env updated locally
  - [ ] Vercel env vars updated
  - [ ] Local login tested
  - [ ] Prod login tested

- [ ] **Step 2**: Google AI API key rotated
  - [ ] Old key deleted
  - [ ] New key created
  - [ ] Environment variables updated
  - [ ] AI features tested

- [ ] **Step 3**: Database password rotated
  - [ ] New password generated in Supabase
  - [ ] DATABASE_URL updated
  - [ ] Database connection tested
  - [ ] Migrations run successfully

- [ ] **Step 4**: JWT secret rotated
  - [ ] New secret generated
  - [ ] Environment variables updated
  - [ ] Users notified of re-login requirement
  - [ ] Monitoring for session issues

- [ ] **Step 5**: YouTube API key rotated
  - [ ] Old key deleted
  - [ ] New key created
  - [ ] Environment variables updated
  - [ ] YouTube integration tested

- [ ] **Step 6**: Twitch credentials rotated
  - [ ] Old credentials revoked
  - [ ] New Client ID and Secret created
  - [ ] Environment variables updated
  - [ ] Twitch integration tested

- [ ] **Step 7**: Ticketmaster API key rotated
  - [ ] Old key deleted
  - [ ] New key created
  - [ ] Environment variables updated
  - [ ] Event discovery tested

- [ ] **Post-Rotation**: All steps verified and documented
  - [ ] All services functioning
  - [ ] No authentication errors
  - [ ] Production deployment successful
  - [ ] Audit log updated

---

## Safe Storage Implementation

### Phase 1: Immediate (Done)
✅ Secrets only in `.env` (local) and Vercel env vars (prod)  
✅ `.env` properly excluded from git  
✅ Guard script prevents accidental commits  

### Phase 2: Short-term (Recommended)

#### 2a. Implement Encryption at Rest
Use the existing `SecretsManager` class:
```typescript
import { SecretsManager } from './server/_core/secrets';

// In database migrations: store encrypted keys
const encrypted = SecretsManager.encrypt(apiKey);
// Later: decrypt when needed
const decrypted = SecretsManager.decrypt(encrypted);
```

#### 2b. Move Sensitive Keys to Supabase Vault
Store in Supabase instead of Vercel:
```sql
CREATE TABLE secrets_vault (
  id BIGSERIAL PRIMARY KEY,
  key_name TEXT UNIQUE NOT NULL,
  encrypted_value TEXT NOT NULL,
  rotation_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 3: Long-term (Best Practice)

1. **Adopt AWS Secrets Manager** or **HashiCorp Vault**
   - Centralized secret management
   - Automatic rotation policies
   - Access audit trails
   - Encryption at rest

2. **Implement Key Rotation Automation**
   ```bash
   # Cron job (monthly)
   0 0 1 * * /scripts/rotate-secrets.sh
   ```

3. **Add Secret Scanning to CI/CD**
   ```yaml
   # .github/workflows/secrets-check.yml
   - uses: gitleaks/gitleaks-action@v2
   ```

---

## Verification Procedures

### Verify Secrets Are Not in Code
```bash
# Check for hardcoded values
grep -r "GOCSPX\|AIzaSy\|Blackgrapeman" . --include="*.ts" --include="*.js"
# Should return: 0 matches

# Check for secrets in git history
git log --all -S "GOCSPX" --oneline
# Should return: 0 commits
```

### Verify .gitignore is Working
```bash
# These should all show "not tracked"
git status .env
git status .env.local
git check-ignore -v .env
```

### Verify Environment Variables
```bash
# Check Vercel
vercel env list

# Check local
cat .env | grep -E "GOOGLE|DATABASE|JWT" | head -10
```

---

## Incident Response Playbook

### If Additional Compromise Detected:

1. **Immediate Actions** (< 5 minutes)
   - Revoke all API keys simultaneously
   - Reset database password
   - Invalidate all JWT tokens
   - Block old OAuth credentials

2. **Short-term** (< 24 hours)
   - Generate new credentials for all services
   - Deploy updated environment variables
   - Monitor for unauthorized access

3. **Long-term** (< 1 week)
   - Review access logs
   - Audit database for suspicious activity
   - Document timeline of exposure
   - Update security policies

4. **Communication** (Parallel)
   - Notify users if data compromise suspected
   - Document all steps taken
   - Update security audit trail

---

## Monitoring & Alerts

### Set Up Alerts For:
1. **Failed authentication attempts**: Monitor for brute force
2. **Unusual API usage**: Watch for quota overages
3. **Database access anomalies**: Large/unexpected queries
4. **Token generation spikes**: Possible session hijacking

### Monthly Review
- Check for unused API keys → Delete them
- Verify all secrets in Vercel match .env.example format
- Review git logs for any suspicious commits
- Test secret rotation procedures

---

## References

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Google Cloud: Manage API Keys](https://cloud.google.com/docs/authentication/api-keys)
- [Supabase: Security Best Practices](https://supabase.com/docs/guides/self-hosting/security)
- [Vercel: Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-03  
**Next Review**: 2026-05-10 (post-rotation)
