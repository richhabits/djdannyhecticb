/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Image Optimization Utilities
 * Provides helpers for serving optimized images with WebP, responsive srcset, and lazy loading
 */

interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "png" | "jpg" | "auto";
}

interface ResponsiveImage {
  src: string;
  srcset: string;
  webpSrcset: string;
  sizes: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Standard breakpoints for responsive images
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  widescreen: 1440,
  ultrawide: 1920,
} as const;

/**
 * Generate srcset string for responsive images
 */
export function generateSrcset(
  baseUrl: string,
  widths: number[] = [480, 768, 1024, 1440, 1920],
  quality: number = 75
): string {
  return widths
    .map(width => `${baseUrl}?w=${width}&q=${quality} ${width}w`)
    .join(", ");
}

/**
 * Generate WebP srcset with fallback
 */
export function generateWebpSrcset(
  baseUrl: string,
  widths: number[] = [480, 768, 1024, 1440, 1920],
  quality: number = 75
): string {
  return widths
    .map(width => `${baseUrl}?w=${width}&q=${quality}&format=webp ${width}w`)
    .join(", ");
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: Record<string, string> = {
    "max-width: 640px": "100vw",
    "max-width: 1024px": "50vw",
    "max-width: 1440px": "33vw",
  }
): string {
  return Object.entries(breakpoints)
    .map(([media, size]) => `(${media}) ${size}`)
    .join(", ");
}

/**
 * Create a complete responsive image object
 */
export function createResponsiveImage(
  src: string,
  alt: string,
  options: {
    widths?: number[];
    quality?: number;
    sizes?: string;
    width?: number;
    height?: number;
  } = {}
): ResponsiveImage {
  const {
    widths = [480, 768, 1024, 1440, 1920],
    quality = 75,
    sizes = generateSizes(),
  } = options;

  // Remove query params from src for srcset generation
  const baseSrc = src.split("?")[0];

  return {
    src: `${baseSrc}?w=1024&q=${quality}`,
    srcset: generateSrcset(baseSrc, widths, quality),
    webpSrcset: generateWebpSrcset(baseSrc, widths, quality),
    sizes,
    alt,
    width: options.width,
    height: options.height,
  };
}

/**
 * Get image dimensions for aspect ratio
 */
export function getImageDimensions(
  width: number,
  height: number
): ImageDimensions {
  return {
    width,
    height,
    aspectRatio: width / height,
  };
}

/**
 * Generate placeholder styles for lazy loading
 */
export function generatePlaceholderStyles(
  width: number,
  height: number
): Record<string, string> {
  const aspectRatio = (height / width) * 100;

  return {
    paddingBottom: `${aspectRatio}%`,
    position: "relative",
    backgroundColor: "#f3f4f6",
  };
}

/**
 * Generate blur-up placeholder image URL
 */
export function generateBlurPlaceholder(
  src: string,
  width: number = 10,
  quality: number = 20
): string {
  const baseSrc = src.split("?")[0];
  return `${baseSrc}?w=${width}&q=${quality}&blur=true`;
}

/**
 * Calculate optimal dimensions for container
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  aspectRatio: number,
  maxWidth: number = 1920
): { width: number; height: number } {
  const width = Math.min(containerWidth, maxWidth);
  const height = Math.round(width / aspectRatio);

  return { width, height };
}

/**
 * Format image URL with optimization parameters
 */
export function formatImageUrl(
  url: string,
  options: ImageOptions = {}
): string {
  const {
    width,
    height,
    quality = 75,
    format = "auto",
  } = options;

  const params = new URLSearchParams();

  if (width) params.set("w", width.toString());
  if (height) params.set("h", height.toString());
  params.set("q", quality.toString());

  if (format !== "auto") {
    params.set("format", format);
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}${params.toString()}`;
}

/**
 * Image optimization recommendations for different use cases
 */
export const IMAGE_OPTIMIZATION_PRESETS = {
  // Hero images - large, high quality
  hero: {
    widths: [640, 1280, 1920],
    quality: 80,
    sizes: "(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 100vw",
  },
  // Thumbnail images - small, lower quality acceptable
  thumbnail: {
    widths: [160, 320, 480],
    quality: 60,
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  },
  // Avatar images - very small
  avatar: {
    widths: [48, 96, 192],
    quality: 65,
    sizes: "48px",
  },
  // Card images - medium sized
  card: {
    widths: [320, 640, 960],
    quality: 70,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  },
  // Background images
  background: {
    widths: [640, 1280, 1920, 2560],
    quality: 75,
    sizes: "100vw",
  },
} as const;

/**
 * Get optimization preset
 */
export function getImagePreset(
  type: keyof typeof IMAGE_OPTIMIZATION_PRESETS
): typeof IMAGE_OPTIMIZATION_PRESETS[keyof typeof IMAGE_OPTIMIZATION_PRESETS] {
  return IMAGE_OPTIMIZATION_PRESETS[type];
}
