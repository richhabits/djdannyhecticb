# AI & Automation Implementation Specification
## DJ Danny Hectic B - Phase 1 & Beyond

**Date:** 2026-05-02  
**Status:** Implementation Ready  
**Target:** Intelligent content creation, moderation, and audience engagement at scale

---

## 📋 Executive Summary

This document details the comprehensive implementation plan for deploying Claude API and ML-based automation across DJ Danny Hectic B's platform. The system will intelligently summarize chat, detect content peaks, flag spam, recommend content, transcribe streams, moderate toxicity, and forecast audience dynamics—all with rate-limiting, fallback strategies, and measurable success criteria.

**Tech Stack:**
- Claude API (chat summaries, auto-clip titles, tag generation, smart moderation)
- Whisper API (transcription)
- Perspective API (toxicity detection)
- Custom ML models (spam detection, peak moment detection)
- PostgreSQL + Drizzle ORM (storage)
- Node.js/Express (API layer)

---

## 🎯 PHASE 1: CHAT SUMMARIZATION (Week 1)

### 1.1 Overview
Generate AI-powered summaries of stream chat to capture key moments, sentiment, and engagement without watching entire VOD.

**Goals:**
- ✅ Summarize 2-4 hour streams into 2-3 sentence summaries
- ✅ Extract top moments (reactions, donations, milestones)
- ✅ Analyze sentiment (positive/negative/neutral split)
- ✅ Identify key topics discussed
- ✅ 95%+ accuracy (subjective quality review)

### 1.2 Database Schema (Already Exists)
```typescript
table chat_summaries {
  id: serial PRIMARY KEY
  liveSessionId: integer NOT NULL
  startTime: timestamp NOT NULL
  endTime: timestamp NOT NULL
  summary: text NOT NULL -- Claude-generated 2-3 sentences
  topics: json -- Array of strings ["topic1", "topic2"]
  sentiment: varchar -- "positive" | "neutral" | "negative"
  topMoments: json -- [{time, description, engagement}]
  messageCount: integer
  viewerSentiment: json -- {positive, neutral, negative} counts
  createdAt: timestamp
}
```

### 1.3 Claude API Integration

**Endpoint:** `POST /api/ai/summarize-chat`

```typescript
interface SummarizeChatRequest {
  liveSessionId: number;
  chatMessages: Array<{
    username: string;
    message: string;
    timestamp: string;
    isModeratorOrStreamer?: boolean;
    isSubscriber?: boolean;
    isDonation?: boolean;
    donationAmount?: number;
  }>;
}

interface SummarizeChatResponse {
  summary: string;
  topics: string[];
  sentiment: "positive" | "neutral" | "negative";
  topMoments: Array<{
    time: string;
    description: string;
    engagement: number; // 0-100 score
  }>;
  messageCount: number;
  viewerSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  confidence: number; // 0-1
}
```

**Claude Prompt Template:**
```
You are an expert live chat analyst. Analyze the following stream chat messages and provide:

1. **Summary** (2-3 sentences): Capture the overall vibe, key announcements, and what happened
2. **Topics** (3-5 tags): Main subjects discussed (e.g., "song_requests", "technical_difficulty", "charity_moment")
3. **Sentiment**: Overall tone (positive, neutral, or negative)
4. **Top 3 Moments**: The most engaging moments with timestamps and descriptions
5. **Sentiment Breakdown**: Count of positive, neutral, and negative messages

Chat Data:
${chatMessagesFormatted}

Respond in JSON format:
{
  "summary": "...",
  "topics": ["topic1", "topic2"],
  "sentiment": "positive|neutral|negative",
  "topMoments": [{"time": "HH:MM:SS", "description": "...", "engagement": 95}],
  "viewerSentiment": {"positive": 120, "neutral": 80, "negative": 5}
}
```

### 1.4 Implementation Flow

```
Stream End Event
       ↓
[Fetch Chat Messages] (from chatMessages table)
       ↓
[Format for Claude] - Group by 5-min intervals for context
       ↓
[Call Claude API] - 100k token model, cache enabled
       ↓
[Parse JSON Response]
       ↓
[Store in DB] - chat_summaries table
       ↓
[Create Notification] - "Stream summary ready!"
       ↓
[Display in Archive] - Show summary card in stream details
```

### 1.5 Rate Limiting Strategy

```typescript
const CLAUDE_RATE_LIMITS = {
  requestsPerMinute: 60,
  tokensPerMinute: 1_000_000, // 1M tokens/min tier
  maxRetries: 3,
  backoffMs: 1000, // Start at 1s
  maxBackoffMs: 30_000, // Max 30s
};

class RateLimitedClaudeClient {
  private queue: Promise<any> = Promise.resolve();
  private tokenBucket = new TokenBucket(CLAUDE_RATE_LIMITS.tokensPerMinute);

  async call(messages: MessageParam[]): Promise<string> {
    // Queue requests to maintain ordering
    return new Promise((resolve, reject) => {
      this.queue = this.queue
        .then(() => this.tokenBucket.acquire(estimatedTokens(messages)))
        .then(() => this.callWithRetry(messages))
        .then(resolve)
        .catch(reject);
    });
  }

  private async callWithRetry(messages: MessageParam[], attempt = 0): Promise<string> {
    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages,
      });
      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (error) {
      if (attempt < CLAUDE_RATE_LIMITS.maxRetries && isRetryableError(error)) {
        const backoff = Math.min(
          CLAUDE_RATE_LIMITS.backoffMs * Math.pow(2, attempt),
          CLAUDE_RATE_LIMITS.maxBackoffMs
        );
        await new Promise(r => setTimeout(r, backoff));
        return this.callWithRetry(messages, attempt + 1);
      }
      throw error;
    }
  }
}
```

### 1.6 Fallback Strategy

If Claude API fails:
1. Generate basic summary from message metadata (frequency analysis)
2. Extract sentiment from emoji/capitalization patterns
3. Mark as "partial" in database
4. Retry in background job

```typescript
function fallbackSummary(messages: ChatMessage[]): ChatSummary {
  const summary = `Chat had ${messages.length} messages. Most active topic was ${findMostFrequentWord(messages)}.`;
  const sentiment = messages.filter(m => m.emoji?.includes('😂')).length > messages.length * 0.4
    ? 'positive'
    : 'neutral';

  return {
    summary,
    sentiment,
    topics: extractFrequentWords(messages, 5),
    topMoments: findLargestDonations(messages),
    messageCount: messages.length,
  };
}
```

### 1.7 Validation & Quality Checks

```typescript
// Ensure summary quality
function validateSummary(summary: ChatSummary): boolean {
  return (
    summary.summary.length > 20 &&
    summary.summary.length < 300 &&
    summary.topics.length > 0 &&
    summary.topics.length <= 10 &&
    ["positive", "neutral", "negative"].includes(summary.sentiment) &&
    summary.topMoments.length >= 1 &&
    summary.topMoments.length <= 10
  );
}
```

### 1.8 Display Integration

```typescript
// In stream archive view
interface StreamArchiveSection {
  streamId: number;
  title: string;
  duration: string;
  viewers: number;
  chatSummary?: {
    summary: string;
    sentiment: "positive" | "neutral" | "negative";
    topMoments: Array<{ time: string; description: string }>;
  };
  clips: Clip[];
}

// Component renders:
// <ChatSummaryCard summary={stream.chatSummary} onMomentClick={seekTo} />
```

---

## 🎬 PHASE 2: AUTO-CLIP GENERATION (Week 2)

### 2.1 Overview
Detect peak moments in streams and auto-generate optimized clips with AI-generated titles and descriptions.

**Goals:**
- ✅ Detect 2-3 peak moments per 4-hour stream
- ✅ Generate clip titles (max 60 chars)
- ✅ Generate descriptions with call-to-action
- ✅ Auto-generate thumbnail (if ML available)
- ✅ Auto-publish clips if confidence >80%
- ✅ Track clip performance (views, engagement)

### 2.2 Peak Moment Detection Algorithm

```typescript
interface MomentDetectionInput {
  chatActivity: Array<{ minute: number; messageCount: number }>;
  audioIntensity: Array<{ minute: number; intensity: 0-1 }>;
  viewerCount: Array<{ minute: number; count: number }>;
  reactions: Array<{ type: string; count: number; minute: number }>;
  donations: Array<{ amount: number; minute: number }>;
}

function detectPeakMoments(data: MomentDetectionInput): Array<{
  startMinute: number;
  endMinute: number;
  type: string;
  score: 0-1;
}> {
  const moments = [];

  // Chat activity spike
  const chatSpikes = findSpikes(data.chatActivity.map(c => c.messageCount), threshold: 3);
  moments.push(...chatSpikes.map(minute => ({
    startMinute: minute - 2,
    endMinute: minute + 2,
    type: "chat_spike",
    score: 0.7,
  })));

  // Audio intensity peak
  const audioSpikes = findSpikes(data.audioIntensity.map(a => a.intensity), threshold: 0.8);
  moments.push(...audioSpikes.map(minute => ({
    startMinute: minute - 1,
    endMinute: minute + 2,
    type: "audio_peak",
    score: 0.6,
  })));

  // Viewer count peak
  const viewerSpikes = findSpikes(data.viewerCount.map(v => v.count), threshold: 2);
  moments.push(...viewerSpikes.map(minute => ({
    startMinute: minute - 1,
    endMinute: minute + 3,
    type: "viewer_spike",
    score: 0.65,
  })));

  // Donation spike
  if (data.donations.length > 0) {
    const donationMoments = data.donations
      .filter(d => d.amount > 50) // Significant donations
      .map(d => ({
        startMinute: d.minute - 1,
        endMinute: d.minute + 2,
        type: "donation",
        score: Math.min(d.amount / 1000, 1), // Higher donations = higher score
      }));
    moments.push(...donationMoments);
  }

  // Merge overlapping moments, normalize scores
  return mergeAndNormalize(moments);
}

function mergeAndNormalize(moments: MomentCandidate[]): Peak[] {
  // Combine overlapping time ranges
  const merged = [];
  let current = moments[0];

  for (let i = 1; i < moments.length; i++) {
    if (moments[i].startMinute <= current.endMinute) {
      // Merge
      current = {
        ...current,
        endMinute: Math.max(current.endMinute, moments[i].endMinute),
        score: Math.max(current.score, moments[i].score),
        types: [...current.types, moments[i].type],
      };
    } else {
      merged.push(current);
      current = moments[i];
    }
  }
  merged.push(current);

  // Return top 3-5 moments
  return merged.sort((a, b) => b.score - a.score).slice(0, 5);
}
```

### 2.3 Auto-Generated Clip Metadata

**Endpoint:** `POST /api/ai/generate-clip-metadata`

```typescript
interface GenerateClipRequest {
  clipId: number;
  title?: string;
  description?: string;
  momentType: string; // "reaction_spike", "donation", etc.
  streamContext: {
    streamTitle: string;
    streamDate: string;
    djName: string;
    genre: string;
  };
}

interface GenerateClipResponse {
  title: string;
  description: string;
  tags: string[];
  thumbnailPrompt: string; // For image generation
  hashtags: string[];
  callToAction: string;
}
```

**Claude Prompts:**

```
Title Generation (60 chars max):
"Generate a punchy, clickable title for a DJ clip. 
Context: ${streamContext}
Moment: ${momentDescription}
Format: Just the title, no quotes"

Description Generation:
"Write an engaging YouTube description for this DJ clip. 
Include: What happened, why it's cool, call-to-action.
Tone: Hype, energetic, authentic to DJ culture
Length: 150-250 words"

Tag Generation:
"Generate 5-10 relevant tags for this clip.
Categories: music_genre, mood, technique, audience, vibe
Format: Just tags, comma-separated, no hashtags"

Hashtag Generation:
"Generate 5-10 TikTok/Instagram hashtags for this clip.
Make them trending and relevant to DJ culture.
Format: #tag1 #tag2 #tag3..."
```

### 2.4 Thumbnail Generation Fallback

If ML/API fails, use template:
```typescript
function generateThumbnailTemplate(clip: Clip): string {
  const templates = [
    "dj_mixing_red_neon",
    "turntables_spotlight",
    "crowd_reaction_gold",
    "beat_drop_explosion",
    "milestone_celebration",
  ];

  const template = templates[clip.momentType % templates.length];
  return `s3://thumbnails/${template}_${clip.id}.png`;
}
```

### 2.5 Auto-Publish Rules

```typescript
interface AutoPublishConfig {
  minConfidenceScore: 0.8;
  minClipDuration: 30; // seconds
  maxClipDuration: 180; // seconds
  autoPlatforms: ["youtube"]; // Auto-publish to YouTube first
}

async function shouldAutoPublish(clip: Clip, confidence: number): Promise<boolean> {
  return (
    confidence >= 0.8 &&
    clip.duration >= 30 &&
    clip.duration <= 180 &&
    clip.videoUrl !== null
  );
}

async function autoPublishClip(clip: Clip) {
  try {
    const result = await youtubeClient.uploadVideo({
      title: clip.title,
      description: clip.description,
      tags: clip.tags,
      thumbnail: clip.thumbnailUrl,
      visibility: "unlisted", // Start unlisted
    });

    await db.update(autoClips)
      .set({
        published: true,
        youtubeVideoId: result.videoId,
      })
      .where(eq(autoClips.id, clip.id));

    // Notify user
    await notificationService.send({
      userId: clip.creatorId,
      type: "auto_clip_published",
      data: { clipId: clip.id, videoId: result.videoId },
    });
  } catch (error) {
    // Log for manual review
    await logAutoPublishFailure(clip, error);
  }
}
```

### 2.6 Performance Tracking

```typescript
table auto_clips_analytics {
  id: serial PRIMARY KEY
  autoClipId: integer NOT NULL
  metric: varchar -- "views", "clicks", "shares", "watchPercent"
  value: integer
  date: timestamp
  platform: varchar -- "youtube", "tiktok", etc.
}

async function trackClipPerformance(clipId: number, platform: string) {
  const metrics = await youtubeClient.getVideoStats(clipId);

  await db.insert(autoClipsAnalytics).values({
    autoClipId: clipId,
    metric: "views",
    value: metrics.views,
    platform,
    date: new Date(),
  });
}
```

---

## 🛡️ PHASE 3: SPAM DETECTION (Week 2-3)

### 3.1 Overview
Real-time chat filtering to detect and flag spam with minimal false positives (<1%).

**Goals:**
- ✅ Detect 10+ spam types
- ✅ Real-time flagging (<100ms latency)
- ✅ <1% false positive rate
- ✅ Escalating penalties (warn → mute → timeout → ban)
- ✅ Moderator review queue

### 3.2 Spam Detection Rules

```typescript
interface SpamDetectionRule {
  type: string;
  pattern: RegExp | Function;
  confidence: number; // 0-1
  action: "flag" | "hide" | "delete";
  escalation: "warn" | "mute" | "timeout" | "ban";
}

const SPAM_RULES: SpamDetectionRule[] = [
  {
    type: "repeat_copy_paste",
    pattern: (msg, recentMsgs) => {
      const recentText = recentMsgs.map(m => m.text).join(" ");
      return recentText.includes(msg.text) && recentMsgs.length > 0;
    },
    confidence: 0.9,
    action: "hide",
    escalation: "mute",
  },
  {
    type: "suspicious_link",
    pattern: /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl|short\.link|goo\.gl|[a-z0-9]+\.su)/gi,
    confidence: 0.85,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "caps_spam",
    pattern: (msg) => {
      const capsRatio = (msg.match(/[A-Z]/g) || []).length / msg.length;
      return capsRatio > 0.7 && msg.length > 10;
    },
    confidence: 0.6,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "hashtag_spam",
    pattern: (msg) => (msg.match(/#/g) || []).length > 5,
    confidence: 0.75,
    action: "flag",
    escalation: "mute",
  },
  {
    type: "referral_spam",
    pattern: /(?:click here|join|subscribe|referral|promo code|use my link)/gi,
    confidence: 0.8,
    action: "flag",
    escalation: "warn",
  },
  {
    type: "profanity",
    pattern: (msg) => profanityFilter.hasProfanity(msg),
    confidence: 0.95,
    action: "hide",
    escalation: "warn",
  },
];

async function detectSpam(
  message: ChatMessage,
  userHistory: ChatMessage[]
): Promise<SpamDetection[]> {
  const detections: SpamDetection[] = [];

  for (const rule of SPAM_RULES) {
    const matches = typeof rule.pattern === "function"
      ? rule.pattern(message, userHistory)
      : rule.pattern.test(message.text);

    if (matches) {
      detections.push({
        type: rule.type,
        confidence: rule.confidence,
        action: rule.action,
        escalation: rule.escalation,
      });
    }
  }

  return detections;
}
```

### 3.3 User Reputation System

```typescript
interface UserReputation {
  userId: number;
  spamFlags: number;
  falsePositives: number; // Flagged but approved
  reputation: number; // 0-100, degraded with spam
  lastSpamTime: timestamp;
  muteUntil?: timestamp;
  timeoutUntil?: timestamp;
  banned: boolean;
}

async function applySpamPenalty(userId: number, escalation: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const reputation = await db.query.userReputation.findFirst({ where: eq(userReputation.userId, userId) });

  let action = {};
  switch (escalation) {
    case "warn":
      action = { reputation: Math.max(0, reputation.reputation - 5) };
      break;
    case "mute":
      action = { muteUntil: new Date(Date.now() + 5 * 60 * 1000) }; // 5 min
      break;
    case "timeout":
      action = { timeoutUntil: new Date(Date.now() + 30 * 60 * 1000) }; // 30 min
      break;
    case "ban":
      action = { banned: true };
      break;
  }

  await db.update(userReputation)
    .set({ ...action, spamFlags: reputation.spamFlags + 1 })
    .where(eq(userReputation.userId, userId));
}
```

### 3.4 Moderator Review Queue

```typescript
// Endpoint for mod dashboard
GET /api/moderation/spam-queue
Response: {
  total: 42,
  pending: 12,
  reviewed: 30,
  items: [
    {
      id: 123,
      username: "suspiciousUser",
      message: "Check out my link: ...",
      flagType: "suspicious_link",
      confidence: 0.85,
      timestamp: "2026-05-02T10:30:00Z",
      userReputation: 42, // 0-100
      actions: ["approve", "delete", "mute", "ban"]
    }
  ]
}

POST /api/moderation/review-spam
Body: {
  spamFlagId: 123,
  action: "delete",
  reason?: "malicious link"
}
```

### 3.5 Feedback Loop

```typescript
// False positive tracking improves model
async function recordModerationDecision(flagId: number, approved: boolean) {
  const flag = await db.query.spamFlags.findFirst({ where: eq(spamFlags.id, flagId) });

  await db.update(spamFlags)
    .set({
      status: approved ? "approved" : "deleted",
      moderatorReview: true,
      reviewedBy: currentUserId,
      reviewedAt: new Date(),
    })
    .where(eq(spamFlags.id, flagId));

  // Train model on decision
  if (!approved) {
    // Record false positive
    await db.insert(modelFeedback).values({
      messageId: flag.chatMessageId,
      ruleType: flag.flagType,
      decision: "false_positive",
      confidence: flag.confidence,
    });
  }
}
```

---

## 🎯 PHASE 4: RECOMMENDATION ENGINE (Week 3)

### 4.1 Overview
Personalized content recommendations using content-based and collaborative filtering.

**Goals:**
- ✅ 20%+ CTR on recommendations vs random
- ✅ Personalized homepage feed
- ✅ "More Like This" on clip pages
- ✅ Trending content detection
- ✅ A/B testing framework

### 4.2 Recommendation Algorithms

```typescript
interface RecommendationAlgorithm {
  // Content-based: "Users who watched X also watched Y"
  async getRelatedClips(clipId: number): Promise<Clip[]> {
    const clip = await db.query.clips.findFirst({ where: eq(clips.id, clipId) });
    
    // Find clips with similar tags, genre, creation time
    return await db.select()
      .from(clips)
      .where(
        and(
          ne(clips.id, clipId),
          inArray(clips.tags, clip.tags),
          gt(clips.createdAt, new Date(clip.createdAt.getTime() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        )
      )
      .orderBy(desc(clips.views))
      .limit(10);
  }

  // Collaborative filtering: "People like you watched..."
  async getPersonalizedRecs(userId: number): Promise<Clip[]> {
    // Find users with similar watch history
    const similarUsers = await findSimilarUsers(userId);
    
    // Get clips watched by similar users but not by user
    const recs = await db.select()
      .from(clips)
      .where(
        and(
          inArray(clips.creatorId, similarUsers),
          notInArray(
            clips.id,
            db.select(views.clipId).from(views).where(eq(views.userId, userId))
          )
        )
      )
      .orderBy(desc(clips.views))
      .limit(10);

    return recs;
  }

  // Trending: "Trending in your region"
  async getTrendingContent(region?: string): Promise<Clip[]> {
    const period = "7d"; // Last 7 days
    const minViews = 100;

    return await db.select()
      .from(clips)
      .where(
        and(
          gt(clips.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
          gt(clips.views, minViews)
        )
      )
      .orderBy(desc(clips.views))
      .limit(20);
  }
}
```

### 4.3 Recommendation Storage & Tracking

```typescript
// Already in AI schema: recommendations table
table recommendations {
  id: serial PRIMARY KEY
  userId: integer NOT NULL
  recommendedContentId: integer NOT NULL
  contentType: varchar -- "clip", "stream", "user"
  recommendationType: varchar -- "content_based", "collaborative", "trending"
  score: decimal -- 0.0000 to 1.0000
  reason: text
  clicked: boolean DEFAULT false
  impressions: integer DEFAULT 0
  createdAt: timestamp
}

async function trackRecommendationClick(recId: number) {
  await db.update(recommendations)
    .set({ clicked: true })
    .where(eq(recommendations.id, recId));

  // Record in analytics
  await analytics.event("recommendation_clicked", { recommendationId: recId });
}
```

### 4.4 A/B Testing Framework

```typescript
interface ABTest {
  id: string;
  name: string;
  algorithmA: "collaborative" | "content_based" | "trending";
  algorithmB: "collaborative" | "content_based" | "trending";
  splitRatio: number; // 0.5 = 50/50
  metric: "ctr" | "engagement" | "retention";
  startDate: Date;
  endDate: Date;
}

async function assignAlgorithm(userId: number, testId: string): Promise<string> {
  const test = await db.query.abTests.findFirst({ where: eq(abTests.id, testId) });
  
  // Consistent hash for stability
  const hash = hashUserId(userId);
  return hash % 100 < (test.splitRatio * 100) ? "A" : "B";
}

async function getRecommendations(userId: number): Promise<Clip[]> {
  const activeTest = await getActiveTest();
  const algo = await assignAlgorithm(userId, activeTest.id);

  if (algo === "A") {
    return getRelatedClips(lastWatchedClipId);
  } else {
    return getPersonalizedRecs(userId);
  }
}
```

---

## 📝 PHASE 5: AUTO-TRANSCRIPTION & TAGGING (Week 4)

### 5.1 Overview
Full-stream transcription with keyword extraction, auto-tagging, and searchable chapters.

**Goals:**
- ✅ 95%+ transcription accuracy
- ✅ Auto-extracted keywords/concepts
- ✅ Searchable transcript database
- ✅ Auto-chapter generation (topic changes)
- ✅ <2 second latency for transcript search

### 5.2 Whisper API Integration

```typescript
interface TranscriptionRequest {
  audioUrl: string;
  language: "en" | "es" | "fr"; // Default: "en"
  chunkSize: number; // 1200 = 20 min chunks
}

async function transcribeStream(
  liveSessionId: number,
  audioUrl: string
): Promise<StreamTranscript> {
  const chunks = chunkAudio(audioUrl, 1200); // 20-min chunks
  let fullTranscript = "";
  const segments = [];

  for (const chunk of chunks) {
    const response = await openaiClient.audio.transcriptions.create({
      model: "whisper-1",
      file: chunk,
      language: "en",
      response_format: "verbose_json",
      temperature: 0.2,
    });

    fullTranscript += response.text;
    segments.push(...response.segments);
  }

  // Extract keywords using Claude
  const keywords = await extractKeywords(fullTranscript);
  
  // Generate chapters (detect topic changes)
  const chapters = await generateChapters(segments);

  // Store in database
  const transcript = await db.insert(streamTranscripts).values({
    liveSessionId,
    fullText: fullTranscript,
    sourceType: "whisper",
    language: "en",
    duration: calculateDuration(segments),
  });

  // Store tags
  for (const keyword of keywords) {
    await db.insert(streamTags).values({
      liveSessionId,
      tagType: keyword.type, // "song", "artist", "topic", "announcement"
      tagValue: keyword.value,
      confidence: keyword.confidence,
    });
  }

  return transcript;
}
```

### 5.3 Keyword Extraction (Claude API)

**Claude Prompt:**
```
Extract key topics, songs, artists, and announcements from this stream transcript.

Transcript (first 5000 chars):
${transcript}

For each keyword, provide:
1. Type: "song", "artist", "topic", "announcement", "guest", "technical_issue"
2. Confidence: 0.0-1.0
3. Timestamp: When mentioned (HH:MM:SS)

Return JSON:
{
  "keywords": [
    {
      "type": "song",
      "value": "Song Name",
      "artist": "Artist Name",
      "confidence": 0.95,
      "timestamp": "02:15:30"
    }
  ]
}
```

### 5.4 Auto-Chapter Generation

```typescript
async function generateChapters(segments: Segment[]): Promise<Chapter[]> {
  // Analyze transcript for topic changes
  const topicBoundaries = detectTopicChanges(segments);
  
  const chapters: Chapter[] = topicBoundaries.map((boundary, idx) => {
    const chapterSegments = segments.slice(boundary.start, boundary.end);
    const chapterText = chapterSegments.map(s => s.text).join(" ");

    // Use Claude to generate chapter title
    const title = generateChapterTitle(chapterText);

    return {
      index: idx,
      startTime: formatTime(boundary.timestamp),
      title,
      summary: chapterText.substring(0, 200) + "...",
    };
  });

  return chapters;
}

function detectTopicChanges(segments: Segment[]): TopicBoundary[] {
  // Use simple heuristic: Long pause (>30 sec) or explicit announcement
  // Could be enhanced with ML model
  const boundaries = [];
  
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - segments[i - 1].end;
    if (gap > 30) {
      boundaries.push({ start: i, timestamp: segments[i].start });
    }
  }

  return boundaries;
}
```

### 5.5 Transcript Search

```typescript
// POST /api/search/transcripts
interface TranscriptSearchRequest {
  query: string;
  liveSessionId?: number;
  limit?: number;
}

interface TranscriptSearchResult {
  segment: {
    timestamp: string;
    text: string;
  };
  context: string; // 50 chars before/after
  confidence: number;
}

async function searchTranscripts(query: string, limit = 10): Promise<TranscriptSearchResult[]> {
  // Full-text search on streamTranscripts.fullText
  const results = await db.select()
    .from(streamTranscripts)
    .where(like(streamTranscripts.fullText, `%${query}%`))
    .limit(limit);

  return results.map(transcript => ({
    segment: {
      timestamp: findTimestampInSegments(transcript.segments, query),
      text: extractSegmentText(transcript.segments, query),
    },
    context: extractContext(transcript.fullText, query),
    confidence: 0.9, // Full-text search confidence
  }));
}
```

---

## 🤖 PHASE 6: SMART MODERATION (Week 4-5)

### 6.1 Overview
AI-powered content moderation with toxicity detection, context-awareness, and confidence scores.

**Goals:**
- ✅ 90%+ of mod suggestion actions approved
- ✅ Detect harassment patterns (multi-message context)
- ✅ Context-aware (sports/gaming banter vs harassment)
- ✅ Confidence scores for each flag
- ✅ 1-click mod actions

### 6.2 Toxicity Detection (Perspective API)

```typescript
interface ToxicityScores {
  TOXICITY: number; // 0-1
  SEVERE_TOXICITY: number;
  IDENTITY_ATTACK: number;
  INSULT: number;
  PROFANITY: number;
  THREAT: number;
  SEXUALLY_EXPLICIT: number;
  FLIRTATION: number;
  SPAM: number;
}

async function analyzeToxicity(message: string): Promise<ToxicityScores> {
  const response = await perspectiveClient.comments.analyze({
    comment: { text: message },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      IDENTITY_ATTACK: {},
      INSULT: {},
      PROFANITY: {},
      THREAT: {},
      SEXUALLY_EXPLICIT: {},
      FLIRTATION: {},
      SPAM: {},
    },
  });

  return response.attributeScores;
}

async function detectViolation(message: string, context: ChatMessage[]): Promise<ModerationFlag | null> {
  const scores = await analyzeToxicity(message);
  const contextScores = context.map(m => ({ message: m.text, scores: analyzeToxicity(m.text) }));

  // Single message violation
  if (scores.TOXICITY > 0.8 || scores.SEVERE_TOXICITY > 0.6) {
    return createModerationFlag(
      message,
      "toxicity",
      Math.max(scores.TOXICITY, scores.SEVERE_TOXICITY)
    );
  }

  // Harassment pattern (multiple messages attacking same user)
  const targetedMessages = context.filter(m => m.mentionsUser === targetUser);
  if (targetedMessages.length >= 3 && targetedMessages.every(m => m.score > 0.5)) {
    return createModerationFlag(
      message,
      "harassment",
      0.85
    );
  }

  return null;
}
```

### 6.3 Context-Aware Moderation

```typescript
interface ModerationContext {
  streamGenre: string; // "gaming", "sports", "music", "irl"
  streamTone: "competitive" | "casual" | "family-friendly";
  userReputation: number; // 0-100
  messageContext: string; // Previous 3 messages
}

async function shouldFlag(
  message: string,
  toxicityScores: ToxicityScores,
  context: ModerationContext
): Promise<boolean> {
  // Gaming streams allow more banter
  if (context.streamGenre === "gaming" && toxicityScores.INSULT > 0.5 && toxicityScores.INSULT < 0.8) {
    // Check if it's directed at player in-stream
    if (!message.includes("@")) {
      return false; // Likely banter about game, not harassment
    }
  }

  // Family-friendly streams have lower threshold
  if (context.streamTone === "family-friendly" && toxicityScores.PROFANITY > 0.6) {
    return true;
  }

  // High-reputation users get benefit of doubt
  if (context.userReputation > 80 && toxicityScores.TOXICITY < 0.7) {
    return false;
  }

  return toxicityScores.TOXICITY > 0.75;
}
```

### 6.4 Moderation Action Suggestions

```typescript
interface ModerationSuggestion {
  flagId: number;
  action: "warn" | "hide" | "delete" | "mute" | "timeout" | "ban";
  reason: string;
  confidence: number;
  quickActionButtons: Array<{
    label: string;
    action: string;
    color: "red" | "yellow" | "gray";
  }>;
}

async function createModerationSuggestion(flag: ModerationFlag): Promise<ModerationSuggestion> {
  const violationType = flag.violationType;
  const confidence = flag.confidence;

  let action: ModerationSuggestion["action"];
  if (confidence > 0.9) {
    action = "delete";
  } else if (confidence > 0.8) {
    action = "hide";
  } else {
    action = "flag"; // Needs review
  }

  return {
    flagId: flag.id,
    action,
    reason: `${violationType} detected (confidence: ${(confidence * 100).toFixed(0)}%)`,
    confidence,
    quickActionButtons: [
      { label: "Approve", action: "approve", color: "gray" },
      { label: "Hide", action: "hide", color: "yellow" },
      { label: "Delete", action: "delete", color: "red" },
      { label: "Mute User", action: "mute", color: "red" },
    ],
  };
}
```

### 6.5 False Positive Recovery

```typescript
// Track mod decisions for model improvement
async function recordModerationDecision(
  flagId: number,
  decision: "approved" | "reversed",
  moderatorId: number
) {
  const flag = await db.query.moderationFlags.findFirst({ where: eq(moderationFlags.id, flagId) });

  if (decision === "reversed") {
    // Was incorrectly flagged (false positive)
    await db.insert(modelFeedback).values({
      messageId: flag.chatMessageId,
      originalConfidence: flag.confidence,
      feedback: "false_positive",
      violationType: flag.violationType,
      timestamp: new Date(),
    });

    // Reduce future confidence for similar patterns
    // (Could trigger model retraining)
  }

  await db.update(moderationFlags)
    .set({
      status: decision === "approved" ? "approved" : "safe",
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
    })
    .where(eq(moderationFlags.id, flagId));
}
```

---

## 📊 PHASE 7: PREDICTIVE ANALYTICS (Week 5)

### 7.1 Overview
Forecast audience dynamics, subscriber churn, trending content, and revenue.

**Goals:**
- ✅ 85%+ accuracy for audience size prediction
- ✅ Identify at-risk subscribers for retention campaigns
- ✅ Forecast content performance before launch
- ✅ Recommend optimal posting times
- ✅ Forecast revenue by product type

### 7.2 Audience Size Prediction

```typescript
async function predictAudienceSize(streamMetadata: {
  title: string;
  genre: string;
  scheduledTime: Date;
  dayOfWeek: number;
  hoursFromPeak: number;
  recentAverageViewers: number;
}): Promise<{
  predictedViewers: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number }>;
}> {
  // Historical data
  const historicalStreams = await db.select()
    .from(streams)
    .where(
      and(
        eq(streams.genre, streamMetadata.genre),
        gt(streams.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      )
    );

  // ML model: Linear regression with features
  const features = {
    genrePopularity: calculateGenrePopularity(streamMetadata.genre),
    dayOfWeekMultiplier: getDayOfWeekMultiplier(streamMetadata.dayOfWeek),
    timeOfDayMultiplier: getTimeOfDayMultiplier(streamMetadata.scheduledTime),
    recentTrendingScore: await calculateTrendingScore(streamMetadata.genre),
    followerGrowthRate: await calculateFollowerGrowth(),
  };

  const prediction = await mlModel.predict({
    baseAudience: streamMetadata.recentAverageViewers,
    features,
  });

  return {
    predictedViewers: prediction.viewers,
    confidence: prediction.confidence,
    factors: [
      { factor: "Day of week", impact: features.dayOfWeekMultiplier - 1 },
      { factor: "Time of day", impact: features.timeOfDayMultiplier - 1 },
      { factor: "Trending content", impact: features.recentTrendingScore },
      { factor: "Follower growth", impact: features.followerGrowthRate },
    ],
  };
}
```

### 7.3 Churn Prediction

```typescript
async function predictChurnRisk(userId: number): Promise<{
  riskScore: number; // 0-1
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  recommendedAction: string;
}> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const engagement = await calculateEngagementMetrics(userId);

  const factors = [];
  let riskScore = 0;

  // Last engagement >7 days ago
  if (engagement.daysLastEngaged > 7) {
    factors.push("No engagement in 7+ days");
    riskScore += 0.3;
  }

  // Declining engagement trend
  if (engagement.trendSlope < 0 && Math.abs(engagement.trendSlope) > 0.1) {
    factors.push("Declining engagement trend");
    riskScore += 0.25;
  }

  // Low interaction rate
  if (engagement.interactionRate < 0.05) {
    factors.push("Low interaction rate");
    riskScore += 0.2;
  }

  // Subscription renewal approaching
  if (user.subscriptionRenewDate && daysUntil(user.subscriptionRenewDate) < 7) {
    factors.push("Subscription renewal soon");
    riskScore += 0.15;
  }

  const riskLevel = riskScore > 0.7 ? "high" : riskScore > 0.4 ? "medium" : "low";

  let recommendedAction = "";
  if (riskLevel === "high") {
    recommendedAction = "Send personalized retention offer or exclusive content";
  } else if (riskLevel === "medium") {
    recommendedAction = "Increase engagement touch points (emails, notifications)";
  }

  await db.insert(churnPredictions).values({
    userId,
    riskScore,
    riskFactors: factors,
    recommendedAction,
    modelVersion: "1.0",
  });

  return { riskScore, riskLevel, factors, recommendedAction };
}
```

### 7.4 Content Performance Prediction

```typescript
async function predictContentPerformance(clipMetadata: {
  title: string;
  genre: string;
  tags: string[];
  description: string;
}): Promise<{
  predictedViews: number;
  predictedEngagementRate: number;
  estimatedRevenue: number;
  timing: string;
}> {
  // Analyze historical clips with similar metadata
  const similarClips = await findSimilarClips(clipMetadata);
  const avgMetrics = calculateAverageMetrics(similarClips);

  // Sentiment analysis of title/description
  const titleSentiment = await analyzeSentiment(clipMetadata.title);
  const titleEngagementMultiplier = getTitleEngagementScore(clipMetadata.title);

  const prediction = {
    predictedViews: avgMetrics.avgViews * titleEngagementMultiplier,
    predictedEngagementRate: avgMetrics.avgEngagementRate,
    estimatedRevenue: avgMetrics.avgViews * 0.0015, // $0.0015 CPM estimate
    timing: getOptimalPostingTime(clipMetadata.genre),
  };

  return prediction;
}

function getTitleEngagementScore(title: string): number {
  // Titles with power words perform better
  const powerWords = ["INSANE", "REACTION", "EPIC", "FAIL", "BEST", "IMPOSSIBLE"];
  let score = 1.0;

  for (const word of powerWords) {
    if (title.toUpperCase().includes(word)) {
      score *= 1.2;
    }
  }

  // Optimal title length is 45-60 chars
  if (title.length < 40 || title.length > 70) {
    score *= 0.9;
  }

  return Math.min(score, 2.0); // Cap at 2x multiplier
}
```

### 7.5 Optimal Posting Times

```typescript
async function getOptimalPostingTime(genre: string): Promise<string> {
  // Analyze when similar content performs best
  const genrePerformance = await db.select()
    .from(clips)
    .where(inArray(clips.tags, [genre]))
    .orderBy(desc(clips.createdAt))
    .limit(100);

  const hourlyPerformance = {};
  for (const clip of genrePerformance) {
    const hour = clip.createdAt.getHours();
    hourlyPerformance[hour] = (hourlyPerformance[hour] || 0) + clip.views;
  }

  const peakHour = Object.entries(hourlyPerformance)
    .sort(([, a], [, b]) => b - a)[0][0];

  return `${peakHour}:00`;
}
```

---

## 🔧 INTEGRATION & DEPLOYMENT

### API Routes to Implement

```
# AI/Automation Endpoints
POST   /api/ai/summarize-chat          # Chat summarization
POST   /api/ai/generate-clip-metadata  # Auto-clip titles/descriptions
POST   /api/ai/detect-peak-moments     # Peak detection algorithm
POST   /api/ai/transcribe-stream       # Whisper transcription
POST   /api/ai/extract-keywords        # Keyword extraction
POST   /api/ai/predict-audience        # Audience prediction
POST   /api/ai/predict-churn           # Churn prediction
POST   /api/ai/predict-content-perf    # Content performance prediction

# Moderation
POST   /api/moderation/analyze         # Toxicity + spam analysis
GET    /api/moderation/queue           # Mod review queue
POST   /api/moderation/review          # Action on flag
GET    /api/moderation/dashboard       # Mod stats

# Recommendations
GET    /api/recommendations/personalized    # Per-user recs
GET    /api/recommendations/trending       # Trending content
GET    /api/recommendations/related/:id    # Related clips

# Transcripts
GET    /api/transcripts/:sessionId     # Full transcript
GET    /api/search/transcripts         # Transcript search
GET    /api/transcripts/:sessionId/chapters  # Auto-chapters
```

### Environment Variables

```
# Claude API
ANTHROPIC_API_KEY=sk_...
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_MAX_TOKENS=4096
CLAUDE_RATE_LIMIT_RPM=60
CLAUDE_RATE_LIMIT_TPM=1000000

# OpenAI (Whisper)
OPENAI_API_KEY=sk-...

# Google (Perspective API)
PERSPECTIVE_API_KEY=...

# Feature Flags
ENABLE_CHAT_SUMMARIES=true
ENABLE_AUTO_CLIPS=true
ENABLE_SPAM_DETECTION=true
ENABLE_SMART_MODERATION=true
ENABLE_RECOMMENDATIONS=true
ENABLE_TRANSCRIPTION=true
ENABLE_PREDICTIVE_ANALYTICS=true

# Model Versions
TOXICITY_MODEL_VERSION=1.0
SPAM_MODEL_VERSION=1.0
CHURN_MODEL_VERSION=1.0
```

---

## ✅ Success Metrics & Validation

### Phase 1: Chat Summarization
- **Metric:** Accuracy score via user review
- **Target:** 95%+ accuracy (subjective quality)
- **Validation:** Random sample 10 summaries/week, rate 1-5 stars

### Phase 2: Auto-Clip Generation
- **Metrics:** Clip views, CTR, watch-through rate
- **Target:** 2-3 clips per 4-hour stream, 80%+ confidence
- **Validation:** Compare auto-clip performance to manual clips

### Phase 3: Spam Detection
- **Metrics:** Precision, recall, false positive rate
- **Target:** 99% spam detection, <1% false positive
- **Validation:** A/B test with manual moderation

### Phase 4: Recommendations
- **Metrics:** Click-through rate, engagement time
- **Target:** 20%+ CTR vs random, +30% watch time
- **Validation:** A/B test algorithms, track user behavior

### Phase 5: Transcription
- **Metrics:** Transcription accuracy, search latency
- **Target:** 95%+ accuracy, <200ms search latency
- **Validation:** Manual audit of transcripts, benchmark search

### Phase 6: Smart Moderation
- **Metrics:** Mod approval rate, false positive rate
- **Target:** 90%+ mod actions approved, <5% reversals
- **Validation:** Track moderator decisions and feedback

### Phase 7: Predictive Analytics
- **Metrics:** Prediction accuracy, revenue impact
- **Target:** 85%+ accuracy for audience, +15% revenue optimization
- **Validation:** Compare predicted vs actual, measure retention lift

---

## 🚨 Critical Safeguards

### Rate Limiting (Claude API)
- **Max:** 60 requests/min, 1M tokens/min
- **Backoff:** Exponential (1s → 30s max)
- **Queue:** Serial processing to avoid thundering herd

### Cost Management
- **Estimated monthly cost:** $500-1,500 (Claude, Whisper, Perspective)
- **Optimization:** Cache summaries, batch transcription, sample moderation
- **Fallback:** Disable features if costs exceed threshold

### Content Safety
- **Bias testing:** Audit for demographic biases in recommendations
- **Toxicity:** Flag AI-generated content for review before publishing
- **Privacy:** Anonymize user data in analytics

### Error Handling
- **Graceful degradation:** All features have fallbacks
- **User communication:** Be transparent about AI-generated content
- **Monitoring:** Track API health, error rates, latency

---

## 📈 Rollout Strategy

**Week 1:** Deploy chat summarization + monitoring
**Week 2:** Add auto-clip generation + spam detection
**Week 3:** Add recommendations + transcription
**Week 4:** Add smart moderation + predictive analytics
**Week 5:** Full suite launch + optimization

Each phase includes:
- Comprehensive logging & monitoring
- User feedback collection
- Performance optimization
- Documentation & training

---

## 📚 References

- Claude API: https://docs.anthropic.com/
- Whisper API: https://platform.openai.com/docs/guides/speech-to-text
- Perspective API: https://perspectiveapi.com/
- Drizzle ORM: https://orm.drizzle.team/
- Token counting: https://github.com/openai/js-tiktoken

---

**Next Steps:**
1. Set up environment variables
2. Implement Claude API client with rate limiting
3. Create API endpoints (starting with chat summarization)
4. Deploy to production
5. Collect metrics and iterate
