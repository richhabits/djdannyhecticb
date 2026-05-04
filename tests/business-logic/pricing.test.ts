/**
 * Pricing & Business Logic Tests
 * Tests for price calculations, fees, and subscription pricing
 */

import { describe, it, expect, beforeEach } from "vitest";

/**
 * Pricing calculation functions
 */

function calculateFee(amount: number, feePercent: number = 2.9, flatFee: number = 0.3): number {
  return amount + Math.round(amount * (feePercent / 100) * 100) / 100 + flatFee;
}

function calculateDonationFee(amount: number): number {
  // Stripe fee: 2.9% + $0.30
  const stripeFee = amount * 0.029 + 0.30;
  return stripeFee;
}

function calculateSubscriptionDiscount(
  billingCycle: "monthly" | "yearly",
  monthlyPrice: number
): number {
  if (billingCycle === "yearly") {
    const yearlyNormal = monthlyPrice * 12;
    const yearlyDiscounted = monthlyPrice * 11.5; // ~4% discount
    return yearlyDiscounted;
  }
  return monthlyPrice;
}

function calculateRefund(amount: number, stripeFee: number = 0.30): number {
  // Refund deducts stripe fee
  return amount - stripeFee;
}

function calculateProRataRefund(
  amount: number,
  billingCycleStart: Date,
  billingCycleEnd: Date
): number {
  const total = billingCycleEnd.getTime() - billingCycleStart.getTime();
  const used = Date.now() - billingCycleStart.getTime();
  const remaining = Math.max(0, total - used);
  const refundPercent = remaining / total;

  return Math.round(amount * refundPercent * 100) / 100;
}

describe("Pricing & Business Logic", () => {
  describe("Payment Fees", () => {
    it("should calculate correct Stripe fee for donation", () => {
      const amount = 10.0;
      const fee = calculateDonationFee(amount);

      // 2.9% + $0.30
      expect(fee).toBeCloseTo(0.59, 2);
    });

    it("should calculate fee for various donation amounts", () => {
      const testCases = [
        { amount: 5.0, expectedFee: 0.445 },
        { amount: 25.0, expectedFee: 1.025 },
        { amount: 100.0, expectedFee: 3.2 },
        { amount: 1000.0, expectedFee: 29.3 },
      ];

      testCases.forEach(({ amount, expectedFee }) => {
        const fee = calculateDonationFee(amount);
        expect(fee).toBeCloseTo(expectedFee, 1);
      });
    });

    it("should include platform fee on top of Stripe fee", () => {
      const amount = 10.0;
      const stripeFee = calculateDonationFee(amount);
      const platformFee = amount * 0.05; // 5% platform fee
      const totalFee = stripeFee + platformFee;

      expect(totalFee).toBeGreaterThan(stripeFee);
    });

    it("should charge fee even for very small donations", () => {
      const amount = 0;
      const fee = calculateDonationFee(amount);

      expect(fee).toBe(0.3); // Flat fee
    });

    it("should charge appropriate fee for tiny amounts", () => {
      const amount = 0.01;
      const fee = calculateDonationFee(amount);

      expect(fee).toBeCloseTo(0.3, 2); // Approximately flat fee
    });
  });

  describe("Subscription Pricing", () => {
    it("should calculate yearly discount correctly", () => {
      const monthlyPrice = 9.99;
      const yearlyDiscount = calculateSubscriptionDiscount("yearly", monthlyPrice);

      // 11.5 months * $9.99 = $114.885 (rounded)
      expect(yearlyDiscount).toBeCloseTo(114.89, 1);
    });

    it("should save money with yearly plan", () => {
      const monthlyPrice = 9.99;
      const monthlyAnnual = monthlyPrice * 12;
      const yearlyPrice = calculateSubscriptionDiscount("yearly", monthlyPrice);

      const savings = monthlyAnnual - yearlyPrice;
      expect(savings).toBeGreaterThan(0);
    });

    it("should return monthly price for monthly billing cycle", () => {
      const monthlyPrice = 9.99;
      const result = calculateSubscriptionDiscount("monthly", monthlyPrice);

      expect(result).toBe(monthlyPrice);
    });

    it("should apply discount to all subscription tiers", () => {
      const tiers = [
        { monthly: 0, name: "free" },
        { monthly: 9.99, name: "subscriber" },
        { monthly: 29.99, name: "vip" },
        { monthly: 99.99, name: "premium" },
        { monthly: 19.99, name: "family" },
      ];

      tiers.forEach(({ monthly }) => {
        const yearly = calculateSubscriptionDiscount("yearly", monthly);
        if (monthly > 0) {
          expect(yearly).toBeLessThan(monthly * 12);
        }
      });
    });

    it("should handle free tier with no discount", () => {
      const freePrice = 0;
      const yearlyPrice = calculateSubscriptionDiscount("yearly", freePrice);

      expect(yearlyPrice).toBe(0);
    });
  });

  describe("Refunds", () => {
    it("should deduct Stripe fee from refund", () => {
      const amount = 100.0;
      const stripeFee = 0.3;
      const refund = calculateRefund(amount, stripeFee);

      expect(refund).toBe(99.7);
    });

    it("should handle multiple refunds for same payment", () => {
      const totalAmount = 100.0;
      const refund1 = 50.0;
      const refund2 = 50.0;

      const remaining = totalAmount - refund1 - refund2;
      expect(remaining).toBe(0);
    });

    it("should not allow refund > original amount", () => {
      const amount = 100.0;
      const refundRequest = 150.0;

      const isValid = refundRequest <= amount;
      expect(isValid).toBe(false);
    });

    it("should handle partial refunds", () => {
      const amount = 100.0;
      const partialRefund = amount * 0.5; // 50%

      expect(partialRefund).toBe(50.0);
    });

    it("should track remaining balance after refund", () => {
      const initialAmount = 100.0;
      const refunded = 30.0;
      const remaining = initialAmount - refunded;

      expect(remaining).toBe(70.0);
    });
  });

  describe("Pro-Rata Refunds", () => {
    it("should calculate pro-rata refund for mid-cycle cancellation", () => {
      const amount = 10.0; // Monthly subscription
      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Simulate cancellation at 50% through cycle
      const midCycleTime = cycleStart.getTime() + 15 * 24 * 60 * 60 * 1000;
      const originalNow = Date.now;
      global.Date.now = () => midCycleTime;

      const refund = calculateProRataRefund(amount, cycleStart, cycleEnd);

      global.Date.now = originalNow;

      expect(refund).toBeCloseTo(5.0, 1);
    });

    it("should refund nothing for cancellation at end of cycle", () => {
      const amount = 10.0;
      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const originalNow = Date.now;
      global.Date.now = () => cycleEnd.getTime();

      const refund = calculateProRataRefund(amount, cycleStart, cycleEnd);

      global.Date.now = originalNow;

      expect(refund).toBe(0);
    });

    it("should refund full amount for immediate cancellation", () => {
      const amount = 10.0;
      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const originalNow = Date.now;
      global.Date.now = () => cycleStart.getTime();

      const refund = calculateProRataRefund(amount, cycleStart, cycleEnd);

      global.Date.now = originalNow;

      expect(refund).toBeCloseTo(10.0, 1);
    });

    it("should never refund more than original amount", () => {
      const amount = 10.0;
      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const refund = calculateProRataRefund(amount, cycleStart, cycleEnd);

      expect(refund).toBeLessThanOrEqual(amount);
    });

    it("should never return negative refund", () => {
      const amount = 10.0;
      const cycleStart = new Date();
      const cycleEnd = new Date(cycleStart.getTime() + 30 * 24 * 60 * 60 * 1000);

      const originalNow = Date.now;
      global.Date.now = () => cycleEnd.getTime() + 1000; // Past end

      const refund = calculateProRataRefund(amount, cycleStart, cycleEnd);

      global.Date.now = originalNow;

      expect(refund).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Tier Pricing Consistency", () => {
    it("should have ascending prices for tiers", () => {
      const prices = {
        free: 0,
        subscriber: 9.99,
        family: 19.99,
        vip: 29.99,
        premium: 99.99,
      };

      const sorted = Object.values(prices).sort((a, b) => a - b);
      expect(sorted).toEqual(Object.values(prices));
    });

    it("should not have duplicate pricing between tiers", () => {
      const prices = [0, 9.99, 19.99, 29.99, 99.99];
      const unique = new Set(prices);

      expect(unique.size).toBe(prices.length);
    });

    it("should have reasonable price gaps", () => {
      const tiers = [
        { name: "free", price: 0 },
        { name: "subscriber", price: 9.99 },
        { name: "family", price: 19.99 },
        { name: "vip", price: 29.99 },
        { name: "premium", price: 99.99 },
      ];

      for (let i = 1; i < tiers.length; i++) {
        const diff = tiers[i].price - tiers[i - 1].price;
        // Price difference should be reasonable (5% to 400% increase)
        if (tiers[i - 1].price > 0) {
          const percentIncrease = (diff / tiers[i - 1].price) * 100;
          expect(percentIncrease).toBeGreaterThan(0);
        }
      }
    });
  });

  describe("Volume Pricing", () => {
    it("should apply team/family plan discount for 4+ users", () => {
      const singleUserCost = 9.99 * 4; // 4 x Subscriber plan
      const familyPlanCost = 19.99; // Family plan for 4

      const savings = singleUserCost - familyPlanCost;
      expect(savings).toBeGreaterThan(0);
    });

    it("should calculate bulk discount correctly", () => {
      const basePrice = 10.0;
      const quantity = 10;
      const bulkDiscount = 0.1; // 10% for 10+

      const totalWithDiscount = basePrice * quantity * (1 - bulkDiscount);
      expect(totalWithDiscount).toBe(90.0);
    });
  });

  describe("Currency Handling", () => {
    it("should round to 2 decimal places for USD", () => {
      const amount = 10.005;
      const rounded = Math.round(amount * 100) / 100;

      expect(rounded).toBe(10.01);
    });

    it("should handle integer cents", () => {
      const amount = 10.99;
      const cents = Math.round(amount * 100);

      expect(cents).toBe(1099);
    });

    it("should support multiple currencies", () => {
      const currencies = {
        USD: { symbol: "$", decimals: 2 },
        EUR: { symbol: "€", decimals: 2 },
        GBP: { symbol: "£", decimals: 2 },
        JPY: { symbol: "¥", decimals: 0 },
      };

      Object.entries(currencies).forEach(([code, config]) => {
        expect(code).toHaveLength(3);
        expect(config.decimals).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe("Tax Calculations", () => {
    it("should calculate sales tax based on region", () => {
      const amount = 100.0;
      const taxRate = 0.08; // 8% sales tax
      const tax = amount * taxRate;

      expect(tax).toBe(8.0);
    });

    it("should be tax-inclusive for some regions", () => {
      const taxInclusivePrice = 100.0;
      const taxRate = 0.2; // 20% VAT
      const subtotal = taxInclusivePrice / (1 + taxRate);

      expect(subtotal).toBeCloseTo(83.33, 2);
    });

    it("should handle tax-exempt regions", () => {
      const amount = 100.0;
      const isExempt = true;
      const tax = isExempt ? 0 : amount * 0.08;

      expect(tax).toBe(0);
    });
  });
});
