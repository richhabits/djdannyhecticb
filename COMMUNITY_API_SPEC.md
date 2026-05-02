# Community Features API Specification
**Status:** Ready for Implementation  
**Format:** tRPC Procedures with Zod Validation

---

## API Architecture

### Router Structure
```
community
├── profiles/
│   ├── create
│   ├── get
│   ├── update
│   ├── search
│   ├── verify
│   └── getVerificationStatus
├── social/
│   ├── follow
│   ├── unfollow
│   ├── getFollowers
│   ├── getFollowing
│   ├── getSuggestions
│   ├── block
│   ├── unblock
│   └── getBlocked
├── challenges/
│   ├── create
│   ├── list
│   ├── get
│   ├── update (admin/creator)
│   ├── submitEntry
│   ├── voteEntry
│   ├── getLeaderboard
│   └── getWinners
├── events/
│   ├── create
│   ├── list
│   ├── get
│   ├── register
│   ├── unregister
│   ├── getRegistrations (admin/creator)
│   └── updateStatus
├── karma/
│   ├── getScore
│   ├── getHistory
│   ├── getLeaderboards
│   └── calculateLevel
├── moderation/
│   ├── report
│   ├── getReports (admin)
│   ├── handleReport (admin)
│   ├── getModLog (admin)
│   ├── getRules (admin)
│   └── updateRules (admin)
└── gamification/
    ├── getAchievements
    ├── getLevel
    ├── getLevelProgress
    └── getLeaderboards
```

---

## Profile Endpoints

### 1. Create Profile
```typescript
POST /community/profiles/create

Input:
{
  userId: number;
  username: string; // 3-50 chars, unique
  displayName: string; // 1-255 chars
  bio?: string; // max 500 chars
  avatarUrl?: string; // validation for image URL
  bannerUrl?: string; // validation for image URL
  location?: string;
  pronouns?: string;
  privacyLevel?: 'public' | 'private' | 'friends_only'; // default: public
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  discordUsername?: string;
}

Output:
{
  id: number;
  userId: number;
  username: string;
  displayName: string;
  bio: string;
  isVerified: boolean;
  verificationTier: 'standard' | 'streamer' | 'partner' | 'admin';
  verificationBadges: string[];
  privacyLevel: string;
  karma: number;
  level: number;
  createdAt: Date;
}

Errors:
- 400: Username already taken
- 400: Invalid username format (3-50 chars, alphanumeric + underscore)
- 400: Invalid image URL
- 409: User already has profile
```

---

### 2. Get Profile
```typescript
GET /community/profiles/:userId

Query:
{
  userId: number;
  includeStats?: boolean; // default: true
  includeAchievements?: boolean; // default: true
}

Output:
{
  id: number;
  userId: number;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  verificationTier: 'standard' | 'streamer' | 'partner' | 'admin';
  verificationBadges: string[];
  
  // Stats
  followersCount: number;
  followingCount: number;
  totalPosts: number;
  totalClips: number;
  totalComments: number;
  karma: number;
  level: number;
  
  // Privacy
  privacyLevel: string;
  allowDirectMessages: boolean;
  allowMentions: boolean;
  
  // Social Links
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  discordUsername?: string;
  
  // Computed
  isFollowedByMe?: boolean;
  isFollowingMe?: boolean;
  isBlocked?: boolean;
  achievements?: Achievement[];
  
  createdAt: Date;
  updatedAt: Date;
}

Errors:
- 404: Profile not found
- 403: Profile is private and not friend
```

---

### 3. Update Profile
```typescript
PATCH /community/profiles/update

Input:
{
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  pronouns?: string;
  privacyLevel?: 'public' | 'private' | 'friends_only';
  allowDirectMessages?: boolean;
  allowMentions?: boolean;
  allowCollaborations?: boolean;
  twitterHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  discordUsername?: string;
}

Output: Updated profile object

Errors:
- 401: Unauthorized
- 400: Invalid field value
```

---

### 4. Search Profiles
```typescript
GET /community/profiles/search

Query:
{
  q: string; // Search query (username or display name)
  limit?: number; // default: 20, max: 100
  offset?: number; // default: 0
  onlyVerified?: boolean; // default: false
  genre?: string; // optional filter
}

Output:
{
  results: Profile[];
  total: number;
  hasMore: boolean;
}

Errors:
- 400: Query too short (min 2 chars)
- 400: Invalid limit
```

---

### 5. Request Verification
```typescript
POST /community/profiles/requestVerification

Input:
{
  applicationType: 'streamer' | 'creator' | 'artist';
  proofUrl: string; // URL to proof (YouTube link, Twitter thread, etc)
  proofType: 'social_links' | 'portfolio' | 'press';
  message?: string; // Why you deserve verification (max 500 chars)
}

Output:
{
  status: 'auto_verified' | 'pending_review' | 'rejected';
  verificationTier?: string;
  message: string;
  reviewDate?: Date; // When manual review will be complete
}

Auto-verification triggers:
- Account age ≥ 90 days
- Follower count ≥ 1000
- Engagement rate ≥ 5%
- Streamer status in auth system

Errors:
- 400: Account too new (< 90 days)
- 409: Already verified or pending review
- 400: Invalid proof URL
```

---

## Social Graph Endpoints

### 1. Follow User
```typescript
POST /community/social/follow

Input:
{
  userId: number; // User to follow
}

Output:
{
  success: boolean;
  followingCount: number; // Updated follower count
  notification: {
    sent: boolean;
    type: 'follow_notification';
  };
}

Side Effects:
- Create notification for followed user
- Update counts in community_profiles
- Add entry to follows table

Errors:
- 400: Cannot follow self
- 403: User is blocking you
- 410: User has private profile (need approval)
```

---

### 2. Get Follow Suggestions
```typescript
GET /community/social/suggestions

Query:
{
  limit?: number; // default: 10, max: 50
  genre?: string; // optional filter
  timeframe?: 'week' | 'month' | 'all'; // default: all
}

Output:
{
  suggestions: {
    userId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    mutualFollows: number; // Shared followers
    reason: string; // Why recommended
    similarity: number; // 0-1 score
  }[];
}

Algorithm:
1. Rank by mutual followers (50% weight)
2. Rank by shared interests/genres (30% weight)
3. Rank by engagement rate (20% weight)
4. Exclude: blocked, already following, self
5. Prioritize: verified users, high engagement

Errors:
- 401: Unauthorized
```

---

### 3. Block User
```typescript
POST /community/social/block

Input:
{
  userId: number;
  reason?: string; // Optional reason (harassment, spam, etc)
}

Output:
{
  success: boolean;
  blocked: boolean;
}

Side Effects:
- Remove follow relationship (both directions)
- Prevent DMs from blocked user
- Hide posts from blocked user
- User cannot see your profile (private)

Errors:
- 400: Cannot block self
- 409: Already blocked
```

---

## Challenge Endpoints

### 1. Create Challenge
```typescript
POST /community/challenges/create
// Admin only or verified creators

Input:
{
  title: string; // 5-255 chars
  description: string; // 50-2000 chars
  category: string; // house, techno, remix, mashup, etc
  rules: string[]; // Array of rules (1-10)
  entryFormat: 'clip' | 'mix' | 'article' | 'photo' | 'text';
  startDate: Date;
  endDate: Date;
  votingStartDate: Date;
  votingEndDate: Date;
  maxDurationSeconds?: number; // For audio/video
  prizePool?: number; // In USD
  prizes: string[]; // Prize descriptions
  judges?: number[]; // Array of judge user IDs
  votingType: 'community' | 'judge' | 'hybrid'; // default: community
  bannerUrl?: string;
}

Output:
{
  id: string; // UUID
  creatorId: number;
  status: 'draft' | 'active';
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalEntries: number;
  createdAt: Date;
}

Validations:
- Start date must be in future
- End date must be after start date
- Rules must be specific and fair
- Prize pool must match prizes
- At least 1 judge if judge voting enabled

Errors:
- 403: Not verified creator
- 400: Invalid dates
- 400: Prize/rule mismatch
```

---

### 2. List Challenges
```typescript
GET /community/challenges/list

Query:
{
  status?: 'active' | 'upcoming' | 'voting' | 'closed' | 'all'; // default: active
  category?: string;
  limit?: number; // default: 20
  offset?: number;
  sortBy?: 'new' | 'popular' | 'ending_soon'; // default: new
}

Output:
{
  challenges: Challenge[];
  total: number;
  hasMore: boolean;
}

Response Challenges include:
{
  id: string;
  title: string;
  description: string;
  category: string;
  entryFormat: string;
  startDate: Date;
  endDate: Date;
  totalEntries: number;
  totalVotes: number;
  creatorName: string;
  bannerUrl: string;
  status: string;
  daysRemaining: number;
  userHasEntered?: boolean;
}

Errors:
- 400: Invalid filter
```

---

### 3. Submit Challenge Entry
```typescript
POST /community/challenges/:challengeId/submitEntry

Input:
{
  title: string; // Entry title
  description?: string;
  contentUrl: string; // S3 URL or YouTube link
  mediaType: string; // Matches challenge format
}

Output:
{
  id: string; // Entry UUID
  challengeId: string;
  entrantId: number;
  contentUrl: string;
  votes: number;
  rank?: number;
  createdAt: Date;
}

Validations:
- Challenge must be active
- User cannot enter twice
- Content must match format
- Content URL must be valid
- File size limits enforced

Side Effects:
- Increment challenge.totalEntries
- Award karma points (+5)
- Create karma history entry

Errors:
- 400: Challenge not active
- 409: Already entered
- 400: Invalid content URL
- 403: Challenge not open to submissions
```

---

### 4. Vote on Entry
```typescript
POST /community/challenges/:challengeId/entries/:entryId/vote

Input:
{
  entryId: string;
}

Output:
{
  success: boolean;
  votes: number;
  userVoted: boolean;
  rank?: number;
}

Validations:
- Voting period must be active
- User can vote once per entry
- Cannot vote for own entry

Side Effects:
- Increment entry.votes
- Update challenge.totalVotes
- Recompute leaderboard ranks

Errors:
- 400: Voting not active
- 409: Already voted
- 400: Cannot vote for own entry
```

---

## Community Events Endpoints

### 1. Create Event
```typescript
POST /community/events/create
// Admin or verified organizers

Input:
{
  title: string;
  description: string;
  eventType: 'listening_party' | 'dj_battle' | 'talent_show' | 'meetup' | 'masterclass';
  startAt: Date;
  endAt: Date;
  maxParticipants?: number;
  liveChat?: boolean;
  watchTogether?: boolean;
  voting?: boolean;
  streamUrl?: string;
  platform?: 'twitch' | 'youtube' | 'own' | 'zoom';
  bannerUrl?: string;
}

Output:
{
  id: string; // UUID
  organizerId: number;
  status: 'upcoming' | 'draft';
  createdAt: Date;
}

Errors:
- 403: Not verified organizer
- 400: Invalid dates
- 400: Event in past
```

---

### 2. Register for Event
```typescript
POST /community/events/:eventId/register

Input:
{
  isParticipant?: boolean; // default: false (attendance only)
  participantRole?: string; // dj, judge, performer, etc
}

Output:
{
  success: boolean;
  registered: boolean;
  confirmationCode: string;
}

Side Effects:
- Create entry in event_registrations
- Send confirmation notification
- Update registeredCount
- Check capacity limits

Errors:
- 400: Event not found or ended
- 409: Already registered
- 403: Event at capacity (if max set)
- 400: Cannot register as participant (not eligible)
```

---

## Karma & Reputation Endpoints

### 1. Get Karma Score
```typescript
GET /community/karma/:userId

Output:
{
  userId: number;
  totalKarma: number;
  level: number;
  levelName: string;
  xpProgress: number;
  xpToNextLevel: number;
  trustLevel: 'new' | 'contributor' | 'trusted' | 'influencer';
  badges: string[];
  recentActions: {
    actionType: string;
    pointsChange: number;
    reason: string;
    date: Date;
  }[];
}

Errors:
- 404: User not found
```

---

### 2. Get Leaderboards
```typescript
GET /community/karma/leaderboards

Query:
{
  type?: 'creators' | 'contributors' | 'engagement' | 'weekly' | 'monthly';
  // default: creators
  limit?: number; // default: 50
  timeframe?: 'week' | 'month' | 'all'; // default: all
  genre?: string; // optional
}

Output:
{
  type: string;
  timeframe: string;
  leaderboard: {
    rank: number;
    userId: number;
    username: string;
    displayName: string;
    avatarUrl: string;
    score: number; // Followers, karma, engagement, etc
    badges: string[];
    trend?: 'up' | 'down' | 'stable'; // vs previous period
  }[];
}

Leaderboard Types:
- creators: Ranked by followers
- contributors: Ranked by karma/helpful comments
- engagement: Ranked by comments + reactions
- weekly: Most active users this week
- monthly: Most active users this month

Errors:
- 400: Invalid type
```

---

## Moderation Endpoints

### 1. Report User/Content
```typescript
POST /community/moderation/report

Input:
{
  reportType: 'user' | 'content';
  reportedUserId?: number; // If reporting user
  reportedContentId?: string; // If reporting content
  reportedContentType?: 'comment' | 'post' | 'message' | 'profile';
  reason: enum[
    'spam',
    'harassment',
    'hate_speech',
    'inappropriate_content',
    'misinformation',
    'impersonation',
    'scam',
    'copyright',
    'other'
  ];
  description?: string; // Max 1000 chars
  evidenceUrl?: string; // Screenshot or evidence
}

Output:
{
  success: boolean;
  reportId: number;
  status: 'open';
  caseNumber: string; // For user reference
  estimatedReviewTime: '24 hours' | '48 hours' | '1 week';
}

Side Effects:
- Create entry in reports table
- Notify moderation team
- Flag content if auto-detect triggers
- Send confirmation to reporter

Errors:
- 400: Invalid reason
- 409: Duplicate recent report (same content/user)
- 403: Cannot report self
```

---

### 2. Get Pending Reports (Admin)
```typescript
GET /community/moderation/reports/pending
// Admin only

Query:
{
  status?: 'open' | 'reviewing' | 'all'; // default: open
  severity?: 'low' | 'medium' | 'high' | 'critical';
  limit?: number; // default: 20
  offset?: number;
  sortBy?: 'newest' | 'severity' | 'oldest';
}

Output:
{
  reports: {
    id: number;
    reporterId: number;
    reporterName: string;
    reportedUserId?: number;
    reportedUserName?: string;
    reportedContentId?: string;
    reason: string;
    description: string;
    severity: string;
    evidence?: string;
    createdAt: Date;
    daysOpen: number;
  }[];
  total: number;
}

Errors:
- 403: Not admin
```

---

### 3. Handle Report (Admin)
```typescript
POST /community/moderation/reports/:reportId/handle
// Admin only

Input:
{
  action: 'dismiss' | 'warn' | 'mute' | 'timeout' | 'suspend' | 'ban';
  duration?: number; // In days, for temp actions
  publicMessage?: string; // Shown to user
  internalNote?: string; // For moderators only
}

Output:
{
  success: boolean;
  reportId: number;
  status: 'resolved';
  action: string;
  actionApplied: Date;
}

Side Effects:
- Update report status
- Create moderation_log entry
- Apply enforcement action
- Notify user
- Notify reporter

Enforcement Details:
- warn: Send warning, add to violation count
- mute: Cannot post for 1-7 days
- timeout: Temporary ban (1-30 days)
- suspend: Account disabled (30+ days)
- ban: Permanent ban, no appeals

Errors:
- 403: Not admin
- 400: Invalid action
- 404: Report not found
```

---

### 4. Get Moderation Log (Admin)
```typescript
GET /community/moderation/logs
// Admin only

Query:
{
  targetUserId?: number; // Filter by user
  moderatorId?: number; // Filter by moderator
  action?: string;
  limit?: number; // default: 50
  offset?: number;
}

Output:
{
  logs: {
    id: number;
    moderatorId: number;
    moderatorName: string;
    targetUserId: number;
    targetUserName: string;
    action: string;
    reason: string;
    duration?: number;
    endDate?: Date;
    publicMessage?: string;
    createdAt: Date;
  }[];
  total: number;
}

Errors:
- 403: Not admin
```

---

## Gamification Endpoints

### 1. Get User Achievements
```typescript
GET /community/gamification/achievements/:userId

Output:
{
  userId: number;
  achievements: {
    id: string;
    name: string;
    description: string;
    category: 'milestone' | 'engagement' | 'skill' | 'social';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    badgeUrl: string;
    unlockedAt: Date;
    progress?: {
      current: number;
      required: number;
    }; // For in-progress achievements
  }[];
  totalEarned: number;
  totalPoints: number;
}

Achievements Include:
- First Post (unlocked on 1st post)
- First Follower (1st follower)
- 100 Followers (verified at 100)
- Top Contributor (monthly)
- Helpful Commenter (50 helpful comments)
- Challenge Winner (1st entry win)
- Community Helper (5 helpful reports)
- Early Supporter (joined in first month)
- Master Builder (created 10 challenges)
- Legendary (level 5000+)

Errors:
- 404: User not found
```

---

### 2. Get User Level
```typescript
GET /community/gamification/level/:userId

Output:
{
  userId: number;
  currentLevel: number;
  levelName: string;
  currentXP: number;
  xpToNextLevel: number;
  progressPercentage: number; // 0-100
  totalXPEarned: number;
  unlockedPerks: string[];
  nextLevelPerks: string[];
  levelBadges: string[];
}

Level Structure:
1: New Member (0 XP)
2: Newcomer (50 XP)
3: Contributor (150 XP)
4: Regular (300 XP)
5: Trusted (500 XP)
...
10: Expert (5000 XP)
11: Legend (10000 XP)

Perks by Level:
- Level 3: Custom profile color
- Level 5: Early access to new features
- Level 7: Suggested to new users
- Level 10: Featured on homepage

Errors:
- 404: User not found
```

---

## WebSocket Events

### Real-time Updates

```typescript
// Subscribing to live updates
ws.subscribe('challenge:{challengeId}') // New votes
ws.subscribe('event:{eventId}') // Registration changes
ws.subscribe('user:{userId}:karma') // Karma changes
ws.subscribe('leaderboard:{type}') // Leaderboard updates

// Events emitted
ws.on('challenge:voted', {
  entryId: string;
  votes: number;
  newRank?: number;
})

ws.on('challenge:winner', {
  challengeId: string;
  winnerId: number;
  placement: number;
  prize: string;
})

ws.on('event:registered', {
  eventId: string;
  registeredCount: number;
  isFull: boolean;
})

ws.on('user:karma_changed', {
  userId: number;
  newKarma: number;
  change: number;
  reason: string;
})

ws.on('leaderboard:updated', {
  type: string;
  leaderboard: LeaderboardEntry[];
})

ws.on('moderation:action_taken', {
  targetUserId: number;
  action: string;
  reason: string;
  // Only visible to target user
})
```

---

## Error Codes

```typescript
// HTTP/tRPC Error Codes
400: BAD_REQUEST - Invalid input
401: UNAUTHORIZED - Not authenticated
403: FORBIDDEN - Not authorized for action
404: NOT_FOUND - Resource doesn't exist
409: CONFLICT - Resource already exists
422: UNPROCESSABLE_ENTITY - Validation failed
429: TOO_MANY_REQUESTS - Rate limited
500: INTERNAL_SERVER_ERROR - Server error

// Common Scenarios
"Username already taken" (400)
"Challenge not active" (400)
"Already voted" (409)
"Voting not open" (400)
"User blocked" (403)
"Cannot follow self" (400)
"Account too new for verification" (400)
"Already verified" (409)
"Report duplicate" (409)
"User not admin" (403)
"Event at capacity" (403)
"Invalid content URL" (400)
```

---

## Rate Limiting

```typescript
// Per authenticated user:
POST /challenge/submitEntry: 3 per day
POST /challenge/vote: 100 per day
POST /events/register: 10 per day
POST /report: 10 per day
POST /social/follow: 50 per hour
GET /search: 100 per hour

// Global:
/moderation routes: Admin only, 1000 per hour
```

---

## Documentation Format

**Procedure Name:**
```typescript
export const procedureName = procedure
  .input(z.object({
    param1: z.string(),
    param2: z.number().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Implementation
  })
```

---

**Status:** Ready for tRPC Router Implementation  
**Next:** Generate Drizzle schema, create routers in `server/routers/`, add to main tRPC appRouter
