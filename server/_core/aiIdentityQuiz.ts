/**
 * Hectic Identity Quiz - Determines fan type and generates playlist
 * Uses real AI providers when available
 */

import { chatCompletion } from "./aiProviders";
import { dannyPersona } from "./dannyPersona";

export interface QuizAnswers {
  favoriteGenres: string[];
  vibe: "chill" | "energetic" | "mixed";
  listeningTime: "daily" | "weekly" | "occasional";
  interaction: "shouts" | "lurking" | "both";
  goals: string[];
}

export interface IdentityResult {
  identityType: string;
  description: string;
  playlist: Array<{ title: string; artist: string }>;
  welcomeMessage: string;
}

const IDENTITY_TYPES = [
  {
    type: "Vibe Master",
    description: "You're all about the energy and keeping the vibes locked in!",
    playlist: [
      { title: "Energy Boost", artist: "Various" },
      { title: "Fire Mix", artist: "Various" },
    ],
  },
  {
    type: "Day One",
    description: "You've been here from the start - true loyalty!",
    playlist: [
      { title: "Classic Heat", artist: "Various" },
      { title: "Throwback Mix", artist: "Various" },
    ],
  },
  {
    type: "Chill Seeker",
    description: "You're here for the relaxed vibes and smooth sounds.",
    playlist: [
      { title: "Chill Session", artist: "Various" },
      { title: "Smooth Mix", artist: "Various" },
    ],
  },
  {
    type: "Track Hunter",
    description: "You're always on the hunt for the next fire track!",
    playlist: [
      { title: "New Heat", artist: "Various" },
      { title: "Fresh Mix", artist: "Various" },
    ],
  },
];

/**
 * Process quiz and generate identity
 * Uses AI to generate personalized identity results
 */
export async function processIdentityQuiz(
  name: string,
  answers: QuizAnswers
): Promise<IdentityResult> {
  const prompt = `Based on these quiz answers, determine the fan's identity type and generate a personalized welcome:
Name: ${name}
Favorite Genres: ${answers.favoriteGenres.join(", ")}
Vibe: ${answers.vibe}
Listening Time: ${answers.listeningTime}
Interaction Style: ${answers.interaction}
Goals: ${answers.goals.join(", ")}

Generate:
1. An identity type name (creative, like "Vibe Master", "Day One", "Chill Seeker", "Track Hunter")
2. A description (1-2 sentences)
3. A welcome message (2-3 paragraphs, in Danny's voice)
4. Suggest 2-3 track titles that match their vibe

Format as JSON with: identityType, description, welcomeMessage, playlist (array of {title, artist}).`;

  try {
    const aiResponse = await chatCompletion({
      messages: [
        {
          role: "system",
          content: dannyPersona.systemPrompt + "\n\nYou are analyzing quiz answers to determine a fan's identity type and generate a personalized welcome message.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      persona: "Danny Hectic B",
    });

    try {
      const parsed = JSON.parse(aiResponse.text);
      return {
        identityType: parsed.identityType || "Vibe Master",
        description: parsed.description || "You're all about the energy!",
        playlist: parsed.playlist || IDENTITY_TYPES[0].playlist,
        welcomeMessage: parsed.welcomeMessage || `Yo ${name}! Welcome to Hectic Radio! 🔥`,
      };
    } catch {
      // If not JSON, use template
    }
  } catch (error) {
    console.error("[AI Identity Quiz] Failed to process quiz:", error);
  }

  // Fallback to template-based logic
  let identityType = "Vibe Master";
  if (answers.vibe === "chill") {
    identityType = "Chill Seeker";
  } else if (answers.listeningTime === "daily") {
    identityType = "Day One";
  } else if (answers.interaction === "shouts") {
    identityType = "Track Hunter";
  }
  
  const identity = IDENTITY_TYPES.find((i) => i.type === identityType) || IDENTITY_TYPES[0];
  
  const welcomeMessage = `Yo ${name}! Welcome to the Hectic Universe! 

You're a ${identityType} - ${identity.description}

I've curated a special playlist just for you based on your vibe. Lock in, turn it up, and let's get this journey started!

You're now part of the Hectic Radio family. Big up yourself! 🔥`;
  
  return {
    identityType,
    description: identity.description,
    playlist: identity.playlist,
    welcomeMessage,
  };
}

