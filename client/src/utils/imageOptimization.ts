export interface ResponsiveImageSet {
  size: number;
  url: string;
}

export interface OptimizedImageUrls {
  webp: string;
  fallback: string;
}

/**
 * Generate responsive image URLs for different viewport sizes
 */
export function generateResponsiveImages(
  src: string,
  sizes: number[] = [320, 640, 1024, 1440, 1920]
): ResponsiveImageSet[] {
  return sizes.map((size) => ({
    size,
    url: `${src}?w=${size}&q=80`,
  }));
}

/**
 * Get optimized image URL with width and quality parameters
 */
export function getOptimizedImageUrl(
  src: string,
  width: number,
  quality: number = 80,
  format: 'auto' | 'webp' | 'jpg' | 'png' = 'auto'
): string {
  const params = new URLSearchParams();
  params.set('w', width.toString());
  params.set('q', quality.toString());
  params.set('auto', format);

  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}${params.toString()}`;
}

/**
 * Generate srcSet string for responsive images
 */
export function generateSrcSet(
  src: string,
  sizes: number[] = [320, 640, 1024, 1440, 1920]
): string {
  return sizes
    .map((size) => `${getOptimizedImageUrl(src, size)} ${size}w`)
    .join(', ');
}

/**
 * Get sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints?: Array<{ maxWidth: number; size: string }>
): string {
  const defaults = [
    { maxWidth: 640, size: '100vw' },
    { maxWidth: 1024, size: '50vw' },
    { maxWidth: 1440, size: '33vw' },
  ];

  const bp = breakpoints || defaults;
  return bp.map((b) => `(max-width: ${b.maxWidth}px) ${b.size}`).join(', ') +
    ', 25vw';
}

/**
 * WebP with fallback support
 */
export function getPictureElement(
  src: string,
  quality: number = 80
): OptimizedImageUrls {
  return {
    webp: getOptimizedImageUrl(src, 1920, quality, 'webp'),
    fallback: getOptimizedImageUrl(src, 1920, quality, 'auto'),
  };
}

/**
 * Generate image URL for thumbnail/preview
 */
export function getThumbnailUrl(src: string, size: number = 200): string {
  return getOptimizedImageUrl(src, size, 70);
}

/**
 * Generate high-quality image URL for full-resolution display
 */
export function getHighQualityUrl(src: string, width: number = 1920): string {
  return getOptimizedImageUrl(src, width, 90);
}

/**
 * Calculate aspect ratio from width and height
 */
export function getAspectRatio(
  width: number,
  height: number
): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Get image dimensions from aspect ratio
 */
export function getDimensionsFromAspectRatio(
  aspectRatio: string,
  width: number
): { width: number; height: number } {
  const [w, h] = aspectRatio.split('/').map(Number);
  const height = (width * h) / w;
  return { width, height };
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate image loading time estimate
 */
export function estimateLoadTime(
  fileSize: number,
  connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium'
): number {
  const speeds = {
    slow: 2, // Mbps
    medium: 10, // Mbps
    fast: 50, // Mbps
  };

  const speed = speeds[connectionSpeed];
  const kilobytes = fileSize / 1024;
  const megabits = kilobytes / 128;
  return (megabits / speed) * 1000; // ms
}

/**
 * Image quality presets
 */
export const QUALITY_PRESETS = {
  thumbnail: 60,
  preview: 70,
  standard: 80,
  high: 85,
  maximum: 95,
};

/**
 * Image size presets for common use cases
 */
export const SIZE_PRESETS = {
  thumbnail: 200,
  small: 400,
  medium: 800,
  large: 1200,
  fullWidth: 1920,
};

/**
 * Breakpoints for responsive images
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
  ultraWide: 1920,
};
