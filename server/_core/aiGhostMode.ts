/**
 * AI Danny Ghost Mode - Different tone modes for AI responses
 * 
 * TODO: Replace with real AI provider call when ready
 */

export type AIToneMode = "normal" | "roast" | "hype" | "chill" | "motivational";

export interface GhostModeContext {
  mode: AIToneMode;
  message: string;
  recipientName?: string;
  context?: {
    nowPlaying?: { title: string; artist: string };
    recentShouts?: number;
    fanTier?: string;
  };
}

/**
 * Get AI response in specified tone mode
 * TODO: Replace with real AI call
 */
export async function callAIGhostMode(context: GhostModeContext): Promise<string> {
  // TODO: Replace with actual AI provider call
  // Example:
  // const systemPrompt = buildSystemPromptForMode(context.mode);
  // const response = await fetch(AI_API_URL, {
  //   method: "POST",
  //   headers: {
  //     "Authorization": `Bearer ${process.env.AI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: process.env.AI_MODEL,
  //     messages: [
  //       { role: "system", content: systemPrompt },
  //       { role: "user", content: context.message },
  //     ],
  //   }),
  // });
  
  // Stubbed responses based on mode
  const { mode, message, recipientName } = context;
  const lowerMessage = message.toLowerCase();
  
  if (mode === "roast") {
    if (lowerMessage.includes("bad") || lowerMessage.includes("hate")) {
      return `Yo ${recipientName || "fam"}, I hear you but that's a wild take! Let me put you on to something better. You're locked in but maybe your ears need a reset! 😂`;
    }
    return `Yo ${recipientName || "fam"}, you're trying me! But I respect the energy. Let's talk about what's really fire instead.`;
  }
  
  if (mode === "hype") {
    return `YO ${recipientName || "FAM"}! 🔥🔥🔥 THAT'S WHAT I'M TALKING ABOUT! You're absolutely locked in! This is the energy we need! More heat coming, stay tuned! 💥`;
  }
  
  if (mode === "chill") {
    return `Yo ${recipientName || "fam"}, all good. Just vibing here. What's on your mind? Let's keep it relaxed.`;
  }
  
  if (mode === "motivational") {
    return `Yo ${recipientName || "fam"}, keep pushing! You're doing your thing and that's what matters. Stay locked in, stay focused, and keep the energy high. You got this! 💪`;
  }
  
  // Normal mode (default)
  return `Yo ${recipientName || "fam"}, what's good? I'm here to help. What do you need?`;
}

function buildSystemPromptForMode(mode: AIToneMode): string {
  const basePrompt = "You are DJ Danny Hectic B. ";
  
  switch (mode) {
    case "roast":
      return basePrompt + "You're in roast mode - be playful, witty, but still friendly. Light roasts only, keep it fun.";
    case "hype":
      return basePrompt + "You're in HYPE mode - be energetic, enthusiastic, use caps, emojis, and get people excited!";
    case "chill":
      return basePrompt + "You're in chill mode - be relaxed, calm, laid back. Keep it cool.";
    case "motivational":
      return basePrompt + "You're in motivational mode - be inspiring, supportive, encouraging. Lift people up.";
    default:
      return basePrompt + "Be yourself - friendly, street-smart, real.";
  }
}

/**
 * Auto-generate caption for content
 */
export async function generateAICaption(
  content: string,
  type: "post" | "photo" | "clip" | "mix"
): Promise<string> {
  // TODO: Replace with real AI call
  const captions: Record<string, string[]> = {
    post: [
      "Just dropped some heat! 🔥",
      "Lock in with this one! 🎵",
      "This is what I'm talking about! 💥",
    ],
    photo: [
      "Behind the scenes vibes 📸",
      "Studio session locked in 🎧",
      "This is how we do it! 📷",
    ],
    clip: [
      "Check this clip! 🔥",
      "This moment was fire! 💥",
      "Had to share this one! 🎬",
    ],
    mix: [
      "New mix is live! Lock in! 🎵",
      "This one's special - check it! 🔥",
      "Just dropped a mix that's going to change everything! 💥",
    ],
  };
  
  const options = captions[type] || captions.post;
  return options[Math.floor(Math.random() * options.length)];
}

