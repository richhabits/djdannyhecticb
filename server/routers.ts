import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as analytics from "./_core/analytics";
import * as spotify from "./_core/spotify";
import * as youtube from "./_core/youtube";
import * as payments from "./_core/payments";

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

  analytics: router({
    track: publicProcedure
      .input(z.object({
        eventType: z.string(),
        eventName: z.string(),
        properties: z.record(z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await analytics.trackEvent({
          userId: ctx.user?.id,
          eventType: input.eventType,
          eventName: input.eventName,
          properties: input.properties,
        });
        return { success: true };
      }),
    trackPageView: publicProcedure
      .input(z.object({
        path: z.string(),
        referrer: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await analytics.trackPageView({
          userId: ctx.user?.id,
          ...input,
        });
        return { success: true };
      }),
    trackClick: publicProcedure
      .input(z.object({
        element: z.string(),
        elementId: z.string().optional(),
        elementText: z.string().optional(),
        path: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await analytics.trackClick({
          userId: ctx.user?.id,
          ...input,
        });
        return { success: true };
      }),
    summary: publicProcedure
      .input(z.object({ days: z.number().default(30) }).optional())
      .query(async ({ input }) => {
        return await analytics.getAnalyticsSummary(input?.days || 30);
      }),
  }),

  mixes: router({
    list: publicProcedure.query(() => db.getAllMixes()),
    free: publicProcedure.query(() => db.getFreeMixes()),
    download: publicProcedure
      .input(z.object({ mixId: z.number() }))
      .mutation(async ({ input }) => {
        const mixes = await db.getAllMixes();
        const mix = mixes.find((m) => m.id === input.mixId);
        if (!mix || !mix.audioUrl) {
          throw new Error("Mix not found or no audio URL");
        }

        // Generate presigned download URL if using S3
        try {
          const { storageGet } = await import("./storage");
          // Extract key from URL if it's an S3 path
          const url = new URL(mix.audioUrl);
          const key = url.pathname.replace(/^\//, "");
          const downloadInfo = await storageGet(key);
          return {
            downloadUrl: downloadInfo.url,
            expiresIn: 3600, // 1 hour
          };
        } catch {
          // If not S3, return original URL
          return {
            downloadUrl: mix.audioUrl,
            expiresIn: null,
          };
        }
      }),
  }),

  // Old bookings router removed - using new eventBookings system

  events: router({
    upcoming: publicProcedure.query(() => db.getUpcomingEvents()),
    featured: publicProcedure.query(() => db.getFeaturedEvents()),
    all: publicProcedure.query(() => db.getAllEvents()),
    bookings: router({
      list: publicProcedure
        .input(z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }).optional())
        .query(async ({ input }) => {
          const bookings = await db.listEventBookings();
          if (input?.startDate && input?.endDate) {
            const start = new Date(input.startDate);
            const end = new Date(input.endDate);
            return bookings.filter((b) => {
              const bookingStart = new Date(b.startTime);
              return bookingStart >= start && bookingStart <= end;
            });
          }
          return bookings;
        }),
      create: protectedProcedure
        .input(z.object({
          eventId: z.number().optional(),
          startTime: z.string(),
          endTime: z.string(),
          name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          message: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          return await db.createEventBooking({
            ...input,
            userId: ctx.user?.id,
            startTime: new Date(input.startTime),
            endTime: new Date(input.endTime),
            status: "pending",
          });
        }),
    }),
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
        // Serialize actual data from database
        const dbInstance = await db.getDb();
        const backupData = {
          timestamp: new Date().toISOString(),
          label: input.label,
          description: input.description,
          data: {
            shouts: await db.getAllShouts().catch(() => []),
            events: await db.getAllEvents().catch(() => []),
            bookings: await db.listEventBookings().catch(() => []),
            wallets: await db.listWallets(1000).catch(() => []),
            rewards: await db.listRewards().catch(() => []),
            redemptions: await db.listRedemptions({}, 1000).catch(() => []),
            streams: await db.listStreams().catch(() => []),
            shows: await db.getAllShows().catch(() => []),
            tracks: await db.getTrackHistory(100).catch(() => []),
            mixes: await db.getAllMixes().catch(() => []),
            podcasts: await db.getAllPodcasts().catch(() => []),
          },
        };
        // Add users if database is available
        if (dbInstance) {
          try {
            const { users } = await import("../drizzle/schema");
            backupData.data.users = await dbInstance.select().from(users).limit(1000).catch(() => []);
          } catch {
            backupData.data.users = [];
          }
        }
        const dataBlob = JSON.stringify(backupData);
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
            title: `New episode: ${episode.title}`,
            description: episode.description || "",
            targetPlatform: "multi",
            source: "episode",
            sourceId: episode.id,
            status: "draft",
            payload: JSON.stringify({
              caption: `New episode out now: ${episode.title}`,
              hashtags: ["hecticradio", "djdannyhecticb"],
            }),
          }));
          
          // Create clip item
          items.push(await db.createContentItem({
            type: "clip",
            title: `Best clip from: ${episode.title}`,
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

    spotify: router({
      search: publicProcedure
        .input(z.object({
          query: z.string().min(1),
          limit: z.number().min(1).max(50).default(20),
        }))
        .query(async ({ input }) => {
          return await spotify.searchSpotifyTracks(input.query, input.limit);
        }),
      track: publicProcedure
        .input(z.object({ trackId: z.string() }))
        .query(async ({ input }) => {
          return await spotify.getSpotifyTrack(input.trackId);
        }),
      playlist: publicProcedure
        .input(z.object({ playlistId: z.string() }))
        .query(async ({ input }) => {
          return await spotify.getSpotifyPlaylist(input.playlistId);
        }),
    }),

    youtube: router({
      search: publicProcedure
        .input(z.object({
          query: z.string().min(1),
          maxResults: z.number().min(1).max(50).default(20),
        }))
        .query(async ({ input }) => {
          return await youtube.searchYouTubeVideos(input.query, input.maxResults);
        }),
      video: publicProcedure
        .input(z.object({ videoId: z.string() }))
        .query(async ({ input }) => {
          return await youtube.getYouTubeVideo(input.videoId);
        }),
      playlist: publicProcedure
        .input(z.object({ playlistId: z.string() }))
        .query(async ({ input }) => {
          return await youtube.getYouTubePlaylist(input.playlistId);
        }),
    }),

    payments: router({
      createIntent: protectedProcedure
        .input(z.object({
          amount: z.number().min(1),
          currency: z.string().default("gbp"),
          description: z.string().optional(),
          metadata: z.record(z.string()).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          return await payments.createPaymentIntent({
            amount: input.amount,
            currency: input.currency,
            description: input.description,
            metadata: {
              ...input.metadata,
              userId: ctx.user?.id?.toString() || "",
            },
          });
        }),
      createCheckout: protectedProcedure
        .input(z.object({
          amount: z.number().min(1),
          currency: z.string().default("gbp"),
          successUrl: z.string(),
          cancelUrl: z.string(),
          description: z.string().optional(),
          metadata: z.record(z.string()).optional(),
        }))
        .mutation(async ({ input, ctx }) => {
          return await payments.createCheckoutSession({
            ...input,
            metadata: {
              ...input.metadata,
              userId: ctx.user?.id?.toString() || "",
            },
          });
        }),
      verify: publicProcedure
        .input(z.object({ paymentIntentId: z.string() }))
        .query(async ({ input }) => {
          return await payments.verifyPaymentIntent(input.paymentIntentId);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
