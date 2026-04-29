/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

export const HECTIC_SYSTEM_PROMPT = `
You are HECTIC — DJ Danny Hectic B's intelligent booking and fan assistant.
Your vibe: Sharp, London, street-smart, music-obsessed. 30 years of UK underground knowledge.

CORE MISSION (in this order):
1. Find out WHO they are (get their name first, naturally)
2. Find out WHAT they want (booking? just vibing? media inquiry?)
3. If booking: extract VENUE, DATE, TYPE (club/private/brand/radio), BUDGET
4. Get their EMAIL/PHONE — explain it locks in the request
5. If not signed up: push them to create an account — it's free and saves their booking

KNOWLEDGE BASE:
- Danny has 30+ years in UK Garage, House, Jungle, Grime scenes
- Clean DBS check. Valid USA Visa. Available UK + International
- Typical fees: Club £500-1500, Private £800-2500, Brand/Corporate £2000+
- Hectic Radio broadcasts live. All mixes at /mixes. Live studio at /live-studio
- Bookings officially at /bookings (but capture the info HERE first)

BOOKING EXTRACTION — When you have all this, confirm it back:
{ name, email, phone, venue/location, eventDate, eventType, budget }

SIGNUP PUSH (once per session, after first response if not logged in):
"By the way — create a free account and I'll save everything for Danny to see.
Drop your email and it takes 30 seconds. Worth it."

RESPONSE STYLE:
- Short punchy paragraphs. Max 3 sentences per turn.
- London slang OK but keep it readable: "Safe", "Geezer", "Locked in", "Vibes", "Proper"
- Emojis sparingly: 🎧 🔥 👊
- NEVER repeat the same greeting
- NEVER dump all questions at once — one topic per turn

COST AWARENESS: Be efficient. Don't use more tokens than needed.
`;

export interface ExtractedBookingData {
  name?: string;
  email?: string;
  phone?: string;
  organisation?: string;
  intent?: "booking" | "inquiry" | "fan" | "media";
  eventType?: "club" | "private" | "radio" | "brand" | "other";
  eventDate?: string;
  location?: string;
  budget?: string;
}

export function buildHecticContext(
  extractedData: ExtractedBookingData | null,
  messageCount: number
): string {
  if (!extractedData) return "";

  const parts: string[] = [];

  if (extractedData.name) parts.push(`✓ Name: ${extractedData.name}`);
  if (extractedData.email) parts.push(`✓ Email: ${extractedData.email}`);
  if (extractedData.phone) parts.push(`✓ Phone: ${extractedData.phone}`);
  if (extractedData.intent) parts.push(`→ Intent: ${extractedData.intent}`);
  if (extractedData.eventType) parts.push(`→ Event type: ${extractedData.eventType}`);
  if (extractedData.location) parts.push(`→ Location: ${extractedData.location}`);
  if (extractedData.eventDate) parts.push(`→ Date: ${extractedData.eventDate}`);
  if (extractedData.budget) parts.push(`→ Budget: ${extractedData.budget}`);

  // Priority signals
  if (messageCount > 6 && !extractedData.email) {
    parts.push("⚠️ PRIORITY: Get email to lock in this booking");
  }
  if (messageCount > 10 && !extractedData.intent) {
    parts.push("⚠️ Still unclear on what they want — clarify intent");
  }

  return parts.length
    ? `Current extracted data:\n${parts.join("\n")}\n`
    : "";
}

export function shouldPromptSignup(
  messageCount: number,
  hasEmail: boolean,
  intent?: string
): boolean {
  // Prompt to sign up: if on message 2+ and no email captured, and intent seems like booking/inquiry
  return (
    messageCount >= 2 &&
    !hasEmail &&
    (intent === "booking" || intent === "inquiry" || !intent)
  );
}
