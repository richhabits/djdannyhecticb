import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ENV } from './env';
import { nanoid } from 'nanoid';

let s3Client: S3Client | null = null;

/**
 * Initialize S3 client
 */
export function getS3Client(): S3Client | null {
  if (!ENV.awsAccessKeyId || !ENV.awsSecretAccessKey || !ENV.awsS3Bucket) {
    console.warn('[S3] Not configured - missing AWS credentials');
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: ENV.awsRegion,
      credentials: {
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      },
    });
  }

  return s3Client;
}

/**
 * Upload file to S3
 */
export async function uploadFile(params: {
  file: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  const fileId = nanoid(10);
  const extension = params.filename.split('.').pop();
  const key = params.folder 
    ? `${params.folder}/${fileId}.${extension}`
    : `${fileId}.${extension}`;

  await client.send(new PutObjectCommand({
    Bucket: ENV.awsS3Bucket,
    Key: key,
    Body: params.file,
    ContentType: params.contentType,
  }));

  const url = ENV.awsS3PublicUrl
    ? `${ENV.awsS3PublicUrl}/${key}`
    : `https://${ENV.awsS3Bucket}.s3.${ENV.awsRegion}.amazonaws.com/${key}`;

  return { key, url };
}

/**
 * Generate presigned URL for downloading
 */
export async function getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  const command = new GetObjectCommand({
    Bucket: ENV.awsS3Bucket,
    Key: key,
  });

  return await getSignedUrl(client, command, { expiresIn });
}

/**
 * Generate presigned URL for uploading (for direct client uploads)
 */
export async function getUploadUrl(params: {
  filename: string;
  contentType: string;
  folder?: string;
  expiresIn?: number;
}): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  const fileId = nanoid(10);
  const extension = params.filename.split('.').pop();
  const key = params.folder 
    ? `${params.folder}/${fileId}.${extension}`
    : `${fileId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: ENV.awsS3Bucket,
    Key: key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { 
    expiresIn: params.expiresIn || 3600 
  });

  const publicUrl = ENV.awsS3PublicUrl
    ? `${ENV.awsS3PublicUrl}/${key}`
    : `https://${ENV.awsS3Bucket}.s3.${ENV.awsRegion}.amazonaws.com/${key}`;

  return { key, uploadUrl, publicUrl };
}

/**
 * Delete file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  await client.send(new DeleteObjectCommand({
    Bucket: ENV.awsS3Bucket,
    Key: key,
  }));
}

/**
 * Upload mix audio file
 */
export async function uploadMixAudio(params: {
  file: Buffer;
  filename: string;
  contentType: string;
}): Promise<{ audioUrl: string; downloadKey: string }> {
  const result = await uploadFile({
    file: params.file,
    filename: params.filename,
    contentType: params.contentType,
    folder: 'mixes',
  });

  return {
    audioUrl: result.url,
    downloadKey: result.key,
  };
}

/**
 * Upload cover image
 */
export async function uploadCoverImage(params: {
  file: Buffer;
  filename: string;
  contentType: string;
}): Promise<{ imageUrl: string }> {
  const result = await uploadFile({
    file: params.file,
    filename: params.filename,
    contentType: params.contentType,
    folder: 'covers',
  });

  return { imageUrl: result.url };
}

/**
 * Upload AI-generated voice
 */
export async function uploadAIVoice(params: {
  audioData: string; // base64
  jobId: number;
}): Promise<{ audioUrl: string }> {
  const buffer = Buffer.from(params.audioData.replace(/^data:audio\/\w+;base64,/, ''), 'base64');
  
  const result = await uploadFile({
    file: buffer,
    filename: `voice-${params.jobId}.mp3`,
    contentType: 'audio/mpeg',
    folder: 'ai-voices',
  });

  return { audioUrl: result.url };
}

/**
 * Upload AI-generated video
 */
export async function uploadAIVideo(params: {
  videoUrl: string; // URL from Replicate
  jobId: number;
}): Promise<{ videoUrl: string; thumbnailUrl?: string }> {
  // Download video from Replicate
  const response = await fetch(params.videoUrl);
  if (!response.ok) {
    throw new Error('Failed to download video from Replicate');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  
  const result = await uploadFile({
    file: buffer,
    filename: `video-${params.jobId}.mp4`,
    contentType: 'video/mp4',
    folder: 'ai-videos',
  });

  return { videoUrl: result.url };
}

/**
 * Upload profile avatar
 */
export async function uploadAvatar(params: {
  file: Buffer;
  filename: string;
  contentType: string;
  userId: number;
}): Promise<{ avatarUrl: string }> {
  const result = await uploadFile({
    file: params.file,
    filename: params.filename,
    contentType: params.contentType,
    folder: `avatars/${params.userId}`,
  });

  return { avatarUrl: result.url };
}

/**
 * List files in a folder
 */
export async function listFiles(folder: string): Promise<string[]> {
  const client = getS3Client();
  if (!client) {
    throw new Error('S3 is not configured');
  }

  const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
  
  const command = new ListObjectsV2Command({
    Bucket: ENV.awsS3Bucket,
    Prefix: folder,
  });

  const response = await client.send(command);
  return response.Contents?.map(item => item.Key || '') || [];
}
