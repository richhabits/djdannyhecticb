import { eq, and, desc, sql, gte } from "drizzle-orm";
import { getDb } from "./db";
import {
  userSocialConnections,
  InsertUserSocialConnection,
  UserSocialConnection,
  trackShares,
  InsertTrackShare,
  TrackShare,
  socialShareTemplates,
  InsertSocialShareTemplate,
  SocialShareTemplate,
  shareRewardsConfig,
  InsertShareRewardsConfig,
  ShareRewardsConfig,
  socialEngagementSync,
  InsertSocialEngagementSync,
  SocialEngagementSync,
  shareAnalytics,
  InsertShareAnalytics,
  ShareAnalytics,
} from "../drizzle/schema";

/**
 * ============================================
 * USER SOCIAL CONNECTIONS
 * ============================================
 */

export async function createSocialConnection(
  connection: InsertUserSocialConnection
): Promise<UserSocialConnection> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(userSocialConnections).values(connection);
  const [inserted] = await db
    .select()
    .from(userSocialConnections)
    .where(eq(userSocialConnections.id, Number(result.insertId)))
    .limit(1);
  return inserted;
}

export async function getUserSocialConnections(
  userId: number
): Promise<UserSocialConnection[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(userSocialConnections)
    .where(eq(userSocialConnections.userId, userId))
    .orderBy(desc(userSocialConnections.createdAt));
}

export async function getUserSocialConnection(
  userId: number,
  platform: string
): Promise<UserSocialConnection | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [connection] = await db
    .select()
    .from(userSocialConnections)
    .where(
      and(
        eq(userSocialConnections.userId, userId),
        eq(userSocialConnections.platform, platform as any)
      )
    )
    .limit(1);
  return connection;
}

export async function updateSocialConnection(
  id: number,
  updates: Partial<InsertUserSocialConnection>
): Promise<UserSocialConnection> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSocialConnections)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(userSocialConnections.id, id));

  const [updated] = await db
    .select()
    .from(userSocialConnections)
    .where(eq(userSocialConnections.id, id))
    .limit(1);
  return updated;
}

export async function deleteSocialConnection(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(userSocialConnections).where(eq(userSocialConnections.id, id));
}

export async function toggleAutoShare(
  userId: number,
  platform: string,
  enabled: boolean
): Promise<UserSocialConnection> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(userSocialConnections)
    .set({ autoShareEnabled: enabled, updatedAt: new Date() })
    .where(
      and(
        eq(userSocialConnections.userId, userId),
        eq(userSocialConnections.platform, platform as any)
      )
    );

  const [updated] = await db
    .select()
    .from(userSocialConnections)
    .where(
      and(
        eq(userSocialConnections.userId, userId),
        eq(userSocialConnections.platform, platform as any)
      )
    )
    .limit(1);
  return updated;
}

/**
 * ============================================
 * TRACK SHARES
 * ============================================
 */

export async function createTrackShare(share: InsertTrackShare): Promise<TrackShare> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(trackShares).values(share);
  const [inserted] = await db
    .select()
    .from(trackShares)
    .where(eq(trackShares.id, Number(result.insertId)))
    .limit(1);
  return inserted;
}

export async function getUserTrackShares(
  userId: number,
  limit: number = 50
): Promise<TrackShare[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(trackShares)
    .where(eq(trackShares.userId, userId))
    .orderBy(desc(trackShares.createdAt))
    .limit(limit);
}

export async function getRecentTrackShares(limit: number = 50): Promise<TrackShare[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(trackShares)
    .orderBy(desc(trackShares.createdAt))
    .limit(limit);
}

export async function getTrackSharesByTrack(
  trackTitle: string,
  trackArtist: string,
  limit: number = 50
): Promise<TrackShare[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(trackShares)
    .where(
      and(
        eq(trackShares.trackTitle, trackTitle),
        eq(trackShares.trackArtist, trackArtist)
      )
    )
    .orderBy(desc(trackShares.createdAt))
    .limit(limit);
}

export async function updateTrackShareEngagement(
  id: number,
  engagementData: any,
  bonusCoins: number = 0
): Promise<TrackShare> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(trackShares)
    .set({
      engagementData: JSON.stringify(engagementData),
      coinsEarned: sql`${trackShares.coinsEarned} + ${bonusCoins}`,
      updatedAt: new Date(),
    })
    .where(eq(trackShares.id, id));

  const [updated] = await db
    .select()
    .from(trackShares)
    .where(eq(trackShares.id, id))
    .limit(1);
  return updated;
}

export async function canUserShare(
  userId: number,
  platform: string
): Promise<{ canShare: boolean; reason?: string; nextAvailableAt?: Date }> {
  const db = await getDb();
  if (!db) return { canShare: true };

  // Get reward config for this platform
  const [config] = await db
    .select()
    .from(shareRewardsConfig)
    .where(
      and(
        eq(shareRewardsConfig.platform, platform as any),
        eq(shareRewardsConfig.isActive, true)
      )
    )
    .limit(1);

  if (!config) return { canShare: true };

  // Check daily limit
  const today = new Date().toISOString().split("T")[0];
  const todayShares = await db
    .select()
    .from(trackShares)
    .where(
      and(
        eq(trackShares.userId, userId),
        eq(trackShares.platform, platform as any),
        gte(trackShares.createdAt, new Date(today))
      )
    );

  if (todayShares.length >= config.maxSharesPerDay) {
    return {
      canShare: false,
      reason: `Daily limit of ${config.maxSharesPerDay} shares reached`,
    };
  }

  // Check cooldown
  const cooldownMs = config.cooldownMinutes * 60 * 1000;
  const lastShare = todayShares[0];
  if (lastShare) {
    const timeSinceLastShare = Date.now() - new Date(lastShare.createdAt).getTime();
    if (timeSinceLastShare < cooldownMs) {
      const nextAvailableAt = new Date(
        new Date(lastShare.createdAt).getTime() + cooldownMs
      );
      return {
        canShare: false,
        reason: `Please wait ${Math.ceil((cooldownMs - timeSinceLastShare) / 60000)} minutes`,
        nextAvailableAt,
      };
    }
  }

  return { canShare: true };
}

/**
 * ============================================
 * SHARE TEMPLATES
 * ============================================
 */

export async function createShareTemplate(
  template: InsertSocialShareTemplate
): Promise<SocialShareTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(socialShareTemplates).values(template);
  const [inserted] = await db
    .select()
    .from(socialShareTemplates)
    .where(eq(socialShareTemplates.id, Number(result.insertId)))
    .limit(1);
  return inserted;
}

export async function getShareTemplates(
  platform?: string,
  shareType?: string
): Promise<SocialShareTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(socialShareTemplates).where(eq(socialShareTemplates.isActive, true));

  if (platform && shareType) {
    query = query.where(
      and(
        eq(socialShareTemplates.platform, platform as any),
        eq(socialShareTemplates.shareType, shareType as any)
      )
    );
  } else if (platform) {
    query = query.where(eq(socialShareTemplates.platform, platform as any));
  } else if (shareType) {
    query = query.where(eq(socialShareTemplates.shareType, shareType as any));
  }

  return await query.orderBy(desc(socialShareTemplates.priority));
}

export async function getBestTemplate(
  platform: string,
  shareType: string
): Promise<SocialShareTemplate | undefined> {
  const templates = await getShareTemplates(platform, shareType);
  
  // Try platform-specific first
  const platformSpecific = templates.find((t) => t.platform === platform);
  if (platformSpecific) return platformSpecific;

  // Fall back to "all" platform
  const allTemplates = await getShareTemplates("all", shareType);
  return allTemplates[0];
}

export async function renderTemplate(
  templateText: string,
  data: Record<string, string>
): Promise<string> {
  let rendered = templateText;
  for (const [key, value] of Object.entries(data)) {
    rendered = rendered.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }
  return rendered;
}

/**
 * ============================================
 * SHARE REWARDS CONFIG
 * ============================================
 */

export async function createShareRewardConfig(
  config: InsertShareRewardsConfig
): Promise<ShareRewardsConfig> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(shareRewardsConfig).values(config);
  const [inserted] = await db
    .select()
    .from(shareRewardsConfig)
    .where(eq(shareRewardsConfig.id, Number(result.insertId)))
    .limit(1);
  return inserted;
}

export async function getShareRewardConfig(
  platform: string,
  shareType: string
): Promise<ShareRewardsConfig | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [config] = await db
    .select()
    .from(shareRewardsConfig)
    .where(
      and(
        eq(shareRewardsConfig.platform, platform as any),
        eq(shareRewardsConfig.shareType, shareType as any),
        eq(shareRewardsConfig.isActive, true)
      )
    )
    .limit(1);
  return config;
}

export async function listShareRewardConfigs(): Promise<ShareRewardsConfig[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(shareRewardsConfig);
}

export async function updateShareRewardConfig(
  id: number,
  updates: Partial<InsertShareRewardsConfig>
): Promise<ShareRewardsConfig> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(shareRewardsConfig)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(shareRewardsConfig.id, id));

  const [updated] = await db
    .select()
    .from(shareRewardsConfig)
    .where(eq(shareRewardsConfig.id, id))
    .limit(1);
  return updated;
}

/**
 * ============================================
 * ENGAGEMENT SYNC
 * ============================================
 */

export async function createEngagementSync(
  sync: InsertSocialEngagementSync
): Promise<SocialEngagementSync> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(socialEngagementSync).values(sync);
  const [inserted] = await db
    .select()
    .from(socialEngagementSync)
    .where(eq(socialEngagementSync.id, Number(result.insertId)))
    .limit(1);
  return inserted;
}

export async function getLatestEngagementSync(
  trackShareId: number
): Promise<SocialEngagementSync | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [sync] = await db
    .select()
    .from(socialEngagementSync)
    .where(eq(socialEngagementSync.trackShareId, trackShareId))
    .orderBy(desc(socialEngagementSync.lastSyncedAt))
    .limit(1);
  return sync;
}

/**
 * ============================================
 * ANALYTICS
 * ============================================
 */

export async function recordShareAnalytics(
  date: string,
  userId: number | null,
  platform: string | null,
  trackTitle: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // This would typically be done via a cron job or aggregation script
  // For now, just insert a basic record
  await db.insert(shareAnalytics).values({
    date,
    userId,
    platform: platform as any,
    totalShares: 1,
    totalEngagement: 0,
    totalCoinsEarned: 0,
    uniqueTracksShared: 1,
    topTrackTitle: trackTitle,
  });
}

export async function getShareAnalyticsByUser(
  userId: number,
  days: number = 30
): Promise<ShareAnalytics[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  return await db
    .select()
    .from(shareAnalytics)
    .where(
      and(
        eq(shareAnalytics.userId, userId),
        gte(shareAnalytics.date, startDateStr)
      )
    )
    .orderBy(desc(shareAnalytics.date));
}

export async function getShareAnalyticsByPlatform(
  platform: string,
  days: number = 30
): Promise<ShareAnalytics[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split("T")[0];

  return await db
    .select()
    .from(shareAnalytics)
    .where(
      and(
        eq(shareAnalytics.platform, platform as any),
        gte(shareAnalytics.date, startDateStr)
      )
    )
    .orderBy(desc(shareAnalytics.date));
}

export async function getTopSharedTracks(
  days: number = 7,
  limit: number = 10
): Promise<{ trackTitle: string; trackArtist: string; shares: number }[]> {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      trackTitle: trackShares.trackTitle,
      trackArtist: trackShares.trackArtist,
      shares: sql<number>`count(*)`.as("shares"),
    })
    .from(trackShares)
    .where(gte(trackShares.createdAt, startDate))
    .groupBy(trackShares.trackTitle, trackShares.trackArtist)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  return result;
}

export async function getUserShareStats(userId: number): Promise<{
  totalShares: number;
  totalCoinsEarned: number;
  platformBreakdown: { platform: string; shares: number; coins: number }[];
  topTrack: { title: string; artist: string; shares: number } | null;
}> {
  const db = await getDb();
  if (!db)
    return { totalShares: 0, totalCoinsEarned: 0, platformBreakdown: [], topTrack: null };

  const shares = await db
    .select()
    .from(trackShares)
    .where(eq(trackShares.userId, userId));

  const totalShares = shares.length;
  const totalCoinsEarned = shares.reduce((sum, s) => sum + (s.coinsEarned || 0), 0);

  // Platform breakdown
  const platformMap = new Map<string, { shares: number; coins: number }>();
  shares.forEach((share) => {
    const current = platformMap.get(share.platform) || { shares: 0, coins: 0 };
    platformMap.set(share.platform, {
      shares: current.shares + 1,
      coins: current.coins + (share.coinsEarned || 0),
    });
  });
  const platformBreakdown = Array.from(platformMap.entries()).map(([platform, data]) => ({
    platform,
    ...data,
  }));

  // Top track
  const trackMap = new Map<string, number>();
  shares.forEach((share) => {
    const key = `${share.trackTitle}|||${share.trackArtist}`;
    trackMap.set(key, (trackMap.get(key) || 0) + 1);
  });
  let topTrack = null;
  if (trackMap.size > 0) {
    const sortedTracks = Array.from(trackMap.entries()).sort((a, b) => b[1] - a[1]);
    const [key, shares] = sortedTracks[0];
    const [title, artist] = key.split("|||");
    topTrack = { title, artist, shares };
  }

  return { totalShares, totalCoinsEarned, platformBreakdown, topTrack };
}
