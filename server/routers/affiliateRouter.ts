/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Affiliate Program Router
 * - 15% subscriptions, 10% merch, 5% bookings, 20% donations
 * - Affiliate dashboard & link management
 * - Payout system with Stripe Connect
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  affiliates,
  affiliateLinks,
  affiliateClicks,
  affiliateConversions,
  affiliateEarnings,
  affiliatePayouts,
} from "../../drizzle/revenue-schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import crypto from "crypto";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Commission rates for different conversion types
 */
const COMMISSION_RATES = {
  subscription: 0.15, // 15%
  merchandise: 0.1, // 10%
  booking: 0.05, // 5%
  donation: 0.2, // 20%
  digital_product: 0.15, // 15%
};

/**
 * Generate unique affiliate code
 */
function generateAffiliateCode(): string {
  return `HECTIC${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export const affiliateRouter = router({
  /**
   * Apply to become an affiliate
   */
  applyToProgram: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        displayName: z.string().min(2).max(255),
        bio: z.string().max(1000).optional(),
        websiteUrl: z.string().url().optional(),
        socialProof: z.record(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Check if already an affiliate
        const existing = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.email, input.email))
          .limit(1);

        if (existing.length > 0) {
          throw new Error("Already applied for affiliate program");
        }

        const result = await db
          .insert(affiliates)
          .values({
            email: input.email,
            displayName: input.displayName,
            bio: input.bio,
            websiteUrl: input.websiteUrl,
            socialProof: input.socialProof,
            status: "pending",
            commissionRate: 0.15,
          })
          .returning();

        return {
          success: true,
          message: "Application submitted. We'll review it shortly!",
          affiliateId: result[0].id,
        };
      } catch (error) {
        console.error("[Affiliate] applyToProgram error:", error);
        throw new Error((error as any).message || "Failed to submit application");
      }
    }),

  /**
   * Get current user's affiliate profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }

      const profile = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user?.id || 0))
        .limit(1);

      return profile[0] || null;
    } catch (error) {
      console.error("[Affiliate] getProfile error:", error);
      return null;
    }
  }),

  /**
   * Generate affiliate link
   */
  generateLink: protectedProcedure
    .input(
      z.object({
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user?.id || 0))
          .limit(1);

        if (!affiliate[0]) {
          throw new Error("You are not approved as an affiliate");
        }

        if (affiliate[0].status !== "active" && affiliate[0].status !== "approved") {
          throw new Error("Your affiliate account is not active");
        }

        const code = generateAffiliateCode();
        const baseUrl = process.env.BASE_URL || "https://djdannyhectic.com";

        const link = await db
          .insert(affiliateLinks)
          .values({
            affiliateId: affiliate[0].id,
            code,
            label: input.label,
            url: `${baseUrl}?ref=${code}`,
          })
          .returning();

        return {
          success: true,
          link: link[0],
        };
      } catch (error) {
        console.error("[Affiliate] generateLink error:", error);
        throw new Error((error as any).message || "Failed to generate link");
      }
    }),

  /**
   * Get affiliate links
   */
  getLinks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user?.id || 0))
        .limit(1);

      if (!affiliate[0]) {
        return [];
      }

      const links = await db
        .select()
        .from(affiliateLinks)
        .where(eq(affiliateLinks.affiliateId, affiliate[0].id));

      return links;
    } catch (error) {
      console.error("[Affiliate] getLinks error:", error);
      return [];
    }
  }),

  /**
   * Track affiliate click
   */
  trackClick: publicProcedure
    .input(
      z.object({
        code: z.string(),
        referrerUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return { success: true };
        }

        const link = await db
          .select()
          .from(affiliateLinks)
          .where(eq(affiliateLinks.code, input.code))
          .limit(1);

        if (!link[0]) {
          return { success: false, message: "Invalid affiliate code" };
        }

        await db.insert(affiliateClicks).values({
          affiliateId: link[0].affiliateId,
          linkId: link[0].id,
          code: input.code,
          referrerUrl: input.referrerUrl,
          userAgent: "", // Would be set from request context
          ipHash: crypto.createHash("sha256").update("").digest("hex"),
        });

        return { success: true };
      } catch (error) {
        console.error("[Affiliate] trackClick error:", error);
        return { success: false };
      }
    }),

  /**
   * Record affiliate conversion
   */
  recordConversion: adminProcedure
    .input(
      z.object({
        code: z.string(),
        conversionType: z.enum(["subscription", "merchandise", "booking", "donation", "digital_product"]),
        referenceId: z.number(),
        amount: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const link = await db
          .select()
          .from(affiliateLinks)
          .where(eq(affiliateLinks.code, input.code))
          .limit(1);

        if (!link[0]) {
          throw new Error("Invalid affiliate code");
        }

        const rate = (COMMISSION_RATES as any)[input.conversionType] || 0.15;
        const commission = parseFloat(input.amount) * rate;

        const conversion = await db
          .insert(affiliateConversions)
          .values({
            affiliateId: link[0].affiliateId,
            code: input.code,
            conversionType: input.conversionType as any,
            referenceId: input.referenceId,
            amount: input.amount,
            commission: commission.toString(),
            status: "pending",
          })
          .returning();

        // Update affiliate total earnings
        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.id, link[0].affiliateId))
          .limit(1);

        if (affiliate[0]) {
          const newTotal =
            parseFloat(affiliate[0].totalEarnings?.toString() || "0") + commission;
          await db
            .update(affiliates)
            .set({ totalEarnings: newTotal.toString() })
            .where(eq(affiliates.id, affiliate[0].id));
        }

        return {
          success: true,
          conversion: conversion[0],
          commission,
        };
      } catch (error) {
        console.error("[Affiliate] recordConversion error:", error);
        throw new Error("Failed to record conversion");
      }
    }),

  /**
   * Get affiliate dashboard stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user?.id || 0))
        .limit(1);

      if (!affiliate[0]) {
        return null;
      }

      const clicks = await db
        .select()
        .from(affiliateClicks)
        .where(eq(affiliateClicks.affiliateId, affiliate[0].id));

      const conversions = await db
        .select()
        .from(affiliateConversions)
        .where(eq(affiliateConversions.affiliateId, affiliate[0].id));

      const earnings = await db
        .select()
        .from(affiliateEarnings)
        .where(eq(affiliateEarnings.affiliateId, affiliate[0].id));

      const totalCommission = conversions.reduce((sum, c) => sum + parseFloat(c.commission.toString()), 0);

      return {
        clicks: clicks.length,
        conversions: conversions.length,
        totalEarnings: affiliate[0].totalEarnings,
        totalPaid: affiliate[0].totalPaid,
        monthlyEarnings: earnings,
        conversionBreakdown: {
          subscriptions: conversions.filter((c) => c.conversionType === "subscription").length,
          merchandise: conversions.filter((c) => c.conversionType === "merchandise").length,
          bookings: conversions.filter((c) => c.conversionType === "booking").length,
          donations: conversions.filter((c) => c.conversionType === "donation").length,
        },
      };
    } catch (error) {
      console.error("[Affiliate] getStats error:", error);
      return null;
    }
  }),

  /**
   * Request payout
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user?.id || 0))
          .limit(1);

        if (!affiliate[0]) {
          throw new Error("No affiliate account found");
        }

        const requestAmount = parseFloat(input.amount);
        const availableFunds = parseFloat(affiliate[0].totalEarnings?.toString() || "0") - parseFloat(affiliate[0].totalPaid?.toString() || "0");

        if (requestAmount < 50) {
          throw new Error("Minimum payout is $50");
        }

        if (requestAmount > availableFunds) {
          throw new Error("Insufficient funds");
        }

        // Create payout
        const payout = await db
          .insert(affiliatePayouts)
          .values({
            affiliateId: affiliate[0].id,
            amount: input.amount,
            currency: "USD",
            status: "pending",
            requestedAt: new Date(),
          })
          .returning();

        return {
          success: true,
          payoutId: payout[0].id,
          message: "Payout request submitted",
        };
      } catch (error) {
        console.error("[Affiliate] requestPayout error:", error);
        throw new Error((error as any).message || "Failed to request payout");
      }
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user?.id || 0))
        .limit(1);

      if (!affiliate[0]) {
        return [];
      }

      const payouts = await db
        .select()
        .from(affiliatePayouts)
        .where(eq(affiliatePayouts.affiliateId, affiliate[0].id))
        .orderBy(desc(affiliatePayouts.createdAt));

      return payouts;
    } catch (error) {
      console.error("[Affiliate] getPayoutHistory error:", error);
      return [];
    }
  }),

  /**
   * Admin: Approve affiliate application
   */
  approveApplication: adminProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        commissionRate: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        await db
          .update(affiliates)
          .set({
            status: "active",
            approvedAt: new Date(),
            commissionRate: input.commissionRate || 0.15,
          })
          .where(eq(affiliates.id, input.affiliateId));

        return { success: true, message: "Affiliate approved" };
      } catch (error) {
        console.error("[Affiliate] approveApplication error:", error);
        throw new Error("Failed to approve application");
      }
    }),

  /**
   * Admin: Get all affiliate applications
   */
  getApplications: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const apps = await db
        .select()
        .from(affiliates)
        .orderBy(desc(affiliates.createdAt));

      return apps;
    } catch (error) {
      console.error("[Affiliate] getApplications error:", error);
      return [];
    }
  }),
});
