/**
 * Response Compression Middleware
 * Compresses responses to reduce bandwidth
 */

import { Request, Response, NextFunction } from "express";

const shouldCompress = (req: Request): boolean => {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  return acceptEncoding.includes("gzip") || acceptEncoding.includes("deflate");
};

const getCompressionType = (req: Request): "gzip" | "deflate" | null => {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (acceptEncoding.includes("gzip")) return "gzip";
  if (acceptEncoding.includes("deflate")) return "deflate";
  return null;
};

export function compressionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!shouldCompress(req)) {
    return next();
  }

  const compressionType = getCompressionType(req);
  if (!compressionType) {
    return next();
  }

  const originalSend = res.send;
  res.send = function (body: any) {
    // Only compress JSON and text responses
    const contentType = res.getHeader("content-type") || "";
    if (
      typeof body === "string" &&
      (contentType.includes("application/json") || contentType.includes("text/"))
    ) {
      try {
        const zlib = require("zlib");
        const compress = compressionType === "gzip" ? zlib.gzipSync : zlib.deflateSync;
        const compressed = compress(Buffer.from(body));
        
        res.setHeader("Content-Encoding", compressionType);
        res.setHeader("Content-Length", compressed.length.toString());
        
        return originalSend.call(this, compressed);
      } catch (error) {
        console.error("[Compression] Failed to compress:", error);
      }
    }
    
    return originalSend.call(this, body);
  };

  next();
}
