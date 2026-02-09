# 🛡️ Architecture Guardrails - Code Review Checklist

**Purpose:** Ensure the architectural boundary defined in BOUNDARY_POLICY.md is maintained.

**Use:** Review every PR against this checklist before approval.

---

## 🚦 Quick Pass/Fail Criteria

**If ANY of these are TRUE, REJECT the PR immediately:**

- [ ] Adds dependency on another Hectic property repository
- [ ] Adds shared database connection or cross-property database queries
- [ ] Adds backend-to-backend API calls to other Hectic properties
- [ ] Adds shared authentication/session logic
- [ ] Adds shared Docker services or networks
- [ ] Copies code from Piing, HecticTV, or other properties
- [ ] Adds environment variables referencing other property backends

---

## 📋 Detailed Review Checklist

### 1. Package Dependencies

**Check:** `package.json`

- [ ] No dependencies on `@piing/*` packages
- [ ] No dependencies on `@hectictv/*` packages
- [ ] No dependencies on other internal Hectic property packages
- [ ] All dependencies are from public npm registry or legitimate vendors
- [ ] No git dependencies pointing to other Hectic repos

**Command:**
```bash
# Check for forbidden dependencies
cat package.json | jq '.dependencies, .devDependencies' | grep -i "piing\|hectictv\|hecticradio"
```

**Red flags:**
```json
{
  "dependencies": {
    "@piing/utils": "^1.0.0",           // ❌ REJECT
    "@hectictv/components": "^2.0.0"    // ❌ REJECT
  }
}
```

---

### 2. Environment Variables

**Check:** `.env.example`, `docker-compose.yml`, config files

- [ ] No environment variables referencing other property backends
- [ ] `VITE_HECTIC_RADIO_STREAM_URL` is only external streaming URL (OK)
- [ ] No shared API keys or secrets
- [ ] No database URLs pointing to other property databases
- [ ] No OAuth/auth URLs shared with other properties

**Command:**
```bash
# Check for forbidden environment patterns
grep -i "piing\|hectictv" .env.example docker-compose.yml
```

**Allowed:**
```env
# ✅ OK - External public stream URL
VITE_HECTIC_RADIO_STREAM_URL=https://stream.hecticradio.co.uk/live
```

**Not allowed:**
```env
# ❌ REJECT - Backend API reference
PIING_API_URL=https://api.piing.com
PIING_API_KEY=secret123

# ❌ REJECT - Shared auth
SHARED_JWT_SECRET=secret456
OAUTH_SERVER_URL=https://auth.hecticnetwork.com
```

---

### 3. Database Schema & Queries

**Check:** `drizzle/`, `server/`, SQL files

- [ ] All Drizzle schemas are property-specific (no `piing.*`, `hectictv.*`)
- [ ] No foreign keys to external databases
- [ ] No cross-database queries or joins
- [ ] All migrations are self-contained
- [ ] No references to shared user tables or auth tables

**Command:**
```bash
# Check for cross-property database references
grep -r "piing\." drizzle/ server/
grep -r "hectictv\." drizzle/ server/
grep -r "shared\." drizzle/ server/
```

**Not allowed:**
```typescript
// ❌ REJECT - Cross-property query
const user = await db.select().from(piing.users).where(eq(piing.users.id, userId));

// ❌ REJECT - Shared auth table
import { users } from '@shared/schema';
```

**Allowed:**
```typescript
// ✅ OK - Property-specific schema
import { users } from './schema';
const user = await db.select().from(users).where(eq(users.id, userId));
```

---

### 4. API Calls & Backend Integration

**Check:** `server/`, API route files, fetch/axios calls

- [ ] No API calls to other Hectic property backends
- [ ] No tRPC clients connecting to other properties
- [ ] No Express routes proxying to other properties
- [ ] All API calls are to public external services or this property's backend
- [ ] No shared middleware or authentication logic

**Command:**
```bash
# Check for backend-to-backend calls
grep -r "fetch.*piing\|fetch.*hectictv" server/
grep -r "axios.*piing\|axios.*hectictv" server/
```

**Not allowed:**
```typescript
// ❌ REJECT - Backend-to-backend call
const users = await fetch(process.env.PIING_API_URL + '/api/users');

// ❌ REJECT - Shared tRPC client
import { piingClient } from '@piing/trpc-client';
```

**Allowed:**
```typescript
// ✅ OK - Public external service
const stream = await fetch('https://stream.hecticradio.co.uk/status');

// ✅ OK - This property's API
const data = await fetch('/api/mixes');
```

---

### 5. Docker & Infrastructure

**Check:** `docker-compose.yml`, `Dockerfile`, nginx configs

- [ ] No shared Docker services between properties
- [ ] No shared Docker networks
- [ ] No shared volumes (beyond certbot certificates)
- [ ] nginx.conf only proxies this property's services
- [ ] No containers running multiple properties

**Command:**
```bash
# Check Docker compose for shared services
grep -i "piing\|hectictv" docker-compose.yml
docker-compose config | grep -i "external: true"
```

**Not allowed:**
```yaml
# ❌ REJECT - Shared service
services:
  web:
    depends_on:
      - piing-api
  
  piing-api:
    image: piing/api:latest
    
# ❌ REJECT - Shared network
networks:
  hectic-network:
    external: true
```

**Allowed:**
```yaml
# ✅ OK - Self-contained services
services:
  web:
    build: .
    depends_on:
      - db
  
  db:
    image: mysql:8.0
```

---

### 6. Imports & Code References

**Check:** TypeScript/JavaScript files

- [ ] No imports from other Hectic property packages
- [ ] No shared utility functions (unless from public npm)
- [ ] No shared React components (unless from public npm)
- [ ] No shared TypeScript types (unless from public APIs)
- [ ] All imports are from this repo, node_modules, or relative paths

**Command:**
```bash
# Check for forbidden imports
grep -r "from '@piing" client/ server/ shared/
grep -r "from '@hectictv" client/ server/ shared/
grep -r "import.*piing" client/ server/ shared/
```

**Not allowed:**
```typescript
// ❌ REJECT - Importing from another property
import { formatDate } from '@piing/utils';
import { UserCard } from '@hectictv/components';
import type { PiingUser } from '@piing/types';
```

**Allowed:**
```typescript
// ✅ OK - Public npm packages
import { format } from 'date-fns';
import { Card } from '@radix-ui/react-card';

// ✅ OK - Property-specific code
import { formatDate } from '@/lib/utils';
import { UserCard } from '@/components/UserCard';
import type { User } from '@shared/types';
```

---

### 7. Authentication & Sessions

**Check:** Auth logic, session management, OAuth config

- [ ] No shared authentication systems
- [ ] No single sign-on (SSO) with other properties
- [ ] Independent JWT secrets
- [ ] Independent session storage
- [ ] Independent user database

**Not allowed:**
```typescript
// ❌ REJECT - Shared auth service
const auth = await fetch('https://auth.hecticnetwork.com/verify');

// ❌ REJECT - Shared session store
const session = await redis.get(`hectic:session:${sessionId}`);

// ❌ REJECT - SSO logic
if (req.cookies.hectic_sso_token) {
  const user = await validateSSOToken(req.cookies.hectic_sso_token);
}
```

**Allowed:**
```typescript
// ✅ OK - Property-specific auth
const user = await verifyJWT(token, process.env.JWT_SECRET);
const session = await db.select().from(sessions).where(eq(sessions.id, sessionId));
```

---

### 8. Configuration Files

**Check:** `tsconfig.json`, `vite.config.ts`, build configs

- [ ] No paths or aliases pointing to other property repos
- [ ] No shared build configurations
- [ ] All paths are relative or within this repo
- [ ] No workspace references to other properties

**Not allowed:**
```json
{
  "compilerOptions": {
    "paths": {
      "@piing/*": ["../piing/src/*"],        // ❌ REJECT
      "@shared/*": ["../shared-lib/src/*"]   // ❌ REJECT
    }
  }
}
```

**Allowed:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/src/*"],              // ✅ OK
      "@shared/*": ["./shared/*"]             // ✅ OK
    }
  }
}
```

---

### 9. Git & Repository Structure

**Check:** `.gitmodules`, git configuration

- [ ] No git submodules pointing to other Hectic properties
- [ ] No git subtrees from other properties
- [ ] Repository is standalone (not part of monorepo)
- [ ] No symbolic links to other property code

**Command:**
```bash
# Check for submodules
cat .gitmodules 2>/dev/null
git submodule status

# Check for symlinks outside repo
find . -type l -ls | grep -v node_modules
```

---

## 🎯 Exception Process

If you believe a shared integration is necessary:

### Step 1: Stop
Don't implement it yet. Discuss first.

### Step 2: Document
Create an RFC (Request for Comments) that includes:
1. What needs to be shared and why
2. Why the boundary rule doesn't apply
3. Alternative approaches considered
4. Security implications
5. Long-term maintenance implications

### Step 3: Review
Present to architecture review team:
- Engineering lead
- Security reviewer
- Product owner

### Step 4: Update Policy
If approved:
1. Update BOUNDARY_POLICY.md with the exception
2. Document why exception is allowed
3. Add monitoring for the exception
4. Set review date to reassess

### Step 5: Implement
Only after approval and documentation.

---

## 🚨 Enforcement Actions

### If Boundary Violation Found in PR

1. **Comment on PR:**
   ```
   ⚠️ BOUNDARY VIOLATION DETECTED
   
   This PR violates the architectural boundary defined in BOUNDARY_POLICY.md.
   
   Violation: [Describe what was found]
   Policy: [Link to relevant section]
   
   Action Required: Remove the violation or request architectural exception.
   
   See ARCHITECTURE_GUARDRAILS.md for details.
   ```

2. **Request changes**

3. **Do not merge** until violation is resolved

### If Boundary Violation Found in Production

1. **Create incident ticket** with severity based on:
   - P0: Shared credentials or database access
   - P1: Shared backend services or auth
   - P2: Shared Docker infrastructure
   - P3: Shared utility code or components

2. **Document the violation** in incident report

3. **Create remediation plan** within 24 hours

4. **Execute remediation** based on severity:
   - P0: Immediate rollback, fix within 4 hours
   - P1: Fix within 24 hours
   - P2: Fix within 1 week
   - P3: Fix within 2 weeks

5. **Post-mortem** to understand how it happened

6. **Update guardrails** to prevent recurrence

---

## 📊 Quarterly Audit Script

Run this every 3 months:

```bash
#!/bin/bash
# Boundary Audit Script

echo "=== BOUNDARY AUDIT ==="
echo ""

echo "1. Checking package.json for forbidden dependencies..."
cat package.json | jq '.dependencies, .devDependencies' | grep -i "piing\|hectictv\|hecticradio" && echo "⚠️  Found potential violations" || echo "✅ Clean"
echo ""

echo "2. Checking environment variables..."
grep -i "piing\|hectictv" .env.example docker-compose.yml && echo "⚠️  Found potential violations" || echo "✅ Clean"
echo ""

echo "3. Checking database references..."
grep -r "piing\." drizzle/ server/ 2>/dev/null && echo "⚠️  Found potential violations" || echo "✅ Clean"
echo ""

echo "4. Checking imports..."
grep -r "from '@piing\|from '@hectictv" client/ server/ shared/ 2>/dev/null && echo "⚠️  Found potential violations" || echo "✅ Clean"
echo ""

echo "5. Checking Docker configuration..."
grep -i "piing\|hectictv" docker-compose.yml && echo "⚠️  Found potential violations" || echo "✅ Clean"
echo ""

echo "6. Checking git submodules..."
cat .gitmodules 2>/dev/null && echo "⚠️  Submodules detected" || echo "✅ No submodules"
echo ""

echo "=== AUDIT COMPLETE ==="
```

Save as `scripts/boundary-audit.sh` and run quarterly.

---

## ✅ Approval Statement

By approving a PR, you certify that:

1. You have reviewed it against this checklist
2. You found no boundary violations
3. Any Hectic Radio references are legitimate (brand, external links, streams)
4. The PR maintains architectural independence

**Reviewer signature:** Add comment: "✅ Boundary check: PASS"

---

**Last Updated:** 2026-02-09  
**Status:** 🔒 **ACTIVE ENFORCEMENT**
