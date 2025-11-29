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

  // Old bookings router removed - using new eventBookings system

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
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
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

  trackRequests: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
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
      .mutation(({ input }) => db.createTrack(input)),
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
  }),

  // ============================================
  // PHASE 5: EMPIRE MODE - REVENUE STACK
  // ============================================
  revenue: router({
    support: router({
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
          });
        }),
    }),

    purchases: router({
      create: publicProcedure
        .input(z.object({
          fanName: z.string().min(1).max(255),
          email: z.string().email().max(255).optional(),
          productId: z.number(),
          amount: z.string().min(1),
          currency: z.string().default("GBP"),
        }))
        .mutation(async ({ input }) => {
          const product = await db.getProduct(input.productId);
          if (!product) throw new Error("Product not found");
          const purchase = await db.createPurchase({ ...input, status: "pending" });
          await db.createAuditLog({
            action: "create_purchase",
            entityType: "purchase",
            entityId: purchase.id,
            actorName: input.fanName,
            afterSnapshot: { productId: input.productId, amount: input.amount },
          });
          return purchase;
        }),
      list: adminProcedure.query(() => db.listPurchases()),
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
});

export type AppRouter = typeof appRouter;
