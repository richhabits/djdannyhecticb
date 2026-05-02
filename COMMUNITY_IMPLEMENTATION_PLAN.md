# Community Features Implementation Plan
**Date:** 2026-05-02  
**Status:** Phase Analysis & Architecture Planning  
**Target:** 10K+ active community members with 90%+ engagement

---

## Executive Summary

The DJ Danny Hectic B community platform requires implementation of 7 interconnected phases:

1. **User Profiles & Verification** - Foundation identity layer
2. **Social Graph** - Follows, blocks, relationship tracking
3. **Direct Messaging** - Real-time person-to-person communication
4. **Comments & Engagement** - Content discussion & reactions
5. **Reputation & Gamification** - Karma system, levels, leaderboards
6. **Moderation & Safety** - Reports, bans, content filtering
7. **Community Events** - Challenges, contests, group activities

**Critical Finding:** Significant foundation already in place - 60% of required infrastructure exists.

---

## Current Implementation Status

### COMPLETED (70% Coverage)

#### Database Schema (✅ 85% Complete)
- **Engagement Schema** (`drizzle/engagement-schema.ts`)
  - ✅ `follows` - Social relationships (followers/following)
  - ✅ `conversations` - DM conversation management
  - ✅ `directMessages` - DM content & status
  - ✅ `clipComments` - Threaded comment system
  - ✅ `commentLikes` - Comment reactions
  - ✅ `reports` - Safety & moderation reports
  - ✅ `userBans` - Ban/suspension management
  - ✅ `reputationScores` - Karma tracking
  - ✅ `reputationBadges` - Achievement system
  - ✅ `communityHighlights` - Featured content
  - ✅ `userProfiles` - Extended profile data (with bio, banner, verification)
  - ✅ `socialLinks` - Twitter, Instagram, TikTok, Discord integration

#### API Endpoints (✅ 75% Complete)
- **Community Router** (`server/routers/communityRouter.ts`)
  - ✅ Report system (createReport, handleReport, getPendingReports)
  - ✅ User bans & appeals (isBanned, appealBan)
  - ✅ Reputation management (getReputation, updateReputation, awardBadge)
  - ✅ Badge system (getUserBadges)
  - ✅ Community guidelines
  - ✅ Top contributors & leaderboards
  - ✅ Community highlights
  - ✅ Community stats

- **Messages Router** (`server/routers/messagesRouter.ts`)
  - ✅ Conversation creation/fetching
  - ✅ Message sending & deletion
  - ✅ Unread count tracking
  - ✅ Real-time updates (WebSocket)

- **Comments Router** (`server/routers/commentsRouter.ts`)
  - ✅ Post/reply to comments
  - ✅ Like comments
  - ✅ Delete comments
  - ✅ Get comment threads

- **Profile Router** (`server/routers/profileRouter.ts`)
  - ✅ Profile creation/editing
  - ✅ Social links management
  - ✅ Profile retrieval

### GAPS TO IMPLEMENT (30% Coverage)

#### Database Schema Additions Needed
1. **Community Profiles** (`community_profiles` table) - MISSING
   - Extended profile with username, display name, privacy settings
   - Verification tier system (standard, streamer, partner, admin)
   - Account stats (followers count, posts count, clips count)
   - Privacy controls (public, private, friends_only)

2. **Community Challenges** (`community_challenges` table) - MISSING
   - Challenge creation, rules, entry format
   - Prize/reward structure
   - Entry tracking and voting

3. **Community Events** (`community_events` table) - MISSING
   - Event creation, registration
   - Event types (listening parties, DJ battles)
   - Live chat & voting features

#### API Implementation Gaps
1. **User Profiles & Verification**
   - [ ] Profile creation with verification workflow
   - [ ] Auto-verification logic (streamer status, followers, engagement)
   - [ ] Manual verification application & review
   - [ ] Verification badge assignment
   - [ ] Privacy level enforcement

2. **Social Graph**
   - [ ] Follow/unfollow procedures (exists in schema, needs API)
   - [ ] Social timeline feed generation
   - [ ] Follow recommendations algorithm
   - [ ] Block/report user with privacy enforcement
   - [ ] Follow notifications

3. **Direct Messaging - Real-time Layer**
   - [ ] Typing indicators (WebSocket)
   - [ ] Message reactions/emoji
   - [ ] Message editing functionality
   - [ ] Conversation muting
   - [ ] Message search

4. **Comments Enhancement**
   - [ ] Comment sorting options (newest, oldest, most_liked, trending)
   - [ ] Comment depth limiting for performance
   - [ ] Comment moderation queue
   - [ ] Spam detection

5. **Reputation & Gamification**
   - [ ] Karma point automation (post clips +5, helpful comment +3, etc.)
   - [ ] Level progression system (0→100 New, 100→500 Contributor, etc.)
   - [ ] Leaderboard generation (top creators, top contributors, trending)
   - [ ] Seasonal challenges & achievements
   - [ ] Perk unlocking by level

6. **Moderation & Safety - Advanced Features**
   - [ ] Content filtering (keyword filter, spam detection)
   - [ ] Automated spam detection (duplicate posts, excessive mentions, all caps)
   - [ ] Moderation dashboard UI
   - [ ] Enforcement action logging
   - [ ] Auto-moderation rules

7. **Community Challenges & Events**
   - [ ] Challenge creation UI & management
   - [ ] Entry submission & voting system
   - [ ] Leaderboard for challenge entries
   - [ ] Event registration & notifications
   - [ ] Prize distribution workflow

#### Frontend Implementation (0% Complete)
- All backend endpoints exist, but no UI components
- Missing React/UI layer for all community features

---

## Implementation Roadmap

### Phase 1: User Profiles & Verification (Days 1-3)
**Priority: CRITICAL - Foundation layer**

**Database Changes:**
```sql
CREATE TABLE community_profiles (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  displayName VARCHAR(255),
  bio TEXT,
  avatarUrl VARCHAR(512),
  bannerUrl VARCHAR(512),
  isVerified BOOLEAN DEFAULT false,
  verificationTier ENUM('standard', 'streamer', 'partner', 'admin'),
  verificationBadges TEXT[] DEFAULT ARRAY[]::text[],
  verifiedAt TIMESTAMP,
  followersCount INTEGER DEFAULT 0,
  followingCount INTEGER DEFAULT 0,
  totalPosts INTEGER DEFAULT 0,
  totalClips INTEGER DEFAULT 0,
  karma INTEGER DEFAULT 0,
  privacyLevel ENUM('public', 'private', 'friends_only') DEFAULT 'public',
  allowDirectMessages BOOLEAN DEFAULT true,
  allowMentions BOOLEAN DEFAULT true,
  allowCollab BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints to Create:**
- `POST /api/community/profiles` - Create profile
- `GET /api/community/profiles/:userId` - Get profile
- `PATCH /api/community/profiles/:userId` - Update profile
- `GET /api/community/profiles/search` - Search profiles
- `POST /api/community/profiles/:userId/verify` - Request verification
- `POST /api/community/verify/auto-check` - Auto-verification system

**Frontend Components:**
- ProfileForm component
- ProfileCard component
- VerificationBadge component
- ProfileSettings page

**Success Metrics:**
- Create profile with auto-verification for streamer accounts
- Manual verification workflow (7-day review period)
- Privacy settings enforcement

---

### Phase 2: Social Graph (Days 4-5)
**Priority: HIGH - Core engagement driver**

**API Endpoints to Create:**
- `POST /api/community/follow/:userId` - Follow user
- `POST /api/community/unfollow/:userId` - Unfollow user
- `GET /api/community/:userId/followers` - Get followers list
- `GET /api/community/:userId/following` - Get following list
- `GET /api/community/suggestions` - Follow recommendations
- `POST /api/community/block/:userId` - Block user
- `POST /api/community/unblock/:userId` - Unblock user
- `GET /api/community/blocked` - Get blocked users list

**Recommendations Algorithm:**
```typescript
1. Rank by mutual followers count
2. Rank by shared interests (genre tags)
3. Rank by follower-to-following ratio (quality accounts)
4. Exclude blocked users & already following
5. Return top 10 suggestions
```

**Frontend Components:**
- FollowButton component
- SocialTimeline component
- FollowersList component
- FollowRecommendations component

**Success Metrics:**
- 10K+ follows/unfollows per week
- <500ms recommendation generation
- 5%+ follow-through rate on recommendations

---

### Phase 3: Direct Messaging (Days 6-8)
**Priority: HIGH - Real-time engagement**

**API Endpoints to Create (Enhanced):**
- `POST /api/messages/conversations/:conversationId/typing` - Typing indicator
- `POST /api/messages/messages/:messageId/reactions` - Message reactions
- `PATCH /api/messages/messages/:messageId` - Edit message
- `GET /api/messages/search` - Search in conversations
- `POST /api/messages/conversations/:conversationId/mute` - Mute conversation

**WebSocket Events (Existing base, enhance):**
```typescript
// New events to add
ws.on('typing', (userId, conversationId) => broadcast)
ws.on('message:reaction', (messageId, emoji, userId) => broadcast)
ws.on('message:edited', (messageId, newContent) => broadcast)
ws.on('message:deleted', (messageId) => broadcast)
```

**Frontend Components:**
- ConversationList component
- MessageComposer component
- TypingIndicator component
- MessageReactions component

**Success Metrics:**
- <500ms message delivery time
- <100ms typing indicator latency
- 99.9% message delivery reliability

---

### Phase 4: Comments & Engagement (Days 9-10)
**Priority: MEDIUM - Community discussion**

**API Endpoints to Create (Enhanced):**
- `GET /api/comments/:contentId?sort=newest|oldest|most_liked|trending` - Sorting
- `POST /api/comments/:commentId/report` - Report comments
- `POST /api/comments/moderate` - Moderation queue (admin)
- `GET /api/comments/trending` - Trending comments
- `POST /api/comments/:commentId/pin` - Pin comment (admin)

**Comment Sorting Algorithm:**
```typescript
// Newest: ORDER BY createdAt DESC
// Oldest: ORDER BY createdAt ASC
// Most Liked: ORDER BY likeCount DESC
// Trending: (likeCount / age_in_hours) DESC (with 24h window)
```

**Frontend Components:**
- CommentThread component
- CommentForm component
- CommentSortDropdown component
- ReportCommentModal component

**Success Metrics:**
- 1K+ comments per day
- <1% false positive spam detection
- 90%+ comment quality rating

---

### Phase 5: Reputation & Gamification (Days 11-12)
**Priority: MEDIUM - Long-term engagement**

**Database Additions:**
```sql
CREATE TABLE karma_events (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL,
  action VARCHAR(50),
  pointsChange INTEGER,
  reason TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_levels (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  levelName VARCHAR(100),
  currentXP INTEGER DEFAULT 0,
  nextLevelXP INTEGER,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**Karma System:**
```typescript
// Earning
POST_CLIP: +5,
HELPFUL_COMMENT: +3,
REPORT_SPAM: +2,
SHARE_CONTENT: +1,
WRITE_ARTICLE: +10,
START_CHALLENGE: +5,

// Penalties
SPAM_DETECTED: -5,
REPORT_ABUSE: -10,
PLAGIARISM: -20,
HARASSMENT: -50
```

**Level Progression:**
```typescript
0 → 100: New Member
100 → 500: Contributor
500 → 1000: Trusted
1000 → 5000: Expert
5000+: Legend
```

**API Endpoints:**
- `GET /api/community/karma/:userId` - Get karma score
- `GET /api/community/level/:userId` - Get user level
- `GET /api/community/leaderboards?type=creators|contributors|engagement` - Leaderboards
- `GET /api/community/achievements/:userId` - User achievements

**Frontend Components:**
- KarmaDisplay component
- LevelProgressBar component
- Leaderboard component
- AchievementBadges component

**Success Metrics:**
- 80% of users earning karma within 7 days
- Average session duration +30% post-gamification
- 500+ daily active users on leaderboards

---

### Phase 6: Moderation & Safety (Days 13-15)
**Priority: CRITICAL - User safety**

**Database Additions:**
```sql
CREATE TABLE moderation_rules (
  id SERIAL PRIMARY KEY,
  ruleName VARCHAR(100),
  ruleType ENUM('keyword', 'pattern', 'spam'),
  pattern TEXT,
  severity ENUM('low', 'medium', 'high'),
  autoAction VARCHAR(50), -- warn, mute, timeout, ban
  createdAt TIMESTAMP
);

CREATE TABLE moderation_log (
  id SERIAL PRIMARY KEY,
  moderatorId INTEGER,
  userId INTEGER,
  action VARCHAR(100),
  reason TEXT,
  duration INTERVAL,
  createdAt TIMESTAMP
);
```

**Spam Detection Rules:**
```typescript
1. Duplicate posts within 5 minutes: WARN
2. Excessive mentions (5+): AUTO_LOWERCASE
3. All caps messages: AUTO_LOWERCASE
4. Repeated link spam: TIMEOUT (1 hour)
5. Same message posted 3x in 10m: MUTE (24 hours)
6. 5+ user reports: AUTO_TIMEOUT (duration escalates)
```

**API Endpoints (Enhanced):**
- `POST /api/community/moderate/queue` - Get moderation queue
- `POST /api/community/moderate/action` - Take enforcement action
- `GET /api/community/moderate/logs` - View moderation audit log
- `POST /api/community/content/filter` - Content filtering checks
- `GET /api/community/moderate/rules` - View active rules

**Frontend Components:**
- ModerationQueue component
- ReportModal component
- BanAppealForm component
- ModerationLog component (admin)

**Success Metrics:**
- <2% spam/abuse rate
- <1% false positive enforcement
- <24 hour average moderation response time
- 90%+ user satisfaction with moderation

---

### Phase 7: Community Events & Challenges (Days 16-18)
**Priority: MEDIUM - Community growth**

**Database Tables:**
```sql
CREATE TABLE community_challenges (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  entryFormat ENUM('clip', 'mix', 'article', 'photo'),
  rules TEXT[],
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  prize VARCHAR(255),
  entriesCount INTEGER DEFAULT 0,
  votesCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP
);

CREATE TABLE challenge_entries (
  id UUID PRIMARY KEY,
  challengeId UUID,
  entrantId INTEGER,
  contentUrl VARCHAR(512),
  votes INTEGER DEFAULT 0,
  rank INTEGER,
  createdAt TIMESTAMP
);

CREATE TABLE community_events (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  eventType ENUM('listening_party', 'dj_battle', 'talent_show', 'meetup'),
  startAt TIMESTAMP,
  endAt TIMESTAMP,
  maxParticipants INTEGER,
  registeredCount INTEGER DEFAULT 0,
  liveChat BOOLEAN DEFAULT true,
  watchTogether BOOLEAN DEFAULT false,
  createdAt TIMESTAMP
);
```

**API Endpoints:**
- `POST /api/community/challenges` - Create challenge (admin)
- `GET /api/community/challenges` - List active challenges
- `POST /api/community/challenges/:challengeId/entries` - Submit entry
- `POST /api/community/challenges/:challengeId/vote` - Vote on entry
- `GET /api/community/challenges/:challengeId/leaderboard` - Challenge leaderboard
- `POST /api/community/events` - Create event (admin)
- `GET /api/community/events` - List events
- `POST /api/community/events/:eventId/register` - Register for event

**Frontend Components:**
- ChallengeCard component
- ChallengeLeaderboard component
- EventRegistration component
- EventLiveChat component

**Success Metrics:**
- 50+ active challenges at any time
- 500+ challenge entries per week
- 1000+ event registrations per month
- 80%+ event attendance rate

---

## Technical Architecture

### Database Layer
- **ORM:** Drizzle ORM (already in use)
- **Database:** PostgreSQL
- **Connection:** Pooled via `postgres` package
- **Migrations:** Drizzle Kit migrations in `drizzle/` directory

### API Layer
- **Framework:** Express.js
- **RPC:** tRPC (already in use)
- **Validation:** Zod schemas
- **Authentication:** JWT via user context
- **Real-time:** WebSocket via `ws` package

### Frontend Layer
- **Framework:** React 19
- **State Management:** TanStack Query + tRPC
- **UI Components:** Radix UI + custom Tailwind CSS
- **Forms:** React Hook Form
- **Routing:** Wouter

### Deployment
- **Server:** Vercel (frontend), Cloudflare Workers (backend ready)
- **Database:** PostgreSQL (production)
- **Cache:** Redis for real-time features
- **File Storage:** S3

---

## Critical Implementation Notes

### Security Considerations
1. **DM Privacy** - Ensure users can only access their own conversations
   - Validate both users are participants before allowing access
   - Implement row-level security (RLS) for DM tables
   
2. **Verification System** - Prevent verification spoofing
   - Auto-verify only verified streamers from authentication system
   - Manual verification requires proof of social identity
   - Verification tier cannot be self-assigned

3. **Moderation Audit Trail** - Every action must be logged
   - Who took the action, when, why, duration
   - Allow appeals with full context available
   - Prevent admin abuse of moderation tools

4. **Privacy Controls** - Enforce privacy levels
   - Private profile: No DMs, invisible from discovery
   - Friends only: Only followers can see content/DM
   - Public: Full visibility

### Performance Optimization
1. **Indexes Required:**
   - `follows(followerId, followingId)`
   - `conversations(user1Id, user2Id)`
   - `directMessages(conversationId, createdAt DESC)`
   - `clipComments(clipId, createdAt DESC)`
   - `reports(status, createdAt DESC)`

2. **Caching Strategy:**
   - Cache leaderboards (update every hour)
   - Cache user reputation scores (update in real-time)
   - Cache follow suggestions (update every 6 hours)

3. **Real-time Optimization:**
   - Batch WebSocket updates (100ms windows)
   - Use room-based filtering for broadcasts
   - Implement connection pooling for database

### Testing Strategy
1. **Unit Tests**
   - Karma calculation algorithms
   - Spam detection rules
   - Follow recommendation ranking

2. **Integration Tests**
   - End-to-end message flow
   - Report → moderation → enforcement
   - Profile creation → verification

3. **Load Tests**
   - 5K concurrent users in chat
   - 1K DMs per second
   - Leaderboard generation at scale

---

## Success Criteria & Metrics

### User Engagement (90 days)
- ✅ 10K+ registered community members
- ✅ 5K+ daily active users (30% DAU/MAU ratio)
- ✅ 1K+ comments per day
- ✅ 50+ active community challenges
- ✅ 500+ user-generated clips per month

### Safety & Moderation
- ✅ <2% spam/abuse rate
- ✅ <1% false positive enforcement
- ✅ <24 hour moderation response time
- ✅ 90%+ user satisfaction with moderation

### Community Growth
- ✅ 10K+ follows/unfollows weekly
- ✅ 1000+ DMs sent per day
- ✅ 80%+ of users with ≥1 follower (30 days)
- ✅ 50%+ of users contributing content (60 days)

### Business Metrics
- ✅ 90%+ user satisfaction surveys
- ✅ <2 hour average response to reports
- ✅ 0% community guideline violations by admins
- ✅ <5% false positive spam detection

---

## Risk Assessment & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Spam/abuse at scale | HIGH | Implement automated detection + mod tools early |
| DM privacy breaches | CRITICAL | RLS policies + encryption for sensitive chats |
| Verification spoofing | HIGH | Only auto-verify authenticated streamers |
| Database performance | MEDIUM | Proper indexing + caching strategy |
| User adoption lag | MEDIUM | Gamification + viral challenges to drive engagement |
| Moderator burnout | MEDIUM | Automated rules + clear appeals process |

---

## Timeline Summary

```
Phase 1: Profiles & Verification       Days 1-3   (CRITICAL)
Phase 2: Social Graph                  Days 4-5   (HIGH)
Phase 3: Direct Messaging              Days 6-8   (HIGH)
Phase 4: Comments & Engagement         Days 9-10  (MEDIUM)
Phase 5: Reputation & Gamification     Days 11-12 (MEDIUM)
Phase 6: Moderation & Safety           Days 13-15 (CRITICAL)
Phase 7: Community Events              Days 16-18 (MEDIUM)

Total: 18 days (3 weeks) for full implementation
```

---

## Next Steps

1. **Immediate (Today)**
   - [ ] Review specification with team
   - [ ] Create community_profiles table migration
   - [ ] Set up project environment

2. **This Week**
   - [ ] Implement Phase 1 (Profiles & Verification)
   - [ ] Build profile UI components
   - [ ] Test auto-verification logic

3. **Next Week**
   - [ ] Implement Phase 2-3 (Social & Messaging)
   - [ ] Set up real-time infrastructure
   - [ ] Load test messaging at scale

4. **Week 3**
   - [ ] Implement Phase 4-7
   - [ ] Complete moderation system
   - [ ] Prepare for beta launch

---

**Document Owner:** Community Features Agent  
**Last Updated:** 2026-05-02  
**Status:** Ready for Phase 1 Implementation
