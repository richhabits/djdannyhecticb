/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { ExtractedBookingData } from "./hecticPersona";
import { aiProvider } from "./aiProvider";

/**
 * Extract booking data from user message using regex first, then LLM fallback
 * Prioritizes cost efficiency: regex patterns handle ~80% of cases
 */
export async function extractBookingData(
  message: string,
  existingData: ExtractedBookingData | null
): Promise<Partial<ExtractedBookingData>> {
  const extracted: Partial<ExtractedBookingData> = { ...existingData };

  // REGEX PATTERNS - Fast, free extraction
  extractEmail(message, extracted);
  extractPhoneNumber(message, extracted);
  extractName(message, extracted);
  extractEventDate(message, extracted);
  extractBudget(message, extracted);
  extractLocation(message, extracted);
  extractEventType(message, extracted);
  extractIntent(message, extracted);

  // If we got most fields, return. Only use LLM if key fields still missing
  const completeness = Object.values(extracted).filter(Boolean).length;
  if (completeness >= 4) {
    return extracted;
  }

  // FALLBACK: Use LLM to extract remaining fields (costs ~50 tokens)
  try {
    const llmExtraction = await extractWithLLM(message, extracted);
    return { ...extracted, ...llmExtraction };
  } catch (error) {
    console.error("LLM extraction failed:", error);
    return extracted; // Fall back to regex results
  }
}

/**
 * Regex-based extraction (zero cost)
 */
function extractEmail(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.email) return;
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) extracted.email = emailMatch[0];
}

function extractPhoneNumber(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.phone) return;
  const phoneMatch = message.match(
    /(?:\+44|0)(?:\d\s?){9,10}|(?:\+?1\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/
  );
  if (phoneMatch) extracted.phone = phoneMatch[0].replace(/\s/g, "");
}

function extractName(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.name) return;
  // Look for patterns like "I'm [Name]" or "name is [Name]" or "it's [Name]"
  const nameMatch = message.match(
    /(?:i'm|i am|name's?|my name is|call me|it's|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
  );
  if (nameMatch) extracted.name = nameMatch[1];
}

function extractEventDate(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.eventDate) return;
  // Patterns: "23rd March", "March 23", "23/03/2025", "2025-03-23"
  const dateMatch = message.match(
    /(\d{1,2}(?:st|nd|rd|th)?)\s+(January|February|March|April|May|June|July|August|September|October|November|December)(?:\s+(\d{4}))?|(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})|(\d{4})-(\d{2})-(\d{2})/i
  );
  if (dateMatch) extracted.eventDate = dateMatch[0];
}

function extractBudget(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.budget) return;
  // Patterns: "£500-1500", "$2000", "budget is £800", "between 1500 and 2000", "2k", "3 grand"

  // Try currency + numbers first
  let budgetMatch = message.match(
    /(?:budget[:\s]+)?(?:[£$]|pounds?|dollars?|euros?|EUR|GBP|USD)\s*(\d{1,5})(?:\s*[-–]\s*(?:[£$])?(\d{1,5}))?/i
  );
  if (budgetMatch) {
    const min = budgetMatch[1];
    const max = budgetMatch[2];
    extracted.budget = max ? `£${min}-£${max}` : `£${min}`;
    return;
  }

  // Try "Xk" or "X grand" patterns
  budgetMatch = message.match(/(\d{1,2})\s*(?:k|grand|k?|thousands?)/i);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1]) * 1000;
    extracted.budget = `£${amount}`;
    return;
  }

  // Try "between X and Y" pattern
  budgetMatch = message.match(/between\s+[£$]?(\d{1,5})\s+and\s+[£$]?(\d{1,5})/i);
  if (budgetMatch) {
    extracted.budget = `£${budgetMatch[1]}-£${budgetMatch[2]}`;
  }
}

function extractLocation(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.location) return;
  // UK cities/venues (simplified - would be extended in production)
  const venues = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Bristol", "Edinburgh",
    "Fabric", "XOYO", "Warehouse Project", "Egg", "Ministry of Sound",
    "SWG3", "Sub Club", "Wire", "Sankeys", "Electric Ballroom", "Mama Rouxs",
    "Printworks", "EGG", "Gorilla", "Headrow House", "Motion", "Digital",
    "Exchange", "Hï Ibiza", "Glastonbury", "Reading", "Leeds Festival"
  ];
  const locationMatch = message.match(
    new RegExp(`\\b(${venues.join("|")})\\b`, "i")
  );
  if (locationMatch) extracted.location = locationMatch[1];
}

function extractEventType(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.eventType) return;
  // Detect event type from keywords
  const msg = message.toLowerCase();
  if (msg.match(/\b(club|nightclub|dj set|dance|rave|house|techno)\b/))
    extracted.eventType = "club";
  else if (msg.match(/\b(private|party|wedding|birthday|corporate|company|brand|product launch|event)\b/))
    extracted.eventType = "private";
  else if (msg.match(/\b(radio|broadcast|show|live stream|podcast)\b/))
    extracted.eventType = "radio";
  else if (msg.match(/\b(corporate|conference|client|sponsor|brand|marketing)\b/))
    extracted.eventType = "brand";
}

function extractIntent(message: string, extracted: Partial<ExtractedBookingData>) {
  if (extracted.intent) return;
  const msg = message.toLowerCase();
  // High-signal booking keywords
  if (msg.match(/\b(book|booking|gig|hire|feature|event|want you to play|need a dj|looking for)\b/))
    extracted.intent = "booking";
  else if (msg.match(/\b(question|ask|curious|wondering|how much|rates|price|cost)\b/))
    extracted.intent = "inquiry";
  else if (msg.match(/\b(fan|love your work|listening|mixes|radio|huge fan|respect)\b/))
    extracted.intent = "fan";
  else if (msg.match(/\b(media|interview|press|feature|article|podcast|journalist)\b/))
    extracted.intent = "media";
}

/**
 * LLM-based extraction (fallback, ~50 tokens)
 */
async function extractWithLLM(
  message: string,
  existing: Partial<ExtractedBookingData>
): Promise<Partial<ExtractedBookingData>> {
  const prompt = `Extract booking information from this message. Return only valid JSON.

Message: "${message}"

Current data: ${JSON.stringify(existing)}

Return ONLY a JSON object with these fields (omit if not mentioned):
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "organisation": "string or null",
  "intent": "booking|inquiry|fan|media or null",
  "eventType": "club|private|radio|brand|other or null",
  "eventDate": "string or null",
  "location": "string or null",
  "budget": "string or null"
}`;

  try {
    const response = await aiProvider.chat(prompt, "gemini");
    if (!response.success || !response.text) return {};

    // Extract JSON from response (LLM might add text around it)
    const jsonMatch = response.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    const parsed = JSON.parse(jsonMatch[0]) as Partial<ExtractedBookingData>;

    // Validate extracted fields
    const valid: Partial<ExtractedBookingData> = {};
    if (parsed.name && typeof parsed.name === "string") valid.name = parsed.name;
    if (parsed.email && typeof parsed.email === "string") valid.email = parsed.email;
    if (parsed.phone && typeof parsed.phone === "string") valid.phone = parsed.phone;
    if (parsed.organisation && typeof parsed.organisation === "string") valid.organisation = parsed.organisation;
    if (["booking", "inquiry", "fan", "media"].includes(parsed.intent)) valid.intent = parsed.intent as any;
    if (["club", "private", "radio", "brand", "other"].includes(parsed.eventType)) valid.eventType = parsed.eventType as any;
    if (parsed.eventDate && typeof parsed.eventDate === "string") valid.eventDate = parsed.eventDate;
    if (parsed.location && typeof parsed.location === "string") valid.location = parsed.location;
    if (parsed.budget && typeof parsed.budget === "string") valid.budget = parsed.budget;

    return valid;
  } catch (error) {
    console.error("LLM extraction parse error:", error);
    return {};
  }
}
