import multer from "multer";
import { storagePut } from "./storage";
import { Router } from "express";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `uploads/${timestamp}-${random}${ext}`;

    // Upload to storage (S3 or local proxy)
    const { url } = await storagePut(filename, file.buffer, file.mimetype);

    res.json({ url });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});
