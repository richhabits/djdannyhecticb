# Complete Implementation Plan - DJ Danny Hectic B
**Date:** January 25, 2026  
**Status:** Ready for Execution  
**Goal:** Production-ready full-stack app (frontend + backend + admin)

---

## 📊 Gap Analysis

### What Exists ✅
- **Frontend:** 60+ pages, brutalist design, responsive layout
- **Backend:** tRPC router with mixes, events, shouts, streams APIs
- **Database:** Drizzle schema with users, mixes, events, bookings, podcasts, shouts, streams
- **Admin:** 20+ admin pages (mixes, events, shouts, streams, AI studio, etc.)
- **Auth:** JWT sessions, OAuth, role-based access (admin/user)
- **AI:** Multiple providers (Groq, Gemini, HuggingFace, Cohere, Ollama)
- **SEO:** Meta tags, structured data, sitemap, robots.txt
- **Deployment:** Docker Compose, Nginx, SSL scripts

### What's Missing ❌

#### Frontend Gaps
- [ ] Skeleton loaders and empty states
- [ ] Error boundaries with user-friendly messages
- [ ] Real-time data updates (shoutbox, now playing)
- [ ] Mobile-first optimizations (touch targets, gestures)
- [ ] SEO per route (dynamic meta tags)
- [ ] Social sharing buttons
- [ ] Loading states for async operations

#### Backend Gaps
- [ ] Rate limiting (shoutbox, auth endpoints)
- [ ] Audit logging (who changed what, when)
- [ ] Structured logging with request IDs
- [ ] Error reporting (Sentry or similar)
- [ ] CORS configuration
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Database seed scripts
- [ ] Migration validation

#### Admin Gaps
- [ ] Unified dashboard (live status, pending moderation)
- [ ] Media library management
- [ ] Site settings (hero text, socials, contact)
- [ ] User management (roles, bans, audit log)
- [ ] Audit log viewer
- [ ] Bulk operations (approve multiple shouts, etc.)

#### AI Gaps
- [ ] EPK generator (admin-only)
- [ ] SEO assistant (meta title/description generator)
- [ ] Content repurposer (mix → social posts)
- [ ] Shoutbox moderation (toxicity/spam scoring)
- [ ] Fan concierge (FAQ assistant with allowlist)

---

## 🎯 Prioritized Sprint Board

### Sprint 1: Core APIs & Backend Hardening (Week 1)
**Goal:** Stable, secure, observable backend

#### Tasks

**1.1 Rate Limiting** [Backend]
- [ ] Implement rate limiting middleware (express-rate-limit)
- [ ] Apply to: `/api/auth/*`, `/api/shouts/*`, `/api/mixes/download`
- [ ] Config: 10 req/min for shouts, 5 req/min for auth
- [ ] Return 429 with retry-after header
- **Acceptance:** Rate limit triggers after threshold, returns proper status

**1.2 Audit Logging** [Backend]
- [ ] Create `audit_logs` table (userId, action, resource, resourceId, changes, timestamp)
- [ ] Middleware to log all admin mutations
- [ ] Log: mix create/update/delete, event create/update/delete, shout approve/reject
- [ ] Admin endpoint: `audit.list` with filters (user, action, date range)
- **Acceptance:** All admin actions logged, queryable via API

**1.3 Structured Logging** [Backend]
- [ ] Add request ID middleware (uuid per request)
- [ ] Use structured logger (winston or pino)
- [ ] Log format: `{requestId, timestamp, level, message, userId, path, method}`
- [ ] Error logging with stack traces
- **Acceptance:** All logs include requestId, errors traceable end-to-end

**1.4 Security Headers** [Backend]
- [ ] Add helmet.js middleware
- [ ] Configure: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- [ ] CORS: whitelist production domains only
- [ ] Test with security headers checker
- **Acceptance:** Security headers present, CORS locked to production

**1.5 Database Seed Scripts** [Backend]
- [ ] Create `scripts/seed.ts` with sample data
- [ ] Seed: 5 mixes, 3 events, 10 shouts, 1 admin user
- [ ] Command: `pnpm db:seed`
- [ ] Idempotent (can run multiple times)
- **Acceptance:** Seed script runs, creates test data, no duplicates

**1.6 Migration Validation** [Backend]
- [ ] Add migration checks (no breaking changes in production)
- [ ] Validate schema matches code expectations
- [ ] Add rollback scripts for critical migrations
- **Acceptance:** Migrations validated before deploy, rollback tested

---

### Sprint 2: Admin Foundation (Week 1-2)
**Goal:** Operational control panel

#### Tasks

**2.1 Admin Dashboard** [Frontend + Backend]
- [ ] Create `/admin/dashboard` page
- [ ] Widgets: stream status (up/down), now playing, shoutbox volume, pending moderation count
- [ ] Real-time updates (polling or WebSocket)
- [ ] Quick actions: approve shouts, set active stream
- **Acceptance:** Dashboard shows live status, actionable

**2.2 Media Library** [Frontend + Backend]
- [ ] Create `/admin/media` page (already exists, enhance)
- [ ] Upload: images, press photos, cover art
- [ ] Storage: S3 or local filesystem
- [ ] CRUD: list, upload, delete, replace
- [ ] Search/filter by type, date
- **Acceptance:** Upload works, files stored, list/search functional

**2.3 Site Settings** [Frontend + Backend]
- [ ] Create `/admin/settings` page
- [ ] Fields: hero text, social links, contact email, SEO defaults
- [ ] Backend: `settings.get`, `settings.update` (admin only)
- [ ] Store in database `site_settings` table
- [ ] Frontend: form with validation
- **Acceptance:** Settings save, reflect on homepage

**2.4 User Management** [Frontend + Backend]
- [ ] Enhance `/admin/users` (or create if missing)
- [ ] List all users with roles
- [ ] Actions: change role, ban/unban, view audit log
- [ ] Backend: `users.list`, `users.updateRole`, `users.ban`
- [ ] Audit log integration
- **Acceptance:** Users manageable, roles changeable, bans work

**2.5 Audit Log Viewer** [Frontend + Backend]
- [ ] Create `/admin/audit` page
- [ ] Table: timestamp, user, action, resource, changes (diff view)
- [ ] Filters: user, action type, date range, resource type
- [ ] Export to CSV
- **Acceptance:** Audit log queryable, filters work, export functional

**2.6 Bulk Operations** [Frontend + Backend]
- [ ] Shoutbox: select multiple, bulk approve/reject
- [ ] Mixes: bulk publish/unpublish, bulk delete
- [ ] Events: bulk publish/unpublish
- **Acceptance:** Bulk actions work, audit logged

---

### Sprint 3: Frontend Completeness (Week 2)
**Goal:** Every page works, no dead states

#### Tasks

**3.1 Skeleton Loaders** [Frontend]
- [ ] Create `SkeletonLoader` component
- [ ] Apply to: mixes list, events list, shoutbox feed
- [ ] Match content layout (cards, text blocks)
- **Acceptance:** Loading states show skeletons, not blank screens

**3.2 Empty States** [Frontend]
- [ ] Create `EmptyState` component
- [ ] Apply to: no mixes, no events, no shouts
- [ ] Include: icon, message, CTA (if applicable)
- **Acceptance:** Empty states informative, actionable

**3.3 Error Boundaries** [Frontend]
- [ ] Create `ErrorBoundary` component (already exists, enhance)
- [ ] Catch React errors, show user-friendly message
- [ ] Log errors to backend
- [ ] Recovery: retry button, report issue link
- **Acceptance:** Errors caught, user sees friendly message

**3.4 Real-time Updates** [Frontend + Backend]
- [ ] Shoutbox: polling or WebSocket for new shouts
- [ ] Now playing: update stream metadata in real-time
- [ ] Live status: stream up/down indicator
- **Acceptance:** Real-time updates work, no page refresh needed

**3.5 SEO Per Route** [Frontend]
- [ ] Dynamic meta tags for: mixes, events, podcasts
- [ ] OG tags with images
- [ ] Twitter cards
- [ ] Canonical URLs
- **Acceptance:** Each route has unique, accurate meta tags

**3.6 Social Sharing** [Frontend]
- [ ] Add share buttons: Facebook, Twitter, WhatsApp, copy link
- [ ] Shareable content: mixes, events, homepage
- [ ] Pre-filled text: "Check out [Mix/Event] by DJ Danny Hectic B"
- **Acceptance:** Share buttons work, pre-fill correct content

**3.7 Mobile Optimizations** [Frontend]
- [ ] Touch targets: min 44x44px
- [ ] Swipe gestures: swipe to refresh shoutbox
- [ ] Bottom navigation: sticky nav on mobile
- [ ] Viewport meta: proper scaling
- **Acceptance:** Mobile UX smooth, gestures work

---

### Sprint 4: AI Features (Week 2-3)
**Goal:** High-leverage AI tools (no gimmicks)

#### Tasks

**4.1 EPK Generator** [Frontend + Backend]
- [ ] Admin-only: `/admin/ai/epk`
- [ ] Input: mix/event title, description, date
- [ ] Output: press blurb, social posts, email copy
- [ ] Use system prompt: "You are DJ Danny Hectic B's press agent..."
- [ ] Templates: short bio, long bio, press release
- **Acceptance:** EPK generated, matches voice, downloadable

**4.2 SEO Assistant** [Frontend + Backend]
- [ ] Admin-only: `/admin/ai/seo`
- [ ] Input: page content, target keywords
- [ ] Output: meta title (60 chars), description (160 chars), OG copy
- [ ] Validate length, suggest improvements
- **Acceptance:** SEO copy generated, length-validated, usable

**4.3 Content Repurposer** [Frontend + Backend]
- [ ] Admin-only: `/admin/ai/repurpose`
- [ ] Input: mix/event
- [ ] Output: 10 promo posts (IG caption, TikTok caption, story text, email blurb, etc.)
- [ ] Templates per platform
- **Acceptance:** Multiple formats generated, platform-appropriate

**4.4 Shoutbox Moderation** [Frontend + Backend]
- [ ] Backend: toxicity/spam scoring (use AI provider)
- [ ] Auto-hold queue for flagged shouts
- [ ] Admin: review queue, approve/reject
- [ ] Config: threshold for auto-hold
- **Acceptance:** Toxic shouts auto-flagged, admin reviews

**4.5 Fan Concierge** [Frontend + Backend]
- [ ] Public: FAQ assistant (chat interface)
- [ ] Knowledge source: allowlist only (bio, FAQ, mixes list, events list)
- [ ] No hallucinations: "I don't know" for out-of-scope questions
- [ ] Rate limiting: 5 questions per hour
- **Acceptance:** FAQ answered correctly, out-of-scope handled gracefully

---

### Sprint 5: Deployment & Hardening (Week 3)
**Goal:** Production-ready, single deployment path

#### Tasks

**5.1 Deployment Golden Path** [DevOps]
- [ ] Document single deployment method in `README_DEPLOY.md`
- [ ] Remove ambiguity: Docker Compose + Nginx + SSL
- [ ] Remove unused deployment scripts or archive
- [ ] Add deployment checklist
- **Acceptance:** One clear deployment path documented

**5.2 Release Process** [DevOps]
- [ ] Tag strategy: `v1.0.0`, `v1.1.0-admin`, etc.
- [ ] Changelog: `CHANGELOG.md` with versions
- [ ] CI checks: tests, lint, type-check before merge
- [ ] Production branch policy: PR required, checks required
- **Acceptance:** Tags created, changelog maintained, CI enforces quality

**5.3 Error Reporting** [Backend]
- [ ] Integrate Sentry (or similar)
- [ ] Capture: unhandled errors, API errors, React errors
- [ ] Alerts: email/Slack on critical errors
- [ ] Context: user, request ID, stack trace
- **Acceptance:** Errors reported, alerts work, context included

**5.4 Monitoring** [DevOps]
- [ ] Health check endpoint: `/health` (already exists, verify)
- [ ] Uptime monitoring: external service (UptimeRobot, etc.)
- [ ] Database connection monitoring
- [ ] Disk space alerts
- **Acceptance:** Monitoring active, alerts configured

**5.5 Backup Strategy** [DevOps]
- [ ] Database backups: daily automated
- [ ] Media backups: S3 versioning or daily snapshots
- [ ] Backup retention: 30 days
- [ ] Restore tested
- **Acceptance:** Backups automated, restore tested

---

## 📋 Workstream Breakdown

### Workstream 1: `feat/core-apis` (Sprint 1)
**Branch:** `feat/core-apis`  
**PRs:** 6 small PRs (one per task)  
**Order:**
1. Rate limiting
2. Audit logging
3. Structured logging
4. Security headers
5. Database seed scripts
6. Migration validation

### Workstream 2: `feat/admin-foundation` (Sprint 2)
**Branch:** `feat/admin-foundation`  
**PRs:** 6 small PRs (one per task)  
**Order:**
1. Admin dashboard
2. Media library
3. Site settings
4. User management
5. Audit log viewer
6. Bulk operations

### Workstream 3: `feat/frontend-complete` (Sprint 3)
**Branch:** `feat/frontend-complete`  
**PRs:** 7 small PRs (one per task)  
**Order:**
1. Skeleton loaders
2. Empty states
3. Error boundaries
4. Real-time updates
5. SEO per route
6. Social sharing
7. Mobile optimizations

### Workstream 4: `feat/ai-tools` (Sprint 4)
**Branch:** `feat/ai-tools`  
**PRs:** 5 small PRs (one per task)  
**Order:**
1. EPK generator
2. SEO assistant
3. Content repurposer
4. Shoutbox moderation
5. Fan concierge

### Workstream 5: `feat/deploy-hardening` (Sprint 5)
**Branch:** `feat/deploy-hardening`  
**PRs:** 5 small PRs (one per task)  
**Order:**
1. Deployment golden path
2. Release process
3. Error reporting
4. Monitoring
5. Backup strategy

---

## 🔌 API Contract Documentation

### Existing APIs (Verified)

#### Mixes
```
GET  /api/mixes/list          → List all mixes
GET  /api/mixes/free          → List free mixes
GET  /api/mixes/downloadUrl   → Get presigned download URL
POST /api/mixes/create        → Create mix (admin)
PUT  /api/mixes/update        → Update mix (admin)
DELETE /api/mixes/delete      → Delete mix (admin)
```

#### Events
```
GET  /api/events/upcoming     → List upcoming events
GET  /api/events/featured     → List featured events
GET  /api/events/all          → List all events
POST /api/events/create       → Create event (admin)
PUT  /api/events/update       → Update event (admin)
DELETE /api/events/delete      → Delete event (admin)
```

#### Shouts
```
GET  /api/shouts/list         → List approved shouts (public)
GET  /api/shouts/adminList    → List all shouts (admin)
POST /api/shouts/create       → Create shout (public, rate limited)
PUT  /api/shouts/update       → Update shout status (admin)
```

#### Streams
```
GET  /api/streams/active      → Get active stream
GET  /api/streams/list        → List all streams (admin)
POST /api/streams/create      → Create stream (admin)
PUT  /api/streams/setActive   → Set active stream (admin)
```

### New APIs Needed

#### Settings
```
GET  /api/settings/get        → Get site settings (public)
PUT  /api/settings/update     → Update settings (admin)
```

#### Audit Log
```
GET  /api/audit/list          → List audit logs (admin)
     Query params: userId, action, resourceType, startDate, endDate
```

#### Media
```
GET  /api/media/list          → List media files (admin)
POST /api/media/upload        → Upload media (admin)
DELETE /api/media/delete      → Delete media (admin)
```

#### Users
```
GET  /api/users/list          → List users (admin)
PUT  /api/users/updateRole     → Update user role (admin)
PUT  /api/users/ban           → Ban/unban user (admin)
```

#### AI Tools
```
POST /api/ai/epk              → Generate EPK (admin)
POST /api/ai/seo              → Generate SEO copy (admin)
POST /api/ai/repurpose        → Repurpose content (admin)
POST /api/ai/moderate         → Score shout toxicity (internal)
POST /api/ai/concierge        → Fan FAQ assistant (public, rate limited)
```

---

## 🎨 Admin UI Information Architecture

### Dashboard (`/admin/dashboard`)
- **Widgets:**
  - Stream status (up/down, now playing)
  - Shoutbox volume (total, pending moderation)
  - Latest shouts (last 5)
  - Quick actions (approve shouts, set stream)
- **Layout:** Grid of cards, responsive

### Mixes (`/admin/mixes`)
- **Actions:** Create, Edit, Delete, Publish/Unpublish, Bulk operations
- **Filters:** Genre, Published status, Date range
- **Table:** Title, Genre, Published, Created, Actions

### Events (`/admin/events`)
- **Actions:** Create, Edit, Delete, Publish/Unpublish, Bulk operations
- **Filters:** Featured, Date range
- **Table:** Title, Date, Location, Featured, Actions

### Shoutbox (`/admin/shouts`)
- **Actions:** Approve, Reject, Delete, Bulk approve/reject
- **Filters:** Approved, Pending, Rejected, Date range
- **Table:** Name, Message, Approved, Created, Actions
- **Moderation Queue:** Auto-flagged shouts highlighted

### Media (`/admin/media`)
- **Actions:** Upload, Delete, Replace
- **Filters:** Type (image, video, audio), Date range
- **Grid:** Thumbnails with metadata
- **Upload:** Drag-and-drop, progress indicator

### Settings (`/admin/settings`)
- **Sections:**
  - Site: Hero text, tagline, contact email
  - Social: Facebook, Instagram, Twitter, TikTok URLs
  - SEO: Default title, description, keywords
- **Form:** Save button, validation

### Users (`/admin/users`)
- **Table:** Name, Email, Role, Status (active/banned), Last login
- **Actions:** Change role, Ban/Unban, View audit log
- **Filters:** Role, Status

### Audit Log (`/admin/audit`)
- **Table:** Timestamp, User, Action, Resource, Changes (diff view)
- **Filters:** User, Action type, Resource type, Date range
- **Export:** CSV download

---

## 🗄️ Database Schema Review

### Existing Tables (Verified)
- `users` - User accounts, roles
- `admin_credentials` - Password auth for admins
- `mixes` - DJ mixes
- `bookings` - DJ service bookings
- `events` - DJ events/performances
- `podcasts` - Podcast episodes
- `streamingLinks` - Music platform links
- `shouts` - Fan shoutbox messages
- `streams` - Radio stream configurations

### New Tables Needed

#### `audit_logs`
```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'approve', etc.
  resourceType VARCHAR(100) NOT NULL, -- 'mix', 'event', 'shout', etc.
  resourceId INT,
  changes JSON, -- Before/after diff
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### `site_settings`
```sql
CREATE TABLE site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

#### `media_files`
```sql
CREATE TABLE media_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio'
  size INT, -- bytes
  uploadedBy INT NOT NULL, -- userId
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ Acceptance Criteria Template

For each task, define:
1. **Functional:** What it does
2. **Technical:** How it's implemented
3. **UX:** User experience
4. **Security:** Access control, validation
5. **Performance:** Response times, limits
6. **Testing:** How to verify

**Example (Rate Limiting):**
- ✅ Functional: Rate limit triggers after 10 requests/minute
- ✅ Technical: Uses express-rate-limit, returns 429 status
- ✅ UX: Error message: "Too many requests. Please try again in X seconds."
- ✅ Security: Applied to public endpoints only
- ✅ Performance: No impact on response time (< 5ms overhead)
- ✅ Testing: Load test with 15 requests, verify 429 on 11th

---

## 🚀 Execution Order

1. **Close analysis PRs** (today)
2. **Sprint 1: Core APIs** (Week 1)
3. **Sprint 2: Admin Foundation** (Week 1-2)
4. **Sprint 3: Frontend Completeness** (Week 2)
5. **Sprint 4: AI Tools** (Week 2-3)
6. **Sprint 5: Deployment Hardening** (Week 3)

**Total Timeline:** 3 weeks to production-ready

---

## 📝 Next Steps

1. Review this plan
2. Create workstream branches
3. Start with Sprint 1, Task 1.1 (Rate Limiting)
4. Ship small PRs, merge frequently
5. Test each feature before moving to next

**Ready to execute!** 🚀
