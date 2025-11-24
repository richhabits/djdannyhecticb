import { asc, desc, eq, gt, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, mixes, bookings, events, podcasts, streamingLinks, socialPosts, type SocialPost } from "../drizzle/schema";
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
