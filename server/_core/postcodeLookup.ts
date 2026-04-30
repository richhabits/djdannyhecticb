/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * UK Postcode validation using regex
 * Supports standard UK postcode format: A9A 9AA or A99 9AA
 */
export function validateUKPostcode(postcode: string): boolean {
  const trimmed = postcode.trim().toUpperCase();
  // UK postcode regex pattern
  const pattern = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
  return pattern.test(trimmed);
}

/**
 * Extract postcode zone (first 1-2 characters for rough zone identification)
 */
export function getPostcodeZone(postcode: string): string {
  const trimmed = postcode.trim().toUpperCase();
  // Get first 1-2 letters as a rough zone (e.g., "M" for Manchester, "EC" for East Central)
  const match = trimmed.match(/^[A-Z]{1,2}/);
  return match ? match[0] : "";
}

/**
 * Determine shipping zone from postcode
 * Returns: "uk_standard" | "uk_express" | "international" | "unknown"
 */
export function getShippingZone(postcode: string, country: string = "GB"): "uk" | "international" {
  if (country.toUpperCase() !== "GB") {
    return "international";
  }
  return "uk";
}

/**
 * Calculate shipping cost based on zone, weight, and method
 * Returns cost in GBP as a decimal string
 */
export function calculateShippingCost(
  zone: "uk" | "international",
  method: "standard" | "express" | "international" = "standard",
  weightKg: number = 0.5 // Default weight for small items
): number {
  // Base shipping rates (in GBP)
  const rates: Record<string, Record<string, number>> = {
    uk: {
      standard: 3.99,
      express: 8.99,
      international: 0, // Not applicable for UK zone
    },
    international: {
      standard: 15.99,
      express: 24.99,
      international: 15.99,
    },
  };

  const zoneRates = rates[zone] || rates.uk;
  const baseRate = zoneRates[method] || zoneRates.standard;

  // For international orders, add weight-based surcharge (£0.50 per kg after first 2kg)
  if (zone === "international" && weightKg > 2) {
    const extraWeight = weightKg - 2;
    return baseRate + extraWeight * 0.5;
  }

  return baseRate;
}

/**
 * Get detailed shipping info including cost and method
 */
export interface ShippingInfo {
  cost: number;
  method: "standard" | "express" | "international";
  zone: "uk" | "international";
  estimatedDays: number;
  validPostcode: boolean;
}

export function getShippingInfo(
  postcode: string,
  country: string = "GB",
  requestedMethod: "standard" | "express" | "international" = "standard"
): ShippingInfo {
  const validPostcode = country === "GB" ? validateUKPostcode(postcode) : true;
  const zone = getShippingZone(postcode, country);

  let method = requestedMethod;
  let cost = calculateShippingCost(zone, method);

  // Estimate delivery days based on zone and method
  let estimatedDays = 0;
  if (zone === "uk") {
    estimatedDays = method === "express" ? 1 : 3;
  } else {
    estimatedDays = method === "express" ? 7 : 14;
  }

  return {
    cost,
    method,
    zone,
    estimatedDays,
    validPostcode,
  };
}
