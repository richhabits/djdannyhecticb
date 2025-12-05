import Stripe from 'stripe';
import { ENV } from './env';

let stripe: Stripe | null = null;

/**
 * Initialize Stripe client
 */
export function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) {
    console.warn('[Stripe] Not configured - STRIPE_SECRET_KEY missing');
    return null;
  }

  if (!stripe) {
    stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: '2025-01-27.acacia',
      typescript: true,
    });
  }

  return stripe;
}

/**
 * Create a payment intent for tips/support
 */
export async function createSupportPaymentIntent(params: {
  amount: number; // in cents
  currency: string;
  fanName: string;
  email?: string;
  message?: string;
}) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: {
      type: 'support_event',
      fanName: params.fanName,
      email: params.email || '',
      message: params.message || '',
    },
    description: `Support from ${params.fanName}`,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Create a payment intent for product purchases
 */
export async function createProductPaymentIntent(params: {
  amount: number; // in cents
  currency: string;
  productId: number;
  productName: string;
  fanName: string;
  email?: string;
}) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: {
      type: 'product_purchase',
      productId: params.productId.toString(),
      productName: params.productName,
      fanName: params.fanName,
      email: params.email || '',
    },
    description: `Purchase: ${params.productName}`,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Create a subscription for VIP tiers
 */
export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  tier: string;
  fanName: string;
  email: string;
}) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripeClient.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: {
      tier: params.tier,
      fanName: params.fanName,
    },
  });

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
  };
}

/**
 * Create or retrieve a Stripe customer
 */
export async function getOrCreateCustomer(params: {
  email: string;
  name: string;
  userId?: number;
}) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  // Search for existing customer
  const existingCustomers = await stripeClient.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  const customer = await stripeClient.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId?.toString() || '',
    },
  });

  return customer;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const subscription = await stripeClient.subscriptions.cancel(subscriptionId);
  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    canceledAt: subscription.canceled_at,
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): Stripe.Event | null {
  const stripeClient = getStripe();
  if (!stripeClient || !ENV.stripeWebhookSecret) {
    console.warn('[Stripe] Cannot verify webhook - missing configuration');
    return null;
  }

  try {
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      ENV.stripeWebhookSecret
    );
    return event;
  } catch (error) {
    console.error('[Stripe] Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Handle completed payment intent
 */
export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;
  
  return {
    type: metadata.type || 'unknown',
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    metadata,
  };
}

/**
 * Create prices for subscription tiers (run once during setup)
 */
export async function createSubscriptionPrices() {
  const stripeClient = getStripe();
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  const tiers = [
    {
      name: 'Hectic Regular',
      tier: 'hectic_regular',
      amount: 499, // £4.99/month
      currency: 'gbp',
    },
    {
      name: 'Hectic Royalty',
      tier: 'hectic_royalty',
      amount: 999, // £9.99/month
      currency: 'gbp',
    },
    {
      name: 'Inner Circle',
      tier: 'inner_circle',
      amount: 2999, // £29.99/month
      currency: 'gbp',
    },
  ];

  const prices = [];
  for (const tier of tiers) {
    const product = await stripeClient.products.create({
      name: tier.name,
      description: `${tier.name} membership`,
      metadata: { tier: tier.tier },
    });

    const price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: tier.amount,
      currency: tier.currency,
      recurring: { interval: 'month' },
    });

    prices.push({ tier: tier.tier, priceId: price.id, productId: product.id });
  }

  return prices;
}

/**
 * Get subscription prices (for frontend)
 */
export async function getSubscriptionPrices() {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return [];
  }

  const prices = await stripeClient.prices.list({
    active: true,
    type: 'recurring',
    expand: ['data.product'],
  });

  return prices.data.map(price => ({
    id: price.id,
    amount: price.unit_amount || 0,
    currency: price.currency,
    interval: price.recurring?.interval,
    product: {
      id: (price.product as Stripe.Product).id,
      name: (price.product as Stripe.Product).name,
      description: (price.product as Stripe.Product).description,
    },
  }));
}
