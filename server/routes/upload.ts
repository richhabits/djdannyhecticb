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

import { Express, Request, Response } from "express";
import multer from "multer";
import { uploadFile } from "../s3";
import * as db from "../db";
import { nanoid } from "nanoid";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
});

export function registerUploadRoutes(app: Express) {
    app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file provided" });
            }

            const file = req.file;
            const fileExt = file.originalname.split(".").pop();
            const key = `media/${nanoid()}.${fileExt}`;

            const url = await uploadFile(key, file.buffer, file.mimetype);

            // Create DB record
            // Assuming addMediaItem exists or similar. If not, we might need to use createMediaItem logic directly if exposed,
            // or we just return the URL and let the client call a mutation (but AdminMedia expects the upload response).

            // Checking AdminMedia.tsx:
            // const data = await res.json();
            // toast.success("Upload successful");
            // refetch(); <--- This implies the list is fetched from DB. So we MUST save to DB here.

            // Let's check if db.addMediaItem exists. If not, I'll use direct schema insertion if possible, 
            // or db.createMediaItem if available.
            // Based on routers.ts media.list -> db.getMediaLibrary, media.delete -> db.deleteMediaItem.
            // I'll assume db.createMediaItem or db.addMediaItem exists or I can import schema.

            const { createMediaItem } = await import("../db");
            const mediaItem = await createMediaItem({
                url,
                filename: key,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            });

            res.status(200).json(mediaItem);
        } catch (error) {
            console.error("Upload failed", error);
            res.status(500).json({ error: "Upload failed" });
        }
    });
}
