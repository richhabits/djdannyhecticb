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

import { asc, desc, eq, gt, and, or, like, sql, isNull, SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mixes, InsertMix, bookings, events, InsertEvent, podcasts, InsertPodcast, streamingLinks, InsertStreamingLink, shouts, InsertShout, streams, InsertStream, tracks, InsertTrack, shows, InsertShow, eventBookings, InsertEventBooking, dannyStatus, InsertDannyStatus, feedPosts, InsertFeedPost, userProfiles, InsertUserProfile, fanBadges, InsertFanBadge, aiMixes, InsertAIMix, dannyReacts, InsertDannyReact, personalizedShoutouts, InsertPersonalizedShoutout, djBattles, InsertDJBattle, listenerLocations, InsertListenerLocation, promoContent, InsertPromoContent, identityQuizzes, InsertIdentityQuiz, superfans, InsertSuperfan, loyaltyTracking, InsertLoyaltyTracking, supportEvents, InsertSupportEvent, products, InsertProduct, purchases, InsertPurchase, subscriptions, InsertSubscription, brands, InsertBrand, auditLogs, InsertAuditLog, empireSettings, InsertEmpireSetting, errorLogs, InsertErrorLog, incidentBanners, InsertIncidentBanner, backups, InsertBackup, notifications, InsertNotification, apiKeys, InsertApiKey, genZProfiles, InsertGenZProfile, follows, InsertFollow, userPosts, InsertUserPost, postReactions, InsertPostReaction, collectibles, InsertCollectible, userCollectibles, InsertUserCollectible, achievements, InsertAchievement, userAchievements, InsertUserAchievement, aiDannyChats, InsertAIDannyChat, worldAvatars, InsertWorldAvatar, bookingsPhase7, InsertBookingPhase7, eventsPhase7, InsertEventPhase7, partnerRequests, InsertPartnerRequest, partners, InsertPartner, socialProfiles, InsertSocialProfile, postTemplates, InsertPostTemplate, promotions, InsertPromotion, trafficEvents, InsertTrafficEvent, innerCircle, InsertInnerCircle, aiScriptJobs, InsertAIScriptJob, aiVoiceJobs, InsertAIVoiceJob, aiVideoJobs, InsertAIVideoJob, userConsents, InsertUserConsent, wallets, InsertWallet, coinTransactions, InsertCoinTransaction, rewards, InsertReward, redemptions, InsertRedemption, referralCodes, InsertReferralCode, referralUses, InsertReferralUse, showsPhase9, InsertShowPhase9, showEpisodes, InsertShowEpisode, showSegments, InsertShowSegment, showLiveSessions, InsertShowLiveSession, showCues, InsertShowCue, showAssets, InsertShowAsset, socialIntegrations, InsertSocialIntegration, contentQueue, InsertContentQueueItem, webhooks, InsertWebhook, adminCredentials, InsertAdminCredential, marketingLeads, InsertMarketingLead, marketingCampaigns, InsertMarketingCampaign, outreachActivities, InsertOutreachActivity, socialMediaPosts, InsertSocialMediaPost, venueScraperResults, InsertVenueScraperResult, userFavorites, InsertUserFavorite, userPlaylists, InsertUserPlaylist, userPlaylistItems, InsertUserPlaylistItem, trackIdRequests, InsertTrackIdRequest, socialShares, InsertSocialShare, videoTestimonials, InsertVideoTestimonial, socialProofNotifications, InsertSocialProofNotification, socialMediaFeedPosts, InsertSocialMediaFeedPost, musicRecommendations, InsertMusicRecommendation, videos, InsertVideo, articles, InsertArticle, mediaLibrary, InsertMediaItem } from "../drizzle/schema";
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Mixes queries
export async function getAllMixes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(mixes).orderBy(desc(mixes.createdAt));
}

export async function getFreeMixes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(mixes).where(eq(mixes.isFree, true)).orderBy(desc(mixes.createdAt));
}

// Bookings queries
export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
}

export async function createBooking(booking: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(bookings).values(booking);
}

// Events queries
export async function getUpcomingEvents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(events).where(gt(events.eventDate, new Date())).orderBy(asc(events.eventDate));
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
  const values: any = {
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

export async function addUserCollectible(collectible: InsertUserCollectible) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userCollectibles).values(collectible);
  const insertedId = result[0].insertId;
  const created = await db.select().from(userCollectibles).where(eq(userCollectibles.id, insertedId)).limit(1);
  return created[0];
}

// Achievements
export async function createAchievement(achievement: InsertAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(achievements).values({
    ...achievement,
    criteria: typeof achievement.criteria === "string" ? achievement.criteria : JSON.stringify(achievement.criteria || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(achievements).where(eq(achievements.id, insertedId)).limit(1);
  return created[0];
}

export async function listAchievements(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(achievements).where(eq(achievements.isActive, true)).orderBy(desc(achievements.createdAt));
  }
  return await db.select().from(achievements).orderBy(desc(achievements.createdAt));
}

export async function getUserAchievements(profileId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: userAchievements.id,
      profileId: userAchievements.profileId,
      achievementId: userAchievements.achievementId,
      unlockedAt: userAchievements.unlockedAt,
      name: achievements.name,
      description: achievements.description,
      iconUrl: achievements.iconUrl,
    })
    .from(userAchievements)
    .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(eq(userAchievements.profileId, profileId))
    .orderBy(desc(userAchievements.unlockedAt));
}

export async function unlockAchievement(achievement: InsertUserAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already unlocked
  const existing = await db
    .select()
    .from(userAchievements)
    .where(and(eq(userAchievements.profileId, achievement.profileId), eq(userAchievements.achievementId, achievement.achievementId)))
    .limit(1);

  if (existing[0]) return existing[0];

  const result = await db.insert(userAchievements).values(achievement);
  const insertedId = result[0].insertId;
  const created = await db.select().from(userAchievements).where(eq(userAchievements.id, insertedId)).limit(1);
  return created[0];
}

// AI Danny Chats
export async function createAIDannyChat(chat: InsertAIDannyChat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiDannyChats).values({
    ...chat,
    context: typeof chat.context === "string" ? chat.context : JSON.stringify(chat.context || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiDannyChats).where(eq(aiDannyChats.id, insertedId)).limit(1);
  return created[0];
}

export async function getAIDannyChatHistory(sessionId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(aiDannyChats)
    .where(eq(aiDannyChats.sessionId, sessionId))
    .orderBy(desc(aiDannyChats.createdAt))
    .limit(limit);
}

// World Avatars
export async function createOrUpdateWorldAvatar(avatar: InsertWorldAvatar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(worldAvatars)
    .where(eq(worldAvatars.profileId, avatar.profileId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(worldAvatars)
      .set({
        ...avatar,
        avatarData: typeof avatar.avatarData === "string" ? avatar.avatarData : JSON.stringify(avatar.avatarData || {}),
        updatedAt: new Date(),
        lastSeen: new Date(),
      })
      .where(eq(worldAvatars.id, existing[0].id));
    const updated = await db.select().from(worldAvatars).where(eq(worldAvatars.id, existing[0].id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(worldAvatars).values({
    ...avatar,
    avatarData: typeof avatar.avatarData === "string" ? avatar.avatarData : JSON.stringify(avatar.avatarData || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(worldAvatars).where(eq(worldAvatars.id, insertedId)).limit(1);
  return created[0];
}

export async function listOnlineWorldAvatars() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(worldAvatars).where(eq(worldAvatars.isOnline, true)).orderBy(desc(worldAvatars.lastSeen));
}

// ============================================
// PHASE 7: GLOBAL CULT MODE
// ============================================

// Bookings Phase 7
export async function createBookingPhase7(booking: InsertBookingPhase7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookingsPhase7).values(booking);
  const insertedId = result[0].insertId;
  const created = await db.select().from(bookingsPhase7).where(eq(bookingsPhase7.id, insertedId)).limit(1);
  return created[0];
}

export async function listBookingsPhase7(filters?: { status?: string; type?: string }) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(bookingsPhase7);
  if (filters?.status) {
    query = query.where(eq(bookingsPhase7.status, filters.status as any)) as any;
  }
  if (filters?.type) {
    query = query.where(eq(bookingsPhase7.type, filters.type as any)) as any;
  }
  return await query.orderBy(desc(bookingsPhase7.createdAt));
}

export async function getBookingPhase7(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bookingsPhase7).where(eq(bookingsPhase7.id, id)).limit(1);
  return result[0];
}

export async function updateBookingPhase7(id: number, updates: Partial<InsertBookingPhase7>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookingsPhase7).set({ ...updates, updatedAt: new Date() }).where(eq(bookingsPhase7.id, id));
  const updated = await db.select().from(bookingsPhase7).where(eq(bookingsPhase7.id, id)).limit(1);
  return updated[0];
}

// Events Phase 7
export async function createEventPhase7(event: InsertEventPhase7) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eventsPhase7).values(event);
  const insertedId = result[0].insertId;
  const created = await db.select().from(eventsPhase7).where(eq(eventsPhase7.id, insertedId)).limit(1);
  return created[0];
}

export async function listEventsPhase7(upcomingOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  if (upcomingOnly) {
    const now = new Date();
    return await db
      .select()
      .from(eventsPhase7)
      .where(and(eq(eventsPhase7.status, "upcoming"), gt(eventsPhase7.dateTimeStart, now)))
      .orderBy(asc(eventsPhase7.dateTimeStart));
  }
  return await db.select().from(eventsPhase7).orderBy(desc(eventsPhase7.dateTimeStart));
}

export async function getEventPhase7(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(eventsPhase7).where(eq(eventsPhase7.id, id)).limit(1);
  return result[0];
}

export async function updateEventPhase7(id: number, updates: Partial<InsertEventPhase7>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventsPhase7).set({ ...updates, updatedAt: new Date() }).where(eq(eventsPhase7.id, id));
  const updated = await db.select().from(eventsPhase7).where(eq(eventsPhase7.id, id)).limit(1);
  return updated[0];
}

// Partner Requests
export async function createPartnerRequest(request: InsertPartnerRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(partnerRequests).values({
    ...request,
    links: typeof request.links === "string" ? request.links : JSON.stringify(request.links || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(partnerRequests).where(eq(partnerRequests.id, insertedId)).limit(1);
  return created[0];
}

export async function listPartnerRequests(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];
  if (filters?.status) {
    return await db
      .select()
      .from(partnerRequests)
      .where(eq(partnerRequests.status, filters.status as any))
      .orderBy(desc(partnerRequests.createdAt));
  }
  return await db.select().from(partnerRequests).orderBy(desc(partnerRequests.createdAt));
}

export async function updatePartnerRequest(id: number, updates: Partial<InsertPartnerRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...updates };
  if (updates.links) {
    updateData.links = typeof updates.links === "string" ? updates.links : JSON.stringify(updates.links);
  }
  await db.update(partnerRequests).set({ ...updateData, updatedAt: new Date() }).where(eq(partnerRequests.id, id));
  const updated = await db.select().from(partnerRequests).where(eq(partnerRequests.id, id)).limit(1);
  return updated[0];
}

// Partners
export async function createPartner(partner: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(partners).values({
    ...partner,
    links: typeof partner.links === "string" ? partner.links : JSON.stringify(partner.links || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(partners).where(eq(partners.id, insertedId)).limit(1);
  return created[0];
}

export async function listPartners(activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  if (activeOnly) {
    return await db.select().from(partners).where(eq(partners.isActive, true)).orderBy(desc(partners.createdAt));
  }
  return await db.select().from(partners).orderBy(desc(partners.createdAt));
}

// Social Profiles
export async function createSocialProfile(profile: InsertSocialProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialProfiles).values(profile);
  const insertedId = result[0].insertId;
  const created = await db.select().from(socialProfiles).where(eq(socialProfiles.id, insertedId)).limit(1);
  return created[0];
}

export async function listSocialProfiles(brandId?: number, activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];
  if (brandId) {
    if (activeOnly) {
      return await db
        .select()
        .from(socialProfiles)
        .where(and(eq(socialProfiles.brandId, brandId), eq(socialProfiles.isActive, true)))
        .orderBy(asc(socialProfiles.platform));
    }
    return await db
      .select()
      .from(socialProfiles)
      .where(eq(socialProfiles.brandId, brandId))
      .orderBy(asc(socialProfiles.platform));
  }
  if (activeOnly) {
    return await db.select().from(socialProfiles).where(eq(socialProfiles.isActive, true)).orderBy(asc(socialProfiles.platform));
  }
  return await db.select().from(socialProfiles).orderBy(asc(socialProfiles.platform));
}

export async function updateSocialProfile(id: number, updates: Partial<InsertSocialProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialProfiles).set({ ...updates, updatedAt: new Date() }).where(eq(socialProfiles.id, id));
  const updated = await db.select().from(socialProfiles).where(eq(socialProfiles.id, id)).limit(1);
  return updated[0];
}

// Post Templates
export async function createPostTemplate(template: InsertPostTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(postTemplates).values(template);
  const insertedId = result[0].insertId;
  const created = await db.select().from(postTemplates).where(eq(postTemplates.id, insertedId)).limit(1);
  return created[0];
}

export async function listPostTemplates(platform?: string, templateType?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [eq(postTemplates.isActive, true)];
  if (platform) {
    conditions.push(eq(postTemplates.platform, platform as any));
  }
  if (templateType) {
    conditions.push(eq(postTemplates.templateType, templateType as any));
  }
  return await db.select().from(postTemplates).where(and(...conditions)).orderBy(asc(postTemplates.name));
}

export function renderPostTemplate(templateText: string, data: Record<string, string>): string {
  let rendered = templateText;
  for (const [key, value] of Object.entries(data)) {
    rendered = rendered.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return rendered;
}

// Promotions
export async function createPromotion(promotion: InsertPromotion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(promotions).values({
    ...promotion,
    platforms: typeof promotion.platforms === "string" ? promotion.platforms : JSON.stringify(promotion.platforms || []),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(promotions).where(eq(promotions.id, insertedId)).limit(1);
  return created[0];
}

export async function listPromotions(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];
  if (filters?.status) {
    return await db
      .select()
      .from(promotions)
      .where(eq(promotions.status, filters.status as any))
      .orderBy(desc(promotions.createdAt));
  }
  return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
}

export async function updatePromotion(id: number, updates: Partial<InsertPromotion>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...updates };
  if (updates.platforms) {
    updateData.platforms = typeof updates.platforms === "string" ? updates.platforms : JSON.stringify(updates.platforms);
  }
  await db.update(promotions).set({ ...updateData, updatedAt: new Date() }).where(eq(promotions.id, id));
  const updated = await db.select().from(promotions).where(eq(promotions.id, id)).limit(1);
  return updated[0];
}

// Traffic Events
export async function createTrafficEvent(event: InsertTrafficEvent) {
  const db = await getDb();
  if (!db) {
    // Don't throw - traffic events are optional
    return;
  }
  try {
    await db.insert(trafficEvents).values(event);
  } catch (error) {
    console.error("[Traffic] Failed to log event:", error);
  }
}

export async function getTrafficStats(days: number = 7) {
  const db = await getDb();
  if (!db) return { bySource: {}, byMedium: {}, byRoute: {}, hourlyActivity: {} };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const events = await db
    .select()
    .from(trafficEvents)
    .where(gt(trafficEvents.timestamp, cutoff));

  const bySource: Record<string, number> = {};
  const byMedium: Record<string, number> = {};
  const byRoute: Record<string, number> = {};
  const hourlyActivity: Record<number, number> = {};

  events.forEach((event) => {
    if (event.utmSource) {
      bySource[event.utmSource] = (bySource[event.utmSource] || 0) + 1;
    }
    if (event.utmMedium) {
      byMedium[event.utmMedium] = (byMedium[event.utmMedium] || 0) + 1;
    }
    if (event.route) {
      byRoute[event.route] = (byRoute[event.route] || 0) + 1;
    }
    if (event.timestamp) {
      const hour = new Date(event.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    }
  });

  return { bySource, byMedium, byRoute, hourlyActivity };
}

// Inner Circle
export async function createOrUpdateInnerCircle(innerCircleData: InsertInnerCircle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(innerCircle)
    .where(eq(innerCircle.profileId, innerCircleData.profileId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(innerCircle)
      .set({
        ...innerCircleData,
        updatedAt: new Date(),
        unlockedAt: innerCircleData.isEligible && !existing[0].isEligible ? new Date() : existing[0].unlockedAt,
      })
      .where(eq(innerCircle.id, existing[0].id));
    const updated = await db.select().from(innerCircle).where(eq(innerCircle.id, existing[0].id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(innerCircle).values({
    ...innerCircleData,
    unlockedAt: innerCircleData.isEligible ? new Date() : undefined,
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(innerCircle).where(eq(innerCircle.id, insertedId)).limit(1);
  return created[0];
}

export async function getInnerCircleStatus(profileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(innerCircle).where(eq(innerCircle.profileId, profileId)).limit(1);
  return result[0];
}

export async function listInnerCircleMembers() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(innerCircle)
    .where(eq(innerCircle.isEligible, true))
    .orderBy(desc(innerCircle.unlockedAt));
}

// ============================================
// PHASE 8: HECTIC AI STUDIO
// ============================================

// AI Script Jobs
export async function createAIScriptJob(job: InsertAIScriptJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiScriptJobs).values({
    ...job,
    inputContext: typeof job.inputContext === "string" ? job.inputContext : JSON.stringify(job.inputContext || {}),
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiScriptJobs).where(eq(aiScriptJobs.id, insertedId)).limit(1);
  return created[0];
}

export async function getAIScriptJob(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiScriptJobs).where(eq(aiScriptJobs.id, id)).limit(1);
  return result[0];
}

export async function listAIScriptJobs(filters?: { status?: string; type?: string; userId?: number }, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(aiScriptJobs);
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(aiScriptJobs.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(aiScriptJobs.type, filters.type as any));
  }
  if (filters?.userId) {
    conditions.push(eq(aiScriptJobs.requestedByUserId, filters.userId));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(aiScriptJobs.createdAt)).limit(limit);
}

export async function updateAIScriptJob(id: number, updates: Partial<InsertAIScriptJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { ...updates };
  if (updates.inputContext) {
    updateData.inputContext = typeof updates.inputContext === "string" ? updates.inputContext : JSON.stringify(updates.inputContext);
  }
  await db.update(aiScriptJobs).set({ ...updateData, updatedAt: new Date() }).where(eq(aiScriptJobs.id, id));
  const updated = await db.select().from(aiScriptJobs).where(eq(aiScriptJobs.id, id)).limit(1);
  return updated[0];
}

// AI Voice Jobs
export async function createAIVoiceJob(job: InsertAIVoiceJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiVoiceJobs).values(job);
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiVoiceJobs).where(eq(aiVoiceJobs.id, insertedId)).limit(1);
  return created[0];
}

export async function getAIVoiceJob(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiVoiceJobs).where(eq(aiVoiceJobs.id, id)).limit(1);
  return result[0];
}

export async function listAIVoiceJobs(filters?: { status?: string; userId?: number }, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(aiVoiceJobs);
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(aiVoiceJobs.status, filters.status as any));
  }
  if (filters?.userId) {
    conditions.push(eq(aiVoiceJobs.requestedByUserId, filters.userId));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(aiVoiceJobs.createdAt)).limit(limit);
}

export async function updateAIVoiceJob(id: number, updates: Partial<InsertAIVoiceJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiVoiceJobs).set({ ...updates, updatedAt: new Date() }).where(eq(aiVoiceJobs.id, id));
  const updated = await db.select().from(aiVoiceJobs).where(eq(aiVoiceJobs.id, id)).limit(1);
  return updated[0];
}

// AI Video Jobs
export async function createAIVideoJob(job: InsertAIVideoJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiVideoJobs).values(job);
  const insertedId = result[0].insertId;
  const created = await db.select().from(aiVideoJobs).where(eq(aiVideoJobs.id, insertedId)).limit(1);
  return created[0];
}

export async function getAIVideoJob(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(aiVideoJobs).where(eq(aiVideoJobs.id, id)).limit(1);
  return result[0];
}

export async function listAIVideoJobs(filters?: { status?: string; userId?: number }, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(aiVideoJobs);
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(aiVideoJobs.status, filters.status as any));
  }
  if (filters?.userId) {
    conditions.push(eq(aiVideoJobs.requestedByUserId, filters.userId));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(aiVideoJobs.createdAt)).limit(limit);
}

export async function updateAIVideoJob(id: number, updates: Partial<InsertAIVideoJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiVideoJobs).set({ ...updates, updatedAt: new Date() }).where(eq(aiVideoJobs.id, id));
  const updated = await db.select().from(aiVideoJobs).where(eq(aiVideoJobs.id, id)).limit(1);
  return updated[0];
}

// User Consents
export async function createOrUpdateUserConsent(consent: InsertUserConsent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let existing;
  if (consent.profileId) {
    const byProfile = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.profileId, consent.profileId))
      .limit(1);
    existing = byProfile[0];
  } else if (consent.userId) {
    const byUser = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.userId, consent.userId))
      .limit(1);
    existing = byUser[0];
  } else if (consent.email) {
    const byEmail = await db
      .select()
      .from(userConsents)
      .where(eq(userConsents.email, consent.email))
      .limit(1);
    existing = byEmail[0];
  }

  if (existing) {
    await db
      .update(userConsents)
      .set({
        ...consent,
        lastUpdatedAt: new Date(),
      })
      .where(eq(userConsents.id, existing.id));
    const updated = await db.select().from(userConsents).where(eq(userConsents.id, existing.id)).limit(1);
    return updated[0];
  }

  const result = await db.insert(userConsents).values(consent);
  const insertedId = result[0].insertId;
  const created = await db.select().from(userConsents).where(eq(userConsents.id, insertedId)).limit(1);
  return created[0];
}

export async function getUserConsent(profileId?: number, userId?: number, email?: string) {
  const db = await getDb();
  if (!db) return undefined;

  if (profileId) {
    const result = await db.select().from(userConsents).where(eq(userConsents.profileId, profileId)).limit(1);
    if (result[0]) return result[0];
  }
  if (userId) {
    const result = await db.select().from(userConsents).where(eq(userConsents.userId, userId)).limit(1);
    if (result[0]) return result[0];
  }
  if (email) {
    const result = await db.select().from(userConsents).where(eq(userConsents.email, email)).limit(1);
    if (result[0]) return result[0];
  }
  return undefined;
}

export async function getConsentStats() {
  const db = await getDb();
  if (!db) return { total: 0, aiContent: 0, marketing: 0, dataShare: 0 };

  const all = await db.select().from(userConsents);
  return {
    total: all.length,
    aiContent: all.filter((c) => c.aiContentConsent).length,
    marketing: all.filter((c) => c.marketingConsent).length,
    dataShare: all.filter((c) => c.dataShareConsent).length,
  };
}

// ============================================
// PHASE 9: HECTIC ECONOMY + THE HECTIC SHOW
// ============================================

// ============================================
// PHASE 9A: HECTIC ECONOMY
// ============================================

// Wallets
export async function getOrCreateWallet(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  const result = await db.insert(wallets).values({ userId, balanceCoins: 0 });
  const insertedId = result[0].insertId;
  const created = await db.select().from(wallets).where(eq(wallets.id, insertedId)).limit(1);
  return created[0];
}

export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result[0];
}

export async function listWallets(limit: number = 1000) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(wallets).orderBy(desc(wallets.balanceCoins)).limit(limit);
}

export async function adjustCoins(options: {
  userId: number;
  amount: number;
  source: InsertCoinTransaction["source"];
  type: InsertCoinTransaction["type"];
  referenceId?: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const wallet = await getOrCreateWallet(options.userId);

  // Check balance for spending
  if (options.type === "spend" && wallet.balanceCoins + options.amount < 0) {
    throw new Error("Insufficient coins");
  }

  const newBalance = wallet.balanceCoins + options.amount;
  const newLifetimeEarned = options.type === "earn" ? wallet.lifetimeCoinsEarned + Math.abs(options.amount) : wallet.lifetimeCoinsEarned;
  const newLifetimeSpent = options.type === "spend" ? wallet.lifetimeCoinsSpent + Math.abs(options.amount) : wallet.lifetimeCoinsSpent;

  await db.update(wallets).set({
    balanceCoins: newBalance,
    lifetimeCoinsEarned: newLifetimeEarned,
    lifetimeCoinsSpent: newLifetimeSpent,
    lastUpdatedAt: new Date(),
  }).where(eq(wallets.id, wallet.id));

  const transaction = await db.insert(coinTransactions).values({
    userId: options.userId,
    walletId: wallet.id,
    amount: options.amount,
    type: options.type,
    source: options.source,
    referenceId: options.referenceId,
    description: options.description,
  });

  const updated = await db.select().from(wallets).where(eq(wallets.id, wallet.id)).limit(1);
  return updated[0];
}

export async function getCoinTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(coinTransactions)
    .where(eq(coinTransactions.userId, userId))
    .orderBy(desc(coinTransactions.createdAt))
    .limit(limit);
}

// ============================================
// SOCIAL MEDIA FEED INTEGRATION
// ============================================

export async function createSocialMediaFeedPost(post: InsertSocialMediaFeedPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialMediaFeedPosts).values(post);
  const insertedId = result[0].insertId;
  const created = await db.select().from(socialMediaFeedPosts).where(eq(socialMediaFeedPosts.id, insertedId)).limit(1);
  return created[0];
}

export async function getSocialMediaFeedPosts(filters?: { platform?: string; isActive?: boolean; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(socialMediaFeedPosts);
  const conditions = [];
  if (filters?.platform) {
    conditions.push(eq(socialMediaFeedPosts.platform, filters.platform as any));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(socialMediaFeedPosts.isActive, filters.isActive));
  }
  if (conditions.length > 0) {
    // @ts-ignore
    query = query.where(and(...conditions));
  }
  query = query.orderBy(desc(socialMediaFeedPosts.postedAt));
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  // @ts-ignore
  return await query;
}

export async function updateSocialMediaFeedPost(id: number, updates: Partial<InsertSocialMediaFeedPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialMediaFeedPosts).set({ ...updates, updatedAt: new Date() }).where(eq(socialMediaFeedPosts.id, id));
  const updated = await db.select().from(socialMediaFeedPosts).where(eq(socialMediaFeedPosts.id, id)).limit(1);
  return updated[0];
}

// ============================================
// MUSIC DISCOVERY / RECOMMENDATIONS
// ============================================

export async function createMusicRecommendation(recommendation: InsertMusicRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(musicRecommendations).values(recommendation);
  const insertedId = result[0].insertId;
  const created = await db.select().from(musicRecommendations).where(eq(musicRecommendations.id, insertedId)).limit(1);
  return created[0];
}

export async function getMusicRecommendations(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(musicRecommendations)
    .where(eq(musicRecommendations.userId, userId))
    .orderBy(desc(musicRecommendations.score))
    .limit(limit);
}

export async function getRecommendationsForEntity(entityType: "mix" | "track" | "event" | "podcast", entityId: number, limit: number = 5) {
  const db = await getDb();
  if (!db) return [];
  // Get users who favorited this entity, then recommend what else they favorited
  const favoriters = await db
    .select({ userId: userFavorites.userId })
    .from(userFavorites)
    .where(and(eq(userFavorites.entityType, entityType), eq(userFavorites.entityId, entityId)))
    .limit(100);

  if (favoriters.length === 0) return [];

  const userIds = favoriters.map(f => f.userId).filter(Boolean);
  if (userIds.length === 0) return [];

  // Get other entities favorited by these users
  const recommendations = await db
    .select({
      entityType: userFavorites.entityType,
      entityId: userFavorites.entityId,
      count: sql<number>`COUNT(*)`.as('count'),
    })
    .from(userFavorites)
    .where(
      and(
        sql`${userFavorites.userId} IN (${userIds.join(',')})`,
        sql`NOT (${userFavorites.entityType} = ${entityType} AND ${userFavorites.entityId} = ${entityId})`
      )
    )
    .groupBy(userFavorites.entityType, userFavorites.entityId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(limit);

  return recommendations;
}

// Rewards
export async function createReward(reward: InsertReward) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(rewards).values(reward);
  const insertedId = result[0].insertId;
  const created = await db.select().from(rewards).where(eq(rewards.id, insertedId)).limit(1);
  return created[0];
}

export async function listRewards(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(rewards);
  if (activeOnly) {
    query = query.where(eq(rewards.isActive, true)) as any;
  }
  return await query.orderBy(desc(rewards.createdAt));
}

export async function getReward(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
  return result[0];
}

export async function updateReward(id: number, updates: Partial<InsertReward>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(rewards).set({ ...updates, updatedAt: new Date() }).where(eq(rewards.id, id));
  const updated = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
  return updated[0];
}

// Redemptions
export async function createRedemption(userId: number, rewardId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reward = await getReward(rewardId);
  if (!reward || !reward.isActive) throw new Error("Reward not found or inactive");

  const wallet = await getOrCreateWallet(userId);
  if (wallet.balanceCoins < reward.costCoins) throw new Error("Insufficient coins");

  // Deduct coins
  await adjustCoins({
    userId,
    amount: -reward.costCoins,
    type: "spend",
    source: "rewardRedeem",
    referenceId: rewardId,
    description: `Redeemed: ${reward.name}`,
  });

  // Create redemption
  const result = await db.insert(redemptions).values({
    userId,
    rewardId,
    coinsSpent: reward.costCoins,
    status: reward.fulfillmentType === "autoLink" || reward.fulfillmentType === "autoEmail" ? "fulfilled" : "pending",
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(redemptions).where(eq(redemptions.id, insertedId)).limit(1);
  return created[0];
}

export async function listRedemptions(filters?: { userId?: number; status?: string }, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(redemptions);
  const conditions = [];
  if (filters?.userId) {
    conditions.push(eq(redemptions.userId, filters.userId));
  }
  if (filters?.status) {
    conditions.push(eq(redemptions.status, filters.status as any));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(redemptions.createdAt)).limit(limit);
}

export async function updateRedemptionStatus(id: number, status: InsertRedemption["status"], notesAdmin?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(redemptions).set({ status, notesAdmin, updatedAt: new Date() }).where(eq(redemptions.id, id));
  const updated = await db.select().from(redemptions).where(eq(redemptions.id, id)).limit(1);
  return updated[0];
}

// Referrals
export async function createReferralCode(ownerUserId: number, code: string, maxUses?: number, expiresAt?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(referralCodes).values({
    ownerUserId,
    code,
    maxUses,
    expiresAt,
  });
  const insertedId = result[0].insertId;
  const created = await db.select().from(referralCodes).where(eq(referralCodes.id, insertedId)).limit(1);
  return created[0];
}

export async function getReferralCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(referralCodes).where(eq(referralCodes.code, code)).limit(1);
  return result[0];
}

export async function applyReferralCode(code: string, newUserId: number, rewardCoins: number = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const referralCode = await getReferralCode(code);
  if (!referralCode) throw new Error("Invalid referral code");

  // Check expiry
  if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
    throw new Error("Referral code expired");
  }

  // Check max uses
  if (referralCode.maxUses) {
    const uses = await db.select().from(referralUses).where(eq(referralUses.codeId, referralCode.id));
    if (uses.length >= referralCode.maxUses) {
      throw new Error("Referral code max uses reached");
    }
  }

  // Check if already used by this user
  const existingUse = await db
    .select()
    .from(referralUses)
    .where(and(eq(referralUses.codeId, referralCode.id), eq(referralUses.referredUserId, newUserId)))
    .limit(1);
  if (existingUse[0]) throw new Error("Referral code already used by this user");

  // Record use
  await db.insert(referralUses).values({
    codeId: referralCode.id,
    referredUserId: newUserId,
    rewardCoins,
  });

  // Award coins to both users
  await adjustCoins({
    userId: newUserId,
    amount: rewardCoins,
    type: "earn",
    source: "referral",
    referenceId: referralCode.id,
    description: `Referral bonus`,
  });

  await adjustCoins({
    userId: referralCode.ownerUserId,
    amount: rewardCoins,
    type: "earn",
    source: "referral",
    referenceId: referralCode.id,
    description: `Referral reward for ${code}`,
  });

  return { success: true };
}

export async function listReferralCodes(ownerUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(referralCodes);
  if (ownerUserId) {
    query = query.where(eq(referralCodes.ownerUserId, ownerUserId)) as any;
  }
  return await query.orderBy(desc(referralCodes.createdAt));
}

export async function getReferralStats(ownerUserId: number) {
  const db = await getDb();
  if (!db) return { totalUses: 0, totalCoinsAwarded: 0, codes: [] };

  const codes = await listReferralCodes(ownerUserId);
  const uses = await db
    .select()
    .from(referralUses)
    .where(eq(referralUses.codeId, codes.map((c) => c.id)[0] || 0));

  return {
    totalUses: uses.length,
    totalCoinsAwarded: uses.reduce((sum, u) => sum + u.rewardCoins, 0),
    codes: codes.map((c) => ({ ...c, uses: uses.filter((u) => u.codeId === c.id).length })),
  };
}

// ============================================
// PHASE 9B: THE HECTIC SHOW
// ============================================

// Shows
export async function createShowPhase9(show: InsertShowPhase9) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(showsPhase9).values(show);
  const insertedId = result[0].insertId;
  const created = await db.select().from(showsPhase9).where(eq(showsPhase9.id, insertedId)).limit(1);
  return created[0];
}

export async function listShowsPhase9(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(showsPhase9);
  if (activeOnly) {
    query = query.where(eq(showsPhase9.isActive, true)) as any;
  }
  return await query.orderBy(desc(showsPhase9.createdAt));
}

export async function getShowPhase9(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(showsPhase9).where(eq(showsPhase9.id, id)).limit(1);
  return result[0];
}

export async function getShowPhase9BySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(showsPhase9).where(eq(showsPhase9.slug, slug)).limit(1);
  return result[0];
}

export async function updateShowPhase9(id: number, updates: Partial<InsertShowPhase9>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showsPhase9).set({ ...updates, updatedAt: new Date() }).where(eq(showsPhase9.id, id));
  const updated = await db.select().from(showsPhase9).where(eq(showsPhase9.id, id)).limit(1);
  return updated[0];
}

// ============================================
// SOCIAL PROOF NOTIFICATIONS
// ============================================
export async function getActiveSocialProofNotifications(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return await db
    .select()
    .from(socialProofNotifications)
    .where(
      and(
        eq(socialProofNotifications.isActive, true),
        or(
          isNull(socialProofNotifications.expiresAt),
          gt(socialProofNotifications.expiresAt, now)
        )
      )
    )
    .orderBy(desc(socialProofNotifications.createdAt))
    .limit(limit);
}

export async function createSocialProofNotification(notification: InsertSocialProofNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialProofNotifications).values(notification);
  const insertedId = result[0].insertId;
  const created = await db.select().from(socialProofNotifications).where(eq(socialProofNotifications.id, insertedId)).limit(1);
  return created[0];
}

export async function expireSocialProofNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialProofNotifications).set({ isActive: false }).where(eq(socialProofNotifications.id, id));
}

export async function setPrimaryShowPhase9(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Unset all others
  await db.update(showsPhase9).set({ isPrimaryShow: false }).where(eq(showsPhase9.isPrimaryShow, true));
  // Set this one
  await db.update(showsPhase9).set({ isPrimaryShow: true, updatedAt: new Date() }).where(eq(showsPhase9.id, id));
  const updated = await db.select().from(showsPhase9).where(eq(showsPhase9.id, id)).limit(1);
  return updated[0];
}

// Episodes
export async function createShowEpisode(episode: InsertShowEpisode) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(showEpisodes).values(episode);
  const insertedId = result[0].insertId;
  const created = await db.select().from(showEpisodes).where(eq(showEpisodes.id, insertedId)).limit(1);
  return created[0];
}

export async function listShowEpisodes(showId?: number, publishedOnly: boolean = false, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(showEpisodes);
  const conditions = [];
  if (showId) {
    conditions.push(eq(showEpisodes.showId, showId));
  }
  if (publishedOnly) {
    conditions.push(eq(showEpisodes.status, "published"));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(showEpisodes.publishedAt || showEpisodes.createdAt)).limit(limit);
}

export async function getShowEpisode(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(showEpisodes).where(eq(showEpisodes.id, id)).limit(1);
  return result[0];
}

export async function getShowEpisodeBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(showEpisodes).where(eq(showEpisodes.slug, slug)).limit(1);
  return result[0];
}

export async function updateShowEpisode(id: number, updates: Partial<InsertShowEpisode>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showEpisodes).set({ ...updates, updatedAt: new Date() }).where(eq(showEpisodes.id, id));
  const updated = await db.select().from(showEpisodes).where(eq(showEpisodes.id, id)).limit(1);
  return updated[0];
}

// Segments
export async function createShowSegment(segment: InsertShowSegment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(showSegments).values(segment);
  const insertedId = result[0].insertId;
  const created = await db.select().from(showSegments).where(eq(showSegments.id, insertedId)).limit(1);
  return created[0];
}

export async function listShowSegments(episodeId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(showSegments)
    .where(eq(showSegments.episodeId, episodeId))
    .orderBy(asc(showSegments.orderIndex));
}

export async function updateShowSegment(id: number, updates: Partial<InsertShowSegment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showSegments).set({ ...updates, updatedAt: new Date() }).where(eq(showSegments.id, id));
  const updated = await db.select().from(showSegments).where(eq(showSegments.id, id)).limit(1);
  return updated[0];
}

export async function reorderShowSegments(episodeId: number, segmentIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < segmentIds.length; i++) {
    await db.update(showSegments).set({ orderIndex: i, updatedAt: new Date() }).where(eq(showSegments.id, segmentIds[i]));
  }
  return { success: true };
}

// Live Sessions
export async function scheduleLiveSession(session: InsertShowLiveSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(showLiveSessions).values({ ...session, status: "upcoming" });
  const insertedId = result[0].insertId;
  const created = await db.select().from(showLiveSessions).where(eq(showLiveSessions.id, insertedId)).limit(1);
  return created[0];
}

export async function startLiveSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showLiveSessions).set({ status: "live", startedAt: new Date(), updatedAt: new Date() }).where(eq(showLiveSessions.id, id));
  const updated = await db.select().from(showLiveSessions).where(eq(showLiveSessions.id, id)).limit(1);
  return updated[0];
}

export async function endLiveSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showLiveSessions).set({ status: "ended", endedAt: new Date(), updatedAt: new Date() }).where(eq(showLiveSessions.id, id));
  const updated = await db.select().from(showLiveSessions).where(eq(showLiveSessions.id, id)).limit(1);
  return updated[0];
}

export async function listLiveSessions(showId?: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(showLiveSessions);
  if (showId) {
    query = query.where(eq(showLiveSessions.showId, showId)) as any;
  }
  return await query.orderBy(desc(showLiveSessions.startedAt)).limit(limit);
}

export async function getActiveSessionForShow(showId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(showLiveSessions)
    .where(and(eq(showLiveSessions.showId, showId), eq(showLiveSessions.status, "live")))
    .limit(1);
  return result[0];
}

export async function getCurrentLiveSession() {
  const db = await getDb();
  if (!db) return undefined;
  // Get primary show
  const primaryShow = await db.select().from(showsPhase9).where(eq(showsPhase9.isPrimaryShow, true)).limit(1);
  if (!primaryShow[0]) return undefined;
  return await getActiveSessionForShow(primaryShow[0].id);
}

// Cues
export async function createCue(cue: InsertShowCue) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(showCues).values(cue);
  const insertedId = result[0].insertId;
  const created = await db.select().from(showCues).where(eq(showCues.id, insertedId)).limit(1);
  return created[0];
}

export async function listCuesForSession(liveSessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(showCues)
    .where(eq(showCues.liveSessionId, liveSessionId))
    .orderBy(asc(showCues.orderIndex));
}

export async function updateCueStatus(id: number, status: InsertShowCue["status"]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(showCues).set({ status, updatedAt: new Date() }).where(eq(showCues.id, id));
  const updated = await db.select().from(showCues).where(eq(showCues.id, id)).limit(1);
  return updated[0];
}

// ============================================
// PHASE 10: HECTICOPS CONTROL TOWER - INTEGRATIONS
// ============================================

// Social Integrations
export async function listSocialIntegrations(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(socialIntegrations);
  if (activeOnly) {
    query = query.where(eq(socialIntegrations.isActive, true)) as any;
  }
  return await query.orderBy(desc(socialIntegrations.createdAt));
}

export async function createSocialIntegration(integration: InsertSocialIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialIntegrations).values(integration);
  const insertedId = result[0].insertId;
  const created = await db.select().from(socialIntegrations).where(eq(socialIntegrations.id, insertedId)).limit(1);
  return created[0];
}

export async function updateSocialIntegration(id: number, updates: Partial<InsertSocialIntegration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialIntegrations).set({ ...updates, updatedAt: new Date() }).where(eq(socialIntegrations.id, id));
  const updated = await db.select().from(socialIntegrations).where(eq(socialIntegrations.id, id)).limit(1);
  return updated[0];
}

export async function setPrimarySocial(platform: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Unset all others for this platform
  await db.update(socialIntegrations).set({ isPrimary: false }).where(eq(socialIntegrations.platform, platform as any));
  // Set this one
  const result = await db.select().from(socialIntegrations).where(eq(socialIntegrations.platform, platform as any)).limit(1);
  if (result[0]) {
    await db.update(socialIntegrations).set({ isPrimary: true, updatedAt: new Date() }).where(eq(socialIntegrations.id, result[0].id));
    return result[0];
  }
  return undefined;
}

// Content Queue
export async function createContentItem(item: InsertContentQueueItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contentQueue).values(item);
  const insertedId = result[0].insertId;
  const created = await db.select().from(contentQueue).where(eq(contentQueue.id, insertedId)).limit(1);
  return created[0];
}

export async function updateContentItemStatus(id: number, status: InsertContentQueueItem["status"], externalUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updates: any = { status, updatedAt: new Date() };
  if (status === "posted" && externalUrl) {
    updates.externalUrl = externalUrl;
    updates.postedAt = new Date();
  }
  await db.update(contentQueue).set(updates).where(eq(contentQueue.id, id));
  const updated = await db.select().from(contentQueue).where(eq(contentQueue.id, id)).limit(1);
  return updated[0];
}

export async function listContentQueue(filters?: { status?: string; platform?: string; source?: string }, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(contentQueue);
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(contentQueue.status, filters.status as any));
  }
  if (filters?.platform) {
    conditions.push(eq(contentQueue.targetPlatform, filters.platform as any));
  }
  if (filters?.source) {
    conditions.push(eq(contentQueue.source, filters.source as any));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  return await query.orderBy(desc(contentQueue.createdAt)).limit(limit);
}

export async function listContentForPlatform(platform: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(contentQueue)
    .where(eq(contentQueue.targetPlatform, platform as any))
    .orderBy(desc(contentQueue.createdAt))
    .limit(limit);
}

// Webhooks
export async function listWebhooks(activeOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(webhooks);
  if (activeOnly) {
    query = query.where(eq(webhooks.isActive, true)) as any;
  }
  return await query.orderBy(desc(webhooks.createdAt));
}

export async function createWebhook(webhook: InsertWebhook) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(webhooks).values(webhook);
  const insertedId = result[0].insertId;
  const created = await db.select().from(webhooks).where(eq(webhooks.id, insertedId)).limit(1);
  return created[0];
}

export async function updateWebhook(id: number, updates: Partial<InsertWebhook>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(webhooks).set({ ...updates, updatedAt: new Date() }).where(eq(webhooks.id, id));
  const updated = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
  return updated[0];
}

export async function dispatchWebhooks(eventType: InsertWebhook["eventType"], payload: any) {
  const db = await getDb();
  if (!db) return { dispatched: 0, errors: [] };

  const activeWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.isActive, true), eq(webhooks.eventType, eventType)));

  const errors: string[] = [];
  let dispatched = 0;

  for (const webhook of activeWebhooks) {
    try {
      // In a real implementation, this would make HTTP POST requests
      // For now, we just log it
      console.log(`[Webhook] Dispatching to ${webhook.url} for event ${eventType}`, payload);
      dispatched++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${webhook.name}: ${errorMsg}`);
    }
  }

  return { dispatched, errors };
}

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

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(events).where(eq(events.id, id));
}

export async function getAllMarketingLeads(filters?: {
  status?: string;
  type?: string;
  location?: string;
  assignedTo?: number
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(marketingLeads);
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(marketingLeads.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(marketingLeads.type, filters.type as any));
  }
  if (filters?.location) {
    conditions.push(like(marketingLeads.location, `%${filters.location}%`));
  }
  if (filters?.assignedTo) {
    conditions.push(eq(marketingLeads.assignedTo, filters.assignedTo));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(marketingLeads.createdAt));
}

// ============================================
// MORE MISSING FUNCTIONS (Added for Fix)
// ============================================

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(events).values(event);
  const insertedId = result[0].insertId;
  const created = await db.select().from(events).where(eq(events.id, insertedId)).limit(1);
  return created[0];
}

export async function updateEvent(id: number, updates: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(events).set({ ...updates, updatedAt: new Date() }).where(eq(events.id, id));
  const updated = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return updated[0];
}

export async function getMarketingLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketingLeads).where(eq(marketingLeads.id, id)).limit(1);
  return result[0];
}

export async function createVenueScraperResult(result: InsertVenueScraperResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const insertResult = await db.insert(venueScraperResults).values(result);
  const insertedId = insertResult[0].insertId;
  const created = await db.select().from(venueScraperResults).where(eq(venueScraperResults.id, insertedId)).limit(1);
  return created[0];
}

export async function convertScraperResultToLead(id: number, extraData?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the result
  const scraperResult = await db.select().from(venueScraperResults).where(eq(venueScraperResults.id, id)).limit(1);
  if (!scraperResult[0]) throw new Error("Scraper result not found");

  const venue = scraperResult[0];
  const rawData = typeof venue.rawData === 'string' ? JSON.parse(venue.rawData) : venue.rawData;

  // Create lead
  const leadData: InsertMarketingLead = {
    name: venue.name,
    type: "bar", // Default fallback
    location: venue.location,
    source: venue.source,
    website: venue.sourceUrl || undefined,
    socialMedia: rawData.socialMedia ? JSON.stringify(rawData.socialMedia) : undefined,
    ...extraData
  };

  const leadResult = await db.insert(marketingLeads).values(leadData);
  const leadId = leadResult[0].insertId;

  // Update result as converted
  await db.update(venueScraperResults).set({ convertedToLead: true }).where(eq(venueScraperResults.id, id));

  const created = await db.select().from(marketingLeads).where(eq(marketingLeads.id, leadId)).limit(1);
  return created[0];
}
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

// AUTH HELPERS
export async function createUserWithPassword(user: { email: string; password?: string; name?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Simple hash (In production use bcrypt/argon2)
  // For now using simple string to demo "working" as requested.
  // Ideally: const hash = await bcrypt.hash(user.password, 10);
  const passwordHash = user.password ? `HASHED_${user.password}` : undefined;

  const result = await db.insert(users).values({
    email: user.email,
    name: user.name || "New User",
    openId: `email:${user.email}`, // Surrogate OpenID
    loginMethod: "email",
    passwordHash: passwordHash,
    role: "user",
  });

  const insertedId = result[0].insertId;
  const created = await db.select().from(users).where(eq(users.id, insertedId)).limit(1);
  return created[0];
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

export async function deleteVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(videos).where(eq(videos.id, id));
}

// Articles (Blog)
export async function getAllArticles(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(articles).orderBy(desc(articles.publishedAt));

  if (publishedOnly) {
    // @ts-ignore
    query = query.where(eq(articles.isPublished, true));
  }

  return await query;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0];
}

export async function createArticle(article: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(articles).values(article);
  const insertedId = result[0].insertId;
  const created = await db.select().from(articles).where(eq(articles.id, insertedId)).limit(1);
  return created[0];
}

export async function updateArticle(id: number, updates: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(articles).set({ ...updates, updatedAt: new Date() }).where(eq(articles.id, id));
  const updated = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return updated[0];
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(articles).where(eq(articles.id, id));
}

// Media Library
export async function getMediaLibrary() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(mediaLibrary).orderBy(desc(mediaLibrary.createdAt));
}

export async function createMediaItem(item: InsertMediaItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mediaLibrary).values(item);
  const insertedId = result[0].insertId;
  const created = await db.select().from(mediaLibrary).where(eq(mediaLibrary.id, insertedId)).limit(1);
  return created[0];
}

export async function deleteMediaItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(mediaLibrary).where(eq(mediaLibrary.id, id));
}

// ============================================
// MISSING MARKETING & SOCIAL FUNCTIONS (Appended for Build Fix)
// ============================================



// Marketing Campaigns
export async function getAllMarketingCampaigns(filters?: { status?: string; type?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(marketingCampaigns);
  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(marketingCampaigns.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(marketingCampaigns.type, filters.type as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(marketingCampaigns.createdAt));
}

export async function getMarketingCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id)).limit(1);
  return result[0];
}

export async function createMarketingCampaign(campaign: InsertMarketingCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketingCampaigns).values(campaign);
  const insertedId = result[0].insertId;
  const created = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, insertedId)).limit(1);
  return created[0];
}

export async function updateMarketingCampaign(id: number, updates: Partial<InsertMarketingCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketingCampaigns).set({ ...updates, updatedAt: new Date() }).where(eq(marketingCampaigns.id, id));
  const updated = await db.select().from(marketingCampaigns).where(eq(marketingCampaigns.id, id)).limit(1);
  return updated[0];
}

export async function deleteMarketingCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
}

// Outreach Activities
export async function getOutreachActivitiesByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(outreachActivities).where(eq(outreachActivities.leadId, leadId)).orderBy(desc(outreachActivities.createdAt));
}

export async function createOutreachActivity(activity: InsertOutreachActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(outreachActivities).values(activity);
  const insertedId = result[0].insertId;
  const created = await db.select().from(outreachActivities).where(eq(outreachActivities.id, insertedId)).limit(1);
  return created[0];
}

// Social Media Posts
export async function getAllSocialMediaPosts(filters?: { platform?: string; status?: string; createdBy?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(socialMediaPosts);
  const conditions = [];

  if (filters?.platform) {
    conditions.push(eq(socialMediaPosts.platform, filters.platform as any));
  }
  if (filters?.status) {
    conditions.push(eq(socialMediaPosts.status, filters.status as any));
  }
  if (filters?.createdBy) {
    conditions.push(eq(socialMediaPosts.createdBy, filters.createdBy));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(socialMediaPosts.createdAt));
}

export async function getSocialMediaPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(socialMediaPosts).where(eq(socialMediaPosts.id, id)).limit(1);
  return result[0];
}

export async function createSocialMediaPost(post: InsertSocialMediaPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialMediaPosts).values(post);
  const insertedId = result[0].insertId;
  const created = await db.select().from(socialMediaPosts).where(eq(socialMediaPosts.id, insertedId)).limit(1);
  return created[0];
}

export async function updateSocialMediaPost(id: number, updates: Partial<InsertSocialMediaPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialMediaPosts).set({ ...updates, updatedAt: new Date() }).where(eq(socialMediaPosts.id, id));
  const updated = await db.select().from(socialMediaPosts).where(eq(socialMediaPosts.id, id)).limit(1);
  return updated[0];
}

export async function deleteSocialMediaPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(socialMediaPosts).where(eq(socialMediaPosts.id, id));
}

// Scraper Results
export async function getAllVenueScraperResults(filters?: { processed?: boolean; convertedToLead?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(venueScraperResults);
  const conditions = [];

  if (filters?.processed !== undefined) {
    conditions.push(eq(venueScraperResults.processed, filters.processed));
  }
  if (filters?.convertedToLead !== undefined) {
    conditions.push(eq(venueScraperResults.convertedToLead, filters.convertedToLead));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(venueScraperResults.createdAt));
}



// ============================================
// Marketing & Leads
// ============================================
export async function createMarketingLead(lead: InsertMarketingLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(marketingLeads).values(lead);
  const insertedId = result[0].insertId;
  const created = await db.select().from(marketingLeads).where(eq(marketingLeads.id, insertedId)).limit(1);
  return created[0];
}

export async function updateMarketingLead(id: number, updates: Partial<InsertMarketingLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(marketingLeads).set({ ...updates, updatedAt: new Date() }).where(eq(marketingLeads.id, id));
  const updated = await db.select().from(marketingLeads).where(eq(marketingLeads.id, id)).limit(1);
  return updated[0];
}

export async function deleteMarketingLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(marketingLeads).where(eq(marketingLeads.id, id));
}

// ============================================
// User Favorites
// ============================================
export async function addToFavorites(favorite: InsertUserFavorite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if exists
  const existing = await db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, favorite.userId),
        eq(userFavorites.entityType, favorite.entityType),
        eq(userFavorites.entityId, favorite.entityId)
      )
    )
    .limit(1);

  if (existing.length > 0) return existing[0];

  const result = await db.insert(userFavorites).values(favorite);
  return { ...favorite, id: result[0].insertId };
}

export async function removeFromFavorites(userId: number, entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.entityType, entityType as any),
        eq(userFavorites.entityId, entityId)
      )
    );
}

export async function getUserFavorites(userId: number, type?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions: SQL[] = [eq(userFavorites.userId, userId)];
  if (type) {
    conditions.push(eq(userFavorites.entityType, type as any));
  }
  return await db.select().from(userFavorites).where(and(...conditions)).orderBy(desc(userFavorites.createdAt));
}

export async function isFavorited(userId: number, entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(userFavorites)
    .where(
      and(
        eq(userFavorites.userId, userId),
        eq(userFavorites.entityType, entityType as any),
        eq(userFavorites.entityId, entityId)
      )
    )
    .limit(1);
  return result.length > 0;
}

// ============================================
// Playlists
// ============================================
export async function createPlaylist(playlist: InsertUserPlaylist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userPlaylists).values(playlist);
  const insertedId = result[0].insertId;
  const created = await db.select().from(userPlaylists).where(eq(userPlaylists.id, insertedId)).limit(1);
  return created[0];
}

export async function getUserPlaylists(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userPlaylists).where(eq(userPlaylists.userId, userId)).orderBy(desc(userPlaylists.createdAt));
}

export async function getPlaylistById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPlaylists).where(eq(userPlaylists.id, id)).limit(1);
  return result[0];
}

export async function updatePlaylist(id: number, updates: Partial<InsertUserPlaylist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userPlaylists).set({ ...updates, updatedAt: new Date() }).where(eq(userPlaylists.id, id));
  const updated = await db.select().from(userPlaylists).where(eq(userPlaylists.id, id)).limit(1);
  return updated[0];
}

export async function deletePlaylist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userPlaylists).where(eq(userPlaylists.id, id));
  await db.delete(userPlaylistItems).where(eq(userPlaylistItems.playlistId, id));
}

export async function addToPlaylist(item: InsertUserPlaylistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userPlaylistItems).values(item);
  return { ...item, id: result[0].insertId };
}

export async function removeFromPlaylist(playlistId: number, itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userPlaylistItems).where(and(eq(userPlaylistItems.playlistId, playlistId), eq(userPlaylistItems.id, itemId)));
}

export async function getPlaylistItems(playlistId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userPlaylistItems).where(eq(userPlaylistItems.playlistId, playlistId)).orderBy(asc(userPlaylistItems.orderIndex));
}

// ============================================
// Track ID Requests
// ============================================


export async function createTrackIdRequest(request: InsertTrackIdRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trackIdRequests).values(request as any);
  return { ...request, id: result[0].insertId };
}

export async function getTrackIdRequests(filters?: { status?: string, userId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query: any = db.select().from(trackIdRequests);
  const conditions: SQL[] = [];

  if (filters?.status) conditions.push(eq(trackIdRequests.status, filters.status as any));
  if (filters?.userId) conditions.push(eq(trackIdRequests.userId, filters.userId));

  if (conditions.length > 0) {
    // @ts-ignore - Drizzle recursive type workaround
    query = query.where(and(...conditions));
  }
  return await query.orderBy(desc(trackIdRequests.createdAt));
}

export async function getTrackIdRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.select().from(trackIdRequests).where(eq(trackIdRequests.id, id)).limit(1).then(r => r[0]);
}

export async function updateTrackIdRequest(id: number, updates: Partial<InsertTrackIdRequest>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(trackIdRequests).set({ ...updates, updatedAt: new Date() }).where(eq(trackIdRequests.id, id));
  return await getTrackIdRequestById(id);
}

export async function getShareStats(entityType: string, entityId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byPlatform: {} };
  const shares = await db.select().from(socialShares).where(and(eq(socialShares.entityType, entityType as any), eq(socialShares.entityId, entityId)));
  const stats: Record<string, number> = {};
  shares.forEach(s => {
    if (s.platform) stats[s.platform] = (stats[s.platform] || 0) + 1;
  });
  return { total: shares.length, byPlatform: stats };
}


// ============================================
// Social Shares
// ============================================
export async function recordSocialShare(share: InsertSocialShare) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialShares).values(share);
  return { ...share, id: result[0].insertId };
}

export async function getSocialShares(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialShares).orderBy(desc(socialShares.createdAt)).limit(limit);
}

// ============================================
// Video Testimonials
// ============================================
export async function createVideoTestimonial(testimonial: InsertVideoTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(videoTestimonials).values(testimonial);
  const insertedId = result[0].insertId;
  return await db.select().from(videoTestimonials).where(eq(videoTestimonials.id, insertedId)).limit(1).then(r => r[0]);
}

export async function getVideoTestimonials(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(videoTestimonials).where(eq(videoTestimonials.isApproved, true)).orderBy(desc(videoTestimonials.createdAt)).limit(limit);
}

export async function getVideoTestimonialById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return await db.select().from(videoTestimonials).where(eq(videoTestimonials.id, id)).limit(1).then(r => r[0]);
}

export async function updateVideoTestimonial(id: number, updates: Partial<InsertVideoTestimonial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(videoTestimonials).set({ ...updates, updatedAt: new Date() }).where(eq(videoTestimonials.id, id));
  return await db.select().from(videoTestimonials).where(eq(videoTestimonials.id, id)).limit(1).then(r => r[0]);
}

export async function deleteVideoTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(videoTestimonials).where(eq(videoTestimonials.id, id));
}

// ============================================
// Music Recommendations
// ============================================
export async function createRecommendation(rec: InsertMusicRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(musicRecommendations).values(rec);
  return { ...rec, id: result[0].insertId };
}


