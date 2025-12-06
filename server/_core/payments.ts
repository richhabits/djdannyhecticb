/**
 * Payment Gateway Integration (Stripe)
 * Handles payment processing for bookings, products, and subscriptions
 */

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  clientSecret?: string;
}

export interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  metadata?: Record<string, string>;
  description?: string;
}

/**
 * Create a Stripe payment intent
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntent> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${stripeSecretKey}`,
      },
      body: new URLSearchParams({
        amount: params.amount.toString(),
        currency: params.currency || "gbp",
        metadata: JSON.stringify(params.metadata || {}),
        description: params.description || "Hectic Radio Payment",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      clientSecret: data.client_secret,
    };
  } catch (error) {
    console.error("[Payments] Stripe API call failed:", error);
    throw error;
  }
}

/**
 * Verify a payment intent
 */
export async function verifyPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
    };
  } catch (error) {
    console.error("[Payments] Stripe verification failed:", error);
    throw error;
  }
}

/**
 * Create a checkout session for one-time payments
 */
export async function createCheckoutSession(params: {
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  description?: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${stripeSecretKey}`,
      },
      body: new URLSearchParams({
        payment_method_types: "card",
        line_items: JSON.stringify([
          {
            price_data: {
              currency: params.currency || "gbp",
              product_data: {
                name: params.description || "Hectic Radio Payment",
              },
              unit_amount: params.amount,
            },
            quantity: 1,
          },
        ]),
        mode: "payment",
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: JSON.stringify(params.metadata || {}),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API error: ${error}`);
    }

    const data = await response.json();
    return {
      sessionId: data.id,
      url: data.url,
    };
  } catch (error) {
    console.error("[Payments] Stripe checkout session creation failed:", error);
    throw error;
  }
}
