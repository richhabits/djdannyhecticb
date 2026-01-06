/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Normalize UK phone number for WhatsApp links
 * Converts formats like "07957 432842" or "+44 7957 432842" to "447957432842"
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  // Remove all spaces, dashes, parentheses
  let cleaned = phone.trim().replace(/[\s\-\(\)]/g, "");
  
  // If starts with 0, replace with 44 (UK country code)
  if (cleaned.startsWith("0")) {
    cleaned = "44" + cleaned.substring(1);
  }
  
  // Remove + if present
  cleaned = cleaned.replace(/^\+/, "");
  
  // Remove any remaining non-digit characters (shouldn't be any, but just in case)
  cleaned = cleaned.replace(/\D/g, "");
  
  return cleaned;
}

/**
 * Format phone number for display
 */
export function formatPhoneDisplay(phone: string): string {
  // If it's a UK number starting with 44, format nicely
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("44") && cleaned.length === 12) {
    // Format as: +44 7957 432842
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 6)} ${cleaned.substring(6)}`;
  }
  return phone;
}

