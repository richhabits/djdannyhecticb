import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

// Import the built server
const serverModule = await import('../dist/index.mjs');

// Handle all API requests through the built server
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // This is a placeholder - Vercel will route requests to this function
  // The actual server is configured to run on localhost:3000 in the build
  // For serverless, we need to use Vercel's middleware or Edge Functions

  res.status(503).json({
    error: 'Backend server not configured for serverless on Vercel',
    info: 'Please deploy to a platform that supports full Node.js apps (Railway, Render, Fly.io)'
  });
}
