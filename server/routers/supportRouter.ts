/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Support & Donations Router
 */

import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createSupportPaymentIntent } from "../lib/payments";
import { ENV } from "../_core/env";

export const supportRouter = router({
  /**
   * Create a payment intent for supporting/donating
   * Used by the Support page
   */
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        amount: z.string(), // Amount as string for flexibility
        currency: z.string().length(3).toUpperCase().default("GBP"),
        fanName: z.string().min(1).max(255),
        email: z.string().email(),
        message: z.string().max(1000).optional(),
        fanId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
        throw new Error("Stripe is not configured");
      }

      try {
        // Convert string amount to cents/smallest currency unit
        const amountNumber = parseFloat(input.amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
          throw new Error("Invalid amount");
        }

        // Convert to cents (assuming GBP uses pence)
        const amountInSmallestUnit = Math.round(amountNumber * 100);

        const result = await createSupportPaymentIntent({
          amount: amountInSmallestUnit,
          currency: input.currency,
          fanName: input.fanName,
          email: input.email,
          fanId: input.fanId,
          message: input.message,
        });

        return {
          success: true,
          paymentIntentId: result.paymentIntentId,
          clientSecret: result.clientSecret,
          supportEventId: result.supportEventId,
        };
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        throw new Error("Failed to create payment intent");
      }
    }),
});
