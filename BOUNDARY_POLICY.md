# 🛡️ Architectural Boundary Policy

**Repository:** richhabits/djdannyhecticb  
**Site:** djdannyhecticb.co.uk  
**Status:** 🔒 **LOCKED - NOT NEGOTIABLE**  
**Last Updated:** 2026-02-09

---

## 🎯 Core Principle

**djdannyhecticb.co.uk is a standalone, sovereign site.**

This is not a shared platform. This is not a monorepo component. This is an independent product with its own codebase, infrastructure, and operational boundaries.

---

## ✅ What IS Allowed

### External Media Provider Relationship

djdannyhecticb.co.uk may integrate with **hecticradio.co.uk** as an **external media provider** through:

1. **Outbound Links**
   - Links to hecticradio.co.uk show pages
   - Links to live streams
   - Links to replays/archives

2. **Content Embedding**
   - Audio stream embeds via `<iframe>` or direct streaming URLs
   - Video embeds (if applicable)
   - Clear attribution: "Listen on Hectic Radio"

3. **Brand References**
   - Copyright notices mentioning "Hectic Radio" (brand association)
   - Social media hashtags (#HecticRadio)
   - Promotional content mentioning Hectic Radio as external platform

4. **Environment Variables**
   - `VITE_HECTIC_RADIO_STREAM_URL` - Stream URL for player (link-out only)
   - Read-only configuration pointing to external services

### Key Distinction

**This is a LINK-ONLY integration, not a platform merge.**

Think of it like:
- ✅ Embedding a YouTube video (external provider)
- ✅ Linking to Spotify (external platform)
- ✅ Adding social media share buttons (external service)

**NOT like:**
- ❌ Shared authentication system
- ❌ Shared database tables
- ❌ Microservices calling each other
- ❌ Shared utility libraries

---

## ❌ What is NOT Allowed

### Prohibited Integrations

The following are **explicitly forbidden** and will be rejected in code review:

#### 1. **Shared Backend Services**
- ❌ API endpoints shared between djdannyhecticb and other Hectic properties
- ❌ Shared Express.js middleware or route handlers
- ❌ Shared tRPC routers or procedures
- ❌ Backend-to-backend API calls between properties

#### 2. **Shared Databases**
- ❌ Shared MySQL/database instances
- ❌ Cross-database queries or joins
- ❌ Shared database schemas or tables
- ❌ Shared Drizzle ORM models or migrations
- ❌ Foreign keys or references to other properties' tables

#### 3. **Shared Authentication & Sessions**
- ❌ Shared user accounts or user tables
- ❌ Single sign-on (SSO) between properties
- ❌ Shared JWT secrets or session stores
- ❌ OAuth server shared with other properties
- ❌ Shared cookie domains

#### 4. **Shared Environment Variables**
- ❌ Environment variables that control other properties
- ❌ API keys shared with other services (beyond streaming URLs)
- ❌ Database URLs pointing to shared instances
- ❌ Shared secrets or credentials

**Exception:** Read-only URLs to external public endpoints (streaming URLs, public APIs)

#### 5. **Shared Docker Infrastructure**
- ❌ Docker Compose services shared between properties
- ❌ Shared Docker networks connecting multiple properties
- ❌ Shared volumes or bind mounts
- ❌ Shared containers running multiple properties
- ❌ Docker secrets shared across properties

#### 6. **Shared Code & Repositories**
- ❌ Git submodules from other Hectic properties
- ❌ npm packages published from other Hectic repos
- ❌ Copy-pasted utility functions from other properties
- ❌ Shared TypeScript types or interfaces (beyond public APIs)
- ❌ Monorepo workspaces with other properties

#### 7. **Project Contamination**
- ❌ Any code, configs, or artifacts from:
  - Piing
  - HecticTV
  - Other non-DJ Danny Hectic B properties
- ❌ References to other projects beyond external links
- ❌ Copied branding, logos, or assets from other properties

---

## 🔍 Boundary Verification Checklist

Use this checklist during code review to ensure the boundary is maintained:

### Database & Data Layer
- [ ] No foreign keys to external databases
- [ ] All database migrations are self-contained
- [ ] No shared database connection strings
- [ ] All Drizzle schemas are property-specific

### Backend Services
- [ ] No API calls to other Hectic property backends
- [ ] All Express routes serve this property only
- [ ] No shared authentication middleware
- [ ] All tRPC procedures are self-contained

### Frontend & Environment
- [ ] VITE_ variables only reference external public endpoints
- [ ] No shared component libraries beyond public npm packages
- [ ] All React components are property-specific
- [ ] No environment variables for other property backends

### Infrastructure
- [ ] docker-compose.yml contains only this property's services
- [ ] No shared Docker networks in compose file
- [ ] All volume mounts are property-specific
- [ ] nginx.conf only proxies this property's services

### Dependencies
- [ ] package.json has no dependencies on other Hectic repos
- [ ] No git submodules pointing to other properties
- [ ] All dependencies are from public npm registry
- [ ] No custom patches from other properties

---

## 🚨 What to Watch For

### Red Flags in Pull Requests

Reject any PR that includes:

1. **Environment Variables**
   ```env
   # ❌ BAD - References other property backend
   PIING_API_URL=https://api.piing.com
   HECTICTV_AUTH_TOKEN=secret
   
   # ✅ GOOD - External public endpoint only
   VITE_HECTIC_RADIO_STREAM_URL=https://stream.hecticradio.co.uk/live
   ```

2. **Database Queries**
   ```typescript
   // ❌ BAD - Cross-property query
   const users = await db.select().from(piing.users)
   
   // ✅ GOOD - Property-specific query
   const users = await db.select().from(djdanny.users)
   ```

3. **API Calls**
   ```typescript
   // ❌ BAD - Backend-to-backend call
   const response = await fetch(process.env.PIING_API_URL + '/users')
   
   // ✅ GOOD - Public streaming URL
   const stream = <audio src={import.meta.env.VITE_HECTIC_RADIO_STREAM_URL} />
   ```

4. **Docker Compose**
   ```yaml
   # ❌ BAD - Shared service
   services:
     web:
       depends_on:
         - piing-api
     
   # ✅ GOOD - Self-contained services
   services:
     web:
       depends_on:
         - db
         - redis
   ```

5. **Shared Utilities**
   ```typescript
   // ❌ BAD - Importing from other property
   import { formatDate } from '@piing/utils'
   
   // ✅ GOOD - Property-specific or public npm
   import { format } from 'date-fns'
   ```

---

## 🛠️ Enforcement Mechanisms

### Code Review Requirements

Every PR must be reviewed for boundary violations. Reviewers must:

1. **Check environment variables** - Verify no shared backend references
2. **Check imports** - Verify no imports from other Hectic properties
3. **Check docker-compose** - Verify no shared services or networks
4. **Check API calls** - Verify no backend-to-backend integrations
5. **Ask "Why?"** - If integration seems convenient, question if it violates the boundary

### Automated Checks (Future)

Consider adding pre-commit hooks or CI checks that:
- Scan for forbidden environment variable patterns
- Scan for imports from other Hectic properties
- Validate docker-compose has no external service references
- Check for shared database connection strings

---

## 📖 Rationale

### Why This Boundary Exists

1. **Security Independence**
   - A breach in one property doesn't compromise another
   - Each property has isolated credentials and secrets
   - Attack surface is minimized

2. **Operational Independence**
   - Deploy independently without coordination
   - Scale independently based on traffic
   - Troubleshoot without cross-property complexity

3. **Legal/Ownership Clarity**
   - Clear intellectual property boundaries
   - Independent licensing and contracts
   - No ambiguity about what belongs where

4. **Development Velocity**
   - Teams can work independently
   - No merge conflicts across properties
   - Faster iteration and deployment

5. **Brand Clarity**
   - Each property has distinct identity
   - No brand dilution or confusion
   - Clear user experience boundaries

### What Happens If Violated

Violating this boundary creates:
- **Security regressions** - Shared credentials, expanded attack surface
- **Brand dilution** - Confused user experience
- **Legal ambiguity** - Unclear ownership and licensing
- **Operational coupling** - One property's failure affects another
- **Technical debt** - Difficult to untangle later

**The cost of "convenience" now is exponentially higher cost later.**

---

## 🔄 Migration Path (If Needed)

If you find yourself needing to share functionality:

### Step 1: Evaluate
Ask:
- Is this truly shared functionality or property-specific?
- Can this be accomplished with a public npm package?
- Can this be an external service both properties use independently?

### Step 2: Extract to Public Package (If Appropriate)
If truly generic:
1. Create standalone npm package
2. Publish to npm registry (public or private)
3. Both properties depend on it independently
4. No cross-property code references

### Step 3: Create External API (If Needed)
If runtime integration is needed:
1. Create standalone API service
2. Both properties call it independently
3. No shared database or state
4. Versioned API contracts

### What NOT to Do
- ❌ Add git submodule
- ❌ Copy-paste code
- ❌ Share database
- ❌ Add dependency on other property's repo

---

## 📋 Post-Launch Monitoring

### Quarterly Boundary Audit

Every 3 months, run this audit:

1. **Code Audit**
   ```bash
   # Check for forbidden imports
   grep -r "from '@piing" src/
   grep -r "from '@hectictv" src/
   
   # Check for shared database references
   grep -r "piing\." server/
   grep -r "hectictv\." server/
   ```

2. **Environment Audit**
   ```bash
   # Check .env.example for forbidden variables
   grep -i "piing\|hectictv" .env.example
   
   # Check docker-compose for shared services
   grep -i "piing\|hectictv" docker-compose.yml
   ```

3. **Dependency Audit**
   ```bash
   # Check package.json for forbidden dependencies
   cat package.json | grep "@piing\|@hectictv"
   ```

4. **Infrastructure Audit**
   - Review Docker networks
   - Review database connections
   - Review API endpoints
   - Review environment variables in production

### If Violations Found

1. **Document the violation** - What was found and why it violates the boundary
2. **Create remediation plan** - How to remove the coupling
3. **Execute immediately** - Don't let violations persist
4. **Update this document** - Add new patterns to watch for

---

## ✅ Approval & Commitment

By merging code to this repository, you commit to maintaining this boundary.

**This is not optional. This is architectural law.**

If you disagree with this boundary:
1. Discuss in architecture review meeting
2. Propose alternative architecture
3. Get explicit approval from product/engineering leadership
4. Update this document with new approved boundary

**Do not violate the boundary "temporarily" or "just for testing."**

---

## 📞 Questions?

**Q: Can I use Hectic Radio's logo?**  
A: Only with proper attribution and link-out. Not embedded in the UI chrome.

**Q: Can I embed Hectic Radio's audio player?**  
A: Yes, as `<iframe>` or direct stream URL. No shared backend required.

**Q: Can I share user accounts between properties?**  
A: No. Each property has independent auth.

**Q: Can I copy a utility function from another Hectic property?**  
A: No. Extract to public npm package or rewrite it.

**Q: Can I call another Hectic property's API?**  
A: Only if it's a public API with no authentication. No backend-to-backend auth.

**Q: What if Product wants cross-property feature?**  
A: Design as external integration (links, embeds) or create standalone service both use.

---

**This document is the contract. Violating it requires architectural review and explicit approval.**

---

**Status:** 🔒 **LOCKED**  
**Enforcement:** **MANDATORY**  
**Last Updated:** 2026-02-09
