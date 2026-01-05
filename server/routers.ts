
/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { eq, desc, and, sql, gt } from "drizzle-orm";
// Only import schema tables that are actually used in this file
import {
  streams,
  shouts,
  shows,
  events,
} from "../drizzle/schema";
import { chatWithDanny } from "./lib/gemini";

export const appRouter = router({
  system: systemRouter,


  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Mixes
  getAllMixes: publicProcedure.query(() => db.getAllMixes()),
  getFreeMixes: publicProcedure.query(() => db.getFreeMixes()),
  getMixById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const mix = await db.getMixById(input.id);
      if (!mix || !mix.audioUrl) throw new Error("Mix not found");
      const key = mix.audioUrl.split("/").pop() || "";
      const { getPresignedDownloadUrl } = await import("./s3");
      return { url: await getPresignedDownloadUrl(key) };
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
      .input(z.string()) // simplified for now or match old schema
      .mutation(() => { throw new Error("Not implemented") }),
  }),

  // Old bookings router removed - using new eventBookings system

  // Events
  getAllEvents: publicProcedure.query(() => db.getAllEvents()),
  getFeaturedEvents: publicProcedure.query(() => db.getFeaturedEvents()),
  getUpcomingEvents: publicProcedure.query(() => db.getUpcomingEvents()),

  events: router({
    upcoming: publicProcedure.query(() => db.getUpcomingEvents()),
    featured: publicProcedure.query(() => db.getFeaturedEvents()),
    all: publicProcedure.query(() => db.getAllEvents()),
    // Admin routes for managing events
    adminList: adminProcedure.query(() => db.getAllEvents()),
    adminCreate: adminProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        eventDate: z.date(),
        location: z.string().min(1).max(255),
        imageUrl: z.string().url().optional(),
        ticketUrl: z.string().url().optional(),
        price: z.string().optional(),
        isFeatured: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const event = await db.createEvent(input);
        await db.createAuditLog({
          action: "create_event",
          entityType: "event",
          entityId: event.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return event;
      }),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        location: z.string().min(1).max(255).optional(),
        imageUrl: z.string().url().optional(),
        ticketUrl: z.string().url().optional(),
        price: z.string().optional(),
        isFeatured: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const event = await db.updateEvent(id, updates);
        await db.createAuditLog({
          action: "update_event",
          entityType: "event",
          entityId: id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return event;
      }),
    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEvent(input.id);
        await db.createAuditLog({
          action: "delete_event",
          entityType: "event",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
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

  // Shouts
  getAllShouts: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }).optional())
    .query(({ input }) => db.getApprovedShouts(input?.limit ?? 20)),

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
      .mutation(({ input }) => {
        // Convert genres array to JSON string
        const shoutData = {
          ...input,
          genres: input.genres ? JSON.stringify(input.genres) : undefined,
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

  // Streams
  getAllStreams: publicProcedure.query(() => db.listStreams()),
  getActiveStream: publicProcedure.query(() => db.getActiveStream()),

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

  // Danny Status
  getDannyStatus: publicProcedure.query(() => db.getDannyStatus()),

  danny: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(500),
        model: z.enum(["gemini-pro", "gemini-1.5-flash"]).optional().default("gemini-pro"), // Audit: Added "multiple" model support
      }))
      .mutation(async ({ input }) => {
        return { response: await chatWithDanny(input.message, input.model) };
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

  // Shows
  getAllShows: publicProcedure.query(() => db.listShows()),

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
        message: z.string().optional(),
        currentStep: z.string().optional(),
        collectedData: z.record(z.any()).optional(),
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
        eventType: z.enum(["club", "radio", "private", "brand", "other"]),
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
      .mutation(({ input }) => db.createEventBooking(input)),

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
  // ============================================
  // PHASE 5: REVENUE STACK (Flattened)
  // ============================================

  support: router({
    createPaymentIntent: publicProcedure
      .input(z.object({
        amount: z.string(),
        currency: z.string().default("GBP"),
        fanName: z.string().min(1).max(255),
        email: z.string().email().optional(),
        message: z.string().optional(),
        fanId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Parse amount (assuming format like "9.99" or "10.00")
        const amountStr = input.amount.replace(/[£$€,]/g, "");
        const amount = Math.round(parseFloat(amountStr) * 100); // Convert to pence/cents

        if (isNaN(amount) || amount <= 0) {
          throw new Error("Invalid amount");
        }

        try {
          console.log("[Support] Starting createPaymentIntent", { amount: input.amount, stringAmount: amountStr });
          const { createSupportPaymentIntent } = await import("./lib/payments");
          const result = await createSupportPaymentIntent({
            amount,
            currency: input.currency || "GBP",
            fanName: input.fanName,
            email: input.email,
            message: input.message,
            fanId: input.fanId || ctx.user?.id,
          });
          console.log("[Support] Success", result);
          await db.createAuditLog({
            action: "create_support_payment_intent",
            entityType: "support_event",
            entityId: result.supportEventId,
            actorId: ctx.user?.id,
            actorName: input.fanName,
            afterSnapshot: { paymentIntentId: result.paymentIntentId },
          });

          return result;
        } catch (error) {
          console.error("[Support] CRITICAL ERROR:", error);
          throw error;
        }
      }),
    create: publicProcedure
      .input(z.object({
        fanName: z.string().min(1).max(255),
        email: z.string().email().max(255).optional(),
        amount: z.string().min(1),
        currency: z.string().default("GBP"),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const event = await db.createSupportEvent(input);
        await db.createAuditLog({
          action: "create_support_event",
          entityType: "support_event",
          entityId: event.id,
          actorName: input.fanName,
          afterSnapshot: { amount: input.amount, currency: input.currency },
        });
        return event;
      }),
    list: adminProcedure.query(() => db.listSupportEvents()),
    total: adminProcedure
      .input(z.object({ currency: z.string().default("GBP") }))
      .query(({ input }) => db.getSupportEventTotal(input.currency)),
  }),

  products: router({
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["drop", "soundpack", "preset", "course", "bundle", "other"]),
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
          afterSnapshot: { name: input.name, type: input.type, price: input.price },
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
        updates: z.object({
          name: z.string().max(255).optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          isActive: z.boolean().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updated = await db.updateProduct(input.id, input.updates);
        await db.createAuditLog({
          action: "update_product",
          entityType: "product",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: input.updates,
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
          afterSnapshot: { deleted: true },
        });
      }),
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
          afterSnapshot: { productId: input.productId, paymentIntentId: result.paymentIntentId },
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
          afterSnapshot: { productId: input.productId, orderId: result.orderId },
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
          afterSnapshot: { status: input.status },
        });
        return updated;
      }),
  }),

  subscriptions: router({
    create: publicProcedure
      .input(z.object({
        fanName: z.string().min(1).max(255),
        email: z.string().email().max(255).optional(),
        tier: z.enum(["hectic_regular", "hectic_royalty", "inner_circle"]),
        amount: z.string().min(1),
        currency: z.string().default("GBP"),
        endAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ input }) => {
        const subscription = await db.createSubscription({
          ...input,
          endAt: input.endAt ? new Date(input.endAt) : undefined,
          status: "active",
        });
        await db.createAuditLog({
          action: "create_subscription",
          entityType: "subscription",
          entityId: subscription.id,
          actorName: input.fanName,
          afterSnapshot: { tier: input.tier, amount: input.amount },
        });
        return subscription;
      }),
    list: adminProcedure
      .input(z.object({ activeOnly: z.boolean().default(false) }))
      .query(({ input }) => db.listSubscriptions(input.activeOnly)),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        updates: z.object({
          status: z.enum(["active", "cancelled", "expired"]).optional(),
          endAt: z.string().optional(),
        }).partial(),
      }))
      .mutation(async ({ input, ctx }) => {
        const updates = { ...input.updates };
        if (updates.endAt) updates.endAt = new Date(updates.endAt) as any;
        const updated = await db.updateSubscription(input.id, updates);
        await db.createAuditLog({
          action: "update_subscription",
          entityType: "subscription",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
          afterSnapshot: input.updates,
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
          afterSnapshot: { name: input.name, slug: input.slug, type: input.type },
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
          afterSnapshot: input.updates,
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
          value: z.union([z.string(), z.record(z.any())]),
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
            afterSnapshot: { key: input.key, value: input.value },
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
          const updates = { ...input.updates };
          if (updates.endAt) updates.endAt = new Date(updates.endAt) as any;
          const updated = await db.updateIncidentBanner(input.id, updates);
          await db.createAuditLog({
            action: "update_incident_banner",
            entityType: "incident_banner",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return updated;
        }),
    }),
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - BACKUP & RECOVERY
  // ============================================
  backups: router({
    create: adminProcedure
      .input(z.object({
        label: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // TODO: Serialize actual data from database
        const dataBlob = JSON.stringify({ timestamp: new Date().toISOString(), label: input.label });
        const crypto = await import("crypto");
        const checksum = crypto.createHash("sha256").update(dataBlob).digest("hex");
        const backup = await db.createBackup({
          ...input,
          dataBlob,
          checksum,
          sizeBytes: dataBlob.length,
          createdBy: ctx.user?.id,
        });
        await db.createAuditLog({
          action: "create_backup",
          entityType: "backup",
          entityId: backup.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
        return backup;
      }),
    list: adminProcedure.query(() => db.listBackups()),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getBackup(input.id)),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteBackup(input.id);
        await db.createAuditLog({
          action: "delete_backup",
          entityType: "backup",
          entityId: input.id,
          actorId: ctx.user?.id,
          actorName: ctx.user?.name || "Admin",
        });
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
        payload: z.record(z.any()).optional(),
      }))
      .mutation(({ input }) => db.createNotification(input)),
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
          scopes: input.scopes,
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
            nowPlaying: null,
            nextShow: null,
            rules: "You're AI Danny, be helpful and hype!",
          };
          const response = await callListenerAI(input.message, context);

          const chat = await db.createAIDannyChat({
            sessionId: input.sessionId,
            profileId: input.profileId,
            message: input.message,
            response: response.response,
            context: context,
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
          avatarData: z.record(z.any()).optional(),
          positionX: z.string().default("0"),
          positionY: z.string().default("0"),
          positionZ: z.string().default("0"),
          rotation: z.string().default("0"),
          isOnline: z.boolean().default(true),
        }))
        .mutation(({ input }) => db.createOrUpdateWorldAvatar(input)),
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
          afterSnapshot: { type: input.type, location: input.location },
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
          afterSnapshot: input.updates,
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
          afterSnapshot: { title: input.title, type: input.type },
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
          links: z.record(z.string()).optional(),
          collabType: z.enum(["guest_mix", "co_host", "brand_drop", "takeover", "other"]),
          pitch: z.string().min(1),
        }))
        .mutation(({ input }) => db.createPartnerRequest(input)),
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
                email: req.email,
                links: req.links || "{}",
                type: "other", // Default, admin can update
                isActive: true,
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
        links: z.record(z.string()).optional(),
        type: z.enum(["venue", "clothing", "media", "dj", "creator", "other"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const partner = await db.createPartner(input);
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
          data: z.record(z.string()),
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
          const updated = await db.updatePromotion(input.id, input.updates);
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

  analytics: router({
    traffic: router({
      log: publicProcedure
        .input(z.object({
          route: z.string().optional(),
          utmSource: z.string().optional(),
          utmMedium: z.string().optional(),
          utmCampaign: z.string().optional(),
          referrer: z.string().optional(),
        }))
        .mutation(({ input, ctx }) => {
          return db.createTrafficEvent({
            ...input,
            userAgent: ctx.req.headers["user-agent"],
            ipAddress: ctx.req.ip || ctx.req.socket.remoteAddress,
          });
        }),
      stats: adminProcedure
        .input(z.object({ days: z.number().default(7) }))
        .query(({ input }) => db.getTrafficStats(input.days)),
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
          context: z.record(z.any()),
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
      .mutation(({ input }) => db.createOrUpdateUserProfile(input)),
  }),

  // ============================================
  // MARKETING HUB
  // ============================================
  marketing: router({
    // Marketing Leads
    leads: router({
      list: adminProcedure
        .input(
          z
            .object({
              status: z.string().optional(),
              type: z.string().optional(),
              location: z.string().optional(),
              assignedTo: z.number().optional(),
            })
            .optional()
        )
        .query(({ input }) => db.getAllMarketingLeads(input)),

      get: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getMarketingLeadById(input.id)),

      create: adminProcedure
        .input(
          z.object({
            name: z.string().min(1).max(255),
            type: z.enum(["club", "bar", "venue", "festival", "event", "radio", "other"]),
            location: z.string().min(1).max(255),
            address: z.string().optional(),
            email: z.string().email().max(320).optional(),
            phone: z.string().max(20).optional(),
            website: z.string().url().max(512).optional(),
            socialMedia: z.string().optional(), // JSON string
            capacity: z.number().optional(),
            genre: z.string().max(255).optional(),
            notes: z.string().optional(),
            status: z.enum(["new", "contacted", "interested", "quoted", "booked", "declined", "archived"]).optional(),
            source: z.string().max(255).optional(),
            assignedTo: z.number().optional(),
            nextFollowUp: z.date().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const lead = await db.createMarketingLead({
            ...input,
            socialMedia: input.socialMedia || undefined,
          });
          await db.createAuditLog({
            action: "create_marketing_lead",
            entityType: "marketing_lead",
            entityId: lead.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return lead;
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).max(255).optional(),
            type: z.enum(["club", "bar", "venue", "festival", "event", "radio", "other"]).optional(),
            location: z.string().min(1).max(255).optional(),
            address: z.string().optional(),
            email: z.string().email().max(320).optional(),
            phone: z.string().max(20).optional(),
            website: z.string().url().max(512).optional(),
            socialMedia: z.string().optional(),
            capacity: z.number().optional(),
            genre: z.string().max(255).optional(),
            notes: z.string().optional(),
            status: z.enum(["new", "contacted", "interested", "quoted", "booked", "declined", "archived"]).optional(),
            assignedTo: z.number().optional(),
            lastContacted: z.date().optional(),
            nextFollowUp: z.date().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const { id, ...updates } = input;
          const lead = await db.updateMarketingLead(id, updates);
          await db.createAuditLog({
            action: "update_marketing_lead",
            entityType: "marketing_lead",
            entityId: id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return lead;
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.deleteMarketingLead(input.id);
          await db.createAuditLog({
            action: "delete_marketing_lead",
            entityType: "marketing_lead",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true };
        }),
    }),

    // Marketing Campaigns
    campaigns: router({
      list: adminProcedure
        .input(
          z
            .object({
              status: z.string().optional(),
              type: z.string().optional(),
            })
            .optional()
        )
        .query(({ input }) => db.getAllMarketingCampaigns(input)),

      get: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getMarketingCampaignById(input.id)),

      create: adminProcedure
        .input(
          z.object({
            name: z.string().min(1).max(255),
            description: z.string().optional(),
            type: z.enum(["outreach", "social", "email", "advertising", "partnership", "other"]),
            targetAudience: z.string().optional(), // JSON string
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            budget: z.string().optional(),
            status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const campaign = await db.createMarketingCampaign({
            ...input,
            targetAudience: input.targetAudience || undefined,
            createdBy: ctx.user?.id || 0,
          });
          await db.createAuditLog({
            action: "create_marketing_campaign",
            entityType: "marketing_campaign",
            entityId: campaign.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return campaign;
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).max(255).optional(),
            description: z.string().optional(),
            type: z.enum(["outreach", "social", "email", "advertising", "partnership", "other"]).optional(),
            targetAudience: z.string().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
            budget: z.string().optional(),
            status: z.enum(["draft", "active", "paused", "completed", "cancelled"]).optional(),
            metrics: z.string().optional(), // JSON string
          })
        )
        .mutation(async ({ input, ctx }) => {
          const { id, ...updates } = input;
          const campaign = await db.updateMarketingCampaign(id, updates);
          await db.createAuditLog({
            action: "update_marketing_campaign",
            entityType: "marketing_campaign",
            entityId: id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return campaign;
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.deleteMarketingCampaign(input.id);
          await db.createAuditLog({
            action: "delete_marketing_campaign",
            entityType: "marketing_campaign",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true };
        }),
    }),

    // Outreach Activities
    outreach: router({
      listByLead: adminProcedure
        .input(z.object({ leadId: z.number() }))
        .query(({ input }) => db.getOutreachActivitiesByLeadId(input.leadId)),

      create: adminProcedure
        .input(
          z.object({
            leadId: z.number(),
            campaignId: z.number().optional(),
            type: z.enum(["email", "phone", "social", "in_person", "other"]),
            subject: z.string().max(255).optional(),
            message: z.string().optional(),
            response: z.string().optional(),
            status: z.enum(["sent", "delivered", "opened", "replied", "bounced", "failed"]).optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const activity = await db.createOutreachActivity({
            ...input,
            performedBy: ctx.user?.id || 0,
            performedAt: new Date(),
          });

          // Update lead's lastContacted
          await db.updateMarketingLead(input.leadId, {
            lastContacted: new Date(),
          });

          await db.createAuditLog({
            action: "create_outreach_activity",
            entityType: "outreach_activity",
            entityId: activity.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return activity;
        }),
    }),

    // Social Media Posts
    socialPosts: router({
      list: adminProcedure
        .input(
          z
            .object({
              platform: z.string().optional(),
              status: z.string().optional(),
              createdBy: z.number().optional(),
            })
            .optional()
        )
        .query(({ input }) => db.getAllSocialMediaPosts(input)),

      get: adminProcedure
        .input(z.object({ id: z.number() }))
        .query(({ input }) => db.getSocialMediaPostById(input.id)),

      create: adminProcedure
        .input(
          z.object({
            contentQueueId: z.number().optional(),
            platform: z.enum(["instagram", "tiktok", "youtube", "twitter", "facebook", "linkedin", "threads", "other"]),
            type: z.enum(["post", "story", "reel", "video", "carousel", "live", "other"]),
            caption: z.string().optional(),
            mediaUrls: z.string().optional(), // JSON array
            hashtags: z.string().optional(), // JSON array or comma-separated
            mentions: z.string().optional(), // JSON array
            location: z.string().max(255).optional(),
            status: z.enum(["draft", "scheduled", "posted", "failed", "archived"]).optional(),
            scheduledAt: z.date().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const post = await db.createSocialMediaPost({
            ...input,
            mediaUrls: input.mediaUrls || undefined,
            hashtags: input.hashtags || undefined,
            mentions: input.mentions || undefined,
            createdBy: ctx.user?.id || 0,
          });
          await db.createAuditLog({
            action: "create_social_media_post",
            entityType: "social_media_post",
            entityId: post.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return post;
        }),

      update: adminProcedure
        .input(
          z.object({
            id: z.number(),
            platform: z.enum(["instagram", "tiktok", "youtube", "twitter", "facebook", "linkedin", "threads", "other"]).optional(),
            type: z.enum(["post", "story", "reel", "video", "carousel", "live", "other"]).optional(),
            caption: z.string().optional(),
            mediaUrls: z.string().optional(),
            hashtags: z.string().optional(),
            mentions: z.string().optional(),
            location: z.string().max(255).optional(),
            status: z.enum(["draft", "scheduled", "posted", "failed", "archived"]).optional(),
            scheduledAt: z.date().optional(),
            metrics: z.string().optional(), // JSON string
          })
        )
        .mutation(async ({ input, ctx }) => {
          const { id, ...updates } = input;
          const post = await db.updateSocialMediaPost(id, updates);
          await db.createAuditLog({
            action: "update_social_media_post",
            entityType: "social_media_post",
            entityId: id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return post;
        }),

      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
          await db.deleteSocialMediaPost(input.id);
          await db.createAuditLog({
            action: "delete_social_media_post",
            entityType: "social_media_post",
            entityId: input.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return { success: true };
        }),
    }),

    // Venue Scraper
    scraper: router({
      search: adminProcedure
        .input(
          z.object({
            query: z.string().min(1),
            location: z.string().optional(),
            radius: z.number().optional(),
            type: z.enum(["club", "bar", "venue", "festival"]).optional(),
            source: z.enum(["google", "manual"]).default("google"),
          })
        )
        .mutation(async ({ input }) => {
          const { searchAndSaveVenues } = await import("./lib/venueScraper");
          const { query, location, type, source } = input;
          const searchQuery = type ? `${type} ${query}` : query;
          const result = await searchAndSaveVenues(
            {
              query: searchQuery,
              location,
              type,
            },
            source
          );
          return result;
        }),

      listResults: adminProcedure
        .input(
          z
            .object({
              processed: z.boolean().optional(),
              convertedToLead: z.boolean().optional(),
            })
            .optional()
        )
        .query(({ input }) => db.getAllVenueScraperResults(input)),

      convertToLead: adminProcedure
        .input(
          z.object({
            scraperResultId: z.number(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            notes: z.string().optional(),
            assignedTo: z.number().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          const { convertVenueToLead } = await import("./lib/venueScraper");
          const lead = await convertVenueToLead(input.scraperResultId, {
            email: input.email,
            phone: input.phone,
            notes: input.notes,
            assignedTo: input.assignedTo,
          });
          await db.createAuditLog({
            action: "convert_scraper_to_lead",
            entityType: "marketing_lead",
            entityId: lead.id,
            actorId: ctx.user?.id,
            actorName: ctx.user?.name || "Admin",
          });
          return lead;
        }),
    }),
  }),

  // Site-wide search
  search: router({
    all: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().optional().default(20) }))
      .query(({ input }) => db.searchAll(input.query, input.limit)),
  }),

  // ============================================
  // USER FAVORITES / WISHLIST
  // ============================================
  favorites: router({
    add: protectedProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const favorite = await db.addToFavorites(ctx.user!.id, input.entityType, input.entityId);
        return favorite;
      }),
    remove: protectedProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.removeFromFavorites(ctx.user!.id, input.entityType, input.entityId);
        return { success: true };
      }),
    list: protectedProcedure
      .input(z.object({ entityType: z.enum(["mix", "track", "event", "podcast"]).optional() }))
      .query(({ input, ctx }) => db.getUserFavorites(ctx.user!.id, input.entityType)),
    isFavorited: protectedProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
      }))
      .query(({ input, ctx }) => db.isFavorited(ctx.user!.id, input.entityType, input.entityId)),
  }),

  // ============================================
  // USER PLAYLISTS
  // ============================================
  playlists: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await db.createPlaylist(ctx.user!.id, input.name, input.description, input.isPublic);
        return playlist;
      }),
    list: protectedProcedure.query(({ ctx }) => db.getUserPlaylists(ctx.user!.id)),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPlaylistById(input.id)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const playlist = await db.getPlaylistById(id);
        if (!playlist || playlist.userId !== ctx.user!.id) {
          throw new Error("Playlist not found or access denied");
        }
        return await db.updatePlaylist(id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await db.getPlaylistById(input.id);
        if (!playlist || playlist.userId !== ctx.user!.id) {
          throw new Error("Playlist not found or access denied");
        }
        await db.deletePlaylist(input.id);
        return { success: true };
      }),
    addItem: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await db.getPlaylistById(input.playlistId);
        if (!playlist || playlist.userId !== ctx.user!.id) {
          throw new Error("Playlist not found or access denied");
        }
        return await db.addToPlaylist(input.playlistId, input.entityType, input.entityId);
      }),
    removeItem: protectedProcedure
      .input(z.object({
        playlistId: z.number(),
        itemId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const playlist = await db.getPlaylistById(input.playlistId);
        if (!playlist || playlist.userId !== ctx.user!.id) {
          throw new Error("Playlist not found or access denied");
        }
        await db.removeFromPlaylist(input.playlistId, input.itemId);
        return { success: true };
      }),
    getItems: protectedProcedure
      .input(z.object({ playlistId: z.number() }))
      .query(({ input }) => db.getPlaylistItems(input.playlistId)),
  }),

  // ============================================
  // TRACK ID REQUESTS
  // ============================================
  trackIdRequests: router({
    create: publicProcedure
      .input(z.object({
        userId: z.number().optional(),
        userName: z.string().optional(),
        email: z.string().email().optional(),
        trackDescription: z.string().min(1),
        audioUrl: z.string().url().optional(),
        timestamp: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(({ input }) => db.createTrackIdRequest(input)),
    list: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(({ input, ctx }) => db.getTrackIdRequests({ ...input, userId: ctx.user?.id })),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTrackIdRequestById(input.id)),
    adminList: adminProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(({ input }) => db.getTrackIdRequests(input)),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "identified", "not_found", "archived"]).optional(),
        identifiedTrack: z.string().optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updateTrackIdRequest(id, updates);
      }),
  }),

  // ============================================
  // SOCIAL SHARING ANALYTICS
  // ============================================
  socialShares: router({
    record: publicProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast", "video", "blog"]),
        entityId: z.number(),
        platform: z.enum(["facebook", "twitter", "instagram", "tiktok", "youtube", "linkedin", "whatsapp", "other"]),
        userId: z.number().optional(),
        shareUrl: z.string().url().optional(),
      }))
      .mutation(({ input }) => db.recordSocialShare(input)),
    getStats: publicProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast", "video", "blog"]),
        entityId: z.number(),
      }))
      .query(({ input }) => db.getShareStats(input.entityType, input.entityId)),
    list: adminProcedure
      .input(z.object({
        entityType: z.string().optional(),
        entityId: z.number().optional(),
        platform: z.string().optional(),
        userId: z.number().optional(),
      }).optional())
      .query(({ input }) => db.getSocialShares(input)),
  }),

  // ============================================
  // VIDEO TESTIMONIALS
  // ============================================
  videoTestimonials: router({
    list: publicProcedure
      .input(z.object({ isApproved: z.boolean().optional(), isFeatured: z.boolean().optional() }).optional())
      .query(({ input }) => db.getVideoTestimonials(input)),
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getVideoTestimonialById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        role: z.string().max(255).optional(),
        event: z.string().max(255).optional(),
        videoUrl: z.string().url().min(1),
        thumbnailUrl: z.string().url().optional(),
        transcript: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }))
      .mutation(({ input }) => db.createVideoTestimonial({ ...input, isApproved: false, isFeatured: false })),
    adminList: adminProcedure.query(() => db.getVideoTestimonials()),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        isApproved: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        transcript: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updateVideoTestimonial(id, updates);
      }),
    adminDelete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        db.deleteVideoTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // SOCIAL PROOF NOTIFICATIONS
  // ============================================
  socialProof: router({
    getActive: publicProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(({ input }) => db.getActiveSocialProofNotifications(input.limit)),
    create: adminProcedure
      .input(z.object({
        type: z.enum(["booking", "purchase", "favorite", "share", "comment", "view"]),
        entityType: z.enum(["mix", "track", "event", "podcast", "product", "booking"]),
        entityId: z.number(),
        message: z.string().max(255).optional(),
        userId: z.number().optional(),
        userName: z.string().max(255).optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(({ input }) => db.createSocialProofNotification(input)),
    expire: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => {
        db.expireSocialProofNotification(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // SOCIAL MEDIA FEED INTEGRATION
  // ============================================
  socialFeed: router({
    list: publicProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "youtube", "twitter", "facebook"]).optional(),
        limit: z.number().optional().default(20),
      }))
      .query(({ input }) => db.getSocialMediaFeedPosts({ ...input, isActive: true })),
    adminCreate: adminProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "youtube", "twitter", "facebook"]),
        postId: z.string().min(1).max(255),
        url: z.string().url(),
        mediaUrl: z.string().url().optional(),
        thumbnailUrl: z.string().url().optional(),
        caption: z.string().optional(),
        author: z.string().max(255).optional(),
        authorAvatar: z.string().url().optional(),
        likes: z.number().default(0),
        comments: z.number().default(0),
        shares: z.number().default(0),
        postedAt: z.date(),
      }))
      .mutation(({ input }) => db.createSocialMediaFeedPost(input)),
    adminUpdate: adminProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
        shares: z.number().optional(),
      }))
      .mutation(({ input }) => {
        const { id, ...updates } = input;
        return db.updateSocialMediaFeedPost(id, updates);
      }),
  }),

  // ============================================
  // MUSIC DISCOVERY / RECOMMENDATIONS
  // ============================================
  recommendations: router({
    forUser: protectedProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(({ input, ctx }) => db.getMusicRecommendations(ctx.user!.id, input.limit)),
    forEntity: publicProcedure
      .input(z.object({
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
        limit: z.number().optional().default(5),
      }))
      .query(({ input }) => db.getRecommendationsForEntity(input.entityType, input.entityId, input.limit)),
    create: adminProcedure
      .input(z.object({
        userId: z.number().optional(),
        entityType: z.enum(["mix", "track", "event", "podcast"]),
        entityId: z.number(),
        score: z.number().min(0).max(1),
        reason: z.string().optional(),
        algorithm: z.string().max(100).optional(),
      }))
      .mutation(({ input }) => db.createMusicRecommendation(input)),
  }),
});

export type AppRouter = typeof appRouter;
