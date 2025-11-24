import { asc, desc, eq, gt, gte, lte, and, or, like, between, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mixes, bookings, events, podcasts, streamingLinks, calendarAvailability, analyticsEvents, InsertCalendarAvailability, InsertAnalyticsEvent } from "../drizzle/schema";
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

// Calendar availability queries
export async function getCalendarAvailability(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(calendarAvailability)
    .where(
      and(
        gte(calendarAvailability.date, startDate),
        lte(calendarAvailability.date, endDate)
      )
    )
    .orderBy(asc(calendarAvailability.date));
}

export async function checkDateAvailability(date: Date): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Default to available if DB unavailable
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Check if date is explicitly blocked
  const blocked = await db
    .select()
    .from(calendarAvailability)
    .where(
      and(
        gte(calendarAvailability.date, startOfDay),
        lte(calendarAvailability.date, endOfDay),
        eq(calendarAvailability.isAvailable, false)
      )
    )
    .limit(1);
  
  if (blocked.length > 0) return false;
  
  // Check if there's a confirmed booking on this date
  const confirmedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.eventDate, startOfDay),
        lte(bookings.eventDate, endOfDay),
        eq(bookings.status, 'confirmed')
      )
    )
    .limit(1);
  
  return confirmedBookings.length === 0;
}

export async function getAvailableDates(startDate: Date, endDate: Date): Promise<Date[]> {
  const db = await getDb();
  if (!db) return [];
  
  // Get all confirmed bookings in range
  const confirmedBookings = await db
    .select({ eventDate: bookings.eventDate })
    .from(bookings)
    .where(
      and(
        gte(bookings.eventDate, startDate),
        lte(bookings.eventDate, endDate),
        eq(bookings.status, 'confirmed')
      )
    );
  
  // Get all blocked dates
  const blockedDates = await db
    .select({ date: calendarAvailability.date })
    .from(calendarAvailability)
    .where(
      and(
        gte(calendarAvailability.date, startDate),
        lte(calendarAvailability.date, endDate),
        eq(calendarAvailability.isAvailable, false)
      )
    );
  
  const unavailableDates = new Set([
    ...confirmedBookings.map(b => b.eventDate.toISOString().split('T')[0]),
    ...blockedDates.map(b => b.date.toISOString().split('T')[0])
  ]);
  
  // Generate all dates in range and filter unavailable ones
  const availableDates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (!unavailableDates.has(dateStr)) {
      availableDates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return availableDates;
}

export async function createCalendarBlock(block: InsertCalendarAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(calendarAvailability).values(block);
}

// Search queries
export async function searchContent(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return { mixes: [], events: [], podcasts: [] };
  
  const searchTerm = `%${query}%`;
  
  const [mixesResults, eventsResults, podcastsResults] = await Promise.all([
    db
      .select()
      .from(mixes)
      .where(
        or(
          like(mixes.title, searchTerm),
          like(mixes.description, searchTerm),
          like(mixes.genre, searchTerm)
        )
      )
      .limit(limit),
    db
      .select()
      .from(events)
      .where(
        or(
          like(events.title, searchTerm),
          like(events.description, searchTerm),
          like(events.location, searchTerm)
        )
      )
      .limit(limit),
    db
      .select()
      .from(podcasts)
      .where(
        or(
          like(podcasts.title, searchTerm),
          like(podcasts.description, searchTerm)
        )
      )
      .limit(limit),
  ]);
  
  return {
    mixes: mixesResults,
    events: eventsResults,
    podcasts: podcastsResults,
  };
}

// Analytics queries
export async function createAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) {
    console.warn("[Analytics] Database not available, skipping event tracking");
    return;
  }
  
  try {
    await db.insert(analyticsEvents).values(event);
  } catch (error) {
    console.error("[Analytics] Failed to create event:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
}

export async function getAnalyticsStats(startDate: Date, endDate: Date, userId?: number) {
  const db = await getDb();
  if (!db) return null;
  
  const conditions = [
    gte(analyticsEvents.createdAt, startDate),
    lte(analyticsEvents.createdAt, endDate),
  ];
  
  if (userId !== undefined) {
    conditions.push(eq(analyticsEvents.userId, userId));
  }
  
  const events = await db
    .select()
    .from(analyticsEvents)
    .where(and(...conditions))
    .orderBy(desc(analyticsEvents.createdAt));
  
  // Aggregate stats
  const stats = {
    totalEvents: events.length,
    pageViews: events.filter(e => e.eventType === 'page_view').length,
    searches: events.filter(e => e.eventType === 'search').length,
    bookings: events.filter(e => e.eventType === 'booking_created').length,
    clicks: events.filter(e => e.eventType === 'click').length,
    topPages: {} as Record<string, number>,
    topEvents: {} as Record<string, number>,
  };
  
  events.forEach(event => {
    if (event.pagePath) {
      stats.topPages[event.pagePath] = (stats.topPages[event.pagePath] || 0) + 1;
    }
    if (event.eventType) {
      stats.topEvents[event.eventType] = (stats.topEvents[event.eventType] || 0) + 1;
    }
  });
  
  return stats;
}
