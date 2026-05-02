/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Premium Content & Features Router
 * - Paywall management
 * - Feature access control
 * - Digital product store
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  premiumContent,
  tierFeatures,
  digitalProducts,
  digitalPurchases,
  userSubscriptions,
} from "../../drizzle/revenue-schema";
import { eq, desc } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import crypto from "crypto";

const stripe = new Stripe(ENV.stripeSecretKey || "");

export const premiumRouter = router({
  /**
   * Get tier features mapping
   */
  getTierFeatures: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return {};
      }

      const features = await db.select().from(tierFeatures);

      const grouped: Record<string, any[]> = {};
      features.forEach((f) => {
        if (!grouped[f.tier]) {
          grouped[f.tier] = [];
        }
        grouped[f.tier].push({
          feature: f.feature,
          enabled: f.enabled,
          value: f.value,
        });
      });

      return grouped;
    } catch (error) {
      console.error("[Premium] getTierFeatures error:", error);
      return {};
    }
  }),

  /**
   * Check if user has feature access
   */
  hasAccess: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { hasAccess: false, requiredTier: null };
        }

        const subscription = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
          .limit(1);

        const userPlan = subscription[0]?.plan || "free";

        const feature = await db
          .select()
          .from(tierFeatures)
          .where(eq(tierFeatures.feature, input.feature as any))
          .limit(1);

        if (!feature[0]) {
          return { hasAccess: false, requiredTier: "premium" };
        }

        const tierHierarchy = ["free", "subscriber", "vip", "premium", "family"];
        const userTierIndex = tierHierarchy.indexOf(userPlan);
        const requiredTierIndex = tierHierarchy.indexOf(feature[0].tier);

        const hasAccess = userTierIndex >= requiredTierIndex && feature[0].enabled;

        return {
          hasAccess,
          requiredTier: feature[0].tier,
          currentTier: userPlan,
        };
      } catch (error) {
        console.error("[Premium] hasAccess error:", error);
        return { hasAccess: false, requiredTier: null };
      }
    }),

  /**
   * Get premium content
   */
  getPremiumContent: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return [];
        }

        let query = db.select().from(premiumContent);

        if (input.type) {
          query = query.where(eq(premiumContent.contentType, input.type)) as any;
        }

        const content = await query
          .orderBy(desc(premiumContent.releaseDate))
          .limit(input.limit)
          .offset(input.offset);

        return content;
      } catch (error) {
        console.error("[Premium] getPremiumContent error:", error);
        return [];
      }
    }),

  /**
   * Get content details
   */
  getContent: publicProcedure
    .input(z.object({ contentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return null;
        }

        const content = await db
          .select()
          .from(premiumContent)
          .where(eq(premiumContent.id, input.contentId))
          .limit(1);

        return content[0] || null;
      } catch (error) {
        console.error("[Premium] getContent error:", error);
        return null;
      }
    }),

  /**
   * Get digital products
   */
  getProducts: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return [];
        }

        let query = db.select().from(digitalProducts).where(eq(digitalProducts.isActive, true));

        if (input.type) {
          query = query.where(eq(digitalProducts.type, input.type as any)) as any;
        }

        const products = await query
          .orderBy(desc(digitalProducts.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        return products;
      } catch (error) {
        console.error("[Premium] getProducts error:", error);
        return [];
      }
    }),

  /**
   * Get product details
   */
  getProduct: publicProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return null;
        }

        const product = await db
          .select()
          .from(digitalProducts)
          .where(eq(digitalProducts.id, input.productId))
          .limit(1);

        return product[0] || null;
      } catch (error) {
        console.error("[Premium] getProduct error:", error);
        return null;
      }
    }),

  /**
   * Create payment intent for digital product
   */
  createProductPaymentIntent: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const product = await db
          .select()
          .from(digitalProducts)
          .where(eq(digitalProducts.id, input.productId))
          .limit(1);

        if (!product[0]) {
          throw new Error("Product not found");
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(product[0].price.toString()) * 100),
          currency: "usd",
          metadata: {
            userId: ctx.user?.id,
            productId: input.productId,
            type: "digital_product",
          },
        });

        return {
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        console.error("[Premium] createProductPaymentIntent error:", error);
        throw new Error("Failed to create payment intent");
      }
    }),

  /**
   * Confirm digital product purchase
   */
  confirmProductPurchase: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        productId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          throw new Error("Payment not confirmed");
        }

        const downloadToken = crypto.randomBytes(32).toString("hex");

        const purchase = await db
          .insert(digitalPurchases)
          .values({
            userId: ctx.user?.id,
            productId: input.productId,
            email: ctx.user?.email || "",
            amount: paymentIntent.amount_received / 100,
            currency: "USD",
            stripePaymentIntentId: paymentIntent.id,
            downloadToken,
            status: "completed",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          })
          .returning();

        return {
          success: true,
          purchaseId: purchase[0].id,
          downloadToken,
        };
      } catch (error) {
        console.error("[Premium] confirmProductPurchase error:", error);
        throw new Error("Failed to confirm purchase");
      }
    }),

  /**
   * Get user's digital purchases
   */
  getMyPurchases: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const purchases = await db
        .select()
        .from(digitalPurchases)
        .where(eq(digitalPurchases.userId, ctx.user?.id || 0))
        .orderBy(desc(digitalPurchases.createdAt));

      return purchases;
    } catch (error) {
      console.error("[Premium] getMyPurchases error:", error);
      return [];
    }
  }),

  /**
   * Download digital product
   */
  downloadProduct: publicProcedure
    .input(z.object({ downloadToken: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return null;
        }

        const purchase = await db
          .select()
          .from(digitalPurchases)
          .where(eq(digitalPurchases.downloadToken, input.downloadToken))
          .limit(1);

        if (!purchase[0]) {
          throw new Error("Invalid download token");
        }

        if (purchase[0].expiresAt && purchase[0].expiresAt < new Date()) {
          throw new Error("Download link expired");
        }

        const product = await db
          .select()
          .from(digitalProducts)
          .where(eq(digitalProducts.id, purchase[0].productId))
          .limit(1);

        if (!product[0] || !product[0].downloadUrl) {
          throw new Error("Product not available for download");
        }

        // Update download count
        await db
          .update(digitalPurchases)
          .set({
            downloadCount: (purchase[0].downloadCount || 0) + 1,
            lastDownloadedAt: new Date(),
          })
          .where(eq(digitalPurchases.id, purchase[0].id));

        return {
          success: true,
          downloadUrl: product[0].downloadUrl,
          productName: product[0].name,
        };
      } catch (error) {
        console.error("[Premium] downloadProduct error:", error);
        return null;
      }
    }),

  /**
   * Admin: Create premium content
   */
  createContent: adminProcedure
    .input(
      z.object({
        contentId: z.number(),
        contentType: z.string(),
        minimumTier: z.string(),
        title: z.string(),
        description: z.string().optional(),
        previewUrl: z.string().optional(),
        contentUrl: z.string(),
        releaseDate: z.string(),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const content = await db
          .insert(premiumContent)
          .values({
            contentId: input.contentId,
            contentType: input.contentType,
            minimumTier: input.minimumTier as any,
            title: input.title,
            description: input.description,
            previewUrl: input.previewUrl,
            contentUrl: input.contentUrl,
            releaseDate: new Date(input.releaseDate),
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          })
          .returning();

        return { success: true, contentId: content[0].id };
      } catch (error) {
        console.error("[Premium] createContent error:", error);
        throw new Error("Failed to create premium content");
      }
    }),

  /**
   * Admin: Create digital product
   */
  createProduct: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.string(),
        price: z.string(),
        downloadUrl: z.string(),
        previewUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        stock: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const product = await db
          .insert(digitalProducts)
          .values({
            name: input.name,
            description: input.description,
            type: input.type as any,
            price: input.price,
            currency: "USD",
            downloadUrl: input.downloadUrl,
            previewUrl: input.previewUrl,
            thumbnailUrl: input.thumbnailUrl,
            stock: input.stock,
            isActive: true,
          })
          .returning();

        return { success: true, productId: product[0].id };
      } catch (error) {
        console.error("[Premium] createProduct error:", error);
        throw new Error("Failed to create product");
      }
    }),
});
