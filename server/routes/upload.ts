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

// Security: Whitelist of allowed file extensions
const ALLOWED_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'gif', 'webp', // Images
    'mp3', 'wav', 'm4a',                   // Audio
    'mp4', 'webm'                          // Video
]);

// Whitelist of allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'video/mp4',
    'video/webm'
]);

// Security: Set file size limit to 10MB per file
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE, // 10MB limit
    },
});

/**
 * Validates file extension and MIME type against whitelists
 * @param filename Original filename
 * @param mimetype MIME type from file
 * @returns true if file is allowed, false otherwise
 */
function isFileAllowed(filename: string, mimetype: string): boolean {
    const fileExt = filename.split('.').pop()?.toLowerCase();

    if (!fileExt) {
        return false;
    }

    // Validate extension is in whitelist
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
        return false;
    }

    // Validate MIME type is in whitelist
    if (!ALLOWED_MIME_TYPES.has(mimetype)) {
        return false;
    }

    return true;
}

export function registerUploadRoutes(app: Express) {
    app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No file provided" });
            }

            const file = req.file;

            // Security: Validate file extension
            if (!isFileAllowed(file.originalname, file.mimetype)) {
                return res.status(400).json({
                    error: "File type not allowed. Allowed: jpg, jpeg, png, gif, webp, mp3, wav, m4a, mp4, webm"
                });
            }

            // Security: Validate file size (application-level check)
            if (file.size > MAX_FILE_SIZE) {
                return res.status(413).json({
                    error: `File too large. Maximum size is 10MB, received ${(file.size / 1024 / 1024).toFixed(2)}MB`
                });
            }

            const fileExt = file.originalname.split(".").pop()?.toLowerCase();
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
