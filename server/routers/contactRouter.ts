/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { sendContactConfirmation, sendContactNotification } from "../_core/email";
import { ENV } from "../_core/env";

// Rate limiting: simple in-memory store with 5 requests per IP per hour
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ipAddress: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ipAddress);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(ipAddress, { count: 1, resetTime: now + 3600000 }); // 1 hour
    return true;
  }

  if (entry.count >= 5) {
    return false; // Rate limited
  }

  entry.count++;
  return true;
}

export const contactRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(20).optional(),
        message: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ipAddress = ctx.ipAddress || "unknown";

      // Rate limiting check
      if (!checkRateLimit(ipAddress)) {
        throw new Error("Too many requests. Maximum 5 per hour allowed.");
      }

      try {
        // Store in database
        const messageId = await db.createContactMessage({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
          ipAddress,
          status: "new",
        });

        if (!messageId) {
          throw new Error("Failed to store message");
        }

        // Send confirmation email to user
        const confirmationSent = await sendContactConfirmation({
          name: input.name,
          email: input.email,
          phone: input.phone,
          message: input.message,
        });

        // Send notification to admin
        if (ENV.notificationsEmail) {
          await sendContactNotification(
            {
              name: input.name,
              email: input.email,
              phone: input.phone,
              message: input.message,
            },
            ipAddress
          );
        }

        return {
          success: true,
          messageId,
          confirmationSent,
        };
      } catch (error: unknown) {
        console.error("[Contact] Error submitting form:", error);
        throw new Error((error instanceof Error ? error.message : "Failed to submit contact form"));
      }
    }),

  list: adminProcedure
    .input(
      z.object({
        status: z.enum(["new", "responded", "archived"]).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const messages = await db.getContactMessages({
          status: input.status,
          limit: input.limit,
          offset: input.offset,
        });

        return messages;
      } catch (error: unknown) {
        console.error("[Contact] Error listing messages:", error);
        throw new Error("Failed to fetch messages");
      }
    }),

  markResolved: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const success = await db.markContactMessageResolved(input.id);
        return { success };
      } catch (error: unknown) {
        console.error("[Contact] Error marking resolved:", error);
        throw new Error("Failed to mark message as resolved");
      }
    }),
});
