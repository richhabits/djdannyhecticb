/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * AI & Automation Routers Index
 * Central file to import and register all AI routers
 */

import { Router } from "express";
import aiSummarizationRouter from "./aiSummarizationRouter";
import aiModerationRouter from "./aiModerationRouter";
import aiRecommendationsRouter from "./aiRecommendationsRouter";
import aiAnalyticsRouter from "./aiAnalyticsRouter";

/**
 * Mount all AI routers
 * Usage in main server file:
 *
 * import { mountAIRouters } from './routers/aiRoutersIndex';
 * const app = express();
 * mountAIRouters(app);
 */
export function mountAIRouters(app: Router | any): void {
  // Chat Summarization & Metadata Generation
  app.use("/api/ai", aiSummarizationRouter);

  // Spam Detection & Smart Moderation
  app.use("/api/moderation", aiModerationRouter);

  // Content Recommendations
  app.use("/api/recommendations", aiRecommendationsRouter);

  // Predictive Analytics
  app.use("/api/analytics", aiAnalyticsRouter);

  console.log(
    "[AI Routers] Mounted 4 AI router groups:\n" +
      "  ✓ /api/ai (summarization, metadata generation)\n" +
      "  ✓ /api/moderation (spam detection, toxicity analysis)\n" +
      "  ✓ /api/recommendations (personalized recommendations)\n" +
      "  ✓ /api/analytics (predictive analytics)"
  );
}

/**
 * List of all AI endpoints for documentation
 */
export const AI_ENDPOINTS = {
  summarization: {
    "POST /api/ai/summarize-chat": "Generate AI-powered chat summary",
    "POST /api/ai/generate-clip-metadata":
      "Generate clip title, description, tags",
    "GET /api/ai/chat-summary/:liveSessionId": "Retrieve stored chat summary",
    "GET /api/ai/status": "Get Claude API rate limit status",
  },
  moderation: {
    "POST /api/moderation/analyze": "Analyze message for spam/toxicity",
    "GET /api/moderation/queue": "Get moderation review queue",
    "POST /api/moderation/review": "Review a moderation flag",
    "GET /api/moderation/dashboard": "Get moderation stats dashboard",
  },
  recommendations: {
    "POST /api/recommendations/track-impression":
      "Track recommendation impression",
    "POST /api/recommendations/track-click": "Track recommendation click",
    "GET /api/recommendations/trending": "Get trending content",
    "GET /api/recommendations/personalized/:userId":
      "Get personalized recommendations",
    "GET /api/recommendations/related/:contentId": "Get related content",
    "POST /api/recommendations/generate": "Generate recommendations for user",
    "GET /api/recommendations/stats": "Get recommendation performance stats",
  },
  analytics: {
    "POST /api/analytics/predict-audience":
      "Predict audience size for stream",
    "POST /api/analytics/predict-churn": "Predict subscriber churn risk",
    "POST /api/analytics/predict-content-performance":
      "Predict content performance",
    "GET /api/analytics/churn-predictions": "Get recent churn predictions",
  },
};

/**
 * Export individual routers for direct use
 */
export {
  aiSummarizationRouter,
  aiModerationRouter,
  aiRecommendationsRouter,
  aiAnalyticsRouter,
};
