/**
 * Test Fixtures
 * Provides factory functions to create test data
 */

import { nanoid } from "nanoid";

export interface TestUser {
  id: number;
  openId: string;
  email: string;
  name: string;
  role: "user" | "admin" | "moderator";
  loginMethod: string;
  lastSignedIn: Date;
  createdAt: Date;
}

export interface TestSubscription {
  id: number;
  userId: number;
  plan: "free" | "subscriber" | "vip" | "premium" | "family";
  status: "active" | "canceled" | "paused";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
}

export interface TestPayment {
  id: number;
  userId: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  createdAt: Date;
}

export interface TestBooking {
  id: number;
  userId: number;
  eventId: number;
  quantity: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "canceled";
  createdAt: Date;
}

export interface TestProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  createdAt: Date;
}

/**
 * Create a test user
 */
export function createTestUser(overrides?: Partial<TestUser>): TestUser {
  const now = new Date();
  return {
    id: Math.floor(Math.random() * 1000000),
    openId: `openid_${nanoid()}`,
    email: `test_${nanoid(6)}@example.com`,
    name: `Test User ${nanoid(4)}`,
    role: "user",
    loginMethod: "google",
    lastSignedIn: now,
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create a test subscription
 */
export function createTestSubscription(
  overrides?: Partial<TestSubscription>
): TestSubscription {
  const now = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  return {
    id: Math.floor(Math.random() * 1000000),
    userId: Math.floor(Math.random() * 1000000),
    plan: "subscriber",
    status: "active",
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    stripeSubscriptionId: `sub_${nanoid()}`,
    ...overrides,
  };
}

/**
 * Create a test payment
 */
export function createTestPayment(overrides?: Partial<TestPayment>): TestPayment {
  const now = new Date();
  return {
    id: Math.floor(Math.random() * 1000000),
    userId: Math.floor(Math.random() * 1000000),
    amount: 9.99,
    currency: "usd",
    status: "completed",
    stripePaymentIntentId: `pi_${nanoid()}`,
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create a test booking
 */
export function createTestBooking(overrides?: Partial<TestBooking>): TestBooking {
  const now = new Date();
  return {
    id: Math.floor(Math.random() * 1000000),
    userId: Math.floor(Math.random() * 1000000),
    eventId: Math.floor(Math.random() * 1000000),
    quantity: 1,
    totalPrice: 50.0,
    status: "pending",
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create a test product
 */
export function createTestProduct(overrides?: Partial<TestProduct>): TestProduct {
  const now = new Date();
  return {
    id: Math.floor(Math.random() * 1000000),
    name: `Test Product ${nanoid(4)}`,
    price: 19.99,
    description: "A test product",
    category: "digital",
    stock: 100,
    createdAt: now,
    ...overrides,
  };
}
