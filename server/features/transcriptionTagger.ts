/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Auto-Transcription & Tagging Feature - Powered by Claude AI
 * Transcribes streams, extracts songs/artists/guests, generates searchable metadata
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  streamTranscripts,
  streamTags,
  InsertStreamTranscript,
  InsertStreamTag,
} from "../../drizzle/ai-features-schema";
import { eq, desc } from "drizzle-orm";
import { ENV } from "../_core/env";

const client = new Anthropic({
  apiKey: ENV.claudeApiKey,
});

interface TranscriptionResult {
  fullText: string;
  language: string;
  duration: number;
}

interface ExtractionResult {
  songs: Array<{ artist: string; title: string; timestamp?: string }>;
  artists: Array<{ name: string; timestamp?: string }>;
  guests: Array<{ name: string; timestamp?: string }>;
  announcements: Array<{ text: string; timestamp?: string }>;
  topics: Array<{ topic: string; timestamp?: string }>;
}

/**
 * Extract metadata from transcript using Claude AI
 */
async function extractMetadataFromTranscript(
  transcript: string,
  maxTokens: number = 2048
): Promise<ExtractionResult> {
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: maxTokens,
      system: `You are analyzing a DJ live stream transcript.
Extract and structure the following information:
1. Songs played (artist - title pairs)
2. Artists mentioned (names of DJs, producers, collaborators)
3. Guests (names of people who appeared/called in)
4. Key announcements (upcoming events, special mentions)
5. Main topics discussed

For each item, try to include the timestamp if mentioned.
Return as JSON with these keys:
{
  "songs": [{"artist": "", "title": "", "timestamp": ""}],
  "artists": [{"name": "", "timestamp": ""}],
  "guests": [{"name": "", "timestamp": ""}],
  "announcements": [{"text": "", "timestamp": ""}],
  "topics": [{"topic": "", "timestamp": ""}]
}`,
      messages: [
        {
          role: "user",
          content: `Extract metadata from this DJ stream transcript:\n\n${transcript.substring(0, 4000)}`,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (may have other text around it)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      songs: parsed.songs || [],
      artists: parsed.artists || [],
      guests: parsed.guests || [],
      announcements: parsed.announcements || [],
      topics: parsed.topics || [],
    };
  } catch (error) {
    console.error("[TranscriptionTagger] Extraction error:", error);
    return {
      songs: [],
      artists: [],
      guests: [],
      announcements: [],
      topics: [],
    };
  }
}

/**
 * Store transcript
 */
export async function storeTranscript(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  fullText: string,
  sourceType: string = "whisper",
  language: string = "en",
  duration?: number
): Promise<InsertStreamTranscript> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const transcript: InsertStreamTranscript = {
    liveSessionId,
    fullText,
    sourceType,
    language,
    duration,
  };

  const [inserted] = await db
    .insert(streamTranscripts)
    .values(transcript)
    .returning();

  return inserted || transcript;
}

/**
 * Extract and tag metadata from transcript
 */
export async function extractAndTagTranscript(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  transcript: string
): Promise<InsertStreamTag[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!ENV.claudeApiKey) {
    console.warn("[TranscriptionTagger] Claude API key not configured");
    return [];
  }

  // Extract metadata
  const extracted = await extractMetadataFromTranscript(transcript);

  // Build tags
  const tags: InsertStreamTag[] = [];

  // Add song tags
  for (const song of extracted.songs) {
    tags.push({
      liveSessionId,
      tagType: "song",
      tagValue: `${song.artist} - ${song.title}`,
      timestamp: song.timestamp,
      confidence: "0.85",
    });
  }

  // Add artist tags
  for (const artist of extracted.artists) {
    tags.push({
      liveSessionId,
      tagType: "artist",
      tagValue: artist.name,
      timestamp: artist.timestamp,
      confidence: "0.80",
    });
  }

  // Add guest tags
  for (const guest of extracted.guests) {
    tags.push({
      liveSessionId,
      tagType: "guest",
      tagValue: guest.name,
      timestamp: guest.timestamp,
      confidence: "0.75",
    });
  }

  // Add announcement tags
  for (const announcement of extracted.announcements) {
    tags.push({
      liveSessionId,
      tagType: "announcement",
      tagValue: announcement.text,
      timestamp: announcement.timestamp,
      confidence: "0.80",
    });
  }

  // Add topic tags
  for (const topic of extracted.topics) {
    tags.push({
      liveSessionId,
      tagType: "topic",
      tagValue: topic.topic,
      timestamp: topic.timestamp,
      confidence: "0.75",
    });
  }

  // Store in database
  if (tags.length > 0) {
    await db.insert(streamTags).values(tags);
  }

  console.log(
    `[TranscriptionTagger] Created ${tags.length} tags for session ${liveSessionId}`
  );

  return tags;
}

/**
 * Get transcript for a stream
 */
export async function getStreamTranscript(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [transcript] = await db
    .select()
    .from(streamTranscripts)
    .where(eq(streamTranscripts.liveSessionId, liveSessionId));

  return transcript || null;
}

/**
 * Get all tags for a stream
 */
export async function getStreamTags(
  db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number,
  tagType?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select()
    .from(streamTags)
    .where(eq(streamTags.liveSessionId, liveSessionId));

  if (tagType) {
    query = query.where(eq(streamTags.tagType, tagType));
  }

  return query.orderBy(desc(streamTags.createdAt));
}

/**
 * Search streams by tag
 */
export async function searchStreamsByTag(
  db?: Awaited<ReturnType<typeof getDb>>, tagValue: string,
  tagType?: string
): Promise<number[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select({ liveSessionId: streamTags.liveSessionId })
    .from(streamTags)
    .where(eq(streamTags.tagValue, tagValue));

  if (tagType) {
    query = query.where(eq(streamTags.tagType, tagType));
  }

  const results = await query;
  return results.map((r) => r.liveSessionId);
}

/**
 * Get all songs played in a stream
 */
export async function getStreamSongs(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const tags = await db
    .select()
    .from(streamTags)
    .where(eq(streamTags.tagType, "song"));

  // Filter by session and extract unique songs
  const songSet = new Map<string, typeof tags[0]>();

  for (const tag of tags) {
    if (tag.liveSessionId === liveSessionId) {
      songSet.set(tag.tagValue, tag);
    }
  }

  return Array.from(songSet.values());
}

/**
 * Get all artists mentioned in a stream
 */
export async function getStreamArtists(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(streamTags)
    .where(eq(streamTags.tagType, "artist"));
}

/**
 * Get stream guests
 */
export async function getStreamGuests(db?: Awaited<ReturnType<typeof getDb>>, liveSessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(streamTags)
    .where(eq(streamTags.tagType, "guest"));
}

/**
 * Get search-friendly metadata for a stream
 */
export async function getStreamMetadata(liveSessionId: number) {
  const [songs, artists, guests, tags] = await Promise.all([
    getStreamSongs(liveSessionId),
    getStreamArtists(liveSessionId),
    getStreamGuests(liveSessionId),
    getStreamTags(liveSessionId),
  ]);

  return {
    liveSessionId,
    songs: songs.map((t) => t.tagValue),
    artists: artists.map((t) => t.tagValue),
    guests: guests.map((t) => t.tagValue),
    allTags: tags,
    searchableText: [
      ...songs.map((t) => t.tagValue),
      ...artists.map((t) => t.tagValue),
      ...guests.map((t) => t.tagValue),
    ].join(" "),
  };
}

/**
 * Export transcript as text
 */
export async function exportTranscript(liveSessionId: number): Promise<string> {
  const transcript = await getStreamTranscript(liveSessionId);

  if (!transcript) {
    return "No transcript available for this stream";
  }

  return transcript.fullText;
}

/**
 * Generate stream show notes
 */
export async function generateShowNotes(liveSessionId: number): Promise<string> {
  const [transcript, songs, artists, guests] = await Promise.all([
    getStreamTranscript(liveSessionId),
    getStreamSongs(liveSessionId),
    getStreamArtists(liveSessionId),
    getStreamGuests(liveSessionId),
  ]);

  if (!transcript) {
    return "No transcript available";
  }

  const lines = [
    "# Stream Show Notes",
    "",
    "## Songs Played",
    songs.map((s) => `- ${s.tagValue}`).join("\n"),
    "",
    "## Featured Artists",
    artists.map((a) => `- ${a.tagValue}`).join("\n"),
    "",
    "## Guests",
    guests.map((g) => `- ${g.tagValue}`).join("\n"),
    "",
    "## Transcript",
    transcript.fullText.substring(0, 2000) + (transcript.fullText.length > 2000 ? "..." : ""),
  ];

  return lines.join("\n");
}
