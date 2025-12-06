/**
 * Stripe Payment Integration
 * Documentation: https://stripe.com/docs/api
 */

// Note: In production, use the official Stripe SDK:
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  metadata?: Record<string, string>;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  payment_status: string;
  customer?: string;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    data: { price: { id: string; unit_amount: number } }[];
  };
}

const API_BASE = "https://api.stripe.com/v1";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe secret key not configured");
  }
  return key;
}

async function stripeRequest<T>(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
): Promise<T> {
  const key = getSecretKey();

  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  if (body) {
    options.body = new URLSearchParams(
      Object.entries(body).reduce((acc, [k, v]) => {
        if (typeof v === "object") {
          Object.entries(v as Record<string, unknown>).forEach(([subK, subV]) => {
            acc[`${k}[${subK}]`] = String(subV);
          });
        } else {
          acc[k] = String(v);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Stripe API error");
  }

  return response.json();
}

/**
 * Create a new customer
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<StripeCustomer> {
  return stripeRequest("/customers", "POST", {
    email,
    name,
    metadata,
  });
}

/**
 * Get customer by ID
 */
export async function getCustomer(customerId: string): Promise<StripeCustomer> {
  return stripeRequest(`/customers/${customerId}`);
}

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = "gbp",
  customerId?: string,
  metadata?: Record<string, string>
): Promise<StripePaymentIntent> {
  return stripeRequest("/payment_intents", "POST", {
    amount,
    currency,
    customer: customerId,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

/**
 * Create a checkout session for subscriptions or products
 */
export async function createCheckoutSession(options: {
  priceId?: string;
  amount?: number;
  productName?: string;
  mode: "payment" | "subscription";
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
  metadata?: Record<string, string>;
}): Promise<StripeCheckoutSession> {
  const lineItems: Record<string, unknown>[] = [];

  if (options.priceId) {
    lineItems.push({
      price: options.priceId,
      quantity: 1,
    });
  } else if (options.amount && options.productName) {
    lineItems.push({
      price_data: {
        currency: "gbp",
        unit_amount: options.amount,
        product_data: {
          name: options.productName,
        },
      },
      quantity: 1,
    });
  }

  const body: Record<string, unknown> = {
    mode: options.mode,
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
    metadata: options.metadata,
  };

  // Add line items as array notation
  lineItems.forEach((item, i) => {
    Object.entries(item).forEach(([k, v]) => {
      if (typeof v === "object") {
        Object.entries(v as Record<string, unknown>).forEach(([subK, subV]) => {
          if (typeof subV === "object") {
            Object.entries(subV as Record<string, unknown>).forEach(([subSubK, subSubV]) => {
              body[`line_items[${i}][${k}][${subK}][${subSubK}]`] = subSubV;
            });
          } else {
            body[`line_items[${i}][${k}][${subK}]`] = subV;
          }
        });
      } else {
        body[`line_items[${i}][${k}]`] = v;
      }
    });
  });

  if (options.customerId) {
    body.customer = options.customerId;
  }

  return stripeRequest("/checkout/sessions", "POST", body);
}

/**
 * Get a subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<StripeSubscription> {
  return stripeRequest(`/subscriptions/${subscriptionId}`);
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<StripeSubscription> {
  if (atPeriodEnd) {
    return stripeRequest(`/subscriptions/${subscriptionId}`, "POST", {
      cancel_at_period_end: true,
    });
  }
  return stripeRequest(`/subscriptions/${subscriptionId}`, "DELETE");
}

/**
 * List customer's subscriptions
 */
export async function listCustomerSubscriptions(
  customerId: string
): Promise<{ data: StripeSubscription[] }> {
  return stripeRequest(`/subscriptions?customer=${customerId}`);
}

/**
 * Create a product
 */
export async function createProduct(
  name: string,
  description?: string,
  metadata?: Record<string, string>
): Promise<{ id: string; name: string }> {
  return stripeRequest("/products", "POST", {
    name,
    description,
    metadata,
  });
}

/**
 * Create a price for a product
 */
export async function createPrice(
  productId: string,
  unitAmount: number,
  currency: string = "gbp",
  recurring?: { interval: "month" | "year" }
): Promise<{ id: string; unit_amount: number }> {
  const body: Record<string, unknown> = {
    product: productId,
    unit_amount: unitAmount,
    currency,
  };

  if (recurring) {
    body["recurring[interval]"] = recurring.interval;
  }

  return stripeRequest("/prices", "POST", body);
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string,
  signature: string
): { type: string; data: { object: Record<string, unknown> } } {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error("Stripe webhook secret not configured");
  }

  // In production, use Stripe's SDK for proper signature verification
  // stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  
  // Basic signature check (use Stripe SDK in production!)
  const crypto = require("crypto");
  const timestamp = signature.split(",")[0]?.split("=")[1];
  const sig = signature.split(",")[1]?.split("=")[1];
  
  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  
  if (sig !== expectedSig) {
    throw new Error("Invalid webhook signature");
  }

  return JSON.parse(payload);
}

/**
 * Price IDs for subscription tiers
 */
export const SUBSCRIPTION_PRICES = {
  hecticRegular: process.env.STRIPE_PRICE_HECTIC_REGULAR || "price_hectic_regular",
  hecticRoyalty: process.env.STRIPE_PRICE_HECTIC_ROYALTY || "price_hectic_royalty",
  innerCircle: process.env.STRIPE_PRICE_INNER_CIRCLE || "price_inner_circle",
};

export default {
  createCustomer,
  getCustomer,
  createPaymentIntent,
  createCheckoutSession,
  getSubscription,
  cancelSubscription,
  listCustomerSubscriptions,
  createProduct,
  createPrice,
  constructWebhookEvent,
  SUBSCRIPTION_PRICES,
};
