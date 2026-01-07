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

/**
 * Utilities for social sharing and analytics
 */

export interface ShareOptions {
  url: string;
  title: string;
  description?: string;
  source?: string;
  medium?: string;
}

/**
 * Build a URL with UTM parameters for analytics tracking
 */
export function buildShareUrl(
  baseUrl: string,
  source: string,
  medium: string = "social"
): string {
  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  return url.toString();
}

/**
 * Generate WhatsApp share URL
 */
export function getWhatsAppShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "whatsapp", "social");
  const text = options.description 
    ? `${options.title}\n\n${options.description}\n\n${shareUrl}`
    : `${options.title}\n\n${shareUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate X (Twitter) share URL
 */
export function getTwitterShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "twitter", "social");
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(options.title)}&url=${encodeURIComponent(shareUrl)}`;
}

/**
 * Generate Facebook share URL
 */
export function getFacebookShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "facebook", "social");
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
}

/**
 * Generate Telegram share URL
 */
export function getTelegramShareUrl(options: ShareOptions): string {
  const shareUrl = buildShareUrl(options.url, options.source || "telegram", "social");
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(options.title)}`;
}

/**
 * Copy URL to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

