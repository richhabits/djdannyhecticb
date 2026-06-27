/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import type { Express, Request, Response } from "express";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authenticateSession } from "@/server/domains/auth";
import { getDb } from "@/server/db";
import { clientUploads as uploads, uploadTypeEnum } from "@/drizzle/portal-schema";
type UploadType = typeof uploadTypeEnum.enumValues[number];
import { hasQuotaFor, adjustStorageUsage, UPLOAD_SIZE_CAPS } from "./storageQuota";

const UPLOAD_TYPES = new Set<UploadType>(["track", "playlist", "photo", "video", "layout", "doc"]);

const ALLOWED_CONTENT_TYPES: Record<UploadType, string[]> = {
  track: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/x-wav", "audio/aac"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  photo: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  layout: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  doc: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
  playlist: ["image/jpeg", "image/png", "image/webp"],
};

interface ClientUploadPayload {
  type: UploadType;
  title?: string;
  description?: string;
  duration?: number;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  rightsConfirmed: boolean;
  /** Set for the auto-generated video thumbnail frame — skips the uploads row + quota debit. */
  isThumbnail?: boolean;
}

interface TokenPayload extends ClientUploadPayload {
  userId: number;
}

export function registerPortalUploadRoutes(app: Express): void {
  app.post("/api/portal/upload", async (req: Request, res: Response) => {
    const auth = await authenticateSession(req);
    if (!auth.success || !auth.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const user = auth.user;

    try {
      const jsonResponse = await handleUpload({
        body: req.body as HandleUploadBody,
        request: req,
        onBeforeGenerateToken: async (pathname, clientPayloadRaw) => {
          if (!clientPayloadRaw) {
            throw new Error("Missing upload metadata");
          }

          const clientPayload: ClientUploadPayload = JSON.parse(clientPayloadRaw);

          if (!UPLOAD_TYPES.has(clientPayload.type)) {
            throw new Error("Invalid upload type");
          }

          if (!clientPayload.rightsConfirmed) {
            throw new Error("Rights confirmation is required before uploading");
          }

          const sizeCap = UPLOAD_SIZE_CAPS[clientPayload.type];
          if (clientPayload.fileSize > sizeCap) {
            throw new Error(`File exceeds the ${(sizeCap / (1024 * 1024)).toFixed(0)}MB limit for this upload type`);
          }

          const withinQuota = await hasQuotaFor(user.id, clientPayload.fileSize);
          if (!withinQuota) {
            throw new Error("Storage quota exceeded (5GB limit)");
          }

          const tokenPayload: TokenPayload = { ...clientPayload, userId: user.id };

          return {
            allowedContentTypes: ALLOWED_CONTENT_TYPES[clientPayload.type],
            maximumSizeInBytes: sizeCap,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify(tokenPayload),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload: tokenPayloadRaw }) => {
          if (!tokenPayloadRaw) return;
          const payload: TokenPayload = JSON.parse(tokenPayloadRaw);

          if (payload.isThumbnail) return;

          const db = await getDb();
          if (!db) return;

          await db.insert(uploads).values({
            userId: payload.userId,
            type: payload.type,
            fileUrl: blob.url,
            fileName: blob.pathname,
            fileSize: payload.fileSize,
            mimeType: payload.mimeType,
            duration: payload.duration,
            thumbnailUrl: payload.thumbnailUrl,
            title: payload.title,
            description: payload.description,
            rightsConfirmed: payload.rightsConfirmed,
          });

          await adjustStorageUsage(payload.userId, payload.fileSize);
        },
      });

      res.json(jsonResponse);
    } catch (error) {
      console.error("[PortalUpload] Error handling upload:", error);
      res.status(400).json({ error: (error as Error).message || "Upload failed" });
    }
  });
}
