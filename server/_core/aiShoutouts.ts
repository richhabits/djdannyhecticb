/**
 * AI Personalized Shoutouts Generator
 * Uses real AI providers when available
 */

import { chatCompletion } from "./aiProviders";
import { dannyPersona } from "./dannyPersona";

export type ShoutoutType = "birthday" | "roast" | "motivational" | "breakup" | "custom";

export interface ShoutoutRequest {
  recipientName: string;
  type: ShoutoutType;
  customContext?: string;
}

/**
 * Generate personalized shoutout
 * Uses AI to generate authentic Danny-style shoutouts
 */
export async function generatePersonalizedShoutout(request: ShoutoutRequest): Promise<string> {
  const { recipientName, type, customContext } = request;

  const typePrompts = {
    birthday: "a birthday shoutout - celebratory, energetic, and fun",
    roast: "a playful roast - funny but respectful, with Danny's humor",
    motivational: "a motivational message - inspiring and uplifting",
    breakup: "a supportive message for someone going through a breakup - empathetic and encouraging",
    custom: `a custom shoutout with this context: ${customContext || "general appreciation"}`,
  };

  const prompt = `Generate ${typePrompts[type]} for ${recipientName}. Make it authentic, in Danny Hectic B's style - energetic, engaging, and genuine. Keep it 2-3 sentences, use emojis appropriately, and end with "🔥" or similar.`;

  try {
    const aiResponse = await chatCompletion({
      messages: [
        {
          role: "system",
          content: dannyPersona.systemPrompt + "\n\nYou are generating personalized shoutouts. Be authentic, energetic, and engaging.",
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
    console.error("[AI Shoutouts] Failed to generate shoutout:", error);
    // Fallback to template-based response
  
  switch (type) {
    case "birthday":
      return `Yo ${recipientName}! 🎉 Happy Birthday! Big up yourself on your special day! I hope you're celebrating with the best vibes and the firest tracks. Keep locked in, keep the energy high, and enjoy your day! Much love from the Hectic Radio crew! 🔥`;
    
    case "roast":
      return `Yo ${recipientName}! 😂 You asked for it, so here we go! You're trying me, but I respect the energy! You're locked in but maybe your playlist needs an upgrade! Just playing - you're fire, keep it up! 🔥`;
    
    case "motivational":
      return `Yo ${recipientName}! 💪 Keep pushing! You're doing your thing and that's what matters. Stay focused, stay locked in, and remember - every day is a chance to level up. You got this! The Hectic Radio crew believes in you! 🔥`;
    
    case "breakup":
      return `Yo ${recipientName}, I hear you. Sometimes things don't work out, but that's life. The music is always here for you. Lock in with some fire tracks, vibe with the crew, and remember - better days are coming. You're stronger than you think. Much love! 🎵`;
    
    case "custom":
      return `Yo ${recipientName}! ${customContext || "Just wanted to give you a shout and let you know you're appreciated. Keep locked in with Hectic Radio!"} Big up yourself! 🔥`;
    
    default:
      return `Yo ${recipientName}! Big up yourself! You're locked in with Hectic Radio and that's what matters. Keep the vibes high! 🔥`;
  }
}

