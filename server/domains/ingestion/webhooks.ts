/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Express } from "express";
import { vapiRouter } from "@/server/routes/vapi";
import { telnyxRouter } from "@/server/routes/telnyx";

export function registerWebhookRoutes(app: Express) {
  app.use("/api/webhooks", vapiRouter);
  app.use("/api/webhooks", telnyxRouter);
}
