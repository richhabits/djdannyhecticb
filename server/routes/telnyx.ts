/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Router, Request, Response } from "express";

/**
 * Telnyx Webhook Handler
 * POST /api/webhooks/telnyx
 *
 * Handles inbound SMS → routes to Hectic AI → replies via Telnyx
 * Infrastructure stub - ready for Telnyx API key integration
 */

export const telnyxRouter = Router();

telnyxRouter.post("/telnyx", async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const eventType = body.data?.event_type;

    console.log(`[Telnyx] ${eventType}:`, body.data);

    // Handle inbound SMS
    if (eventType === "message.received") {
      const { from, body: messageBody, id: messageId } = body.data;

      // TODO: When Telnyx API key is available:
      // 1. Create hecticConversations with channel: "sms"
      // 2. Call Hectic AI via hectic.chat endpoint
      // 3. Reply via Telnyx Send Message API

      console.log(`[Telnyx SMS] From ${from}: ${messageBody}`);

      // Stub response - just acknowledge receipt for now
      return res.json({ success: true, messageId });
    }

    // Handle call events (stub only)
    if (eventType === "call.started" || eventType === "call.ended") {
      console.log(`[Telnyx Call] ${eventType}`);
      return res.json({ success: true });
    }

    // Unknown event
    res.json({ success: false, error: "Unknown event type" });
  } catch (error) {
    console.error("[Telnyx Error]:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default telnyxRouter;
