import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLBoolean, GraphQLFloat, GraphQLInputObjectType, GraphQLEnumType } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { Express } from 'express';
import DataLoader from 'dataloader';
import { PubSub as GraphQLPubSub } from 'graphql-subscriptions';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { db } from '../db';
import { users, mixes, bookings, events, podcasts } from '../../drizzle/schema';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';
import { CacheManager, CACHE_PREFIXES, CACHE_TTL } from './cache';

/**
 * Enterprise GraphQL API Layer
 * Provides flexible querying, batching, and real-time subscriptions
 */

// Initialize Redis PubSub for subscriptions
const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL),
  subscriber: new Redis(process.env.REDIS_URL),
});

// DataLoaders for batch loading and caching
class DataLoaders {
  userLoader = new DataLoader(async (userIds: readonly number[]) => {
    const users = await db.execute(sql`
      SELECT * FROM users WHERE id IN (${sql.join(userIds as number[], sql`, `)})
    `);
    const userMap = new Map(users.rows.map((user: any) => [user.id, user]));
    return userIds.map(id => userMap.get(id));
  });

  mixLoader = new DataLoader(async (mixIds: readonly number[]) => {
    const mixes = await db.execute(sql`
      SELECT * FROM mixes WHERE id IN (${sql.join(mixIds as number[], sql`, `)})
    `);
    const mixMap = new Map(mixes.rows.map((mix: any) => [mix.id, mix]));
    return mixIds.map(id => mixMap.get(id));
  });

  bookingLoader = new DataLoader(async (bookingIds: readonly number[]) => {
    const bookings = await db.execute(sql`
      SELECT * FROM bookings WHERE id IN (${sql.join(bookingIds as number[], sql`, `)})
    `);
    const bookingMap = new Map(bookings.rows.map((booking: any) => [booking.id, booking]));
    return bookingIds.map(id => bookingMap.get(id));
  });

  eventStatsLoader = new DataLoader(async (eventIds: readonly number[]) => {
    const stats = await db.execute(sql`
      SELECT 
        eventId,
        COUNT(DISTINCT userId) as attendees,
        AVG(rating) as avgRating,
        COUNT(*) as totalBookings
      FROM bookings
      WHERE eventId IN (${sql.join(eventIds as number[], sql`, `)})
      GROUP BY eventId
    `);
    const statsMap = new Map(stats.rows.map((stat: any) => [stat.eventId, stat]));
    return eventIds.map(id => statsMap.get(id) || { attendees: 0, avgRating: 0, totalBookings: 0 });
  });
}

// GraphQL Types
const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    openId: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    lastSignedIn: { type: GraphQLString },
    bookings: {
      type: GraphQLList(BookingType),
      resolve: async (user, args, context) => {
        const bookings = await db.execute(sql`
          SELECT * FROM bookings WHERE userId = ${user.id} ORDER BY createdAt DESC
        `);
        return bookings.rows;
      },
    },
    stats: {
      type: UserStatsType,
      resolve: async (user, args, context) => {
        const stats = await CacheManager.getOrSet(
          `${CACHE_PREFIXES.USER}stats_${user.id}`,
          async () => {
            const [bookingCount] = await db.execute(sql`
              SELECT COUNT(*) as count FROM bookings WHERE userId = ${user.id}
            `);
            const [reviewCount] = await db.execute(sql`
              SELECT COUNT(*) as count FROM booking_reviews WHERE userId = ${user.id}
            `);
            return {
              totalBookings: (bookingCount.rows[0] as any)?.count || 0,
              totalReviews: (reviewCount.rows[0] as any)?.count || 0,
              memberSince: user.createdAt,
            };
          },
          CACHE_TTL.MEDIUM
        );
        return stats;
      },
    },
  }),
});

const UserStatsType = new GraphQLObjectType({
  name: 'UserStats',
  fields: {
    totalBookings: { type: GraphQLInt },
    totalReviews: { type: GraphQLInt },
    memberSince: { type: GraphQLString },
  },
});

const MixType = new GraphQLObjectType({
  name: 'Mix',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    audioUrl: { type: GraphQLString },
    coverImageUrl: { type: GraphQLString },
    duration: { type: GraphQLInt },
    genre: { type: GraphQLString },
    isFree: { type: GraphQLBoolean },
    downloadUrl: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    stats: {
      type: MixStatsType,
      resolve: async (mix, args, context) => {
        // Generate mock stats - in production, these would come from analytics
        return {
          plays: Math.floor(Math.random() * 10000) + 1000,
          downloads: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 500) + 50,
        };
      },
    },
    relatedMixes: {
      type: GraphQLList(MixType),
      args: {
        limit: { type: GraphQLInt, defaultValue: 5 },
      },
      resolve: async (mix, args, context) => {
        const related = await db.execute(sql`
          SELECT * FROM mixes 
          WHERE genre = ${mix.genre} 
            AND id != ${mix.id}
          ORDER BY RAND()
          LIMIT ${args.limit}
        `);
        return related.rows;
      },
    },
  }),
});

const MixStatsType = new GraphQLObjectType({
  name: 'MixStats',
  fields: {
    plays: { type: GraphQLInt },
    downloads: { type: GraphQLInt },
    likes: { type: GraphQLInt },
  },
});

const BookingType = new GraphQLObjectType({
  name: 'Booking',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    userId: { type: GraphQLInt },
    eventName: { type: GraphQLString },
    eventDate: { type: GraphQLString },
    eventLocation: { type: GraphQLString },
    eventType: { type: GraphQLString },
    guestCount: { type: GraphQLInt },
    budget: { type: GraphQLString },
    description: { type: GraphQLString },
    contactEmail: { type: GraphQLString },
    contactPhone: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: (booking, args, context: { loaders: DataLoaders }) => {
        return context.loaders.userLoader.load(booking.userId);
      },
    },
    payment: {
      type: PaymentType,
      resolve: async (booking, args, context) => {
        const [payment] = await db.execute(sql`
          SELECT * FROM booking_payments WHERE bookingId = ${booking.id} LIMIT 1
        `);
        return payment.rows[0];
      },
    },
  }),
});

const PaymentType = new GraphQLObjectType({
  name: 'Payment',
  fields: {
    id: { type: GraphQLInt },
    amount: { type: GraphQLFloat },
    currency: { type: GraphQLString },
    status: { type: GraphQLString },
    paymentMethod: { type: GraphQLString },
    paidAt: { type: GraphQLString },
  },
});

const EventType = new GraphQLObjectType({
  name: 'Event',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    eventDate: { type: GraphQLString },
    location: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    ticketUrl: { type: GraphQLString },
    price: { type: GraphQLString },
    isFeatured: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    stats: {
      type: EventStatsType,
      resolve: (event, args, context: { loaders: DataLoaders }) => {
        return context.loaders.eventStatsLoader.load(event.id);
      },
    },
  }),
});

const EventStatsType = new GraphQLObjectType({
  name: 'EventStats',
  fields: {
    attendees: { type: GraphQLInt },
    avgRating: { type: GraphQLFloat },
    totalBookings: { type: GraphQLInt },
  },
});

const PodcastType = new GraphQLObjectType({
  name: 'Podcast',
  fields: {
    id: { type: GraphQLNonNull(GraphQLInt) },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    episodeNumber: { type: GraphQLInt },
    audioUrl: { type: GraphQLString },
    coverImageUrl: { type: GraphQLString },
    duration: { type: GraphQLInt },
    spotifyUrl: { type: GraphQLString },
    applePodcastsUrl: { type: GraphQLString },
    youtubeUrl: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  },
});

// Analytics Types
const AnalyticsType = new GraphQLObjectType({
  name: 'Analytics',
  fields: {
    period: { type: GraphQLString },
    revenue: { type: RevenueAnalyticsType },
    traffic: { type: TrafficAnalyticsType },
    engagement: { type: EngagementAnalyticsType },
    topContent: { type: GraphQLList(TopContentType) },
  },
});

const RevenueAnalyticsType = new GraphQLObjectType({
  name: 'RevenueAnalytics',
  fields: {
    total: { type: GraphQLFloat },
    bookings: { type: GraphQLFloat },
    memberships: { type: GraphQLFloat },
    merchandise: { type: GraphQLFloat },
    growth: { type: GraphQLFloat },
  },
});

const TrafficAnalyticsType = new GraphQLObjectType({
  name: 'TrafficAnalytics',
  fields: {
    visitors: { type: GraphQLInt },
    pageViews: { type: GraphQLInt },
    sessions: { type: GraphQLInt },
    bounceRate: { type: GraphQLFloat },
    avgSessionDuration: { type: GraphQLInt },
  },
});

const EngagementAnalyticsType = new GraphQLObjectType({
  name: 'EngagementAnalytics',
  fields: {
    likes: { type: GraphQLInt },
    shares: { type: GraphQLInt },
    comments: { type: GraphQLInt },
    downloads: { type: GraphQLInt },
  },
});

const TopContentType = new GraphQLObjectType({
  name: 'TopContent',
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    type: { type: GraphQLString },
    views: { type: GraphQLInt },
    engagement: { type: GraphQLFloat },
  },
});

// Search Result Type (Union Type)
const SearchResultType = new GraphQLObjectType({
  name: 'SearchResult',
  fields: {
    type: { type: GraphQLString },
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    url: { type: GraphQLString },
    imageUrl: { type: GraphQLString },
    score: { type: GraphQLFloat },
  },
});

// Input Types
const DateRangeInput = new GraphQLInputObjectType({
  name: 'DateRangeInput',
  fields: {
    start: { type: GraphQLString },
    end: { type: GraphQLString },
  },
});

const PaginationInput = new GraphQLInputObjectType({
  name: 'PaginationInput',
  fields: {
    limit: { type: GraphQLInt, defaultValue: 20 },
    offset: { type: GraphQLInt, defaultValue: 0 },
  },
});

const BookingFilterInput = new GraphQLInputObjectType({
  name: 'BookingFilterInput',
  fields: {
    status: { type: GraphQLString },
    eventType: { type: GraphQLString },
    dateRange: { type: DateRangeInput },
  },
});

// Enum Types
const SortOrderEnum = new GraphQLEnumType({
  name: 'SortOrder',
  values: {
    ASC: { value: 'ASC' },
    DESC: { value: 'DESC' },
  },
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: {
    // User queries
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLInt },
        email: { type: GraphQLString },
      },
      resolve: async (parent, args, context) => {
        if (args.id) {
          return context.loaders.userLoader.load(args.id);
        }
        if (args.email) {
          const [user] = await db.select().from(users).where(eq(users.email, args.email)).limit(1);
          return user;
        }
        return null;
      },
    },
    
    users: {
      type: GraphQLList(UserType),
      args: {
        pagination: { type: PaginationInput },
        role: { type: GraphQLString },
      },
      resolve: async (parent, args, context) => {
        let query = db.select().from(users);
        
        if (args.role) {
          query = query.where(eq(users.role, args.role));
        }
        
        query = query
          .limit(args.pagination?.limit || 20)
          .offset(args.pagination?.offset || 0);
        
        return await query;
      },
    },
    
    // Mix queries
    mixes: {
      type: GraphQLList(MixType),
      args: {
        genre: { type: GraphQLString },
        isFree: { type: GraphQLBoolean },
        pagination: { type: PaginationInput },
        sortBy: { type: GraphQLString },
        order: { type: SortOrderEnum },
      },
      resolve: async (parent, args, context) => {
        const cacheKey = `${CACHE_PREFIXES.SOCIAL}graphql_mixes_${JSON.stringify(args)}`;
        
        return await CacheManager.getOrSet(
          cacheKey,
          async () => {
            let query = db.select().from(mixes);
            
            const conditions = [];
            if (args.genre) conditions.push(eq(mixes.genre, args.genre));
            if (args.isFree !== undefined) conditions.push(eq(mixes.isFree, args.isFree));
            
            if (conditions.length > 0) {
              query = query.where(and(...conditions));
            }
            
            // Sorting
            const sortField = args.sortBy || 'createdAt';
            const sortOrder = args.order === 'ASC' ? asc : desc;
            query = query.orderBy(sortOrder(mixes[sortField]));
            
            // Pagination
            query = query
              .limit(args.pagination?.limit || 20)
              .offset(args.pagination?.offset || 0);
            
            return await query;
          },
          CACHE_TTL.SHORT
        );
      },
    },
    
    mix: {
      type: MixType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args, context) => {
        return context.loaders.mixLoader.load(args.id);
      },
    },
    
    // Booking queries
    bookings: {
      type: GraphQLList(BookingType),
      args: {
        userId: { type: GraphQLInt },
        filter: { type: BookingFilterInput },
        pagination: { type: PaginationInput },
      },
      resolve: async (parent, args, context) => {
        let query = db.select().from(bookings);
        
        const conditions = [];
        if (args.userId) conditions.push(eq(bookings.userId, args.userId));
        if (args.filter?.status) conditions.push(eq(bookings.status, args.filter.status));
        if (args.filter?.eventType) conditions.push(eq(bookings.eventType, args.filter.eventType));
        
        if (args.filter?.dateRange) {
          if (args.filter.dateRange.start) {
            conditions.push(gte(bookings.eventDate, new Date(args.filter.dateRange.start)));
          }
          if (args.filter.dateRange.end) {
            conditions.push(lte(bookings.eventDate, new Date(args.filter.dateRange.end)));
          }
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        
        query = query
          .orderBy(desc(bookings.createdAt))
          .limit(args.pagination?.limit || 20)
          .offset(args.pagination?.offset || 0);
        
        return await query;
      },
    },
    
    booking: {
      type: BookingType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, args, context) => {
        return context.loaders.bookingLoader.load(args.id);
      },
    },
    
    // Event queries
    events: {
      type: GraphQLList(EventType),
      args: {
        isFeatured: { type: GraphQLBoolean },
        dateRange: { type: DateRangeInput },
        pagination: { type: PaginationInput },
      },
      resolve: async (parent, args, context) => {
        let query = db.select().from(events);
        
        const conditions = [];
        if (args.isFeatured !== undefined) conditions.push(eq(events.isFeatured, args.isFeatured));
        
        if (args.dateRange) {
          if (args.dateRange.start) {
            conditions.push(gte(events.eventDate, new Date(args.dateRange.start)));
          }
          if (args.dateRange.end) {
            conditions.push(lte(events.eventDate, new Date(args.dateRange.end)));
          }
        }
        
        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
        
        query = query
          .orderBy(asc(events.eventDate))
          .limit(args.pagination?.limit || 20)
          .offset(args.pagination?.offset || 0);
        
        return await query;
      },
    },
    
    // Podcast queries
    podcasts: {
      type: GraphQLList(PodcastType),
      args: {
        pagination: { type: PaginationInput },
      },
      resolve: async (parent, args, context) => {
        return await db
          .select()
          .from(podcasts)
          .orderBy(desc(podcasts.createdAt))
          .limit(args.pagination?.limit || 20)
          .offset(args.pagination?.offset || 0);
      },
    },
    
    // Analytics queries
    analytics: {
      type: AnalyticsType,
      args: {
        period: { type: GraphQLString, defaultValue: '30d' },
      },
      resolve: async (parent, args, context) => {
        // Mock analytics data - in production, this would query real analytics
        return {
          period: args.period,
          revenue: {
            total: 25000,
            bookings: 18000,
            memberships: 5000,
            merchandise: 2000,
            growth: 15.5,
          },
          traffic: {
            visitors: 45000,
            pageViews: 150000,
            sessions: 60000,
            bounceRate: 35.2,
            avgSessionDuration: 245,
          },
          engagement: {
            likes: 12000,
            shares: 3500,
            comments: 2800,
            downloads: 8900,
          },
          topContent: [
            { id: '1', title: 'Summer Mix 2024', type: 'mix', views: 15000, engagement: 92.5 },
            { id: '2', title: 'Episode 50', type: 'podcast', views: 8000, engagement: 88.3 },
          ],
        };
      },
    },
    
    // Search
    search: {
      type: GraphQLList(SearchResultType),
      args: {
        query: { type: GraphQLNonNull(GraphQLString) },
        types: { type: GraphQLList(GraphQLString) },
        limit: { type: GraphQLInt, defaultValue: 20 },
      },
      resolve: async (parent, args, context) => {
        const results = [];
        const searchTerm = `%${args.query}%`;
        
        // Search mixes
        if (!args.types || args.types.includes('mix')) {
          const mixResults = await db.execute(sql`
            SELECT id, title, description, coverImageUrl as imageUrl
            FROM mixes 
            WHERE title LIKE ${searchTerm} OR description LIKE ${searchTerm}
            LIMIT 10
          `);
          results.push(...mixResults.rows.map((r: any) => ({
            ...r,
            type: 'mix',
            url: `/mixes/${r.id}`,
            score: 1,
          })));
        }
        
        // Search events
        if (!args.types || args.types.includes('event')) {
          const eventResults = await db.execute(sql`
            SELECT id, title, description, imageUrl
            FROM events 
            WHERE title LIKE ${searchTerm} OR description LIKE ${searchTerm}
            LIMIT 10
          `);
          results.push(...eventResults.rows.map((r: any) => ({
            ...r,
            type: 'event',
            url: `/events/${r.id}`,
            score: 0.9,
          })));
        }
        
        // Search podcasts
        if (!args.types || args.types.includes('podcast')) {
          const podcastResults = await db.execute(sql`
            SELECT id, title, description, coverImageUrl as imageUrl
            FROM podcasts 
            WHERE title LIKE ${searchTerm} OR description LIKE ${searchTerm}
            LIMIT 10
          `);
          results.push(...podcastResults.rows.map((r: any) => ({
            ...r,
            type: 'podcast',
            url: `/podcasts/${r.id}`,
            score: 0.8,
          })));
        }
        
        // Sort by relevance score and limit
        return results
          .sort((a, b) => b.score - a.score)
          .slice(0, args.limit);
      },
    },
  },
});

// Root Mutation
const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // User mutations
    updateUser: {
      type: UserType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
      },
      resolve: async (parent, args, context) => {
        const updateData: any = {};
        if (args.name) updateData.name = args.name;
        if (args.email) updateData.email = args.email;
        
        await db.update(users).set(updateData).where(eq(users.id, args.id));
        
        // Clear cache
        context.loaders.userLoader.clear(args.id);
        
        return context.loaders.userLoader.load(args.id);
      },
    },
    
    // Booking mutations
    createBooking: {
      type: BookingType,
      args: {
        userId: { type: GraphQLNonNull(GraphQLInt) },
        eventName: { type: GraphQLNonNull(GraphQLString) },
        eventDate: { type: GraphQLNonNull(GraphQLString) },
        eventLocation: { type: GraphQLNonNull(GraphQLString) },
        eventType: { type: GraphQLNonNull(GraphQLString) },
        guestCount: { type: GraphQLInt },
        budget: { type: GraphQLString },
        description: { type: GraphQLString },
        contactEmail: { type: GraphQLNonNull(GraphQLString) },
        contactPhone: { type: GraphQLString },
      },
      resolve: async (parent, args, context) => {
        const [booking] = await db.insert(bookings).values({
          ...args,
          eventDate: new Date(args.eventDate),
          status: 'pending',
        });
        
        const bookingId = (booking as any).insertId;
        
        // Publish subscription event
        pubsub.publish('BOOKING_CREATED', { bookingCreated: await context.loaders.bookingLoader.load(bookingId) });
        
        return context.loaders.bookingLoader.load(bookingId);
      },
    },
    
    updateBookingStatus: {
      type: BookingType,
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) },
        status: { type: GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args, context) => {
        await db.update(bookings).set({ status: args.status }).where(eq(bookings.id, args.id));
        
        // Clear cache
        context.loaders.bookingLoader.clear(args.id);
        
        const booking = await context.loaders.bookingLoader.load(args.id);
        
        // Publish subscription event
        pubsub.publish('BOOKING_UPDATED', { bookingUpdated: booking });
        
        return booking;
      },
    },
    
    // Analytics mutations
    trackEvent: {
      type: GraphQLBoolean,
      args: {
        event: { type: GraphQLNonNull(GraphQLString) },
        properties: { type: GraphQLString },
      },
      resolve: async (parent, args, context) => {
        // Log analytics event
        await db.execute(sql`
          INSERT INTO analytics_events (event, properties, timestamp)
          VALUES (${args.event}, ${args.properties}, NOW())
        `);
        
        // Publish to analytics service
        pubsub.publish('ANALYTICS_EVENT', { event: args.event, properties: args.properties });
        
        return true;
      },
    },
  },
});

// Root Subscription
const RootSubscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    bookingCreated: {
      type: BookingType,
      subscribe: () => pubsub.asyncIterator(['BOOKING_CREATED']),
    },
    bookingUpdated: {
      type: BookingType,
      args: {
        bookingId: { type: GraphQLInt },
      },
      subscribe: (parent, args) => {
        if (args.bookingId) {
          return pubsub.asyncIterator([`BOOKING_UPDATED_${args.bookingId}`]);
        }
        return pubsub.asyncIterator(['BOOKING_UPDATED']);
      },
    },
    liveStreamStarted: {
      type: new GraphQLObjectType({
        name: 'LiveStream',
        fields: {
          streamId: { type: GraphQLString },
          platform: { type: GraphQLString },
          url: { type: GraphQLString },
          startedAt: { type: GraphQLString },
        },
      }),
      subscribe: () => pubsub.asyncIterator(['STREAM_STARTED']),
    },
    analyticsUpdate: {
      type: AnalyticsType,
      subscribe: () => pubsub.asyncIterator(['ANALYTICS_UPDATE']),
    },
  },
});

// Create GraphQL Schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
  subscription: RootSubscription,
});

// Setup GraphQL endpoint
export function setupGraphQL(app: Express) {
  app.use('/graphql', graphqlHTTP((req, res) => ({
    schema,
    graphiql: process.env.NODE_ENV === 'development',
    context: {
      req,
      res,
      loaders: new DataLoaders(),
      user: (req as any).user, // From authentication middleware
    },
    customFormatErrorFn: (error) => {
      // Log errors to Sentry in production
      if (process.env.NODE_ENV === 'production') {
        console.error('GraphQL Error:', error);
      }
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })));

  console.log('✅ GraphQL API configured at /graphql');
}