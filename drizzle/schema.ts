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
 * Calendar availability table for managing DJ availability and blocked dates
 */
export const calendarAvailability = mysqlTable("calendarAvailability", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  reason: varchar("reason", { length: 255 }), // "booking", "holiday", "maintenance", etc
  bookingId: int("bookingId"), // Reference to booking if blocked by confirmed booking
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarAvailability = typeof calendarAvailability.$inferSelect;
export type InsertCalendarAvailability = typeof calendarAvailability.$inferInsert;

/**
 * Analytics events table for tracking user interactions and page views
 */
export const analyticsEvents = mysqlTable("analyticsEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Nullable for anonymous tracking
  eventType: varchar("eventType", { length: 100 }).notNull(), // "page_view", "click", "search", "booking_created", etc
  eventCategory: varchar("eventCategory", { length: 100 }), // "navigation", "engagement", "conversion", etc
  eventLabel: varchar("eventLabel", { length: 255 }), // Additional context
  pagePath: varchar("pagePath", { length: 512 }),
  referrer: varchar("referrer", { length: 512 }),
  userAgent: varchar("userAgent", { length: 512 }),
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv6 compatible
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;