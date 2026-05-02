/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Subscription Tiers Router
 * - 5 subscription tiers: Free, Subscriber, VIP, Premium, Family
 * - Stripe recurring subscriptions
 * - Upgrade/downgrade management
 * - Auto-renewal & cancellation
 */

import { publicProcedure, protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  subscriptionPlans,
  userSubscriptions,
  subscriptionPayments,
  tierFeatures,
  userChurn,
} from "../../drizzle/revenue-schema";
import { eq, and, desc, asc } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Plan configurations (default if not in DB)
 */
const DEFAULT_PLANS = {
  free: {
    name: "Free",
    monthlyPrice: "0",
    yearlyPrice: "0",
    features: ["basic_chat", "limited_reactions"],
  },
  subscriber: {
    name: "Subscriber",
    monthlyPrice: "9.99",
    yearlyPrice: "99.90",
    features: ["ad_free", "custom_color", "early_notifications"],
  },
  vip: {
    name: "VIP",
    monthlyPrice: "29.99",
    yearlyPrice: "299.90",
    features: ["private_chat", "subscriber_events", "merch_presale"],
  },
  premium: {
    name: "Premium",
    monthlyPrice: "99.99",
    yearlyPrice: "999.90",
    features: ["coaching_calls", "exclusive_streams", "custom_badge"],
  },
  family: {
    name: "Family",
    monthlyPrice: "19.99",
    yearlyPrice: "199.90",
    features: ["subscriber_features_for_4", "family_dashboard"],
  },
};

export const subscriptionRouter = router({
  /**
   * Get all subscription plans
   */
  getPlans: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return Object.entries(DEFAULT_PLANS).map(([plan, data]) => ({
          plan,
          ...data,
        }));
      }

      const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));

      return plans.length > 0
        ? plans
        : Object.entries(DEFAULT_PLANS).map(([plan, data]) => ({
            plan,
            ...data,
          }));
    } catch (error) {
      console.error("[Subscription] getPlans error:", error);
      return Object.entries(DEFAULT_PLANS).map(([plan, data]) => ({
        plan,
        ...data,
      }));
    }
  }),

  /**
   * Get a specific plan details
   */
  getPlan: publicProcedure
    .input(z.object({ plan: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          return (DEFAULT_PLANS as any)[input.plan];
        }

        const plan = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.plan, input.plan as any))
          .limit(1);

        if (plan.length === 0) {
          return (DEFAULT_PLANS as any)[input.plan];
        }

        return plan[0];
      } catch (error) {
        console.error("[Subscription] getPlan error:", error);
        return (DEFAULT_PLANS as any)[input.plan];
      }
    }),

  /**
   * Get current user subscription
   */
  getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }

      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
        .orderBy(desc(userSubscriptions.createdAt))
        .limit(1);

      return subscription.length > 0 ? subscription[0] : null;
    } catch (error) {
      console.error("[Subscription] getCurrentSubscription error:", error);
      return null;
    }
  }),

  /**
   * Check if user has access to a premium feature
   */
  checkFeatureAccess: protectedProcedure
    .input(
      z.object({
        feature: z.string(),
      })
    )
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
          .orderBy(desc(userSubscriptions.createdAt))
          .limit(1);

        if (subscription.length === 0) {
          return { hasAccess: false, requiredTier: null };
        }

        const features = await db
          .select()
          .from(tierFeatures)
          .where(eq(tierFeatures.feature, input.feature as any));

        const userFeature = features.find((f) => f.tier === subscription[0].plan);

        return {
          hasAccess: userFeature?.enabled || false,
          requiredTier: features[0]?.tier || null,
        };
      } catch (error) {
        console.error("[Subscription] checkFeatureAccess error:", error);
        return { hasAccess: false, requiredTier: null };
      }
    }),

  /**
   * Create subscription payment intent
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["free", "subscriber", "vip", "premium", "family"]),
        billingCycle: z.enum(["monthly", "yearly"]).default("monthly"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ENV.stripeSecretKey) {
        throw new Error("Stripe not configured");
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Get plan details
        const plans = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.plan, input.plan as any))
          .limit(1);

        const plan = plans[0];
        if (!plan) {
          throw new Error("Plan not found");
        }

        const price = input.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

        // Create or get customer
        let customerId: string;
        const existingSub = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
          .limit(1);

        if (existingSub[0]?.stripeCustomerId) {
          customerId = existingSub[0].stripeCustomerId;
        } else {
          const customer = await stripe.customers.create({
            email: ctx.user?.email || "",
            metadata: {
              userId: ctx.user?.id,
              displayName: ctx.user?.displayName,
            },
          });
          customerId = customer.id;
        }

        // Create payment intent for one-time payment (for monthly) or subscription
        const paymentIntent = await stripe.paymentIntents.create({
          customer: customerId,
          amount: Math.round(parseFloat(price) * 100),
          currency: "usd",
          metadata: {
            userId: ctx.user?.id,
            plan: input.plan,
            billingCycle: input.billingCycle,
          },
        });

        return {
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: price,
        };
      } catch (error) {
        console.error("[Subscription] createPaymentIntent error:", error);
        throw new Error("Failed to create payment intent");
      }
    }),

  /**
   * Confirm subscription after payment
   */
  confirmSubscription: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
        plan: z.enum(["free", "subscriber", "vip", "premium", "family"]),
        billingCycle: z.enum(["monthly", "yearly"]),
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

        const customerId = paymentIntent.customer as string;

        // Create subscription record
        const nextBillingDate = new Date();
        if (input.billingCycle === "monthly") {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }

        const subscription = await db
          .insert(userSubscriptions)
          .values({
            userId: ctx.user?.id || 0,
            plan: input.plan as any,
            stripeCustomerId: customerId,
            stripeSubscriptionId: paymentIntent.id,
            startDate: new Date(),
            nextBillingDate,
            billingCycle: input.billingCycle,
            status: "active",
            autoRenew: true,
          })
          .returning();

        // Record payment
        const plans = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.plan, input.plan as any))
          .limit(1);

        const price =
          input.billingCycle === "yearly"
            ? plans[0]?.yearlyPrice || "0"
            : plans[0]?.monthlyPrice || "0";

        await db.insert(subscriptionPayments).values({
          subscriptionId: subscription[0].id,
          userId: ctx.user?.id || 0,
          stripePaymentIntentId: paymentIntent.id,
          amount: price,
          currency: "USD",
          status: "succeeded",
          billingDate: new Date(),
        });

        return {
          success: true,
          subscriptionId: subscription[0].id,
          message: `Welcome to ${input.plan} plan!`,
        };
      } catch (error) {
        console.error("[Subscription] confirmSubscription error:", error);
        throw new Error("Failed to confirm subscription");
      }
    }),

  /**
   * Upgrade or downgrade subscription
   */
  updatePlan: protectedProcedure
    .input(
      z.object({
        newPlan: z.enum(["free", "subscriber", "vip", "premium", "family"]),
        effectiveDate: z.enum(["immediately", "next_billing"]).default("immediately"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const currentSub = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
          .orderBy(desc(userSubscriptions.createdAt))
          .limit(1);

        if (!currentSub[0]) {
          throw new Error("No active subscription");
        }

        const oldPlan = currentSub[0].plan;

        // Update subscription
        await db
          .update(userSubscriptions)
          .set({
            plan: input.newPlan as any,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.id, currentSub[0].id));

        // Track churn if downgrading
        if (["premium", "vip", "subscriber"].includes(oldPlan) && input.newPlan === "free") {
          await db.insert(userChurn).values({
            userId: ctx.user?.id || 0,
            previousPlan: oldPlan as any,
            newPlan: "free",
            reason: "User downgraded subscription",
          });
        }

        return {
          success: true,
          message: `Subscription updated to ${input.newPlan}`,
        };
      } catch (error) {
        console.error("[Subscription] updatePlan error:", error);
        throw new Error("Failed to update plan");
      }
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const subscription = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
          .orderBy(desc(userSubscriptions.createdAt))
          .limit(1);

        if (!subscription[0]) {
          throw new Error("No active subscription");
        }

        // Cancel Stripe subscription if exists
        if (subscription[0].stripeSubscriptionId) {
          try {
            await stripe.subscriptions.cancel(subscription[0].stripeSubscriptionId);
          } catch (e) {
            console.warn("Failed to cancel Stripe subscription:", e);
          }
        }

        // Update subscription status
        await db
          .update(userSubscriptions)
          .set({
            status: "cancelled",
            cancelledAt: new Date(),
            cancelReason: input.reason,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.id, subscription[0].id));

        // Track churn
        await db.insert(userChurn).values({
          userId: ctx.user?.id || 0,
          previousPlan: subscription[0].plan,
          newPlan: "free",
          reason: input.reason || "User cancelled subscription",
        });

        return {
          success: true,
          message: "Subscription cancelled",
        };
      } catch (error) {
        console.error("[Subscription] cancelSubscription error:", error);
        throw new Error("Failed to cancel subscription");
      }
    }),

  /**
   * Get subscription management page data
   */
  getManagementData: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }

      const subscription = await db
        .select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, ctx.user?.id || 0))
        .orderBy(desc(userSubscriptions.createdAt))
        .limit(1);

      if (!subscription[0]) {
        return null;
      }

      const payments = await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.subscriptionId, subscription[0].id))
        .orderBy(desc(subscriptionPayments.createdAt))
        .limit(12);

      return {
        subscription: subscription[0],
        payments,
      };
    } catch (error) {
      console.error("[Subscription] getManagementData error:", error);
      return null;
    }
  }),

  /**
   * Admin: Create subscription plan
   */
  createPlan: adminProcedure
    .input(
      z.object({
        plan: z.string(),
        name: z.string(),
        monthlyPrice: z.string(),
        yearlyPrice: z.string().optional(),
        features: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const result = await db
          .insert(subscriptionPlans)
          .values({
            plan: input.plan as any,
            name: input.name,
            monthlyPrice: input.monthlyPrice,
            yearlyPrice: input.yearlyPrice,
            features: input.features,
          })
          .returning();

        return { success: true, plan: result[0] };
      } catch (error) {
        console.error("[Subscription] createPlan error:", error);
        throw new Error("Failed to create plan");
      }
    }),

  /**
   * Admin: Get subscription stats
   */
  getStats: adminProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }

      const allSubs = await db.select().from(userSubscriptions);
      const activeCount = allSubs.filter((s) => s.status === "active").length;
      const cancelledCount = allSubs.filter((s) => s.status === "cancelled").length;

      const revenueData = await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.status, "succeeded"));

      const totalRevenue = revenueData.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

      return {
        totalSubscriptions: allSubs.length,
        activeSubscriptions: activeCount,
        cancelledSubscriptions: cancelledCount,
        mrr: (totalRevenue / allSubs.length) * 12 || 0, // Monthly Recurring Revenue estimate
        churnRate: (cancelledCount / allSubs.length) * 100 || 0,
      };
    } catch (error) {
      console.error("[Subscription] getStats error:", error);
      return null;
    }
  }),
});
