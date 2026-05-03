/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { ukEventsRouter } from "./ukEventsRouter";
import * as ukEventsService from "./_core/ukEventsService";
import { soundcloudRouter } from "./routers/soundcloudRouter";
import { spotifyRouter } from "./routers/spotifyRouter";
import { blogRouter } from "./routers/blogRouter";
import { faqRouter } from "./routers/faqRouter";
import { contactRouter } from "./routers/contactRouter";
import { merchRouter } from "./routers/merchRouter";
import { liveRouter } from "./routers/liveRouter";
import { moderationRouter } from "./routers/moderationRouter";
import { analyticsRouter } from "./routers/analyticsRouter";
import { donationsRouter } from "./routers/donationsRouter";
import { supportRouter } from "./routers/supportRouter";
import { profileRouter } from "./routers/profileRouter";
import { messagesRouter } from "./routers/messagesRouter";
import { commentsRouter } from "./routers/commentsRouter";
import { communityRouter } from "./routers/communityRouter";
// Revenue streams
import { subscriptionRouter } from "./routers/subscriptionRouter";
import { affiliateRouter } from "./routers/affiliateRouter";
import { sponsorshipRouter } from "./routers/sponsorshipRouter";
import { premiumRouter } from "./routers/premiumRouter";
import { revenueRouter } from "./routers/revenueRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { chatWithDanny } from "./lib/gemini";
import { auditLog } from "./_core/audit";
import { JARVIS_SYSTEM_PROMPT, buildJarvisContext } from "./_core/jarvisPersona";
import { HECTIC_SYSTEM_PROMPT, buildHecticContext } from "./_core/hecticPersona";

export const appRouter = router({
  system: systemRouter,
  ukEvents: ukEventsRouter,
  soundcloud: soundcloudRouter,
  spotify: spotifyRouter,
  blog: blogRouter,
  faq: faqRouter,
  contact: contactRouter,
  merch: merchRouter,
  moderation: moderationRouter,
  analytics: analyticsRouter,
  donations: donationsRouter,
  support: supportRouter,
  profile: profileRouter,
  messages: messagesRouter,
  comments: commentsRouter,
  community: communityRouter,
  // Revenue streams
  subscriptions: subscriptionRouter,
  affiliates: affiliateRouter,
  sponsorships: sponsorshipRouter,
  premium: premiumRouter,
  revenue: revenueRouter,

  // Alias for frontend compatibility
  events: router({
    upcoming: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        return await ukEventsService.getUKEvents({
          limit: input?.limit || 10,
          offset: input?.offset || 0,
        });
      }),

    all: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        return await ukEventsService.getUKEvents({
          limit: input?.limit || 50,
          offset: input?.offset || 0,
        });
      }),

    featured: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(12).default(6) }).optional())
      .query(async ({ input }) => {
        return await ukEventsService.getFeaturedUKEvents(input?.limit || 6);
      }),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await ukEventsService.getUKEventById(input.id);
      }),

    search: publicProcedure
      .input(z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).default(20),
      }))
      .query(async ({ input }) => {
        return await ukEventsService.searchUKEvents(input.query, {
          limit: input.limit,
        });
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email().max(320),
        password: z.string().min(8).max(100),
        name: z.string().max(255).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Implement logic to create user
        const { upsertUser } = await import("./db"); // Avoid circular dependency if possible, or use db import
        // Since db is imported as * as db, use that.
        // Actually, we need a function to create user with password. 
        // Current upsertUser is for OAuth.
        // We'll trust auth logic handles this, or add createUserWithPassword to db.ts
        // For now, let's assume simple user creation.
        // Wait, current system uses strictly OAuth or Admin.
        // User wants "Users/Clients can sign up".
        // I will implement a basic User creation in db.ts called keys.
        const user = await db.createUserWithPassword(input);

        // Auto-login
        const { createSessionToken } = await import("./_core/adminAuth");

        const token = await createSessionToken(user.id, user.email || input.email, "user");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return { success: true };
      }),
  }),

  mixes: router({
    list: publicProcedure.query(() => db.getAllMixes()),
    free: publicProcedure.query(() => db.getFreeMixes()),
    downloadUrl: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const mix = await db.getMixById(input.id);
        if (!mix || !mix.audioUrl) throw new Error("Mix not found");
        const key = mix.audioUrl.split("/").pop() || "";
        const { getPresignedDownloadUrl } = await import("./s3");
        return { url: await getPresignedDownloadUrl(key) };
      }),
    adminList: adminProcedure.query(() => db.getAllMixes()),
    adminCreate: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        audioUrl: z.string().url(),
        imageUrl: z.string().url().optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        genre: z.string().optional(),
        isExclusive: z.boolean().default(false),
      })) // Match db.createMix schema
      .mutation(async ({ input, ctx }) => {
        const { createMix, createAuditLog } = await import("./db");
        const mix = await createMix({
          ...input,
          ...input,
          genre: input.genre
        });
        await auditLog(ctx, {
          action: "create_mix",
          entityType: "mix",
          entityId: mix.id,
          afterSnapshot: mix,
        });
        return mix;
      }),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        audioUrl: z.string().url().optional(),
        imageUrl: z.string().url().optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        genre: z.string().optional(),
        isExclusive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const mix = await db.updateMix(id, updates);
        await auditLog(ctx, {
          action: "update_mix",
          entityType: "mix",
          entityId: id,
          afterSnapshot: mix,
        });
        return mix;
      }),
    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteMix(input.id);
        await auditLog(ctx, {
          action: "delete_mix",
          entityType: "mix",
          entityId: input.id,
        });
        return { success: true };
      }),
  }),

  eventBookings: router({
    list: protectedProcedure.query(() => db.listEventBookings()),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(255),
        phone: z.string().max(20).optional(),
        organisation: z.string().max(255).optional(),
        eventType: z.enum(["club", "radio", "private", "brand", "other"]),
        eventDate: z.string(),
        eventTime: z.string().optional(),
        location: z.string().min(1).max(255),
        budgetRange: z.string().max(100).optional(),
        extraNotes: z.string().optional(),
        streamingRequired: z.boolean().default(false),
        marketingConsent: z.boolean().default(false),
        dataConsent: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const booking = await db.createEventBooking({
          ...input,
          status: "pending",
          userId: ctx.user?.id,
        });
        return booking;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
        extraNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const booking = await db.updateEventBooking(id, updates);
        await auditLog(ctx, {
          action: "update_booking",
          entityType: "booking",
          entityId: id,
          afterSnapshot: booking,
        });
        return booking;
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEventBooking(input.id);
        await auditLog(ctx, {
          action: "delete_booking",
          entityType: "booking",
          entityId: input.id,
        });
        return { success: true };
      }),
  }),

  podcasts: router({
    list: publicProcedure.query(() => db.getAllPodcasts()),

    // Admin routes for managing podcasts
    adminList: adminProcedure.query(() => db.getAllPodcasts()),

    adminCreate: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        episodeNumber: z.number().optional(),
        audioUrl: z.string().url().max(512),
        coverImageUrl: z.string().url().max(512).optional(),
        duration: z.number().optional(),
        spotifyUrl: z.string().url().max(512).optional(),
        applePodcastsUrl: z.string().url().max(512).optional(),
        youtubeUrl: z.string().url().max(512).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const podcast = await db.createPodcast(input);
        await db.createAuditLog({
          action: "create_podcast",
          entityType: "podcast",
          entityId: podcast.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return podcast;
      }),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        episodeNumber: z.number().optional(),
        audioUrl: z.string().url().max(512).optional(),
        coverImageUrl: z.string().url().max(512).optional(),
        duration: z.number().optional(),
        spotifyUrl: z.string().url().max(512).optional(),
        applePodcastsUrl: z.string().url().max(512).optional(),
        youtubeUrl: z.string().url().max(512).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const podcast = await db.updatePodcast(id, updates);
        await db.createAuditLog({
          action: "update_podcast",
          entityType: "podcast",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return podcast;
      }),

    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePodcast(input.id);
        await db.createAuditLog({
          action: "delete_podcast",
          entityType: "podcast",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return { success: true };
      }),
  }),

  streaming: router({
    links: publicProcedure.query(() => db.getStreamingLinks()),

    // Admin routes for managing streaming links
    adminList: adminProcedure.query(() => db.getStreamingLinks()),

    adminCreate: adminProcedure
      .input(z.object({
        platform: z.string().min(1).max(100), // spotify, apple-music, soundcloud, youtube, etc
        url: z.string().url().max(512),
        displayName: z.string().max(255).optional(),
        icon: z.string().max(255).optional(),
        order: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const link = await db.createStreamingLink(input);
        await db.createAuditLog({
          action: "create_streaming_link",
          entityType: "streaming_link",
          entityId: link.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return link;
      }),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        platform: z.string().min(1).max(100).optional(),
        url: z.string().url().max(512).optional(),
        displayName: z.string().max(255).optional(),
        icon: z.string().max(255).optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const link = await db.updateStreamingLink(id, updates);
        await db.createAuditLog({
          action: "update_streaming_link",
          entityType: "streaming_link",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return link;
      }),

    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteStreamingLink(input.id);
        await db.createAuditLog({
          action: "delete_streaming_link",
          entityType: "streaming_link",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return { success: true };
      }),
  }),

  shouts: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        location: z.string().max(255).optional(),
        message: z.string().min(1).max(2000),
        trackRequest: z.string().max(255).optional(),
        isTrackRequest: z.boolean().default(false),
        trackTitle: z.string().max(255).optional(),
        trackArtist: z.string().max(255).optional(),
        phone: z.string().max(20).optional(),
        email: z.string().email().max(255).optional(),
        heardFrom: z.string().max(255).optional(),
        genres: z.array(z.string()).optional(),
        whatsappOptIn: z.boolean().default(false),
        canReadOnAir: z.boolean().default(false),
      }))
      .mutation(async ({ input }) => {
        const { filterAbuse, isSpammy } = await import("./lib/abuse");

        if (isSpammy(input.message)) {
          throw new Error("Message rejected as spam.");
        }

        const filteredMessage = filterAbuse(input.message);
        const filteredTrackRequest = input.trackRequest ? filterAbuse(input.trackRequest) : null;

        // Convert genres array to JSON string
        const shoutData = {
          ...input,
          message: filteredMessage.filtered,
          trackRequest: filteredTrackRequest?.filtered || input.trackRequest,
          genres: input.genres ? JSON.stringify(input.genres) : null,
          approved: false, // Explicitly safe-by-default
        };

        return db.createShout(shoutData as any);
      }),

    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
      .query(({ input }) => db.getApprovedShouts(input?.limit ?? 20)),

    listAll: protectedProcedure
      .input(z.object({
        approved: z.boolean().optional(),
        readOnAir: z.boolean().optional(),
        trackRequestsOnly: z.boolean().optional(),
      }).optional())
      .query(({ input }) => db.getAllShouts(input)),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        approved: z.boolean().optional(),
        readOnAir: z.boolean().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updateShoutStatus(id, updates);
      }),
  }),

  streams: router({
    active: publicProcedure.query(() => db.getActiveStream()),

    list: adminProcedure.query(() => db.listStreams()),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(["shoutcast", "icecast", "custom"]),
        publicUrl: z.string().url().max(512),
        sourceHost: z.string().max(255).optional(),
        sourcePort: z.number().optional(),
        mount: z.string().max(255).optional(),
        adminApiUrl: z.string().url().max(512).optional(),
        adminUser: z.string().max(255).optional(),
        adminPassword: z.string().max(255).optional(),
        isActive: z.boolean().default(false),
      }))
      .mutation(({ input }) => db.createStream(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        type: z.enum(["shoutcast", "icecast", "custom"]).optional(),
        publicUrl: z.string().url().max(512).optional(),
        sourceHost: z.string().max(255).optional(),
        sourcePort: z.number().optional(),
        mount: z.string().max(255).optional(),
        adminApiUrl: z.string().url().max(512).optional(),
        adminUser: z.string().max(255).optional(),
        adminPassword: z.string().max(255).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...updates } }) => db.updateStream(id, updates)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        db.deleteStream(input.id);
        return { success: true };
      }),

    getStats: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStreamStats(input.id);
      }),

    goLive: adminProcedure
      .input(z.object({
        streamId: z.number(),
        showName: z.string().min(1).max(255),
        hostName: z.string().min(1).max(255),
        category: z.string().default("Live Mix"),
        statsUrl: z.string().optional(),
        serverType: z.string().optional(),
      }))
      .mutation(({ input }) => db.goLive(input.streamId, input.showName, input.hostName, input.category)),

    setActive: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.setActiveStream(input.id)),

    status: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const streams = await db.listStreams();
        const stream = streams.find((s) => s.id === input.id);
        if (!stream) {
          throw new Error("Stream not found");
        }
        const { getStreamStatus } = await import("./_core/streamStatus");
        return getStreamStatus(stream);
      }),
  }),

  danny: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(500),
        provider: z.enum(["gemini", "groq", "cohere", "huggingface", "ollama", "auto"]).optional().default("auto"),
      }))
      .mutation(async ({ input }) => {
        return { response: await chatWithDanny(input.message, input.provider) };
      }),
    providers: publicProcedure.query(async () => {
      const { aiProvider } = await import("./_core/aiProvider");
      return { available: aiProvider.getAvailableProviders() };
    }),
    status: publicProcedure.query(() => db.getDannyStatus()),
    updateStatus: adminProcedure
      .input(z.object({
        status: z.string().min(1).max(50),
        message: z.string().max(255).optional(),
      }))
      .mutation(({ input }) => db.updateDannyStatus(input)),
  }),

  trackRequests: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
      .query(({ input }) => db.getTrackRequests(input?.limit ?? 20)),

    upvote: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.upvoteTrackRequest(input.id)),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "queued", "played"]),
      }))
      .mutation(({ input }) => db.updateTrackRequestStatus(input.id, input.status)),
  }),

  feed: router({
    list: publicProcedure
      .input(z.object({ includeVip: z.boolean().default(false) }))
      .query(({ input }) => db.getFeedPosts(input.includeVip)),
    react: publicProcedure
      .input(z.object({ postId: z.number(), emoji: z.string() }))
      .mutation(({ input }) => db.toggleFeedPostReaction(input.postId, input.emoji)),
  }),

  tracks: router({
    nowPlaying: publicProcedure.query(() => db.getNowPlaying()),
    history: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(10) }).optional())
      .query(({ input }) => db.getTrackHistory(input?.limit ?? 10)),

    create: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        artist: z.string().min(1).max(255),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const track = await db.createTrack(input);
        await db.createAuditLog({
          action: "create_track",
          entityType: "track",
          entityId: track.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return track;
      }),

    // Admin routes for managing tracks
    adminList: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(({ input }) => db.getAllTracks(input?.limit)),

    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        artist: z.string().min(1).max(255).optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const track = await db.updateTrack(id, updates);
        await db.createAuditLog({
          action: "update_track",
          entityType: "track",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return track;
      }),

    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteTrack(input.id);
        await db.createAuditLog({
          action: "delete_track",
          entityType: "track",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return { success: true };
      }),
  }),

  shows: router({
    list: publicProcedure.query(() => db.listShows()),
    all: adminProcedure.query(() => db.getAllShows()),

    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        host: z.string().max(255).optional(),
        description: z.string().optional(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        isActive: z.boolean().default(true),
      }))
      .mutation(({ input }) => db.createShow(input)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        host: z.string().max(255).optional(),
        description: z.string().optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(({ input: { id, ...updates } }) => db.updateShow(id, updates)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        db.deleteShow(input.id);
        return { success: true };
      }),
  }),

  listeners: router({
    leaderboard: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(({ input }) => db.getListenerStats(input?.limit ?? 20)),
  }),

  ai: router({
    listenerAssistant: publicProcedure
      .input(z.object({ message: z.string().min(1).max(500) }))
      .mutation(async ({ input }) => {
        // Fetch context
        const nowPlaying = await db.getNowPlaying();
        const shows = await db.listShows();

        // Find next show
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        let nextShow;
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
          const checkDay = (currentDay + dayOffset) % 7;
          const dayShows = shows.filter((s) => s.dayOfWeek === checkDay);

          for (const show of dayShows) {
            const [hours, minutes] = show.startTime.split(":").map(Number);
            const showTime = hours * 60 + minutes;

            if (dayOffset === 0 && showTime > currentTime) {
              nextShow = show;
              break;
            }
            if (dayOffset > 0) {
              nextShow = show;
              break;
            }
          }
          if (nextShow) break;
        }

        const context = {
          nowPlaying: nowPlaying ? {
            title: nowPlaying.title,
            artist: nowPlaying.artist,
          } : undefined,
          nextShow: nextShow ? {
            name: nextShow.name,
            host: nextShow.host,
            dayOfWeek: nextShow.dayOfWeek,
            startTime: nextShow.startTime,
          } : undefined,
          hotlineNumber: "07957 432842",
        };

        // Use Danny's persona for AI responses
        const { getDannyContext } = await import("./_core/dannyPersona");
        const dannyContext = getDannyContext({
          nowPlaying: context.nowPlaying,
          nextShow: context.nextShow,
        });

        const { callListenerAI } = await import("./_core/aiListener");
        const response = await callListenerAI(input.message, {
          ...context,
          dannyPersona: dannyContext,
        });
        return { response };
      }),

    bookingAssistant: publicProcedure
      .input(z.object({
        message: z.string().max(1000).optional(),
        currentStep: z.string().max(100).optional(),
        collectedData: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { callBookingAI } = await import("./_core/aiBooking");
        const response = await callBookingAI(
          input.message || "",
          input.currentStep,
          input.collectedData as any
        );
        return { response };
      }),

    showSummary: adminProcedure
      .input(z.object({ showDate: z.string() }))
      .query(async ({ input }) => {
        // Fetch data for the date
        const allTracks = await db.getTrackHistory(100);
        const allShouts = await db.getAllShouts({ approved: true });

        const targetDate = new Date(input.showDate);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const tracks = allTracks.filter((t) => {
          const playedAt = new Date(t.playedAt);
          return playedAt >= targetDate && playedAt < nextDay;
        });

        const shouts = allShouts.filter((s) => {
          const createdAt = new Date(s.createdAt);
          return createdAt >= targetDate && createdAt < nextDay;
        });

        const { generateShowSummary } = await import("./_core/aiShowSummary");
        const summary = await generateShowSummary({
          date: input.showDate,
          tracks: tracks.map((t) => ({
            title: t.title,
            artist: t.artist,
            playedAt: t.playedAt,
          })),
          shouts: shouts.map((s) => ({
            name: s.name,
            message: s.message,
          })),
        });

        return { summary };
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(255),
        phone: z.string().max(20).optional(),
        organisation: z.string().max(255).optional(),
        eventType: z.enum(["club", "radio", "private", "brand", "other", "wedding", "corporate", "festival"]),
        eventDate: z.string(),
        eventTime: z.string().regex(/^\d{2}:\d{2}$/),
        location: z.string().min(1).max(255),
        budgetRange: z.string().max(100).optional(),
        setLength: z.string().max(100).optional(),
        streamingRequired: z.boolean().default(false),
        extraNotes: z.string().optional(),
        marketingConsent: z.boolean().default(false),
        dataConsent: z.boolean(),
      }))
      .mutation(({ input }) => {
        const { dataConsent, ...data } = input;
        return db.createEventBooking({
          ...data,
          // @ts-ignore
          eventType: data.eventType // Enum mismatch workaround
        });
      }),

    list: adminProcedure.query(() => db.listEventBookings()),

    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getEventBooking(input.id)),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(20).optional(),
        organisation: z.string().max(255).optional(),
        eventType: z.enum(["club", "radio", "private", "brand", "other"]).optional(),
        eventDate: z.string().optional(),
        eventTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        location: z.string().min(1).max(255).optional(),
        budgetRange: z.string().max(100).optional(),
        setLength: z.string().max(100).optional(),
        streamingRequired: z.boolean().optional(),
        extraNotes: z.string().optional(),
        marketingConsent: z.boolean().optional(),
        dataConsent: z.boolean().optional(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const booking = await db.updateEventBooking(id, updates);
        await db.createAuditLog({
          action: "update_booking",
          entityType: "event_booking",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return booking;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEventBooking(input.id);
        await db.createAuditLog({
          action: "delete_booking",
          entityType: "event_booking",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return { success: true };
      }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - REVENUE STACK
  // ============================================

  products: router({
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["drop", "soundpack", "preset", "course", "bundle", "vinyl", "merch", "other"]),
        price: z.string().min(1),
        currency: z.string().default("GBP"),
        downloadUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.createProduct(input);
        await db.createAuditLog({
          action: "create_product",
          entityType: "product",
          entityId: product.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify({ name: input.name, type: input.type, price: input.price }),
        });
        return product;
      }),
    list: publicProcedure
      .input(z.object({ activeOnly: z.boolean().default(true) }))
      .query(({ input }) => db.listProducts(input.activeOnly)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getProduct(input.id)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().max(255).optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        currency: z.string().optional(),
        type: z.enum(["drop", "soundpack", "preset", "course", "bundle", "vinyl", "merch", "other"]).optional(),
        downloadUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        stock: z.number().optional(),
        shippingRequired: z.boolean().optional(),
        beatportUrl: z.string().optional(),
        soundcloudUrl: z.string().optional(),
        spotifyUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const updated = await db.updateProduct(id, updates);
        await db.createAuditLog({
          action: "update_product",
          entityType: "product",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify(updates),
        });
        return updated;
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteProduct(input.id);
        await db.createAuditLog({
          action: "delete_product",
          entityType: "product",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify({ deleted: true }),
        });
      }),
    search: publicProcedure
      .input(z.object({
        q: z.string().min(1).max(100),
        type: z.string().optional(),
        limit: z.number().default(20),
      }))
      .query(({ input }) => db.searchProducts(input.q, input.type, input.limit)),
  }),

  purchases: router({
    createPaymentIntent: publicProcedure
      .input(z.object({
        productId: z.number(),
        fanName: z.string().min(1).max(255),
        email: z.string().email().max(255).optional(),
        fanId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProduct(input.productId);
        if (!product) throw new Error("Product not found");

        // Parse price (assuming format like "£9.99" or "9.99")
        const priceStr = product.price.replace(/[£$€,]/g, "");
        const amount = Math.round(parseFloat(priceStr) * 100); // Convert to pence/cents

        const { createStripePaymentIntent } = await import("./lib/payments");
        const result = await createStripePaymentIntent({
          productId: input.productId,
          amount,
          currency: product.currency || "GBP",
          fanName: input.fanName,
          email: input.email,
          fanId: input.fanId || ctx.user?.id,
        });

        await db.createAuditLog({
          action: "create_payment_intent",
          entityType: "purchase",
          entityId: result.purchaseId,
          actorId: ctx.user?.id,
          actorName: input.fanName,
          afterSnapshot: JSON.stringify({ productId: input.productId, paymentIntentId: result.paymentIntentId }),
        });

        return result;
      }),
    createPayPalOrder: publicProcedure
      .input(z.object({
        productId: z.number(),
        fanName: z.string().min(1).max(255),
        email: z.string().email().max(255).optional(),
        fanId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProduct(input.productId);
        if (!product) throw new Error("Product not found");

        const priceStr = product.price.replace(/[£$€,]/g, "");
        const amount = Math.round(parseFloat(priceStr) * 100);

        const { createPayPalOrder } = await import("./lib/payments");
        const result = await createPayPalOrder({
          productId: input.productId,
          amount,
          currency: product.currency || "GBP",
          fanName: input.fanName,
          email: input.email,
          fanId: input.fanId || ctx.user?.id,
        });

        await db.createAuditLog({
          action: "create_paypal_order",
          entityType: "purchase",
          entityId: result.purchaseId,
          actorId: ctx.user?.id,
          actorName: input.fanName,
          afterSnapshot: JSON.stringify({ productId: input.productId, orderId: result.orderId }),
        });

        return result;
      }),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPurchase(input.id)),
    list: adminProcedure.query(() => db.listPurchases()),
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "refunded", "failed", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updatePurchase(input.id, { status: input.status });
        await db.createAuditLog({
          action: "update_purchase_status",
          entityType: "purchase",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify({ status: input.status }),
        });
        return updated;
      }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - BRAND LAYER
  // ============================================
  brands: router({
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        type: z.enum(["personality", "station", "clothing", "pets", "other"]),
        primaryColor: z.string().max(20).optional(),
        secondaryColor: z.string().max(20).optional(),
        logoUrl: z.string().max(512).optional(),
        domain: z.string().max(255).optional(),
        isActive: z.boolean().default(true),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const brand = await db.createBrand(input);
        if (input.isDefault) {
          await db.setDefaultBrand(brand.id);
        }
        await db.createAuditLog({
          action: "create_brand",
          entityType: "brand",
          entityId: brand.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify({ name: input.name, slug: input.slug, type: input.type }),
        });
        return brand;
      }),
    list: publicProcedure
      .input(z.object({ activeOnly: z.boolean().default(false) }))
      .query(({ input }) => db.listBrands(input.activeOnly)),
    getDefault: publicProcedure.query(() => db.getDefaultBrand()),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => db.getBrandBySlug(input.slug)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          name: z.string().max(255).optional(),
          primaryColor: z.string().max(20).optional(),
          secondaryColor: z.string().max(20).optional(),
          logoUrl: z.string().max(512).optional(),
          isActive: z.boolean().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateBrand(input.id, input.updates);
        await db.createAuditLog({
          action: "update_brand",
          entityType: "brand",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify(input.updates),
        });
        return updated;
      }),
    setDefault: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const brand = await db.setDefaultBrand(input.id);
        await db.createAuditLog({
          action: "set_default_brand",
          entityType: "brand",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return brand;
      }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - SAFETY & REPUTATION
  // ============================================
  safety: router({
    auditLogs: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(({ input }) => db.listAuditLogs(input.limit)),

    settings: router({
      get: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(({ input }) => db.getEmpireSetting(input.key)),
      set: adminProcedure
        .input(z.object({
          key: z.string(),
          value: z.union([z.string(), z.record(z.string(), z.any())]),
          description: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const setting = await db.setEmpireSetting(
            input.key,
            input.value,
            input.description,
            ctx.user?.id
          );
          await db.createAuditLog({
            action: "set_empire_setting",
            entityType: "empire_setting",
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
            afterSnapshot: JSON.stringify({ key: input.key, value: input.value }),
          });
          return setting;
        }),
      getAll: adminProcedure.query(() => db.getAllEmpireSettings()),
    }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - OBSERVABILITY
  // ============================================
  observability: router({
    errorLogs: adminProcedure
      .input(z.object({
        limit: z.number().default(100),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .query(({ input }) => db.listErrorLogs(input.limit, input.severity)),
    markErrorResolved: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markErrorLogResolved(input.id)),

    incidentBanners: router({
      getActive: publicProcedure.query(() => db.getActiveIncidentBanner()),
      create: adminProcedure
        .input(z.object({
          message: z.string().min(1),
          severity: z.enum(["info", "warning", "error"]).default("info"),
          isActive: z.boolean().default(true),
          endAt: z.string().optional(), // ISO date string
        }))
        .mutation(async ({ input, ctx }) => {
          const banner = await db.createIncidentBanner({
            ...input,
            endAt: input.endAt ? new Date(input.endAt) : undefined,
          });
          await db.createAuditLog({
            action: "create_incident_banner",
            entityType: "incident_banner",
            entityId: banner.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return banner;
        }),
      list: adminProcedure.query(() => db.listIncidentBanners()),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            message: z.string().optional(),
            severity: z.enum(["info", "warning", "error"]).optional(),
            isActive: z.boolean().optional(),
            endAt: z.string().optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updates: any = { ...input.updates };
          if (updates.endAt) updates.endAt = new Date(updates.endAt) as any;
          const updated = await db.updateIncidentBanner(input.id, updates);
          await db.createAuditLog({
            action: "update_incident_banner",
            entityType: "incident_banner",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
            afterSnapshot: JSON.stringify(updates),
          });
          return updated;
        }),
    }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - NOTIFICATION ORCHESTRATOR
  // ============================================
  notifications: router({
    create: publicProcedure
      .input(z.object({
        fanId: z.number().optional(),
        fanName: z.string().optional(),
        email: z.string().email().optional(),
        type: z.string().min(1),
        channel: z.enum(["web_push", "email", "whatsapp", "in_app"]),
        payload: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(({ input }) => db.createNotification({ ...input, payload: input.payload ? JSON.stringify(input.payload) : undefined })),
    list: publicProcedure
      .input(z.object({
        fanId: z.number().optional(),
        limit: z.number().default(50),
      }))
      .query(({ input }) => db.listNotifications(input.fanId, input.limit)),
    markRead: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.markNotificationRead(input.id)),
    markAllRead: publicProcedure
      .input(z.object({ fanId: z.number() }))
      .mutation(({ input }) => db.markAllNotificationsRead(input.fanId)),
    unreadCount: publicProcedure
      .input(z.object({ fanId: z.number().optional() }))
      .query(({ input }) => db.getUnreadNotificationCount(input.fanId)),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - EMPIRE API
  // ============================================
  apiKeys: router({
    create: adminProcedure
      .input(z.object({
        label: z.string().min(1).max(255),
        scopes: z.array(z.string()),
        expiresAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input, ctx }) => {
        const crypto = await import("crypto");
        const key = crypto.randomBytes(32).toString("hex");
        const apiKey = await db.createApiKey({
          key,
          label: input.label,
          scopes: JSON.stringify(input.scopes),
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
          isActive: true,
        });
        await db.createAuditLog({
          action: "create_api_key",
          entityType: "api_key",
          entityId: apiKey.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return { ...apiKey, key }; // Return the key only once
      }),
    list: adminProcedure
      .input(z.object({ activeOnly: z.boolean().default(false) }))
      .query(({ input }) => db.listApiKeys(input.activeOnly)),
    deactivate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deactivateApiKey(input.id);
        await db.createAuditLog({
          action: "deactivate_api_key",
          entityType: "api_key",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteApiKey(input.id);
        await db.createAuditLog({
          action: "delete_api_key",
          entityType: "api_key",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
      }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - EMPIRE OVERVIEW
  // ============================================
  empire: router({
    overview: adminProcedure.query(() => db.getEmpireOverview()),
  }),

  // ============================================
  // PHASE 6: GEN-Z DOMINATION LAYER
  // ============================================
  genz: router({
    profiles: router({
      createOrUpdate: publicProcedure
        .input(z.object({
          username: z.string().min(1).max(50),
          displayName: z.string().max(255).optional(),
          bio: z.string().optional(),
          avatarUrl: z.string().max(512).optional(),
          bannerUrl: z.string().max(512).optional(),
          location: z.string().max(255).optional(),
          website: z.string().max(255).optional(),
          isPublic: z.boolean().default(true),
        }))
        .mutation(({ input }) => db.createOrUpdateGenZProfile(input)),
      getByUsername: publicProcedure
        .input(z.object({ username: z.string() }))
        .query(({ input }) => db.getGenZProfileByUsername(input.username)),
      getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getGenZProfileById(input.id)),
      list: publicProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(({ input }) => db.listGenZProfiles(input.limit)),
    }),

    follows: router({
      follow: publicProcedure
        .input(z.object({
          followerId: z.number(),
          followingId: z.number(),
        }))
        .mutation(({ input }) => db.createFollow(input)),
      unfollow: publicProcedure
        .input(z.object({
          followerId: z.number(),
          followingId: z.number(),
        }))
        .mutation(({ input }) => db.unfollow(input.followerId, input.followingId)),
      isFollowing: publicProcedure
        .input(z.object({
          followerId: z.number(),
          followingId: z.number(),
        }))
        .query(({ input }) => db.isFollowing(input.followerId, input.followingId)),
      followers: publicProcedure
        .input(z.object({ profileId: z.number() }))
        .query(({ input }) => db.getFollowers(input.profileId)),
      following: publicProcedure
        .input(z.object({ profileId: z.number() }))
        .query(({ input }) => db.getFollowing(input.profileId)),
    }),

    posts: router({
      create: publicProcedure
        .input(z.object({
          profileId: z.number(),
          type: z.enum(["text", "image", "video", "audio", "clip"]),
          content: z.string().optional(),
          mediaUrl: z.string().max(512).optional(),
          thumbnailUrl: z.string().max(512).optional(),
          isPublic: z.boolean().default(true),
        }))
        .mutation(({ input }) => db.createUserPost(input)),
      list: publicProcedure
        .input(z.object({
          profileId: z.number().optional(),
          limit: z.number().default(50),
        }))
        .query(({ input }) => db.listUserPosts(input.profileId, input.limit)),
      get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getUserPost(input.id)),
    }),

    reactions: router({
      toggle: publicProcedure
        .input(z.object({
          postId: z.number(),
          profileId: z.number(),
          reactionType: z.string().default("like"),
        }))
        .mutation(({ input }) => db.togglePostReaction(input)),
    }),

    collectibles: router({
      list: publicProcedure
        .input(z.object({ activeOnly: z.boolean().default(true) }))
        .query(({ input }) => db.listCollectibles(input.activeOnly)),
      getUserCollectibles: publicProcedure
        .input(z.object({ profileId: z.number() }))
        .query(({ input }) => db.getUserCollectibles(input.profileId)),
      add: publicProcedure
        .input(z.object({
          profileId: z.number(),
          collectibleId: z.number(),
          isEquipped: z.boolean().default(false),
        }))
        .mutation(({ input }) => db.addUserCollectible(input)),
    }),

    achievements: router({
      list: publicProcedure
        .input(z.object({ activeOnly: z.boolean().default(true) }))
        .query(({ input }) => db.listAchievements(input.activeOnly)),
      getUserAchievements: publicProcedure
        .input(z.object({ profileId: z.number() }))
        .query(({ input }) => db.getUserAchievements(input.profileId)),
      unlock: publicProcedure
        .input(z.object({
          profileId: z.number(),
          achievementId: z.number(),
        }))
        .mutation(({ input }) => db.unlockAchievement(input)),
    }),

    aiDanny: router({
      chat: publicProcedure
        .input(z.object({
          sessionId: z.string(),
          message: z.string().min(1),
          profileId: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          // Import AI helper
          const { callListenerAI } = await import("./_core/aiListener");
          const context = {
            nowPlaying: undefined,
            nextShow: undefined,
            rules: "You're AI Danny, be helpful and hype!",
            hotlineNumber: "+447000HECTIC",
          };
          const response = await callListenerAI(input.message, context);

          const chat = await db.createAIDannyChat({
            sessionId: input.sessionId,
            profileId: input.profileId,
            message: input.message,
            response: response,
            context: JSON.stringify(context),
          });
          return chat;
        }),
      history: publicProcedure
        .input(z.object({
          sessionId: z.string(),
          limit: z.number().default(50),
        }))
        .query(({ input }) => db.getAIDannyChatHistory(input.sessionId, input.limit)),
    }),

    world: router({
      createOrUpdateAvatar: publicProcedure
        .input(z.object({
          profileId: z.number(),
          avatarData: z.record(z.string(), z.any()).optional(),
          positionX: z.string().max(100).default("0"),
          positionY: z.string().max(100).default("0"),
          positionZ: z.string().max(100).default("0"),
          rotation: z.string().max(100).default("0"),
          isOnline: z.boolean().default(true),
        }))
        .mutation(({ input }) => db.createOrUpdateWorldAvatar({ ...input, avatarData: input.avatarData ? JSON.stringify(input.avatarData) : undefined })),
      listOnline: publicProcedure.query(() => db.listOnlineWorldAvatars()),
    }),
  }),

  // ============================================
  // PHASE 7: GLOBAL CULT MODE
  // ============================================
  bookingsPhase7: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        org: z.string().max(255).optional(),
        email: z.string().email().max(255),
        phone: z.string().max(20).optional(),
        type: z.enum(["club", "radio", "private", "corporate", "podcast", "other"]),
        location: z.string().min(1).max(255),
        date: z.string(),
        time: z.string().optional(),
        budgetMin: z.string().max(50).optional(),
        budgetMax: z.string().max(50).optional(),
        source: z.string().max(255).optional(),
      }))
      .mutation(async ({ input }) => {
        const booking = await db.createBookingPhase7({ ...input, status: "new" });
        await db.createAuditLog({
          action: "create_booking_phase7",
          entityType: "booking",
          entityId: booking.id,
          actorName: input.name,
          afterSnapshot: JSON.stringify({ type: input.type, location: input.location }),
        });
        return booking;
      }),
    list: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        type: z.string().optional(),
      }))
      .query(({ input }) => db.listBookingsPhase7(input)),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getBookingPhase7(input.id)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          status: z.enum(["new", "reviewing", "accepted", "declined", "completed"]).optional(),
          internalNotes: z.string().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateBookingPhase7(input.id, input.updates);
        await db.createAuditLog({
          action: "update_booking_phase7",
          entityType: "booking",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify(input.updates),
        });
        return updated;
      }),
  }),

  eventsPhase7: router({
    create: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["stream", "club", "private", "online_collab", "festival", "takeover"]),
        location: z.string().max(255).optional(),
        dateTimeStart: z.string(), // ISO date string
        dateTimeEnd: z.string().optional(),
        isPublic: z.boolean().default(true),
        ticketsUrl: z.string().max(512).optional(),
        status: z.enum(["upcoming", "live", "completed", "cancelled"]).default("upcoming"),
        brandId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const event = await db.createEventPhase7({
          ...input,
          dateTimeStart: new Date(input.dateTimeStart),
          dateTimeEnd: input.dateTimeEnd ? new Date(input.dateTimeEnd) : undefined,
        });
        await db.createAuditLog({
          action: "create_event_phase7",
          entityType: "event",
          entityId: event.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: JSON.stringify({ title: input.title, type: input.type }),
        });
        return event;
      }),
    list: publicProcedure
      .input(z.object({ upcomingOnly: z.boolean().default(true) }))
      .query(({ input }) => db.listEventsPhase7(input.upcomingOnly)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getEventPhase7(input.id)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          title: z.string().max(255).optional(),
          status: z.enum(["upcoming", "live", "completed", "cancelled"]).optional(),
          ticketsUrl: z.string().max(512).optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateEventPhase7(input.id, input.updates);
        await db.createAuditLog({
          action: "update_event_phase7",
          entityType: "event",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return updated;
      }),
  }),

  partners: router({
    requests: router({
      create: publicProcedure
        .input(z.object({
          name: z.string().min(1).max(255),
          brandName: z.string().max(255).optional(),
          email: z.string().email().max(255),
          links: z.record(z.string(), z.string()).optional(),
          collabType: z.enum(["guest_mix", "co_host", "brand_drop", "takeover", "other"]),
          pitch: z.string().min(1),
        }))
        .mutation(({ input }) => db.createPartnerRequest({ ...input, links: input.links ? JSON.stringify(input.links) : undefined })),
      list: adminProcedure
        .input(z.object({ status: z.string().optional() }))
        .query(({ input }) => db.listPartnerRequests(input)),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            status: z.enum(["new", "reviewing", "accepted", "declined"]).optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updatePartnerRequest(input.id, input.updates);
          if (input.updates.status === "accepted") {
            // Auto-create partner from request
            const request = await db.listPartnerRequests({ status: "new" });
            const req = request.find((r) => r.id === input.id);
            if (req) {
              await db.createPartner({
                name: req.name,
                brandName: req.brandName || undefined,
                isActive: true, // email not stored in partners table
                type: req.collabType === 'guest_mix' ? 'dj' :
                  req.collabType === 'co_host' ? 'creator' :
                    req.collabType === 'brand_drop' ? 'clothing' : 'other',
              });
            }
          }
          await db.createAuditLog({
            action: "update_partner_request",
            entityType: "partner_request",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),
    list: publicProcedure
      .input(z.object({ activeOnly: z.boolean().default(true) }))
      .query(({ input }) => db.listPartners(input.activeOnly)),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        brandName: z.string().max(255).optional(),
        logoUrl: z.string().max(512).optional(),
        links: z.record(z.string(), z.string()).optional(),
        type: z.enum(["venue", "clothing", "media", "dj", "creator", "other"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { links, ...data } = input;
        const partner = await db.createPartner({ ...data, links: links ? JSON.stringify(links) : undefined });
        await db.createAuditLog({
          action: "create_partner",
          entityType: "partner",
          entityId: partner.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return partner;
      }),
  }),

  social: router({
    profiles: router({
      create: adminProcedure
        .input(z.object({
          platform: z.enum(["instagram", "tiktok", "youtube", "spotify", "mixcloud", "snapchat", "telegram", "piing", "twitter", "facebook", "other"]),
          url: z.string().url().max(512),
          handle: z.string().max(255).optional(),
          brandId: z.number().optional(),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
          const profile = await db.createSocialProfile(input);
          await db.createAuditLog({
            action: "create_social_profile",
            entityType: "social_profile",
            entityId: profile.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return profile;
        }),
      list: publicProcedure
        .input(z.object({
          brandId: z.number().optional(),
          activeOnly: z.boolean().default(true),
        }))
        .query(({ input }) => db.listSocialProfiles(input.brandId, input.activeOnly)),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            url: z.string().url().max(512).optional(),
            handle: z.string().max(255).optional(),
            isActive: z.boolean().optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateSocialProfile(input.id, input.updates);
          await db.createAuditLog({
            action: "update_social_profile",
            entityType: "social_profile",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),
    templates: router({
      create: adminProcedure
        .input(z.object({
          name: z.string().min(1).max(255),
          platform: z.enum(["instagram", "tiktok", "youtube", "spotify", "mixcloud", "snapchat", "telegram", "piing", "twitter", "facebook", "all"]),
          templateType: z.enum(["nowPlaying", "eventAnnouncement", "newMix", "shoutHighlight", "quote", "clipDrop"]),
          templateText: z.string().min(1),
        }))
        .mutation(({ input }) => db.createPostTemplate(input)),
      list: publicProcedure
        .input(z.object({
          platform: z.string().optional(),
          templateType: z.string().optional(),
        }))
        .query(({ input }) => db.listPostTemplates(input.platform, input.templateType)),
      render: publicProcedure
        .input(z.object({
          templateId: z.number(),
          data: z.record(z.string(), z.string()),
        }))
        .query(async ({ input }) => {
          const templates = await db.listPostTemplates();
          const template = templates.find((t) => t.id === input.templateId);
          if (!template) throw new Error("Template not found");
          return db.renderPostTemplate(template.templateText, input.data);
        }),
    }),
    promotions: router({
      create: adminProcedure
        .input(z.object({
          entityType: z.enum(["event", "mix", "clip", "show", "achievement", "milestone"]),
          entityId: z.number(),
          platforms: z.array(z.string()),
        }))
        .mutation(async ({ input, ctx }) => {
          const promotion = await db.createPromotion({
            ...input,
            platforms: JSON.stringify(input.platforms),
            status: "draft",
          });
          await db.createAuditLog({
            action: "create_promotion",
            entityType: "promotion",
            entityId: promotion.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return promotion;
        }),
      list: adminProcedure
        .input(z.object({ status: z.string().optional() }))
        .query(({ input }) => db.listPromotions(input)),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            status: z.enum(["draft", "ready", "scheduled", "sent"]).optional(),
            platforms: z.array(z.string()).optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updatePromotion(input.id, {
            ...input.updates,
            platforms: input.updates.platforms ? JSON.stringify(input.updates.platforms) : undefined,
          });
          await db.createAuditLog({
            action: "update_promotion",
            entityType: "promotion",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),
  }),

  innerCircle: router({
    getStatus: publicProcedure
      .input(z.object({ profileId: z.number() }))
      .query(({ input }) => db.getInnerCircleStatus(input.profileId)),
    createOrUpdate: adminProcedure
      .input(z.object({
        profileId: z.number(),
        isEligible: z.boolean(),
        eligibilityReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createOrUpdateInnerCircle(input);
        await db.createAuditLog({
          action: "update_inner_circle",
          entityType: "inner_circle",
          entityId: result.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return result;
      }),
    list: adminProcedure.query(() => db.listInnerCircleMembers()),
  }),

  // ============================================
  // PHASE 8: HECTIC AI STUDIO
  // ============================================
  aiStudio: router({
    scripts: router({
      create: publicProcedure
        .input(z.object({
          type: z.enum(["intro", "outro", "mixStory", "tiktokClip", "promo", "fanShout", "generic"]),
          context: z.record(z.string(), z.any()),
        }))
        .mutation(async ({ input, ctx }) => {
          const { areFanFacingAiToolsEnabled } = await import("./_core/aiProviders");
          if (input.type === "fanShout" && !(await areFanFacingAiToolsEnabled())) {
            throw new Error("Fan-facing AI tools are currently disabled");
          }
          const { createAiScriptJob } = await import("./_core/aiScriptFactory");
          const jobId = await createAiScriptJob(input.type, input.context, ctx.user?.id);
          const job = await db.getAIScriptJob(jobId);
          return job;
        }),
      processOne: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const { processAiScriptJob } = await import("./_core/aiScriptFactory");
          const result = await processAiScriptJob(input.id);
          await db.createAuditLog({
            action: "process_ai_script_job",
            entityType: "ai_script_job",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true, resultText: result };
        }),
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          type: z.string().optional(),
          userId: z.number().optional(),
          limit: z.number().default(100),
        }))
        .query(({ input }) => db.listAIScriptJobs(input, input.limit)),
      get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getAIScriptJob(input.id)),
    }),

    voice: router({
      create: publicProcedure
        .input(z.object({
          scriptJobId: z.number().optional(),
          rawText: z.string().optional(),
          voiceProfile: z.enum(["hectic_main", "hectic_soft", "hectic_shouty"]).default("hectic_main"),
        }))
        .mutation(async ({ input, ctx }) => {
          const { areFanFacingAiToolsEnabled } = await import("./_core/aiProviders");
          if (!(await areFanFacingAiToolsEnabled()) && !ctx.user) {
            throw new Error("Fan-facing AI tools are currently disabled");
          }
          const { createAiVoiceJob } = await import("./_core/aiVoiceFactory");
          const jobId = await createAiVoiceJob({
            scriptJobId: input.scriptJobId,
            rawText: input.rawText,
            voiceProfile: input.voiceProfile,
            userId: ctx.user?.id,
          });
          const job = await db.getAIVoiceJob(jobId);
          return job;
        }),
      processOne: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const { processAiVoiceJob } = await import("./_core/aiVoiceFactory");
          const audioUrl = await processAiVoiceJob(input.id);
          await db.createAuditLog({
            action: "process_ai_voice_job",
            entityType: "ai_voice_job",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true, audioUrl };
        }),
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          userId: z.number().optional(),
          limit: z.number().default(100),
        }))
        .query(({ input }) => db.listAIVoiceJobs(input, input.limit)),
      get: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getAIVoiceJob(input.id)),
    }),

    video: router({
      create: adminProcedure
        .input(z.object({
          scriptJobId: z.number(),
          stylePreset: z.enum(["verticalShort", "squareClip", "horizontalHost"]),
        }))
        .mutation(async ({ input, ctx }) => {
          const { createAiVideoJob } = await import("./_core/aiVideoFactory");
          const jobId = await createAiVideoJob({
            scriptJobId: input.scriptJobId,
            stylePreset: input.stylePreset,
            userId: ctx.user?.id,
          });
          const job = await db.getAIVideoJob(jobId);
          await db.createAuditLog({
            action: "create_ai_video_job",
            entityType: "ai_video_job",
            entityId: jobId,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return job;
        }),
      processOne: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const { processAiVideoJob } = await import("./_core/aiVideoFactory");
          const result = await processAiVideoJob(input.id);
          await db.createAuditLog({
            action: "process_ai_video_job",
            entityType: "ai_video_job",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true, ...result };
        }),
      list: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          userId: z.number().optional(),
          limit: z.number().default(100),
        }))
        .query(({ input }) => db.listAIVideoJobs(input, input.limit)),
      get: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getAIVideoJob(input.id)),
    }),

    consents: router({
      createOrUpdate: publicProcedure
        .input(z.object({
          profileId: z.number().optional(),
          userId: z.number().optional(),
          email: z.string().email().optional(),
          aiContentConsent: z.boolean(),
          marketingConsent: z.boolean(),
          dataShareConsent: z.boolean(),
        }))
        .mutation(({ input }) => db.createOrUpdateUserConsent(input)),
      get: publicProcedure
        .input(z.object({
          profileId: z.number().optional(),
          userId: z.number().optional(),
          email: z.string().email().optional(),
        }))
        .query(({ input }) => db.getUserConsent(input.profileId, input.userId, input.email)),
      stats: adminProcedure.query(() => db.getConsentStats()),
    }),
  }),

  // ============================================
  // PHASE 9: HECTIC ECONOMY + THE HECTIC SHOW
  // ============================================
  economy: router({
    wallet: router({
      getMyWallet: protectedProcedure.query(async ({ ctx }) => {
        return await db.getOrCreateWallet(ctx.user!.id);
      }),
      getTransactions: protectedProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(({ input, ctx }) => db.getCoinTransactions(ctx.user!.id, input.limit)),
      adminGetWalletByUser: adminProcedure
        .input(z.object({ userId: z.number() }))
        .query(({ input }) => db.getWalletByUserId(input.userId)),
    }),

    rewards: router({
      listActive: publicProcedure.query(() => db.listRewards(true)),
      adminList: adminProcedure.query(() => db.listRewards(false)),
      adminCreate: adminProcedure
        .input(z.object({
          name: z.string(),
          description: z.string().optional(),
          costCoins: z.number(),
          type: z.enum(["digital", "physical", "access", "aiAsset", "other"]),
          fulfillmentType: z.enum(["manual", "autoEmail", "autoLink", "aiScript", "aiVoice", "aiVideo"]),
          fulfillmentPayload: z.string().optional(),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
          const reward = await db.createReward(input);
          await db.createAuditLog({
            action: "create_reward",
            entityType: "reward",
            entityId: reward.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return reward;
        }),
      adminUpdate: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            costCoins: z.number().optional(),
            type: z.enum(["digital", "physical", "access", "aiAsset", "other"]).optional(),
            fulfillmentType: z.enum(["manual", "autoEmail", "autoLink", "aiScript", "aiVoice", "aiVideo"]).optional(),
            fulfillmentPayload: z.string().optional(),
            isActive: z.boolean().optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateReward(input.id, input.updates);
          await db.createAuditLog({
            action: "update_reward",
            entityType: "reward",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),

    redemptions: router({
      create: protectedProcedure
        .input(z.object({ rewardId: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const redemption = await db.createRedemption(ctx.user!.id, input.rewardId);
          await db.createAuditLog({
            action: "create_redemption",
            entityType: "redemption",
            entityId: redemption.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "User",
          });
          return redemption;
        }),
      myRedemptions: protectedProcedure
        .input(z.object({ limit: z.number().default(50) }))
        .query(({ input, ctx }) => db.listRedemptions({ userId: ctx.user!.id }, input.limit)),
      adminList: adminProcedure
        .input(z.object({
          userId: z.number().optional(),
          status: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(({ input }) => db.listRedemptions(input, input.limit)),
      adminUpdateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected", "fulfilled"]),
          notesAdmin: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateRedemptionStatus(input.id, input.status, input.notesAdmin);
          await db.createAuditLog({
            action: "update_redemption_status",
            entityType: "redemption",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),

    referrals: router({
      createMyCode: protectedProcedure
        .input(z.object({
          code: z.string(),
          maxUses: z.number().optional(),
          expiresAt: z.date().optional(),
        }))
        .mutation(({ input, ctx }) => db.createReferralCode(ctx.user!.id, input.code, input.maxUses, input.expiresAt)),
      applyCode: publicProcedure
        .input(z.object({
          code: z.string(),
          userId: z.number(),
          rewardCoins: z.number().default(100),
        }))
        .mutation(({ input }) => db.applyReferralCode(input.code, input.userId, input.rewardCoins)),
      myReferralStats: protectedProcedure.query(({ ctx }) => db.getReferralStats(ctx.user!.id)),
      adminListCodes: adminProcedure
        .input(z.object({ ownerUserId: z.number().optional() }))
        .query(({ input }) => db.listReferralCodes(input?.ownerUserId)),
    }),
  }),

  showsPhase9: router({
    listPublic: publicProcedure.query(() => db.listShowsPhase9(true)),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => db.getShowPhase9BySlug(input.slug)),
    adminList: adminProcedure.query(() => db.listShowsPhase9(false)),
    adminCreate: adminProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        hostName: z.string().optional(),
        isPrimaryShow: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const show = await db.createShowPhase9(input);
        if (input.isPrimaryShow) {
          await db.setPrimaryShowPhase9(show.id);
        }
        await db.createAuditLog({
          action: "create_show",
          entityType: "show",
          entityId: show.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return show;
      }),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          hostName: z.string().optional(),
          isPrimaryShow: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateShowPhase9(input.id, input.updates);
        if (input.updates.isPrimaryShow) {
          await db.setPrimaryShowPhase9(input.id);
        }
        await db.createAuditLog({
          action: "update_show",
          entityType: "show",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return updated;
      }),
    adminSetPrimary: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const show = await db.setPrimaryShowPhase9(input.id);
        await db.createAuditLog({
          action: "set_primary_show",
          entityType: "show",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return show;
      }),
  }),

  episodes: router({
    listByShow: publicProcedure
      .input(z.object({
        showId: z.number().optional(),
        limit: z.number().default(50),
      }))
      .query(({ input }) => db.listShowEpisodes(input.showId, true, input.limit)),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => db.getShowEpisodeBySlug(input.slug)),
    adminList: adminProcedure
      .input(z.object({
        showId: z.number().optional(),
        limit: z.number().default(100),
      }))
      .query(({ input }) => db.listShowEpisodes(input.showId, false, input.limit)),
    adminCreate: adminProcedure
      .input(z.object({
        showId: z.number(),
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        status: z.enum(["planned", "recorded", "live", "published", "archived"]).default("planned"),
        scheduledAt: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const episode = await db.createShowEpisode(input);
        await db.createAuditLog({
          action: "create_episode",
          entityType: "episode",
          entityId: episode.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return episode;
      }),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          title: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["planned", "recorded", "live", "published", "archived"]).optional(),
          scheduledAt: z.date().optional(),
          recordedAt: z.date().optional(),
          publishedAt: z.date().optional(),
          recordingUrl: z.string().optional(),
          coverImageUrl: z.string().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateShowEpisode(input.id, input.updates);
        await db.createAuditLog({
          action: "update_episode",
          entityType: "episode",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return updated;
      }),
    adminAttachRecording: adminProcedure
      .input(z.object({
        id: z.number(),
        recordingUrl: z.string(),
        coverImageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateShowEpisode(input.id, {
          recordingUrl: input.recordingUrl,
          coverImageUrl: input.coverImageUrl,
          status: "published",
          publishedAt: new Date(),
        });
        await db.createAuditLog({
          action: "attach_recording",
          entityType: "episode",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return updated;
      }),
  }),

  live: router({
    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================
    getCurrentLive: publicProcedure.query(() => db.getCurrentLiveSession()),
    adminSchedule: adminProcedure
      .input(z.object({
        showId: z.number(),
        episodeId: z.number().optional(),
        scheduledAt: z.date().optional(),
        livePlatform: z.enum(["site", "youtube", "tiktok", "twitch", "other"]).default("site"),
        liveUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const session = await db.scheduleLiveSession(input);
        await db.createAuditLog({
          action: "schedule_live_session",
          entityType: "live_session",
          entityId: session.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return session;
      }),
    adminStart: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await db.startLiveSession(input.id);
        await db.createAuditLog({
          action: "start_live_session",
          entityType: "live_session",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return session;
      }),
    adminEnd: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const session = await db.endLiveSession(input.id);
        await db.createAuditLog({
          action: "end_live_session",
          entityType: "live_session",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return session;
      }),
    adminListSessions: adminProcedure
      .input(z.object({
        showId: z.number().optional(),
        limit: z.number().default(50),
      }))
      .query(({ input }) => db.listLiveSessions(input.showId, input.limit)),

    // ==========================================
    // ENGAGEMENT FEATURES
    // ==========================================
    chat: liveRouter.chat,
    donations: liveRouter.donations,
    reactions: liveRouter.reactions,
    polls: liveRouter.polls,
    leaderboard: liveRouter.leaderboard,
    stats: liveRouter.stats,
    notifications: liveRouter.notifications,
    social: liveRouter.social,
  }),

  cues: router({
    adminListForSession: adminProcedure
      .input(z.object({ liveSessionId: z.number() }))
      .query(({ input }) => db.listCuesForSession(input.liveSessionId)),
    adminCreate: adminProcedure
      .input(z.object({
        liveSessionId: z.number(),
        type: z.enum(["playTrack", "readShout", "playConfession", "askQuestion", "adBreak", "topicIntro", "callToAction", "custom"]),
        payload: z.string().optional(),
        orderIndex: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const cue = await db.createCue(input);
        await db.createAuditLog({
          action: "create_cue",
          entityType: "cue",
          entityId: cue.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return cue;
      }),
    adminUpdateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "done", "skipped"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const cue = await db.updateCueStatus(input.id, input.status);
        await db.createAuditLog({
          action: "update_cue_status",
          entityType: "cue",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return cue;
      }),
  }),

  // ============================================
  // PHASE 10: HECTICOPS CONTROL TOWER
  // ============================================
  controlTower: router({
    stats: adminProcedure.query(async () => {
      // Aggregate stats for the control tower dashboard
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Shouts (last 7 days)
      const allShouts = await db.getAllShouts();
      const shoutsLast7Days = allShouts.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;

      // Track votes (approximate from track requests)
      const trackRequests = await db.getTrackRequests();
      const totalVotes = trackRequests.reduce((sum, tr) => sum + (tr.votes || 0), 0);

      // Wallets
      const allWallets = await db.listWallets(1000);
      const totalCoins = allWallets.reduce((sum, w) => sum + (w.balanceCoins || 0), 0);

      // Episodes
      const episodes = await db.listShowEpisodes(undefined, false);
      const publishedEpisodes = episodes.filter((e) => e.status === "published").length;

      // AI Jobs
      const scriptJobs = await db.listAIScriptJobs({}, 1000);
      const voiceJobs = await db.listAIVoiceJobs({}, 1000);
      const videoJobs = await db.listAIVideoJobs({}, 1000);
      const totalAIJobs = scriptJobs.length + voiceJobs.length + videoJobs.length;

      // Active incident
      const activeIncident = await db.getActiveIncidentBanner();

      return {
        shoutsLast7Days,
        trackVotesTotal: totalVotes,
        activeWallets: allWallets.length,
        totalCoinsInCirculation: totalCoins,
        publishedEpisodes,
        totalAIJobs,
        activeIncident: activeIncident ? {
          message: activeIncident.message,
          severity: activeIncident.severity,
        } : null,
      };
    }),
  }),

  integrations: router({
    social: router({
      list: publicProcedure.query(() => db.listSocialIntegrations(true)),
      adminList: adminProcedure.query(() => db.listSocialIntegrations(false)),
      adminCreate: adminProcedure
        .input(z.object({
          platform: z.enum(["instagram", "tiktok", "youtube", "twitch", "twitter", "facebook", "other"]),
          handle: z.string().optional(),
          url: z.string(),
          apiKeyName: z.string().optional(),
          isPrimary: z.boolean().default(false),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
          const integration = await db.createSocialIntegration(input);
          await db.createAuditLog({
            action: "create_social_integration",
            entityType: "social_integration",
            entityId: integration.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return integration;
        }),
      adminUpdate: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            handle: z.string().optional(),
            url: z.string().optional(),
            apiKeyName: z.string().optional(),
            isPrimary: z.boolean().optional(),
            isActive: z.boolean().optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateSocialIntegration(input.id, input.updates);
          await db.createAuditLog({
            action: "update_social_integration",
            entityType: "social_integration",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
      adminSetPrimary: adminProcedure
        .input(z.object({ platform: z.string() }))
        .mutation(async ({ input, ctx }) => {
          const result = await db.setPrimarySocial(input.platform);
          await db.createAuditLog({
            action: "set_primary_social",
            entityType: "social_integration",
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return result;
        }),
    }),

    content: router({
      adminList: adminProcedure
        .input(z.object({
          status: z.string().optional(),
          platform: z.string().optional(),
          source: z.string().optional(),
          limit: z.number().default(100),
        }))
        .query(({ input }) => db.listContentQueue(input, input.limit)),
      adminCreate: adminProcedure
        .input(z.object({
          type: z.enum(["clip", "post", "story", "short", "liveAnnouncement", "other"]),
          title: z.string(),
          description: z.string().optional(),
          targetPlatform: z.enum(["instagram", "tiktok", "youtube", "whatsapp", "telegram", "multi"]),
          source: z.enum(["episode", "liveSession", "aiJob", "manual"]),
          sourceId: z.number().optional(),
          status: z.enum(["draft", "ready", "scheduled", "posted", "failed"]).default("draft"),
          scheduledAt: z.date().optional(),
          payload: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const item = await db.createContentItem(input);
          await db.createAuditLog({
            action: "create_content_item",
            entityType: "content_queue",
            entityId: item.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return item;
        }),
      adminUpdateStatus: adminProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["draft", "ready", "scheduled", "posted", "failed"]),
          externalUrl: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateContentItemStatus(input.id, input.status, input.externalUrl);
          await db.createAuditLog({
            action: "update_content_status",
            entityType: "content_queue",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
      adminAutoPopulateFromEpisode: adminProcedure
        .input(z.object({ episodeId: z.number() }))
        .mutation(async ({ input, ctx }) => {
          const episode = await db.getShowEpisode(input.episodeId);
          if (!episode) throw new Error("Episode not found");

          const items = [];

          // Create "New episode" post
          items.push(await db.createContentItem({
            type: "post",
            title: `New episode: ${episode.title} `,
            description: episode.description || "",
            targetPlatform: "multi",
            source: "episode",
            sourceId: episode.id,
            status: "draft",
            payload: JSON.stringify({
              caption: `New episode out now: ${episode.title} `,
              hashtags: ["hecticradio", "djdannyhecticb"],
            }),
          }));

          // Create clip item
          items.push(await db.createContentItem({
            type: "clip",
            title: `Best clip from: ${episode.title} `,
            targetPlatform: "tiktok",
            source: "episode",
            sourceId: episode.id,
            status: "draft",
          }));

          await db.createAuditLog({
            action: "auto_populate_content_from_episode",
            entityType: "content_queue",
            entityId: input.episodeId,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });

          return items;
        }),
    }),

    webhooks: router({
      adminList: adminProcedure
        .input(z.object({ activeOnly: z.boolean().default(false) }))
        .query(({ input }) => db.listWebhooks(input.activeOnly)),
      adminCreate: adminProcedure
        .input(z.object({
          name: z.string(),
          url: z.string(),
          secret: z.string().optional(),
          eventType: z.enum(["newShout", "newEpisodePublished", "newRedemption", "newFollower", "other"]),
          isActive: z.boolean().default(true),
        }))
        .mutation(async ({ input, ctx }) => {
          const webhook = await db.createWebhook(input);
          await db.createAuditLog({
            action: "create_webhook",
            entityType: "webhook",
            entityId: webhook.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return webhook;
        }),
      adminUpdate: adminProcedure
        .input(z.object({
          id: z.number(),
          updates: z.object({
            name: z.string().optional(),
            url: z.string().optional(),
            secret: z.string().optional(),
            isActive: z.boolean().optional(),
          }).partial(),
        }))
        .mutation(async ({ input, ctx }) => {
          const updated = await db.updateWebhook(input.id, input.updates);
          await db.createAuditLog({
            action: "update_webhook",
            entityType: "webhook",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),
  }),

  profiles: router({
    createOrUpdate: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        genres: z.array(z.string()).optional(),
        whatsappOptIn: z.boolean().default(false),
        aiMemoryEnabled: z.boolean().default(false),
      }))
      .mutation(({ input }) => db.createOrUpdateUserProfile({ ...input, genres: input.genres ? JSON.stringify(input.genres) : undefined })),
  }),

  // Site-wide search
  search: router({
    all: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().optional().default(20) }))
      .query(({ input }) => db.searchAll(input.query, input.limit)),
  }),

  // ============================================
  // PHASE 7: ADMIN FEATURE EXPANSION
  // ============================================

  // ============================================
  // HECTIC AI - Public booking chatbot
  // ============================================
  hectic: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(1000),
        sessionId: z.string().min(1).max(64),
        userId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { extractBookingData } = await import("./_core/hecticExtractor");
        const { buildHecticContext, shouldPromptSignup, HECTIC_SYSTEM_PROMPT } = await import("./_core/hecticPersona");
        const { aiProvider } = await import("./_core/aiProvider");

        // Load conversation
        let conversation = await db.query.hecticConversations.findFirst({
          where: (t) => t.sessionId.eq(input.sessionId),
        });

        if (!conversation) {
          // Create new conversation
          const [newConv] = await db.insert(db.schema.hecticConversations).values({
            sessionId: input.sessionId,
            userId: input.userId,
            channel: "web",
            status: "active",
            extractedData: null,
          }).returning();
          conversation = newConv;
        }

        // Load last 10 messages (cost control - context window)
        const previousMessages = await db.query.hecticMessages.findMany({
          where: (t) => t.conversationId.eq(conversation.id),
          orderBy: (t) => t.createdAt,
          limit: 10,
        });

        // Extract booking data
        const extracted = await extractBookingData(input.message, conversation.extractedData as any);

        // Fetch latest shop items (top 5 for token efficiency)
        const shopProducts = await db.listProducts(true);
        const shopItems = shopProducts.slice(0, 5).map((p) => ({
          name: p.name,
          type: p.type,
          price: p.price,
        }));

        // Build context
        const context = buildHecticContext(extracted, previousMessages.length + 1, shopItems);

        // Build messages for AI
        const systemPrompt = HECTIC_SYSTEM_PROMPT + context;
        const messages = [
          { role: "system", content: systemPrompt },
          ...previousMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          { role: "user", content: input.message },
        ];

        // Call AI with auto-provider selection (Gemini Flash by default, free tier)
        const response = await aiProvider.chat(input.message, "auto");
        if (!response.success) {
          throw new Error(`AI error: ${response.error}`);
        }

        // Persist messages
        await db.insert(db.schema.hecticMessages).values([
          {
            conversationId: conversation.id,
            role: "user",
            content: input.message,
            metadata: { extracted },
          },
          {
            conversationId: conversation.id,
            role: "assistant",
            content: response.text!,
            metadata: { provider: response.provider, model: response.model },
          },
        ]);

        // Update conversation extracted data + status
        let leadCaptured = conversation.leadCaptured || false;
        if (extracted.email && !conversation.leadCaptured) {
          leadCaptured = true;
          // Create lead record
          await db.insert(db.schema.hecticLeads).values({
            conversationId: conversation.id,
            name: extracted.name,
            email: extracted.email,
            phone: extracted.phone,
            organisation: extracted.organisation,
            intent: extracted.intent,
            eventType: extracted.eventType,
            eventDate: extracted.eventDate,
            location: extracted.location,
            budget: extracted.budget,
            status: "new",
          });
        }

        await db.update(db.schema.hecticConversations)
          .set({
            extractedData: extracted,
            leadCaptured,
            updatedAt: new Date(),
          })
          .where((t) => t.id.eq(conversation.id));

        const signupPromptCount = conversation.signupPromptCount || 0;
        const showSignupPrompt =
          shouldPromptSignup(previousMessages.length + 1, !!extracted.email, extracted.intent) &&
          signupPromptCount === 0;

        if (showSignupPrompt) {
          await db.update(db.schema.hecticConversations)
            .set({ signupPromptCount: signupPromptCount + 1 })
            .where((t) => t.id.eq(conversation.id));
        }

        return {
          response: response.text!,
          extractedData: extracted,
          shouldPromptSignup: showSignupPrompt,
          sessionId: input.sessionId,
          provider: response.provider,
        };
      }),

    history: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await db.query.hecticConversations.findFirst({
          where: (t) => t.sessionId.eq(input.sessionId),
        });

        if (!conversation) return [];

        return db.query.hecticMessages.findMany({
          where: (t) => t.conversationId.eq(conversation.id),
          orderBy: (t) => t.createdAt,
          limit: 30,
        });
      }),

    lead: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const conversation = await db.query.hecticConversations.findFirst({
          where: (t) => t.sessionId.eq(input.sessionId),
        });

        if (!conversation) return null;

        return db.query.hecticLeads.findFirst({
          where: (t) => t.conversationId.eq(conversation.id),
        });
      }),
  }),

  // ============================================
  // JARVIS - Admin AI assistant
  // ============================================
  jarvis: router({
    chat: adminProcedure
      .input(z.object({
        message: z.string().min(1).max(2000),
        sessionId: z.string(),
      }))
      .mutation(async ({ input }) => {
        // Load business data for rich context
        const recentBookings = await db.query.eventBookings.findMany({
          limit: 10,
          orderBy: (t) => t.createdAt,
        });

        const newLeads = await db.query.hecticLeads.findMany({
          where: (t) => t.status.eq("new"),
          limit: 20,
        });

        const contactedLeads = await db.query.hecticLeads.findMany({
          where: (t) => t.status.eq("contacted"),
          limit: 10,
        });

        // Analyze data for smarter context
        const topCities = Array.from(
          new Map(
            newLeads
              .filter((l) => l.location)
              .map((l) => [l.location, 1])
              .reduce((acc, [city, count]) => {
                acc.set(city, (acc.get(city) || 0) + 1);
                return acc;
              }, new Map())
          ).entries()
        )
          .sort(([, a], [, b]) => b - a)
          .map(([city]) => city)
          .slice(0, 5);

        // Build rich context
        const jarvisContext = buildJarvisContext({
          recentBookings: recentBookings.length,
          newLeads: newLeads.length,
          topCities,
          pendingFollowups: contactedLeads.length,
          eventTypeBreakdown: newLeads.reduce((acc, l) => {
            if (l.eventType) acc[l.eventType] = (acc[l.eventType] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        });

        const leadsSnapshot = newLeads
          .map((l) => `- ${l.name || "Unknown"} (${l.location || "N/A"}) - ${l.eventType || "unknown"} - Budget: ${l.budget || "TBD"}`)
          .join("\n");

        // Call Jarvis with full system prompt (use Groq if available for cost savings)
        const response = await aiProvider.chat(
          `${JARVIS_SYSTEM_PROMPT}\n\n${jarvisContext}\n\nRECENT LEADS:\n${leadsSnapshot}\n\nADMIN REQUEST:\n${input.message}`,
          process.env.GROQ_API_KEY ? "groq" : "gemini"
        );

        if (!response.success) {
          throw new Error(`Jarvis error: ${response.error}`);
        }

        return {
          response: response.text!,
          provider: response.provider,
          model: response.model,
        };
      }),

    insights: adminProcedure.query(async () => {
      return db.query.jarvisInsights.findMany({
        where: (t) => t.status.eq("active"),
        limit: 20,
        orderBy: (t) => t.priority,
      });
    }),

    leadsQueue: adminProcedure.query(async () => {
      return db.query.hecticLeads.findMany({
        where: (t) =>
          t.status.in(["new", "contacted"]),
        limit: 50,
        orderBy: (t) => t.createdAt,
      });
    }),

    generateSuggestions: adminProcedure.mutation(async () => {
      const leads = await db.query.hecticLeads.findMany({
        where: (t) =>
          t.status.eq("new"),
      });

      if (leads.length === 0) return { suggestions: 0 };

      // Group by location and event type
      const byCity = new Map<string, number>();
      const byType = new Map<string, number>();

      leads.forEach((lead) => {
        if (lead.location) byCity.set(lead.location, (byCity.get(lead.location) || 0) + 1);
        if (lead.eventType) byType.set(lead.eventType, (byType.get(lead.eventType) || 0) + 1);
      });

      // Create suggestions (simplified - in production would call venue API)
      const suggestions = Array.from(byCity.entries()).map(([city, count]) => ({
        type: "venue_suggestion",
        title: `${city} Opportunities`,
        content: `${count} new booking inquiries from ${city}. Consider outreach to clubs in this area.`,
        metadata: { city, inquiries: count, source: "hectic_leads" },
        status: "active",
        priority: count * 2,
      }));

      // Insert into jarvisInsights
      await db.insert(db.schema.jarvisInsights).values(suggestions as any);

      return { suggestions: suggestions.length };
    }),
  }),

  platformStream: router({
    getLiveStatuses: publicProcedure.query(async () => {
      return await db.getAllPlatformLiveStatuses();
    }),

    getSinglePlatform: publicProcedure
      .input(z.object({
        platform: z.enum(["youtube", "twitch", "tiktok", "instagram", "own_stream"]),
      }))
      .query(async ({ input }) => {
        return await db.getPlatformLiveStatus(input.platform);
      }),

    setManualLive: adminProcedure
      .input(z.object({
        platform: z.enum(["tiktok", "instagram"]),
        isLive: z.boolean(),
        streamUrl: z.string().optional(),
        streamTitle: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.setPlatformLiveStatus({
          platform: input.platform as any,
          isLive: input.isLive,
          streamUrl: input.streamUrl,
          streamTitle: input.streamTitle,
          manualOverride: true,
        });
      }),

    updateChannelConfig: adminProcedure
      .input(z.object({
        platform: z.enum(["youtube", "twitch"]),
        channelId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.updatePlatformChannelId(input.platform, input.channelId);
      }),

    getOBSConfig: adminProcedure
      .input(z.object({
        platform: z.enum(["youtube", "twitch"]),
      }))
      .query(async ({ input }) => {
        const config = {
          youtube: {
            rtmpUrl: "rtmps://a.rtmp.youtube.com/live2",
            streamKeyEnvVar: "YOUTUBE_RTMP_KEY",
          },
          twitch: {
            rtmpUrl: "rtmps://live-prg.twitch.tv/app",
            streamKeyEnvVar: "TWITCH_STREAM_KEY",
          },
        };
        return config[input.platform] || null;
      }),

    refreshStatus: adminProcedure
      .input(z.object({
        platform: z.enum(["youtube", "twitch"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { checkYouTubeLive, checkTwitchLive, checkSinglePlatform } = await import("./_core/platformLiveChecker");

        if (input?.platform) {
          return await checkSinglePlatform(input.platform as any);
        } else {
          // Check all platforms
          const { checkAllPlatforms } = await import("./_core/platformLiveChecker");
          await checkAllPlatforms();
          return { message: "All platforms checked" };
        }
      }),

    initializePlatforms: adminProcedure.mutation(async () => {
      await db.initDefaultPlatformStatuses();
      return { message: "Platform statuses initialized" };
    }),

    listLiveSessions: adminProcedure
      .input(z.object({
        showId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.listLiveSessions(input?.showId);
      }),

    getCurrentLiveSession: publicProcedure.query(async () => {
      return await db.getCurrentLiveSession();
    }),

    startSession: adminProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.startLiveSession(input.sessionId);
      }),

    endSession: adminProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.endLiveSession(input.sessionId);
      }),

    createCue: adminProcedure
      .input(z.object({
        liveSessionId: z.number(),
        type: z.enum(["playTrack", "readShout", "playConfession", "askQuestion", "adBreak", "topicIntro", "callToAction", "custom"]),
        payload: z.string().optional(),
        orderIndex: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        return await db.createCue({
          liveSessionId: input.liveSessionId,
          type: input.type as any,
          payload: input.payload,
          orderIndex: input.orderIndex,
          status: "pending",
        });
      }),

    listCues: publicProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.listCuesForSession(input.sessionId);
      }),

    updateCueStatus: adminProcedure
      .input(z.object({
        cueId: z.number(),
        status: z.enum(["pending", "done", "skipped"]),
      }))
      .mutation(async ({ input }) => {
        return await db.updateCueStatus(input.cueId, input.status);
      }),
  }),

});

export type AppRouter = typeof appRouter;

