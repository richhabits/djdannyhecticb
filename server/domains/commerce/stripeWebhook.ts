/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Stripe Webhook Handler for Live Donations
 */

import Stripe from "stripe";
import { getDb } from "../db";
import { donations, notifications } from "../../drizzle/engagement-schema";
import { eq } from "drizzle-orm";
import { ENV } from "./env";

const stripe = new Stripe(ENV.stripeSecretKey || "");

/**
 * Process Stripe webhook events
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      message: "Database not available",
    };
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent, db);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, db);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge, db);
        break;

      case "dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute, db);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return {
      success: true,
      message: "Webhook processed successfully",
    };
  } catch (error) {
    console.error("Webhook processing error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  db: ReturnType<typeof getDb>
) {
  if (!db) return;

  // Find the donation record
  const donationRecords = await db
    .select()
    .from(donations)
    .where(eq(donations.stripePaymentId, paymentIntent.id));

  if (donationRecords.length === 0) {
    console.warn(`No donation found for payment intent: ${paymentIntent.id}`);
    return;
  }

  const donation = donationRecords[0];

  // Update donation status
  await db
    .update(donations)
    .set({
      status: "completed",
      stripeChargeId: paymentIntent.charges.data[0]?.id || "",
      updatedAt: new Date(),
    })
    .where(eq(donations.id, donation.id));

  console.log(`Payment succeeded for donation ${donation.id}`);
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  db: ReturnType<typeof getDb>
) {
  if (!db) return;

  const donationRecords = await db
    .select()
    .from(donations)
    .where(eq(donations.stripePaymentId, paymentIntent.id));

  if (donationRecords.length === 0) {
    return;
  }

  const donation = donationRecords[0];

  // Update donation status
  await db
    .update(donations)
    .set({
      status: "failed",
      updatedAt: new Date(),
    })
    .where(eq(donations.id, donation.id));

  console.log(`Payment failed for donation ${donation.id}`);
}

/**
 * Handle charge refund
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  db: ReturnType<typeof getDb>
) {
  if (!db) return;

  if (!charge.payment_intent || typeof charge.payment_intent !== "string") {
    return;
  }

  const donationRecords = await db
    .select()
    .from(donations)
    .where(eq(donations.stripePaymentId, charge.payment_intent));

  if (donationRecords.length === 0) {
    return;
  }

  const donation = donationRecords[0];

  // Update donation status
  await db
    .update(donations)
    .set({
      status: "refunded",
      updatedAt: new Date(),
    })
    .where(eq(donations.id, donation.id));

  console.log(`Refund processed for donation ${donation.id}`);
}

/**
 * Handle dispute creation (chargeback)
 */
async function handleDisputeCreated(
  dispute: Stripe.Dispute,
  db: ReturnType<typeof getDb>
) {
  if (!db) return;

  // Find related donation if possible
  if (dispute.charge && typeof dispute.charge === "string") {
    console.warn(`Dispute created for charge ${dispute.charge}`);
    // Could log to monitoring system here
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    stripe.webhooks.constructEvent(body, signature, secret);
    return true;
  } catch {
    return false;
  }
}
