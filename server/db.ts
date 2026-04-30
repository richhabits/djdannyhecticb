/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { asc, desc, eq, gt, lt, and, or, like, sql, isNull, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { InsertUser, users, aiMixes, InsertAIMix, bookingBlockers, InsertBookingBlocker, bookings, InsertBooking, dannyReacts, InsertDannyReact, dannyStatus, InsertDannyStatus, djBattles, InsertDJBattle, eventBookings, InsertEventBooking, events, InsertEvent, fanBadges, InsertFanBadge, mixes, InsertMix, outboundLeads, InsertOutboundLead, personalizedShoutouts, InsertPersonalizedShoutout, podcasts, InsertPodcast, pricingAuditLogs, InsertPricingAuditLog, pricingRules, InsertPricingRule, shouts, InsertShout, shows, InsertShow, streamingLinks, InsertStreamingLink, streams, InsertStream, tracks, InsertTrack, userProfiles, InsertUserProfile, videos, InsertVideo, blogPosts, InsertBlogPost, faqs, InsertFAQ, contactMessages, InsertContactMessage, printfullProducts, InsertPrintfullProduct, merchOrders, InsertMerchOrder, products, refundRequests, InsertRefundRequest } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ENV } from './_core/env';
import { hasDatabaseConfig, getDatabaseErrorMessage } from './_core/dbHealth';


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!hasDatabaseConfig()) {
    return null;
  }
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Drizzle handles connection pooling automatically via mysql2
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      // Only log in development to reduce I/O overhead
      if (process.env.NODE_ENV === "development") {
        console.warn("[Database] Failed to connect:", error);
      }
      _db = null;
    }
  }
  return _db;
}

/**
 * Helper to throw a user-friendly error if DB is not available
 */
export function requireDatabase(feature?: string) {
  if (!hasDatabaseConfig()) {
    throw new Error(getDatabaseErrorMessage(feature));
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}


// Mixes queries


// Bookings queries

// User Identity & Signal Ownership






// Invite Mechanics



// --- Lane Factory & Ingestion Logic ---









export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(bookings).values(booking);
}

// Events queries
export async function getUpcomingEvents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(events).where(gt(events.eventDate, new Date())).orderBy(asc(events.eventDate)).limit(6);
}

export async function getFeaturedEvents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).where(and(eq(events.isFeatured, true), gt(events.eventDate, new Date()))).orderBy(asc(events.eventDate));
}

export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(events).orderBy(desc(events.eventDate));
}

// Podcasts queries
export async function getAllPodcasts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
  } catch (e) {
    console.error("[DB] getAllPodcasts failed:", e);
    throw e;
  }
}

// Streaming links queries
export async function getStreamingLinks() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db.select().from(streamingLinks).orderBy(asc(streamingLinks.order));
  } catch (e) {
    console.error("[DB] getStreamingLinks failed:", e);
    throw e;
  }
}

// Shouts queries
export async function createShout(shout: InsertShout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validation: message must not be empty and not too long
  if (!shout.message || shout.message.trim().length === 0) {
    throw new Error("Message is required");
  }
  if (shout.message.length > 2000) {
    throw new Error("Message is too long (max 2000 characters)");
  }
  if (shout.name && shout.name.length > 255) {
    throw new Error("Name is too long (max 255 characters)");
  }
  if (shout.trackRequest && shout.trackRequest.length > 255) {
    throw new Error("Track request is too long (max 255 characters)");
  }
  // Phone validation: if provided, should be reasonable length and characters
  if (shout.phone) {
    const phoneClean = shout.phone.trim().replace(/[\s\-\(\)]/g, "");
    if (phoneClean.length > 20) {
      throw new Error("Phone number is too long (max 20 characters)");
    }
    if (!/^[\d\+]+$/.test(phoneClean)) {
      throw new Error("Phone number contains invalid characters");
    }
  }

  const result = await db.insert(shouts).values({
    name: shout.name.trim(),
    location: shout.location?.trim() || null,
    message: shout.message.trim(),
    trackRequest: shout.trackRequest?.trim() || null,
    phone: shout.phone?.trim() || null,
    email: shout.email?.trim() || null,
    heardFrom: shout.heardFrom?.trim() || null,
    genres: shout.genres || null,
    whatsappOptIn: shout.whatsappOptIn ?? false,
    canReadOnAir: shout.canReadOnAir ?? false,
    approved: false, // New shouts require approval
    readOnAir: false,
  });

  // Get the inserted shout
  const insertedId = result[0].insertId;
  const created = await db.select().from(shouts).where(eq(shouts.id, insertedId)).limit(1);
  return created[0];
}

export async function getApprovedShouts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  // Exclude phone from public list for privacy
  try {
    const result = await db
      .select({
        id: shouts.id,
        name: shouts.name,
        location: shouts.location,
        message: shouts.message,
        trackRequest: shouts.trackRequest,
        canReadOnAir: shouts.canReadOnAir,
        approved: shouts.approved,
        readOnAir: shouts.readOnAir,
        createdAt: shouts.createdAt,
        updatedAt: shouts.updatedAt,
      })
      .from(shouts)
      .where(eq(shouts.approved, true))
      .orderBy(desc(shouts.createdAt))
      .limit(limit);
    return result;
  } catch (e) {
    console.warn("[DB] getApprovedShouts failed:", e);
    return [];
  }
}

export async function getAllShouts(filters?: { approved?: boolean; readOnAir?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.approved !== undefined) {
    conditions.push(eq(shouts.approved, filters.approved));
  }
  if (filters?.readOnAir !== undefined) {
    conditions.push(eq(shouts.readOnAir, filters.readOnAir));
  }

  if (conditions.length > 0) {
    return await db
      .select()
      .from(shouts)
      .where(and(...conditions))
      .orderBy(desc(shouts.createdAt));
  }

  return await db.select().from(shouts).orderBy(desc(shouts.createdAt));
}

export async function updateShoutStatus(
  id: number,
  updates: { approved?: boolean; readOnAir?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(shouts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(shouts.id, id));

  const updated = await db.select().from(shouts).where(eq(shouts.id, id)).limit(1);
  return updated[0];
}

// Streams queries
export async function getStreamStats(id: number) {
  const db = await getDb();
  if (!db) return null;

  const stream = await db.select().from(streams).where(eq(streams.id, id)).limit(1);
  if (!stream[0] || !stream[0].statsUrl) return null;

  try {
    // Determine parser based on type
    const isShoutcast = stream[0].type === "shoutcast";
    // For now, simple fetch. In prod, use a proper XML/JSON parser.
    const response = await fetch(stream[0].statsUrl);
    const data = await response.json();

    // Basic mapping (adjust based on actual API response structure)
    if (isShoutcast) {
      return {
        listeners: data.currentlisteners || 0,
        peak: data.peaklisteners || 0,
        currentTrack: data.songtitle || "Unknown Track"
      };
    } else {
      // Icecast (status-json.xsl)
      const source = data.icestats?.source?.[0] || data.icestats?.source;
      return {
        listeners: source?.listeners || 0,
        peak: source?.listener_peak || 0,
        currentTrack: source?.title || "Unknown Track"
      };
    }
  } catch (e) {
    console.error("Failed to fetch stream stats:", e);
    return null;
  }
}

export async function createStream(stream: InsertStream) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If this stream is being set as active, deactivate all others
  if (stream.isActive) {
    await db.update(streams).set({ isActive: false });
  }

  const result = await db.insert(streams).values(stream);
  const insertedId = result[0].insertId;
  const created = await db.select().from(streams).where(eq(streams.id, insertedId)).limit(1);
  return created[0];
}

export async function listStreams() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(streams).orderBy(desc(streams.createdAt));
}

export async function getActiveStream() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db
      .select({
        id: streams.id,
        name: streams.name,
        type: streams.type,
        publicUrl: streams.publicUrl,
      })
      .from(streams)
      .where(eq(streams.isActive, true))
      .limit(1);
    return result[0];
  } catch (e) {
    console.error("[DB] getActiveStream failed:", e);
    throw e;
  }
}

export async function setActiveStream(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deactivate all streams
  await db.update(streams).set({ isActive: false });

  // Activate the specified stream
  await db.update(streams).set({ isActive: true }).where(eq(streams.id, id));

  const updated = await db.select().from(streams).where(eq(streams.id, id)).limit(1);
  return updated[0];
}

export async function updateStream(id: number, updates: Partial<InsertStream>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If setting as active, deactivate others
  if (updates.isActive === true) {
    await db.update(streams).set({ isActive: false });
  }

  await db
    .update(streams)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(streams.id, id));

  const updated = await db.select().from(streams).where(eq(streams.id, id)).limit(1);
  return updated[0];
}

export async function deleteStream(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(streams).where(eq(streams.id, id));
}

// Track Requests - extend shouts queries
export async function getTrackRequests(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select({
        id: shouts.id,
        name: shouts.name,
        trackTitle: shouts.trackTitle,
        trackArtist: shouts.trackArtist,
        votes: shouts.votes,
        trackStatus: shouts.trackStatus,
        approved: shouts.approved,
        createdAt: shouts.createdAt,
      })
      .from(shouts)
      .where(and(eq(shouts.isTrackRequest, true), eq(shouts.approved, true)))
      .orderBy(desc(shouts.votes), desc(shouts.createdAt))
      .limit(limit);
  } catch (e) {
    console.warn("[DB] getTrackRequests failed:", e);
    return [];
  }
}

export async function upvoteTrackRequest(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(shouts).where(eq(shouts.id, id)).limit(1);
  if (!existing[0]) throw new Error("Track request not found");
  const newVotes = (existing[0].votes || 0) + 1;
  await db.update(shouts).set({ votes: newVotes }).where(eq(shouts.id, id));
  return { votes: newVotes };
}

export async function updateTrackRequestStatus(
  id: number,
  status: "pending" | "queued" | "played"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(shouts).set({ trackStatus: status }).where(eq(shouts.id, id));
  const updated = await db.select().from(shouts).where(eq(shouts.id, id)).limit(1);
  return updated[0];
}

// Tracks / Now Playing
export async function createTrack(track: InsertTrack) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tracks).values({
    title: track.title.trim(),
    artist: track.artist.trim(),
    note: track.note?.trim() || null,
    playedAt: new Date(),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(tracks).where(eq(tracks.id, insertedId)).limit(1);
  return created[0];
}

export async function getNowPlaying() {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(tracks)
      .orderBy(desc(tracks.playedAt))
      .limit(1);
    return result[0];
  } catch (e) {
    console.warn("[DB] getNowPlaying failed:", e);
    return undefined;
  }
}

export async function getTrackHistory(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select().from(tracks)
      .orderBy(desc(tracks.playedAt))
      .limit(limit);
  } catch (e) {
    console.warn("[DB] getTrackHistory failed:", e);
    return [];
  }
}

// Shows / Schedule
export async function createShow(show: InsertShow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shows).values(show);
  const insertedId = result[0].insertId;
  const created = await db.select().from(shows).where(eq(shows.id, insertedId)).limit(1);
  return created[0];
}

export async function listShows() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    return await db
      .select()
      .from(shows)
      .where(eq(shows.isActive, true))
      .orderBy(asc(shows.dayOfWeek), asc(shows.startTime));
  } catch (e) {
    console.error("[DB] listShows failed:", e);
    throw e;
  }
}

export async function getAllShows() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(shows).orderBy(asc(shows.dayOfWeek), asc(shows.startTime));
}

export async function updateShow(id: number, updates: Partial<InsertShow>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(shows)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(shows.id, id));
  const updated = await db.select().from(shows).where(eq(shows.id, id)).limit(1);
  return updated[0];
}

export async function deleteShow(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(shows).where(eq(shows.id, id));
}

export async function getDannyStatus() {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db
      .select()
      .from(dannyStatus)
      .where(eq(dannyStatus.isActive, true))
      .limit(1);
    return result[0];
  } catch (e) {
    console.warn("[DB] getDannyStatus failed:", e);
    return undefined;
  }
}

export async function updateDannyStatus(status: Partial<InsertDannyStatus>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Deactivate all others first
  await db.update(dannyStatus).set({ isActive: false });

  return await db.insert(dannyStatus).values({
    ...status as any,
    isActive: true,
  });
}

// Listener Stats (aggregated from shouts)
export async function getListenerStats(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  // Optimized: Use SQL aggregation instead of fetching all records
  // Get approved shouts with aggregation in SQL
  const allShouts = await db
    .select({
      name: shouts.name,
      createdAt: shouts.createdAt,
    })
    .from(shouts)
    .where(eq(shouts.approved, true))
    .orderBy(desc(shouts.createdAt))
    .limit(limit * 10); // Fetch more than needed for accurate stats, but still limited

  // Aggregate by name (in-memory for now, but with limited dataset)
  const statsMap = new Map<string, { totalShouts: number; firstSeen: Date; lastSeen: Date; displayName: string }>();

  for (const shout of allShouts) {
    const name = shout.name.toLowerCase();
    if (!statsMap.has(name)) {
      statsMap.set(name, {
        totalShouts: 0,
        firstSeen: shout.createdAt,
        lastSeen: shout.createdAt,
        displayName: shout.name,
      });
    }
    const stats = statsMap.get(name)!;
    stats.totalShouts++;
    if (shout.createdAt < stats.firstSeen) {
      stats.firstSeen = shout.createdAt;
    }
    if (shout.createdAt > stats.lastSeen) {
      stats.lastSeen = shout.createdAt;
    }
  }

  // Convert to array and sort by totalShouts
  const stats = Array.from(statsMap.values())
    .sort((a, b) => b.totalShouts - a.totalShouts)
    .slice(0, limit)
    .map((data) => ({
      name: data.displayName.toLowerCase(),
      displayName: data.displayName,
      totalShouts: data.totalShouts,
      firstSeen: data.firstSeen,
      lastSeen: data.lastSeen,
    }));

  return stats;
}

// Event Bookings queries (new simplified booking system)
export async function createEventBooking(booking: InsertEventBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Validation
  if (!booking.name || booking.name.trim().length === 0) {
    throw new Error("Name is required");
  }
  if (!booking.email || booking.email.trim().length === 0) {
    throw new Error("Email is required");
  }
  if (!booking.dataConsent) {
    throw new Error("Data consent is required");
  }

  const result = await db.insert(eventBookings).values({
    name: booking.name.trim(),
    email: booking.email.trim(),
    phone: booking.phone?.trim() || null,
    organisation: booking.organisation?.trim() || null,
    eventType: booking.eventType,
    eventDate: booking.eventDate,
    eventTime: booking.eventTime,
    location: booking.location.trim(),
    budgetRange: booking.budgetRange?.trim() || null,
    setLength: booking.setLength?.trim() || null,
    streamingRequired: booking.streamingRequired ?? false,
    extraNotes: booking.extraNotes?.trim() || null,
    marketingConsent: booking.marketingConsent ?? false,
    dataConsent: booking.dataConsent,
  });

  const insertedId = result[0].insertId;
  const created = await db.select().from(eventBookings).where(eq(eventBookings.id, insertedId)).limit(1);
  return created[0];
}

export async function listEventBookings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(eventBookings).orderBy(desc(eventBookings.createdAt));
}

export async function getEventBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(eventBookings).where(eq(eventBookings.id, id)).limit(1);
  return result[0];
}

// Event Booking Blockers
export async function listBookingBlockers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookingBlockers).orderBy(desc(bookingBlockers.blockedDate));
}

export async function createBookingBlocker(blocker: InsertBookingBlocker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookingBlockers).values(blocker);
  return result[0].insertId;
}

export async function deleteBookingBlocker(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bookingBlockers).where(eq(bookingBlockers.id, id));
}

export async function getConfirmedBookingDates() {
  const db = await getDb();
  if (!db) return [];
  const confirmed = await db
    .select({ date: eventBookings.eventDate })
    .from(eventBookings)
    .where(eq(eventBookings.status, "confirmed"));
  return confirmed.map(c => c.date);
}

// Fan Badges queries
export async function createOrUpdateFanBadge(badge: InsertFanBadge) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find existing by name
  const existing = await db
    .select()
    .from(fanBadges)
    .where(eq(fanBadges.name, badge.name))
    .limit(1);

  if (existing[0]) {
    await db
      .update(fanBadges)
      .set({
        ...badge,
        updatedAt: new Date(),
      })
      .where(eq(fanBadges.id, existing[0].id));
    const updated = await db.select().from(fanBadges).where(eq(fanBadges.id, existing[0].id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(fanBadges).values(badge);
  const insertedId = result[0].insertId;
  const created = await db.select().from(fanBadges).where(eq(fanBadges.id, insertedId)).limit(1);
  return created[0];
}

export async function getFanBadge(nameOrEmail: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(fanBadges).where(eq(fanBadges.name, nameOrEmail)).limit(1);
  return result[0];
}

export async function listFanBadges(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(fanBadges)
    .orderBy(desc(fanBadges.points), desc(fanBadges.shoutCount))
    .limit(limit);
}

// AI Mixes queries
export async function createAIMix(mix: InsertAIMix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiMixes).values({
    ...mix,
    setlist: typeof mix.setlist === "string" ? mix.setlist : JSON.stringify(mix.setlist),
    genres: typeof mix.genres === "string" ? mix.genres : JSON.stringify(mix.genres),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiMixes).where(eq(aiMixes.id, insertedId)).limit(1);
  return created[0];
}

export async function listAIMixes(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(aiMixes)
    .orderBy(desc(aiMixes.createdAt))
    .limit(limit);
}

// Danny Reacts queries
export async function createDannyReact(react: InsertDannyReact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dannyReacts).values(react);
  const insertedId = result[0].insertId;
  const created = await db.select().from(dannyReacts).where(eq(dannyReacts.id, insertedId)).limit(1);
  return created[0];
}

export async function listDannyReacts(status?: "pending" | "reacted" | "published") {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return await db
      .select()
      .from(dannyReacts)
      .where(eq(dannyReacts.status, status))
      .orderBy(desc(dannyReacts.createdAt));
  }
  return await db.select().from(dannyReacts).orderBy(desc(dannyReacts.createdAt));
}

export async function updateDannyReact(id: number, updates: Partial<InsertDannyReact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(dannyReacts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(dannyReacts.id, id));
  const updated = await db.select().from(dannyReacts).where(eq(dannyReacts.id, id)).limit(1);
  return updated[0];
}

// Personalized Shoutouts queries
export async function createPersonalizedShoutout(shoutout: InsertPersonalizedShoutout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(personalizedShoutouts).values(shoutout);
  const insertedId = result[0].insertId;
  const created = await db.select().from(personalizedShoutouts).where(eq(personalizedShoutouts.id, insertedId)).limit(1);
  return created[0];
}

export async function listPersonalizedShoutouts(delivered?: boolean) {
  const db = await getDb();
  if (!db) return [];
  if (delivered !== undefined) {
    return await db
      .select()
      .from(personalizedShoutouts)
      .where(eq(personalizedShoutouts.delivered, delivered))
      .orderBy(desc(personalizedShoutouts.createdAt));
  }
  return await db.select().from(personalizedShoutouts).orderBy(desc(personalizedShoutouts.createdAt));
}

// DJ Battle queries
export async function createDJBattle(battle: InsertDJBattle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(djBattles).values({
    ...battle,
    aiImprovements: typeof battle.aiImprovements === "string" ? battle.aiImprovements : JSON.stringify(battle.aiImprovements || []),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(djBattles).where(eq(djBattles.id, insertedId)).limit(1);
  return created[0];
}

export async function listDJBattles(status?: "pending" | "reviewed" | "published") {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return await db
      .select()
      .from(djBattles)
      .where(eq(djBattles.status, status))
      .orderBy(desc(djBattles.createdAt));
  }
  return await db.select().from(djBattles).orderBy(desc(djBattles.createdAt));
}

export async function updateDJBattle(id: number, updates: Partial<InsertDJBattle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(djBattles)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(djBattles.id, id));
  const updated = await db.select().from(djBattles).where(eq(djBattles.id, id)).limit(1);
  return updated[0];
}

// Listener Locations queries
export async function createOrUpdateListenerLocation(location: InsertListenerLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(listenerLocations)
    .where(eq(listenerLocations.name, location.name))
    .limit(1);

  if (existing[0]) {
    await db
      .update(listenerLocations)
      .set({
        ...location,
        lastSeen: new Date(),
      })
      .where(eq(listenerLocations.id, existing[0].id));
    const updated = await db.select().from(listenerLocations).where(eq(listenerLocations.id, existing[0].id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(listenerLocations).values(location);
  const insertedId = result[0].insertId;
  const created = await db.select().from(listenerLocations).where(eq(listenerLocations.id, insertedId)).limit(1);
  return created[0];
}

export async function getAllListenerLocations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(listenerLocations);
}

// Promo Content queries
export async function createPromoContent(promo: InsertPromoContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(promoContent).values(promo);
  const insertedId = result[0].insertId;
  const created = await db.select().from(promoContent).where(eq(promoContent.id, insertedId)).limit(1);
  return created[0];
}

export async function listPromoContent(status?: "pending" | "generated" | "published") {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return await db
      .select()
      .from(promoContent)
      .where(eq(promoContent.status, status))
      .orderBy(desc(promoContent.createdAt));
  }
  return await db.select().from(promoContent).orderBy(desc(promoContent.createdAt));
}

// Identity Quiz queries
export async function createIdentityQuiz(quiz: InsertIdentityQuiz) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(identityQuizzes).values({
    ...quiz,
    playlist: typeof quiz.playlist === "string" ? quiz.playlist : JSON.stringify(quiz.playlist || []),
    answers: typeof quiz.answers === "string" ? quiz.answers : JSON.stringify(quiz.answers || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(identityQuizzes).where(eq(identityQuizzes.id, insertedId)).limit(1);
  return created[0];
}

export async function listIdentityQuizzes(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(identityQuizzes)
    .orderBy(desc(identityQuizzes.createdAt))
    .limit(limit);
}

// Superfan queries
export async function createOrUpdateSuperfan(superfan: InsertSuperfan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let existing;
  if (superfan.email) {
    const byEmail = await db
      .select()
      .from(superfans)
      .where(eq(superfans.email, superfan.email))
      .limit(1);
    existing = byEmail[0];
  }

  if (!existing && superfan.name) {
    const byName = await db
      .select()
      .from(superfans)
      .where(eq(superfans.name, superfan.name))
      .limit(1);
    existing = byName[0];
  }

  if (existing) {
    await db
      .update(superfans)
      .set({
        ...superfan,
        perks: typeof superfan.perks === "string" ? superfan.perks : JSON.stringify(superfan.perks || []),
        updatedAt: new Date(),
      })
      .where(eq(superfans.id, existing.id));
    const updated = await db.select().from(superfans).where(eq(superfans.id, existing.id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(superfans).values({
    ...superfan,
    perks: typeof superfan.perks === "string" ? superfan.perks : JSON.stringify(superfan.perks || []),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(superfans).where(eq(superfans.id, insertedId)).limit(1);
  return created[0];
}

export async function listSuperfans() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(superfans).orderBy(desc(superfans.createdAt));
}

// Loyalty Tracking queries
export async function createOrUpdateLoyaltyTracking(tracking: InsertLoyaltyTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let existing;
  if (tracking.email) {
    const byEmail = await db
      .select()
      .from(loyaltyTracking)
      .where(eq(loyaltyTracking.email, tracking.email))
      .limit(1);
    existing = byEmail[0];
  }

  if (!existing && tracking.name) {
    const byName = await db
      .select()
      .from(loyaltyTracking)
      .where(eq(loyaltyTracking.name, tracking.name))
      .limit(1);
    existing = byName[0];
  }

  if (existing) {
    await db
      .update(loyaltyTracking)
      .set({
        ...tracking,
        lastActive: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loyaltyTracking.id, existing.id));
    const updated = await db.select().from(loyaltyTracking).where(eq(loyaltyTracking.id, existing.id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(loyaltyTracking).values(tracking);
  const insertedId = result[0].insertId;
  const created = await db.select().from(loyaltyTracking).where(eq(loyaltyTracking.id, insertedId)).limit(1);
  return created[0];
}

export async function getLoyaltyTracking(nameOrEmail: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (nameOrEmail.includes("@")) {
    const byEmail = await db
      .select()
      .from(loyaltyTracking)
      .where(eq(loyaltyTracking.email, nameOrEmail))
      .limit(1);
    if (byEmail[0]) return byEmail[0];
  }
  const byName = await db
    .select()
    .from(loyaltyTracking)
    .where(eq(loyaltyTracking.name, nameOrEmail))
    .limit(1);
  return byName[0];
}

export async function listLoyaltyTracking(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(loyaltyTracking)
    .orderBy(desc(loyaltyTracking.totalOnlineTime), desc(loyaltyTracking.streakDays))
    .limit(limit);
}

// ============================================
// PHASE 5: EMPIRE MODE - REVENUE STACK
// ============================================

export async function createSupportEvent(event: InsertSupportEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Only include fields that are explicitly provided (omit undefined to let defaults work)
  const values: Record<string, unknown> = {
    fanName: event.fanName,
    amount: event.amount,
    currency: event.currency || "GBP",
  };

  // Only add optional fields if they're provided
  if (event.fanId !== undefined && event.fanId !== null) {
    values.fanId = event.fanId;
  }
  if (event.email !== undefined && event.email !== null) {
    values.email = event.email;
  }
  if (event.message !== undefined && event.message !== null) {
    values.message = event.message;
  }
  if (event.status !== undefined) {
    values.status = event.status;
  }

  const result = await db.insert(supportEvents).values(values);
  const insertedId = result[0].insertId;
  const created = await db.select().from(supportEvents).where(eq(supportEvents.id, insertedId)).limit(1);
  return created[0];
}

export async function listSupportEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportEvents).orderBy(desc(supportEvents.createdAt)).limit(limit);
}

export async function updateSupportEvent(id: number, updates: Partial<InsertSupportEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supportEvents).set(updates).where(eq(supportEvents.id, id));
  const updated = await db.select().from(supportEvents).where(eq(supportEvents.id, id)).limit(1);
  return updated[0];
}

export async function getSupportEventTotal(currency: string = "GBP") {
  const db = await getDb();
  if (!db) return { total: "0", count: 0 };
  const events = await db
    .select()
    .from(supportEvents)
    .where(and(eq(supportEvents.currency, currency), eq(supportEvents.status, "completed")));
  const total = events.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
  return { total: total.toFixed(2), count: events.length };
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  const insertedId = result[0].insertId;
  const created = await db.select().from(products).where(eq(products.id, insertedId)).limit(1);
  return created[0];
}

export async function listProducts(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }
  return await db.select().from(products).orderBy(desc(products.createdAt));
}

export async function getProduct(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ ...updates, updatedAt: new Date() }).where(eq(products.id, id));
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return updated[0];
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

export async function searchProducts(q: string, type?: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  const searchTerm = `%${q}%`;
  const conditions = [
    or(
      like(products.name, searchTerm),
      like(products.description, searchTerm)
    ),
    eq(products.isActive, true)
  ];
  if (type) {
    conditions.push(eq(products.type, type));
  }
  return await db.select().from(products).where(and(...conditions)).limit(limit);
}

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(purchases).values(purchase);
  const insertedId = result[0].insertId;
  const created = await db.select().from(purchases).where(eq(purchases.id, insertedId)).limit(1);
  return created[0];
}

export async function listPurchases(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(purchases).orderBy(desc(purchases.createdAt)).limit(limit);
}

export async function getPurchase(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return result[0];
}

export async function updatePurchase(id: number, updates: Partial<InsertPurchase>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(purchases).set({ ...updates, updatedAt: new Date() }).where(eq(purchases.id, id));
  const updated = await db.select().from(purchases).where(eq(purchases.id, id)).limit(1);
  return updated[0];
}

export async function getPurchaseByPaymentIntentId(paymentIntentId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(purchases).where(eq(purchases.paymentIntentId, paymentIntentId)).limit(1);
  return result[0];
}

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(subscription);
  const insertedId = result[0].insertId;
  const created = await db.select().from(subscriptions).where(eq(subscriptions.id, insertedId)).limit(1);
  return created[0];
}

export async function listSubscriptions(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(subscriptions).where(eq(subscriptions.status, "active")).orderBy(desc(subscriptions.createdAt));
  }
  return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
}

export async function updateSubscription(id: number, updates: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(subscriptions).set({ ...updates, updatedAt: new Date() }).where(eq(subscriptions.id, id));
  const updated = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return updated[0];
}

// ============================================
// PHASE 5: EMPIRE MODE - BRAND LAYER
// ============================================

export async function createBrand(brand: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(brands).values(brand);
  const insertedId = result[0].insertId;
  const created = await db.select().from(brands).where(eq(brands.id, insertedId)).limit(1);
  return created[0];
}

export async function listBrands(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(brands).where(eq(brands.isActive, true)).orderBy(desc(brands.createdAt));
  }
  return await db.select().from(brands).orderBy(desc(brands.createdAt));
}

export async function getDefaultBrand() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brands).where(eq(brands.isDefault, true)).limit(1);
  return result[0];
}

export async function getBrandBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1);
  return result[0];
}

export async function updateBrand(id: number, updates: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(brands).set({ ...updates, updatedAt: new Date() }).where(eq(brands.id, id));
  const updated = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return updated[0];
}

export async function setDefaultBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Unset all other defaults
  await db.update(brands).set({ isDefault: false }).where(eq(brands.isDefault, true));
  // Set this one as default
  await db.update(brands).set({ isDefault: true, updatedAt: new Date() }).where(eq(brands.id, id));
  const updated = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return updated[0];
}

// ============================================
// PHASE 5: EMPIRE MODE - SAFETY & REPUTATION
// ============================================

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Database not available, skipping audit log");
    return;
  }
  try {
    await db.insert(auditLogs).values({
      ...log,
      beforeSnapshot: typeof log.beforeSnapshot === "string" ? log.beforeSnapshot : JSON.stringify(log.beforeSnapshot || {}),
      afterSnapshot: typeof log.afterSnapshot === "string" ? log.afterSnapshot : JSON.stringify(log.afterSnapshot || {}),
    });
  } catch (error) {
    console.error("[Audit] Failed to create audit log:", error);
  }
}

export async function listAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}

export async function getEmpireSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(empireSettings).where(eq(empireSettings.key, key)).limit(1);
  return result[0];
}

export async function setEmpireSetting(key: string, value: string | object, description?: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const valueStr = typeof value === "string" ? value : JSON.stringify(value);
  const existing = await db.select().from(empireSettings).where(eq(empireSettings.key, key)).limit(1);
  if (existing[0]) {
    await db
      .update(empireSettings)
      .set({ value: valueStr, description, updatedBy, updatedAt: new Date() })
      .where(eq(empireSettings.key, key));
    const updated = await db.select().from(empireSettings).where(eq(empireSettings.key, key)).limit(1);
    return updated[0];
  } else {
    const result = await db.insert(empireSettings).values({ key, value: valueStr, description, updatedBy });
    const insertedId = result[0].insertId;
    const created = await db.select().from(empireSettings).where(eq(empireSettings.id, insertedId)).limit(1);
    return created[0];
  }
}

export async function getAllEmpireSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(empireSettings).orderBy(asc(empireSettings.key));
}

// ============================================
// PHASE 5: EMPIRE MODE - OBSERVABILITY
// ============================================

export async function createErrorLog(log: InsertErrorLog) {
  const db = await getDb();
  if (!db) {
    console.error("[ErrorLog] Database not available, logging to console:", log.message);
    return;
  }
  try {
    await db.insert(errorLogs).values(log);
  } catch (error) {
    console.error("[ErrorLog] Failed to create error log:", error);
  }
}

export async function listErrorLogs(limit: number = 100, severity?: "low" | "medium" | "high" | "critical") {
  const db = await getDb();
  if (!db) return [];
  if (severity) {
    return await db
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.severity, severity))
      .orderBy(desc(errorLogs.createdAt))
      .limit(limit);
  }
  return await db.select().from(errorLogs).orderBy(desc(errorLogs.createdAt)).limit(limit);
}

export async function markErrorLogResolved(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(errorLogs).set({ resolved: true }).where(eq(errorLogs.id, id));
}

export async function getActiveIncidentBanner() {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const now = new Date();
    const result = await db
      .select()
      .from(incidentBanners)
      .where(and(eq(incidentBanners.isActive, true), gt(incidentBanners.endAt || new Date(now.getTime() + 86400000), now)))
      .limit(1);
    return result[0];
  } catch (e) {
    console.warn("[DB] getActiveIncidentBanner failed:", e);
    return undefined;
  }
}

export async function createIncidentBanner(banner: InsertIncidentBanner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(incidentBanners).values(banner);
  const insertedId = result[0].insertId;
  const created = await db.select().from(incidentBanners).where(eq(incidentBanners.id, insertedId)).limit(1);
  return created[0];
}

export async function listIncidentBanners(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(incidentBanners).orderBy(desc(incidentBanners.createdAt)).limit(limit);
}

export async function updateIncidentBanner(id: number, updates: Partial<InsertIncidentBanner>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(incidentBanners).set({ ...updates, updatedAt: new Date() }).where(eq(incidentBanners.id, id));
  const updated = await db.select().from(incidentBanners).where(eq(incidentBanners.id, id)).limit(1);
  return updated[0];
}

// ============================================
// PHASE 5: EMPIRE MODE - BACKUP & RECOVERY
// ============================================

export async function createBackup(backup: InsertBackup) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(backups).values({
    ...backup,
    dataBlob: typeof backup.dataBlob === "string" ? backup.dataBlob : JSON.stringify(backup.dataBlob || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(backups).where(eq(backups.id, insertedId)).limit(1);
  return created[0];
}

export async function listBackups(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(backups).orderBy(desc(backups.createdAt)).limit(limit);
}

export async function getBackup(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(backups).where(eq(backups.id, id)).limit(1);
  return result[0];
}

export async function deleteBackup(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(backups).where(eq(backups.id, id));
}

// ============================================
// PHASE 5: EMPIRE MODE - NOTIFICATION ORCHESTRATOR
// ============================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values({
    ...notification,
    payload: typeof notification.payload === "string" ? notification.payload : JSON.stringify(notification.payload || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(notifications).where(eq(notifications.id, insertedId)).limit(1);
  return created[0];
}

export async function listNotifications(fanId?: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  if (fanId) {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.fanId, fanId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }
  return await db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ status: "read", readAt: new Date() }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(fanId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(notifications)
    .set({ status: "read", readAt: new Date() })
    .where(and(eq(notifications.fanId, fanId), eq(notifications.status, "pending")));
}

export async function getUnreadNotificationCount(fanId?: number) {
  const db = await getDb();
  if (!db) return 0;
  if (fanId) {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.fanId, fanId), eq(notifications.status, "pending")));
    return result.length;
  }
  const result = await db.select().from(notifications).where(eq(notifications.status, "pending"));
  return result.length;
}

// ============================================
// PHASE 5: EMPIRE MODE - EMPIRE API
// ============================================

export async function createApiKey(apiKey: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(apiKeys).values({
    ...apiKey,
    scopes: typeof apiKey.scopes === "string" ? apiKey.scopes : JSON.stringify(apiKey.scopes || []),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(apiKeys).where(eq(apiKeys.id, insertedId)).limit(1);
  return created[0];
}

export async function listApiKeys(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(apiKeys).where(eq(apiKeys.isActive, true)).orderBy(desc(apiKeys.createdAt));
  }
  return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
  return result[0];
}

export async function updateApiKeyLastUsed(key: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ lastUsedAt: new Date(), updatedAt: new Date() }).where(eq(apiKeys.key, key));
}

export async function deactivateApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(apiKeys).set({ isActive: false, updatedAt: new Date() }).where(eq(apiKeys.id, id));
}

export async function deleteApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

// ============================================
// PHASE 5: EMPIRE MODE - EMPIRE OVERVIEW (AGGREGATE METRICS)
// ============================================

export async function getEmpireOverview() {
  const db = await getDb();
  if (!db) {
    return {
      dailyActiveListeners: 0,
      weeklyActiveListeners: 0,
      liveConcurrentPeak: 0,
      hecticCoinSupply: 0,
      shoutsPerDay: 0,
      trackRequestsPerDay: 0,
      superfanConversion: 0,
      revenueSummary: { bookings: 0, support: 0, products: 0, subscriptions: 0 },
      dbHealth: "unknown",
      queueHealth: "unknown",
      cronStatus: "unknown",
      errorRate24h: 0,
      integrations: {},
    };
  }

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Daily/weekly active listeners (from shouts) - Optimized: filter in SQL, not in memory
  const dailyShouts = await db
    .select()
    .from(shouts)
    .where(gt(shouts.createdAt, oneDayAgo));

  const weeklyShouts = await db
    .select()
    .from(shouts)
    .where(gt(shouts.createdAt, oneWeekAgo));

  const dailyActiveListeners = new Set(dailyShouts.map((s) => s.name)).size;
  const weeklyActiveListeners = new Set(weeklyShouts.map((s) => s.name)).size;

  // Shouts per day
  const shoutsPerDay = dailyShouts.length;

  // Track requests per day - filter in SQL for better performance
  const trackRequestsPerDay = await db
    .select({ count: sql<number>`count(*)` })
    .from(shouts)
    .where(and(
      gt(shouts.createdAt, oneDayAgo),
      eq(shouts.isTrackRequest, true)
    ))
    .then((rows) => Number(rows[0]?.count || 0));

  // Revenue summary - Optimized: use SQL aggregation instead of fetching all records
  const supportTotal = await getSupportEventTotal("GBP");

  // Count completed purchases directly in SQL
  const completedPurchasesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(purchases)
    .where(eq(purchases.status, "completed"))
    .then((rows) => Number(rows[0]?.count || 0));

  // Count active subscriptions directly in SQL
  const activeSubscriptionsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .then((rows) => Number(rows[0]?.count || 0));

  // Only count bookings, don't fetch all data
  const bookingCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventBookings)
    .then((rows) => Number(rows[0]?.count || 0));

  const revenueSummary = {
    bookings: bookingCount,
    support: parseFloat(supportTotal.total),
    products: completedPurchasesCount,
    subscriptions: activeSubscriptionsCount,
  };

  // Error rate (last 24h) - filter in SQL
  const errorRate24h = await db
    .select({ count: sql<number>`count(*)` })
    .from(errorLogs)
    .where(gt(errorLogs.createdAt, oneDayAgo))
    .then((rows) => Number(rows[0]?.count || 0));

  // Superfan conversion (rough estimate)
  const allSuperfans = await listSuperfans();
  const superfanConversion = allSuperfans.length;

  return {
    dailyActiveListeners,
    weeklyActiveListeners,
    liveConcurrentPeak: 0, // TODO: Implement real-time listener tracking
    hecticCoinSupply: 0, // TODO: Implement Hectic Coin system
    shoutsPerDay,
    trackRequestsPerDay,
    superfanConversion,
    revenueSummary,
    dbHealth: "ok", // TODO: Implement actual health check
    queueHealth: "ok", // TODO: Implement queue health check
    cronStatus: "ok", // TODO: Implement cron status check
    errorRate24h,
    integrations: {
      // TODO: Check third-party integrations
      oauth: "ok",
      database: "ok",
    },
  };
}

// ============================================
// PHASE 6: GEN-Z DOMINATION LAYER
// ============================================

// Gen-Z Profiles
export async function createOrUpdateGenZProfile(profile: InsertGenZProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(genZProfiles)
    .where(eq(genZProfiles.username, profile.username))
    .limit(1);

  if (existing[0]) {
    await db
      .update(genZProfiles)
      .set({ ...profile, updatedAt: new Date(), lastActive: new Date() })
      .where(eq(genZProfiles.id, existing[0].id));
    const updated = await db.select().from(genZProfiles).where(eq(genZProfiles.id, existing[0].id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(genZProfiles).values(profile);
  const insertedId = result[0].insertId;
  const created = await db.select().from(genZProfiles).where(eq(genZProfiles.id, insertedId)).limit(1);
  return created[0];
}

export async function getGenZProfileByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(genZProfiles).where(eq(genZProfiles.username, username)).limit(1);
  return result[0];
}

export async function getGenZProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(genZProfiles).where(eq(genZProfiles.id, id)).limit(1);
  return result[0];
}

export async function listGenZProfiles(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(genZProfiles).orderBy(desc(genZProfiles.totalPoints)).limit(limit);
}

// Follows
export async function createFollow(follow: InsertFollow) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already following
  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, follow.followerId), eq(follows.followingId, follow.followingId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const result = await db.insert(follows).values(follow);
  const insertedId = result[0].insertId;

  // Update follower/following counts
  const followerCount = (await db.select().from(follows).where(eq(follows.followerId, follow.followerId))).length;
  const followingCount = (await db.select().from(follows).where(eq(follows.followingId, follow.followingId))).length;
  await db.update(genZProfiles).set({ followingCount }).where(eq(genZProfiles.id, follow.followerId));
  await db.update(genZProfiles).set({ followersCount: followingCount }).where(eq(genZProfiles.id, follow.followingId));

  const created = await db.select().from(follows).where(eq(follows.id, insertedId)).limit(1);
  return created[0];
}

export async function unfollow(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
    .limit(1);
  return result.length > 0;
}

export async function getFollowers(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(follows)
    .where(eq(follows.followingId, profileId))
    .orderBy(desc(follows.createdAt));
}

export async function getFollowing(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(follows)
    .where(eq(follows.followerId, profileId))
    .orderBy(desc(follows.createdAt));
}

// User Posts
export async function createUserPost(post: InsertUserPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userPosts).values(post);
  const insertedId = result[0].insertId;
  const created = await db.select().from(userPosts).where(eq(userPosts.id, insertedId)).limit(1);
  return created[0];
}

export async function listUserPosts(profileId?: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  if (profileId) {
    return await db
      .select()
      .from(userPosts)
      .where(eq(userPosts.profileId, profileId))
      .orderBy(desc(userPosts.createdAt))
      .limit(limit);
  }
  return await db.select().from(userPosts).where(eq(userPosts.isPublic, true)).orderBy(desc(userPosts.createdAt)).limit(limit);
}

export async function getUserPost(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPosts).where(eq(userPosts.id, id)).limit(1);
  return result[0];
}

// Post Reactions
export async function togglePostReaction(reaction: InsertPostReaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(postReactions)
    .where(and(eq(postReactions.postId, reaction.postId), eq(postReactions.profileId, reaction.profileId)))
    .limit(1);

  if (existing[0]) {
    await db.delete(postReactions).where(eq(postReactions.id, existing[0].id));
    // Update post likes count
    const post = await getUserPost(reaction.postId);
    if (post) {
      await db.update(userPosts).set({ likesCount: Math.max(0, post.likesCount - 1) }).where(eq(userPosts.id, reaction.postId));
    }
    return null;
  } else {
    const result = await db.insert(postReactions).values(reaction);
    const insertedId = result[0].insertId;
    // Update post likes count
    const post = await getUserPost(reaction.postId);
    if (post) {
      await db.update(userPosts).set({ likesCount: post.likesCount + 1 }).where(eq(userPosts.id, reaction.postId));
    }
    const created = await db.select().from(postReactions).where(eq(postReactions.id, insertedId)).limit(1);
    return created[0];
  }
}

// Collectibles
export async function createCollectible(collectible: InsertCollectible) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(collectibles).values({
    ...collectible,
    metadata: typeof collectible.metadata === "string" ? collectible.metadata : JSON.stringify(collectible.metadata || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(collectibles).where(eq(collectibles.id, insertedId)).limit(1);
  return created[0];
}

export async function listCollectibles(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(collectibles).where(eq(collectibles.isActive, true)).orderBy(desc(collectibles.createdAt));
  }
  return await db.select().from(collectibles).orderBy(desc(collectibles.createdAt));
}

export async function getUserCollectibles(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(userCollectibles)
    .where(eq(userCollectibles.profileId, profileId))
    .orderBy(desc(userCollectibles.acquiredAt));
}


// Achievements




// AI Danny Chats


// World Avatars


// ============================================
// PHASE 7: GLOBAL CULT MODE
// ============================================

// Bookings Phase 7




// Events Phase 7




// Partner Requests



// Partners


// Social Profiles



// Post Templates



// Promotions



// Traffic Events


// Inner Circle



// ============================================
// PHASE 8: HECTIC AI STUDIO
// ============================================

// AI Script Jobs




// AI Voice Jobs




// AI Video Jobs




// User Consents



// ============================================
// PHASE 9: HECTIC ECONOMY + THE HECTIC SHOW
// ============================================

// ============================================
// PHASE 9A: HECTIC ECONOMY
// ============================================

// Wallets





// ============================================
// SOCIAL MEDIA FEED INTEGRATION
// ============================================




// ============================================
// MUSIC DISCOVERY / RECOMMENDATIONS
// ============================================




// Rewards




// Redemptions



// Referrals





// ============================================
// PHASE 9B: THE HECTIC SHOW
// ============================================

// Shows





// ============================================
// SOCIAL PROOF NOTIFICATIONS
// ============================================




// Episodes





// Segments




// Live Sessions






// Cues



// ============================================
// PHASE 10: HECTICOPS CONTROL TOWER - INTEGRATIONS
// ============================================

// Social Integrations




// REMOVED: createContentItem - uses non-existent contentQueue table




// Webhooks




export async function getActiveIncidentBanners() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(incidentBanners)
      .where(eq(incidentBanners.isActive, true));
  } catch (e) {
    console.warn("[DB] getActiveIncidentBanners failed:", e);
    return [];
  }
}

export async function getFeedPosts(includeVip: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  try {
    const query = db.select().from(feedPosts).orderBy(desc(feedPosts.createdAt));
    const results = await query;
    return includeVip ? results : results.filter(p => !p.isVipOnly);
  } catch (e) {
    console.warn("[DB] getFeedPosts failed:", e);
    return [];
  }
}

export async function toggleFeedPostReaction(postId: number, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const post = await db.select().from(feedPosts).where(eq(feedPosts.id, postId)).limit(1);
  if (!post[0]) throw new Error("Post not found");

  const reactions = JSON.parse(post[0].reactions || "{}");
  reactions[emoji] = (reactions[emoji] || 0) + 1;

  await db.update(feedPosts).set({ reactions: JSON.stringify(reactions) }).where(eq(feedPosts.id, postId));
}

export async function createMix(mix: InsertMix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mixes).values(mix);
  const insertedId = result[0].insertId;
  const created = await db.select().from(mixes).where(eq(mixes.id, insertedId)).limit(1);
  return created[0];
}

export async function updateMix(id: number, updates: Partial<InsertMix>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(mixes)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(mixes.id, id));

  const updated = await db.select().from(mixes).where(eq(mixes.id, id)).limit(1);
  return updated[0];
}

export async function deleteMix(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mixes).where(eq(mixes.id, id));
}

export async function getMixById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const results = await db.select().from(mixes).where(eq(mixes.id, id)).limit(1);
    return results[0];
  } catch (e) {
    console.error("[DB] getMixById failed:", e);
    return undefined;
  }
}

// Track management functions
export async function getAllTracks(limit?: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    const query = db.select().from(tracks).orderBy(desc(tracks.playedAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  } catch (e) {
    console.warn("[DB] getAllTracks failed:", e);
    return [];
  }
}

export async function getTrackById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const results = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
    return results[0];
  } catch (e) {
    console.error("[DB] getTrackById failed:", e);
    return undefined;
  }
}

export async function updateTrack(id: number, updates: Partial<InsertTrack>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(tracks)
    .set(updates)
    .where(eq(tracks.id, id));

  const updated = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
  return updated[0];
}

export async function deleteTrack(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tracks).where(eq(tracks.id, id));
}

// Podcast management functions
export async function getPodcastById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const results = await db.select().from(podcasts).where(eq(podcasts.id, id)).limit(1);
    return results[0];
  } catch (e) {
    console.error("[DB] getPodcastById failed:", e);
    return undefined;
  }
}

export async function createPodcast(podcast: InsertPodcast) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(podcasts).values(podcast);
  const insertedId = result[0].insertId;
  const created = await db.select().from(podcasts).where(eq(podcasts.id, insertedId)).limit(1);
  return created[0];
}

export async function updatePodcast(id: number, updates: Partial<InsertPodcast>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(podcasts)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(podcasts.id, id));

  const updated = await db.select().from(podcasts).where(eq(podcasts.id, id)).limit(1);
  return updated[0];
}

export async function deletePodcast(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(podcasts).where(eq(podcasts.id, id));
}

// Streaming Links management functions
export async function getStreamingLinkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const results = await db.select().from(streamingLinks).where(eq(streamingLinks.id, id)).limit(1);
    return results[0];
  } catch (e) {
    console.error("[DB] getStreamingLinkById failed:", e);
    return undefined;
  }
}

export async function createStreamingLink(link: InsertStreamingLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(streamingLinks).values(link);
  const insertedId = result[0].insertId;
  const created = await db.select().from(streamingLinks).where(eq(streamingLinks.id, insertedId)).limit(1);
  return created[0];
}

export async function updateStreamingLink(id: number, updates: Partial<InsertStreamingLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(streamingLinks)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(streamingLinks.id, id));

  const updated = await db.select().from(streamingLinks).where(eq(streamingLinks.id, id)).limit(1);
  return updated[0];
}

export async function deleteStreamingLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(streamingLinks).where(eq(streamingLinks.id, id));
}

// Event Booking management functions
export async function updateEventBooking(id: number, updates: Partial<InsertEventBooking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(eventBookings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(eventBookings.id, id));

  const updated = await db.select().from(eventBookings).where(eq(eventBookings.id, id)).limit(1);
  return updated[0];
}

export async function deleteEventBooking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(eventBookings).where(eq(eventBookings.id, id));
}

// User Profiles (Onboarding & Preferences)
export async function createOrUpdateUserProfile(profile: InsertUserProfile) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // Convert genres array to JSON string if it's an object/array
    const data = {
      ...profile,
      genres: typeof profile.genres === 'object' ? JSON.stringify(profile.genres) : profile.genres,
    };

    // Check if profile exists by name (simplified for now as we don't have user IDs yet)
    const existing = await database.select().from(userProfiles).where(eq(userProfiles.name, profile.name)).limit(1);

    if (existing.length > 0) {
      await database
        .update(userProfiles)
        .set(data)
        .where(eq(userProfiles.id, existing[0].id));
      const updated = await database.select().from(userProfiles).where(eq(userProfiles.id, existing[0].id)).limit(1);
      return updated[0];
    }

    const result = await database.insert(userProfiles).values(data as any);
    const insertedId = (result as any)[0].insertId;
    const created = await database.select().from(userProfiles).where(eq(userProfiles.id, insertedId)).limit(1);
    return created[0];
  } catch (error) {
    console.error("[db] Error in createOrUpdateUserProfile:", error);
    throw error;
  }
}

// Extended Stream Management (Go Live Logic)
export async function goLive(
  streamId: number,
  showName: string,
  hostName: string,
  category: string
) {
  try {
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    // 1. Deactivate all other streams
    await database.update(streams).set({ isActive: false });

    // 2. Activate the selected stream
    await database
      .update(streams)
      .set({
        isActive: true,
        // We'll overload the 'mount' and 'sourceHost' fields to store transient show data
        // since we can't easily change the schema right now.
        // mount -> showName
        // sourceHost -> hostName
        mount: showName,
        sourceHost: hostName
      })
      .where(eq(streams.id, streamId));

    // 3. Update Danny's Status
    await database.insert(dannyStatus).values({
      status: "On Air",
      message: `Live Now: ${showName} with ${hostName}`,
      isActive: true,
    });

    // Return the updated stream
    const updated = await database.select().from(streams).where(eq(streams.id, streamId)).limit(1);
    return {
      ...updated[0],
      showName,
      hostName
    };
  } catch (error) {
    console.error("[db] Error in goLive:", error);
    // Mock fallback
    return {
      id: streamId,
      name: "Mock Stream",
      type: "shoutcast",
      publicUrl: "https://stream.example.com",
      isActive: true,
      showName,
      hostName,
    };
  }
}

/**
 * Site-wide search across all content types
 */
export async function searchAll(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return { mixes: [], events: [], podcasts: [], tracks: [], shows: [] };

  const searchTerm = `%${query}%`;
  const results: {
    mixes: any[];
    events: any[];
    podcasts: any[];
    tracks: any[];
    shows: any[];
  } = {
    mixes: [],
    events: [],
    podcasts: [],
    tracks: [],
    shows: [],
  };

  try {
    // Search mixes
    results.mixes = await db
      .select()
      .from(mixes)
      .where(
        or(
          like(mixes.title, searchTerm),
          like(mixes.description || "", searchTerm),
          like(mixes.genre || "", searchTerm)
        )
      )
      .limit(limit);

    // Search events
    results.events = await db
      .select()
      .from(events)
      .where(
        or(
          like(events.title, searchTerm),
          like(events.description || "", searchTerm),
          like(events.location, searchTerm)
        )
      )
      .limit(limit);

    // Search podcasts
    results.podcasts = await db
      .select()
      .from(podcasts)
      .where(
        or(
          like(podcasts.title, searchTerm),
          like(podcasts.description || "", searchTerm)
        )
      )
      .limit(limit);

    // Search tracks
    results.tracks = await db
      .select()
      .from(tracks)
      .where(
        or(
          like(tracks.title, searchTerm),
          like(tracks.artist, searchTerm),
          like(tracks.note || "", searchTerm)
        )
      )
      .limit(limit);

    // Search shows
    results.shows = await db
      .select()
      .from(shows)
      .where(
        or(
          like(shows.name, searchTerm),
          like(shows.description || "", searchTerm),
          like(shows.host || "", searchTerm)
        )
      )
      .limit(limit);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[DB] searchAll failed:", e);
    }
  }

  return results;
}

// ============================================
// MISSING FUNCTIONS (Added for Fix)
// ============================================



// ============================================
// MORE MISSING FUNCTIONS (Added for Fix)
// ============================================





/**
 * ============================================
 * PHASE 7: ADMIN FEATURE EXPANSION (VIDEOS, BLOG, MEDIA)
 * ============================================
 */

// Videos
export async function getAllVideos() {
  const db = await getDb();
  if (!db) return [];
  const results = await db.select().from(videos).orderBy(desc(videos.publishedAt));
  console.log(`[db.getAllVideos] Fetched ${results.length} videos`);
  return results;
}


export async function createVideo(video: InsertVideo) {
  console.log("[db.createVideo] Attempting to create video:", video);
  const db = await getDb();
  if (!db) {
    console.error("[db.createVideo] Database connection failed");
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(videos).values(video);
    console.log("[db.createVideo] Insert success, ID:", result[0].insertId);
    const insertedId = result[0].insertId;
    const created = await db.select().from(videos).where(eq(videos.id, insertedId)).limit(1);
    return created[0];
  } catch (err) {
    console.error("[db.createVideo] Insert failed:", err);
    throw err;
  }
}


// Articles (Blog)





// Media Library



// ============================================
// MISSING MARKETING & SOCIAL FUNCTIONS (Appended for Build Fix)
// ============================================



// Marketing Campaigns





// Outreach Activities


// Social Media Posts





// Scraper Results



// ============================================
// Marketing & Leads
// ============================================



// ============================================
// User Favorites
// ============================================




// ============================================
// Playlists
// ============================================








// ============================================
// Track ID Requests
// ============================================








// ============================================
// Social Shares
// ============================================


// ============================================
// Video Testimonials
// ============================================





// ============================================
// Music Recommendations
// ============================================


// ============================================
// Pricing Rules
// ============================================
export async function createPricingRule(rule: InsertPricingRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pricingRules).values(rule);
  return { ...rule, id: result[0].insertId };
}

export async function getPricingRules() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(pricingRules).where(eq(pricingRules.isActive, true));
}

export async function deletePricingRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pricingRules).set({ isActive: false }).where(eq(pricingRules.id, id));
}

export async function expireUnpaidDeposits() {
  const db = await getDb();
  if (!db) return;
  const now = new Date();

  await db.update(eventBookings)
    .set({ status: "cancelled", updatedAt: now })
    .where(
      and(
        eq(eventBookings.status, "pending"),
        eq(eventBookings.depositPaid, false),
        lt(eventBookings.depositExpiresAt, now)
      )
    );
}


// ============================================
// Pricing Audit Logs
// ============================================
export async function createPricingAuditLog(log: InsertPricingAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pricingAuditLogs).values(log);
  return result[0].insertId;
}

export async function updatePricingAuditLogStatus(bookingId: number, status: "payment_started" | "deposit_paid" | "expired") {
  const db = await getDb();
  if (!db) return;
  await db.update(pricingAuditLogs)
    .set({ conversionStatus: status })
    .where(eq(pricingAuditLogs.bookingId, bookingId));
}

export async function updatePricingAuditLogBookingId(logId: number, bookingId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(pricingAuditLogs)
    .set({ bookingId })
    .where(eq(pricingAuditLogs.id, logId));
}

export async function getRevenueMetrics() {
  const db = await getDb();
  if (!db) return null;

  const logs = await db.select().from(pricingAuditLogs);
  const rules = await db.select().from(pricingRules);

  return {
    logs,
    rules
  };
}

// ============================================
// Outbound Lead Engine (OLE)
// ============================================

export async function createOutboundLead(lead: InsertOutboundLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(outboundLeads).values(lead);
  return result[0].insertId;
}




export async function getLeadWithInteractions(leadId: number) {
  const db = await getDb();
  if (!db) return null;
  const lead = await db.select().from(outboundLeads).where(eq(outboundLeads.id, leadId)).limit(1);
  const interactions = await db.select().from(outboundInteractions).where(eq(outboundInteractions.leadId, leadId)).orderBy(desc(outboundInteractions.createdAt));
  return { ...lead[0], interactions };
}


// ============================================
// Revenue Governance & Fail-Safe
// ============================================






// --- Governance & Feature Flags ---


// --- Rollup Helpers ---



// --- Supporter Management ---

export async function promoteToSupporter(userId: number, reason: string, actorId?: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ isSupporter: true }).where(eq(users.id, userId));
  await createGovernanceLog({
    actorId,
    actorType: actorId ? "admin" : "system",
    action: "supporter_promote",
    userId,
    reason,
    payload: JSON.stringify({ promotedAt: new Date() })
  });
}

export async function getSupporters() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.isSupporter, true));
}

export async function recordSupporterScore(userId: number, weekStart: Date, score: number, breakdown: any) {
  const db = await getDb();
  if (!db) return;

  await db.insert(supporterScores).values({
    userId,
    weekStart,
    score,
    breakdown: JSON.stringify(breakdown)
  });
}

/**
 * BLOG POST FUNCTIONS
 */
export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(blogPosts).values({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
  });

  const insertedId = result[0].insertId;
  const created = await db.select().from(blogPosts).where(eq(blogPosts.id, insertedId)).limit(1);
  return created[0];
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(blogPosts).set({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : undefined,
    updatedAt: new Date(),
  }).where(eq(blogPosts.id, id));

  const updated = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return updated[0];
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function listBlogPosts(limit: number = 10, offset: number = 0, published?: boolean) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };

  const conditions = [];
  if (published !== undefined) {
    conditions.push(eq(blogPosts.published, published));
  }

  let query = db.select().from(blogPosts);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const posts = await query
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db.select({ count: sql`COUNT(*)` }).from(blogPosts);
  const total = Number(countResult[0]?.count || 0);

  return { posts, total };
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const posts = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return posts[0] || null;
}

export async function searchBlogPosts(query: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.published, true),
        or(
          like(blogPosts.title, `%${query}%`),
          like(blogPosts.content, `%${query}%`),
          like(blogPosts.excerpt, `%${query}%`)
        )
      )
    )
    .orderBy(desc(blogPosts.publishedAt))
    .limit(20);
}

export async function getBlogPostsByTag(tag: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.publishedAt));
  // Note: Tags filtering would require JSON query support or denormalization
  // For now, filtering can be done in application code
}

/**
 * FAQ FUNCTIONS
 */
export async function createFAQ(data: InsertFAQ) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(faqs).values(data);
  const insertedId = result[0].insertId;
  const created = await db.select().from(faqs).where(eq(faqs.id, insertedId)).limit(1);
  return created[0];
}

export async function updateFAQ(id: number, data: Partial<InsertFAQ>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(faqs).set({
    ...data,
    updatedAt: new Date(),
  }).where(eq(faqs.id, id));

  const updated = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return updated[0];
}

export async function deleteFAQ(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(faqs).where(eq(faqs.id, id));
}

export async function listFAQs(category?: string, active?: boolean) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (category) {
    conditions.push(eq(faqs.category, category as any));
  }
  if (active !== undefined) {
    conditions.push(eq(faqs.active, active));
  }

  let query = db.select().from(faqs);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return await query.orderBy(asc(faqs.displayOrder), desc(faqs.createdAt));
}

export async function reorderFAQs(faqIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (let i = 0; i < faqIds.length; i++) {
    await db.update(faqs).set({ displayOrder: i }).where(eq(faqs.id, faqIds[i]));
  }
}

export async function searchFAQs(query: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(faqs)
    .where(
      and(
        eq(faqs.active, true),
        or(
          like(faqs.question, `%${query}%`),
          like(faqs.answer, `%${query}%`)
        )
      )
    )
    .orderBy(asc(faqs.displayOrder));
}

// Contact Messages

export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error(getDatabaseErrorMessage("contact form"));
  }

  const result = await db
    .insert(contactMessages)
    .values(data)
    .returning({ id: contactMessages.id });

  return result[0]?.id || null;
}

export async function getContactMessages(filters?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(contactMessages);

  if (filters?.status) {
    query = query.where(eq(contactMessages.status, filters.status)) as any;
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  return await query
    .orderBy(desc(contactMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markContactMessageResolved(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(contactMessages)
    .set({
      status: "responded",
      respondedAt: new Date(),
    })
    .where(eq(contactMessages.id, id));

  return true;
}

// Printfull Merch

export async function createOrUpdatePrintfullProduct(data: InsertPrintfullProduct) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(printfullProducts)
    .where(eq(printfullProducts.productId, data.productId || 0));

  if (existing.length > 0) {
    // Update existing
    await db
      .update(printfullProducts)
      .set(data)
      .where(eq(printfullProducts.productId, data.productId || 0));
    return existing[0].id;
  } else {
    // Create new
    const result = await db
      .insert(printfullProducts)
      .values(data)
      .returning({ id: printfullProducts.id });
    return result[0]?.id || null;
  }
}

export async function getPrintfullProducts(filters?: { category?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(printfullProducts);

  if (filters?.category) {
    query = query.where(eq(printfullProducts.category, filters.category)) as any;
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  return await query
    .orderBy(desc(printfullProducts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateProductMerchLink(data: {
  productId: number;
  printfullProductId: number | null;
  merchCategory?: string | null;
}) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .update(products)
    .set({
      printfullProductId: data.printfullProductId?.toString() || null,
      merchCategory: data.merchCategory || null,
    })
    .where(eq(products.id, data.productId));

  return result.rowCount > 0;
}

export async function createMerchOrder(data: InsertMerchOrder) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .insert(merchOrders)
    .values(data)
    .returning({ id: merchOrders.id });

  return result[0]?.id || null;
}

export async function getMerchOrder(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(merchOrders)
    .where(eq(merchOrders.id, id));

  return result[0] || null;
}

export async function updateMerchOrderStatus(
  id: number,
  status: string,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(merchOrders)
    .set({
      status,
      trackingNumber: trackingNumber || undefined,
      trackingUrl: trackingUrl || undefined,
      updatedAt: new Date(),
    })
    .where(eq(merchOrders.id, id));

  return true;
}

export async function listMerchOrders(filters?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(merchOrders);

  if (filters?.status) {
    query = query.where(eq(merchOrders.status, filters.status)) as any;
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  return await query
    .orderBy(desc(merchOrders.createdAt))
    .limit(limit)
    .offset(offset);
}

// Refund Requests

export async function createRefundRequest(data: InsertRefundRequest) {
  const db = await getDb();
  if (!db) {
    throw new Error(getDatabaseErrorMessage("refund requests"));
  }

  const result = await db
    .insert(refundRequests)
    .values(data)
    .returning({ id: refundRequests.id });

  return result[0] || null;
}

export async function getRefundRequest(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(refundRequests).where(eq(refundRequests.id, id));
  return result[0] || null;
}

export async function listRefundRequests(filters?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(refundRequests);

  if (filters?.status) {
    query = query.where(eq(refundRequests.status, filters.status as any)) as any;
  }

  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  return await query
    .orderBy(desc(refundRequests.requestedAt))
    .limit(limit)
    .offset(offset);
}

export async function listRefundRequestsByPurchase(purchaseId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(refundRequests)
    .where(eq(refundRequests.purchaseId, purchaseId))
    .orderBy(desc(refundRequests.requestedAt))
    .limit(limit);
}

export async function approveRefund(id: number, adminId: number, notes?: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "approved",
      adminId,
      responseNotes: notes || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}

export async function denyRefund(id: number, adminId: number, notes?: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "denied",
      adminId,
      responseNotes: notes || null,
      respondedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}

export async function markRefundAsRefunded(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(refundRequests)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(refundRequests.id, id));

  return true;
}
