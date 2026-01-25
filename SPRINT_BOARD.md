# Sprint Board - DJ Danny Hectic B
**Current Sprint:** Sprint 1 - Core APIs & Backend Hardening  
**Start Date:** January 25, 2026  
**Duration:** 3 weeks (5 sprints)

---

## 📊 Sprint Overview

| Sprint | Focus | Duration | PRs |
|--------|-------|----------|-----|
| Sprint 1 | Core APIs & Backend Hardening | Week 1 | 6 PRs |
| Sprint 2 | Admin Foundation | Week 1-2 | 6 PRs |
| Sprint 3 | Frontend Completeness | Week 2 | 7 PRs |
| Sprint 4 | AI Tools | Week 2-3 | 5 PRs |
| Sprint 5 | Deployment Hardening | Week 3 | 5 PRs |

---

## 🎯 Sprint 1: Core APIs & Backend Hardening

**Goal:** Stable, secure, observable backend  
**Branch:** `feat/core-apis`  
**Status:** 🔴 Not Started

### Tasks

#### 1.1 Rate Limiting [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 2 hours
- **Files:** `server/_core/rateLimit.ts`, `server/index.ts`
- **Acceptance:**
  - [ ] Rate limit middleware created
  - [ ] Applied to `/api/auth/*` (5 req/min)
  - [ ] Applied to `/api/shouts/*` (10 req/min)
  - [ ] Applied to `/api/mixes/download` (5 req/min)
  - [ ] Returns 429 with retry-after header
  - [ ] Tested with load test

#### 1.2 Audit Logging [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `drizzle/schema.ts`, `server/_core/audit.ts`, `server/routers.ts`
- **Acceptance:**
  - [ ] `audit_logs` table created and migrated
  - [ ] Audit middleware logs all admin mutations
  - [ ] Logs: mix create/update/delete, event create/update/delete, shout approve/reject
  - [ ] Admin endpoint: `audit.list` with filters
  - [ ] Tested: verify logs created on admin actions

#### 1.3 Structured Logging [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `server/_core/logger.ts`, `server/index.ts`
- **Acceptance:**
  - [ ] Request ID middleware (uuid per request)
  - [ ] Structured logger (winston or pino)
  - [ ] Log format includes: requestId, timestamp, level, message, userId, path, method
  - [ ] Error logging with stack traces
  - [ ] Tested: verify logs include requestId

#### 1.4 Security Headers [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 2 hours
- **Files:** `server/index.ts`
- **Acceptance:**
  - [ ] Helmet.js middleware added
  - [ ] CSP, HSTS, X-Frame-Options, X-Content-Type-Options configured
  - [ ] CORS whitelist: production domains only
  - [ ] Tested with security headers checker
  - [ ] Verified: headers present in response

#### 1.5 Database Seed Scripts [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 2 hours
- **Files:** `scripts/seed.ts`, `package.json`
- **Acceptance:**
  - [ ] Seed script creates: 5 mixes, 3 events, 10 shouts, 1 admin user
  - [ ] Command: `pnpm db:seed`
  - [ ] Idempotent (can run multiple times)
  - [ ] Tested: verify data created, no duplicates

#### 1.6 Migration Validation [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 2 hours
- **Files:** `scripts/validate-migrations.ts`
- **Acceptance:**
  - [ ] Migration checks: no breaking changes
  - [ ] Schema validation: matches code expectations
  - [ ] Rollback scripts for critical migrations
  - [ ] Tested: verify validation catches issues

---

## 🎯 Sprint 2: Admin Foundation

**Goal:** Operational control panel  
**Branch:** `feat/admin-foundation`  
**Status:** 🔴 Not Started

### Tasks

#### 2.1 Admin Dashboard [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/pages/AdminDashboard.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Dashboard shows: stream status, now playing, shoutbox volume, pending moderation
  - [ ] Real-time updates (polling every 5s)
  - [ ] Quick actions: approve shouts, set active stream
  - [ ] Responsive layout
  - [ ] Tested: verify data updates, actions work

#### 2.2 Media Library [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 8 hours
- **Files:** `client/src/pages/AdminMedia.tsx`, `server/routers.ts`, `server/routes/upload.ts`
- **Acceptance:**
  - [ ] Upload: images, press photos, cover art
  - [ ] Storage: S3 or local filesystem
  - [ ] CRUD: list, upload, delete, replace
  - [ ] Search/filter by type, date
  - [ ] Tested: verify upload works, files stored

#### 2.3 Site Settings [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `client/src/pages/AdminSettings.tsx`, `server/routers.ts`, `drizzle/schema.ts`
- **Acceptance:**
  - [ ] Settings page: hero text, social links, contact email, SEO defaults
  - [ ] Backend: `settings.get`, `settings.update` (admin only)
  - [ ] Database: `site_settings` table
  - [ ] Frontend: form with validation
  - [ ] Tested: verify settings save, reflect on homepage

#### 2.4 User Management [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/pages/AdminUsers.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] List all users with roles
  - [ ] Actions: change role, ban/unban, view audit log
  - [ ] Backend: `users.list`, `users.updateRole`, `users.ban`
  - [ ] Audit log integration
  - [ ] Tested: verify roles change, bans work

#### 2.5 Audit Log Viewer [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/pages/AdminAudit.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Table: timestamp, user, action, resource, changes (diff view)
  - [ ] Filters: user, action type, date range, resource type
  - [ ] Export to CSV
  - [ ] Tested: verify filters work, export functional

#### 2.6 Bulk Operations [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `client/src/pages/AdminShouts.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Shoutbox: select multiple, bulk approve/reject
  - [ ] Mixes: bulk publish/unpublish, bulk delete
  - [ ] Events: bulk publish/unpublish
  - [ ] Tested: verify bulk actions work, audit logged

---

## 🎯 Sprint 3: Frontend Completeness

**Goal:** Every page works, no dead states  
**Branch:** `feat/frontend-complete`  
**Status:** 🔴 Not Started

### Tasks

#### 3.1 Skeleton Loaders [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `client/src/components/SkeletonLoader.tsx`
- **Acceptance:**
  - [ ] SkeletonLoader component created
  - [ ] Applied to: mixes list, events list, shoutbox feed
  - [ ] Matches content layout
  - [ ] Tested: verify skeletons show during loading

#### 3.2 Empty States [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 2 hours
- **Files:** `client/src/components/EmptyState.tsx`
- **Acceptance:**
  - [ ] EmptyState component created
  - [ ] Applied to: no mixes, no events, no shouts
  - [ ] Includes: icon, message, CTA (if applicable)
  - [ ] Tested: verify empty states show correctly

#### 3.3 Error Boundaries [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `client/src/components/ErrorBoundary.tsx`
- **Acceptance:**
  - [ ] ErrorBoundary enhanced (already exists)
  - [ ] Catches React errors, shows user-friendly message
  - [ ] Logs errors to backend
  - [ ] Recovery: retry button, report issue link
  - [ ] Tested: verify errors caught, user sees message

#### 3.4 Real-time Updates [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/hooks/useRealtime.ts`, `server/routers.ts`
- **Acceptance:**
  - [ ] Shoutbox: polling every 5s for new shouts
  - [ ] Now playing: update stream metadata in real-time
  - [ ] Live status: stream up/down indicator
  - [ ] Tested: verify updates work, no page refresh needed

#### 3.5 SEO Per Route [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `client/src/pages/Mixes.tsx`, `client/src/pages/Events.tsx`
- **Acceptance:**
  - [ ] Dynamic meta tags for: mixes, events, podcasts
  - [ ] OG tags with images
  - [ ] Twitter cards
  - [ ] Canonical URLs
  - [ ] Tested: verify each route has unique meta tags

#### 3.6 Social Sharing [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `client/src/components/SocialShare.tsx`
- **Acceptance:**
  - [ ] Share buttons: Facebook, Twitter, WhatsApp, copy link
  - [ ] Shareable content: mixes, events, homepage
  - [ ] Pre-filled text: "Check out [Mix/Event] by DJ Danny Hectic B"
  - [ ] Tested: verify share buttons work

#### 3.7 Mobile Optimizations [Frontend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `client/src/components/GlobalNav.tsx`, `client/src/index.css`
- **Acceptance:**
  - [ ] Touch targets: min 44x44px
  - [ ] Swipe gestures: swipe to refresh shoutbox
  - [ ] Bottom navigation: sticky nav on mobile
  - [ ] Viewport meta: proper scaling
  - [ ] Tested: verify mobile UX smooth

---

## 🎯 Sprint 4: AI Tools

**Goal:** High-leverage AI tools (no gimmicks)  
**Branch:** `feat/ai-tools`  
**Status:** 🔴 Not Started

### Tasks

#### 4.1 EPK Generator [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/pages/AdminAIEPK.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Admin-only: `/admin/ai/epk`
  - [ ] Input: mix/event title, description, date
  - [ ] Output: press blurb, social posts, email copy
  - [ ] System prompt: "You are DJ Danny Hectic B's press agent..."
  - [ ] Templates: short bio, long bio, press release
  - [ ] Tested: verify EPK generated, matches voice

#### 4.2 SEO Assistant [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `client/src/pages/AdminAISEO.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Admin-only: `/admin/ai/seo`
  - [ ] Input: page content, target keywords
  - [ ] Output: meta title (60 chars), description (160 chars), OG copy
  - [ ] Validate length, suggest improvements
  - [ ] Tested: verify SEO copy generated, length-validated

#### 4.3 Content Repurposer [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `client/src/pages/AdminAIRepurpose.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Admin-only: `/admin/ai/repurpose`
  - [ ] Input: mix/event
  - [ ] Output: 10 promo posts (IG caption, TikTok caption, story text, email blurb, etc.)
  - [ ] Templates per platform
  - [ ] Tested: verify multiple formats generated

#### 4.4 Shoutbox Moderation [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 6 hours
- **Files:** `server/routers.ts`, `client/src/pages/AdminShouts.tsx`
- **Acceptance:**
  - [ ] Backend: toxicity/spam scoring (use AI provider)
  - [ ] Auto-hold queue for flagged shouts
  - [ ] Admin: review queue, approve/reject
  - [ ] Config: threshold for auto-hold
  - [ ] Tested: verify toxic shouts auto-flagged

#### 4.5 Fan Concierge [Frontend + Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 8 hours
- **Files:** `client/src/components/AIConcierge.tsx`, `server/routers.ts`
- **Acceptance:**
  - [ ] Public: FAQ assistant (chat interface)
  - [ ] Knowledge source: allowlist only (bio, FAQ, mixes list, events list)
  - [ ] No hallucinations: "I don't know" for out-of-scope questions
  - [ ] Rate limiting: 5 questions per hour
  - [ ] Tested: verify FAQ answered correctly

---

## 🎯 Sprint 5: Deployment Hardening

**Goal:** Production-ready, single deployment path  
**Branch:** `feat/deploy-hardening`  
**Status:** 🔴 Not Started

### Tasks

#### 5.1 Deployment Golden Path [DevOps] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `README_DEPLOY.md`
- **Acceptance:**
  - [ ] Single deployment method documented
  - [ ] Remove ambiguity: Docker Compose + Nginx + SSL
  - [ ] Remove unused deployment scripts or archive
  - [ ] Add deployment checklist
  - [ ] Tested: verify deployment works from docs

#### 5.2 Release Process [DevOps] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `CHANGELOG.md`, `.github/workflows/ci.yml`
- **Acceptance:**
  - [ ] Tag strategy: `v1.0.0`, `v1.1.0-admin`, etc.
  - [ ] Changelog: `CHANGELOG.md` with versions
  - [ ] CI checks: tests, lint, type-check before merge
  - [ ] Production branch policy: PR required, checks required
  - [ ] Tested: verify tags created, CI enforces quality

#### 5.3 Error Reporting [Backend] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `server/_core/errorReporting.ts`, `server/index.ts`
- **Acceptance:**
  - [ ] Sentry (or similar) integrated
  - [ ] Capture: unhandled errors, API errors, React errors
  - [ ] Alerts: email/Slack on critical errors
  - [ ] Context: user, request ID, stack trace
  - [ ] Tested: verify errors reported, alerts work

#### 5.4 Monitoring [DevOps] 🔴
- **Assignee:** TBD
- **Estimate:** 3 hours
- **Files:** `server/routes/health.ts`
- **Acceptance:**
  - [ ] Health check endpoint: `/health` (verify exists)
  - [ ] Uptime monitoring: external service configured
  - [ ] Database connection monitoring
  - [ ] Disk space alerts
  - [ ] Tested: verify monitoring active

#### 5.5 Backup Strategy [DevOps] 🔴
- **Assignee:** TBD
- **Estimate:** 4 hours
- **Files:** `scripts/backup.sh`, `scripts/restore.sh`
- **Acceptance:**
  - [ ] Database backups: daily automated
  - [ ] Media backups: S3 versioning or daily snapshots
  - [ ] Backup retention: 30 days
  - [ ] Restore tested
  - [ ] Tested: verify backups automated, restore works

---

## 📈 Progress Tracking

### Sprint 1 Progress
- [ ] 1.1 Rate Limiting
- [ ] 1.2 Audit Logging
- [ ] 1.3 Structured Logging
- [ ] 1.4 Security Headers
- [ ] 1.5 Database Seed Scripts
- [ ] 1.6 Migration Validation

**Progress:** 0/6 (0%)

---

## 🚀 Quick Start

1. **Create workstream branch:**
   ```bash
   git checkout -b feat/core-apis
   ```

2. **Start with Task 1.1:**
   - Create `server/_core/rateLimit.ts`
   - Implement rate limiting middleware
   - Apply to auth, shouts, mixes endpoints
   - Test and commit

3. **Create PR:**
   ```bash
   git push -u origin feat/core-apis
   # Create PR: feat/core-apis → main
   ```

4. **Repeat for each task**

---

**Status:** Ready to execute! Start with Sprint 1, Task 1.1. 🚀
