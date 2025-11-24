import { asc, desc, eq, gt, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, InsertMix, InsertEvent, InsertAnalyticsEvent, users, mixes, bookings, events, podcasts, streamingLinks, analytics } from "../drizzle/schema";
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

// Admin mutations
export async function createMix(mix: InsertMix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(mixes).values(mix);
}

export async function deleteMix(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(mixes).where(eq(mixes.id, id));
}

export async function updateBookingStatus(id: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(bookings).set({ status }).where(eq(bookings.id, id));
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(events).values(event);
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(events).where(eq(events.id, id));
}

// Analytics
export async function logAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) return; // fail silently for analytics
  try {
    await db.insert(analytics).values(event);
  } catch (e) {
    console.error("Failed to log analytics:", e);
  }
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return null;

  // Simple counts
  const totalBookings = (await db.select({ count: sql<number>`count(*)` }).from(bookings))[0].count;
  const totalMixPlays = (await db.select({ count: sql<number>`count(*)` }).from(analytics).where(eq(analytics.type, 'mix_play')))[0].count;
  const totalVisitors = (await db.select({ count: sql<number>`count(*)` }).from(analytics).where(eq(analytics.type, 'page_view')))[0].count;
  
  // Top mixes
  const topMixes = await db.select({
    name: mixes.title,
    plays: sql<number>`count(${analytics.id})`
  })
  .from(analytics)
  .innerJoin(mixes, eq(analytics.entityId, mixes.id))
  .where(eq(analytics.type, 'mix_play'))
  .groupBy(mixes.id)
  .orderBy(desc(sql`count(${analytics.id})`))
  .limit(5);

  return {
    totalBookings,
    totalMixPlays,
    totalVisitors,
    topMixes
  };
}

