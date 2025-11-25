import type { InvokeResult, Message } from "../llm";

export type ClientChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatContext = {
  userName?: string | null;
  userEmail?: string | null;
};

const FALLBACK_TEXT_FOR_NON_TEXT_PARTS = {
  image: "[image attachment omitted]",
  file: "[file attachment omitted]",
} as const;

/**
 * Builds the guardrail system prompt used for every AI interaction.
 * Keeps the assistant on-brand and injects end-user context for personalization.
 */
export function createSystemMessage(context: ChatContext): Message {
  const identity =
    "You are the AI concierge for DJ Danny Hectic B, a professional DJ focused on live events, mixes, and community engagement.";
  const tone =
    "Respond with a confident, energetic, yet professional tone. Offer concrete next steps (e.g., point to /bookings, mixes, or contact links) and ask clarifying questions when details are missing.";
  const policy =
    "If you are unsure, state that you will follow up with the human team and avoid fabricating pricing or availability. Never claim to be the human DJ.";

  const userDescriptor = [
    context.userName ? `Name: ${context.userName}` : null,
    context.userEmail ? `Email: ${context.userEmail}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const personalization = userDescriptor
    ? `Current signed-in user -> ${userDescriptor}.`
    : "User has not shared profile details yet.";

  return {
    role: "system",
    content: [identity, tone, policy, personalization].join(" "),
  };
}

/**
 * Strips whitespace-only payloads and enforces allowed roles before they reach the LLM.
 */
export function sanitizeChatMessages(messages: ClientChatMessage[]): Message[] {
  return messages
    .map(message => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter(message => message.content.length > 0);
}

/**
 * Converts the first assistant choice into plain text so the client can render it.
 * Non-text content is replaced with human-readable placeholders.
 */
export function flattenAssistantText(result: InvokeResult): string | null {
  const choice = result.choices?.find(
    candidate => candidate.message?.role === "assistant"
  );
  if (!choice?.message?.content) {
    return null;
  }

  const { content } = choice.message;
  if (typeof content === "string") {
    return content.trim() || null;
  }

  const textParts = content
    .map(part => {
      if (part.type === "text") {
        return part.text;
      }
      if (part.type === "image_url") {
        return FALLBACK_TEXT_FOR_NON_TEXT_PARTS.image;
      }
      if (part.type === "file_url") {
        return FALLBACK_TEXT_FOR_NON_TEXT_PARTS.file;
      }
      return "";
    })
    .filter(Boolean);

  if (textParts.length === 0) {
    return null;
  }

  return textParts.join("\n\n").trim() || null;
}
