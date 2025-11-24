import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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

  mixes: router({
    list: publicProcedure.query(() => db.getAllMixes()),
    free: publicProcedure.query(() => db.getFreeMixes()),
  }),

  bookings: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserBookings(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        eventName: z.string(),
        eventDate: z.date(),
        eventLocation: z.string(),
        eventType: z.string(),
        guestCount: z.number().optional(),
        budget: z.string().optional(),
        description: z.string().optional(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createBooking({
        userId: ctx.user.id,
        ...input,
      })),
  }),

  events: router({
    upcoming: publicProcedure.query(() => db.getUpcomingEvents()),
    featured: publicProcedure.query(() => db.getFeaturedEvents()),
    all: publicProcedure.query(() => db.getAllEvents()),
  }),

  podcasts: router({
    list: publicProcedure.query(() => db.getAllPodcasts()),
  }),

  streaming: router({
    links: publicProcedure.query(() => db.getStreamingLinks()),
  }),

  calendar: router({
    checkAvailability: publicProcedure
      .input(z.object({ date: z.date() }))
      .query(({ input }) => db.checkDateAvailability(input.date)),
    
    getAvailableDates: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(({ input }) => db.getAvailableDates(input.startDate, input.endDate)),
    
    getAvailability: publicProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(({ input }) => db.getCalendarAvailability(input.startDate, input.endDate)),
    
    blockDate: adminProcedure
      .input(z.object({
        date: z.date(),
        reason: z.string().optional(),
        notes: z.string().optional(),
        bookingId: z.number().optional(),
      }))
      .mutation(({ input }) => db.createCalendarBlock({
        date: input.date,
        isAvailable: false,
        reason: input.reason || null,
        notes: input.notes || null,
        bookingId: input.bookingId || null,
      })),
  }),

  search: router({
    content: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
      }))
      .query(({ input }) => db.searchContent(input.query, input.limit)),
  }),

  analytics: router({
    track: publicProcedure
      .input(z.object({
        eventType: z.string(),
        eventCategory: z.string().optional(),
        eventLabel: z.string().optional(),
        pagePath: z.string().optional(),
        referrer: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userAgent = ctx.req.headers['user-agent'] || undefined;
        const referrer = input.referrer || ctx.req.headers.referer || undefined;
        const ipAddress = ctx.req.ip || ctx.req.socket.remoteAddress || undefined;
        
        await db.createAnalyticsEvent({
          userId: ctx.user?.id || null,
          eventType: input.eventType,
          eventCategory: input.eventCategory || null,
          eventLabel: input.eventLabel || null,
          pagePath: input.pagePath || null,
          referrer: referrer || null,
          userAgent: userAgent || null,
          ipAddress: ipAddress || null,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        });
        
        return { success: true };
      }),
    
    stats: protectedProcedure
      .input(z.object({
        startDate: z.date(),
        endDate: z.date(),
        userId: z.number().optional(),
      }))
      .query(({ ctx, input }) => {
        // Only allow users to see their own stats, or admins to see all
        const userId = ctx.user.role === 'admin' ? input.userId : ctx.user.id;
        return db.getAnalyticsStats(input.startDate, input.endDate, userId ?? undefined);
      }),
  }),
});

export type AppRouter = typeof appRouter;
