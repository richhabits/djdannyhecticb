/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Router, Request, Response } from "express";
import crypto from "crypto";

/**
 * Vapi Webhook Handler
 * POST /api/webhooks/vapi
 *
 * Handles voice call transcripts → extracts booking data → logs to Hectic
 * Infrastructure stub - ready for Vapi API key integration
 */

export const vapiRouter = Router();

/**
 * Security: Verify Vapi webhook signature
 * Validates X-Vapi-Signature header against HMAC of request body
 */
function verifyVapiSignature(signature: string | undefined, body: any): boolean {
  // Get webhook secret from environment
  const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // If secret is not configured, log warning but allow (for dev/staging)
    if (process.env.NODE_ENV === "production") {
      console.warn("[Vapi] VAPI_WEBHOOK_SECRET not configured - webhook signature verification disabled");
      return false;
    }
    return true;
  }

  if (!signature) {
    console.warn("[Vapi] Missing X-Vapi-Signature header");
    return false;
  }

  // Compute HMAC-SHA256 of request body
  const bodyString = typeof body === "string" ? body : JSON.stringify(body);
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(bodyString)
    .digest("hex");

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

vapiRouter.post("/vapi", async (req: Request, res: Response) => {
  try {
    // Security: Verify webhook signature
    const signature = req.headers["x-vapi-signature"] as string | undefined;
    if (!verifyVapiSignature(signature, req.body)) {
      console.warn("[Vapi] Webhook signature verification failed");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body;
    const eventType = body.type;

    console.log(`[Vapi] ${eventType}:`, body);

    // Handle end-of-call
    if (eventType === "end-of-call") {
      const { transcript, phoneNumber, startedAt } = body;

      // TODO: When Vapi API key is available:
      // 1. Create hecticConversations with channel: "call"
      // 2. Parse call transcript to extract booking data
      // 3. Use extractBookingData from hecticExtractor
      // 4. Create hecticLeads + hecticMessages entries
      // 5. Log to commsLog

      console.log(`[Vapi Call] From ${phoneNumber} - Transcript: ${transcript?.substring(0, 100)}...`);

      // Stub response
      return res.json({ success: true, processed: true });
    }

    // Handle mid-call events (stub)
    if (eventType === "started" || eventType === "message") {
      console.log(`[Vapi Event] ${eventType}`);
      return res.json({ success: true });
    }

    // Unknown event
    res.json({ success: false, error: "Unknown event type" });
  } catch (error) {
    console.error("[Vapi Error]:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default vapiRouter;
