/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Revenue Analytics & Dashboard Router
 * - Revenue by source
 * - Churn analysis
 * - Tax reporting
 * - Payout management
 */

import { adminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  revenueSummary,
  subscriptionPayments,
  affiliateConversions,
  affiliatePayouts,
  digitalPurchases,
  userChurn,
  taxRecords,
  userPayouts,
} from "../../drizzle/revenue-schema";
import { eq, gte, lte, and, desc, sql } from "drizzle-orm";

/**
 * Format date as YYYY-MM for period grouping
 */
function formatPeriod(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get date range for period
 */
function getPeriodDateRange(period: string): { start: Date; end: Date } {
  const [year, month] = period.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
}

export const revenueRouter = router({
  /**
   * Get total revenue stats
   */
  getTotalRevenue: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const subscriptionPaymentsData = await ctx.db.select().from(subscriptionPayments);
      const affiliateConversionsData = await ctx.db.select().from(affiliateConversions);
      const digitalPurchasesData = await ctx.db.select().from(digitalPurchases);

      const subRevenue = subscriptionPaymentsData.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );
      const affRevenue = affiliateConversionsData.reduce(
        (sum, c) => sum + parseFloat(c.commission.toString()),
        0
      );
      const prodRevenue = digitalPurchasesData.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );

      const currentMonth = formatPeriod(new Date());
      const range = getPeriodDateRange(currentMonth);

      const currentSubPayments = subscriptionPaymentsData.filter(
        (p) => p.createdAt >= range.start && p.createdAt <= range.end
      );
      const currentMRR = currentSubPayments.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );

      return {
        totalRevenue: subRevenue + affRevenue + prodRevenue,
        mrr: currentMRR,
        arr: currentMRR * 12,
        bySource: {
          subscriptions: subRevenue,
          affiliates: affRevenue,
          digitalProducts: prodRevenue,
        },
      };
    } catch (error) {
      console.error("[Revenue] getTotalRevenue error:", error);
      return null;
    }
  }),

  /**
   * Get revenue by source
   */
  getRevenueBySource: adminProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          return [];
        }

        const start = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        const end = input.endDate ? new Date(input.endDate) : new Date();

        const results = await ctx.db.select().from(revenueSummary).where(
          and(
            gte(revenueSummary.createdAt, start),
            lte(revenueSummary.createdAt, end)
          )
        );

        return results;
      } catch (error) {
        console.error("[Revenue] getRevenueBySource error:", error);
        return [];
      }
    }),

  /**
   * Get monthly revenue trend
   */
  getMonthlyTrend: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return [];
      }

      const monthlyData: Record<string, any> = {};

      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const period = formatPeriod(date);

        if (!monthlyData[period]) {
          monthlyData[period] = {
            period,
            subscriptions: 0,
            donations: 0,
            merchandise: 0,
            affiliates: 0,
            sponsorships: 0,
            digitalProducts: 0,
            total: 0,
          };
        }
      }

      // Aggregate actual data
      const summaries = await ctx.db.select().from(revenueSummary);
      summaries.forEach((s) => {
        const period = formatPeriod(s.createdAt);
        if (monthlyData[period]) {
          const amount = parseFloat(s.amount.toString());
          if (s.source === "subscriptions") monthlyData[period].subscriptions += amount;
          else if (s.source === "donations") monthlyData[period].donations += amount;
          else if (s.source === "merchandise") monthlyData[period].merchandise += amount;
          else if (s.source === "affiliates") monthlyData[period].affiliates += amount;
          else if (s.source === "sponsorships") monthlyData[period].sponsorships += amount;
          else if (s.source === "digital_products") monthlyData[period].digitalProducts += amount;
          monthlyData[period].total += amount;
        }
      });

      return Object.values(monthlyData);
    } catch (error) {
      console.error("[Revenue] getMonthlyTrend error:", error);
      return [];
    }
  }),

  /**
   * Get churn analysis
   */
  getChurnAnalysis: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const churnData = await ctx.db.select().from(userChurn).orderBy(desc(userChurn.churnDate));

      const thisMonth = churnData.filter((c) => {
        const date = new Date(c.churnDate);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });

      const lastMonth = churnData.filter((c) => {
        const date = new Date(c.churnDate);
        const now = new Date();
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
      });

      return {
        thisMonthChurn: thisMonth.length,
        lastMonthChurn: lastMonth.length,
        churnTrend: lastMonth.length > 0 ? ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100 : 0,
        topChurnReasons: churnData.reduce(
          (acc, c) => {
            if (c.reason) {
              const existing = acc.find((r) => r.reason === c.reason);
              if (existing) {
                existing.count++;
              } else {
                acc.push({ reason: c.reason, count: 1 });
              }
            }
            return acc;
          },
          [] as Array<{ reason: string; count: number }>
        ),
      };
    } catch (error) {
      console.error("[Revenue] getChurnAnalysis error:", error);
      return null;
    }
  }),

  /**
   * Calculate and generate tax report
   */
  generateTaxReport: adminProcedure
    .input(
      z.object({
        year: z.number(),
        taxRate: z.number().default(0.2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {        if (!ctx.db) {
          throw new Error("Database not available");
        }

        // Calculate gross revenue for the year
        const start = new Date(input.year, 0, 1);
        const end = new Date(input.year, 11, 31, 23, 59, 59);

        const summaries = await ctx.db.select()
          .from(revenueSummary)
          .where(and(gte(revenueSummary.createdAt, start), lte(revenueSummary.createdAt, end)));

        const grossRevenue = summaries.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0);
        const taxableAmount = grossRevenue * 0.85; // 15% deductions
        const taxAmount = taxableAmount * input.taxRate;

        const report = await ctx.db.insert(taxRecords)
          .values({
            userId: 0, // Would be admin/owner
            year: input.year,
            grossRevenue: grossRevenue.toString(),
            taxableAmount: taxableAmount.toString(),
            taxRate: input.taxRate,
            taxAmount: taxAmount.toString(),
            paidAmount: "0",
            isGenerated: true,
          })
          .returning();

        return {
          success: true,
          reportId: report[0].id,
          report: report[0],
        };
      } catch (error) {
        console.error("[Revenue] generateTaxReport error:", error);
        throw new Error("Failed to generate tax report");
      }
    }),

  /**
   * Get payout stats
   */
  getPayoutStats: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const payouts = await ctx.db.select().from(userPayouts);
      const affiliatePayoutsData = await ctx.db.select().from(affiliatePayouts);

      const totalPayouts = payouts.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      const affiliatePayoutsTotal = affiliatePayoutsData.reduce(
        (sum, p) => sum + parseFloat(p.amount.toString()),
        0
      );

      const pendingPayouts = payouts.filter((p) => p.status === "pending").length;
      const processingPayouts = payouts.filter((p) => p.status === "processing").length;

      return {
        totalPayouts,
        affiliatePayouts: affiliatePayoutsTotal,
        pendingCount: pendingPayouts,
        processingCount: processingPayouts,
        lastPayoutDate: payouts[payouts.length - 1]?.processedAt,
      };
    } catch (error) {
      console.error("[Revenue] getPayoutStats error:", error);
      return null;
    }
  }),

  /**
   * Get top paying subscribers
   */
  getTopSubscribers: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return [];
      }

      const payments = await ctx.db.select().from(subscriptionPayments);

      const grouped = payments.reduce(
        (acc, p) => {
          const userId = p.userId;
          if (!acc[userId]) {
            acc[userId] = { userId, totalSpent: 0, count: 0 };
          }
          acc[userId].totalSpent += parseFloat(p.amount.toString());
          acc[userId].count += 1;
          return acc;
        },
        {} as Record<number, any>
      );

      return Object.values(grouped)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 20);
    } catch (error) {
      console.error("[Revenue] getTopSubscribers error:", error);
      return [];
    }
  }),

  /**
   * Get LTV (Lifetime Value) analysis
   */
  getLTV: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const payments = await ctx.db.select().from(subscriptionPayments);
      const totalUsers = new Set(payments.map((p) => p.userId)).size;
      const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      const avgLTV = totalUsers > 0 ? totalRevenue / totalUsers : 0;

      return {
        avgLTV,
        totalRevenue,
        totalUsers,
        medianLTV: avgLTV * 0.8, // Rough estimate
      };
    } catch (error) {
      console.error("[Revenue] getLTV error:", error);
      return null;
    }
  }),

  /**
   * Get revenue forecasting
   */
  getRevenueForecast: adminProcedure.query(async ({ ctx }) => {
    try {      if (!ctx.db) {
        return null;
      }

      const summaries = await ctx.db.select().from(revenueSummary);

      // Get last 3 months
      const lastThreeMonths = summaries.slice(-90);
      const avgMonthlyRevenue = lastThreeMonths.reduce((sum, s) => sum + parseFloat(s.amount.toString()), 0) / 3;

      // Simple linear forecast for next 3 months
      const forecast = [
        { month: "next_1", projected: avgMonthlyRevenue },
        { month: "next_2", projected: avgMonthlyRevenue * 1.05 },
        { month: "next_3", projected: avgMonthlyRevenue * 1.1 },
      ];

      return {
        currentMonthlyRun: avgMonthlyRevenue,
        forecast,
        projectedAnnual: avgMonthlyRevenue * 12,
      };
    } catch (error) {
      console.error("[Revenue] getRevenueForecast error:", error);
      return null;
    }
  }),

  /**
   * Get dashboard summary
   */
  getDashboardSummary: adminProcedure.query(async ({ ctx }) => {
    try {
      const totalRevenue = await revenueRouter.createCaller(ctx).getTotalRevenue();
      const monthlyTrend = await revenueRouter.createCaller(ctx).getMonthlyTrend();
      const churnAnalysis = await revenueRouter.createCaller(ctx).getChurnAnalysis();
      const payoutStats = await revenueRouter.createCaller(ctx).getPayoutStats();
      const topSubscribers = await revenueRouter.createCaller(ctx).getTopSubscribers();

      return {
        totalRevenue,
        monthlyTrend,
        churnAnalysis,
        payoutStats,
        topSubscribers,
      };
    } catch (error) {
      console.error("[Revenue] getDashboardSummary error:", error);
      return null;
    }
  }),
});
