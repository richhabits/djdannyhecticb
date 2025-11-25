import { and, asc, desc, eq, gt, gte, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mixes, bookings, events, podcasts, streamingLinks, socialPosts, bookingSlots, type SocialPost, type BookingSlot } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

type FallbackSocialPostSeed = Omit<SocialPost, "id" | "createdAt" | "updatedAt" | "postedAt"> & {
  postedAt: string;
};

const FALLBACK_SOCIAL_POSTS_SEED: FallbackSocialPostSeed[] = [
  {
    platform: "instagram",
    platformPostId: "IG-001",
    authorHandle: "@djdannyhecticb",
    authorAvatarUrl: "https://placehold.co/80x80/1f1f1f/fff?text=IG",
    content: "Studio session was pure 🔥 tonight. Amapiano meets UK Garage and the crowd went crazy.",
    mediaUrl: "https://placehold.co/600x400/4c1d95/fff?text=Studio+Session",
    permalink: "https://instagram.com/p/IG-001",
    likeCount: 1340,
    commentCount: 182,
    postedAt: "2025-11-20T22:15:00Z",
  },
  {
    platform: "tiktok",
    platformPostId: "TT-4421",
    authorHandle: "@djdannyhecticb",
    authorAvatarUrl: "https://placehold.co/80x80/000/fff?text=TT",
    content: "New mashup preview. Who wants the full drop on Friday?",
    mediaUrl: "https://placehold.co/600x400/db2777/fff?text=Mashup+Preview",
    permalink: "https://tiktok.com/@djdannyhecticb/video/TT-4421",
    likeCount: 9820,
    commentCount: 640,
    postedAt: "2025-11-19T19:42:00Z",
  },
  {
    platform: "threads",
    platformPostId: "TH-303",
    authorHandle: "@djdannyhecticb",
    authorAvatarUrl: "https://placehold.co/80x80/111827/fff?text=TH",
    content: "Been digging into soulful house vinyl this week. Drop your favorite deep cuts below 👇",
    mediaUrl: undefined,
    permalink: "https://www.threads.net/@djdannyhecticb/post/TH-303",
    likeCount: 412,
    commentCount: 76,
    postedAt: "2025-11-17T15:05:00Z",
  },
];

const FALLBACK_SOCIAL_POSTS: SocialPost[] = FALLBACK_SOCIAL_POSTS_SEED.map((seed, index) => {
  const postedAt = new Date(seed.postedAt);
  return {
    id: index + 1,
    ...seed,
    postedAt,
    createdAt: postedAt,
    updatedAt: postedAt,
  };
});

type FallbackBookingSlotSeed = {
  slotStart: string;
  durationMinutes: number;
  status: BookingSlot["status"];
  notes?: string | null;
};

const FALLBACK_BOOKING_SLOTS_SEED: FallbackBookingSlotSeed[] = [
  {
    slotStart: "2025-11-23T18:00:00Z",
    durationMinutes: 120,
    status: "booked",
    notes: "Wedding reception – London",
  },
  {
    slotStart: "2025-11-25T20:00:00Z",
    durationMinutes: 180,
    status: "held",
    notes: "Club night hold (awaiting deposit)",
  },
  {
    slotStart: "2025-11-27T19:00:00Z",
    durationMinutes: 150,
    status: "available",
  },
  {
    slotStart: "2025-11-30T17:00:00Z",
    durationMinutes: 120,
    status: "available",
  },
  {
    slotStart: "2025-12-02T21:00:00Z",
    durationMinutes: 180,
    status: "booked",
    notes: "Private studio livestream",
  },
  {
    slotStart: "2025-12-05T20:00:00Z",
    durationMinutes: 240,
    status: "available",
  },
];

const FALLBACK_BOOKING_SLOTS: BookingSlot[] = FALLBACK_BOOKING_SLOTS_SEED.map((seed, index) => {
  const start = new Date(seed.slotStart);
  const end = new Date(start.getTime() + seed.durationMinutes * 60 * 1000);
  return {
    id: index + 1,
    slotStart: start,
    slotEnd: end,
    status: seed.status,
    holdExpiresAt: seed.status === "held" ? new Date(start.getTime() - 60 * 60 * 1000) : null,
    bookingId: seed.status === "booked" ? index + 100 : null,
    notes: seed.notes ?? null,
    createdAt: start,
    updatedAt: start,
  };
});

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

// Social feed
export async function getSocialFeed(limit = 9) {
  const db = await getDb();
  if (!db) return FALLBACK_SOCIAL_POSTS.slice(0, limit);
  return await db.select().from(socialPosts).orderBy(desc(socialPosts.postedAt)).limit(limit);
}

// Booking calendar
export async function getBookingCalendar(range?: { from?: Date; to?: Date }) {
  const now = new Date();
  const defaultFrom = range?.from ?? now;
  const defaultTo =
    range?.to ?? new Date(defaultFrom.getTime() + 1000 * 60 * 60 * 24 * 30);

  const db = await getDb();
  if (!db) {
    return FALLBACK_BOOKING_SLOTS.filter(slot => {
      return (
        slot.slotStart >= defaultFrom &&
        slot.slotStart < defaultTo
      );
    }).sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime());
  }

  return await db
    .select()
    .from(bookingSlots)
    .where(
      and(
        gte(bookingSlots.slotStart, defaultFrom),
        lt(bookingSlots.slotStart, defaultTo)
      )
    )
    .orderBy(asc(bookingSlots.slotStart));
}
