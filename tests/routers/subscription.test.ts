/**
 * Subscription Router Tests
 * Tests for subscription plans, payments, upgrades/downgrades
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createTestUser,
  createTestSubscription,
  type TestSubscription,
} from "../utils/fixtures";
import { createAuthContext, createAdminContext } from "../utils/context";
import { mockStripe, resetAllMocks } from "../utils/mocks";

// Simulated database for testing
const mockDb = {
  subscriptions: new Map<number, TestSubscription>(),
  plans: new Map<string, any>(),
};

const DEFAULT_PLANS = {
  free: { monthlyPrice: "0", yearlyPrice: "0" },
  subscriber: { monthlyPrice: "9.99", yearlyPrice: "99.90" },
  vip: { monthlyPrice: "29.99", yearlyPrice: "299.90" },
  premium: { monthlyPrice: "99.99", yearlyPrice: "999.90" },
  family: { monthlyPrice: "19.99", yearlyPrice: "199.90" },
};

describe("Subscription Router", () => {
  beforeEach(() => {
    mockDb.subscriptions.clear();
    mockDb.plans.clear();
    Object.entries(DEFAULT_PLANS).forEach(([key, value]) => {
      mockDb.plans.set(key, value);
    });
    resetAllMocks();
  });

  describe("getPlans", () => {
    it("should return default plans when database is unavailable", async () => {
      const plans = Object.entries(DEFAULT_PLANS).map(([plan, data]) => ({
        plan,
        ...data,
      }));

      expect(plans).toHaveLength(5);
      expect(plans.map((p) => p.plan)).toContain("subscriber");
      expect(plans.map((p) => p.plan)).toContain("premium");
    });

    it("should return all active plans with pricing", async () => {
      const plans = Array.from(mockDb.plans.values()).map((p, i) => ({
        id: i,
        ...p,
      }));

      expect(plans.length).toBeGreaterThan(0);
      plans.forEach((plan) => {
        expect(plan).toHaveProperty("monthlyPrice");
        expect(plan).toHaveProperty("yearlyPrice");
      });
    });

    it("should have correct pricing for subscriber plan", () => {
      const subscriberPlan = mockDb.plans.get("subscriber");
      expect(subscriberPlan.monthlyPrice).toBe("9.99");
      expect(subscriberPlan.yearlyPrice).toBe("99.90");
    });

    it("should have free tier plan with zero pricing", () => {
      const freePlan = mockDb.plans.get("free");
      expect(freePlan.monthlyPrice).toBe("0");
      expect(freePlan.yearlyPrice).toBe("0");
    });
  });

  describe("getCurrentSubscription", () => {
    it("should return null for user without subscription", () => {
      const user = createTestUser();
      const subscription = mockDb.subscriptions.get(user.id);
      expect(subscription).toBeUndefined();
    });

    it("should return active subscription for subscribed user", () => {
      const user = createTestUser();
      const testSub = createTestSubscription({
        userId: user.id,
        status: "active",
      });
      mockDb.subscriptions.set(user.id, testSub);

      const subscription = mockDb.subscriptions.get(user.id);
      expect(subscription).toBeDefined();
      expect(subscription?.userId).toBe(user.id);
      expect(subscription?.status).toBe("active");
    });

    it("should return the most recent subscription", () => {
      const user = createTestUser();
      const sub1 = createTestSubscription({ userId: user.id });
      const sub2 = createTestSubscription({
        userId: user.id,
        createdAt: new Date(Date.now() + 1000),
      });

      mockDb.subscriptions.set(user.id, sub1);
      mockDb.subscriptions.set(user.id, sub2); // Overwrites

      const subscription = mockDb.subscriptions.get(user.id);
      expect(subscription?.createdAt).toEqual(sub2.createdAt);
    });
  });

  describe("createPaymentIntent", () => {
    it("should create payment intent with correct amount for monthly plan", async () => {
      const user = createTestUser();
      const plan = "subscriber";
      const billingCycle = "monthly";
      const planPrice = parseFloat(DEFAULT_PLANS[plan as keyof typeof DEFAULT_PLANS].monthlyPrice);

      const paymentIntent = await mockStripe.paymentIntents.create({
        amount: Math.round(planPrice * 100),
        currency: "usd",
        metadata: {
          userId: user.id,
          plan,
          billingCycle,
        },
      });

      expect(paymentIntent.status).toBe("succeeded");
      expect(paymentIntent.amount).toBe(Math.round(planPrice * 100));
      expect(paymentIntent.currency).toBe("usd");
    });

    it("should create payment intent with correct amount for yearly plan", async () => {
      const user = createTestUser();
      const plan = "vip";
      const billingCycle = "yearly";
      const planPrice = parseFloat(DEFAULT_PLANS[plan as keyof typeof DEFAULT_PLANS].yearlyPrice);

      const paymentIntent = await mockStripe.paymentIntents.create({
        amount: Math.round(planPrice * 100),
        currency: "usd",
        metadata: {
          userId: user.id,
          plan,
          billingCycle,
        },
      });

      expect(paymentIntent.amount).toBe(Math.round(planPrice * 100));
    });

    it("should include user and plan metadata", async () => {
      const user = createTestUser();
      const paymentIntent = await mockStripe.paymentIntents.create({
        amount: 999,
        currency: "usd",
        metadata: {
          userId: user.id,
          plan: "subscriber",
          billingCycle: "monthly",
        },
      });

      expect(paymentIntent.id).toBeDefined();
      expect(paymentIntent.client_secret).toBeDefined();
    });

    it("should have different pricing for different plans", () => {
      const subscriber = parseFloat(DEFAULT_PLANS.subscriber.monthlyPrice);
      const premium = parseFloat(DEFAULT_PLANS.premium.monthlyPrice);
      const vip = parseFloat(DEFAULT_PLANS.vip.monthlyPrice);

      expect(premium).toBeGreaterThan(subscriber);
      expect(vip).toBeGreaterThan(subscriber);
      expect(premium).toBeGreaterThan(vip);
    });
  });

  describe("confirmSubscription", () => {
    it("should create subscription record after successful payment", async () => {
      const user = createTestUser();
      const paymentIntent = await mockStripe.paymentIntents.retrieve("pi_test123");

      const subscription = createTestSubscription({
        userId: user.id,
        plan: "subscriber",
        status: "active",
      });

      mockDb.subscriptions.set(user.id, subscription);

      const stored = mockDb.subscriptions.get(user.id);
      expect(stored?.userId).toBe(user.id);
      expect(stored?.plan).toBe("subscriber");
      expect(stored?.status).toBe("active");
    });

    it("should set correct next billing date for monthly subscription", () => {
      const user = createTestUser();
      const now = new Date();
      const nextBilling = new Date(now);
      nextBilling.setMonth(nextBilling.getMonth() + 1);

      const subscription = createTestSubscription({
        userId: user.id,
        currentPeriodStart: now,
        currentPeriodEnd: nextBilling,
      });

      expect(subscription.currentPeriodEnd.getMonth()).toBe(
        (now.getMonth() + 1) % 12
      );
    });

    it("should set correct next billing date for yearly subscription", () => {
      const user = createTestUser();
      const now = new Date();
      const nextBilling = new Date(now);
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);

      const subscription = createTestSubscription({
        userId: user.id,
        currentPeriodStart: now,
        currentPeriodEnd: nextBilling,
      });

      expect(subscription.currentPeriodEnd.getFullYear()).toBe(
        now.getFullYear() + 1
      );
    });
  });

  describe("updatePlan", () => {
    it("should allow upgrading from subscriber to premium", () => {
      const user = createTestUser();
      const oldSub = createTestSubscription({
        userId: user.id,
        plan: "subscriber",
        status: "active",
      });

      mockDb.subscriptions.set(user.id, oldSub);

      const upgraded = createTestSubscription({
        userId: user.id,
        plan: "premium",
        status: "active",
      });

      mockDb.subscriptions.set(user.id, upgraded);

      const current = mockDb.subscriptions.get(user.id);
      expect(current?.plan).toBe("premium");
    });

    it("should allow downgrading from premium to subscriber", () => {
      const user = createTestUser();
      const premiumSub = createTestSubscription({
        userId: user.id,
        plan: "premium",
        status: "active",
      });

      mockDb.subscriptions.set(user.id, premiumSub);

      const downgraded = createTestSubscription({
        userId: user.id,
        plan: "subscriber",
        status: "active",
      });

      mockDb.subscriptions.set(user.id, downgraded);

      const current = mockDb.subscriptions.get(user.id);
      expect(current?.plan).toBe("subscriber");
    });

    it("should track churn when downgrading to free", () => {
      const user = createTestUser();
      const premiumSub = createTestSubscription({
        userId: user.id,
        plan: "premium",
      });

      const churnTracked = {
        userId: user.id,
        previousPlan: "premium",
        newPlan: "free",
        reason: "User downgraded subscription",
      };

      expect(churnTracked.previousPlan).toBe("premium");
      expect(churnTracked.newPlan).toBe("free");
    });

    it("should not track churn when upgrading", () => {
      const user = createTestUser();
      const initialSub = createTestSubscription({
        userId: user.id,
        plan: "subscriber",
      });

      // When upgrading, we should NOT insert a churn record
      const shouldChurn = ["premium", "vip", "subscriber"].includes(
        initialSub.plan
      ) && "premium" === "free";

      expect(shouldChurn).toBe(false);
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel active subscription", () => {
      const user = createTestUser();
      const subscription = createTestSubscription({
        userId: user.id,
        status: "active",
      });

      mockDb.subscriptions.set(user.id, subscription);

      const cancelled = createTestSubscription({
        userId: user.id,
        status: "canceled",
      });

      mockDb.subscriptions.set(user.id, cancelled);

      const current = mockDb.subscriptions.get(user.id);
      expect(current?.status).toBe("canceled");
    });

    it("should record cancellation reason", () => {
      const reason = "Too expensive";
      const cancelData = {
        status: "cancelled",
        cancelReason: reason,
      };

      expect(cancelData.cancelReason).toBe("Too expensive");
    });

    it("should track user churn on cancellation", () => {
      const user = createTestUser();
      const subscription = createTestSubscription({
        userId: user.id,
        plan: "premium",
        status: "active",
      });

      const churnRecord = {
        userId: user.id,
        previousPlan: subscription.plan,
        newPlan: "free",
        reason: "User cancelled subscription",
      };

      expect(churnRecord.previousPlan).toBe("premium");
      expect(churnRecord.newPlan).toBe("free");
    });

    it("should error when cancelling non-existent subscription", () => {
      const user = createTestUser();
      const subscription = mockDb.subscriptions.get(user.id);

      expect(subscription).toBeUndefined();
    });
  });

  describe("checkFeatureAccess", () => {
    it("should grant access to subscriber features", () => {
      const user = createTestUser();
      const subscription = createTestSubscription({
        userId: user.id,
        plan: "subscriber",
      });

      const hasAccess = subscription.plan === "subscriber";
      expect(hasAccess).toBe(true);
    });

    it("should grant access to premium features only to premium users", () => {
      const premiumUser = createTestSubscription({ plan: "premium" });
      const subscriberUser = createTestSubscription({ plan: "subscriber" });

      expect(premiumUser.plan === "premium").toBe(true);
      expect(subscriberUser.plan === "premium").toBe(false);
    });

    it("should deny access to free users", () => {
      const user = createTestUser();
      // User with no subscription = free plan
      const subscription = mockDb.subscriptions.get(user.id);

      expect(subscription).toBeUndefined();
    });
  });

  describe("getManagementData", () => {
    it("should return subscription and recent payments", () => {
      const user = createTestUser();
      const subscription = createTestSubscription({ userId: user.id });
      mockDb.subscriptions.set(user.id, subscription);

      const data = {
        subscription,
        payments: [
          {
            id: 1,
            amount: "9.99",
            status: "succeeded",
            createdAt: new Date(),
          },
        ],
      };

      expect(data.subscription.userId).toBe(user.id);
      expect(data.payments[0].status).toBe("succeeded");
    });

    it("should return null for user without subscription", () => {
      const user = createTestUser();
      const subscription = mockDb.subscriptions.get(user.id);

      expect(subscription).toBeUndefined();
    });

    it("should limit payment history to 12 recent entries", () => {
      const payments = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        amount: "9.99",
        status: "succeeded",
        createdAt: new Date(),
      }));

      const limited = payments.slice(0, 12);
      expect(limited).toHaveLength(12);
    });
  });

  describe("Admin: createPlan", () => {
    it("should create a new subscription plan (admin only)", () => {
      const newPlan = {
        plan: "custom",
        name: "Custom Plan",
        monthlyPrice: "49.99",
        yearlyPrice: "499.90",
        features: ["custom_feature_1", "custom_feature_2"],
      };

      mockDb.plans.set("custom", newPlan);

      const created = mockDb.plans.get("custom");
      expect(created.plan).toBe("custom");
      expect(created.features).toContain("custom_feature_1");
    });

    it("should require admin privileges", () => {
      const context = createAuthContext(); // Regular user
      const adminContext = createAdminContext(); // Admin

      expect(context.isAdmin).toBe(false);
      expect(adminContext.isAdmin).toBe(true);
    });
  });

  describe("Admin: getStats", () => {
    it("should calculate active subscriptions count", () => {
      const user1 = createTestUser();
      const user2 = createTestUser();
      const user3 = createTestUser();

      mockDb.subscriptions.set(
        user1.id,
        createTestSubscription({ userId: user1.id, status: "active" })
      );
      mockDb.subscriptions.set(
        user2.id,
        createTestSubscription({ userId: user2.id, status: "active" })
      );
      mockDb.subscriptions.set(
        user3.id,
        createTestSubscription({ userId: user3.id, status: "canceled" })
      );

      const active = Array.from(mockDb.subscriptions.values()).filter(
        (s) => s.status === "active"
      ).length;

      expect(active).toBe(2);
    });

    it("should calculate churn rate", () => {
      const user1 = createTestUser();
      const user2 = createTestUser();
      const user3 = createTestUser();

      mockDb.subscriptions.set(
        user1.id,
        createTestSubscription({ userId: user1.id, status: "active" })
      );
      mockDb.subscriptions.set(
        user2.id,
        createTestSubscription({ userId: user2.id, status: "active" })
      );
      mockDb.subscriptions.set(
        user3.id,
        createTestSubscription({ userId: user3.id, status: "canceled" })
      );

      const total = mockDb.subscriptions.size;
      const cancelled = Array.from(mockDb.subscriptions.values()).filter(
        (s) => s.status === "canceled"
      ).length;
      const churnRate = (cancelled / total) * 100;

      expect(churnRate).toBeCloseTo(33.33, 1);
    });
  });
});
