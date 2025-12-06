/**
 * AI Danny Reacts - Video/Meme/Track reactions
 * Uses real AI providers when available
 */

import { chatCompletion } from "./aiProviders";
import { dannyPersona } from "./dannyPersona";

export interface ReactRequest {
  type: "video" | "meme" | "track";
  mediaUrl: string;
  title?: string;
  description?: string;
}

export interface DannyReaction {
  reaction: string; // Full reaction text
  rating: number; // 1-10
  highlights: string[]; // Key points
  verdict: string; // Final verdict
}

/**
 * Generate Danny's reaction to submitted content
 * Uses AI to generate authentic Danny-style reactions
 */
export async function generateDannyReaction(request: ReactRequest): Promise<DannyReaction> {
  const typeLabels = {
    video: "video",
    meme: "meme",
    track: "track",
  };

  const prompt = `Generate a reaction to this ${typeLabels[request.type]}:
${request.title ? `Title: "${request.title}"` : ""}
${request.description ? `Description: ${request.description}` : ""}
${request.mediaUrl ? `Media URL: ${request.mediaUrl}` : ""}

Generate a reaction in Danny Hectic B's style - authentic, energetic, and engaging. Include:
1. A full reaction text (2-3 paragraphs)
2. A rating from 1-10
3. 3-5 key highlights
4. A final verdict (one sentence)

Format your response as JSON with keys: reaction, rating, highlights (array), verdict.`;

  try {
    const aiResponse = await chatCompletion({
      messages: [
        {
          role: "system",
          content: dannyPersona.systemPrompt + "\n\nYou are generating reactions to user-submitted content. Be authentic, energetic, and engaging.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      persona: "Danny Hectic B",
    });

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(aiResponse.text);
      return {
        reaction: parsed.reaction || aiResponse.text,
        rating: parsed.rating || 7,
        highlights: parsed.highlights || ["Good energy", "Clean production", "Has potential"],
        verdict: parsed.verdict || "This is fire! Keep it locked in!",
      };
    } catch {
      // If not JSON, extract rating and create structured response
      const ratingMatch = aiResponse.text.match(/(\d+)\/10|rating.*?(\d+)/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2]) : 7;

      return {
        reaction: aiResponse.text,
        rating,
        highlights: ["Good energy", "Clean production", "Has potential"],
        verdict: "This is fire! Keep it locked in!",
      };
    }
  } catch (error) {
    console.error("[AI Reacts] Failed to generate reaction:", error);
    // Fallback to mock response
    const reaction = `Yo! I just checked out this ${typeLabels[request.type]} and I'm feeling it! 
  
${request.title ? `"${request.title}" - ` : ""}This is ${request.type === "track" ? "fire" : "wild"}! The energy is there, the vibe is locked in.
  
${request.type === "track" ? "This track has potential. The production is clean, the flow is there." : request.type === "video" ? "The visuals are on point, the editing is smooth." : "This meme got me! 😂"}
  
Overall, I'm rating this a solid 7/10. It's got that something special. Keep creating! 🔥`;
  
    return {
      reaction,
      rating: 7,
      highlights: ["Good energy", "Clean production", "Has potential"],
      verdict: "This is fire! Keep it locked in!",
    };
  }
}

