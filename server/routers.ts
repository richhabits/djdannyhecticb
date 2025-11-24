import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Message as LlmMessage, type MessageContent as LlmMessageContent } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

const MAX_CONVERSATION_MESSAGES = 20;

const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z
    .string()
    .min(1, "message content is required")
    .max(4_000, "message content is too long"),
});

const DEFAULT_SYSTEM_PROMPT =
  "You are DJ Danny Hectic B's AI concierge. Provide concise, upbeat answers about bookings, events, merchandise, and DJ services. Keep responses factual, reference official site data when possible, and suggest next steps or booking actions when it helps.";

function sanitizeMessages(
  input: Array<z.infer<typeof chatMessageSchema>>,
  userName: string | null
): LlmMessage[] {
  const trimmed = input
    .map(message => ({
      role: message.role,
      content: message.content.trim(),
    }))
    .filter(message => message.content.length > 0);

  const fallbackPrompt = userName
    ? `${DEFAULT_SYSTEM_PROMPT} The authenticated user is ${userName}. Personalize responses appropriately.`
    : DEFAULT_SYSTEM_PROMPT;

  const systemMessages = trimmed.filter(message => message.role === "system");
  const lastSystemMessage = systemMessages.at(-1);
  const conversationalMessages = trimmed.filter(message => message.role !== "system").slice(-MAX_CONVERSATION_MESSAGES);

  const normalized: LlmMessage[] = [];

  if (lastSystemMessage) {
    normalized.push({
      role: "system",
      content: lastSystemMessage.content,
    });
  }

  conversationalMessages.forEach(message => {
    normalized.push({
      role: message.role,
      content: message.content,
    });
  });

  if (normalized.length === 0) {
    normalized.push({
      role: "system",
      content: fallbackPrompt,
    });
  }

  if (!normalized.some(message => message.role === "system")) {
    normalized.unshift({
      role: "system",
      content: fallbackPrompt,
    });
  }

  return normalized;
}

function formatAssistantContent(content: LlmMessageContent | LlmMessageContent[] | undefined): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map(part => {
      if (typeof part === "string") {
        return part;
      }
      if (part.type === "text") {
        return part.text;
      }
      if (part.type === "image_url") {
        return `[Image: ${part.image_url.url}]`;
      }
      if (part.type === "file_url") {
        return `[File: ${part.file_url.url}]`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  mixes: router({
    list: publicProcedure.query(() => db.getAllMixes()),
    free: publicProcedure.query(() => db.getFreeMixes()),
  }),

  bookings: router({
    list: protectedProcedure.query(({ ctx }) => db.getUserBookings(ctx.user.id)),
    create: protectedProcedure
      .input(z.object({
        eventName: z.string(),
        eventDate: z.date(),
        eventLocation: z.string(),
        eventType: z.string(),
        guestCount: z.number().optional(),
        budget: z.string().optional(),
        description: z.string().optional(),
        contactEmail: z.string().email(),
        contactPhone: z.string().optional(),
      }))
      .mutation(({ ctx, input }) => db.createBooking({
        userId: ctx.user.id,
        ...input,
      })),
  }),

  events: router({
    upcoming: publicProcedure.query(() => db.getUpcomingEvents()),
    featured: publicProcedure.query(() => db.getFeaturedEvents()),
    all: publicProcedure.query(() => db.getAllEvents()),
  }),

  podcasts: router({
    list: publicProcedure.query(() => db.getAllPodcasts()),
  }),

  streaming: router({
    links: publicProcedure.query(() => db.getStreamingLinks()),
  }),

  ai: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(chatMessageSchema).min(1, "at least one message is required").max(50, "too many messages"),
      }))
      .mutation(async ({ ctx, input }) => {
        const messagesWithContext = sanitizeMessages(input.messages, ctx.user.name ?? null);
        try {
          const response = await invokeLLM({
            messages: messagesWithContext,
          });

          const assistantMessage = response.choices.at(0)?.message;
          const content = formatAssistantContent(assistantMessage?.content).trim();

          if (!content) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Assistant returned an empty response",
            });
          }

          return {
            message: content,
            usage: response.usage ?? null,
          };
        } catch (error) {
          console.error("[AI] chat invocation failed", {
            userId: ctx.user.id,
            error,
          });

          if (error instanceof TRPCError) {
            throw error;
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI assistant is temporarily unavailable. Please try again shortly.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
