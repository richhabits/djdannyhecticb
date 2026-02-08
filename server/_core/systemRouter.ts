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

import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative").optional(),
      }).optional()
    )
    .query(() => ({
      ok: true,
      timestamp: Date.now()
    })),

  autonomousStatus: adminProcedure.query(async () => {
    const { autonomousEngine } = await import("./autonomousEngine");
    return autonomousEngine.getStatus();
  }),


  stats: adminProcedure.query(async () => {
    try {
      const { observability } = await import("./observability");
      // 1. Disk Usage (df -h /)
      // output format example: Filesystem Size Used Avail Capacity iused ifree %iused  Mounted on
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);

      const [disk, uptime, mem] = await Promise.all([
        execAsync("df -h /").catch(() => ({ stdout: "" })),
        execAsync("uptime").catch(() => ({ stdout: "" })),
        // Mac specific memory check (vm_stat), Linux would be 'free -m'
        process.platform === "darwin"
          ? execAsync("vm_stat").catch(() => ({ stdout: "" }))
          : execAsync("free -m").catch(() => ({ stdout: "" }))
      ]);

      // Parse Disk
      const diskLines = disk.stdout.trim().split("\n");
      const diskInfo = diskLines[1]?.replace(/\s+/g, " ").split(" ") || [];
      const diskUsage = {
        total: diskInfo[1] || "Unknown",
        used: diskInfo[2] || "Unknown",
        free: diskInfo[3] || "Unknown",
        percent: diskInfo[4] || "0%",
      };

      // Parse Uptime
      const uptimeStr = uptime.stdout.trim();

      return {
        disk: diskUsage,
        uptime: uptimeStr,
        metrics: observability.getMetrics(),
        serverTime: new Date().toISOString(),
        platform: process.platform,
        ok: true,
      };
    } catch (error) {
      console.error("Failed to fetch system stats:", error);
      return {
        disk: { total: "-", used: "-", free: "-", percent: "0%" },
        uptime: "Unavailable",
        metrics: null,
        serverTime: new Date().toISOString(),
        platform: process.platform,
        ok: false,
      };
    }
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
