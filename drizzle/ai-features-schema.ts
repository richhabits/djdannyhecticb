/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI-Powered Features Database Schema
 * Includes: Chat Summaries, Thumbnails, Spam Detection, Recommendations, Transcripts, Moderation
 */

import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  json,
  serial,
  index,
  unique,
  decimal,
} from "drizzle-orm/pg-core";

// ==========================================
// ENUMS
// ==========================================
export const spamFlagsEnum = pgEnum("spam_flag_status", [
  "clean",
  "flagged",
  "approved",
  "deleted",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "safe",
  "flagged",
  "toxic",
  "reviewed",
  "approved",
  "deleted",
]);

export const clipThumbnailStatusEnum = pgEnum("clip_thumbnail_status", [
  "generating",
  "generated",
  "selected",
  "published",
  "archived",
]);

export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "content_based",
  "collaborative",
  "trending",
  "personalized",
]);

// ==========================================
// CHAT SUMMARIES
// ==========================================
export const chatSummaries = pgTable(
  "chat_summaries",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    summary: text("summary").notNull(), // 2-3 sentence summary
    topics: json("topics").$type<string[]>().default([]).notNull(), // ["topic1", "topic2"]
    sentiment: varchar("sentiment", { length: 50 }).default("neutral").notNull(), // positive, negative, neutral
    topMoments: json("top_moments").$type<Array<{ time: string; description: string; engagement: number }>>().default([]).notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    viewerSentiment: json("viewer_sentiment").$type<{ positive: number; neutral: number; negative: number }>().default({ positive: 0, neutral: 0, negative: 0 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("chat_summaries_session_idx").on(table.liveSessionId),
    timeIdx: index("chat_summaries_time_idx").on(table.startTime),
  })
);

export type ChatSummary = typeof chatSummaries.$inferSelect;
export type InsertChatSummary = typeof chatSummaries.$inferInsert;

// ==========================================
// SPAM DETECTION & FILTERING
// ==========================================
export const spamFlags = pgTable(
  "spam_flags",
  {
    id: serial("id").primaryKey(),
    chatMessageId: integer("chat_message_id").notNull(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    flagType: varchar("flag_type", { length: 100 }).notNull(), // "repeat_copy_paste", "suspicious_link", "caps_spam", "hashtag_spam", "referral_spam", "profanity"
    confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
    reason: text("reason"),
    status: spamFlagsEnum("status").default("flagged").notNull(),
    moderatorReview: boolean("moderator_review").default(false).notNull(),
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    messageIdx: index("spam_flags_message_idx").on(table.chatMessageId),
    sessionIdx: index("spam_flags_session_idx").on(table.liveSessionId),
    userIdx: index("spam_flags_user_idx").on(table.userId),
    statusIdx: index("spam_flags_status_idx").on(table.status),
  })
);

export type SpamFlag = typeof spamFlags.$inferSelect;
export type InsertSpamFlag = typeof spamFlags.$inferInsert;

// ==========================================
// SMART MODERATION
// ==========================================
export const moderationFlags = pgTable(
  "moderation_flags",
  {
    id: serial("id").primaryKey(),
    chatMessageId: integer("chat_message_id").notNull(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    violationType: varchar("violation_type", { length: 100 }).notNull(), // "profanity", "harassment", "hate_speech", "spam", "threats", "misinformation"
    confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
    reason: text("reason"),
    status: moderationStatusEnum("status").default("flagged").notNull(),
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at"),
    modelVersion: varchar("model_version", { length: 50 }).default("1.0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    messageIdx: index("moderation_flags_message_idx").on(table.chatMessageId),
    sessionIdx: index("moderation_flags_session_idx").on(table.liveSessionId),
    userIdx: index("moderation_flags_user_idx").on(table.userId),
    statusIdx: index("moderation_flags_status_idx").on(table.status),
  })
);

export type ModerationFlag = typeof moderationFlags.$inferSelect;
export type InsertModerationFlag = typeof moderationFlags.$inferInsert;

// ==========================================
// CLIP THUMBNAILS
// ==========================================
export const clipThumbnails = pgTable(
  "clip_thumbnails",
  {
    id: serial("id").primaryKey(),
    clipId: integer("clip_id").notNull(),
    imageUrl: varchar("image_url", { length: 512 }).notNull(),
    imagePrompt: text("image_prompt"),
    generatedBy: varchar("generated_by", { length: 100 }).default("ai").notNull(), // "ai" or "user"
    status: clipThumbnailStatusEnum("status").default("generated").notNull(),
    isSelected: boolean("is_selected").default(false).notNull(),
    clickCount: integer("click_count").default(0).notNull(),
    ctr: decimal("ctr", { precision: 5, scale: 4 }).default("0"), // Click-through rate
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    clipIdx: index("clip_thumbnails_clip_idx").on(table.clipId),
    selectedIdx: index("clip_thumbnails_selected_idx").on(table.isSelected),
  })
);

export type ClipThumbnail = typeof clipThumbnails.$inferSelect;
export type InsertClipThumbnail = typeof clipThumbnails.$inferInsert;

// ==========================================
// RECOMMENDATIONS
// ==========================================
export const recommendations = pgTable(
  "recommendations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    recommendedContentId: integer("recommended_content_id").notNull(), // clip_id or stream_id
    contentType: varchar("content_type", { length: 50 }).notNull(), // "clip", "stream", "user"
    recommendationType: recommendationTypeEnum("recommendation_type").notNull(),
    score: decimal("score", { precision: 5, scale: 4 }).notNull(), // 0.0000 to 1.0000
    reason: text("reason"), // "Because you liked X", "Similar to your interests"
    clicked: boolean("clicked").default(false).notNull(),
    impressions: integer("impressions").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("recommendations_user_idx").on(table.userId),
    contentIdx: index("recommendations_content_idx").on(table.recommendedContentId),
    typeIdx: index("recommendations_type_idx").on(table.contentType),
  })
);

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

// ==========================================
// STREAM TRANSCRIPTS & TAGS
// ==========================================
export const streamTranscripts = pgTable(
  "stream_transcripts",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull().unique(),
    fullText: text("full_text").notNull(),
    sourceType: varchar("source_type", { length: 50 }).default("whisper").notNull(),
    language: varchar("language", { length: 20 }).default("en").notNull(),
    duration: integer("duration"), // in seconds
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("stream_transcripts_session_idx").on(table.liveSessionId),
  })
);

export type StreamTranscript = typeof streamTranscripts.$inferSelect;
export type InsertStreamTranscript = typeof streamTranscripts.$inferInsert;

export const streamTags = pgTable(
  "stream_tags",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    tagType: varchar("tag_type", { length: 50 }).notNull(), // "song", "artist", "guest", "announcement", "topic"
    tagValue: varchar("tag_value", { length: 255 }).notNull(),
    timestamp: varchar("timestamp", { length: 20 }), // format: "HH:MM:SS"
    confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("stream_tags_session_idx").on(table.liveSessionId),
    typeIdx: index("stream_tags_type_idx").on(table.tagType),
    valueIdx: index("stream_tags_value_idx").on(table.tagValue),
  })
);

export type StreamTag = typeof streamTags.$inferSelect;
export type InsertStreamTag = typeof streamTags.$inferInsert;

// ==========================================
// AUTO-GENERATED CLIPS
// ==========================================
export const autoClips = pgTable(
  "auto_clips",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    clipId: integer("clip_id"), // Reference to actual clip after creation
    momentType: varchar("moment_type", { length: 100 }).notNull(), // "reaction_spike", "donation_spike", "viewer_milestone", "poll_result", "announcement", "song_drop"
    momentTime: timestamp("moment_time").notNull(),
    clippedStartTime: timestamp("clipped_start_time"),
    clippedEndTime: timestamp("clipped_end_time"),
    title: varchar("title", { length: 255 }),
    description: text("description"),
    autoGenerated: boolean("auto_generated").default(true).notNull(),
    published: boolean("published").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("auto_clips_session_idx").on(table.liveSessionId),
    publishedIdx: index("auto_clips_published_idx").on(table.published),
    momentTypeIdx: index("auto_clips_moment_type_idx").on(table.momentType),
  })
);

export type AutoClip = typeof autoClips.$inferSelect;
export type InsertAutoClip = typeof autoClips.$inferInsert;

// ==========================================
// PREDICTIVE ANALYTICS
// ==========================================
export const churnPredictions = pgTable(
  "churn_predictions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    riskScore: decimal("risk_score", { precision: 3, scale: 2 }).notNull(), // 0.00 to 1.00
    riskFactors: json("risk_factors").$type<string[]>().default([]).notNull(),
    lastEngagementDays: integer("last_engagement_days"),
    recommendedAction: text("recommended_action"),
    modelVersion: varchar("model_version", { length: 50 }).default("1.0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("churn_predictions_user_idx").on(table.userId),
    riskIdx: index("churn_predictions_risk_idx").on(table.riskScore),
  })
);

export type ChurnPrediction = typeof churnPredictions.$inferSelect;
export type InsertChurnPrediction = typeof churnPredictions.$inferInsert;

export const contentAnalytics = pgTable(
  "content_analytics",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    contentType: varchar("content_type", { length: 50 }).notNull(), // "stream", "clip", "vod"
    viewerRetention: json("viewer_retention").$type<{ minute: number; retention: number }[]>().default([]).notNull(),
    engagementScore: decimal("engagement_score", { precision: 5, scale: 4 }),
    revenuePrediction: numeric("revenue_prediction", { precision: 10, scale: 2 }),
    revenueActual: numeric("revenue_actual", { precision: 10, scale: 2 }),
    predictions: json("predictions").$type<Record<string, any>>().default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("content_analytics_session_idx").on(table.liveSessionId),
  })
);

export type ContentAnalytics = typeof contentAnalytics.$inferSelect;
export type InsertContentAnalytics = typeof contentAnalytics.$inferInsert;
