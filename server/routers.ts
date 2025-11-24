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
    create: adminProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      audioUrl: z.string(),
      coverImageUrl: z.string().optional(),
      duration: z.number().optional(),
      genre: z.string().optional(),
      isFree: z.boolean().default(true),
      downloadUrl: z.string().optional(),
    })).mutation(({ input }) => db.createMix(input)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteMix(input)),
  }),

  bookings: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserBookings(ctx.user.id)),
    adminList: adminProcedure.query(() => db.getAllBookings()),
    updateStatus: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    })).mutation(({ input }) => db.updateBookingStatus(input.id, input.status)),
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
    create: adminProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      eventDate: z.string().transform(str => new Date(str)), // Fix date parsing from client
      location: z.string(),
      imageUrl: z.string().optional(),
      ticketUrl: z.string().optional(),
      price: z.string().optional(),
      isFeatured: z.boolean().default(false),
    })).mutation(({ input }) => db.createEvent(input)),
    delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteEvent(input)),
  }),

  podcasts: router({
    list: publicProcedure.query(() => db.getAllPodcasts()),
  }),

  streaming: router({
    links: publicProcedure.query(() => db.getStreamingLinks()),
  }),

  analytics: router({
    log: publicProcedure.input(z.object({
      type: z.string(),
      entityId: z.number().optional(),
      metadata: z.any().optional(),
    })).mutation(({ input }) => db.logAnalyticsEvent(input)),
    summary: adminProcedure.query(() => db.getAnalyticsSummary()),
  }),
});

export type AppRouter = typeof appRouter;
