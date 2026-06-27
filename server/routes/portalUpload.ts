/**
 * Vercel Blob upload handler for the client portal.
 * Uses handleUpload to issue client tokens and handle completed callbacks.
 */

import express, { Request, Response } from "express";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authenticateSession } from "../domains/auth/adminAuth";
import { getDb } from "@/server/db";
import { clientUploads, storageUsage } from "../../drizzle/portal-schema";
import { eq, sql } from "drizzle-orm";

const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

const ALLOWED_TYPES: Record<string, string[]> = {
  "audio/mpeg": ["track"],
  "audio/mp3": ["track"],
  "audio/wav": ["track"],
  "audio/aiff": ["track"],
  "audio/flac": ["track"],
  "video/mp4": ["video"],
  "video/quicktime": ["video"],
  "video/webm": ["video"],
  "image/jpeg": ["photo", "layout"],
  "image/png": ["photo", "layout"],
  "image/webp": ["photo"],
  "image/gif": ["photo"],
  "application/pdf": ["doc"],
  "application/msword": ["doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["doc"],
};

const SIZE_LIMITS: Record<string, number> = {
  track: 50 * 1024 * 1024,    // 50 MB
  video: 500 * 1024 * 1024,   // 500 MB
  photo: 10 * 1024 * 1024,    // 10 MB
  layout: 10 * 1024 * 1024,   // 10 MB
  doc: 20 * 1024 * 1024,      // 20 MB
  playlist: 10 * 1024 * 1024, // 10 MB
};

export function registerPortalUploadRoutes(app: express.Application) {
  app.post("/api/portal/upload-url", async (req: Request, res: Response) => {
    try {
      const auth = await authenticateSession(undefined, req);
      if (!auth.success || !auth.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = auth.user.id;

      // Check storage quota before issuing token
      const db = await getDb();
      if (db) {
        const usage = await db
          .select({ bytesUsed: storageUsage.bytesUsed })
          .from(storageUsage)
          .where(eq(storageUsage.clientId, userId))
          .limit(1)
          .then(r => r[0]);

        const currentBytes = usage?.bytesUsed ?? 0;
        const fileSizeHeader = req.headers["x-file-size"];
        const fileSize = fileSizeHeader ? parseInt(String(fileSizeHeader)) : 0;

        if (currentBytes + fileSize > STORAGE_QUOTA_BYTES) {
          return res.status(403).json({ error: "Storage quota exceeded (5 GB limit)" });
        }
      }

      const jsonBody = req.body as HandleUploadBody;

      const response = await handleUpload({
        body: jsonBody,
        request: req,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          const parsed = clientPayload ? JSON.parse(clientPayload) : {};
          const uploadType = parsed.uploadType || "doc";
          const maxSizeBytes = SIZE_LIMITS[uploadType] ?? SIZE_LIMITS.doc;

          // Private for tracks/docs, public for images/avatars
          const isPrivate = uploadType === "track" || uploadType === "doc";

          return {
            allowedContentTypes: Object.keys(ALLOWED_TYPES),
            maximumSizeInBytes: maxSizeBytes,
            access: isPrivate ? "private" : "public",
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({
              userId,
              uploadType,
              title: parsed.title,
              description: parsed.description,
              rightsConfirmed: parsed.rightsConfirmed,
              duration: parsed.duration,
              thumbnailUrl: parsed.thumbnailUrl,
            }),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          const parsed = tokenPayload ? JSON.parse(tokenPayload) : {};
          const { userId, uploadType, title, description, rightsConfirmed, duration, thumbnailUrl } = parsed;

          const db = await getDb();
          if (!db || !userId) return;

          // Resolve mime type
          const mimeType = blob.contentType || "application/octet-stream";

          // Insert upload record
          await db.insert(clientUploads).values({
            clientId: userId,
            type: uploadType || "doc",
            fileUrl: blob.url,
            fileName: blob.pathname.split("/").pop() || blob.pathname,
            fileSize: blob.size,
            mimeType,
            duration: duration ? String(duration) : null,
            thumbnailUrl: thumbnailUrl || null,
            title: title || blob.pathname.split("/").pop() || null,
            description: description || null,
            rightsConfirmed: !!rightsConfirmed,
            status: "pending",
          });

          // Update storage usage
          await db
            .insert(storageUsage)
            .values({ clientId: userId, bytesUsed: blob.size })
            .onConflictDoUpdate({
              target: storageUsage.clientId,
              set: {
                bytesUsed: sql`${storageUsage.bytesUsed} + ${blob.size}`,
                updatedAt: new Date(),
              },
            });
        },
      });

      return res.json(response);
    } catch (error) {
      console.error("[PortalUpload] Error:", error);
      return res.status(400).json({ error: "Upload failed" });
    }
  });
}
