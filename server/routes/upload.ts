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
            // STUB: createMediaItem function has been removed from db module
            // Media functions were removed from the schema/db layer
            // Returning upload URL without database persistence

            res.status(200).json({
                url,
                filename: key,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                message: 'File uploaded to S3 (database persistence disabled)'
            });
        } catch (error) {
            console.error("Upload failed", error);
            res.status(500).json({ error: "Upload failed" });
        }
    });
}
