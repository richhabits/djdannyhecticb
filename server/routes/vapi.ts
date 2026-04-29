/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Router, Request, Response } from "express";

/**
 * Vapi Webhook Handler
 * POST /api/webhooks/vapi
 *
 * Handles voice call transcripts → extracts booking data → logs to Hectic
 * Infrastructure stub - ready for Vapi API key integration
 */

export const vapiRouter = Router();

vapiRouter.post("/vapi", async (req: Request, res: Response) => {
  try {
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
