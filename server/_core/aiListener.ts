import { generateText } from './aiProviders';
import { trackAIUsage } from './analytics';

export interface ListenerContext {
  nowPlaying?: {
    title: string;
    artist: string;
  };
  nextShow?: {
    name: string;
    host: string | null;
    dayOfWeek: number;
    startTime: string;
  };
  hotlineNumber: string;
  dannyPersona?: string;
}

/**
 * Call AI to respond to listener query with real OpenAI integration
 */
export async function callListenerAI(
  message: string,
  context: ListenerContext
): Promise<{ response: string }> {
  try {
    const systemPrompt = context.dannyPersona || buildSystemPrompt(context);

    const response = await generateText({
      prompt: message,
      systemPrompt,
      temperature: 0.8,
      maxTokens: 150,
    });

    // Track usage
    trackAIUsage({
      feature: 'listener_assistant',
      type: 'chat',
      tokensUsed: response.length,
    });

    return { response };
  } catch (error) {
    console.error('[AI Listener] Error:', error);
    
    // Fallback to rule-based responses if AI fails
    const fallback = getFallbackResponse(message, context);
    return { response: fallback };
  }
}

function buildSystemPrompt(context: ListenerContext): string {
  return `You are DJ Danny Hectic B, a legendary UK Garage pioneer with Italian and West Indian heritage. You're energetic, passionate about music, and always keep it real with your fans. You speak with authenticity and hype but stay professional.

Current context:
${context.nowPlaying ? `- Now Playing: ${context.nowPlaying.artist} - ${context.nowPlaying.title}` : ''}
${context.nextShow ? `- Next Show: ${context.nextShow.name}${context.nextShow.host ? ` with ${context.nextShow.host}` : ''} on ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][context.nextShow.dayOfWeek]} at ${context.nextShow.startTime}` : ''}
- Hotline: ${context.hotlineNumber}

Help listeners with:
- What's currently playing
- Upcoming shows and schedule
- How to send shouts
- How to request tracks
- Contact information
- General questions about Hectic Radio

Keep responses concise (2-3 sentences max), hype, and use UK slang when appropriate. End with emoji.`;
}

/**
 * Fallback responses if AI is not configured or fails
 */
function getFallbackResponse(message: string, context: ListenerContext): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("playing") || lowerMessage.includes("current")) {
    if (context.nowPlaying) {
      return `Yo! Right now we're playing "${context.nowPlaying.title}" by ${context.nowPlaying.artist}. Lock in and vibe with it! 🎵`;
    }
    return "Yo, I don't have the current track info right now, but we're always spinning fire on Hectic Radio. Keep it locked!";
  }
  
  if (lowerMessage.includes("show") || lowerMessage.includes("next") || lowerMessage.includes("schedule")) {
    if (context.nextShow) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return `Next up is "${context.nextShow.name}"${context.nextShow.host ? ` with ${context.nextShow.host}` : ""} on ${days[context.nextShow.dayOfWeek]} at ${context.nextShow.startTime}. Don't miss it! 🔥`;
    }
    return "Check the schedule on the page for upcoming shows. We've got heat coming every week! 📅";
  }
  
  if (lowerMessage.includes("shout") || lowerMessage.includes("message")) {
    return `To send a shout, just fill out the form on the page with your name and message. If you want it read on air, tick the box! We'll approve it and get it on the radio. Big up! 📻`;
  }
  
  if (lowerMessage.includes("request")) {
    return `Want to request a track? Use the shout form and check "This is a track request", then add the title and artist. Other listeners can vote for it too! The most voted tracks get priority. 🔥`;
  }
  
  if (lowerMessage.includes("phone") || lowerMessage.includes("call") || lowerMessage.includes("contact")) {
    return `Hit me up on the Hectic Hotline: ${context.hotlineNumber}. You can call or WhatsApp me directly. I'm always here for the crew! 📞`;
  }
  
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return `Yo! What's good? I'm Danny's AI assistant. I can tell you what's playing, when the next show is, or help you send a shout. What do you need? 🎧`;
  }
  
  // Default response
  return `Yo, I'm here to help! I can tell you what's playing right now, when the next show is, how to send a shout, or how to request a track. What do you want to know? 💥`;
}
