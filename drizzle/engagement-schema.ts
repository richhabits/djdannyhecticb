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
