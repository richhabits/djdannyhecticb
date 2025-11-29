import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  userId: int("userId").optional(), // Optional: who requested it
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
  userId: int("userId").optional(),
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
  userId: int("userId").optional(),
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
  fanId: int("fanId").optional(), // Link to userProfiles or users
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
  fanId: int("fanId").optional(),
  fanName: varchar("fanName", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  productId: int("productId").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("GBP").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).default("pending").notNull(),
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
  fanId: int("fanId").optional(),
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
  primaryColor: varchar("primaryColor", { length: 20 }),
  secondaryColor: varchar("secondaryColor", { length: 20 }),
  logoUrl: varchar("logoUrl", { length: 512 }),
  domain: varchar("domain", { length: 255 }),
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
  actorId: int("actorId").optional(), // User ID who performed action
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
  updatedBy: int("updatedBy").optional(),
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
  userId: int("userId").optional(),
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
  createdBy: int("createdBy").optional(),
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
  fanId: int("fanId").optional(),
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
  userId: int("userId").optional(),
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
  profileId: int("profileId").optional(),
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