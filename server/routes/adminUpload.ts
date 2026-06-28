import type { Express, Request, Response } from "express";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authenticateSession } from "@/server/domains/auth";

const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/aac", "audio/ogg", "audio/flac"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AUDIO_BYTES = 500 * 1024 * 1024; // 500MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  // 10MB

export function registerAdminUploadRoutes(app: Express): void {
  app.post("/api/admin/upload", async (req: Request, res: Response) => {
    const auth = await authenticateSession(req);
    if (!auth.success || !auth.user || auth.user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }

    try {
      const jsonResponse = await handleUpload({
        body: req.body as HandleUploadBody,
        request: req,
        onBeforeGenerateToken: async (_pathname, clientPayloadRaw) => {
          const { fileType } = clientPayloadRaw ? JSON.parse(clientPayloadRaw) : {};
          const isAudio = fileType === "audio";
          return {
            allowedContentTypes: isAudio ? ALLOWED_AUDIO_TYPES : ALLOWED_IMAGE_TYPES,
            maximumSizeInBytes: isAudio ? MAX_AUDIO_BYTES : MAX_IMAGE_BYTES,
            addRandomSuffix: true,
          };
        },
        onUploadCompleted: async () => {
          // URL is returned to client; admin creates the mix record via tRPC
        },
      });
      res.json(jsonResponse);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message || "Upload failed" });
    }
  });
}
