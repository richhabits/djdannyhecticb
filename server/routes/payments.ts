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

import express from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import { handleStripeWebhook } from "@/server/domains/commerce/payments";
import { asyncHandler } from "../_core/errors";
import {
  verifyPayPalWebhookSignature,
  handlePayPalWebhook,
  getPayPalWebhookId,
} from "../_core/paypalHandler";

const router = express.Router();

// Stripe webhook endpoint (must be raw body for signature verification)
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const stripe = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Missing stripe-signature header");
    }

    if (!ENV.stripeWebhookSecret) {
      return res.status(500).send("Stripe webhook secret not configured");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        ENV.stripeWebhookSecret
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      // Security: Return generic error message, don't expose details
      return res.status(400).send("Webhook signature verification failed");
    }

    try {
      await handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error: unknown) {
      // Security: Don't expose implementation details in error responses
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error handling webhook:", message);
      // Log detailed error internally, return generic message to client
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);

// PayPal webhook endpoint (signature-verified before any state change is applied)
router.post("/webhook/paypal", express.json(), asyncHandler(async (req: express.Request, res: express.Response) => {
  let webhookId: string;
  try {
    webhookId = getPayPalWebhookId();
  } catch (error) {
    console.error("PayPal webhook: PAYPAL_WEBHOOK_ID not configured", error);
    return res.status(500).json({ error: "PayPal webhook not configured" });
  }

  const isValid = await verifyPayPalWebhookSignature(req, webhookId);
  if (!isValid) {
    console.warn("PayPal webhook: signature verification failed");
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  try {
    await handlePayPalWebhook(req.body, req);
    res.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error handling PayPal webhook:", message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}));

export function registerPaymentRoutes(app: express.Application) {
  app.use("/api/payments", router);
}

