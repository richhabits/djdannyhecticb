/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * Database schema and structure are proprietary intellectual property.
 */

import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin credentials for password-based authentication
 */
export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK to users table
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(), // bcrypt hash
  lastLoginAt: timestamp("lastLoginAt"),
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"), // Account lockout after failed attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type InsertAdminCredential = typeof adminCredentials.$inferInsert;

/**
 * Mixes table for storing DJ mixes
 */
export const mixes = mysqlTable("mixes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  duration: int("duration"), // in seconds
  genre: varchar("genre", { length: 100 }),
  isFree: boolean("isFree").default(true).notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mix = typeof mixes.$inferSelect;
export type InsertMix = typeof mixes.$inferInsert;

/**
 * Bookings table for DJ service bookings
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventName: varchar("eventName", { length: 255 }).notNull(),
  eventDate: timestamp("eventDate").notNull(),
  eventLocation: varchar("eventLocation", { length: 255 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // wedding, club, private, etc
  guestCount: int("guestCount"),
  budget: varchar("budget", { length: 100 }),
  description: text("description"),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Events table for DJ events and performances
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("eventDate").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  ticketUrl: varchar("ticketUrl", { length: 512 }),
  price: varchar("price", { length: 100 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Podcasts table for podcast episodes
 */
export const podcasts = mysqlTable("podcasts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  episodeNumber: int("episodeNumber"),
  audioUrl: varchar("audioUrl", { length: 512 }).notNull(),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  duration: int("duration"), // in seconds
  spotifyUrl: varchar("spotifyUrl", { length: 512 }),
  applePodcastsUrl: varchar("applePodcastsUrl", { length: 512 }),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Podcast = typeof podcasts.$inferSelect;
export type InsertPodcast = typeof podcasts.$inferInsert;

/**
 * Streaming Links table for music platforms
 */
export const streamingLinks = mysqlTable("streamingLinks", {
  id: int("id").autoincrement().primaryKey(),
  platform: varchar("platform", { length: 100 }).notNull(), // spotify, apple-music, soundcloud, etc
  url: varchar("url", { length: 512 }).notNull(),
  displayName: varchar("displayName", { length: 255 }),
  icon: varchar("icon", { length: 255 }), // icon name or url
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StreamingLink = typeof streamingLinks.$inferSelect;
export type InsertStreamingLink = typeof streamingLinks.$inferInsert;

/**
 * Shouts table for fan messages and track requests
 */
export const shouts = mysqlTable("shouts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  message: text("message").notNull(),
  trackRequest: varchar("trackRequest", { length: 255 }),
  isTrackRequest: boolean("isTrackRequest").default(false).notNull(),
  trackTitle: varchar("trackTitle", { length: 255 }),
  trackArtist: varchar("trackArtist", { length: 255 }),
  votes: int("votes").default(0).notNull(),
  trackStatus: mysqlEnum("trackStatus", ["pending", "queued", "played"]).default("pending"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  heardFrom: varchar("heardFrom", { length: 255 }),
  genres: text("genres"), // JSON array as string
  whatsappOptIn: boolean("whatsappOptIn").default(false).notNull(),
  canReadOnAir: boolean("canReadOnAir").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  readOnAir: boolean("readOnAir").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Shout = typeof shouts.$inferSelect;
export type InsertShout = typeof shouts.$inferInsert;

/**
 * Streams table for managing Shoutcast/Icecast stream configurations
 */
export const streams = mysqlTable("streams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["shoutcast", "icecast", "custom"]).notNull(),
  publicUrl: varchar("publicUrl", { length: 512 }).notNull(),
  sourceHost: varchar("sourceHost", { length: 255 }),
  sourcePort: int("sourcePort"),
  mount: varchar("mount", { length: 255 }),
  statsUrl: varchar("statsUrl", { length: 512 }), // URL for JSON stats
  streamId: int("streamId"), // SID for Shoutcast
  adminApiUrl: varchar("adminApiUrl", { length: 512 }),
  adminUser: varchar("adminUser", { length: 255 }),
  adminPassword: varchar("adminPassword", { length: 255 }),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Stream = typeof streams.$inferSelect;
export type InsertStream = typeof streams.$inferInsert;

/**
 * Tracks table for now playing and track history
 */
export const tracks = mysqlTable("tracks", {
  id: int("id").autoincrement().primaryKey(),
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
export const shows = mysqlTable("shows", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  host: varchar("host", { length: 255 }),
  description: text("description"),
  dayOfWeek: int("dayOfWeek").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: varchar("startTime", { length: 10 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 10 }).notNull(), // HH:MM format
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Show = typeof shows.$inferSelect;
export type InsertShow = typeof shows.$inferInsert;

/**
 * Event Bookings table for DJ service bookings (new simplified version)
 */
export const eventBookings = mysqlTable("event_bookings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  organisation: varchar("organisation", { length: 255 }),
  eventType: mysqlEnum("eventType", ["club", "radio", "private", "brand", "other"]).notNull(),
  eventDate: varchar("eventDate", { length: 20 }).notNull(), // YYYY-MM-DD format
  eventTime: varchar("eventTime", { length: 10 }).notNull(), // HH:MM format
  location: varchar("location", { length: 255 }).notNull(),
  budgetRange: varchar("budgetRange", { length: 100 }),
  setLength: varchar("setLength", { length: 100 }),
  streamingRequired: boolean("streamingRequired").default(false).notNull(),
  extraNotes: text("extraNotes"),
  marketingConsent: boolean("marketingConsent").default(false).notNull(),
  dataConsent: boolean("dataConsent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventBooking = typeof eventBookings.$inferSelect;
export type InsertEventBooking = typeof eventBookings.$inferInsert;

/**
 * Danny Status table for editable status states
 */
export const dannyStatus = mysqlTable("danny_status", {
  id: int("id").autoincrement().primaryKey(),
  status: varchar("status", { length: 100 }).notNull(), // e.g., "On Air", "In Studio", "Chilling"
  message: text("message"), // Custom message
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DannyStatus = typeof dannyStatus.$inferSelect;
export type InsertDannyStatus = typeof dannyStatus.$inferInsert;

/**
 * Hectic Feed posts
 */
export const feedPosts = mysqlTable("feed_posts", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["post", "photo", "clip", "mix"]).notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content"),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  aiCaption: text("aiCaption"), // AI-generated caption
  reactions: text("reactions"), // JSON: { "🔥": 5, "💥": 3 }
  isPublic: boolean("isPublic").default(true).notNull(),
  isVipOnly: boolean("isVipOnly").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedPost = typeof feedPosts.$inferSelect;
export type InsertFeedPost = typeof feedPosts.$inferInsert;

/**
 * User profiles with expanded fan data
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Link to users table if exists
  name: varchar("name", { length: 255 }).notNull(), // From shouts or signup
  email: varchar("email", { length: 255 }),
  genres: text("genres"), // JSON array
  personalityTags: text("personalityTags"), // JSON array: ["Day One", "Vibe Master", etc.]
  shoutFrequency: int("shoutFrequency").default(0).notNull(),
  vibeLevel: int("vibeLevel").default(1).notNull(), // 1-10
  whatsappOptIn: boolean("whatsappOptIn").default(false).notNull(),
  aiMemoryEnabled: boolean("aiMemoryEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Fan Badge Tiers
 */
export const fanBadges = mysqlTable("fan_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Link to userProfiles
  name: varchar("name", { length: 255 }).notNull(), // From userProfiles
  tier: mysqlEnum("tier", ["rookie", "regular", "veteran", "royalty"]).notNull(),
  points: int("points").default(0).notNull(),
  onlineTime: int("onlineTime").default(0).notNull(), // Minutes
  shoutCount: int("shoutCount").default(0).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FanBadge = typeof fanBadges.$inferSelect;
export type InsertFanBadge = typeof fanBadges.$inferInsert;

/**
 * AI Generated Mixes
 */
export const aiMixes = mysqlTable("ai_mixes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Optional: who requested it (nullable by default)
  mood: varchar("mood", { length: 100 }).notNull(),
  bpm: int("bpm"),
  genres: text("genres").notNull(), // JSON array
  setlist: text("setlist").notNull(), // JSON array of tracks
  narrative: text("narrative"), // AI-generated mix story
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIMix = typeof aiMixes.$inferSelect;
export type InsertAIMix = typeof aiMixes.$inferInsert;

/**
 * Danny Reacts submissions
 */
export const dannyReacts = mysqlTable("danny_reacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["video", "meme", "track"]).notNull(),
  mediaUrl: varchar("mediaUrl", { length: 512 }).notNull(),
  title: varchar("title", { length: 255 }),
  aiReaction: text("aiReaction"), // AI-generated reaction
  aiRating: int("aiRating"), // 1-10
  status: mysqlEnum("status", ["pending", "reacted", "published"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DannyReact = typeof dannyReacts.$inferSelect;
export type InsertDannyReact = typeof dannyReacts.$inferInsert;

/**
 * Personalized Shoutouts
 */
export const personalizedShoutouts = mysqlTable("personalized_shoutouts", {
  id: int("id").autoincrement().primaryKey(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  recipientEmail: varchar("recipientEmail", { length: 255 }),
  type: mysqlEnum("type", ["birthday", "roast", "motivational", "breakup", "custom"]).notNull(),
  message: text("message").notNull(), // AI-generated
  delivered: boolean("delivered").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PersonalizedShoutout = typeof personalizedShoutouts.$inferSelect;
export type InsertPersonalizedShoutout = typeof personalizedShoutouts.$inferInsert;

/**
 * DJ Battle submissions
 */
export const djBattles = mysqlTable("dj_battles", {
  id: int("id").autoincrement().primaryKey(),
  djName: varchar("djName", { length: 255 }).notNull(),
  djEmail: varchar("djEmail", { length: 255 }),
  mixUrl: varchar("mixUrl", { length: 512 }).notNull(),
  mixTitle: varchar("mixTitle", { length: 255 }),
  aiCritique: text("aiCritique"), // AI-generated critique
  aiScore: int("aiScore"), // 1-100
  aiImprovements: text("aiImprovements"), // JSON array of suggestions
  status: mysqlEnum("status", ["pending", "reviewed", "published"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DJBattle = typeof djBattles.$inferSelect;
export type InsertDJBattle = typeof djBattles.$inferInsert;

/**
 * Listener locations for heatmap
 */
export const listenerLocations = mysqlTable("listener_locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // From shout or profile
  city: varchar("city", { length: 255 }),
  country: varchar("country", { length: 255 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  fanTier: mysqlEnum("fanTier", ["rookie", "regular", "veteran", "royalty"]),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListenerLocation = typeof listenerLocations.$inferSelect;
export type InsertListenerLocation = typeof listenerLocations.$inferInsert;

/**
 * Auto-generated promo content
 */
export const promoContent = mysqlTable("promo_content", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["clip", "subtitle", "thumbnail", "post"]).notNull(),
  sourceType: mysqlEnum("sourceType", ["mix", "show", "shout", "reaction"]).notNull(),
  sourceId: int("sourceId"), // ID of source (mix, show, etc.)
  content: text("content"), // Generated content
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  status: mysqlEnum("status", ["pending", "generated", "published"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PromoContent = typeof promoContent.$inferSelect;
export type InsertPromoContent = typeof promoContent.$inferInsert;

/**
 * Identity Quiz results
 */
export const identityQuizzes = mysqlTable("identity_quizzes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  identityType: varchar("identityType", { length: 100 }).notNull(), // e.g., "Vibe Master", "Day One"
  playlist: text("playlist"), // JSON array of recommended tracks
  welcomeMessage: text("welcomeMessage"), // AI-generated
  answers: text("answers"), // JSON of quiz answers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IdentityQuiz = typeof identityQuizzes.$inferSelect;
export type InsertIdentityQuiz = typeof identityQuizzes.$inferInsert;

/**
 * Superfan memberships
 */
export const superfans = mysqlTable("superfans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).notNull(),
  perks: text("perks"), // JSON array
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Superfan = typeof superfans.$inferSelect;
export type InsertSuperfan = typeof superfans.$inferInsert;

/**
 * Loyalty tracking
 */
export const loyaltyTracking = mysqlTable("loyalty_tracking", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  totalOnlineTime: int("totalOnlineTime").default(0).notNull(), // Minutes
  totalShouts: int("totalShouts").default(0).notNull(),
  streakDays: int("streakDays").default(0).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyTracking = typeof loyaltyTracking.$inferSelect;
export type InsertLoyaltyTracking = typeof loyaltyTracking.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - REVENUE STACK
 * ============================================
 */

/**
 * Support events (tips/donations)
 */
export const supportEvents = mysqlTable("support_events", {
  id: int("id").autoincrement().primaryKey(),
  fanId: int("fanId"), // Link to userProfiles or users
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  amount: varchar("amount", { length: 50 }).notNull(), // Store as string to support various currencies
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportEvent = typeof supportEvents.$inferSelect;
export type InsertSupportEvent = typeof supportEvents.$inferInsert;

/**
 * Digital products (drops, soundpacks, presets, etc.)
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["drop", "soundpack", "preset", "course", "bundle", "other"]).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Purchases of digital products
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  fanId: int("fanId"),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  productId: int("productId").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded", "failed", "cancelled"]).default("pending").notNull(),
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "paypal", "manual"]),
  paymentIntentId: varchar("paymentIntentId", { length: 255 }), // Stripe Payment Intent ID
  paypalOrderId: varchar("paypalOrderId", { length: 255 }), // PayPal Order ID
  transactionId: varchar("transactionId", { length: 255 }), // Generic transaction ID
  metadata: text("metadata"), // JSON metadata for payment details
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Subscriptions (VIP tiers)
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  fanId: int("fanId"),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  tier: mysqlEnum("tier", ["hectic_regular", "hectic_royalty", "inner_circle"]).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  startAt: timestamp("startAt").defaultNow().notNull(),
  endAt: timestamp("endAt"),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - BRAND LAYER
 * ============================================
 */

/**
 * Brands table for multi-brand support
 */
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  type: mysqlEnum("type", ["personality", "station", "clothing", "pets", "other"]).notNull(),
  archetype: mysqlEnum("archetype", ["dj", "podcaster", "creator", "brand", "station"]), // Phase 7: Franchise mode
  primaryColor: varchar("primaryColor", { length: 20 }),
  secondaryColor: varchar("secondaryColor", { length: 20 }),
  logoUrl: varchar("logoUrl", { length: 512 }),
  domain: varchar("domain", { length: 255 }),
  defaultFeatureFlags: text("defaultFeatureFlags"), // JSON blob - Phase 7: Franchise mode
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - SAFETY & REPUTATION
 * ============================================
 */

/**
 * Audit logs for tracking admin actions
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"), // User ID who performed action
  actorName: varchar("actorName", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "create_shout", "update_stream"
  entityType: varchar("entityType", { length: 100 }), // e.g., "shout", "stream"
  entityId: int("entityId"),
  beforeSnapshot: text("beforeSnapshot"), // JSON snapshot before change
  afterSnapshot: text("afterSnapshot"), // JSON snapshot after change
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Empire settings (kill switches, feature toggles)
 */
export const empireSettings = mysqlTable("empire_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(), // e.g., "ai_posting_enabled", "ai_hosting_enabled"
  value: text("value"), // JSON or string value
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  updatedBy: int("updatedBy"),
});

export type EmpireSetting = typeof empireSettings.$inferSelect;
export type InsertEmpireSetting = typeof empireSettings.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - OBSERVABILITY
 * ============================================
 */

/**
 * Error logs for tracking application errors
 */
export const errorLogs = mysqlTable("error_logs", {
  id: int("id").autoincrement().primaryKey(),
  route: varchar("route", { length: 255 }),
  method: varchar("method", { length: 10 }),
  stackSnippet: text("stackSnippet"),
  message: text("message"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  userId: int("userId"),
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
export const incidentBanners = mysqlTable("incident_banners", {
  id: int("id").autoincrement().primaryKey(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "error"]).default("info").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  startAt: timestamp("startAt").defaultNow().notNull(),
  endAt: timestamp("endAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IncidentBanner = typeof incidentBanners.$inferSelect;
export type InsertIncidentBanner = typeof incidentBanners.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - BACKUP & RECOVERY
 * ============================================
 */

/**
 * Backups table
 */
export const backups = mysqlTable("backups", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description"),
  dataBlob: text("dataBlob"), // JSON serialized backup data
  checksum: varchar("checksum", { length: 64 }), // SHA-256 checksum
  sizeBytes: int("sizeBytes"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = typeof backups.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - NOTIFICATION ORCHESTRATOR
 * ============================================
 */

/**
 * Unified notifications table
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  fanId: int("fanId"),
  fanName: varchar("fanName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  type: varchar("type", { length: 100 }).notNull(), // e.g., "danny_live", "track_request", "mission_available"
  channel: mysqlEnum("channel", ["web_push", "email", "whatsapp", "in_app"]).notNull(),
  payload: text("payload"), // JSON payload
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * ============================================
 * PHASE 5: EMPIRE MODE - EMPIRE API
 * ============================================
 */

/**
 * API keys for external access
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(), // API key hash
  label: varchar("label", { length: 255 }).notNull(),
  scopes: text("scopes"), // JSON array of allowed scopes
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * ============================================
 * PHASE 6: GEN-Z DOMINATION LAYER
 * ============================================
 */

/**
 * User profiles with Gen-Z features
 */
export const genZProfiles = mysqlTable("genz_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  username: varchar("username", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  bannerUrl: varchar("bannerUrl", { length: 512 }),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  streakDays: int("streakDays").default(0).notNull(),
  totalPoints: int("totalPoints").default(0).notNull(),
  level: int("level").default(1).notNull(),
  followersCount: int("followersCount").default(0).notNull(),
  followingCount: int("followingCount").default(0).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  lastActive: timestamp("lastActive").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GenZProfile = typeof genZProfiles.$inferSelect;
export type InsertGenZProfile = typeof genZProfiles.$inferInsert;

/**
 * ============================================
 * PHASE 7: ADMIN FEATURE EXPANSION (VIDEOS, BLOG, MEDIA)
 * ============================================
 */

/**
 * Videos table for YouTube/External video management
 */
export const videos = mysqlTable("videos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  youtubeUrl: varchar("youtubeUrl", { length: 512 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Live Set, Mix, Interview, etc.
  description: text("description"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  views: int("views").default(0).notNull(), // Manual override or synced
  duration: varchar("duration", { length: 20 }), // e.g., "1:23:45"
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = typeof videos.$inferInsert;

/**
 * Articles table for Blog/News
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(), // Rich text / HTML
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  authorId: int("authorId"), // Link to user
  authorName: varchar("authorName", { length: 255 }), // Snapshot of author name
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Media Library table for uploads
 */
export const mediaLibrary = mysqlTable("media_library", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  size: int("size").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  uploadedBy: int("uploadedBy"), // User ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MediaItem = typeof mediaLibrary.$inferSelect;
export type InsertMediaItem = typeof mediaLibrary.$inferInsert;

/**
 * Follow relationships
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull(), // Profile ID
  followingId: int("followingId").notNull(), // Profile ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * User posts (TikTok/Instagram style)
 */
export const userPosts = mysqlTable("user_posts", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  type: mysqlEnum("type", ["text", "image", "video", "audio", "clip"]).notNull(),
  content: text("content"),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  sharesCount: int("sharesCount").default(0).notNull(),
  viewsCount: int("viewsCount").default(0).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPost = typeof userPosts.$inferSelect;
export type InsertUserPost = typeof userPosts.$inferInsert;

/**
 * Post reactions (likes, etc.)
 */
export const postReactions = mysqlTable("post_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  profileId: int("profileId").notNull(),
  reactionType: varchar("reactionType", { length: 20 }).default("like").notNull(), // like, fire, heart, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostReaction = typeof postReactions.$inferSelect;
export type InsertPostReaction = typeof postReactions.$inferInsert;

/**
 * Collectibles/Vault items
 */
export const collectibles = mysqlTable("collectibles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["badge", "nft", "trophy", "item", "skin"]).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  metadata: text("metadata"), // JSON
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Collectible = typeof collectibles.$inferSelect;
export type InsertCollectible = typeof collectibles.$inferInsert;

/**
 * User collectibles (ownership)
 */
export const userCollectibles = mysqlTable("user_collectibles", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  collectibleId: int("collectibleId").notNull(),
  acquiredAt: timestamp("acquiredAt").defaultNow().notNull(),
  isEquipped: boolean("isEquipped").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserCollectible = typeof userCollectibles.$inferSelect;
export type InsertUserCollectible = typeof userCollectibles.$inferInsert;

/**
 * Achievements
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("iconUrl", { length: 512 }),
  pointsReward: int("pointsReward").default(0).notNull(),
  rarity: mysqlEnum("rarity", ["common", "rare", "epic", "legendary"]).default("common").notNull(),
  criteria: text("criteria"), // JSON - what unlocks this
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * User achievements (unlocked)
 */
export const userAchievements = mysqlTable("user_achievements", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  achievementId: int("achievementId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

/**
 * Chat messages with AI Danny
 */
export const aiDannyChats = mysqlTable("ai_danny_chats", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId"),
  sessionId: varchar("sessionId", { length: 64 }).notNull(), // For anonymous users
  message: text("message").notNull(),
  response: text("response"),
  context: text("context"), // JSON - context used for response
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIDannyChat = typeof aiDannyChats.$inferSelect;
export type InsertAIDannyChat = typeof aiDannyChats.$inferInsert;

/**
 * World/3D avatars and positions
 */
export const worldAvatars = mysqlTable("world_avatars", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  avatarData: text("avatarData"), // JSON - 3D model data
  positionX: varchar("positionX", { length: 20 }).default("0"),
  positionY: varchar("positionY", { length: 20 }).default("0"),
  positionZ: varchar("positionZ", { length: 20 }).default("0"),
  rotation: varchar("rotation", { length: 20 }).default("0"),
  isOnline: boolean("isOnline").default(false).notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorldAvatar = typeof worldAvatars.$inferSelect;
export type InsertWorldAvatar = typeof worldAvatars.$inferInsert;

/**
 * ============================================
 * PHASE 7: GLOBAL CULT MODE
 * ============================================
 */

/**
 * Bookings table (enhanced for Phase 7)
 * Note: If bookings table already exists, this extends it
 */
export const bookingsPhase7 = mysqlTable("bookings_phase7", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  org: varchar("org", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  type: mysqlEnum("type", ["club", "radio", "private", "corporate", "podcast", "other"]).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  date: varchar("date", { length: 20 }).notNull(), // YYYY-MM-DD
  time: varchar("time", { length: 10 }), // HH:MM
  budgetMin: varchar("budgetMin", { length: 50 }),
  budgetMax: varchar("budgetMax", { length: 50 }),
  source: varchar("source", { length: 255 }), // How they found you
  status: mysqlEnum("status", ["new", "reviewing", "accepted", "declined", "completed"]).default("new").notNull(),
  internalNotes: text("internalNotes"),
  brandId: int("brandId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingPhase7 = typeof bookingsPhase7.$inferSelect;
export type InsertBookingPhase7 = typeof bookingsPhase7.$inferInsert;

/**
 * Events table (enhanced for Phase 7)
 * Note: If events table already exists, this extends it
 */
export const eventsPhase7 = mysqlTable("events_phase7", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["stream", "club", "private", "online_collab", "festival", "takeover"]).notNull(),
  location: varchar("location", { length: 255 }),
  dateTimeStart: timestamp("dateTimeStart").notNull(),
  dateTimeEnd: timestamp("dateTimeEnd"),
  isPublic: boolean("isPublic").default(true).notNull(),
  ticketsUrl: varchar("ticketsUrl", { length: 512 }),
  status: mysqlEnum("status", ["upcoming", "live", "completed", "cancelled"]).default("upcoming").notNull(),
  brandId: int("brandId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventPhase7 = typeof eventsPhase7.$inferSelect;
export type InsertEventPhase7 = typeof eventsPhase7.$inferInsert;

/**
 * Partner requests
 */
export const partnerRequests = mysqlTable("partner_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  brandName: varchar("brandName", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  links: text("links"), // JSON - IG, TikTok, etc.
  collabType: mysqlEnum("collabType", ["guest_mix", "co_host", "brand_drop", "takeover", "other"]).notNull(),
  pitch: text("pitch").notNull(),
  status: mysqlEnum("status", ["new", "reviewing", "accepted", "declined"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerRequest = typeof partnerRequests.$inferSelect;
export type InsertPartnerRequest = typeof partnerRequests.$inferInsert;

/**
 * Approved partners
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  brandName: varchar("brandName", { length: 255 }),
  logoUrl: varchar("logoUrl", { length: 512 }),
  links: text("links"), // JSON
  type: mysqlEnum("type", ["venue", "clothing", "media", "dj", "creator", "other"]).notNull(),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Social profiles
 */
export const socialProfiles = mysqlTable("social_profiles", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "spotify", "mixcloud", "snapchat", "telegram", "piing", "twitter", "facebook", "other"]).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  handle: varchar("handle", { length: 255 }),
  brandId: int("brandId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialProfile = typeof socialProfiles.$inferSelect;
export type InsertSocialProfile = typeof socialProfiles.$inferInsert;

/**
 * Post templates
 */
export const postTemplates = mysqlTable("post_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "spotify", "mixcloud", "snapchat", "telegram", "piing", "twitter", "facebook", "all"]).notNull(),
  templateType: mysqlEnum("templateType", ["nowPlaying", "eventAnnouncement", "newMix", "shoutHighlight", "quote", "clipDrop"]).notNull(),
  templateText: text("templateText").notNull(), // With placeholder tokens like {track}, {event}, {date}
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostTemplate = typeof postTemplates.$inferSelect;
export type InsertPostTemplate = typeof postTemplates.$inferInsert;

/**
 * Promotions
 */
export const promotions = mysqlTable("promotions", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["event", "mix", "clip", "show", "achievement", "milestone"]).notNull(),
  entityId: int("entityId").notNull(),
  platforms: text("platforms"), // JSON array
  status: mysqlEnum("status", ["draft", "ready", "scheduled", "sent"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Promotion = typeof promotions.$inferSelect;
export type InsertPromotion = typeof promotions.$inferInsert;

/**
 * Traffic events (for analytics)
 */
export const trafficEvents = mysqlTable("traffic_events", {
  id: int("id").autoincrement().primaryKey(),
  route: varchar("route", { length: 255 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  referrer: varchar("referrer", { length: 512 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TrafficEvent = typeof trafficEvents.$inferSelect;
export type InsertTrafficEvent = typeof trafficEvents.$inferInsert;

/**
 * Inner Circle eligibility
 */
export const innerCircle = mysqlTable("inner_circle", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  isEligible: boolean("isEligible").default(false).notNull(),
  eligibilityReason: varchar("eligibilityReason", { length: 255 }), // xp_threshold, subscription, manual
  unlockedAt: timestamp("unlockedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InnerCircle = typeof innerCircle.$inferSelect;
export type InsertInnerCircle = typeof innerCircle.$inferInsert;

/**
 * ============================================
 * PHASE 8: HECTIC AI STUDIO
 * ============================================
 */

/**
 * AI Script Jobs
 */
export const aiScriptJobs = mysqlTable("ai_script_jobs", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["intro", "outro", "mixStory", "tiktokClip", "promo", "fanShout", "generic"]).notNull(),
  inputContext: text("inputContext"), // JSON
  requestedByUserId: int("requestedByUserId"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  resultText: text("resultText"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIScriptJob = typeof aiScriptJobs.$inferSelect;
export type InsertAIScriptJob = typeof aiScriptJobs.$inferInsert;

/**
 * AI Voice Jobs (TTS)
 */
export const aiVoiceJobs = mysqlTable("ai_voice_jobs", {
  id: int("id").autoincrement().primaryKey(),
  scriptJobId: int("scriptJobId"), // FK to aiScriptJobs
  rawText: text("rawText"),
  voiceProfile: varchar("voiceProfile", { length: 100 }).default("hectic_main").notNull(), // hectic_main, hectic_soft, hectic_shouty
  requestedByUserId: int("requestedByUserId"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIVoiceJob = typeof aiVoiceJobs.$inferSelect;
export type InsertAIVoiceJob = typeof aiVoiceJobs.$inferInsert;

/**
 * AI Video Jobs
 */
export const aiVideoJobs = mysqlTable("ai_video_jobs", {
  id: int("id").autoincrement().primaryKey(),
  scriptJobId: int("scriptJobId"), // FK to aiScriptJobs
  stylePreset: mysqlEnum("stylePreset", ["verticalShort", "squareClip", "horizontalHost"]).notNull(),
  requestedByUserId: int("requestedByUserId"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  videoUrl: varchar("videoUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIVideoJob = typeof aiVideoJobs.$inferSelect;
export type InsertAIVideoJob = typeof aiVideoJobs.$inferInsert;

/**
 * User consents (extend existing or create new)
 */
export const userConsents = mysqlTable("user_consents", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId"),
  userId: int("userId"),
  email: varchar("email", { length: 255 }), // For anonymous users
  aiContentConsent: boolean("aiContentConsent").default(false).notNull(),
  marketingConsent: boolean("marketingConsent").default(false).notNull(),
  dataShareConsent: boolean("dataShareConsent").default(false).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;

/**
 * ============================================
 * PHASE 9: HECTIC ECONOMY + THE HECTIC SHOW
 * ============================================
 */

/**
 * ============================================
 * PHASE 9A: HECTIC ECONOMY
 * ============================================
 */

/**
 * Wallets for HecticCoins
 */
export const wallets = mysqlTable("wallets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // FK to users
  balanceCoins: int("balanceCoins").default(0).notNull(),
  lifetimeCoinsEarned: int("lifetimeCoinsEarned").default(0).notNull(),
  lifetimeCoinsSpent: int("lifetimeCoinsSpent").default(0).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = typeof wallets.$inferInsert;

/**
 * Coin transactions
 */
export const coinTransactions = mysqlTable("coin_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  walletId: int("walletId").notNull(),
  amount: int("amount").notNull(), // Positive for earn, negative for spend
  type: mysqlEnum("type", ["earn", "spend", "adjust"]).notNull(),
  source: mysqlEnum("source", ["mission", "loginStreak", "shout", "trackVote", "confession", "eventAttend", "referral", "adminAdjust", "rewardRedeem"]).notNull(),
  referenceId: int("referenceId"), // FK to missionId, eventId, referralId, rewardId
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type InsertCoinTransaction = typeof coinTransactions.$inferInsert;

/**
 * Rewards catalogue
 */
export const rewards = mysqlTable("rewards", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  costCoins: int("costCoins").notNull(),
  type: mysqlEnum("type", ["digital", "physical", "access", "aiAsset", "other"]).notNull(),
  fulfillmentType: mysqlEnum("fulfillmentType", ["manual", "autoEmail", "autoLink", "aiScript", "aiVoice", "aiVideo"]).notNull(),
  fulfillmentPayload: text("fulfillmentPayload"), // JSON
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = typeof rewards.$inferInsert;

/**
 * Redemptions
 */
export const redemptions = mysqlTable("redemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  rewardId: int("rewardId").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "fulfilled"]).default("pending").notNull(),
  coinsSpent: int("coinsSpent").notNull(),
  notesAdmin: text("notesAdmin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Redemption = typeof redemptions.$inferSelect;
export type InsertRedemption = typeof redemptions.$inferInsert;

/**
 * Referral codes
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  ownerUserId: int("ownerUserId").notNull(),
  maxUses: int("maxUses"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

/**
 * Referral uses
 */
export const referralUses = mysqlTable("referral_uses", {
  id: int("id").autoincrement().primaryKey(),
  codeId: int("codeId").notNull(),
  referredUserId: int("referredUserId").notNull(),
  rewardCoins: int("rewardCoins").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralUse = typeof referralUses.$inferSelect;
export type InsertReferralUse = typeof referralUses.$inferInsert;

/**
 * ============================================
 * PHASE 9B: THE HECTIC SHOW
 * ============================================
 */

/**
 * Shows (extend existing shows table or create new)
 * Note: If shows table exists, we'll extend it
 */
export const showsPhase9 = mysqlTable("shows_phase9", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  hostName: varchar("hostName", { length: 255 }),
  isPrimaryShow: boolean("isPrimaryShow").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowPhase9 = typeof showsPhase9.$inferSelect;
export type InsertShowPhase9 = typeof showsPhase9.$inferInsert;

/**
 * Show episodes
 */
export const showEpisodes = mysqlTable("show_episodes", {
  id: int("id").autoincrement().primaryKey(),
  showId: int("showId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  status: mysqlEnum("status", ["planned", "recorded", "live", "published", "archived"]).default("planned").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  recordedAt: timestamp("recordedAt"),
  publishedAt: timestamp("publishedAt"),
  recordingUrl: varchar("recordingUrl", { length: 512 }),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowEpisode = typeof showEpisodes.$inferSelect;
export type InsertShowEpisode = typeof showEpisodes.$inferInsert;

/**
 * Show segments
 */
export const showSegments = mysqlTable("show_segments", {
  id: int("id").autoincrement().primaryKey(),
  episodeId: int("episodeId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["intro", "topic", "interview", "confession", "dilemma", "shoutBlock", "musicBlock", "freestyle", "rant", "outro", "other"]).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  notes: text("notes"),
  aiScriptJobId: int("aiScriptJobId"), // Link to AI Studio
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowSegment = typeof showSegments.$inferSelect;
export type InsertShowSegment = typeof showSegments.$inferInsert;

/**
 * Live show sessions
 */
export const showLiveSessions = mysqlTable("show_live_sessions", {
  id: int("id").autoincrement().primaryKey(),
  showId: int("showId").notNull(),
  episodeId: int("episodeId"), // May become an episode later
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  status: mysqlEnum("status", ["upcoming", "live", "ended"]).default("upcoming").notNull(),
  concurrentListenersEstimate: int("concurrentListenersEstimate"),
  livePlatform: mysqlEnum("livePlatform", ["site", "youtube", "tiktok", "twitch", "other"]).default("site").notNull(),
  liveUrl: varchar("liveUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowLiveSession = typeof showLiveSessions.$inferSelect;
export type InsertShowLiveSession = typeof showLiveSessions.$inferInsert;

/**
 * Show cues (for live producer control)
 */
export const showCues = mysqlTable("show_cues", {
  id: int("id").autoincrement().primaryKey(),
  liveSessionId: int("liveSessionId").notNull(),
  type: mysqlEnum("type", ["playTrack", "readShout", "playConfession", "askQuestion", "adBreak", "topicIntro", "callToAction", "custom"]).notNull(),
  payload: text("payload"), // JSON - references track, shout, confession, script, etc.
  orderIndex: int("orderIndex").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "done", "skipped"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShowCue = typeof showCues.$inferSelect;
export type InsertShowCue = typeof showCues.$inferInsert;

/**
 * Show assets (optional)
 */
export const showAssets = mysqlTable("show_assets", {
  id: int("id").autoincrement().primaryKey(),
  episodeId: int("episodeId").notNull(),
  type: mysqlEnum("type", ["script", "voiceDrop", "clip", "socialPack"]).notNull(),
  aiScriptJobId: int("aiScriptJobId"),
  aiVoiceJobId: int("aiVoiceJobId"),
  aiVideoJobId: int("aiVideoJobId"),
  externalUrl: varchar("externalUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShowAsset = typeof showAssets.$inferSelect;
export type InsertShowAsset = typeof showAssets.$inferInsert;

/**
 * ============================================
 * PHASE 10: HECTICOPS CONTROL TOWER
 * ============================================
 */

/**
 * Social Integrations
 */
export const socialIntegrations = mysqlTable("social_integrations", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "twitch", "twitter", "facebook", "other"]).notNull(),
  handle: varchar("handle", { length: 255 }),
  url: varchar("url", { length: 512 }).notNull(),
  apiKeyName: varchar("apiKeyName", { length: 255 }), // Reference to env variable name
  isPrimary: boolean("isPrimary").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialIntegration = typeof socialIntegrations.$inferSelect;
export type InsertSocialIntegration = typeof socialIntegrations.$inferInsert;

/**
 * Content Queue
 */
export const contentQueue = mysqlTable("content_queue", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["clip", "post", "story", "short", "liveAnnouncement", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetPlatform: mysqlEnum("targetPlatform", ["instagram", "tiktok", "youtube", "whatsapp", "telegram", "multi"]).notNull(),
  source: mysqlEnum("source", ["episode", "liveSession", "aiJob", "manual"]).notNull(),
  sourceId: int("sourceId"), // FK to episode, liveSession, aiJob, etc.
  status: mysqlEnum("status", ["draft", "ready", "scheduled", "posted", "failed"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  postedAt: timestamp("postedAt"),
  externalUrl: varchar("externalUrl", { length: 512 }), // Link to final post
  payload: text("payload"), // JSON: caption, hashtags, notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentQueueItem = typeof contentQueue.$inferSelect;
export type InsertContentQueueItem = typeof contentQueue.$inferInsert;

/**
 * Webhooks
 */
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  secret: varchar("secret", { length: 255 }), // Optional webhook secret
  eventType: mysqlEnum("eventType", ["newShout", "newEpisodePublished", "newRedemption", "newFollower", "other"]).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Marketing Leads/Venues table for tracking clubs, bars, and venues
 */
export const marketingLeads = mysqlTable("marketing_leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["club", "bar", "venue", "festival", "event", "radio", "other"]).notNull(),
  location: varchar("location", { length: 255 }).notNull(), // City, Country
  address: text("address"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 512 }),
  socialMedia: text("socialMedia"), // JSON: {instagram: "...", facebook: "...", etc}
  capacity: int("capacity"), // Venue capacity
  genre: varchar("genre", { length: 255 }), // Preferred music genre
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "contacted", "interested", "quoted", "booked", "declined", "archived"]).default("new").notNull(),
  source: varchar("source", { length: 255 }), // "scraper", "manual", "referral", etc
  assignedTo: int("assignedTo"), // User ID of marketing team member
  lastContacted: timestamp("lastContacted"),
  nextFollowUp: timestamp("nextFollowUp"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingLead = typeof marketingLeads.$inferSelect;
export type InsertMarketingLead = typeof marketingLeads.$inferInsert;

/**
 * Marketing Campaigns table
 */
export const marketingCampaigns = mysqlTable("marketing_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["outreach", "social", "email", "advertising", "partnership", "other"]).notNull(),
  targetAudience: text("targetAudience"), // JSON array
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "cancelled"]).default("draft").notNull(),
  metrics: text("metrics"), // JSON: {leads: 0, conversions: 0, etc}
  createdBy: int("createdBy").notNull(), // User ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = typeof marketingCampaigns.$inferInsert;

/**
 * Outreach Activities table (tracks contact attempts and responses)
 */
export const outreachActivities = mysqlTable("outreach_activities", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(), // FK to marketing_leads
  campaignId: int("campaignId"), // FK to marketing_campaigns
  type: mysqlEnum("type", ["email", "phone", "social", "in_person", "other"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message"),
  response: text("response"),
  status: mysqlEnum("status", ["sent", "delivered", "opened", "replied", "bounced", "failed"]).default("sent").notNull(),
  performedBy: int("performedBy").notNull(), // User ID
  performedAt: timestamp("performedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutreachActivity = typeof outreachActivities.$inferSelect;
export type InsertOutreachActivity = typeof outreachActivities.$inferInsert;

/**
 * Social Media Posts table (extends contentQueue with more marketing features)
 */
export const socialMediaPosts = mysqlTable("social_media_posts", {
  id: int("id").autoincrement().primaryKey(),
  contentQueueId: int("contentQueueId"), // FK to content_queue (optional)
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "twitter", "facebook", "linkedin", "threads", "other"]).notNull(),
  type: mysqlEnum("type", ["post", "story", "reel", "video", "carousel", "live", "other"]).notNull(),
  caption: text("caption"),
  mediaUrls: text("mediaUrls"), // JSON array of media URLs
  hashtags: text("hashtags"), // JSON array or comma-separated
  mentions: text("mentions"), // JSON array of @mentions
  location: varchar("location", { length: 255 }), // Location tag
  status: mysqlEnum("status", ["draft", "scheduled", "posted", "failed", "archived"]).default("draft").notNull(),
  scheduledAt: timestamp("scheduledAt"),
  postedAt: timestamp("postedAt"),
  externalPostId: varchar("externalPostId", { length: 255 }), // ID from platform
  externalUrl: varchar("externalUrl", { length: 512 }), // URL to post on platform
  metrics: text("metrics"), // JSON: {likes: 0, comments: 0, shares: 0, views: 0}
  createdBy: int("createdBy").notNull(), // User ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

/**
 * Venue Scraper Results table (stores scraped venue data)
 */
export const venueScraperResults = mysqlTable("venue_scraper_results", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(), // "google", "yelp", "facebook", etc
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  rawData: text("rawData"), // JSON of scraped data
  processed: boolean("processed").default(false).notNull(),
  convertedToLead: boolean("convertedToLead").default(false).notNull(),
  leadId: int("leadId"), // FK to marketing_leads if converted
  scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VenueScraperResult = typeof venueScraperResults.$inferSelect;
export type InsertVenueScraperResult = typeof venueScraperResults.$inferInsert;

/**
 * User Favorites/Wishlist table
 */
export const userFavorites = mysqlTable("user_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  entityType: mysqlEnum("entityType", ["mix", "track", "event", "podcast"]).notNull(),
  entityId: int("entityId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * User Playlists table
 */
export const userPlaylists = mysqlTable("user_playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPlaylist = typeof userPlaylists.$inferSelect;
export type InsertUserPlaylist = typeof userPlaylists.$inferInsert;

/**
 * User Playlist Items table
 */
export const userPlaylistItems = mysqlTable("user_playlist_items", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  entityType: mysqlEnum("entityType", ["mix", "track", "event", "podcast"]).notNull(),
  entityId: int("entityId").notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserPlaylistItem = typeof userPlaylistItems.$inferSelect;
export type InsertUserPlaylistItem = typeof userPlaylistItems.$inferInsert;

/**
 * Track ID Requests table
 */
export const trackIdRequests = mysqlTable("track_id_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  email: varchar("email", { length: 255 }),
  trackDescription: text("trackDescription").notNull(),
  audioUrl: varchar("audioUrl", { length: 512 }),
  timestamp: varchar("timestamp", { length: 100 }),
  source: varchar("source", { length: 255 }), // mix, live, radio, etc
  status: mysqlEnum("status", ["pending", "identified", "not_found", "archived"]).default("pending").notNull(),
  identifiedTrack: text("identifiedTrack"), // JSON with track info if identified
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrackIdRequest = typeof trackIdRequests.$inferSelect;
export type InsertTrackIdRequest = typeof trackIdRequests.$inferInsert;

/**
 * Social Sharing Analytics table
 */
export const socialShares = mysqlTable("social_shares", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["mix", "track", "event", "podcast", "video", "blog"]).notNull(),
  entityId: int("entityId").notNull(),
  platform: mysqlEnum("platform", ["facebook", "twitter", "instagram", "tiktok", "youtube", "linkedin", "whatsapp", "other"]).notNull(),
  userId: int("userId"),
  shareUrl: varchar("shareUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialShare = typeof socialShares.$inferSelect;
export type InsertSocialShare = typeof socialShares.$inferInsert;

/**
 * Video Testimonials table
 */
export const videoTestimonials = mysqlTable("video_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }),
  event: varchar("event", { length: 255 }),
  videoUrl: varchar("videoUrl", { length: 512 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  transcript: text("transcript"),
  rating: int("rating"), // 1-5
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isApproved: boolean("isApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;

/**
 * Social Proof Notifications table
 */
export const socialProofNotifications = mysqlTable("social_proof_notifications", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["booking", "purchase", "favorite", "share", "comment", "view"]).notNull(),
  entityType: mysqlEnum("entityType", ["mix", "track", "event", "podcast", "product", "booking"]).notNull(),
  entityId: int("entityId").notNull(),
  message: varchar("message", { length: 255 }),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SocialProofNotification = typeof socialProofNotifications.$inferSelect;
export type InsertSocialProofNotification = typeof socialProofNotifications.$inferInsert;

/**
 * Social Media Feed Posts table (for Instagram/TikTok integration)
 */
export const socialMediaFeedPosts = mysqlTable("social_media_feed_posts", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "youtube", "twitter", "facebook"]).notNull(),
  postId: varchar("postId", { length: 255 }).notNull(), // External platform post ID
  url: varchar("url", { length: 512 }).notNull(),
  mediaUrl: varchar("mediaUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  caption: text("caption"),
  author: varchar("author", { length: 255 }),
  authorAvatar: varchar("authorAvatar", { length: 512 }),
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  postedAt: timestamp("postedAt").notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialMediaFeedPost = typeof socialMediaFeedPosts.$inferSelect;
export type InsertSocialMediaFeedPost = typeof socialMediaFeedPosts.$inferInsert;

/**
 * Music Recommendations table (AI-powered)
 */
export const musicRecommendations = mysqlTable("music_recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  entityType: mysqlEnum("entityType", ["mix", "track", "event", "podcast"]).notNull(),
  entityId: int("entityId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }), // 0-1 recommendation score
  reason: text("reason"), // Why this was recommended
  algorithm: varchar("algorithm", { length: 100 }), // "collaborative", "content-based", "hybrid"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MusicRecommendation = typeof musicRecommendations.$inferSelect;
export type InsertMusicRecommendation = typeof musicRecommendations.$inferInsert;