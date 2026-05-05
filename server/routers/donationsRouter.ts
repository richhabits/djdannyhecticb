/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Donations & Stripe Payment Router
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSupportPaymentIntent } from "../lib/payments";
import { ENV } from "../_core/env";
import { donations, userBadges } from "../../drizzle/engagement-schema";
import { eq } from "drizzle-orm";
import { getDb } from "../db";

export const donationsRouter = router({
  /**
   * Create a payment intent for a donation
   * Returns clientSecret and paymentIntentId for frontend
   */
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        amount: z.number().int().min(1).max(100000), // in smallest currency unit (cents/pence)
        currency: z.string().length(3).toUpperCase().default("USD"),
        donorName: z.string().min(1).max(255),
        email: z.string().email().optional(),
        message: z.string().max(1000).optional(),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
        throw new Error("Stripe is not configured");
      }

      try {
        const result = await createSupportPaymentIntent({
          amount: input.amount,
          currency: input.currency,
          fanName: input.donorName,
          email: input.email,
          fanId: input.userId,
          message: input.message,
        });

        return {
          success: true,
          paymentIntentId: result.paymentIntentId,
          clientSecret: result.clientSecret,
          supportEventId: result.supportEventId,
        };
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        throw new Error("Failed to create payment intent");
      }
    }),

  /**
   * Confirm donation after payment succeeds
   * This is called by the frontend after Stripe confirms payment
   */
  confirmDonation: publicProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        donorName: z.string(),
        amount: z.number(),
        message: z.string().optional(),
        anonymous: z.boolean().default(false),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      try {
        // Find the donation by payment intent ID
        const donationRecords = await ctx.db
          .select()
          .from(donations)
          .where(eq(donations.stripePaymentId, input.paymentIntentId));

        if (donationRecords.length === 0) {
          throw new Error("Donation not found");
        }

        const donation = donationRecords[0];

        // Check if donation is already completed
        if (donation.status === "completed") {
          return {
            success: true,
            message: "Donation already confirmed",
            donationId: donation.id,
          };
        }

        // Update donation status to completed
        await dbInstance
          .update(donations)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(donations.id, donation.id));

        // Award badges based on donation amount
        if (input.userId && donation.amount) {
          const amountInDollars = parseFloat(donation.amount.toString());

          // Check if user qualifies for donation badges
          const badgeTiers = [
            { threshold: 100, type: "donation_100" as const },
            { threshold: 500, type: "donation_500" as const },
            { threshold: 1000, type: "donation_1000" as const },
          ];

          for (const tier of badgeTiers) {
            if (amountInDollars >= tier.threshold) {
              try {
                // Check if user already has this badge
                const existingBadges = await dbInstance
                  .select()
                  .from(userBadges)
                  .where(eq(userBadges.userId, input.userId));

                const hasBadge = existingBadges.some(
                  (b) => b.badgeType === tier.type
                );

                if (!hasBadge) {
                  await dbInstance.insert(userBadges).values({
                    userId: input.userId,
                    badgeType: tier.type,
                    earnedAt: new Date(),
                    metadata: {
                      donationAmount: amountInDollars,
                      donationId: donation.id,
                    },
                  });
                }
              } catch (badgeError) {
                console.error(`Failed to award ${tier.type} badge:`, badgeError);
              }
            }
          }
        }

        return {
          success: true,
          message: "Donation confirmed successfully",
          donationId: donation.id,
          badgesAwarded: [],
        };
      } catch (error) {
        console.error("Failed to confirm donation:", error);
        throw new Error("Failed to confirm donation");
      }
    }),

  /**
   * Get donation history for a user
   */
  getUserDonations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.db || !ctx.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not authenticated" });
    }

    const userDonations = await ctx.db
      .select()
      .from(donations)
      .where(eq(donations.userId, ctx.user.id));

    return {
      success: true,
      donations: userDonations.map((d) => ({
        id: d.id,
        amount: parseFloat(d.amount.toString()),
        currency: d.currency,
        message: d.message,
        status: d.status,
        createdAt: d.createdAt,
      })),
    };
  }),

  /**
   * Get all donations (admin only)
   */
  getAllDonations: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["pending", "completed", "failed", "refunded"])
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      try {
        // Get all donations (apply filters)
        const allDonations = input.status
          ? await dbInstance
              .select()
              .from(donations)
              .where(eq(donations.status, input.status))
          : await dbInstance.select().from(donations);

        const paginated = allDonations.slice(
          input.offset,
          input.offset + input.limit
        );

        return {
          success: true,
          donations: paginated.map((d) => ({
            id: d.id,
            userId: d.userId,
            amount: parseFloat(d.amount.toString()),
            currency: d.currency,
            message: d.message,
            status: d.status,
            anonymous: d.anonymous,
            createdAt: d.createdAt,
          })),
          total: allDonations.length,
        };
      } catch (error) {
        console.error("Failed to fetch donations:", error);
        throw new Error("Failed to fetch donations");
      }
    }),

  /**
   * Get donation statistics
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.db) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    }

    const allDonations = await ctx.db
      .select()
      .from(donations)
      .where(eq(donations.status, "completed"));

    const totalAmount = allDonations.reduce(
      (sum, d) => sum + parseFloat(d.amount.toString()),
      0
    );
    const totalDonors = new Set(allDonations.map((d) => d.userId)).size;

    return {
      success: true,
      stats: {
        totalDonations: allDonations.length,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        uniqueDonors: totalDonors,
        averageDonation:
          allDonations.length > 0
            ? parseFloat((totalAmount / allDonations.length).toFixed(2))
            : 0,
      },
    };
  }),

  /**
   * Get top donors leaderboard
   */
  getTopDonors: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input, ctx }) => {
      if (!ctx.db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      }

      const allDonations = await ctx.db
        .select()
        .from(donations)
        .where(eq(donations.status, "completed"));

      // Group by user and sum amounts
      const donorTotals: Record<number, { total: number; name: string }> = {};

      for (const d of allDonations) {
        if (!donorTotals[d.userId]) {
          donorTotals[d.userId] = {
            total: 0,
            name: d.anonymous ? "Anonymous" : "", // TODO: get actual name from users table
          };
        }
        donorTotals[d.userId].total += parseFloat(d.amount.toString());
      }

      const sorted = Object.entries(donorTotals)
        .map(([userId, data]) => ({
          userId: parseInt(userId),
          totalDonated: parseFloat(data.total.toFixed(2)),
          donorName: data.name || "Anonymous",
        }))
        .sort((a, b) => b.totalDonated - a.totalDonated)
        .slice(0, input.limit);

      return {
        success: true,
        topDonors: sorted,
      };
    }),
});
