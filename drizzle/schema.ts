/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Database schema and structure are proprietary intellectual property.
 */

import { boolean, integer, pgEnum, pgTable, text, timestamp, varchar, numeric, json, serial } from "drizzle-orm/pg-core";

/**
 * ============================================
 * ENUMS - Define all enums before tables
 * ============================================
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "completed", "cancelled"]);
export const trackStatusEnum = pgEnum("track_status", ["pending", "queued", "played"]);
export const streamTypeEnum = pgEnum("stream_type", ["shoutcast", "icecast", "custom"]);
export const eventTypeEnum = pgEnum("event_type", ["club", "radio", "private", "brand", "other"]);
export const eventBookingStatusEnum = pgEnum("event_booking_status", ["pending", "confirmed", "completed", "cancelled"]);
export const pricingRuleTypeEnum = pgEnum("pricing_rule_type", ["weekend_uplift", "short_notice", "location_band", "base_rate"]);
export const pricingStrategyEnum = pgEnum("pricing_strategy", ["fixed", "percentage"]);
export const conversionStatusEnum = pgEnum("conversion_status", ["quote_served", "payment_started", "deposit_paid", "expired"]);
export const outboundSourceEnum = pgEnum("outbound_source", ["scraping", "social", "referral", "manual"]);
export const outboundStatusEnum = pgEnum("outbound_status", ["new", "qualified", "contacted", "converted", "dead"]);
export const outboundInteractionTypeEnum = pgEnum("outbound_interaction_type", ["email", "dm", "call", "automated_quote"]);
export const feedPostTypeEnum = pgEnum("feed_post_type", ["post", "photo", "clip", "mix"]);
export const fanBadgeTierEnum = pgEnum("fan_badge_tier", ["rookie", "regular", "veteran", "royalty"]);
export const dannyReactTypeEnum = pgEnum("danny_react_type", ["video", "meme", "track"]);
export const dannyReactStatusEnum = pgEnum("danny_react_status", ["pending", "reacted", "published"]);
export const personalizedShoutoutTypeEnum = pgEnum("personalized_shoutout_type", ["birthday", "roast", "motivational", "breakup", "custom"]);
export const djBattleStatusEnum = pgEnum("dj_battle_status", ["pending", "reviewed", "published"]);
export const promoTypeEnum = pgEnum("promo_type", ["clip", "subtitle", "thumbnail", "post"]);
export const promoSourceTypeEnum = pgEnum("promo_source_type", ["mix", "show", "shout", "reaction"]);
export const promoStatusEnum = pgEnum("promo_status", ["pending", "generated", "published"]);
export const superfanTierEnum = pgEnum("superfan_tier", ["bronze", "silver", "gold", "platinum"]);
export const supportEventStatusEnum = pgEnum("support_event_status", ["pending", "completed", "failed"]);
export const productTypeEnum = pgEnum("product_type", ["drop", "soundpack", "preset", "course", "bundle", "vinyl", "merch", "other"]);
export const purchaseStatusEnum = pgEnum("purchase_status", ["pending", "completed", "refunded", "failed", "cancelled"]);
export const paymentProviderEnum = pgEnum("payment_provider", ["stripe", "paypal", "manual"]);
export const shippingMethodEnum = pgEnum("shipping_method", ["standard", "express", "international"]);
export const subscriptionTierEnum = pgEnum("subscription_tier", ["hectic_regular", "hectic_royalty", "inner_circle"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "cancelled", "expired"]);
export const brandTypeEnum = pgEnum("brand_type", ["personality", "station", "clothing", "pets", "other"]);
export const brandArchetypeEnum = pgEnum("brand_archetype", ["dj", "podcaster", "creator", "brand", "station"]);
export const errorSeverityEnum = pgEnum("error_severity", ["low", "medium", "high", "critical"]);
export const incidentSeverityEnum = pgEnum("incident_severity", ["info", "warning", "error"]);
export const revenueIncidentTypeEnum = pgEnum("revenue_incident_type", ["pricing_drift", "payment_mismatch", "inventory_deadlock", "manual_override"]);
export const revenueIncidentSeverityEnum = pgEnum("revenue_incident_severity", ["low", "medium", "high", "critical"]);
export const revenueIncidentStatusEnum = pgEnum("revenue_incident_status", ["active", "investigating", "mitigated", "resolved"]);
export const governanceActorTypeEnum = pgEnum("governance_actor_type", ["system", "admin", "ai_ops"]);
export const notificationChannelEnum = pgEnum("notification_channel", ["web_push", "email", "whatsapp", "in_app"]);
export const notificationStatusEnum = pgEnum("notification_status", ["pending", "sent", "failed", "read"]);
export const bookingContractStatusEnum = pgEnum("booking_contract_status", ["draft", "issued", "signed", "voided"]);
export const userPostTypeEnum = pgEnum("user_post_type", ["text", "image", "video", "audio", "clip"]);
export const collectibleTypeEnum = pgEnum("collectible_type", ["badge", "nft", "trophy", "item", "skin"]);
export const collectibleRarityEnum = pgEnum("collectible_rarity", ["common", "rare", "epic", "legendary"]);
export const achievementRarityEnum = pgEnum("achievement_rarity", ["common", "rare", "epic", "legendary"]);
export const refundRequestStatusEnum = pgEnum("refund_request_status", ["pending", "approved", "denied", "refunded"]);
export const refundRequestReasonEnum = pgEnum("refund_request_reason", ["damaged", "wrong_item", "not_as_described", "changed_mind", "other"]);
export const platformTypeEnum = pgEnum("platform_type", ["youtube", "twitch", "tiktok", "instagram", "own_stream"]);
export const liveSessionStatusEnum = pgEnum("live_session_status", ["upcoming", "live", "completed", "cancelled"]);
export const cueTypeEnum = pgEnum("cue_type", ["playTrack", "readShout", "playConfession", "askQuestion", "adBreak", "topicIntro", "callToAction", "custom"]);
export const cueStatusEnum = pgEnum("cue_status", ["pending", "done", "skipped"]);
export const showPhase9StatusEnum = pgEnum("show_phase9_status", ["draft", "published", "archived"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  displayName: varchar("displayName", { length: 255 }),
  city: varchar("city", { length: 100 }),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  isSupporter: boolean("isSupporter").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin credentials for password-based authentication
 */
export const adminCredentials = pgTable("admin_credentials", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  failedLoginAttempts: integer("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Mixes table for storing DJ mixes
 */
export const mixes = pgTable("mixes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  duration: integer("duration"),
  genre: varchar("genre", { length: 100 }),
  isFree: boolean("isFree").default(true).notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Mix = typeof mixes.$inferSelect;
export type InsertMix = typeof mixes.$inferInsert;

/**
 * Bookings table for DJ service bookings
 */
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  eventLocation: varchar("eventLocation", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  guestCount: integer("guestCount"),
  budget: varchar("budget", { length: 100 }),
  description: text("description"),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  status: bookingStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Events table for DJ events and performances
 */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  ticketUrl: varchar("ticketUrl", { length: 512 }),
  price: varchar("price", { length: 100 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Podcasts table for podcast episodes
 */
export const podcasts = pgTable("podcasts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  episodeNumber: integer("episodeNumber"),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  duration: integer("duration"),
  spotifyUrl: varchar("spotifyUrl", { length: 512 }),
  applePodcastsUrl: varchar("applePodcastsUrl", { length: 512 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = typeof podcasts.$inferInsert;

/**
 * UK Events table for Ticketmaster and other event sources
 */
export const ukEvents = pgTable("uk_events", {
  id: serial("id").primaryKey(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 50 }).notNull(), // ticketmaster, skiddle, ra, etc
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  subcategory: varchar("subcategory", { length: 100 }),
  eventDate: timestamp("event_date").notNull(),
  doorsTime: timestamp("doors_time"),
  venue: varchar("venue", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }),
  longitude: numeric("longitude", { precision: 11, scale: 8 }),
  imageUrl: varchar("image_url", { length: 512 }),
  ticketUrl: varchar("ticket_url", { length: 512 }),
  ticketStatus: varchar("ticket_status", { length: 50 }), // AVAILABLE, LIMITED, SOLD_OUT, ON_SALE, POSTPONED, CANCELLED
  priceMin: numeric("price_min", { precision: 10, scale: 2 }),
  priceMax: numeric("price_max", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("GBP"),
  artists: text("artists"), // JSON array of artist names
  ageRestriction: varchar("age_restriction", { length: 50 }),
  isFeatured: boolean("is_featured").default(false),
  isSynced: boolean("is_synced").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type UKEvent = typeof ukEvents.$inferSelect;
export type InsertUKEvent = typeof ukEvents.$inferInsert;

/**
 * Event Sync Status table for tracking ingestion health
 */
export const eventSyncStatus = pgTable("event_sync_status", {
  id: serial("id").primaryKey(),
  connector: varchar("connector", { length: 50 }).notNull().unique(), // ticketmaster, skiddle, ra
  lastSyncedAt: timestamp("last_synced_at"),
  lastSuccessfulSyncAt: timestamp("last_successful_sync_at"),
  syncStatus: varchar("sync_status", { length: 50 }).default("idle"), // idle, syncing, success, error
  errorMessage: text("error_message"),
  eventsProcessed: integer("events_processed").default(0),
  eventsCreated: integer("events_created").default(0),
  eventsUpdated: integer("events_updated").default(0),
  eventsSkipped: integer("events_skipped").default(0),
  nextSyncScheduledAt: timestamp("next_sync_scheduled_at"),
  syncDurationMs: integer("sync_duration_ms"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type EventSyncStatus = typeof eventSyncStatus.$inferSelect;
export type InsertEventSyncStatus = typeof eventSyncStatus.$inferInsert;

/**
 * Streaming Links table for music platforms
 */
export const streamingLinks = pgTable("streamingLinks", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 100 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  displayName: varchar("displayName", { length: 255 }),
  icon: varchar("icon", { length: 255 }),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StreamingLink = typeof streamingLinks.$inferSelect;
export type InsertStreamingLink = typeof streamingLinks.$inferInsert;

/**
 * Shouts table for fan messages and track requests
 */
export const shouts = pgTable("shouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  message: text("message").notNull(),
  trackRequest: varchar("trackRequest", { length: 255 }),
  isTrackRequest: boolean("isTrackRequest").default(false).notNull(),
  trackTitle: varchar("trackTitle", { length: 255 }),
  trackArtist: varchar("trackArtist", { length: 255 }),
  votes: integer("votes").default(0).notNull(),
  trackStatus: trackStatusEnum("trackStatus").default("pending"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  heardFrom: varchar("heardFrom", { length: 255 }),
  genres: text("genres"),
  whatsappOptIn: boolean("whatsappOptIn").default(false).notNull(),
  canReadOnAir: boolean("canReadOnAir").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  readOnAir: boolean("readOnAir").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Shout = typeof shouts.$inferSelect;
export type InsertShout = typeof shouts.$inferInsert;

/**
 * Streams table for managing Shoutcast/Icecast stream configurations
 */
export const streams = pgTable("streams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: streamTypeEnum("type").notNull(),
  publicUrl: varchar("publicUrl", { length: 512 }).notNull(),
  sourceHost: varchar("sourceHost", { length: 255 }),
  sourcePort: integer("sourcePort"),
  mount: varchar("mount", { length: 255 }),
  statsUrl: varchar("statsUrl", { length: 512 }),
  streamId: integer("streamId"),
  adminApiUrl: varchar("adminApiUrl", { length: 512 }),
  adminUser: varchar("adminUser", { length: 255 }),
  adminPassword: varchar("adminPassword", { length: 255 }),
  showName: varchar("showName", { length: 255 }),
  hostName: varchar("hostName", { length: 255 }),
  category: varchar("category", { length: 100 }),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Stream = typeof streams.$inferSelect;
export type InsertStream = typeof streams.$inferInsert;

/**
 * Tracks table for now playing and track history
 */
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 255 }).notNull(),
  note: text("note"),
  playedAt: timestamp("playedAt").defaultNow().notNull(),
});

export type Track = typeof tracks.$inferSelect;
export type InsertTrack = typeof tracks.$inferInsert;

/**
 * Shows table for weekly schedule
 */
export const shows = pgTable("shows", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  host: varchar("host", { length: 255 }),
  description: text("description"),
  dayOfWeek: integer("dayOfWeek").notNull(),
  startTime: varchar("startTime", { length: 10 }).notNull(),
  endTime: varchar("endTime", { length: 10 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Show = typeof shows.$inferSelect;
export type InsertShow = typeof shows.$inferInsert;

/**
 * Event Bookings table for DJ service bookings (new simplified version)
 */
export const eventBookings = pgTable("event_bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  organisation: varchar("organisation", { length: 255 }),
  eventType: eventTypeEnum("eventType").notNull(),
  eventDate: varchar("eventDate", { length: 20 }).notNull(),
  eventTime: varchar("eventTime", { length: 10 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  budgetRange: varchar("budgetRange", { length: 100 }),
  setLength: varchar("setLength", { length: 100 }),
  streamingRequired: boolean("streamingRequired").default(false).notNull(),
  extraNotes: text("extraNotes"),
  marketingConsent: boolean("marketingConsent").default(false).notNull(),
  dataConsent: boolean("dataConsent").default(false).notNull(),
  status: eventBookingStatusEnum("status").default("pending").notNull(),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }),
  depositAmount: numeric("depositAmount", { precision: 10, scale: 2 }),
  depositPaid: boolean("depositPaid").default(false).notNull(),
  depositExpiresAt: timestamp("depositExpiresAt"),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  pricingBreakdown: text("pricingBreakdown"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EventBooking = typeof eventBookings.$inferSelect;
export type InsertEventBooking = typeof eventBookings.$inferInsert;

/**
 * Pricing Rules for automated quote generation
 */
export const pricingRules = pgTable("pricing_rules", {
  id: serial("id").primaryKey(),
  ruleType: pricingRuleTypeEnum("ruleType").notNull(),
  ruleValue: numeric("ruleValue", { precision: 10, scale: 2 }).notNull(),
  ruleStrategy: pricingStrategyEnum("ruleStrategy").default("fixed").notNull(),
  conditions: text("conditions"),
  maxMultiplier: numeric("maxMultiplier", { precision: 10, scale: 2 }),
  minTotal: numeric("minTotal", { precision: 10, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = typeof pricingRules.$inferInsert;

/**
 * Immutable Audit Logs for Pricing Engine
 */
export const pricingAuditLogs = pgTable("pricing_audit_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId"),
  baseRate: numeric("baseRate", { precision: 10, scale: 2 }).notNull(),
  finalTotal: numeric("finalTotal", { precision: 10, scale: 2 }).notNull(),
  rulesApplied: text("rulesApplied"),
  breakdown: text("breakdown"),
  conversionStatus: conversionStatusEnum("conversionStatus").default("quote_served").notNull(),
  geoContext: varchar("geoContext", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PricingAuditLog = typeof pricingAuditLogs.$inferSelect;
export type InsertPricingAuditLog = typeof pricingAuditLogs.$inferInsert;

/**
 * PHASE 5: OUTBOUND LEAD ENGINE (OLE)
 */

export const outboundLeads = pgTable("outbound_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  organisation: varchar("organisation", { length: 255 }),
  source: outboundSourceEnum("source").default("manual").notNull(),
  sourceFingerprint: varchar("sourceFingerprint", { length: 255 }),
  geoContext: varchar("geoContext", { length: 255 }),
  targetDate: varchar("targetDate", { length: 20 }),
  status: outboundStatusEnum("status").default("new").notNull(),
  leadScore: integer("leadScore").default(0).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type OutboundLead = typeof outboundLeads.$inferSelect;
export type InsertOutboundLead = typeof outboundLeads.$inferInsert;

export const outboundInteractions = pgTable("outbound_interactions", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  type: outboundInteractionTypeEnum("type").notNull(),
  content: text("content"),
  outcome: varchar("outcome", { length: 255 }),
  auditLogId: integer("auditLogId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutboundInteraction = typeof outboundInteractions.$inferSelect;
export type InsertOutboundInteraction = typeof outboundInteractions.$inferInsert;

/**
 * Booking Blockers table for manual availability management
 */
export const bookingBlockers = pgTable("booking_blockers", {
  id: serial("id").primaryKey(),
  blockedDate: varchar("blockedDate", { length: 20 }).notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookingBlocker = typeof bookingBlockers.$inferSelect;
export type InsertBookingBlocker = typeof bookingBlockers.$inferInsert;

/**
 * Danny Status table for editable status states
 */
export const dannyStatus = pgTable("danny_status", {
  id: serial("id").primaryKey(),
  status: varchar("status", { length: 100 }).notNull(),
  message: text("message"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DannyStatus = typeof dannyStatus.$inferSelect;
export type InsertDannyStatus = typeof dannyStatus.$inferInsert;

/**
 * Hectic Feed posts
 */
export const feedPosts = pgTable("feed_posts", {
  id: serial("id").primaryKey(),
  type: feedPostTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  aiCaption: text("aiCaption"),
  reactions: text("reactions"),
  isPublic: boolean("isPublic").default(true).notNull(),
  isVipOnly: boolean("isVipOnly").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;

/**
 * User profiles with expanded fan data
 */
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  genres: text("genres"),
  personalityTags: text("personalityTags"),
  shoutFrequency: integer("shoutFrequency").default(0).notNull(),
  vibeLevel: integer("vibeLevel").default(1).notNull(),
  whatsappOptIn: boolean("whatsappOptIn").default(false).notNull(),
  aiMemoryEnabled: boolean("aiMemoryEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Fan Badge Tiers
 */
export const fanBadges = pgTable("fan_badges", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  tier: fanBadgeTierEnum("tier").notNull(),
  points: integer("points").default(0).notNull(),
  onlineTime: integer("onlineTime").default(0).notNull(),
  shoutCount: integer("shoutCount").default(0).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FanBadge = typeof fanBadges.$inferSelect;
export type InsertFanBadge = typeof fanBadges.$inferInsert;

/**
 * AI Generated Mixes
 */
export const aiMixes = pgTable("ai_mixes", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  mood: varchar("mood", { length: 100 }).notNull(),
  bpm: integer("bpm"),
  genres: text("genres").notNull(),
  setlist: text("setlist").notNull(),
  narrative: text("narrative"),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIMix = typeof aiMixes.$inferSelect;
export type InsertAIMix = typeof aiMixes.$inferInsert;

/**
 * Danny Reacts submissions
 */
export const dannyReacts = pgTable("danny_reacts", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: dannyReactTypeEnum("type").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 512 }).notNull(),
  title: varchar("title", { length: 255 }),
  aiReaction: text("aiReaction"),
  aiRating: integer("aiRating"),
  status: dannyReactStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DannyReact = typeof dannyReacts.$inferSelect;
export type InsertDannyReact = typeof dannyReacts.$inferInsert;

/**
 * Personalized Shoutouts
 */
export const personalizedShoutouts = pgTable("personalized_shoutouts", {
  id: serial("id").primaryKey(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 255 }),
  type: personalizedShoutoutTypeEnum("type").notNull(),
  message: text("message").notNull(),
  delivered: boolean("delivered").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonalizedShoutout = typeof personalizedShoutouts.$inferSelect;
export type InsertPersonalizedShoutout = typeof personalizedShoutouts.$inferInsert;

/**
 * DJ Battle submissions
 */
export const djBattles = pgTable("dj_battles", {
  id: serial("id").primaryKey(),
  djName: varchar("djName", { length: 255 }).notNull(),
  djEmail: varchar("djEmail", { length: 255 }),
  mixUrl: varchar("mixUrl", { length: 512 }).notNull(),
  mixTitle: varchar("mixTitle", { length: 255 }),
  aiCritique: text("aiCritique"),
  aiScore: integer("aiScore"),
  aiImprovements: text("aiImprovements"),
  status: djBattleStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DJBattle = typeof djBattles.$inferSelect;
export type InsertDJBattle = typeof djBattles.$inferInsert;

/**
 * Listener locations for heatmap
 */
export const listenerLocations = pgTable("listener_locations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  fanTier: fanBadgeTierEnum("fanTier"),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListenerLocation = typeof listenerLocations.$inferSelect;
export type InsertListenerLocation = typeof listenerLocations.$inferInsert;

/**
 * Auto-generated promo content
 */
export const promoContent = pgTable("promo_content", {
  id: serial("id").primaryKey(),
  type: promoTypeEnum("type").notNull(),
  sourceType: promoSourceTypeEnum("sourceType").notNull(),
  sourceId: integer("sourceId"),
  content: text("content"),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  status: promoStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoContent = typeof promoContent.$inferSelect;
export type InsertPromoContent = typeof promoContent.$inferInsert;

/**
 * Identity Quiz results
 */
export const identityQuizzes = pgTable("identity_quizzes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  identityType: varchar("identityType", { length: 100 }).notNull(),
  playlist: text("playlist"),
  welcomeMessage: text("welcomeMessage"),
  answers: text("answers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdentityQuiz = typeof identityQuizzes.$inferSelect;
export type InsertIdentityQuiz = typeof identityQuizzes.$inferInsert;

/**
 * Superfan memberships
 */
export const superfans = pgTable("superfans", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  tier: superfanTierEnum("tier").notNull(),
  perks: text("perks"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Superfan = typeof superfans.$inferSelect;
export type InsertSuperfan = typeof superfans.$inferInsert;

/**
 * Loyalty tracking
 */
export const loyaltyTracking = pgTable("loyalty_tracking", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  totalOnlineTime: integer("totalOnlineTime").default(0).notNull(),
  totalShouts: integer("totalShouts").default(0).notNull(),
  streakDays: integer("streakDays").default(0).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LoyaltyTracking = typeof loyaltyTracking.$inferSelect;
export type InsertLoyaltyTracking = typeof loyaltyTracking.$inferInsert;

/**
 * Supporter Scores - Weekly meritocracy tracking
 */
export const supporterScores = pgTable("supporter_scores", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  weekStart: timestamp("weekStart").notNull(),
  score: integer("score").default(0).notNull(),
  breakdown: text("breakdown"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupporterScore = typeof supporterScores.$inferSelect;
export type InsertSupporterScore = typeof supporterScores.$inferInsert;

/**
 * Support events (tips/donations)
 */
export const supportEvents = pgTable("support_events", {
  id: serial("id").primaryKey(),
  fanId: integer("fanId"),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  message: text("message"),
  status: supportEventStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SupportEvent = typeof supportEvents.$inferSelect;
export type InsertSupportEvent = typeof supportEvents.$inferInsert;

/**
 * Digital products (drops, soundpacks, presets, etc.)
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: productTypeEnum("type").notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  stock: integer("stock"),
  shippingRequired: boolean("shippingRequired").default(false).notNull(),
  downloadToken: varchar("downloadToken", { length: 128 }),
  beatportUrl: varchar("beatportUrl", { length: 512 }),
  soundcloudUrl: varchar("soundcloudUrl", { length: 512 }),
  spotifyUrl: varchar("spotifyUrl", { length: 512 }),
  // Merch integration
  printfullProductId: varchar("printfullProductId", { length: 255 }),
  merchCategory: varchar("merchCategory", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Purchases of digital products
 */
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  fanId: integer("fanId"),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  productId: integer("productId").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  status: purchaseStatusEnum("status").default("pending").notNull(),
  paymentProvider: paymentProviderEnum("paymentProvider"),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }),
  paypalOrderId: varchar("paypalOrderId", { length: 255 }),
  transactionId: varchar("transactionId", { length: 255 }),
  metadata: text("metadata"),
  // Shipping information
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 255 }),
  shippingPostalCode: varchar("shippingPostalCode", { length: 20 }),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  shippingCost: numeric("shippingCost", { precision: 10, scale: 2 }),
  shippingMethod: shippingMethodEnum("shippingMethod"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Refund requests for purchases
 */
export const refundRequests = pgTable("refund_requests", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchaseId").notNull(),
  reason: refundRequestReasonEnum("reason").notNull(),
  details: text("details"),
  status: refundRequestStatusEnum("status").default("pending").notNull(),
  adminId: integer("adminId"),
  responseNotes: text("responseNotes"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RefundRequest = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = typeof refundRequests.$inferInsert;

/**
 * Subscriptions (VIP tiers)
 */
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  fanId: integer("fanId"),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  tier: subscriptionTierEnum("tier").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  startAt: timestamp("startAt").defaultNow().notNull(),
  endAt: timestamp("endAt"),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Brands table for multi-brand support
 */
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  type: brandTypeEnum("type").notNull(),
  archetype: brandArchetypeEnum("archetype"),
  primaryColor: varchar("primaryColor", { length: 20 }),
  secondaryColor: varchar("secondaryColor", { length: 20 }),
  logoUrl: varchar("logoUrl", { length: 512 }),
  domain: varchar("domain", { length: 255 }),
  defaultFeatureFlags: text("defaultFeatureFlags"),
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * Audit logs for tracking admin actions
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actorId"),
  actorName: varchar("actorName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: integer("entityId"),
  beforeSnapshot: text("beforeSnapshot"),
  afterSnapshot: text("afterSnapshot"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Empire settings (kill switches, feature toggles)
 */
export const empireSettings = pgTable("empire_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  updatedBy: integer("updatedBy"),
});

export type EmpireSetting = typeof empireSettings.$inferSelect;
export type InsertEmpireSetting = typeof empireSettings.$inferInsert;

/**
 * Error logs for tracking application errors
 */
export const errorLogs = pgTable("error_logs", {
  id: serial("id").primaryKey(),
  route: varchar("route", { length: 255 }),
  method: varchar("method", { length: 10 }),
  stackSnippet: text("stackSnippet"),
  message: text("message"),
  severity: errorSeverityEnum("severity").default("medium").notNull(),
  userId: integer("userId"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  resolved: boolean("resolved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;

/**
 * Incident banner messages
 */
export const incidentBanners = pgTable("incident_banners", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  severity: incidentSeverityEnum("severity").default("info").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  startAt: timestamp("startAt").defaultNow().notNull(),
  endAt: timestamp("endAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type IncidentBanner = typeof incidentBanners.$inferSelect;
export type InsertIncidentBanner = typeof incidentBanners.$inferInsert;

/**
 * Revenue Engine Governance & Fail-Safe
 */
export const revenueIncidents = pgTable("revenue_incidents", {
  id: serial("id").primaryKey(),
  type: revenueIncidentTypeEnum("type").notNull(),
  severity: revenueIncidentSeverityEnum("severity").notNull(),
  message: text("message").notNull(),
  status: revenueIncidentStatusEnum("status").default("active").notNull(),
  impactedQuotes: text("impactedQuotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type RevenueIncident = typeof revenueIncidents.$inferSelect;
export type InsertRevenueIncident = typeof revenueIncidents.$inferInsert;

export const governanceLogs = pgTable("governance_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actorId"),
  actorType: governanceActorTypeEnum("actorType").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  userId: integer("userId"),
  reason: text("reason"),
  payload: text("payload"),
  snapshot: text("snapshot"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GovernanceLog = typeof governanceLogs.$inferSelect;
export type InsertGovernanceLog = typeof governanceLogs.$inferInsert;

/**
 * Analytics Events - Self-Hosted Click Tracking
 */
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 80 }).notNull(),
  path: varchar("path", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  userAgent: varchar("userAgent", { length: 512 }),
  ipHash: varchar("ipHash", { length: 64 }),
  props: text("props"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Booking Contracts
 */
export const bookingContracts = pgTable("booking_contracts", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").notNull(),
  version: integer("version").default(1).notNull(),
  status: bookingContractStatusEnum("status").default("draft").notNull(),
  content: text("content").notNull(),
  signedAt: timestamp("signedAt"),
  signedBy: varchar("signedBy", { length: 255 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BookingContract = typeof bookingContracts.$inferSelect;
export type InsertBookingContract = typeof bookingContracts.$inferInsert;

export const techRiders = pgTable("tech_riders", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").notNull(),
  version: integer("version").default(1).notNull(),
  requirements: text("requirements").notNull(),
  hospitality: text("hospitality"),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TechRider = typeof techRiders.$inferSelect;
export type InsertTechRider = typeof techRiders.$inferInsert;

/**
 * Backups
 */
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  dataBlob: text("dataBlob"),
  checksum: varchar("checksum", { length: 64 }),
  sizeBytes: integer("sizeBytes"),
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;

/**
 * Unified notifications
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  fanId: integer("fanId"),
  fanName: varchar("fanName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  type: varchar("type", { length: 100 }).notNull(),
  channel: notificationChannelEnum("channel").notNull(),
  payload: text("payload"),
  status: notificationStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * API keys for external access
 */
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  scopes: text("scopes"),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Gen-Z Profiles
 */
export const genZProfiles = pgTable("genz_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  bannerUrl: varchar("bannerUrl", { length: 512 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  streakDays: integer("streakDays").default(0).notNull(),
  totalPoints: integer("totalPoints").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  followersCount: integer("followersCount").default(0).notNull(),
  followingCount: integer("followingCount").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GenZProfile = typeof genZProfiles.$inferSelect;
export type InsertGenZProfile = typeof genZProfiles.$inferInsert;

/**
 * Videos
 */
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  duration: varchar("duration", { length: 20 }),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Articles
 */
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  authorId: integer("authorId"),
  authorName: varchar("authorName", { length: 255 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Media Library
 */
export const mediaLibrary = pgTable("media_library", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  uploadedBy: integer("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = typeof mediaLibrary.$inferInsert;

/**
 * Follow relationships
 */
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("followerId").notNull(),
  followingId: integer("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * User posts
 */
export const userPosts = pgTable("user_posts", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  type: userPostTypeEnum("type").notNull(),
  content: text("content"),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  likesCount: integer("likesCount").default(0).notNull(),
  commentsCount: integer("commentsCount").default(0).notNull(),
  sharesCount: integer("sharesCount").default(0).notNull(),
  viewsCount: integer("viewsCount").default(0).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserPost = typeof userPosts.$inferSelect;
export type InsertUserPost = typeof userPosts.$inferInsert;

/**
 * Post reactions
 */
export const postReactions = pgTable("post_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  profileId: integer("profileId").notNull(),
  reactionType: varchar("reactionType", { length: 20 }).default("like").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * Collectibles
 */
export const collectibles = pgTable("collectibles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: collectibleTypeEnum("type").notNull(),
  rarity: collectibleRarityEnum("rarity").default("common").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  metadata: text("metadata"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Collectible = typeof collectibles.$inferSelect;
export type InsertCollectible = typeof collectibles.$inferInsert;

/**
 * User collectibles
 */
export const userCollectibles = pgTable("user_collectibles", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  collectibleId: integer("collectibleId").notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
  isEquipped: boolean("isEquipped").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCollectible = typeof userCollectibles.$inferSelect;
export type InsertUserCollectible = typeof userCollectibles.$inferInsert;

/**
 * Achievements
 */
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("iconUrl", { length: 512 }),
  pointsReward: integer("pointsReward").default(0).notNull(),
  rarity: achievementRarityEnum("rarity").default("common").notNull(),
  criteria: text("criteria"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements
 */
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  achievementId: integer("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Chat messages with AI Danny
 */
export const aiDannyChats = pgTable("ai_danny_chats", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId"),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  response: text("response"),
  context: text("context"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIDannyChat = typeof aiDannyChats.$inferSelect;
export type InsertAIDannyChat = typeof aiDannyChats.$inferInsert;

/**
 * ============================================
 * HECTIC AI SYSTEM
 * ============================================
 */

// Enums for Hectic AI
export const hecticChannelEnum = pgEnum("hectic_channel", ["web", "sms", "call", "whatsapp"]);
export const hecticStatusEnum = pgEnum("hectic_status", ["active", "booking_captured", "signed_up", "closed"]);
export const hecticLeadIntentEnum = pgEnum("hectic_lead_intent", ["booking", "inquiry", "fan", "media"]);
export const hecticLeadStatusEnum = pgEnum("hectic_lead_status", ["new", "contacted", "converted", "lost"]);
export const jarvisInsightTypeEnum = pgEnum("jarvis_insight_type", ["venue_suggestion", "marketing_copy", "follow_up", "trend"]);
export const commsProviderEnum = pgEnum("comms_provider", ["telnyx", "vapi", "whatsapp"]);
export const commsDirectionEnum = pgEnum("comms_direction", ["inbound", "outbound"]);
export const faqCategoryEnum = pgEnum("faq_category", ["booking", "merch", "technical", "shipping", "general"]);

/**
 * Hectic Conversations - Session management for AI chats
 */
export const hecticConversations = pgTable("hectic_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  channel: hecticChannelEnum("channel").default("web").notNull(),
  status: hecticStatusEnum("status").default("active").notNull(),
  extractedData: json("extracted_data"),
  leadCaptured: boolean("lead_captured").default(false).notNull(),
  signupPromptCount: integer("signup_prompt_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type HecticConversation = typeof hecticConversations.$inferSelect;
export type InsertHecticConversation = typeof hecticConversations.$inferInsert;

/**
 * Hectic Messages - Individual messages in conversations
 */
export const hecticMessages = pgTable("hectic_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => hecticConversations.id).notNull(),
  role: varchar("role", { length: 16 }).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type HecticMessage = typeof hecticMessages.$inferSelect;
export type InsertHecticMessage = typeof hecticMessages.$inferInsert;

/**
 * Hectic Leads - Captured booking leads from conversations
 */
export const hecticLeads = pgTable("hectic_leads", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => hecticConversations.id),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  organisation: varchar("organisation", { length: 255 }),
  intent: hecticLeadIntentEnum("intent"),
  eventType: eventTypeEnum("event_type"),
  eventDate: varchar("event_date", { length: 100 }),
  location: varchar("location", { length: 255 }),
  budget: varchar("budget", { length: 100 }),
  status: hecticLeadStatusEnum("status").default("new").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  followedUpAt: timestamp("followed_up_at"),
});

export type HecticLead = typeof hecticLeads.$inferSelect;
export type InsertHecticLead = typeof hecticLeads.$inferInsert;

/**
 * Jarvis Insights - Admin AI suggestions and intelligence
 */
export const jarvisInsights = pgTable("jarvis_insights", {
  id: serial("id").primaryKey(),
  type: jarvisInsightTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  metadata: json("metadata"),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  priority: integer("priority").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type JarvisInsight = typeof jarvisInsights.$inferSelect;
export type InsertJarvisInsight = typeof jarvisInsights.$inferInsert;

/**
 * Communications Log - Telnyx/Vapi message tracking
 */
export const commsLog = pgTable("comms_log", {
  id: serial("id").primaryKey(),
  provider: commsProviderEnum("provider"),
  direction: commsDirectionEnum("direction"),
  from: varchar("from_number", { length: 50 }),
  to: varchar("to_number", { length: 50 }),
  body: text("body"),
  status: varchar("status", { length: 32 }),
  externalId: varchar("external_id", { length: 255 }),
  conversationId: integer("conversation_id").references(() => hecticConversations.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommsLogEntry = typeof commsLog.$inferSelect;
export type InsertCommsLogEntry = typeof commsLog.$inferInsert;

/**
 * Contact Form Messages
 */
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  message: text("message").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  status: varchar("status", { length: 50 }).default("new").notNull(), // new, responded, archived
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  respondedAt: timestamp("respondedAt"),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Printfull Products Catalog - Synced from Printfull
 */
export const printfullProducts = pgTable("printfull_products", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull().unique(), // Printfull product ID
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  variants: json("variants"), // JSON array of variant objects
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PrintfullProduct = typeof printfullProducts.$inferSelect;
export type InsertPrintfullProduct = typeof printfullProducts.$inferInsert;

/**
 * Merch Orders - Orders placed on Printfull for physical merchandise
 */
export const merchOrders = pgTable("merch_orders", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchaseId").notNull(), // Reference to purchases table
  printfullOrderId: integer("printfullOrderId"), // Printfull order ID
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, submitted, printed, shipped, delivered, failed
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  trackingUrl: varchar("trackingUrl", { length: 512 }),
  shippingAddress: text("shippingAddress"), // JSON address
  items: json("items"), // JSON array of order items
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MerchOrder = typeof merchOrders.$inferSelect;
export type InsertMerchOrder = typeof merchOrders.$inferInsert;

/**
 * Blog Posts table
 */
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: varchar("excerpt", { length: 512 }),
  author: varchar("author", { length: 255 }),
  featuredImageUrl: varchar("featuredImageUrl", { length: 512 }),
  tags: text("tags"), // JSON array stored as text
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * FAQs table
 */
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 512 }).notNull(),
  answer: text("answer").notNull(),
  category: faqCategoryEnum("category").notNull(),
  displayOrder: integer("displayOrder").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = typeof faqs.$inferInsert;

/**
 * Shows (Phase 9) table for managing show metadata
 */
export const showsPhase9 = pgTable("shows_phase9", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  hostName: varchar("hostName", { length: 255 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  isPrimaryShow: boolean("isPrimaryShow").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ShowPhase9 = typeof showsPhase9.$inferSelect;
export type InsertShowPhase9 = typeof showsPhase9.$inferInsert;

/**
 * Show Episodes table for managing episode metadata
 */
export const showEpisodes = pgTable("show_episodes", {
  id: serial("id").primaryKey(),
  showId: integer("showId").notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  recordingUrl: varchar("recordingUrl", { length: 512 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  status: varchar("status", { length: 50 }).default("planned").notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ShowEpisode = typeof showEpisodes.$inferSelect;
export type InsertShowEpisode = typeof showEpisodes.$inferInsert;

/**
 * Live Sessions table for managing live broadcast sessions
 */
export const liveSessions = pgTable("live_sessions", {
  id: serial("id").primaryKey(),
  showId: integer("showId").notNull(),
  episodeId: integer("episodeId"),
  status: liveSessionStatusEnum("status").default("upcoming").notNull(),
  livePlatform: platformTypeEnum("livePlatform").default("own_stream").notNull(),
  liveUrl: varchar("liveUrl", { length: 512 }),
  streamId: integer("streamId"),
  startedAt: timestamp("startedAt"),
  endedAt: timestamp("endedAt"),
  scheduledAt: timestamp("scheduledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LiveSession = typeof liveSessions.$inferSelect;
export type InsertLiveSession = typeof liveSessions.$inferInsert;

/**
 * Cues table for managing live session cues (DJ control)
 */
export const cues = pgTable("cues", {
  id: serial("id").primaryKey(),
  liveSessionId: integer("liveSessionId").notNull(),
  type: cueTypeEnum("type").notNull(),
  payload: text("payload"),
  orderIndex: integer("orderIndex").default(0).notNull(),
  status: cueStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Cue = typeof cues.$inferSelect;
export type InsertCue = typeof cues.$inferInsert;

/**
 * Platform Live Status table for tracking live status across platforms
 */
export const platformLiveStatus = pgTable("platform_live_status", {
  id: serial("id").primaryKey(),
  platform: platformTypeEnum("platform").notNull().unique(),
  channelId: varchar("channelId", { length: 255 }),
  isLive: boolean("isLive").default(false).notNull(),
  streamTitle: varchar("streamTitle", { length: 512 }),
  streamUrl: varchar("streamUrl", { length: 512 }),
  embedUrl: varchar("embedUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  viewerCount: integer("viewerCount"),
  manualOverride: boolean("manualOverride").default(false).notNull(),
  lastCheckedAt: timestamp("lastCheckedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PlatformLiveStatus = typeof platformLiveStatus.$inferSelect;
export type InsertPlatformLiveStatus = typeof platformLiveStatus.$inferInsert;
