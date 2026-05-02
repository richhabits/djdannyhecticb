# Community Features: Implementation Specification

**Date:** 2026-05-02  
**Status:** Spec Complete - Ready for Implementation  
**Target:** 10K+ active community members, 90%+ engagement

---

## 👥 Community Architecture

```
┌─────────────────────────────────────────────────┐
│           USER PROFILES & IDENTITY               │
│  • Verification badges • Reputation • Karma     │
└──────────────┬──────────────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ↓                     ↓
┌──────────────┐  ┌──────────────────┐
│ SOCIAL       │  │ MESSAGING        │
│ GRAPH        │  │ & CHAT           │
│ • Follows    │  │ • Direct Messages│
│ • Blocks     │  │ • Group Chats    │
└──────┬───────┘  └────────┬─────────┘
       │                    │
       └────────┬───────────┘
                │
    ┌───────────┴──────────┐
    ↓                      ↓
┌──────────────┐   ┌─────────────────┐
│ ENGAGEMENT   │   │ SAFETY &        │
│ • Comments   │   │ MODERATION      │
│ • Reactions  │   │ • Reports       │
│ • Clips      │   │ • Bans          │
│ • Leaderboard│   │ • Filters       │
└──────────────┘   └─────────────────┘
```

---

## 1️⃣ User Profiles & Verification

### 1.1 Profile Schema
```typescript
table community_profiles {
  id: serial PRIMARY KEY
  userId: integer NOT NULL UNIQUE
  username: varchar(50) NOT NULL UNIQUE
  displayName: varchar(255)
  bio: text
  avatarUrl: varchar(512)
  bannerUrl: varchar(512)
  
  -- Verification
  isVerified: boolean DEFAULT false
  verificationTier: enum('standard', 'streamer', 'partner', 'admin')
  verificationBadges: text[] -- ['verified', 'streamer', 'supporter', 'contributor']
  verifiedAt: timestamp
  
  -- Stats
  followersCount: integer DEFAULT 0
  followingCount: integer DEFAULT 0
  totalPosts: integer DEFAULT 0
  totalClips: integer DEFAULT 0
  
  -- Reputation
  karma: integer DEFAULT 0 -- Cumulative reputation
  helpfulComments: integer DEFAULT 0
  reportedBy: integer DEFAULT 0
  bannedUsers: integer DEFAULT 0 -- Users blocked
  
  -- Preferences
  privacyLevel: enum('public', 'private', 'friends_only')
  allowDirectMessages: boolean DEFAULT true
  allowMentions: boolean DEFAULT true
  allowCollab: boolean DEFAULT true
  
  -- Social links
  twitterHandle: varchar(100)
  tiktokHandle: varchar(100)
  instagramHandle: varchar(100)
  discordUsername: varchar(100)
  
  createdAt: timestamp DEFAULT now()
  updatedAt: timestamp DEFAULT now()
}
```

### 1.2 Verification System
```typescript
interface VerificationProcess {
  // Automatic verification (instant)
  auto_verify_if: {
    is_streamer: boolean; // DJ Danny's streamer
    min_followers: 1000;
    min_engagement_rate: 0.05; // 5%
    min_account_age: 'P90D'; // 90 days
  };
  
  // Manual verification (review)
  manual_verify_if: {
    submit_application: true;
    provide_proof: 'social_links | portfolio | press';
    review_period: 'P7D';
  };
  
  // Badges
  badges: {
    verified: '✓ Verified by DJ Danny',
    streamer: '🎙️ Official Streamer',
    supporter: '💜 Top Supporter',
    contributor: '🎨 Content Creator',
    partner: '🤝 Partner',
    admin: '⚙️ Team',
  };
}
```

---

## 2️⃣ Social Graph & Follows

### 2.1 Database Schema
```typescript
table follows {
  id: serial PRIMARY KEY
  followerId: integer NOT NULL
  followingId: integer NOT NULL
  createdAt: timestamp DEFAULT now()
  UNIQUE(followerId, followingId)
  INDEX (followerId)
  INDEX (followingId)
}

table blocks {
  id: serial PRIMARY KEY
  blockerId: integer NOT NULL
  blockedId: integer NOT NULL
  reason: text
  createdAt: timestamp DEFAULT now()
  UNIQUE(blockerId, blockedId)
}

table follow_notifications {
  id: serial PRIMARY KEY
  userId: integer NOT NULL
  followerId: integer NOT NULL
  isRead: boolean DEFAULT false
  createdAt: timestamp DEFAULT now()
}
```

### 2.2 Social Features
```typescript
interface SocialFeatures {
  // Follow/Unfollow
  follow(userId) => Promise<void>;
  unfollow(userId) => Promise<void>;
  
  // Follow recommendations
  suggestionsForYou() => User[];
  discoverCreators(genre?, region?) => User[];
  trendingCreators() => User[];
  
  // Timeline
  getFollowingFeed() => Content[];
  getFollowingActivity() => Activity[];
  
  // Notifications
  onNewFollower(userId) => notify(
    `${user.displayName} started following you`
  );
  
  // Blocking
  block(userId) => void;
  unblock(userId) => void;
  getBlockedList() => User[];
}
```

---

## 3️⃣ Direct Messaging & Chat

### 3.1 Message Database
```typescript
table direct_messages {
  id: uuid PRIMARY KEY
  conversationId: uuid NOT NULL
  senderId: integer NOT NULL
  senderName: varchar(255)
  content: text NOT NULL
  contentType: enum('text', 'image', 'emoji', 'clip')
  mediaUrl: varchar(512) -- if image/clip
  
  -- Status
  isRead: boolean DEFAULT false
  readAt: timestamp
  isEdited: boolean DEFAULT false
  editedAt: timestamp
  isDeleted: boolean DEFAULT false
  deletedAt: timestamp
  
  -- Reactions
  reactions: jsonb -- {emoji: [userId]}
  
  createdAt: timestamp DEFAULT now()
  INDEX (conversationId, createdAt DESC)
  INDEX (senderId, createdAt DESC)
}

table conversations {
  id: uuid PRIMARY KEY
  participant1Id: integer NOT NULL
  participant2Id: integer NOT NULL
  lastMessage: text
  lastMessageAt: timestamp
  unreadCount: integer DEFAULT 0
  isMuted: boolean DEFAULT false
  mutedUntil: timestamp
  createdAt: timestamp DEFAULT now()
  UNIQUE(participant1Id, participant2Id)
}
```

### 3.2 Messaging Features
```typescript
interface MessagingSystem {
  // Send message
  sendMessage(conversationId, content, type) => Message;
  
  // Real-time updates
  onNewMessage(conversationId) => Message;
  onUserTyping(conversationId) => {userId, isTyping};
  
  // Message actions
  editMessage(messageId, newContent) => void;
  deleteMessage(messageId) => void;
  reactWithEmoji(messageId, emoji) => void;
  
  // Conversation management
  muteConversation(conversationId, duration) => void;
  archiveConversation(conversationId) => void;
  blockUser(userId) => void;
  
  // Encryption (optional)
  enableE2EEncryption: boolean; // For sensitive chats
  
  // Search
  searchMessages(query, conversationId) => Message[];
  
  // Safety
  reportMessage(messageId, reason) => void;
  blockUserMessages(userId) => void;
}
```

---

## 4️⃣ Comments & Engagement

### 4.1 Comment System
```typescript
table comments {
  id: uuid PRIMARY KEY
  contentType: enum('clip', 'post', 'article', 'shout')
  contentId: uuid NOT NULL
  authorId: integer NOT NULL
  authorName: varchar(255)
  
  content: text NOT NULL
  parentCommentId: uuid -- For threaded replies
  depth: integer DEFAULT 0 -- Thread depth
  
  -- Moderation
  isApproved: boolean DEFAULT true
  isFlagged: boolean DEFAULT false
  flagReason: varchar(100)
  
  -- Engagement
  likes: integer DEFAULT 0
  replies: integer DEFAULT 0
  editedAt: timestamp
  
  createdAt: timestamp DEFAULT now()
  INDEX (contentId, createdAt DESC)
  INDEX (authorId, createdAt DESC)
}

table comment_likes {
  id: serial PRIMARY KEY
  commentId: uuid NOT NULL
  userId: integer NOT NULL
  createdAt: timestamp DEFAULT now()
  UNIQUE(commentId, userId)
}
```

### 4.2 Comment Features
```typescript
interface CommentingSystem {
  // Post comment
  postComment(contentId, contentType, text) => Comment;
  replyToComment(parentCommentId, text) => Comment;
  
  // Engagement
  likeComment(commentId) => void;
  reportComment(commentId, reason) => void;
  
  // Moderation
  hideComment(commentId) => void;
  deleteComment(commentId) => void;
  
  // Threading
  getReplies(commentId) => Comment[];
  getCommentThread(commentId) => Comment[];
  
  // Sorting
  sortBy: 'newest' | 'oldest' | 'most_liked' | 'trending';
  
  // Notifications
  onNewReply(commentId) => notify('New reply to your comment');
}
```

---

## 5️⃣ Reputation & Gamification

### 5.1 Karma System
```typescript
interface KarmaSystem {
  // Earn karma
  actions: {
    post_clip: +5,
    helpful_comment: +3,
    report_spam: +2,
    share_content: +1,
    write_article: +10,
    start_challenge: +5,
  };
  
  // Lose karma
  penalties: {
    spam_detected: -5,
    report_abuse: -10,
    plagiarism: -20,
    harassment: -50,
  };
  
  // Levels
  levels: {
    0: 'New Member',
    100: 'Contributor',
    500: 'Trusted',
    1000: 'Expert',
    5000: 'Legend',
  };
  
  // Perks by level
  perks: {
    Contributor: 'Custom profile color',
    Trusted: 'Early access to features',
    Expert: 'Suggested to new users',
    Legend: 'Featured on homepage',
  };
}
```

### 5.2 Leaderboards
```typescript
interface Leaderboards {
  // Global
  topCreators: Creator[]; // By followers
  topContributors: User[]; // By karma
  topEngagement: User[]; // By comments + reactions
  
  // Time-based
  weeklyMostActive: User[];
  monthlyBestClips: Clip[];
  quarterlyGrowthStars: User[]; // % follower growth
  
  // Genre-specific
  houseProducers: User[];
  technoMixes: Clip[];
  dubstepBattles: Competition[];
  
  // Seasonal
  summerChallenge: Challenge;
  holidayCommunityVote: Vote;
}

table leaderboards {
  id: serial PRIMARY KEY
  type: varchar(100) -- 'top_creators', 'weekly_active', etc
  rank: integer
  userId: integer
  score: integer -- followers, karma, engagements, etc
  period: date -- weekly, monthly, all-time
  createdAt: timestamp DEFAULT now()
  UNIQUE(type, period, userId)
}
```

---

## 6️⃣ Safety & Moderation

### 6.1 Moderation Tools
```typescript
interface ModerationSystem {
  // Report types
  report_reasons: [
    'Harassment',
    'Spam',
    'Copyright',
    'Explicit content',
    'Misinformation',
    'Off-topic',
    'Low quality',
  ];
  
  // Enforcement
  actions: {
    warn: 'Email warning',
    mute: 'Cannot post for duration',
    timeout: 'Temporary ban (1-30 days)',
    suspend: 'Account suspended (30+ days)',
    ban: 'Permanent ban',
  };
  
  // Automation
  autoModeration: {
    spam_filter: true,
    duplicate_posts: '< 5m warning',
    excessive_caps: 'Auto-lowercase',
    repeat_reports: 'Auto-timeout on 5+ reports',
  };
}

table reports {
  id: serial PRIMARY KEY
  reportType: varchar(50)
  reporterId: integer
  reportedUserId: integer
  reportedContentId: uuid
  reason: text
  description: text
  severity: enum('low', 'medium', 'high', 'critical')
  status: enum('open', 'investigating', 'resolved', 'dismissed')
  resolution: text
  actionTaken: varchar(100)
  createdAt: timestamp DEFAULT now()
  resolvedAt: timestamp
}

table moderation_log {
  id: serial PRIMARY KEY
  moderatorId: integer
  userId: integer
  action: varchar(100)
  duration: interval
  reason: text
  createdAt: timestamp DEFAULT now()
}
```

### 6.2 Content Filters
```typescript
interface ContentFiltering {
  // Keyword filter
  bannedWords: string[]; // Auto-blur or remove
  
  // Spam detection
  spamPatterns: {
    repeating_links: true,
    excessive_mentions: true,
    all_caps: true,
  };
  
  // Safe content
  requireAgeGate: {
    explicit_language: true,
    violent_content: true,
    adult_themes: true,
  };
}
```

---

## 7️⃣ Community Challenges

### 7.1 Challenges
```typescript
interface Challenge {
  id: uuid;
  title: string; // "Best Beat Drop"
  description: text;
  rules: text[];
  startDate: timestamp;
  endDate: timestamp;
  prize: { value: number; currency: string } | 'Recognition';
  
  category: string; // Music genre, skill level
  entryFormat: 'clip' | 'mix' | 'article' | 'photo';
  
  // Engagement
  entriesCount: integer;
  votesCount: integer;
  winnerAnnounced: boolean;
  winners: User[];
}

table challenge_entries {
  id: uuid PRIMARY KEY
  challengeId: uuid NOT NULL
  entrantId: integer NOT NULL
  contentUrl: varchar(512)
  votes: integer DEFAULT 0
  rank: integer
  createdAt: timestamp DEFAULT now()
}
```

---

## 8️⃣ Community Events

```typescript
interface CommunityEvent {
  id: uuid;
  title: string;
  description: text;
  eventType: 'listening_party' | 'dj_battle' | 'talent_show' | 'meetup';
  startAt: timestamp;
  endAt: timestamp;
  
  // Participation
  maxParticipants: integer;
  registeredCount: integer;
  
  // Engagement
  liveChat: boolean;
  watchTogether: boolean; // Synchronized video
  voting: boolean; // If applicable
}
```

---

## ✅ Implementation Checklist

### Phase 1: Profiles & Identity
- [ ] Profile creation & editing
- [ ] Verification system
- [ ] Badge assignment
- [ ] Public/private profiles
- [ ] Profile discovery

### Phase 2: Social Features
- [ ] Follow/unfollow system
- [ ] Social timeline feed
- [ ] Follow recommendations
- [ ] Block/report users
- [ ] Notifications

### Phase 3: Messaging
- [ ] Direct messaging UI
- [ ] Real-time message delivery
- [ ] Typing indicators
- [ ] Message editing/deletion
- [ ] Conversation archiving

### Phase 4: Engagement
- [ ] Comments on content
- [ ] Comment threading
- [ ] Like reactions
- [ ] Report comments
- [ ] Comment moderation

### Phase 5: Gamification
- [ ] Karma system
- [ ] Level progression
- [ ] Leaderboards
- [ ] Badges/achievements
- [ ] Seasonal challenges

### Phase 6: Moderation
- [ ] Report system
- [ ] Moderation queue
- [ ] Content filtering
- [ ] Spam detection
- [ ] Ban/suspend system

### Phase 7: Community Features
- [ ] Community challenges
- [ ] Events & contests
- [ ] Group discussions
- [ ] Featured content
- [ ] Community highlights

---

## 📊 Success Metrics

- [ ] 10K+ registered community members (90 days)
- [ ] 5K+ active daily users (30% DAU/MAU ratio)
- [ ] 1K+ comments per day
- [ ] 50+ community challenges live
- [ ] <2% spam/abuse rate
- [ ] 90%+ user satisfaction (surveys)
- [ ] 500+ user-generated clips monthly
- [ ] 10K+ followers/follows created weekly

---

## 🔗 Integration Points

**Requires:**
- User authentication system
- Real-time messaging (WebSocket)
- Content management system
- Notification service
- Spam detection ML

**Integrates with:**
- User profiles (display info)
- Clips & content (commenting)
- Streaming (live chat)
- Analytics (engagement tracking)
- Admin dashboard (moderation tools)
