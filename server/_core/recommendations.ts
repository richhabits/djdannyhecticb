import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbeddings } from './aiProviders';
import { ENV } from './env';
import { db } from '../db';
import { mixes, users, mixPlays, mixLikes, genres, artists } from '../../drizzle/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';

let pinecone: Pinecone | null = null;
let pineconeIndex: any = null;

interface MixMetadata {
  mixId: number;
  title: string;
  description?: string;
  genre?: string;
  artistId?: number;
  tags?: string[];
  playCount: number;
  likeCount: number;
  avgRating: number;
  createdAt: number;
}

interface RecommendationScore {
  mixId: number;
  score: number;
  reason: string;
}

interface UserPreferences {
  favoriteGenres: string[];
  favoriteArtists: number[];
  recentlyPlayed: number[];
  likedMixes: number[];
  avgSessionLength: number;
  preferredTimes: string[];
}

/**
 * Initialize Pinecone vector database
 */
export async function initializePinecone() {
  if (!ENV.PINECONE_API_KEY) {
    console.warn('[Recommendations] Pinecone not configured, using fallback recommendations');
    return null;
  }

  try {
    pinecone = new Pinecone({
      apiKey: ENV.PINECONE_API_KEY,
    });

    // Create or connect to index
    const indexName = ENV.PINECONE_INDEX_NAME || 'hectic-mixes';
    
    try {
      pineconeIndex = pinecone.index(indexName);
      console.log(`[Recommendations] Connected to Pinecone index: ${indexName}`);
    } catch (error) {
      console.log(`[Recommendations] Creating new Pinecone index: ${indexName}`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 1536, // OpenAI ada-002 embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      pineconeIndex = pinecone.index(indexName);
    }

    return pineconeIndex;
  } catch (error) {
    console.error('[Recommendations] Failed to initialize Pinecone:', error);
    return null;
  }
}

/**
 * Generate embeddings for a mix
 */
export async function generateMixEmbedding(mixId: number): Promise<number[] | null> {
  try {
    // Get mix details
    const mix = await db.query.mixes.findFirst({
      where: eq(mixes.id, mixId),
      with: {
        genre: true,
        artist: true,
      },
    });

    if (!mix) {
      throw new Error(`Mix ${mixId} not found`);
    }

    // Create rich text description for embedding
    const embeddingText = [
      `Title: ${mix.title}`,
      mix.description ? `Description: ${mix.description}` : '',
      mix.genre ? `Genre: ${mix.genre.name}` : '',
      mix.artist ? `Artist: ${mix.artist.name}` : '',
      mix.tags ? `Tags: ${mix.tags.join(', ')}` : '',
      mix.mood ? `Mood: ${mix.mood}` : '',
      mix.bpm ? `BPM: ${mix.bpm}` : '',
    ].filter(Boolean).join('\n');

    // Generate embedding using OpenAI
    const embeddings = await generateEmbeddings([embeddingText]);
    
    return embeddings[0];
  } catch (error) {
    console.error(`[Recommendations] Failed to generate embedding for mix ${mixId}:`, error);
    return null;
  }
}

/**
 * Index a mix in the vector database
 */
export async function indexMix(mixId: number): Promise<boolean> {
  if (!pineconeIndex) {
    await initializePinecone();
    if (!pineconeIndex) return false;
  }

  try {
    const embedding = await generateMixEmbedding(mixId);
    if (!embedding) return false;

    // Get mix stats
    const [playStats, likeStats] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(mixPlays)
        .where(eq(mixPlays.mixId, mixId)),
      db.select({ count: sql<number>`count(*)` })
        .from(mixLikes)
        .where(eq(mixLikes.mixId, mixId)),
    ]);

    const mix = await db.query.mixes.findFirst({
      where: eq(mixes.id, mixId),
      with: { genre: true, artist: true },
    });

    if (!mix) return false;

    const metadata: MixMetadata = {
      mixId,
      title: mix.title,
      description: mix.description || undefined,
      genre: mix.genre?.name,
      artistId: mix.artistId || undefined,
      tags: mix.tags || undefined,
      playCount: Number(playStats[0]?.count || 0),
      likeCount: Number(likeStats[0]?.count || 0),
      avgRating: 0, // TODO: Calculate from ratings table
      createdAt: new Date(mix.createdAt).getTime(),
    };

    // Upsert to Pinecone
    await pineconeIndex.upsert([
      {
        id: `mix_${mixId}`,
        values: embedding,
        metadata,
      },
    ]);

    console.log(`[Recommendations] Indexed mix ${mixId}: ${mix.title}`);
    return true;
  } catch (error) {
    console.error(`[Recommendations] Failed to index mix ${mixId}:`, error);
    return false;
  }
}

/**
 * Batch index all mixes
 */
export async function indexAllMixes(): Promise<number> {
  const allMixes = await db.select({ id: mixes.id }).from(mixes);
  
  let indexed = 0;
  const batchSize = 10;
  
  for (let i = 0; i < allMixes.length; i += batchSize) {
    const batch = allMixes.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(mix => indexMix(mix.id))
    );
    indexed += results.filter(Boolean).length;
    
    console.log(`[Recommendations] Indexed ${indexed}/${allMixes.length} mixes`);
  }

  return indexed;
}

/**
 * Get user preferences from listening history
 */
export async function getUserPreferences(userId: number): Promise<UserPreferences> {
  // Get recent plays (last 30 days)
  const recentPlays = await db.query.mixPlays.findMany({
    where: and(
      eq(mixPlays.userId, userId),
      sql`${mixPlays.playedAt} > DATE_SUB(NOW(), INTERVAL 30 DAY)`
    ),
    with: {
      mix: {
        with: {
          genre: true,
          artist: true,
        },
      },
    },
    orderBy: [desc(mixPlays.playedAt)],
    limit: 100,
  });

  // Get liked mixes
  const likedMixes = await db.query.mixLikes.findMany({
    where: eq(mixLikes.userId, userId),
    with: {
      mix: {
        with: {
          genre: true,
        },
      },
    },
  });

  // Calculate genre preferences
  const genreCount = new Map<string, number>();
  recentPlays.forEach(play => {
    const genre = play.mix?.genre?.name;
    if (genre) {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    }
  });

  const favoriteGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  // Calculate artist preferences
  const artistCount = new Map<number, number>();
  recentPlays.forEach(play => {
    const artistId = play.mix?.artistId;
    if (artistId) {
      artistCount.set(artistId, (artistCount.get(artistId) || 0) + 1);
    }
  });

  const favoriteArtists = Array.from(artistCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([artistId]) => artistId);

  return {
    favoriteGenres,
    favoriteArtists,
    recentlyPlayed: recentPlays.slice(0, 20).map(p => p.mixId),
    likedMixes: likedMixes.map(l => l.mixId),
    avgSessionLength: 0, // TODO: Calculate
    preferredTimes: [], // TODO: Analyze listening times
  };
}

/**
 * Get personalized recommendations for a user
 */
export async function getPersonalizedRecommendations(
  userId: number,
  limit: number = 10
): Promise<RecommendationScore[]> {
  try {
    const preferences = await getUserPreferences(userId);

    // If Pinecone is available, use vector similarity
    if (pineconeIndex) {
      return await getVectorBasedRecommendations(userId, preferences, limit);
    }

    // Fallback to rule-based recommendations
    return await getRuleBasedRecommendations(userId, preferences, limit);
  } catch (error) {
    console.error('[Recommendations] Failed to get recommendations:', error);
    return [];
  }
}

/**
 * Vector-based recommendations using Pinecone
 */
async function getVectorBasedRecommendations(
  userId: number,
  preferences: UserPreferences,
  limit: number
): Promise<RecommendationScore[]> {
  // Create a query embedding from user's favorite mixes
  const favoriteMixes = [...preferences.likedMixes, ...preferences.recentlyPlayed].slice(0, 5);
  
  if (favoriteMixes.length === 0) {
    // New user - return trending mixes
    return getTrendingMixes(limit);
  }

  // Get embeddings for favorite mixes
  const embeddings = await Promise.all(
    favoriteMixes.map(mixId => generateMixEmbedding(mixId))
  );

  const validEmbeddings = embeddings.filter((e): e is number[] => e !== null);
  
  if (validEmbeddings.length === 0) {
    return getRuleBasedRecommendations(userId, preferences, limit);
  }

  // Average the embeddings to create a user preference vector
  const avgEmbedding = validEmbeddings[0].map((_, i) => {
    const sum = validEmbeddings.reduce((acc, emb) => acc + emb[i], 0);
    return sum / validEmbeddings.length;
  });

  // Query Pinecone for similar mixes
  const results = await pineconeIndex.query({
    vector: avgEmbedding,
    topK: limit * 3, // Get more to filter out already played
    includeMetadata: true,
  });

  // Filter out already played/liked mixes
  const alreadySeen = new Set([...preferences.recentlyPlayed, ...preferences.likedMixes]);
  
  const recommendations = results.matches
    .filter((match: any) => {
      const mixId = match.metadata?.mixId;
      return mixId && !alreadySeen.has(mixId);
    })
    .slice(0, limit)
    .map((match: any) => ({
      mixId: match.metadata.mixId,
      score: match.score,
      reason: 'Similar to mixes you love',
    }));

  return recommendations;
}

/**
 * Rule-based recommendations (fallback)
 */
async function getRuleBasedRecommendations(
  userId: number,
  preferences: UserPreferences,
  limit: number
): Promise<RecommendationScore[]> {
  const recommendations: RecommendationScore[] = [];
  const alreadySeen = new Set([...preferences.recentlyPlayed, ...preferences.likedMixes]);

  // 1. Recommend from favorite genres (40%)
  if (preferences.favoriteGenres.length > 0) {
    const genreMixes = await db.query.mixes.findMany({
      where: sql`${mixes.genreId} IN (
        SELECT id FROM genres WHERE name IN (${sql.join(preferences.favoriteGenres.map(g => sql`${g}`), sql`, `)})
      ) AND ${mixes.id} NOT IN (${sql.join(Array.from(alreadySeen).map(id => sql`${id}`), sql`, `)})`,
      orderBy: [desc(mixes.playCount)],
      limit: Math.ceil(limit * 0.4),
    });

    recommendations.push(...genreMixes.map(mix => ({
      mixId: mix.id,
      score: 0.8,
      reason: `${mix.genre} - One of your favorite genres`,
    })));
  }

  // 2. Recommend from favorite artists (30%)
  if (preferences.favoriteArtists.length > 0) {
    const artistMixes = await db.query.mixes.findMany({
      where: and(
        inArray(mixes.artistId, preferences.favoriteArtists),
        sql`${mixes.id} NOT IN (${sql.join(Array.from(alreadySeen).map(id => sql`${id}`), sql`, `)})`
      ),
      orderBy: [desc(mixes.createdAt)],
      limit: Math.ceil(limit * 0.3),
    });

    recommendations.push(...artistMixes.map(mix => ({
      mixId: mix.id,
      score: 0.75,
      reason: 'New from an artist you follow',
    })));
  }

  // 3. Trending mixes (30%)
  const trending = await getTrendingMixes(Math.ceil(limit * 0.3));
  recommendations.push(...trending.filter(t => !alreadySeen.has(t.mixId)));

  // Sort by score and return top N
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get trending mixes
 */
export async function getTrendingMixes(limit: number = 10): Promise<RecommendationScore[]> {
  const trendingMixes = await db.query.mixes.findMany({
    where: sql`${mixes.createdAt} > DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    orderBy: [desc(mixes.playCount)],
    limit,
  });

  return trendingMixes.map(mix => ({
    mixId: mix.id,
    score: 0.7,
    reason: 'Trending this week',
  }));
}

/**
 * Get "Discover Weekly" style playlist
 */
export async function getDiscoverWeekly(userId: number): Promise<number[]> {
  const recommendations = await getPersonalizedRecommendations(userId, 20);
  return recommendations.map(r => r.mixId);
}

/**
 * Get similar mixes to a given mix
 */
export async function getSimilarMixes(mixId: number, limit: number = 5): Promise<RecommendationScore[]> {
  if (!pineconeIndex) {
    await initializePinecone();
  }

  if (pineconeIndex) {
    try {
      const embedding = await generateMixEmbedding(mixId);
      if (!embedding) {
        return getSimilarMixesFallback(mixId, limit);
      }

      const results = await pineconeIndex.query({
        vector: embedding,
        topK: limit + 1, // +1 to exclude the query mix itself
        includeMetadata: true,
      });

      return results.matches
        .filter((match: any) => match.metadata?.mixId !== mixId)
        .slice(0, limit)
        .map((match: any) => ({
          mixId: match.metadata.mixId,
          score: match.score,
          reason: 'Similar vibe',
        }));
    } catch (error) {
      console.error('[Recommendations] Vector similarity failed:', error);
    }
  }

  return getSimilarMixesFallback(mixId, limit);
}

/**
 * Fallback similar mixes based on genre/artist
 */
async function getSimilarMixesFallback(mixId: number, limit: number): Promise<RecommendationScore[]> {
  const mix = await db.query.mixes.findFirst({
    where: eq(mixes.id, mixId),
  });

  if (!mix) return [];

  // Get mixes from same genre/artist
  const similarMixes = await db.query.mixes.findMany({
    where: and(
      sql`${mixes.id} != ${mixId}`,
      sql`(${mixes.genreId} = ${mix.genreId} OR ${mixes.artistId} = ${mix.artistId})`
    ),
    orderBy: [desc(mixes.playCount)],
    limit,
  });

  return similarMixes.map(m => ({
    mixId: m.id,
    score: 0.6,
    reason: 'Similar genre or artist',
  }));
}

/**
 * Track a mix play for recommendation learning
 */
export async function trackMixPlay(userId: number, mixId: number, duration: number) {
  try {
    await db.insert(mixPlays).values({
      userId,
      mixId,
      playedAt: new Date(),
      duration,
    });

    // Update play count
    await db.update(mixes)
      .set({ 
        playCount: sql`${mixes.playCount} + 1`,
        lastPlayedAt: new Date(),
      })
      .where(eq(mixes.id, mixId));

    console.log(`[Recommendations] Tracked play: User ${userId} played Mix ${mixId} for ${duration}s`);
  } catch (error) {
    console.error('[Recommendations] Failed to track play:', error);
  }
}

/**
 * Get recommendations for a specific mood
 */
export async function getMoodBasedRecommendations(
  mood: string,
  limit: number = 10
): Promise<RecommendationScore[]> {
  const moodMixes = await db.query.mixes.findMany({
    where: eq(mixes.mood, mood),
    orderBy: [desc(mixes.playCount)],
    limit,
  });

  return moodMixes.map(mix => ({
    mixId: mix.id,
    score: 0.8,
    reason: `Perfect for ${mood} vibes`,
  }));
}

/**
 * Collaborative filtering - "Users who liked this also liked..."
 */
export async function getCollaborativeRecommendations(
  mixId: number,
  limit: number = 5
): Promise<RecommendationScore[]> {
  // Find users who liked this mix
  const likers = await db.query.mixLikes.findMany({
    where: eq(mixLikes.mixId, mixId),
    limit: 50,
  });

  if (likers.length === 0) return [];

  // Find what else they liked
  const otherLikes = await db.query.mixLikes.findMany({
    where: and(
      inArray(mixLikes.userId, likers.map(l => l.userId)),
      sql`${mixLikes.mixId} != ${mixId}`
    ),
  });

  // Count frequency
  const mixCounts = new Map<number, number>();
  otherLikes.forEach(like => {
    mixCounts.set(like.mixId, (mixCounts.get(like.mixId) || 0) + 1);
  });

  // Sort by frequency
  const sortedMixes = Array.from(mixCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sortedMixes.map(([mixId, count]) => ({
    mixId,
    score: Math.min(count / likers.length, 1),
    reason: 'Fans of this mix also loved',
  }));
}

export type {
  MixMetadata,
  RecommendationScore,
  UserPreferences,
};
