/**
 * API Facade Layer
 *
 * ARCHITECTURAL BOUNDARY: Isolation Layer
 * ======================================
 *
 * This module defines the public API contract between frontend and backend,
 * isolating implementation details from consumer code.
 *
 * What CAN cross this boundary:
 * - Router re-exports (tRPC router objects)
 * - Domain type definitions
 * - Logical groupings by business function
 *
 * What CANNOT cross this boundary:
 * - Direct imports of router internals (use exports only)
 * - Implementation details (utilities, helpers, database functions)
 * - Private/internal service APIs
 * - Backend-only authentication contexts
 *
 * Design Principles:
 * 1. Routers grouped by business domain, not technical layer
 * 2. Each domain exports only what frontend needs
 * 3. Implementation refactoring doesn't break frontend
 * 4. Type safety maintained through facade interfaces
 *
 * Domain Structure:
 * - Content: Blog, FAQ, Podcasts, Episodes, Tracks
 * - Commerce: Products, Purchases, Merch
 * - Engagement: Community, Profile, Messages, Comments, Shoutbox, Social
 * - Streaming: Live, Streaming, Stream Events, Track Requests, Simulcast
 * - Events: UK Events, Event Bookings, Shows
 * - Music: Soundcloud, Spotify
 * - Monetization: Donations, Subscriptions, Premium, Revenue, Sponsorships, Affiliates
 * - System: Admin, Analytics, Moderation, Safety, Support, Notifications, Observability, Contact
 * - AI: AI Core, Danny, Jarvis, Hectic, Recommendations
 * - Admin: Partners, Brands, Inner Circle, Empire, Gen Z, Control Tower, Integrations
 * - Performance: Search, Feed, Economy, Profiles, Cues
 *
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import type { AnyRouter } from "@trpc/server";

/**
 * Router names by domain (for documentation and discovery)
 * Used to understand what routers belong to each business domain
 */
const DOMAIN_ROUTERS = {
  content: [
    "blog",       // Blog posts and articles
    "faq",        // Frequently asked questions
    "podcasts",   // Podcast episodes and series
    "episodes",   // Episode management
    "tracks",     // Track library
  ],
  commerce: [
    "products",   // Product catalog
    "purchases",  // Purchase transactions
    "merch",      // Merchandise store
  ],
  engagement: [
    "community",  // Community features
    "profile",    // User profiles
    "messages",   // Direct messaging
    "comments",   // Comment threads
    "shouts",     // Shoutbox/guestbook
    "social",     // Social proof and engagement
    "listeners",  // Listener statistics
  ],
  streaming: [
    "live",       // Live streaming
    "streaming",  // Streaming configuration
    "platformStream", // Multi-platform streaming
    "trackRequests",  // Track requests during stream
    "streams",    // Stream management
  ],
  events: [
    "ukEvents",       // UK events listing
    "eventBookings",  // Event booking system
    "shows",          // Show management
  ],
  music: [
    "soundcloud", // SoundCloud integration
    "spotify",    // Spotify integration
  ],
  monetization: [
    "donations",      // Donation handling
    "subscriptions",  // Subscription management
    "premium",        // Premium features
    "revenue",        // Revenue tracking
    "sponsorships",   // Sponsorship management
    "affiliates",     // Affiliate program
    "economy",        // Economy/currency system
  ],
  system: [
    "system",         // System status
    "analytics",      // Analytics and metrics
    "moderation",     // Content moderation
    "safety",         // Safety and abuse prevention
    "support",        // Support tickets
    "notifications",  // User notifications
    "observability",  // Observability and monitoring
    "apiKeys",        // API key management
    "contact",        // Contact form
  ],
  ai: [
    "ai",             // AI core features
    "danny",          // Danny persona
    "jarvis",         // Jarvis persona
    "hectic",         // Hectic persona
    "aiStudio",       // AI studio features
  ],
  admin: [
    "partners",       // Partner management
    "brands",         // Brand partnerships
    "innerCircle",    // Inner circle exclusive
    "empire",         // Empire/network management
    "genz",           // Gen Z focused features
    "controlTower",   // Control tower/dashboard
    "integrations",   // Third-party integrations
  ],
  performance: [
    "search",         // Search functionality
    "feed",           // Feed generation
    "profiles",       // Profile aggregation
    "cues",           // Show cues
    "bookings",       // Booking system
    "events",         // Events system alias
  ],
} as const;

/**
 * CONTENT DOMAIN
 * Publishing, media libraries, and content discovery
 */
export interface ContentRouters {
  blog: AnyRouter;
  faq: AnyRouter;
  podcasts: AnyRouter;
  episodes: AnyRouter;
  tracks: AnyRouter;
}

/**
 * COMMERCE DOMAIN
 * Products, purchases, merchandise, and e-commerce
 */
export interface CommerceRouters {
  products: AnyRouter;
  purchases: AnyRouter;
  merch: AnyRouter;
}

/**
 * ENGAGEMENT DOMAIN
 * User interaction, social features, and communication
 */
export interface EngagementRouters {
  profile: AnyRouter;
  community: AnyRouter;
  messages: AnyRouter;
  comments: AnyRouter;
  shouts: AnyRouter;
  social: AnyRouter;
  listeners: AnyRouter;
}

/**
 * STREAMING DOMAIN
 * Live streaming, broadcasts, and real-time audio
 */
export interface StreamingRouters {
  live: AnyRouter;
  streaming: AnyRouter;
  platformStream: AnyRouter;
  trackRequests: AnyRouter;
  streams: AnyRouter;
}

/**
 * EVENTS DOMAIN
 * Event discovery, bookings, and show management
 */
export interface EventsRouters {
  ukEvents: AnyRouter;
  eventBookings: AnyRouter;
  shows: AnyRouter;
}

/**
 * MUSIC DOMAIN
 * Music platform integrations and streaming services
 */
export interface MusicRouters {
  soundcloud: AnyRouter;
  spotify: AnyRouter;
}

/**
 * MONETIZATION DOMAIN
 * Revenue streams, subscriptions, and financial operations
 */
export interface MonetizationRouters {
  donations: AnyRouter;
  subscriptions: AnyRouter;
  premium: AnyRouter;
  revenue: AnyRouter;
  sponsorships: AnyRouter;
  affiliates: AnyRouter;
  economy: AnyRouter;
}

/**
 * SYSTEM DOMAIN
 * Core infrastructure, observability, and administrative functions
 */
export interface SystemRouters {
  system: AnyRouter;
  analytics: AnyRouter;
  moderation: AnyRouter;
  safety: AnyRouter;
  support: AnyRouter;
  notifications: AnyRouter;
  observability: AnyRouter;
  apiKeys: AnyRouter;
  contact: AnyRouter;
}

/**
 * AI DOMAIN
 * Artificial intelligence features and autonomous operations
 */
export interface AIRouters {
  ai: AnyRouter;
  danny: AnyRouter;
  jarvis: AnyRouter;
  hectic: AnyRouter;
  aiStudio: AnyRouter;
}

/**
 * AUTHENTICATION DOMAIN
 * Identity management, sessions, and API access control
 */
export interface AuthRouters {
  auth: AnyRouter;
}

/**
 * ADMIN DOMAIN
 * Administrative features, brand management, and team operations
 */
export interface AdminRouters {
  partners: AnyRouter;
  brands: AnyRouter;
  innerCircle: AnyRouter;
  empire: AnyRouter;
  genz: AnyRouter;
  controlTower: AnyRouter;
  integrations: AnyRouter;
}

/**
 * PERFORMANCE DOMAIN
 * Search, feed, discovery, and performance-critical features
 */
export interface PerformanceRouters {
  search: AnyRouter;
  feed: AnyRouter;
  profiles: AnyRouter;
  cues: AnyRouter;
  bookings: AnyRouter;
  events: AnyRouter; // Events alias
}

/**
 * Complete API Surface
 * All domains combined, representing the full tRPC API contract
 */
export interface APIFacade
  extends ContentRouters,
    CommerceRouters,
    EngagementRouters,
    StreamingRouters,
    EventsRouters,
    MusicRouters,
    MonetizationRouters,
    SystemRouters,
    AIRouters,
    AuthRouters,
    AdminRouters,
    PerformanceRouters {}

/**
 * API Boundary Guardian
 *
 * Use this type for dependency injection when you need to reference
 * a specific domain of routers. This allows gradual decoupling:
 *
 * BEFORE (tight coupling):
 *   function myComponent(allRouters: AppRouter) { }
 *
 * AFTER (loose coupling):
 *   function myComponent(api: ContentRouters) { }
 *
 * This pattern enables:
 * - Clear dependencies
 * - Easier testing (mock specific domains)
 * - Simpler monitoring of cross-domain calls
 */
export type DomainBoundary = {
  content: ContentRouters;
  commerce: CommerceRouters;
  engagement: EngagementRouters;
  streaming: StreamingRouters;
  events: EventsRouters;
  music: MusicRouters;
  monetization: MonetizationRouters;
  system: SystemRouters;
  ai: AIRouters;
  auth: AuthRouters;
  admin: AdminRouters;
  performance: PerformanceRouters;
};

/**
 * Domain Router Mapping
 * Exported for documentation and tooling support
 * Can be used to verify router assignments or generate documentation
 */
export const routerDomainMap = DOMAIN_ROUTERS;
