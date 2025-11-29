import { asc, desc, eq, gt, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mixes, bookings, events, podcasts, streamingLinks, shouts, InsertShout, streams, InsertStream, tracks, InsertTrack, shows, InsertShow, eventBookings, InsertEventBooking, dannyStatus, InsertDannyStatus, feedPosts, InsertFeedPost, userProfiles, InsertUserProfile, fanBadges, InsertFanBadge, aiMixes, InsertAIMix, dannyReacts, InsertDannyReact, personalizedShoutouts, InsertPersonalizedShoutout, djBattles, InsertDJBattle, listenerLocations, InsertListenerLocation, promoContent, InsertPromoContent, identityQuizzes, InsertIdentityQuiz, superfans, InsertSuperfan, loyaltyTracking, InsertLoyaltyTracking, supportEvents, InsertSupportEvent, products, InsertProduct, purchases, InsertPurchase, subscriptions, InsertSubscription, brands, InsertBrand, auditLogs, InsertAuditLog, empireSettings, InsertEmpireSetting, errorLogs, InsertErrorLog, incidentBanners, InsertIncidentBanner, backups, InsertBackup, notifications, InsertNotification, apiKeys, InsertApiKey, genZProfiles, InsertGenZProfile, follows, InsertFollow, userPosts, InsertUserPost, postReactions, InsertPostReaction, collectibles, InsertCollectible, userCollectibles, InsertUserCollectible, achievements, InsertAchievement, userAchievements, InsertUserAchievement, aiDannyChats, InsertAIDannyChat, worldAvatars, InsertWorldAvatar } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
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
  if (!db) return [];
  return await db.select().from(mixes).orderBy(desc(mixes.createdAt));
}

export async function getFreeMixes() {
  const db = await getDb();
  if (!db) return [];
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
  if (!db) return [];
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
  if (!db) return [];
  return await db.select().from(podcasts).orderBy(desc(podcasts.createdAt));
}

// Streaming links queries
export async function getStreamingLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(streamingLinks).orderBy(asc(streamingLinks.order));
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
  if (!db) return undefined;
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
  const result = await db
    .select()
    .from(tracks)
    .orderBy(desc(tracks.playedAt))
    .limit(1);
  return result[0];
}

export async function getTrackHistory(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select().from(tracks)
    .orderBy(desc(tracks.playedAt))
    .limit(limit);
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
  if (!db) return [];
  return await db
    .select()
    .from(shows)
    .where(eq(shows.isActive, true))
    .orderBy(asc(shows.dayOfWeek), asc(shows.startTime));
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

// Listener Stats (aggregated from shouts)
export async function getListenerStats(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all approved shouts grouped by name
  const allShouts = await db
    .select({
      name: shouts.name,
      createdAt: shouts.createdAt,
    })
    .from(shouts)
    .where(eq(shouts.approved, true));
  
  // Aggregate by name
  const statsMap = new Map<string, { totalShouts: number; firstSeen: Date; lastSeen: Date }>();
  
  for (const shout of allShouts) {
    const name = shout.name.toLowerCase();
    if (!statsMap.has(name)) {
      statsMap.set(name, {
        totalShouts: 0,
        firstSeen: shout.createdAt,
        lastSeen: shout.createdAt,
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
  const stats = Array.from(statsMap.entries())
    .map(([name, data]) => ({
      name: name,
      displayName: allShouts.find((s) => s.name.toLowerCase() === name)?.name || name,
      ...data,
    }))
    .sort((a, b) => b.totalShouts - a.totalShouts)
    .slice(0, limit);
  
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
  const result = await db.insert(supportEvents).values(event);
  const insertedId = result[0].insertId;
  const created = await db.select().from(supportEvents).where(eq(supportEvents.id, insertedId)).limit(1);
  return created[0];
}

export async function listSupportEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportEvents).orderBy(desc(supportEvents.createdAt)).limit(limit);
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
  const now = new Date();
  const result = await db
    .select()
    .from(incidentBanners)
    .where(and(eq(incidentBanners.isActive, true), gt(incidentBanners.endAt || new Date(now.getTime() + 86400000), now)))
    .limit(1);
  return result[0];
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

  // Daily/weekly active listeners (from shouts)
  const allShouts = await db.select().from(shouts);
  const dailyShouts = allShouts.filter((s) => s.createdAt && new Date(s.createdAt) > oneDayAgo);
  const weeklyShouts = allShouts.filter((s) => s.createdAt && new Date(s.createdAt) > oneWeekAgo);
  const dailyActiveListeners = new Set(dailyShouts.map((s) => s.name)).size;
  const weeklyActiveListeners = new Set(weeklyShouts.map((s) => s.name)).size;

  // Shouts per day
  const shoutsPerDay = dailyShouts.length;

  // Track requests per day
  const trackRequestsPerDay = dailyShouts.filter((s) => s.isTrackRequest).length;

  // Revenue summary
  const supportTotal = await getSupportEventTotal("GBP");
  const allPurchases = await listPurchases(1000);
  const allSubscriptions = await listSubscriptions(true);
  const allEventBookings = await db.select().from(eventBookings);

  const revenueSummary = {
    bookings: allEventBookings.length,
    support: parseFloat(supportTotal.total),
    products: allPurchases.filter((p) => p.status === "completed").length,
    subscriptions: allSubscriptions.filter((s) => s.status === "active").length,
  };

  // Error rate (last 24h)
  const errorLogs24h = await listErrorLogs(1000);
  const errorRate24h = errorLogs24h.filter((e) => e.createdAt && new Date(e.createdAt) > oneDayAgo).length;

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
    .select()
    .from(userAchievements)
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
