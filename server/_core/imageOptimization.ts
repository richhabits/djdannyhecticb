import sharp from 'sharp';
import { uploadFile } from './storage';
import { nanoid } from 'nanoid';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  generateSizes?: number[];
}

interface OptimizedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Optimize image for web
 */
export async function optimizeImage(
  input: Buffer | string,
  options: OptimizeOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp',
  } = options;

  let image = sharp(input);

  // Get metadata
  const metadata = await image.metadata();

  // Resize if needed
  if (metadata.width && metadata.width > maxWidth || metadata.height && metadata.height > maxHeight) {
    image = image.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert format
  switch (format) {
    case 'webp':
      image = image.webp({ quality });
      break;
    case 'jpeg':
      image = image.jpeg({ quality, progressive: true });
      break;
    case 'png':
      image = image.png({ quality, progressive: true, compressionLevel: 9 });
      break;
    case 'avif':
      image = image.avif({ quality });
      break;
  }

  return await image.toBuffer();
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveImages(
  input: Buffer | string,
  options: OptimizeOptions = {}
): Promise<OptimizedImage[]> {
  const {
    generateSizes = [320, 640, 1024, 1920],
    quality = 80,
    format = 'webp',
  } = options;

  const results: OptimizedImage[] = [];

  for (const width of generateSizes) {
    const optimized = await sharp(input)
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });

    results.push({
      url: '', // To be filled by upload
      width: optimized.info.width,
      height: optimized.info.height,
      format: optimized.info.format,
      size: optimized.data.length,
    });
  }

  return results;
}

/**
 * Upload and optimize cover image
 */
export async function uploadOptimizedCover(
  fileBuffer: Buffer,
  filename: string
): Promise<{ url: string; thumbnailUrl: string }> {
  const id = nanoid();

  // Generate main image (1920x1080 max)
  const mainImage = await optimizeImage(fileBuffer, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 85,
    format: 'webp',
  });

  // Generate thumbnail (320x180)
  const thumbnail = await optimizeImage(fileBuffer, {
    maxWidth: 320,
    maxHeight: 180,
    quality: 75,
    format: 'webp',
  });

  // Upload both
  const mainUrl = await uploadFile({
    buffer: mainImage,
    filename: `covers/${id}-main.webp`,
    contentType: 'image/webp',
    folder: 'covers',
  });

  const thumbnailUrl = await uploadFile({
    buffer: thumbnail,
    filename: `covers/${id}-thumb.webp`,
    contentType: 'image/webp',
    folder: 'covers',
  });

  return { url: mainUrl, thumbnailUrl };
}

/**
 * Optimize avatar image
 */
export async function uploadOptimizedAvatar(
  fileBuffer: Buffer,
  userId: string | number
): Promise<string> {
  // Generate square avatar (400x400)
  const optimized = await sharp(fileBuffer)
    .resize(400, 400, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 85 })
    .toBuffer();

  return await uploadFile({
    buffer: optimized,
    filename: `avatars/${userId}-${nanoid()}.webp`,
    contentType: 'image/webp',
    folder: 'avatars',
  });
}

/**
 * Create image placeholder (blur hash)
 */
export async function generateBlurHash(input: Buffer | string): Promise<string> {
  const smallImage = await sharp(input)
    .resize(20, 20, { fit: 'cover' })
    .blur(2)
    .toBuffer();

  return `data:image/webp;base64,${smallImage.toString('base64')}`;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  input: Buffer | string
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(input).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}

/**
 * Compress image aggressively
 */
export async function compressImage(
  input: Buffer | string,
  targetSizeKB: number = 100
): Promise<Buffer> {
  let quality = 80;
  let result = await optimizeImage(input, { quality, format: 'webp' });

  // Iteratively reduce quality until size is met
  while (result.length > targetSizeKB * 1024 && quality > 20) {
    quality -= 10;
    result = await optimizeImage(input, { quality, format: 'webp' });
  }

  return result;
}
