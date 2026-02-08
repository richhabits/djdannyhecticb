/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */



/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { DANNY_PERSONA } from "./_core/dannyPersona";
import { generateRaveIntel } from "./_core/raveIntelGenerator";
import { IngestionEngine } from "./_core/ingestionEngine";
import { SecretsManager } from "./_core/secrets";
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
import { TRPCError } from "@trpc/server";
import { ukEventsRouter } from "./ukEventsRouter";

const authRouter = router({
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
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().optional(),
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
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      const isValid = await import("bcryptjs").then(b => b.default.compare(input.password, user.passwordHash!));
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      const { createSessionToken } = await import("./_core/adminAuth");
      const token = await createSessionToken(user.id, user.email || input.email, user.role);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return { success: true, role: user.role };
    }),
});

const usersRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.user),
  updateProfile: protectedProcedure
    .input(z.object({
      displayName: z.string().optional(),
      city: z.string().optional(),
      avatarUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // We'll update directly in the users table
      const { users: usersTable } = await import("../drizzle/schema");
      const { getDb } = await import("./db");
      const conn = await getDb();
      if (!conn) throw new Error("DB offline");
      await conn.update(usersTable).set(input).where(eq(usersTable.id, ctx.user.id));
      return { success: true };
    }),
});

const signalsRouter = router({
  save: protectedProcedure
    .input(z.object({
      entityType: z.enum(["intel", "mix", "clip", "event", "track", "podcast"]),
      entityId: z.string(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.saveSignal(ctx.user.id, input.entityType, input.entityId, input.metadata);
      return { success: true };
    }),
  list: protectedProcedure
    .input(z.object({
      entityType: z.enum(["intel", "mix", "clip", "event", "track", "podcast"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      return await db.getSavedSignals(ctx.user.id, input.entityType);
    }),
  trackInterest: protectedProcedure
    .input(z.object({
      category: z.string(),
      city: z.string().optional(),
      metricType: z.enum(["view", "save", "follow", "share"]),
      score: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      await db.recordSignalMetric(ctx.user.id, input.category, input.metricType, input.score, input.city);
      return { success: true };
    }),
  metrics: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getUserSignalMetrics(ctx.user.id);
    })
});

const lanesRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getCityLanes();
  })
});

const raveIntelRouter = router({
  list: publicProcedure
    .input(z.object({
      city: z.string().optional(),
      genre: z.string().optional()
    }).optional())
    .query(async ({ input, ctx }) => {
      // D1 Hardening: Pass supporter status if user is logged in
      return await generateRaveIntel({
        ...input,
        isSupporter: ctx.user?.isSupporter || false
      });
    })
});

const adminRouter = router({
  // Ingestion & Connectors
  ingestion: router({
    connectors: adminProcedure.query(async () => await db.getConnectors()),
    createConnector: adminProcedure
      .input(z.object({
        type: z.string(),
        name: z.string(),
        config: z.string(),
        isEnabled: z.boolean().default(true)
      }))
      .mutation(async ({ input }) => await db.createConnector(input)),
    setKey: adminProcedure
      .input(z.object({ connectorId: z.number(), keyName: z.string(), keyValue: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const connectors = await db.getConnectors();
        const conn = connectors.find(c => c.id === input.connectorId);
        if (!conn) throw new Error("Connector not found");

        const config = JSON.parse(conn.config || "{}");
        config[input.keyName] = SecretsManager.encrypt(input.keyValue);

        const dbConn = await db.getDb();
        if (!dbConn) return;

        const { connectors: table } = await import("../drizzle/schema");
        await dbConn.update(table).set({ config: JSON.stringify(config) }).where(eq(table.id, input.connectorId));

        await db.createGovernanceLog({
          actorId: ctx.user.id,
          actorType: "admin",
          action: "connector_key_update",
          reason: `Updated ${input.keyName} for ${conn.name}`,
          payload: JSON.stringify({ connectorId: input.connectorId, keyName: input.keyName })
        });

        return { success: true };
      }),
    syncLogs: adminProcedure
      .input(z.object({ connectorId: z.number().optional() }))
      .query(async ({ input }) => await db.getSyncLogs(input.connectorId)),
    runSync: adminProcedure.mutation(async () => {
      const isEnabled = await db.checkFeatureFlag("connector_sync_enabled");
      if (!isEnabled) throw new Error("Sync globally disabled by feature flag.");
      await IngestionEngine.syncAllLanes();
      return { success: true };
    }),
  }),

  // Supporters
  supporters: router({
    list: adminProcedure.query(async () => await db.getSupporters()),
    promote: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        await db.promoteToSupporter(input.userId, input.reason, ctx.user.id);
        return { success: true };
      }),
    demote: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const dbConn = await db.getDb();
        if (!dbConn) return;
        const { users: table } = await import("../drizzle/schema");
        await dbConn.update(table).set({ isSupporter: false }).where(eq(table.id, input.userId));
        await db.createGovernanceLog({
          actorId: ctx.user.id,
          actorType: "admin",
          action: "supporter_demote",
          userId: input.userId,
          reason: input.reason
        });
        return { success: true };
      })
  }),

  // Analytics
  analytics: router({
    heatmap: adminProcedure
      .input(z.object({
        days: z.number().default(7)
      }))
      .query(async ({ input }) => {
        const dbConn = await db.getDb();
        if (!dbConn) return [];
        const { laneDailyRollups: table } = await import("../drizzle/schema");
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - input.days);

        return await dbConn.select().from(table)
          .where(gt(table.day, fromDate))
          .orderBy(desc(table.day));
      })
  })
});

const mixesRouter = router({
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
      await createAuditLog({
        action: "create_mix",
        entityType: "mix",
        entityId: mix.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || "Admin",
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
      await db.createAuditLog({
        action: "update_mix",
        entityType: "mix",
        entityId: id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || "Admin",
      });
      return mix;
    }),
  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await db.deleteMix(input.id);
      await db.createAuditLog({
        action: "delete_mix",
        entityType: "mix",
        entityId: input.id,
        actorId: ctx.user?.id,
        actorName: ctx.user?.name || "Admin",
      });
      return { success: true };
    }),
});

const eventsRouter = router({
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
});

const podcastsRouter = router({
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
});

const invitesRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getInvitesByUser(ctx.user.id);
    }),
  create: protectedProcedure
    .input(z.object({ city: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const code = await db.createInvite(ctx.user.id, input.city);
      return { code };
    }),
  redeem: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const invite = await db.redeemInvite(input.code, ctx.user.id);
      return { success: true, targetCity: invite.targetCity };
    })
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  users: usersRouter,
  signals: signalsRouter,
  mixes: mixesRouter,
  events: eventsRouter,
  podcasts: podcastsRouter,
  invites: invitesRouter,
  lanes: lanesRouter,
  raveIntel: raveIntelRouter,
  admin: adminRouter,
  ukEvents: ukEventsRouter,
});

export type AppRouter = typeof appRouter;
