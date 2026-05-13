/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Sponsorship Router
 * - Bronze ($1K), Silver ($5K), Gold ($10K), Platinum ($25K)
 * - Sponsorship tracking & metrics
 * - ROI reporting
 */

import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sponsorships, sponsorshipMetrics } from "../../drizzle/revenue-schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Sponsorship tier configurations
 */
const SPONSORSHIP_TIERS = {
  bronze: {
    name: "Bronze",
    monthlyAmount: "1000",
    features: ["Logo on website", "Social media mention monthly"],
  },
  silver: {
    name: "Silver",
    monthlyAmount: "5000",
    features: ["Logo on website", "Mention in streams", "Monthly newsletter feature"],
  },
  gold: {
    name: "Gold",
    monthlyAmount: "10000",
    features: ["Premium placement", "Custom integration", "Weekly mentions"],
  },
  platinum: {
    name: "Platinum",
    monthlyAmount: "25000",
    features: ["Exclusive partnership", "Co-branded content", "Daily mentions", "Custom collaboration"],
  },
};

export const sponsorshipRouter = router({
  /**
   * Get sponsorship packages
   */
  getPackages: publicProcedure.query(async ({ ctx }) => {
    return Object.entries(SPONSORSHIP_TIERS).map(([tier, data]) => ({
      tier,
      ...data,
    }));
  }),

  /**
   * Get active sponsorships
   */
  getActiveSponsorships: publicProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return [];
      }

      const now = new Date();
      const active = await ctx.db.select()
        .from(sponsorships)
        .where(
          and(
            eq(sponsorships.status, "active"),
            lte(sponsorships.startDate, now),
            gte(sponsorships.endDate, now)
          )
        )
        .orderBy(desc(sponsorships.monthlyAmount));

      return active;
    } catch (error) {
      console.error("[Sponsorship] getActiveSponsorships error:", error);
      return [];
    }
  }),

  /**
   * Get all sponsorships (admin)
   */
  getAllSponsorships: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return [];
      }

      const all = await ctx.db.select().from(sponsorships).orderBy(desc(sponsorships.createdAt));

      return all;
    } catch (error) {
      console.error("[Sponsorship] getAllSponsorships error:", error);
      return [];
    }
  }),

  /**
   * Create sponsorship deal
   */
  createDeal: adminProcedure
    .input(
      z.object({
        brandName: z.string().min(2).max(255),
        tier: z.enum(["bronze", "silver", "gold", "platinum"]),
        monthlyAmount: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        logoUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        contactEmail: z.string().email().optional(),
        termsAndConditions: z.string().optional(),
        specialRequirements: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          throw new Error("Database not available");
        }

        const deal = await ctx.db.insert(sponsorships)
          .values({
            brandName: input.brandName,
            tier: input.tier as any,
            monthlyAmount: input.monthlyAmount,
            currency: "USD",
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            status: "pending",
            logoUrl: input.logoUrl,
            websiteUrl: input.websiteUrl,
            contactEmail: input.contactEmail,
            termsAndConditions: input.termsAndConditions,
            specialRequirements: input.specialRequirements,
          })
          .returning();

        return {
          success: true,
          dealId: deal[0].id,
          message: `Sponsorship deal created for ${input.brandName}`,
        };
      } catch (error) {
        console.error("[Sponsorship] createDeal error:", error);
        throw new Error("Failed to create sponsorship deal");
      }
    }),

  /**
   * Activate sponsorship
   */
  activate: adminProcedure
    .input(z.object({ sponsorshipId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          throw new Error("Database not available");
        }

        await ctx.db.update(sponsorships)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(sponsorships.id, input.sponsorshipId));

        return { success: true, message: "Sponsorship activated" };
      } catch (error) {
        console.error("[Sponsorship] activate error:", error);
        throw new Error("Failed to activate sponsorship");
      }
    }),

  /**
   * Track sponsorship metrics
   */
  trackMetric: adminProcedure
    .input(
      z.object({
        sponsorshipId: z.number(),
        impressions: z.number().optional(),
        clicks: z.number().optional(),
        conversions: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          throw new Error("Database not available");
        }

        const metric = await ctx.db.insert(sponsorshipMetrics)
          .values({
            sponsorshipId: input.sponsorshipId,
            date: new Date(),
            impressions: input.impressions || 0,
            clicks: input.clicks || 0,
            conversions: input.conversions || 0,
            engagement: 0,
          })
          .returning();

        return { success: true, metricId: metric[0].id };
      } catch (error) {
        console.error("[Sponsorship] trackMetric error:", error);
        throw new Error("Failed to track metric");
      }
    }),

  /**
   * Get sponsorship metrics & ROI
   */
  getMetrics: adminProcedure
    .input(
      z.object({
        sponsorshipId: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          return null;
        }

        const sponsorship = await ctx.db.select()
          .from(sponsorships)
          .where(eq(sponsorships.id, input.sponsorshipId))
          .limit(1);

        if (!sponsorship[0]) {
          throw new Error("Sponsorship not found");
        }

        let query = ctx.db.select()
          .from(sponsorshipMetrics)
          .where(eq(sponsorshipMetrics.sponsorshipId, input.sponsorshipId));

        if (input.startDate) {
          query = query.where(
            gte(
              sponsorshipMetrics.date,
              new Date(input.startDate)
            ) as any
          );
        }

        if (input.endDate) {
          query = query.where(
            lte(sponsorshipMetrics.date, new Date(input.endDate)) as any
          );
        }

        const metrics = await query;

        const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
        const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
        const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);

        const duration = sponsorship[0].endDate.getTime() - sponsorship[0].startDate.getTime();
        const months = Math.ceil(duration / (30 * 24 * 60 * 60 * 1000));
        const totalSpent = parseFloat(sponsorship[0].monthlyAmount.toString()) * months;

        const roi = totalConversions > 0 ? ((totalConversions * 100) / totalSpent) * 100 : 0;

        return {
          sponsorship: sponsorship[0],
          metrics: {
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
            conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0,
            roi,
            costPerClick: totalClicks > 0 ? totalSpent / totalClicks : 0,
            costPerConversion: totalConversions > 0 ? totalSpent / totalConversions : 0,
          },
        };
      } catch (error) {
        console.error("[Sponsorship] getMetrics error:", error);
        return null;
      }
    }),

  /**
   * Get sponsorship revenue stats
   */
  getRevenueStats: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const all = await ctx.db.select().from(sponsorships);

      const active = all.filter((s) => s.status === "active");
      const totalMonthlyRevenue = active.reduce((sum, s) => sum + parseFloat(s.monthlyAmount.toString()), 0);

      return {
        totalSponsorships: all.length,
        activeSponsorships: active.length,
        monthlyRevenue: totalMonthlyRevenue,
        annualRevenue: totalMonthlyRevenue * 12,
        byTier: {
          bronze: active.filter((s) => s.tier === "bronze").length,
          silver: active.filter((s) => s.tier === "silver").length,
          gold: active.filter((s) => s.tier === "gold").length,
          platinum: active.filter((s) => s.tier === "platinum").length,
        },
      };
    } catch (error) {
      console.error("[Sponsorship] getRevenueStats error:", error);
      return null;
    }
  }),

  /**
   * End sponsorship
   */
  endDeal: adminProcedure
    .input(z.object({ sponsorshipId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          throw new Error("Database not available");
        }

        await ctx.db.update(sponsorships)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(sponsorships.id, input.sponsorshipId));

        return { success: true, message: "Sponsorship cancelled" };
      } catch (error) {
        console.error("[Sponsorship] endDeal error:", error);
        throw new Error("Failed to end sponsorship");
      }
    }),
});
