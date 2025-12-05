import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client - configure with environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-west-2",
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || "hectic-radio-assets";

/**
 * Generate a presigned URL for downloading a file from S3
 */
export async function getDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Get the public URL for an S3 object (for public buckets)
 */
export function getPublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-west-2"}.amazonaws.com/${key}`;
}

/**
 * Generate download URLs for a mix in different formats
 */
export async function getMixDownloadUrls(mixId: string): Promise<{
  mp3?: string;
  wav?: string;
  flac?: string;
}> {
  const baseKey = `mixes/${mixId}`;
  const urls: { mp3?: string; wav?: string; flac?: string } = {};

  try {
    urls.mp3 = await getDownloadUrl(`${baseKey}/mix.mp3`);
  } catch (e) {
    // File doesn't exist
  }

  try {
    urls.wav = await getDownloadUrl(`${baseKey}/mix.wav`);
  } catch (e) {
    // File doesn't exist
  }

  try {
    urls.flac = await getDownloadUrl(`${baseKey}/mix.flac`);
  } catch (e) {
    // File doesn't exist
  }

  return urls;
}

export default {
  getDownloadUrl,
  getUploadUrl,
  getPublicUrl,
  getMixDownloadUrls,
};
