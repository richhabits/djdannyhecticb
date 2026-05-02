/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Content Schema - Clips, Highlights, Podcasts, Simulcasts, Playlists
 */

import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  json,
  serial,
  numeric,
} from "drizzle-orm/pg-core";

/**
 * ============================================
 * ENUMS
 * ============================================
 */
export const clipStatusEnum = pgEnum("clip_status", [
  "processing",
  "processed",
  "published",
  "archived",
  "failed",
]);

export const highlightStatusEnum = pgEnum("highlight_status", [
  "generating",
  "generated",
  "published",
  "archived",
]);

export const podcastStatusEnum = pgEnum("podcast_status", [
  "draft",
  "published",
  "archived",
]);

export const podcastPlatformEnum = pgEnum("podcast_platform", [
  "spotify",
  "apple_podcasts",
  "youtube_music",
  "amazon_music",
  "rss",
]);

export const podcastDistributionStatusEnum = pgEnum("podcast_distribution_status", [
  "pending",
  "submitted",
  "approved",
  "rejected",
  "removed",
]);

export const simulcastStatusEnum = pgEnum("simulcast_status", [
  "scheduled",
  "live",
  "completed",
  "cancelled",
]);

export const simulcastPlatformEnum = pgEnum("simulcast_platform", [
  "youtube",
  "twitch",
  "tiktok",
  "instagram",
  "facebook",
]);

export const playlistStatusEnum = pgEnum("playlist_status", [
  "draft",
  "published",
]);

/**
 * ============================================
 * CLIPS TABLE
 * ============================================
 */
export const clips = pgTable("clips", {
  id: varchar("id", { length: 21 }).primaryKey(),
  sessionId: integer("sessionId").notNull(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: numeric("startTime", { precision: 10, scale: 2 }).notNull(),
  endTime: numeric("endTime", { precision: 10, scale: 2 }).notNull(),
  duration: numeric("duration", { precision: 10, scale: 2 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  videoUrl: varchar("videoUrl", { length: 512 }),
  status: clipStatusEnum("status").default("processing").notNull(),
  publishedAt: timestamp("publishedAt"),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Clip = typeof clips.$inferSelect;
export type InsertClip = typeof clips.$inferInsert;

/**
 * ============================================
 * CLIP LIKES TABLE
 * ============================================
 */
export const clipLikes = pgTable("clip_likes", {
  id: serial("id").primaryKey(),
  clipId: varchar("clipId", { length: 21 }).notNull(),
  userId: integer("userId").notNull(),
  likedAt: timestamp("likedAt").defaultNow().notNull(),
});

export type ClipLike = typeof clipLikes.$inferSelect;
export type InsertClipLike = typeof clipLikes.$inferInsert;

/**
 * ============================================
 * CLIP COMMENTS TABLE
 * ============================================
 */
export const clipComments = pgTable("clip_comments", {
  id: varchar("id", { length: 21 }).primaryKey(),
  clipId: varchar("clipId", { length: 21 }).notNull(),
  userId: integer("userId").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClipComment = typeof clipComments.$inferSelect;
export type InsertClipComment = typeof clipComments.$inferInsert;

/**
 * ============================================
 * CLIP VIEWS TABLE
 * ============================================
 */
export const clipViews = pgTable("clip_views", {
  id: serial("id").primaryKey(),
  clipId: varchar("clipId", { length: 21 }).notNull(),
  userId: integer("userId"),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type ClipView = typeof clipViews.$inferSelect;
export type InsertClipView = typeof clipViews.$inferInsert;

/**
 * ============================================
 * HIGHLIGHTS TABLE
 * ============================================
 */
export const highlights = pgTable("highlights", {
  id: varchar("id", { length: 21 }).primaryKey(),
  sessionId: integer("sessionId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  videoUrl: varchar("videoUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  duration: integer("duration"),
  score: numeric("score", { precision: 10, scale: 2 }),
  status: highlightStatusEnum("status").default("generating").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Highlight = typeof highlights.$inferSelect;
export type InsertHighlight = typeof highlights.$inferInsert;

/**
 * ============================================
 * HIGHLIGHT MOMENTS TABLE
 * ============================================
 */
export const highlightMoments = pgTable("highlight_moments", {
  id: serial("id").primaryKey(),
  highlightId: varchar("highlightId", { length: 21 }).notNull(),
  clipId: varchar("clipId", { length: 21 }),
  startTime: numeric("startTime", { precision: 10, scale: 2 }).notNull(),
  endTime: numeric("endTime", { precision: 10, scale: 2 }).notNull(),
  score: numeric("score", { precision: 10, scale: 2 }).notNull(),
  type: varchar("type", { length: 50 }), // reaction_spike, donation, poll, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HighlightMoment = typeof highlightMoments.$inferSelect;
export type InsertHighlightMoment = typeof highlightMoments.$inferInsert;

/**
 * ============================================
 * PODCAST EPISODES TABLE
 * ============================================
 */
export const podcastEpisodes = pgTable("podcast_episodes", {
  id: varchar("id", { length: 21 }).primaryKey(),
  sessionId: integer("sessionId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audioUrl", { length: 512 }),
  transcript: text("transcript"),
  duration: integer("duration"),
  episodeNumber: integer("episodeNumber"),
  status: podcastStatusEnum("status").default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PodcastEpisode = typeof podcastEpisodes.$inferSelect;
export type InsertPodcastEpisode = typeof podcastEpisodes.$inferInsert;

/**
 * ============================================
 * PODCAST DISTRIBUTIONS TABLE
 * ============================================
 */
export const podcastDistributions = pgTable("podcast_distributions", {
  id: serial("id").primaryKey(),
  episodeId: varchar("episodeId", { length: 21 }).notNull(),
  platform: podcastPlatformEnum("platform").notNull(),
  platformId: varchar("platformId", { length: 512 }),
  status: podcastDistributionStatusEnum("status").default("pending").notNull(),
  url: varchar("url", { length: 512 }),
  submittedAt: timestamp("submittedAt"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PodcastDistribution = typeof podcastDistributions.$inferSelect;
export type InsertPodcastDistribution = typeof podcastDistributions.$inferInsert;

/**
 * ============================================
 * PODCAST STATS TABLE
 * ============================================
 */
export const podcastStats = pgTable("podcast_stats", {
  id: serial("id").primaryKey(),
  episodeId: varchar("episodeId", { length: 21 }).notNull(),
  downloads: integer("downloads").default(0).notNull(),
  plays: integer("plays").default(0).notNull(),
  completionRate: numeric("completionRate", { precision: 5, scale: 2 }),
  reviews: integer("reviews").default(0).notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PodcastStat = typeof podcastStats.$inferSelect;
export type InsertPodcastStat = typeof podcastStats.$inferInsert;

/**
 * ============================================
 * SIMULCASTS TABLE
 * ============================================
 */
export const simulcasts = pgTable("simulcasts", {
  id: varchar("id", { length: 21 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: simulcastStatusEnum("status").default("scheduled").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  rtmpIngestUrl: varchar("rtmpIngestUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Simulcast = typeof simulcasts.$inferSelect;
export type InsertSimulcast = typeof simulcasts.$inferInsert;

/**
 * ============================================
 * SIMULCAST STREAMS TABLE
 * ============================================
 */
export const simulcastStreams = pgTable("simulcast_streams", {
  id: serial("id").primaryKey(),
  simulcastId: varchar("simulcastId", { length: 21 }).notNull(),
  platform: simulcastPlatformEnum("platform").notNull(),
  rtmpUrl: varchar("rtmpUrl", { length: 512 }).notNull(),
  streamKey: varchar("streamKey", { length: 512 }).notNull(),
  status: varchar("status", { length: 50 }).default("idle").notNull(),
  currentViewers: integer("currentViewers").default(0).notNull(),
  peakViewers: integer("peakViewers").default(0).notNull(),
  healthScore: numeric("healthScore", { precision: 5, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulcastStream = typeof simulcastStreams.$inferSelect;
export type InsertSimulcastStream = typeof simulcastStreams.$inferInsert;

/**
 * ============================================
 * SIMULCAST STATS TABLE
 * ============================================
 */
export const simulcastStats = pgTable("simulcast_stats", {
  id: serial("id").primaryKey(),
  simulcastId: varchar("simulcastId", { length: 21 }).notNull(),
  platform: simulcastPlatformEnum("platform").notNull(),
  peakViewers: integer("peakViewers"),
  avgViewers: integer("avgViewers"),
  duration: integer("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SimulcastStat = typeof simulcastStats.$inferSelect;
export type InsertSimulcastStat = typeof simulcastStats.$inferInsert;

/**
 * ============================================
 * PLAYLISTS TABLE
 * ============================================
 */
export const playlists = pgTable("playlists", {
  id: varchar("id", { length: 21 }).primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  status: playlistStatusEnum("status").default("draft").notNull(),
  isCollaborative: boolean("isCollaborative").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

/**
 * ============================================
 * PLAYLIST ITEMS TABLE
 * ============================================
 */
export const playlistItems = pgTable("playlist_items", {
  id: serial("id").primaryKey(),
  playlistId: varchar("playlistId", { length: 21 }).notNull(),
  clipId: varchar("clipId", { length: 21 }).notNull(),
  order: integer("order").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = typeof playlistItems.$inferInsert;

/**
 * ============================================
 * PLAYLIST FOLLOWERS TABLE
 * ============================================
 */
export const playlistFollowers = pgTable("playlist_followers", {
  id: serial("id").primaryKey(),
  playlistId: varchar("playlistId", { length: 21 }).notNull(),
  userId: integer("userId").notNull(),
  followedAt: timestamp("followedAt").defaultNow().notNull(),
});

export type PlaylistFollower = typeof playlistFollowers.$inferSelect;
export type InsertPlaylistFollower = typeof playlistFollowers.$inferInsert;

/**
 * ============================================
 * SHARE LINKS TABLE
 * ============================================
 */
export const shareLinks = pgTable("share_links", {
  id: varchar("id", { length: 21 }).primaryKey(),
  clipId: varchar("clipId", { length: 21 }),
  playlistId: varchar("playlistId", { length: 21 }),
  platform: varchar("platform", { length: 50 }), // twitter, tiktok, instagram, etc
  customMessage: text("customMessage"),
  sharedBy: integer("sharedBy"),
  sharedAt: timestamp("sharedAt").defaultNow().notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;

/**
 * ============================================
 * CAPTIONS/TRANSCRIPTS TABLE
 * ============================================
 */
export const captions = pgTable("captions", {
  id: varchar("id", { length: 21 }).primaryKey(),
  sessionId: integer("sessionId").notNull(),
  clipId: varchar("clipId", { length: 21 }),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  content: text("content").notNull(),
  vttFormat: text("vttFormat"), // WebVTT format for video players
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Caption = typeof captions.$inferSelect;
export type InsertCaption = typeof captions.$inferInsert;
