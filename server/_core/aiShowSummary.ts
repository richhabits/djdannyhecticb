/**
 * AI Show Summary Generator
 * Uses real AI providers when available
 */

import { chatCompletion } from "./aiProviders";
import { dannyPersona } from "./dannyPersona";

export interface ShowSummaryData {
  date: string;
  tracks: Array<{ title: string; artist: string; playedAt: Date }>;
  shouts: Array<{ name: string; message: string }>;
  listenerCount?: number;
}

/**
 * Generate a show summary in "Danny style"
 * Uses AI to generate engaging show summaries
 */
export async function generateShowSummary(data: ShowSummaryData): Promise<string> {
  const prompt = buildShowSummaryPrompt(data);

  try {
    const aiResponse = await chatCompletion({
      messages: [
        {
          role: "system",
          content: dannyPersona.systemPrompt + "\n\nYou are generating show summaries for social media. Be engaging, energetic, and authentic to Danny's voice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      persona: "Danny Hectic B",
    });

    return aiResponse.text;
  } catch (error) {
    console.error("[AI Show Summary] Failed to generate summary:", error);
    // Fallback to template-based response
  const trackCount = data.tracks.length;
  const shoutCount = data.shouts.length;
  const topTracks = data.tracks.slice(0, 3);
  
  let summary = `On ${data.date}, Hectic Radio was locked in! 🎵\n\n`;
  
  if (trackCount > 0) {
    summary += `We played ${trackCount} tracks, including:\n`;
    topTracks.forEach((track, i) => {
      summary += `${i + 1}. "${track.title}" by ${track.artist}\n`;
    });
    summary += `\n`;
  }
  
  if (shoutCount > 0) {
    summary += `${shoutCount} listeners sent shouts, big up to everyone who locked in! 📻\n\n`;
  }
  
  if (data.listenerCount) {
    summary += `Peak listeners: ${data.listenerCount} Hectic Heads tuned in.\n\n`;
  }
  
  summary += `Thanks for vibing with us. More heat coming next week! 🔥`;
  
  return summary;
}

function buildShowSummaryPrompt(data: ShowSummaryData): string {
  return `Generate a show summary for ${data.date}:
- Tracks played: ${data.tracks.length}
- Top tracks: ${data.tracks.slice(0, 5).map(t => `${t.title} by ${t.artist}`).join(", ")}
- Shouts received: ${data.shouts.length}
- Listener count: ${data.listenerCount || "N/A"}

Make it engaging, in Danny's voice, and ready to post on social media.`;
}

