import { db } from '../db';
import { mixPlays, mixLikes, users, mixes, shouts, trackRequests } from '../../drizzle/schema';
import { sql, desc, and, gte, lte } from 'drizzle-orm';
import { trackEvent } from './analytics';

interface TimeSeriesData {
  date: string;
  value: number;
}

interface UserCohort {
  cohort: string;
  size: number;
  activeUsers: number;
  retentionRate: number;
}

interface ContentPerformance {
  id: number;
  title: string;
  plays: number;
  likes: number;
  engagement: number;
  avgListenDuration: number;
  completionRate: number;
}

/**
 * Get user growth over time
 */
export async function getUserGrowth(days: number = 30): Promise<TimeSeriesData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db.execute(sql`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as value
    FROM users
    WHERE created_at >= ${startDate}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `);

  return result.rows.map((row: any) => ({
    date: row.date,
    value: Number(row.value),
  }));
}

/**
 * Get Daily Active Users (DAU)
 */
export async function getDAU(days: number = 30): Promise<TimeSeriesData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db.execute(sql`
    SELECT 
      DATE(played_at) as date,
      COUNT(DISTINCT user_id) as value
    FROM mix_plays
    WHERE played_at >= ${startDate}
    GROUP BY DATE(played_at)
    ORDER BY date ASC
  `);

  return result.rows.map((row: any) => ({
    date: row.date,
    value: Number(row.value),
  }));
}

/**
 * Get Monthly Active Users (MAU)
 */
export async function getMAU(): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM mix_plays
    WHERE played_at >= ${thirtyDaysAgo}
  `);

  return Number(result.rows[0]?.count || 0);
}

/**
 * Calculate churn rate
 */
export async function getChurnRate(): Promise<number> {
  const thisMonth = new Date();
  thisMonth.setDate(1);

  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const twoMonthsAgo = new Date(lastMonth);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);

  // Users active last month
  const lastMonthUsers = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM mix_plays
    WHERE played_at >= ${lastMonth} AND played_at < ${thisMonth}
  `);

  // Users active last month but not this month
  const churnedUsers = await db.execute(sql`
    SELECT COUNT(DISTINCT user_id) as count
    FROM mix_plays
    WHERE played_at >= ${lastMonth} AND played_at < ${thisMonth}
    AND user_id NOT IN (
      SELECT DISTINCT user_id FROM mix_plays WHERE played_at >= ${thisMonth}
    )
  `);

  const total = Number(lastMonthUsers.rows[0]?.count || 0);
  const churned = Number(churnedUsers.rows[0]?.count || 0);

  return total > 0 ? (churned / total) * 100 : 0;
}

/**
 * Get retention cohorts
 */
export async function getRetentionCohorts(): Promise<UserCohort[]> {
  const result = await db.execute(sql`
    WITH user_cohorts AS (
      SELECT 
        user_id,
        DATE_FORMAT(created_at, '%Y-%m') as cohort,
        created_at
      FROM users
    ),
    cohort_activity AS (
      SELECT 
        uc.cohort,
        COUNT(DISTINCT uc.user_id) as cohort_size,
        COUNT(DISTINCT CASE 
          WHEN mp.played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
          THEN mp.user_id 
        END) as active_users
      FROM user_cohorts uc
      LEFT JOIN mix_plays mp ON uc.user_id = mp.user_id
      GROUP BY uc.cohort
    )
    SELECT 
      cohort,
      cohort_size as size,
      active_users as activeUsers,
      CASE 
        WHEN cohort_size > 0 
        THEN (active_users / cohort_size) * 100 
        ELSE 0 
      END as retentionRate
    FROM cohort_activity
    ORDER BY cohort DESC
    LIMIT 12
  `);

  return result.rows.map((row: any) => ({
    cohort: row.cohort,
    size: Number(row.size),
    activeUsers: Number(row.activeUsers),
    retentionRate: Number(row.retentionRate),
  }));
}

/**
 * Get top performing content
 */
export async function getTopContent(limit: number = 10): Promise<ContentPerformance[]> {
  const result = await db.execute(sql`
    SELECT 
      m.id,
      m.title,
      COUNT(DISTINCT mp.id) as plays,
      COUNT(DISTINCT ml.id) as likes,
      (COUNT(DISTINCT mp.id) + COUNT(DISTINCT ml.id) * 5) as engagement,
      AVG(mp.duration) as avgListenDuration,
      (SUM(CASE WHEN mp.duration >= 120 THEN 1 ELSE 0 END) / COUNT(*)) * 100 as completionRate
    FROM mixes m
    LEFT JOIN mix_plays mp ON m.id = mp.mix_id
    LEFT JOIN mix_likes ml ON m.id = ml.mix_id
    WHERE mp.played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY m.id, m.title
    ORDER BY engagement DESC
    LIMIT ${limit}
  `);

  return result.rows.map((row: any) => ({
    id: Number(row.id),
    title: row.title,
    plays: Number(row.plays),
    likes: Number(row.likes),
    engagement: Number(row.engagement),
    avgListenDuration: Number(row.avgListenDuration) || 0,
    completionRate: Number(row.completionRate) || 0,
  }));
}

/**
 * Get engagement metrics by time of day
 */
export async function getEngagementByHour(): Promise<{ hour: number; plays: number }[]> {
  const result = await db.execute(sql`
    SELECT 
      HOUR(played_at) as hour,
      COUNT(*) as plays
    FROM mix_plays
    WHERE played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY HOUR(played_at)
    ORDER BY hour ASC
  `);

  return result.rows.map((row: any) => ({
    hour: Number(row.hour),
    plays: Number(row.plays),
  }));
}

/**
 * Get engagement by day of week
 */
export async function getEngagementByDay(): Promise<{ day: number; plays: number }[]> {
  const result = await db.execute(sql`
    SELECT 
      DAYOFWEEK(played_at) as day,
      COUNT(*) as plays
    FROM mix_plays
    WHERE played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY DAYOFWEEK(played_at)
    ORDER BY day ASC
  `);

  return result.rows.map((row: any) => ({
    day: Number(row.day),
    plays: Number(row.plays),
  }));
}

/**
 * Predict user churn using simple ML
 */
export async function predictChurn(userId: number): Promise<{
  riskScore: number;
  risk: 'low' | 'medium' | 'high';
  factors: string[];
}> {
  const factors: string[] = [];
  let score = 0;

  // Get user activity
  const recentPlays = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM mix_plays
    WHERE user_id = ${userId} AND played_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  const totalPlays = await db.execute(sql`
    SELECT COUNT(*) as count
    FROM mix_plays
    WHERE user_id = ${userId}
  `);

  const lastPlay = await db.execute(sql`
    SELECT MAX(played_at) as last_play
    FROM mix_plays
    WHERE user_id = ${userId}
  `);

  const recentCount = Number(recentPlays.rows[0]?.count || 0);
  const total = Number(totalPlays.rows[0]?.count || 0);
  const lastPlayDate = lastPlay.rows[0]?.last_play;

  // Factor 1: Recent activity decline
  if (recentCount === 0 && total > 0) {
    score += 40;
    factors.push('No activity in last 7 days');
  }

  // Factor 2: Days since last play
  if (lastPlayDate) {
    const daysSinceLastPlay = Math.floor(
      (Date.now() - new Date(lastPlayDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastPlay > 14) {
      score += 30;
      factors.push(`Inactive for ${daysSinceLastPlay} days`);
    } else if (daysSinceLastPlay > 7) {
      score += 15;
      factors.push(`${daysSinceLastPlay} days since last play`);
    }
  }

  // Factor 3: Low engagement history
  if (total < 5) {
    score += 20;
    factors.push('Low overall engagement');
  }

  // Factor 4: No likes/interactions
  const likes = await db.execute(sql`
    SELECT COUNT(*) as count FROM mix_likes WHERE user_id = ${userId}
  `);

  if (Number(likes.rows[0]?.count || 0) === 0 && total > 10) {
    score += 10;
    factors.push('No likes or favorites');
  }

  const risk: 'low' | 'medium' | 'high' =
    score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return {
    riskScore: Math.min(score, 100),
    risk,
    factors,
  };
}

/**
 * Get comprehensive analytics dashboard data
 */
export async function getAnalyticsDashboard() {
  const [
    dau,
    mau,
    churnRate,
    topContent,
    hourlyEngagement,
    dailyEngagement,
    cohorts,
    userGrowth,
  ] = await Promise.all([
    getDAU(30),
    getMAU(),
    getChurnRate(),
    getTopContent(10),
    getEngagementByHour(),
    getEngagementByDay(),
    getRetentionCohorts(),
    getUserGrowth(30),
  ]);

  // Calculate averages
  const avgDAU = dau.reduce((sum, d) => sum + d.value, 0) / dau.length || 0;

  return {
    overview: {
      dau: dau[dau.length - 1]?.value || 0,
      avgDAU: Math.round(avgDAU),
      mau,
      churnRate: Math.round(churnRate * 10) / 10,
      dauMauRatio: mau > 0 ? Math.round((avgDAU / mau) * 100) / 100 : 0,
    },
    timeSeries: {
      dau,
      userGrowth,
    },
    content: {
      top: topContent,
    },
    engagement: {
      byHour: hourlyEngagement,
      byDay: dailyEngagement,
    },
    retention: {
      cohorts,
    },
  };
}

/**
 * Track custom analytics event
 */
export async function trackCustomEvent(
  eventName: string,
  userId?: number,
  properties?: Record<string, any>
) {
  await trackEvent(eventName, userId?.toString(), properties);
}

/**
 * Get real-time statistics
 */
export async function getRealTimeStats() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const [activeSessions, recentPlays, recentShouts, recentRequests] = await Promise.all([
    // Active sessions (played in last hour)
    db.execute(sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM mix_plays
      WHERE played_at >= ${oneHourAgo}
    `),
    
    // Plays in last hour
    db.execute(sql`
      SELECT COUNT(*) as count
      FROM mix_plays
      WHERE played_at >= ${oneHourAgo}
    `),
    
    // Shouts in last hour
    db.execute(sql`
      SELECT COUNT(*) as count
      FROM shouts
      WHERE created_at >= ${oneHourAgo}
    `),
    
    // Track requests in last hour
    db.execute(sql`
      SELECT COUNT(*) as count
      FROM track_requests
      WHERE created_at >= ${oneHourAgo}
    `),
  ]);

  return {
    activeSessions: Number(activeSessions.rows[0]?.count || 0),
    playsLastHour: Number(recentPlays.rows[0]?.count || 0),
    shoutsLastHour: Number(recentShouts.rows[0]?.count || 0),
    requestsLastHour: Number(recentRequests.rows[0]?.count || 0),
    timestamp: now.toISOString(),
  };
}
