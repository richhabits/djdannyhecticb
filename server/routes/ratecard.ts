/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import express from "express";
import { generateRateCardHTML } from "../_core/pdfGenerator";

const router = express.Router();

/**
 * GET /api/rate-card-pdf
 * Returns the rate card as a downloadable PDF (HTML format for browser rendering)
 */
router.get("/pdf", (req, res) => {
  try {
    const html = generateRateCardHTML();

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", 'attachment; filename="DJ-Danny-Hectic-B-Rate-Card-2024.html"');
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day

    res.send(html);
  } catch (error) {
    console.error("Error generating rate card:", error);
    res.status(500).json({
      error: "Failed to generate rate card",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/rate-card-json
 * Returns the rate card as JSON for API consumption
 */
router.get("/json", (req, res) => {
  try {
    const { RATE_CARD } = require("../_core/rateCardContent");

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=86400");

    res.json({
      success: true,
      data: RATE_CARD,
    });
  } catch (error) {
    console.error("Error fetching rate card:", error);
    res.status(500).json({
      error: "Failed to fetch rate card",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

export function registerRateCardRoutes(app: express.Application) {
  app.use("/api/rate-card", router);
}
