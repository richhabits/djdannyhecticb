/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Express, Request, Response } from "express";
import { spawn } from "child_process";
import path from "path";

// Verify Vercel cron secret if present
function verifyCronSecret(req: Request): boolean {
  const token = req.headers.authorization?.split(" ")[1];
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    // In development, allow all cron requests
    return process.env.NODE_ENV === "development";
  }

  return token === expected;
}

function runJob(jobPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("tsx", [jobPath], {
      stdio: "inherit",
      env: { ...process.env },
      timeout: 540000, // 9 minutes max
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Job exited with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

export function registerCronRoutes(app: Express) {
  // Hectic AI lead follow-up (daily at 9am)
  app.post("/api/cron/lead-followup", async (req: Request, res: Response) => {
    if (!verifyCronSecret(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      console.log("[CRON] Starting hectic lead follow-up job...");
      const jobPath = path.join(process.cwd(), "jobs", "hectic-lead-followup.ts");
      await runJob(jobPath);
      res.json({ success: true, job: "hectic-lead-followup" });
    } catch (error) {
      console.error("[CRON] Lead follow-up failed:", error);
      res.status(500).json({ error: "Job failed" });
    }
  });

  // Jarvis daily insights generation (daily at 7am)
  app.post("/api/cron/jarvis-insights", async (req: Request, res: Response) => {
    if (!verifyCronSecret(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      console.log("[CRON] Starting Jarvis insights generation...");
      const jobPath = path.join(process.cwd(), "jobs", "jarvis-daily-insights.ts");
      await runJob(jobPath);
      res.json({ success: true, job: "jarvis-daily-insights" });
    } catch (error) {
      console.error("[CRON] Jarvis insights failed:", error);
      res.status(500).json({ error: "Job failed" });
    }
  });

  // Booking reminder emails (daily at 10am)
  app.post("/api/cron/booking-reminders", async (req: Request, res: Response) => {
    if (!verifyCronSecret(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      console.log("[CRON] Starting booking reminders...");
      const jobPath = path.join(process.cwd(), "jobs", "booking-reminders.ts");
      await runJob(jobPath);
      res.json({ success: true, job: "booking-reminders" });
    } catch (error) {
      console.error("[CRON] Booking reminders failed:", error);
      res.status(500).json({ error: "Job failed" });
    }
  });
}
