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
 * Venue Scraper
 * 
 * Scrapes venues, clubs, and bars from various sources
 * Supports: Google Places API, manual input, CSV import
 */

import * as db from "../db";
import type { InsertVenueScraperResult } from "../../drizzle/schema";
import { ENV } from "../_core/env";

export interface VenueSearchParams {
  query: string; // e.g., "nightclub London" or "bar Manchester"
  location?: string; // City or location
  radius?: number; // Search radius in meters
  type?: "club" | "bar" | "venue" | "festival";
}

export interface ScrapedVenue {
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  rating?: number;
  reviews?: number;
  capacity?: number;
  genre?: string;
}

/**
 * Search venues using Google Places API (if configured)
 */
export async function searchVenuesGoogle(params: VenueSearchParams): Promise<ScrapedVenue[]> {
  const apiKey = ENV.googlePlacesApiKey;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured. Please add it to your .env file.");
  }

  try {
    // Use Google Places Text Search API
    const searchQuery = params.query + (params.location ? ` in ${params.location}` : "");
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&type=night_club|bar&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const venues: ScrapedVenue[] = [];

    for (const place of data.results || []) {
      // Get place details for more info
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,opening_hours&key=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.status === "OK" && detailsData.result) {
        const details = detailsData.result;
        venues.push({
          name: details.name || place.name,
          location: params.location || place.formatted_address?.split(",").pop()?.trim() || "Unknown",
          address: details.formatted_address || place.formatted_address,
          phone: details.formatted_phone_number,
          website: details.website,
          rating: details.rating,
          reviews: details.user_ratings_total,
        });
      } else {
        // Fallback to basic place data
        venues.push({
          name: place.name,
          location: params.location || place.formatted_address?.split(",").pop()?.trim() || "Unknown",
          address: place.formatted_address,
          rating: place.rating,
          reviews: place.user_ratings_total,
        });
      }
    }

    return venues;
  } catch (error) {
    console.error("[VenueScraper] Google Places error:", error);
    throw error;
  }
}

/**
 * Search venues using manual/CSV data
 */
export async function searchVenuesManual(venues: Array<{
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  type?: string;
}>): Promise<ScrapedVenue[]> {
  return venues.map(v => ({
    name: v.name,
    location: v.location,
    address: v.address,
    phone: v.phone,
    email: v.email,
    website: v.website,
    genre: v.type,
  }));
}

/**
 * Save scraped venues to database
 */
export async function saveScrapedVenues(
  venues: ScrapedVenue[],
  source: string = "manual"
): Promise<number[]> {
  const savedIds: number[] = [];

  for (const venue of venues) {
    try {
      const result = await db.createVenueScraperResult({
        name: venue.name,
        location: venue.location,
        source,
        sourceUrl: venue.website,
        rawData: JSON.stringify({
          address: venue.address,
          phone: venue.phone,
          email: venue.email,
          website: venue.website,
          socialMedia: venue.socialMedia,
          rating: venue.rating,
          reviews: venue.reviews,
          capacity: venue.capacity,
          genre: venue.genre,
        }),
        processed: false,
        convertedToLead: false,
      });
      savedIds.push(result.id);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[VenueScraper] Error saving venue ${venue.name}:`, error);
      }
    }
  }

  return savedIds;
}

/**
 * Search and save venues
 */
export async function searchAndSaveVenues(
  params: VenueSearchParams,
  source: "google" | "manual" = "google"
): Promise<{ saved: number; venues: ScrapedVenue[] }> {
  let venues: ScrapedVenue[] = [];

  if (source === "google") {
    venues = await searchVenuesGoogle(params);
  } else {
    // Manual search would be passed differently
    throw new Error("Manual search requires venue data to be provided");
  }

  const savedIds = await saveScrapedVenues(venues, source);
  return { saved: savedIds.length, venues };
}

/**
 * Convert scraper result to marketing lead
 */
export async function convertVenueToLead(
  scraperResultId: number,
  additionalData?: Partial<{
    email: string;
    phone: string;
    notes: string;
    assignedTo: number;
  }>
) {
  return await db.convertScraperResultToLead(scraperResultId, additionalData);
}

