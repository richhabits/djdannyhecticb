/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Live Streaming Engagement Features - Database Schema
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
  primaryKey,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// ENUMS
// ==========================================
export const userBadgeTypeEnum = pgEnum("user_badge_type", [
  "subscriber",
  "moderator",
  "founder",
  "first_100",
  "first_1000",
  "donation_100",
  "donation_500",
  "donation_1000",
  "vip",
  "banned",
  "muted",
  "warned",
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "fire",
  "love",
  "hype",
  "laugh",
  "sad",
  "angry",
  "thinking",
]);

export const pollStatusEnum = pgEnum("poll_status", [
  "active",
  "closed",
  "archived",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "follower",
  "subscriber",
  "donation",
  "milestone",
  "raid",
  "host",
]);

// ==========================================
// LIVE SESSIONS
// ==========================================
export const liveSessions = pgTable(
  "live_sessions",
  {
    id: serial("id").primaryKey(),
    streamerUserId: integer("streamer_user_id").notNull(),
    platformType: varchar("platform_type", { length: 50 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    isLive: boolean("is_live").default(false).notNull(),
    viewerCount: integer("viewer_count").default(0).notNull(),
    totalTips: numeric("total_tips", { precision: 10, scale: 2 }).default("0").notNull(),
    startedAt: timestamp("started_at").notNull(),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    streamerIdx: index("live_sessions_streamer_idx").on(table.streamerUserId),
    isLiveIdx: index("live_sessions_is_live_idx").on(table.isLive),
  })
);

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = typeof liveSessions.$inferInsert;

// ==========================================
// CHAT MESSAGES
// ==========================================
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    message: text("message").notNull(),
    usernameColor: varchar("username_color", { length: 7 }).default("#ffffff").notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    deletedBy: integer("deleted_by"),
    deletedReason: varchar("deleted_reason", { length: 255 }),
    emotes: json("emotes").$type<{ id: string; name: string; url: string }[]>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("chat_messages_session_idx").on(table.liveSessionId),
    userIdx: index("chat_messages_user_idx").on(table.userId),
    pinnedIdx: index("chat_messages_pinned_idx").on(table.isPinned),
    createdIdx: index("chat_messages_created_idx").on(table.createdAt),
  })
);

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ==========================================
// USER BADGES
// ==========================================
export const userBadges = pgTable(
  "user_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    badgeType: userBadgeTypeEnum("badge_type").notNull(),
    liveSessionId: integer("live_session_id"),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
    metadata: json("metadata").$type<Record<string, any>>().default({}),
  },
  (table) => ({
    userIdx: index("user_badges_user_idx").on(table.userId),
    badgeTypeIdx: index("user_badges_type_idx").on(table.badgeType),
    sessionIdx: index("user_badges_session_idx").on(table.liveSessionId),
    userBadgeUnique: unique("user_badges_user_type_session_unique").on(
      table.userId,
      table.badgeType,
      table.liveSessionId
    ),
  })
);

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

// ==========================================
// DONATIONS
// ==========================================
export const donations = pgTable(
  "donations",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    message: text("message"),
    stripePaymentId: varchar("stripe_payment_id", { length: 255 }).unique(),
    stripeChargeId: varchar("stripe_charge_id", { length: 255 }).unique(),
    status: varchar("status", { length: 50 }).default("completed").notNull(), // pending, completed, failed, refunded
    tipJar: boolean("tip_jar").default(false).notNull(),
    anonymous: boolean("anonymous").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("donations_session_idx").on(table.liveSessionId),
    userIdx: index("donations_user_idx").on(table.userId),
    statusIdx: index("donations_status_idx").on(table.status),
    stripePaymentIdx: index("donations_stripe_payment_idx").on(table.stripePaymentId),
    createdIdx: index("donations_created_idx").on(table.createdAt),
  })
);

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

// ==========================================
// REACTIONS
// ==========================================
export const reactions = pgTable(
  "reactions",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    reactionType: reactionTypeEnum("reaction_type").notNull(),
    count: integer("count").default(1).notNull(), // For combo tracking
    comboStreak: integer("combo_streak").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("reactions_session_idx").on(table.liveSessionId),
    userIdx: index("reactions_user_idx").on(table.userId),
    typeIdx: index("reactions_type_idx").on(table.reactionType),
    createdIdx: index("reactions_created_idx").on(table.createdAt),
  })
);

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

// ==========================================
// POLLS
// ==========================================
export const polls = pgTable(
  "polls",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    createdBy: integer("created_by").notNull(),
    question: varchar("question", { length: 255 }).notNull(),
    options: json("options").$type<string[]>().notNull(),
    status: pollStatusEnum("status").default("active").notNull(),
    totalVotes: integer("total_votes").default(0).notNull(),
    voteCounts: json("vote_counts").$type<Record<string, number>>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    closedAt: timestamp("closed_at"),
  },
  (table) => ({
    sessionIdx: index("polls_session_idx").on(table.liveSessionId),
    statusIdx: index("polls_status_idx").on(table.status),
  })
);

export type Poll = typeof polls.$inferSelect;
export type InsertPoll = typeof polls.$inferInsert;

// ==========================================
// POLL VOTES
// ==========================================
export const pollVotes = pgTable(
  "poll_votes",
  {
    id: serial("id").primaryKey(),
    pollId: integer("poll_id").notNull(),
    userId: integer("user_id").notNull(),
    optionIndex: integer("option_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pollIdx: index("poll_votes_poll_idx").on(table.pollId),
    userIdx: index("poll_votes_user_idx").on(table.userId),
    userPollUnique: unique("poll_votes_user_poll_unique").on(
      table.userId,
      table.pollId
    ),
  })
);

export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = typeof pollVotes.$inferInsert;

// ==========================================
// LEADERBOARDS
// ==========================================
export const leaderboards = pgTable(
  "leaderboards",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id").notNull(),
    totalDonations: numeric("total_donations", { precision: 10, scale: 2 }).default("0").notNull(),
    messageCount: integer("message_count").default(0).notNull(),
    reactionCount: integer("reaction_count").default(0).notNull(),
    streakDays: integer("streak_days").default(0).notNull(),
    rank: integer("rank").default(0).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("leaderboards_session_idx").on(table.liveSessionId),
    userIdx: index("leaderboards_user_idx").on(table.userId),
    donationIdx: index("leaderboards_donation_idx").on(table.totalDonations),
    rankIdx: index("leaderboards_rank_idx").on(table.rank),
  })
);

export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;

// ==========================================
// NOTIFICATIONS
// ==========================================
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    liveSessionId: integer("live_session_id").notNull(),
    userId: integer("user_id"),
    notificationType: notificationTypeEnum("notification_type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    metadata: json("metadata").$type<Record<string, any>>().default({}),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("notifications_session_idx").on(table.liveSessionId),
    userIdx: index("notifications_user_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.notificationType),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ==========================================
// STREAMER STATS (Cached for performance)
// ==========================================
export const streamerStats = pgTable(
  "streamer_stats",
  {
    id: serial("id").primaryKey(),
    streamerUserId: integer("streamer_user_id").notNull().unique(),
    totalViewers: integer("total_viewers").default(0).notNull(),
    totalTips24h: numeric("total_tips_24h", { precision: 10, scale: 2 }).default("0").notNull(),
    totalTipsAllTime: numeric("total_tips_all_time", { precision: 10, scale: 2 }).default("0").notNull(),
    totalFollowers: integer("total_followers").default(0).notNull(),
    totalSubscribers: integer("total_subscribers").default(0).notNull(),
    streakDays: integer("streak_days").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    experience: integer("experience").default(0).notNull(),
    badges: json("badges").$type<string[]>().default([]),
    lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  },
  (table) => ({
    streamerIdx: index("streamer_stats_streamer_idx").on(table.streamerUserId),
  })
);

export type StreamerStats = typeof streamerStats.$inferSelect;
export type InsertStreamerStats = typeof streamerStats.$inferInsert;

// ==========================================
// CUSTOM EMOTES
// ==========================================
export const customEmotes = pgTable(
  "custom_emotes",
  {
    id: serial("id").primaryKey(),
    streamerId: integer("streamer_id").notNull(),
    name: varchar("name", { length: 50 }).notNull(),
    imageUrl: varchar("image_url", { length: 512 }).notNull(),
    tier: varchar("tier", { length: 50 }).default("free").notNull(), // free, subscriber, founder
    usageCount: integer("usage_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    streamerIdx: index("custom_emotes_streamer_idx").on(table.streamerId),
    nameIdx: index("custom_emotes_name_idx").on(table.name),
  })
);

export type CustomEmote = typeof customEmotes.$inferSelect;
export type InsertCustomEmote = typeof customEmotes.$inferInsert;

// ==========================================
// RAIDS & HOSTS
// ==========================================
export const raids = pgTable(
  "raids",
  {
    id: serial("id").primaryKey(),
    fromStreamerId: integer("from_streamer_id").notNull(),
    toStreamerId: integer("to_streamer_id").notNull(),
    viewersRaided: integer("viewers_raided").notNull(),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fromIdx: index("raids_from_idx").on(table.fromStreamerId),
    toIdx: index("raids_to_idx").on(table.toStreamerId),
  })
);

export type Raid = typeof raids.$inferSelect;
export type InsertRaid = typeof raids.$inferInsert;

// ==========================================
// SOCIAL LINKS
// ==========================================
export const socialLinks = pgTable(
  "social_links",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    twitterUrl: varchar("twitter_url", { length: 512 }),
    instagramUrl: varchar("instagram_url", { length: 512 }),
    tiktokUrl: varchar("tiktok_url", { length: 512 }),
    youtubeUrl: varchar("youtube_url", { length: 512 }),
    discordUrl: varchar("discord_url", { length: 512 }),
    twitchUrl: varchar("twitch_url", { length: 512 }),
    affiliateLinks: json("affiliate_links").$type<Record<string, string>>().default({}),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("social_links_user_idx").on(table.userId),
  })
);

export type SocialLink = typeof socialLinks.$inferSelect;
export type InsertSocialLink = typeof socialLinks.$inferInsert;

// ==========================================
// USER PROFILES (Extended Profile Data)
// ==========================================
export const userProfiles = pgTable(
  "user_profiles_extended",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    bio: varchar("bio", { length: 500 }),
    avatarUrl: varchar("avatar_url", { length: 512 }),
    bannerUrl: varchar("banner_url", { length: 512 }),
    pronouns: varchar("pronouns", { length: 50 }),
    location: varchar("location", { length: 255 }),
    verified: boolean("verified").default(false).notNull(),
    verificationBadge: varchar("verification_badge", { length: 50 }), // dj, creator, artist, etc
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_profiles_user_idx").on(table.userId),
    verifiedIdx: index("user_profiles_verified_idx").on(table.verified),
  })
);

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

// ==========================================
// FOLLOWS (Follow Relationships)
// ==========================================
export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").notNull(),
    followingId: integer("following_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    followingIdx: index("follows_following_idx").on(table.followingId),
    uniqueFollow: unique("follows_unique").on(table.followerId, table.followingId),
  })
);

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

// ==========================================
// DIRECT MESSAGES (Private Messaging)
// ==========================================
export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    user1Id: integer("user1_id").notNull(),
    user2Id: integer("user2_id").notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    user1Idx: index("conversations_user1_idx").on(table.user1Id),
    user2Idx: index("conversations_user2_idx").on(table.user2Id),
    uniqueConversation: unique("conversations_unique").on(table.user1Id, table.user2Id),
  })
);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const directMessages = pgTable(
  "direct_messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id").notNull(),
    senderId: integer("sender_id").notNull(),
    content: text("content").notNull(),
    imageUrl: varchar("image_url", { length: 512 }),
    readAt: timestamp("read_at"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdx: index("direct_messages_conversation_idx").on(table.conversationId),
    senderIdx: index("direct_messages_sender_idx").on(table.senderId),
    readIdx: index("direct_messages_read_idx").on(table.readAt),
  })
);

export type DirectMessage = typeof directMessages.$inferSelect;
export type InsertDirectMessage = typeof directMessages.$inferInsert;

// ==========================================
// CLIP COMMENTS (Comment System)
// ==========================================
export const clipComments = pgTable(
  "clip_comments",
  {
    id: serial("id").primaryKey(),
    clipId: integer("clip_id").notNull(),
    userId: integer("user_id").notNull(),
    content: text("content").notNull(),
    parentCommentId: integer("parent_comment_id"), // For threaded replies
    likeCount: integer("like_count").default(0).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    clipIdx: index("clip_comments_clip_idx").on(table.clipId),
    userIdx: index("clip_comments_user_idx").on(table.userId),
    parentIdx: index("clip_comments_parent_idx").on(table.parentCommentId),
  })
);

export type ClipComment = typeof clipComments.$inferSelect;
export type InsertClipComment = typeof clipComments.$inferInsert;

export const commentLikes = pgTable(
  "comment_likes",
  {
    id: serial("id").primaryKey(),
    commentId: integer("comment_id").notNull(),
    userId: integer("user_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentIdx: index("comment_likes_comment_idx").on(table.commentId),
    userIdx: index("comment_likes_user_idx").on(table.userId),
    uniqueLike: unique("comment_likes_unique").on(table.commentId, table.userId),
  })
);

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ==========================================
// REPORTS (Safety & Moderation)
// ==========================================
export const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "harassment",
  "hate_speech",
  "inappropriate_content",
  "misinformation",
  "impersonation",
  "scam",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewing",
  "resolved",
  "dismissed",
]);

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    reporterId: integer("reporter_id").notNull(),
    reportedUserId: integer("reported_user_id"),
    reportedCommentId: integer("reported_comment_id"),
    reason: reportReasonEnum("reason").notNull(),
    description: text("description"),
    status: reportStatusEnum("status").default("open").notNull(),
    reviewedBy: integer("reviewed_by"),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => ({
    reporterIdx: index("reports_reporter_idx").on(table.reporterId),
    reportedUserIdx: index("reports_reported_user_idx").on(table.reportedUserId),
    reportedCommentIdx: index("reports_reported_comment_idx").on(table.reportedCommentId),
    statusIdx: index("reports_status_idx").on(table.status),
  })
);

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

export const userBans = pgTable(
  "user_bans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    reason: text("reason").notNull(),
    bannedBy: integer("banned_by").notNull(),
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    appealedAt: timestamp("appealed_at"),
    appealReason: text("appeal_reason"),
    appealStatus: varchar("appeal_status", { length: 50 }), // pending, approved, denied
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_bans_user_idx").on(table.userId),
    endDateIdx: index("user_bans_end_date_idx").on(table.endDate),
  })
);

export type UserBan = typeof userBans.$inferSelect;
export type InsertUserBan = typeof userBans.$inferInsert;

// ==========================================
// REPUTATION & BADGES
// ==========================================
export const reputationScores = pgTable(
  "reputation_scores",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().unique(),
    score: integer("score").default(0).notNull(),
    trustLevel: varchar("trust_level", { length: 50 }).default("new").notNull(), // new, contributor, trusted, influencer
    messagesCount: integer("messages_count").default(0).notNull(),
    clipsCount: integer("clips_count").default(0).notNull(),
    donationsCount: integer("donations_count").default(0).notNull(),
    violationsCount: integer("violations_count").default(0).notNull(),
    lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("reputation_scores_user_idx").on(table.userId),
    scoreIdx: index("reputation_scores_score_idx").on(table.score),
  })
);

export type ReputationScore = typeof reputationScores.$inferSelect;
export type InsertReputationScore = typeof reputationScores.$inferInsert;

export const reputationBadgeTypeEnum = pgEnum("reputation_badge_type", [
  "trusted",
  "contributor",
  "influencer",
  "moderator",
  "verified",
  "early_supporter",
  "community_champion",
]);

export const reputationBadges = pgTable(
  "reputation_badges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    badgeType: reputationBadgeTypeEnum("badge_type").notNull(),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
    metadata: json("metadata").$type<Record<string, any>>().default({}),
  },
  (table) => ({
    userIdx: index("reputation_badges_user_idx").on(table.userId),
    badgeIdx: index("reputation_badges_badge_idx").on(table.badgeType),
    uniqueBadge: unique("reputation_badges_unique").on(table.userId, table.badgeType),
  })
);

export type ReputationBadge = typeof reputationBadges.$inferSelect;
export type InsertReputationBadge = typeof reputationBadges.$inferInsert;

// ==========================================
// COMMUNITY HIGHLIGHTS
// ==========================================
export const communityHighlights = pgTable(
  "community_highlights",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 50 }).notNull(), // clip_of_week, top_contributor, comment_of_day, top_donor
    featuredUserId: integer("featured_user_id"),
    featuredCommentId: integer("featured_comment_id"),
    featuredClipId: integer("featured_clip_id"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    reason: text("reason"),
    featuredBy: integer("featured_by").notNull(), // Admin user ID
    startDate: timestamp("start_date").defaultNow().notNull(),
    endDate: timestamp("end_date"),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("community_highlights_user_idx").on(table.featuredUserId),
    commentIdx: index("community_highlights_comment_idx").on(table.featuredCommentId),
    typeIdx: index("community_highlights_type_idx").on(table.type),
  })
);

export type CommunityHighlight = typeof communityHighlights.$inferSelect;
export type InsertCommunityHighlight = typeof communityHighlights.$inferInsert;
