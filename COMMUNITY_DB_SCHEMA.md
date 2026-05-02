# Community Features Database Schema
**Status:** Ready for Migration Implementation  
**Target Database:** PostgreSQL with Drizzle ORM

---

## Table Definitions

### 1. community_profiles - User Profile Information
```typescript
table community_profiles {
  // Identity
  id: serial PRIMARY KEY
  userId: integer NOT NULL UNIQUE (foreign key to users.id)
  username: varchar(50) NOT NULL UNIQUE
  displayName: varchar(255)
  
  // Profile Content
  bio: text (max 500 chars)
  avatarUrl: varchar(512)
  bannerUrl: varchar(512)
  pronouns: varchar(50) -- optional
  location: varchar(255) -- optional
  
  // Verification System
  isVerified: boolean DEFAULT false
  verificationTier: enum('standard', 'streamer', 'partner', 'admin') DEFAULT 'standard'
  verificationBadges: text[] DEFAULT ARRAY[]::text[]
  verifiedAt: timestamp nullable
  verificationMethod: enum('auto', 'manual') -- how was user verified
  
  // Statistics
  followersCount: integer DEFAULT 0
  followingCount: integer DEFAULT 0
  totalPosts: integer DEFAULT 0
  totalClips: integer DEFAULT 0
  totalComments: integer DEFAULT 0
  
  // Reputation
  karma: integer DEFAULT 0
  level: integer DEFAULT 1
  trustLevel: varchar(50) DEFAULT 'new'
  
  // Engagement Counts
  helpfulComments: integer DEFAULT 0
  reportedCount: integer DEFAULT 0
  blockedCount: integer DEFAULT 0
  
  // Privacy & Controls
  privacyLevel: enum('public', 'private', 'friends_only') DEFAULT 'public'
  allowDirectMessages: boolean DEFAULT true
  allowMentions: boolean DEFAULT true
  allowCollaborations: boolean DEFAULT true
  allowProfileTagging: boolean DEFAULT true
  
  // Social Links (also in socialLinks table, denormalized for performance)
  twitterHandle: varchar(100) nullable
  tiktokHandle: varchar(100) nullable
  instagramHandle: varchar(100) nullable
  discordUsername: varchar(100) nullable
  youtubeHandle: varchar(100) nullable
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  lastActivityAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (userId) -- Quick lookup by user
  INDEX (username) -- Profile discovery
  INDEX (isVerified) -- Filter verified users
  INDEX (privacyLevel) -- Privacy enforcement
  INDEX (createdAt DESC) -- Timeline queries
  INDEX (karma DESC) -- Leaderboards
  INDEX (followersCount DESC) -- Top creators
}
```

---

### 2. community_challenges - User-Generated Challenges
```typescript
table community_challenges {
  // Identity
  id: uuid PRIMARY KEY
  creatorId: integer NOT NULL (foreign key to users.id)
  
  // Content
  title: varchar(255) NOT NULL
  description: text NOT NULL
  category: varchar(100) NOT NULL -- house, techno, dubstep, remix, etc
  rules: text[] NOT NULL -- Array of rule strings
  bannerUrl: varchar(512) nullable
  
  // Format & Entry
  entryFormat: enum('clip', 'mix', 'article', 'photo', 'text') NOT NULL
  minDurationSeconds: integer nullable -- For clips
  maxDurationSeconds: integer nullable
  maxFileSize: integer nullable -- In MB
  
  // Timeline
  startDate: timestamp NOT NULL
  endDate: timestamp NOT NULL
  registrationDeadline: timestamp nullable
  
  // Prizes & Rewards
  prizePool: numeric(12, 2) nullable
  prizeDistribution: json -- {rank: {placement: 1, amount: 500, badge: true}}
  prizes: text[] -- Array of prize descriptions
  
  // Voting & Leaderboard
  votingEnabled: boolean DEFAULT true
  votingStartDate: timestamp nullable
  votingEndDate: timestamp nullable
  votingType: enum('community', 'judge', 'hybrid') DEFAULT 'community'
  judges: integer[] -- array of user IDs
  
  // Statistics
  totalEntries: integer DEFAULT 0
  totalVotes: integer DEFAULT 0
  totalParticipants: integer DEFAULT 0
  viewCount: integer DEFAULT 0
  
  // Status
  status: enum('draft', 'active', 'voting', 'closed', 'archived') DEFAULT 'draft'
  
  // Winners
  winnersAnnounced: boolean DEFAULT false
  announcedAt: timestamp nullable
  
  // Moderation
  isApproved: boolean DEFAULT true
  flaggedReason: varchar(255) nullable
  modFlags: json DEFAULT {}
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (creatorId)
  INDEX (status)
  INDEX (startDate, endDate) -- Active challenges
  INDEX (category)
  INDEX (totalVotes DESC) -- Popular challenges
  INDEX (createdAt DESC)
}
```

---

### 3. challenge_entries - Submissions to Challenges
```typescript
table challenge_entries {
  // Identity
  id: uuid PRIMARY KEY
  challengeId: uuid NOT NULL (foreign key)
  entrantId: integer NOT NULL (foreign key to users.id)
  
  // Content
  title: varchar(255) NOT NULL
  description: text nullable
  contentUrl: varchar(512) NOT NULL -- S3 URL, YouTube link, etc
  mediaType: enum('clip', 'mix', 'article', 'photo', 'text') NOT NULL
  duration: integer nullable -- seconds for audio/video
  fileSize: integer nullable -- bytes
  
  // Engagement
  votes: integer DEFAULT 0
  views: integer DEFAULT 0
  comments: integer DEFAULT 0
  shares: integer DEFAULT 0
  
  // Ranking & Results
  rank: integer nullable
  isWinner: boolean DEFAULT false
  winnerPlacement: integer nullable -- 1st, 2nd, 3rd, etc
  prizeAwarded: numeric(12, 2) nullable
  
  // Moderation
  isApproved: boolean DEFAULT true
  isFlagged: boolean DEFAULT false
  flagReason: varchar(255) nullable
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (challengeId) -- Get challenge entries
  INDEX (entrantId) -- User's submissions
  INDEX (votes DESC) -- Popular entries
  INDEX (rank) -- Leaderboard
  INDEX (createdAt DESC)
  UNIQUE (challengeId, entrantId) -- One entry per user per challenge
}
```

---

### 4. challenge_votes - Voting on Challenge Entries
```typescript
table challenge_votes {
  // Identity
  id: serial PRIMARY KEY
  challengeId: uuid NOT NULL (foreign key)
  entryId: uuid NOT NULL (foreign key)
  voterId: integer NOT NULL (foreign key to users.id)
  
  // Vote Details
  weight: integer DEFAULT 1 -- judges' votes may be weighted
  comment: text nullable -- voter comment (optional)
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (challengeId) -- Votes for challenge
  INDEX (entryId) -- Votes for entry
  INDEX (voterId) -- User's votes
  UNIQUE (entryId, voterId) -- One vote per user per entry
}
```

---

### 5. community_events - Community Events & Contests
```typescript
table community_events {
  // Identity
  id: uuid PRIMARY KEY
  organizerId: integer NOT NULL (foreign key to users.id)
  
  // Content
  title: varchar(255) NOT NULL
  description: text NOT NULL
  eventType: enum('listening_party', 'dj_battle', 'talent_show', 'meetup', 'masterclass') NOT NULL
  bannerUrl: varchar(512) nullable
  
  // Timeline
  startAt: timestamp NOT NULL
  endAt: timestamp NOT NULL
  registrationOpenAt: timestamp DEFAULT NOW()
  registrationCloseAt: timestamp nullable
  
  // Capacity
  maxParticipants: integer nullable
  registeredCount: integer DEFAULT 0
  
  // Features
  liveChat: boolean DEFAULT true
  watchTogether: boolean DEFAULT false -- synchronized playback
  voting: boolean DEFAULT false
  recordSession: boolean DEFAULT false
  
  // Streaming
  streamUrl: varchar(512) nullable
  platform: enum('twitch', 'youtube', 'own', 'zoom') nullable
  
  // Results
  winnersAnnounced: boolean DEFAULT false
  results: json nullable -- {winner_id: userId, placement: 1, etc}
  recordingUrl: varchar(512) nullable
  
  // Status
  status: enum('draft', 'upcoming', 'live', 'completed', 'cancelled') DEFAULT 'draft'
  
  // Statistics
  viewerCount: integer DEFAULT 0
  peakViewers: integer DEFAULT 0
  totalMessages: integer DEFAULT 0
  totalReactions: integer DEFAULT 0
  
  // Moderation
  isApproved: boolean DEFAULT true
  isFeatured: boolean DEFAULT false
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (organizerId)
  INDEX (eventType)
  INDEX (status)
  INDEX (startAt) -- Upcoming events
  INDEX (isFeatured) -- Featured events
  INDEX (createdAt DESC)
}
```

---

### 6. event_registrations - Event Attendance/Registration
```typescript
table event_registrations {
  // Identity
  id: serial PRIMARY KEY
  eventId: uuid NOT NULL (foreign key)
  userId: integer NOT NULL (foreign key to users.id)
  
  // Registration Details
  registeredAt: timestamp DEFAULT NOW()
  attended: boolean nullable
  attendedAt: timestamp nullable
  
  // Participation
  isParticipant: boolean DEFAULT false -- Performing/competing
  participantRole: varchar(50) nullable -- dj, performer, judge, etc
  
  // Stats (for live events)
  messageCount: integer DEFAULT 0
  reactionCount: integer DEFAULT 0
  votesGiven: integer DEFAULT 0
  
  // Indexes
  INDEX (eventId)
  INDEX (userId)
  INDEX (registeredAt)
  UNIQUE (eventId, userId) -- One registration per user
}
```

---

### 7. community_karma_history - Karma Point History
```typescript
table community_karma_history {
  // Identity
  id: serial PRIMARY KEY
  userId: integer NOT NULL (foreign key to users.id)
  
  // Karma Details
  actionType: enum(
    'post_clip', 'post_comment', 'helpful_comment',
    'report_abuse', 'share_content', 'write_article',
    'start_challenge', 'complete_challenge',
    'spam_detected', 'harassment', 'plagiarism',
    'moderation_action'
  ) NOT NULL
  
  pointsChange: integer NOT NULL -- Can be negative for penalties
  reason: text NOT NULL -- Description of why points changed
  
  // Related Entity
  relatedContentId: varchar(100) nullable -- Post ID, comment ID, etc
  relatedContentType: varchar(50) nullable -- post, comment, challenge_entry
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (userId) -- User karma history
  INDEX (actionType) -- Filter by action
  INDEX (createdAt DESC)
}
```

---

### 8. user_levels - User Level Progression
```typescript
table user_levels {
  // Identity
  id: serial PRIMARY KEY
  userId: integer NOT NULL UNIQUE (foreign key to users.id)
  
  // Level Info
  currentLevel: integer DEFAULT 1
  currentXP: integer DEFAULT 0
  totalXPEarned: integer DEFAULT 0
  
  // Level Thresholds
  xpToNextLevel: integer DEFAULT 100
  previousLevelXP: integer DEFAULT 0
  
  // Level Properties
  levelName: varchar(100) -- 'New Member', 'Contributor', 'Trusted', etc
  levelBadges: text[] DEFAULT ARRAY[]::text[]
  
  // Unlocked Perks
  unlockedPerks: text[] DEFAULT ARRAY[]::text[] -- Custom profile color, early access, etc
  
  // Historical
  levelUpDate: timestamp nullable -- Last time user leveled up
  maxLevelAchieved: integer DEFAULT 1
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (userId)
  INDEX (currentLevel)
  INDEX (currentXP)
}
```

---

### 9. user_achievements - Earned Achievements & Badges
```typescript
table user_achievements {
  // Identity
  id: serial PRIMARY KEY
  userId: integer NOT NULL (foreign key to users.id)
  
  // Achievement
  achievementId: varchar(100) NOT NULL
  achievementName: varchar(255) NOT NULL
  description: text
  category: enum('milestone', 'engagement', 'skill', 'social', 'special') NOT NULL
  
  // Rarity
  rarity: enum('common', 'rare', 'epic', 'legendary') DEFAULT 'common'
  
  // Rewards
  pointsAwarded: integer DEFAULT 0
  badgeUrl: varchar(512) nullable
  displayPosition: integer nullable -- Order on profile
  
  // Status
  isShowing: boolean DEFAULT true
  isPinned: boolean DEFAULT false
  
  // Timestamps
  unlockedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (userId)
  INDEX (achievementId)
  INDEX (unlockedAt)
  UNIQUE (userId, achievementId) -- One achievement per user
}
```

---

### 10. community_moderation_rules - Automated Moderation Rules
```typescript
table community_moderation_rules {
  // Identity
  id: serial PRIMARY KEY
  ruleName: varchar(100) NOT NULL
  ruleCategory: varchar(50) NOT NULL
  
  // Rule Type
  ruleType: enum('keyword', 'pattern', 'spam', 'behavior') NOT NULL
  pattern: text NOT NULL -- Regex or keyword
  caseSensitive: boolean DEFAULT false
  
  // Severity
  severity: enum('low', 'medium', 'high', 'critical') NOT NULL
  
  // Action
  autoAction: enum(
    'none',
    'flag',
    'warn',
    'mute',
    'timeout',
    'ban',
    'auto_lowercase'
  ) NOT NULL
  
  // Configuration
  actionDuration: integer nullable -- minutes/hours/days
  customMessage: text nullable
  requiresManualReview: boolean DEFAULT false
  
  // Status
  isActive: boolean DEFAULT true
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  updatedAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (isActive)
  INDEX (ruleType)
}
```

---

### 11. community_moderation_log - Audit Trail for Moderation
```typescript
table community_moderation_log {
  // Identity
  id: serial PRIMARY KEY
  
  // Actors
  moderatorId: integer NOT NULL (foreign key to users.id)
  targetUserId: integer nullable (foreign key to users.id)
  targetContentId: varchar(100) nullable -- Post/comment/message ID
  targetContentType: varchar(50) nullable -- post, comment, message
  
  // Action Details
  action: enum(
    'warn',
    'mute',
    'timeout',
    'suspend',
    'ban',
    'appeal_approved',
    'appeal_denied',
    'content_removed',
    'content_flagged'
  ) NOT NULL
  
  reason: text NOT NULL
  duration: interval nullable -- For temporary actions
  endDate: timestamp nullable -- When action expires
  
  // Appeal Info
  appealReason: text nullable
  appealStatus: enum('pending', 'approved', 'denied') nullable
  
  // Notes
  internalNotes: text nullable
  publicMessage: text nullable
  
  // Timestamps
  createdAt: timestamp DEFAULT NOW()
  
  // Indexes
  INDEX (moderatorId)
  INDEX (targetUserId)
  INDEX (action)
  INDEX (createdAt DESC)
}
```

---

## Enum Definitions

```typescript
// verification_tier
'standard', 'streamer', 'partner', 'admin'

// verification_method
'auto', 'manual'

// privacy_level
'public', 'private', 'friends_only'

// event_type
'listening_party', 'dj_battle', 'talent_show', 'meetup', 'masterclass'

// karma_action
'post_clip', 'post_comment', 'helpful_comment', 'report_abuse',
'share_content', 'write_article', 'start_challenge', 'complete_challenge',
'spam_detected', 'harassment', 'plagiarism', 'moderation_action'

// moderation_action
'warn', 'mute', 'timeout', 'suspend', 'ban',
'appeal_approved', 'appeal_denied', 'content_removed', 'content_flagged'

// achievement_rarity
'common', 'rare', 'epic', 'legendary'

// moderation_severity
'low', 'medium', 'high', 'critical'
```

---

## Relationships & Foreign Keys

```
community_profiles.userId → users.id
community_challenges.creatorId → users.id
challenge_entries.challengeId → community_challenges.id
challenge_entries.entrantId → users.id
challenge_votes.entryId → challenge_entries.id
challenge_votes.voterId → users.id
community_events.organizerId → users.id
event_registrations.eventId → community_events.id
event_registrations.userId → users.id
community_karma_history.userId → users.id
user_levels.userId → users.id
user_achievements.userId → users.id
community_moderation_log.moderatorId → users.id
community_moderation_log.targetUserId → users.id
```

---

## Performance Considerations

### Required Indexes
1. **Community Profiles**
   - `(userId)` - Single user lookup
   - `(username)` - Profile discovery search
   - `(isVerified)` - Filter verified users
   - `(privacyLevel)` - Privacy enforcement
   - `(followersCount DESC)` - Top creators leaderboard
   - `(karma DESC)` - Karma leaderboard

2. **Community Challenges**
   - `(creatorId)` - User's challenges
   - `(status)` - Active challenges
   - `(startDate, endDate)` - Timeline queries
   - `(category)` - Filter by genre
   - `(totalVotes DESC)` - Popular challenges

3. **Challenge Entries**
   - `(challengeId)` - Entries for challenge
   - `(entrantId)` - User's submissions
   - `(votes DESC)` - Leaderboard ranking

4. **Community Moderation Log**
   - `(moderatorId)` - Mod activity
   - `(targetUserId)` - User's violations
   - `(action)` - Action type filtering

### Partitioning Strategy
- Partition `community_karma_history` by month (for 12-month archival)
- Partition `community_moderation_log` by quarter
- Archive old `community_events` to separate table after 90 days

### Caching Strategy
- **Redis Cache:**
  - User profiles (1-hour TTL)
  - Leaderboards (30-minute TTL)
  - Follow recommendations (6-hour TTL)
  - Active challenges (1-hour TTL)
  - Moderation rules (24-hour TTL)

---

## Data Retention Policies

| Table | Retention | Archive | Notes |
|-------|-----------|---------|-------|
| community_profiles | Forever | N/A | Keep for user history |
| community_challenges | Forever | After 1 year | Archive for reporting |
| challenge_entries | Forever | After 1 year | Archive for analytics |
| community_moderation_log | 2 years | Archive | Legal requirement |
| community_karma_history | 1 year | Archive | User analytics |
| event_registrations | 1 year | Archive | Usage statistics |

---

## Migration Order
1. `community_profiles` - Foundation
2. `community_challenges` - Event features
3. `challenge_entries` - Supporting data
4. `challenge_votes` - Voting system
5. `community_events` - Event management
6. `event_registrations` - Registration
7. `community_karma_history` - Reputation tracking
8. `user_levels` - Level progression
9. `user_achievements` - Achievement system
10. `community_moderation_rules` - Auto-moderation
11. `community_moderation_log` - Audit trail

---

**Status:** Ready for Drizzle migration generation  
**Next Step:** Generate migrations with `drizzle-kit generate` and apply with `drizzle-kit migrate`
