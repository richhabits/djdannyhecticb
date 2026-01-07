/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import Stripe from "stripe";
import { ENV } from "../_core/env";
import * as db from "../db";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!ENV.stripeSecretKey) {
    return null;
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeInstance;
}

export interface CreatePaymentIntentParams {
  productId: number;
  amount: number; // in smallest currency unit (e.g., pence for GBP)
  currency: string;
  fanName: string;
  email?: string;
  fanId?: number;
}

export async function createStripePaymentIntent(params: CreatePaymentIntentParams) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const product = await db.getProduct(params.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // Create purchase record first
  const purchase = await db.createPurchase({
    fanId: params.fanId || null,
    fanName: params.fanName,
    email: params.email || null,
    productId: params.productId,
    amount: (params.amount / 100).toFixed(2), // Convert back to decimal
    currency: params.currency,
    status: "pending",
    paymentProvider: "stripe",
  });

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: {
      purchaseId: purchase.id.toString(),
      productId: params.productId.toString(),
      productName: product.name,
      fanName: params.fanName,
    },
    description: `Purchase: ${product.name}`,
  });

  // Update purchase with payment intent ID
  await db.updatePurchase(purchase.id, {
    paymentIntentId: paymentIntent.id,
  });

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    purchaseId: purchase.id,
  };
}

export async function handleStripeWebhook(event: Stripe.Event) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Handle product purchases
      const purchaseId = parseInt(paymentIntent.metadata.purchaseId || "0");
      if (purchaseId) {
        await db.updatePurchase(purchaseId, {
          status: "completed",
          transactionId: paymentIntent.id,
        });
      }

      // Handle support/donations
      const supportEventId = parseInt(paymentIntent.metadata.supportEventId || "0");
      if (supportEventId) {
        await db.updateSupportEvent(supportEventId, {
          status: "completed",
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      // Handle product purchases
      const purchaseId = parseInt(paymentIntent.metadata.purchaseId || "0");
      if (purchaseId) {
        await db.updatePurchase(purchaseId, {
          status: "failed",
        });
      }

      // Handle support/donations
      const supportEventId = parseInt(paymentIntent.metadata.supportEventId || "0");
      if (supportEventId) {
        await db.updateSupportEvent(supportEventId, {
          status: "failed",
        });
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;
      if (paymentIntentId) {
        const purchase = await db.getPurchaseByPaymentIntentId(paymentIntentId);
        if (purchase) {
          await db.updatePurchase(purchase.id, {
            status: "refunded",
          });
        }
      }
      break;
    }
  }
}

export interface CreateSupportPaymentIntentParams {
  amount: number; // in smallest currency unit (e.g., pence for GBP)
  currency: string;
  fanName: string;
  email?: string;
  fanId?: number;
  message?: string;
}

export async function createSupportPaymentIntent(params: CreateSupportPaymentIntentParams) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  // Create support event record first
  const supportEvent = await db.createSupportEvent({
    fanId: params.fanId || null,
    fanName: params.fanName,
    email: params.email || null,
    amount: (params.amount / 100).toFixed(2), // Convert to decimal string
    currency: params.currency,
    message: params.message || null,
    status: "pending",
  });

  // Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    metadata: {
      supportEventId: supportEvent.id.toString(),
      fanName: params.fanName,
      type: "support",
    },
    description: `Support: ${params.fanName}`,
  });

  // Update support event with payment intent ID (we'll need to add this field)
  // For now, we'll store it in the message or create a separate field
  // This is a simplified approach - in production you'd want a paymentIntentId field

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
    supportEventId: supportEvent.id,
  };
}

export async function createPayPalOrder(params: CreatePaymentIntentParams) {
  // PayPal integration would go here
  // For now, we'll create a purchase record and return order details
  const product = await db.getProduct(params.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const purchase = await db.createPurchase({
    fanId: params.fanId || null,
    fanName: params.fanName,
    email: params.email || null,
    productId: params.productId,
    amount: (params.amount / 100).toFixed(2),
    currency: params.currency,
    status: "pending",
    paymentProvider: "paypal",
  });

  // In a real implementation, you would create a PayPal order here
  // For now, return a mock order ID
  return {
    orderId: `paypal_${purchase.id}_${Date.now()}`,
    purchaseId: purchase.id,
  };
}

