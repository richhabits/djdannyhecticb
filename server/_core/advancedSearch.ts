import FlexSearch from 'flexsearch';
import { db } from '../db';
import { mixes, users, artists, genres } from '../../drizzle/schema';
import { like, or, and, sql } from 'drizzle-orm';

interface SearchResult {
  id: number;
  type: 'mix' | 'artist' | 'user' | 'genre';
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  score: number;
}

interface SearchFilters {
  type?: 'mix' | 'artist' | 'user' | 'genre';
  genre?: string;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

// FlexSearch indexes
const mixIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['title', 'description', 'tags'],
    store: ['title', 'artistName', 'coverImage', 'genreName'],
  },
  tokenize: 'forward',
  cache: true,
});

const artistIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['name', 'bio'],
    store: ['name', 'profileImage'],
  },
  tokenize: 'forward',
});

const userIndex = new FlexSearch.Document({
  document: {
    id: 'id',
    index: ['name', 'username', 'bio'],
    store: ['name', 'username', 'avatarUrl'],
  },
  tokenize: 'forward',
});

/**
 * Index all content for search
 */
export async function indexAllContent() {
  console.log('[Search] Indexing all content...');

  // Index mixes
  const allMixes = await db.query.mixes.findMany({
    with: {
      artist: true,
      genre: true,
    },
  });

  for (const mix of allMixes) {
    await mixIndex.addAsync(mix.id, {
      id: mix.id,
      title: mix.title,
      description: mix.description || '',
      tags: mix.tags?.join(' ') || '',
      artistName: mix.artist?.name || '',
      genreName: mix.genre?.name || '',
      coverImage: mix.coverImage || '',
    });
  }

  // Index artists
  const allArtists = await db.query.artists.findMany();

  for (const artist of allArtists) {
    await artistIndex.addAsync(artist.id, {
      id: artist.id,
      name: artist.name,
      bio: artist.bio || '',
      profileImage: artist.profileImage || '',
    });
  }

  // Index users
  const allUsers = await db.query.users.findMany();

  for (const user of allUsers) {
    if (user.name) {
      await userIndex.addAsync(user.id, {
        id: user.id,
        name: user.name,
        username: user.name, // Using name as username for now
        bio: '',
        avatarUrl: '',
      });
    }
  }

  console.log(`[Search] Indexed ${allMixes.length} mixes, ${allArtists.length} artists, ${allUsers.length} users`);
}

/**
 * Search across all content
 */
export async function search(
  query: string,
  filters?: SearchFilters,
  limit: number = 20
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  // Search mixes
  if (!filters?.type || filters.type === 'mix') {
    const mixResults = await mixIndex.searchAsync(query, { limit });
    
    for (const result of mixResults) {
      for (const id of result.result as number[]) {
        const mix = await db.query.mixes.findFirst({
          where: (mixes, { eq }) => eq(mixes.id, id),
          with: {
            artist: true,
            genre: true,
          },
        });

        if (mix) {
          // Apply filters
          if (filters?.genre && mix.genre?.name !== filters.genre) continue;
          if (filters?.minDuration && mix.duration < filters.minDuration) continue;
          if (filters?.maxDuration && mix.duration > filters.maxDuration) continue;

          results.push({
            id: mix.id,
            type: 'mix',
            title: mix.title,
            subtitle: mix.artist?.name,
            image: mix.coverImage || undefined,
            url: `/mixes/${mix.id}`,
            score: 1.0,
          });
        }
      }
    }
  }

  // Search artists
  if (!filters?.type || filters.type === 'artist') {
    const artistResults = await artistIndex.searchAsync(query, { limit: 10 });
    
    for (const result of artistResults) {
      for (const id of result.result as number[]) {
        const artist = await db.query.artists.findFirst({
          where: (artists, { eq }) => eq(artists.id, id),
        });

        if (artist) {
          results.push({
            id: artist.id,
            type: 'artist',
            title: artist.name,
            subtitle: 'Artist',
            image: artist.profileImage || undefined,
            url: `/artists/${artist.id}`,
            score: 0.9,
          });
        }
      }
    }
  }

  // Sort by score and relevance
  results.sort((a, b) => {
    if (filters?.sortBy === 'popularity') {
      // TODO: Sort by play count or popularity metric
      return b.score - a.score;
    }
    return b.score - a.score;
  });

  return results.slice(0, limit);
}

/**
 * Get search suggestions (autocomplete)
 */
export async function getSuggestions(query: string, limit: number = 5): Promise<string[]> {
  const suggestions = new Set<string>();

  // Get mix titles
  const mixResults = await mixIndex.searchAsync(query, { limit });
  for (const result of mixResults) {
    for (const id of result.result as number[]) {
      const mix = await db.query.mixes.findFirst({
        where: (mixes, { eq }) => eq(mixes.id, id),
      });
      if (mix) suggestions.add(mix.title);
    }
  }

  // Get artist names
  const artistResults = await artistIndex.searchAsync(query, { limit });
  for (const result of artistResults) {
    for (const id of result.result as number[]) {
      const artist = await db.query.artists.findFirst({
        where: (artists, { eq }) => eq(artists.id, id),
      });
      if (artist) suggestions.add(artist.name);
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get trending searches
 */
export async function getTrendingSearches(limit: number = 10): Promise<string[]> {
  // TODO: Track search queries in database and return most popular
  // For now, return popular mix titles
  const popularMixes = await db.query.mixes.findMany({
    orderBy: (mixes, { desc }) => [desc(mixes.playCount)],
    limit,
  });

  return popularMixes.map(mix => mix.title);
}

/**
 * Track search query for analytics
 */
export async function trackSearch(query: string, userId?: number, resultsCount?: number) {
  // TODO: Store in search_queries table for analytics
  console.log(`[Search] Query: "${query}" by user ${userId}, ${resultsCount} results`);
}

/**
 * Advanced search with filters
 */
export async function advancedSearch(params: {
  query: string;
  filters?: {
    genres?: string[];
    artists?: number[];
    minPlayCount?: number;
    minRating?: number;
    dateFrom?: Date;
    dateTo?: Date;
  };
  sortBy?: 'relevance' | 'date' | 'popularity' | 'duration';
  page?: number;
  limit?: number;
}): Promise<{ results: SearchResult[]; total: number; page: number; totalPages: number }> {
  const { query, filters, sortBy = 'relevance', page = 1, limit = 20 } = params;
  
  // Build SQL query with filters
  let whereConditions = [];
  
  if (query) {
    whereConditions.push(
      or(
        like(mixes.title, `%${query}%`),
        like(mixes.description, `%${query}%`)
      )
    );
  }

  if (filters?.minPlayCount) {
    whereConditions.push(sql`${mixes.playCount} >= ${filters.minPlayCount}`);
  }

  if (filters?.dateFrom) {
    whereConditions.push(sql`${mixes.createdAt} >= ${filters.dateFrom}`);
  }

  if (filters?.dateTo) {
    whereConditions.push(sql`${mixes.createdAt} <= ${filters.dateTo}`);
  }

  // Execute search
  const results = await db.query.mixes.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      artist: true,
      genre: true,
    },
    limit,
    offset: (page - 1) * limit,
  });

  // Get total count
  const totalResult = await db.execute(sql`
    SELECT COUNT(*) as count FROM mixes
    ${whereConditions.length > 0 ? sql`WHERE ${and(...whereConditions)}` : sql``}
  `);

  const total = Number(totalResult.rows[0]?.count || 0);

  return {
    results: results.map(mix => ({
      id: mix.id,
      type: 'mix' as const,
      title: mix.title,
      subtitle: mix.artist?.name,
      image: mix.coverImage || undefined,
      url: `/mixes/${mix.id}`,
      score: 1.0,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Faceted search (get filter options with counts)
 */
export async function getFacets(query: string): Promise<{
  genres: Array<{ name: string; count: number }>;
  artists: Array<{ name: string; count: number }>;
}> {
  // Get genre distribution in search results
  const genreFacets = await db.execute(sql`
    SELECT g.name, COUNT(*) as count
    FROM mixes m
    INNER JOIN genres g ON m.genre_id = g.id
    WHERE m.title LIKE ${'%' + query + '%'}
    GROUP BY g.name
    ORDER BY count DESC
    LIMIT 10
  `);

  // Get artist distribution
  const artistFacets = await db.execute(sql`
    SELECT a.name, COUNT(*) as count
    FROM mixes m
    INNER JOIN artists a ON m.artist_id = a.id
    WHERE m.title LIKE ${'%' + query + '%'}
    GROUP BY a.name
    ORDER BY count DESC
    LIMIT 10
  `);

  return {
    genres: genreFacets.rows.map((row: any) => ({
      name: row.name,
      count: Number(row.count),
    })),
    artists: artistFacets.rows.map((row: any) => ({
      name: row.name,
      count: Number(row.count),
    })),
  };
}

export type { SearchResult, SearchFilters };
