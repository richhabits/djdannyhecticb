import Stripe from 'stripe';
import { Request, Response } from 'express';
import { z } from 'zod';

/**
 * Enterprise-level Stripe payment integration
 */

// Initialize Stripe with TypeScript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

// Payment intent schema
const createPaymentIntentSchema = z.object({
  amount: z.number().min(50), // Minimum 50 cents
  currency: z.string().default('gbp'),
  description: z.string(),
  metadata: z.record(z.string()).optional(),
  customerEmail: z.string().email().optional(),
  savePaymentMethod: z.boolean().default(false),
});

// Subscription plan schema
const subscriptionPlanSchema = z.object({
  customerId: z.string(),
  priceId: z.string(),
  trial: z.boolean().default(false),
  metadata: z.record(z.string()).optional(),
});

// Product/Price configurations for DJ services
export const DJ_SERVICES = {
  // One-time services
  WEDDING: {
    priceId: 'price_wedding_2024',
    amount: 150000, // £1500.00
    currency: 'gbp',
    description: 'Wedding DJ Service - Full Day Package',
  },
  CLUB_NIGHT: {
    priceId: 'price_club_2024',
    amount: 50000, // £500.00
    currency: 'gbp',
    description: 'Club Night DJ Set (4 hours)',
  },
  PRIVATE_PARTY: {
    priceId: 'price_private_2024',
    amount: 80000, // £800.00
    currency: 'gbp',
    description: 'Private Party DJ Service',
  },
  CORPORATE_EVENT: {
    priceId: 'price_corporate_2024',
    amount: 200000, // £2000.00
    currency: 'gbp',
    description: 'Corporate Event DJ Service',
  },
  
  // Subscription tiers (monthly)
  MEMBER_PRO: {
    priceId: 'price_member_pro_monthly',
    amount: 999, // £9.99/month
    currency: 'gbp',
    description: 'Pro Membership - Monthly',
  },
  MEMBER_VIP: {
    priceId: 'price_member_vip_monthly',
    amount: 1999, // £19.99/month
    currency: 'gbp',
    description: 'VIP Membership - Monthly',
  },
};

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(data: z.infer<typeof createPaymentIntentSchema>) {
  try {
    const validatedData = createPaymentIntentSchema.parse(data);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: validatedData.amount,
      currency: validatedData.currency,
      description: validatedData.description,
      metadata: {
        ...validatedData.metadata,
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: validatedData.customerEmail,
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrRetrieveCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
) {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        ...metadata,
        created_via: 'dj_danny_website',
        timestamp: new Date().toISOString(),
      },
    });

    return customer;
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw new Error('Failed to process customer');
  }
}

/**
 * Create a subscription for membership
 */
export async function createSubscription(data: z.infer<typeof subscriptionPlanSchema>) {
  try {
    const validatedData = subscriptionPlanSchema.parse(data);
    
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: validatedData.customerId,
      items: [{ price: validatedData.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        ...validatedData.metadata,
        created_via: 'dj_danny_website',
      },
    };

    // Add trial period if requested
    if (validatedData.trial) {
      subscriptionParams.trial_period_days = 7; // 7-day free trial
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    
    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: (subscription.latest_invoice as Stripe.Invoice)?.payment_intent
        ? ((subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent).client_secret
        : null,
      status: subscription.status,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately = false) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !immediately,
    });

    if (immediately) {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    return {
      success: true,
      message: immediately 
        ? 'Subscription cancelled immediately' 
        : 'Subscription will be cancelled at the end of the billing period',
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Create a checkout session for more complex payment flows
 */
export async function createCheckoutSession({
  successUrl,
  cancelUrl,
  lineItems,
  mode = 'payment',
  customerEmail,
  metadata,
}: {
  successUrl: string;
  cancelUrl: string;
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  mode?: 'payment' | 'subscription';
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        ...metadata,
        created_via: 'dj_danny_website',
      },
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      shipping_address_collection: mode === 'payment' ? {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'NZ', 'IE'],
      } : undefined,
    });

    return {
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Handle Stripe webhooks
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePayment(invoice);
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Webhook handler error');
  }
}

// Webhook handler functions
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // TODO: Update booking status, send confirmation email, etc.
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // TODO: Send failure notification, update booking status
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  // TODO: Update user membership status in database
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  console.log('Subscription cancelled:', subscription.id);
  // TODO: Downgrade user access, send cancellation email
}

async function handleInvoicePayment(invoice: Stripe.Invoice) {
  console.log('Invoice paid:', invoice.id);
  // TODO: Update payment records, send receipt
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id);
  // TODO: Fulfill order, update database, send confirmation
}

/**
 * Get payment history for a customer
 */
export async function getCustomerPaymentHistory(customerEmail: string, limit = 10) {
  try {
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return [];
    }

    const customerId = customers.data[0].id;

    const charges = await stripe.charges.list({
      customer: customerId,
      limit,
    });

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      description: charge.description,
      status: charge.status,
      created: new Date(charge.created * 1000),
      receiptUrl: charge.receipt_url,
    }));
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw new Error('Failed to fetch payment history');
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(paymentIntentId: string, amount?: number, reason?: string) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount, // If not specified, refunds the full amount
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    };
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

// Export Stripe instance for direct access if needed
export { stripe };