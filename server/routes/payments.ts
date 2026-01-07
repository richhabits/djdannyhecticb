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
import { handleStripeWebhook } from "../lib/payments";

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
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error: any) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

export function registerPaymentRoutes(app: express.Application) {
  app.use("/api/payments", router);
}

