/**
 * Mock Services
 * Provides mocked external service responses for testing
 */

import { vi } from "vitest";

/**
 * Mock Stripe responses
 */
export const mockStripe = {
  paymentIntents: {
    create: vi.fn(async (params) => ({
      id: `pi_${Math.random().toString(36).substring(7)}`,
      amount: params.amount,
      currency: params.currency || "usd",
      status: "succeeded",
      client_secret: `secret_${Math.random().toString(36).substring(7)}`,
    })),
    retrieve: vi.fn(async (id) => ({
      id,
      status: "succeeded",
      amount: 999,
      currency: "usd",
    })),
    confirm: vi.fn(async (id, params) => ({
      id,
      status: "succeeded",
      amount: params.amount || 999,
    })),
  },
  subscriptions: {
    create: vi.fn(async (params) => ({
      id: `sub_${Math.random().toString(36).substring(7)}`,
      customer: params.customer,
      items: params.items,
      status: "active",
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    })),
    update: vi.fn(async (id, params) => ({
      id,
      status: params.cancel_at_period_end ? "active" : "active",
    })),
  },
  refunds: {
    create: vi.fn(async (params) => ({
      id: `re_${Math.random().toString(36).substring(7)}`,
      payment_intent: params.payment_intent,
      amount: params.amount,
      status: "succeeded",
    })),
  },
};

/**
 * Mock Email Service
 */
export const mockEmailService = {
  sendConfirmation: vi.fn(async (email: string) => ({
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(7)}`,
  })),
  sendReceipt: vi.fn(async (email: string, orderId: string) => ({
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(7)}`,
  })),
  sendReminder: vi.fn(async (email: string) => ({
    success: true,
    messageId: `msg_${Math.random().toString(36).substring(7)}`,
  })),
};

/**
 * Mock Payment Gateway
 */
export const mockPaymentGateway = {
  initiate: vi.fn(async (userId: number, amount: number) => ({
    paymentId: `pay_${Math.random().toString(36).substring(7)}`,
    status: "pending",
    redirectUrl: `https://payment.example.com/pay/${Math.random().toString(36).substring(7)}`,
  })),
  verify: vi.fn(async (paymentId: string) => ({
    paymentId,
    status: "completed",
    amount: 999,
  })),
  refund: vi.fn(async (paymentId: string, amount?: number) => ({
    paymentId,
    refundId: `refund_${Math.random().toString(36).substring(7)}`,
    status: "processed",
  })),
};

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  mockStripe.paymentIntents.create.mockClear();
  mockStripe.paymentIntents.retrieve.mockClear();
  mockStripe.paymentIntents.confirm.mockClear();
  mockStripe.subscriptions.create.mockClear();
  mockStripe.subscriptions.update.mockClear();
  mockStripe.refunds.create.mockClear();
  mockEmailService.sendConfirmation.mockClear();
  mockEmailService.sendReceipt.mockClear();
  mockEmailService.sendReminder.mockClear();
  mockPaymentGateway.initiate.mockClear();
  mockPaymentGateway.verify.mockClear();
  mockPaymentGateway.refund.mockClear();
}
