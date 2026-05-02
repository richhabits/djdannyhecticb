/**
 * Cache Key Patterns & TTL Configuration
 * Centralized cache key management for all cached data
 */

export const CACHE_KEYS = {
  // User & Auth (TTL: 1 hour)
  USER: (userId: number) => `user:${userId}`,
  USER_PROFILE: (userId: number) => `user_profile:${userId}`,
  USER_EMAIL: (email: string) => `user_email:${email.toLowerCase()}`,
  ADMIN_SESSION: (sessionId: string) => `admin_session:${sessionId}`,

  // Subscriptions (TTL: 30 minutes)
  SUBSCRIPTION: (userId: number) => `subscription:${userId}`,
  SUBSCRIPTION_ACTIVE: `subscriptions:active:list`,
  SUBSCRIPTION_STATS: `subscriptions:stats`,

  // Bookings & Events (TTL: 1 hour)
  BOOKING: (bookingId: number) => `booking:${bookingId}`,
  BOOKING_PENDING: `bookings:pending:list`,
  EVENT_BOOKING: (eventBookingId: number) => `event_booking:${eventBookingId}`,
  EVENT_BOOKINGS_STATUS: (status: string) => `event_bookings:${status}:list`,
  UPCOMING_EVENTS: `events:upcoming:list`,

  // Products & Purchases (TTL: 2 hours)
  PRODUCT: (productId: number) => `product:${productId}`,
  PRODUCTS_ACTIVE: `products:active:list`,
  PURCHASE_HISTORY: (userId: number) => `purchases:${userId}:history`,
  PURCHASE: (purchaseId: number) => `purchase:${purchaseId}`,

  // Feed & Content (TTL: 5 minutes)
  FEED_POSTS: `feed:posts:list`,
  FEED_POSTS_PAGE: (page: number) => `feed:posts:page:${page}`,
  USER_POSTS: (userId: number) => `user:${userId}:posts`,
  DANNY_REACTS: `danny:reacts:list`,
  DJ_BATTLES: `dj:battles:list`,

  // Live Data (TTL: 30 seconds - real-time)
  STREAM_STATUS: `stream:status`,
  STREAM_VIEWERS: `stream:viewers:count`,
  STREAM_BITRATE: `stream:bitrate:current`,

  // Analytics & Stats (TTL: 1 hour)
  ANALYTICS_SUMMARY: `analytics:summary`,
  DAILY_STATS: (date: string) => `stats:daily:${date}`,
  REVENUE_SUMMARY: `revenue:summary`,
  TOP_DONORS: `donors:top:list`,
  TOP_SUBSCRIBERS: `subscribers:top:list`,

  // Leaderboards (TTL: 15 minutes)
  LEADERBOARD_FAN_BADGES: `leaderboard:fan_badges`,
  LEADERBOARD_SUPPORTERS: `leaderboard:supporters`,
  LEADERBOARD_ENGAGEMENTS: `leaderboard:engagements`,

  // Search & Discovery (TTL: 1 hour)
  ARTICLES_PUBLISHED: `articles:published:list`,
  ARTICLES_FEATURED: `articles:featured:list`,
  VIDEOS_FEATURED: `videos:featured:list`,

  // Community (TTL: 30 minutes)
  USER_FOLLOWERS: (userId: number) => `user:${userId}:followers`,
  USER_FOLLOWING: (userId: number) => `user:${userId}:following`,
  USER_ACHIEVEMENTS: (userId: number) => `user:${userId}:achievements`,

  // Configuration (TTL: 24 hours)
  SETTINGS: `settings:all`,
  FEATURE_FLAGS: `feature:flags`,
  BRAND_CONFIG: (brandId: number) => `brand:${brandId}:config`,

  // Queue data (TTL: 2 hours, no auto-expire for pending items)
  NOTIFICATION_QUEUE: `notifications:queue:pending`,
  EMAIL_QUEUE: `emails:queue:pending`,

  // Session Data (TTL: 24 hours)
  SESSION_BASKET: (sessionId: string) => `session:${sessionId}:basket`,
  SESSION_USER: (sessionId: string) => `session:${sessionId}:user`,
} as const;

/**
 * TTL (Time to Live) in seconds for different cache categories
 */
export const CACHE_TTL = {
  // Short-lived (real-time data)
  REALTIME: 30, // 30 seconds
  VERY_SHORT: 60, // 1 minute

  // Short-lived (frequently changing)
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 15 * 60, // 15 minutes

  // Standard cache
  STANDARD: 30 * 60, // 30 minutes
  LONG: 60 * 60, // 1 hour

  // Long-lived (stable data)
  VERY_LONG: 4 * 60 * 60, // 4 hours
  EXTENDED: 24 * 60 * 60, // 24 hours

  // No expiration (for explicit invalidation)
  INDEFINITE: -1,
} as const;

/**
 * Cache invalidation patterns (for batch invalidation)
 * Use wildcards to invalidate related cache keys
 */
export const CACHE_PATTERNS = {
  // User-related
  USER_ALL: 'user:*',
  USER_PROFILE_ALL: 'user_profile:*',

  // Subscription-related
  SUBSCRIPTION_ALL: 'subscription:*',
  SUBSCRIPTION_LISTS: 'subscriptions:*',

  // Booking-related
  BOOKING_ALL: 'booking:*',
  EVENT_BOOKING_ALL: 'event_booking:*',
  BOOKINGS_LISTS: 'bookings:*',
  EVENT_BOOKINGS_LISTS: 'event_bookings:*',

  // Purchase-related
  PURCHASES_ALL: 'purchases:*',
  PURCHASE_ALL: 'purchase:*',

  // Feed & Content
  FEED_ALL: 'feed:*',
  USER_POSTS_ALL: 'user:*:posts',

  // Analytics
  ANALYTICS_ALL: 'analytics:*',
  STATS_ALL: 'stats:*',
  REVENUE_ALL: 'revenue:*',
  DONORS_ALL: 'donors:*',
  SUBSCRIBERS_ALL: 'subscribers:*',

  // Leaderboard
  LEADERBOARD_ALL: 'leaderboard:*',

  // Session
  SESSION_ALL: 'session:*',

  // All cache (emergency invalidation)
  ALL: '*',
} as const;

/**
 * Categorize cache keys by invalidation strategy
 */
export const CACHE_DEPENDENCIES = {
  // When a user is updated, invalidate:
  user_updated: (userId: number) => [
    CACHE_KEYS.USER(userId),
    CACHE_KEYS.USER_PROFILE(userId),
    CACHE_KEYS.USER_FOLLOWERS(userId),
    CACHE_KEYS.USER_FOLLOWING(userId),
    CACHE_KEYS.USER_POSTS(userId),
  ],

  // When a booking is updated, invalidate:
  booking_updated: (bookingId: number) => [
    CACHE_KEYS.BOOKING(bookingId),
    CACHE_KEYS.BOOKING_PENDING,
    'bookings:*',
  ],

  // When a subscription changes, invalidate:
  subscription_changed: (userId: number) => [
    CACHE_KEYS.SUBSCRIPTION(userId),
    CACHE_KEYS.SUBSCRIPTION_ACTIVE,
    CACHE_KEYS.SUBSCRIPTION_STATS,
    'subscriptions:*',
  ],

  // When revenue-impacting event occurs, invalidate:
  revenue_updated: () => [
    CACHE_KEYS.REVENUE_SUMMARY,
    CACHE_KEYS.TOP_DONORS,
    'revenue:*',
    'donors:*',
  ],

  // When feed is updated, invalidate feed caches:
  feed_updated: () => [
    CACHE_KEYS.FEED_POSTS,
    'feed:*',
  ],

  // When stream status changes, invalidate:
  stream_updated: () => [
    CACHE_KEYS.STREAM_STATUS,
    CACHE_KEYS.STREAM_VIEWERS,
    CACHE_KEYS.STREAM_BITRATE,
  ],
} as const;
