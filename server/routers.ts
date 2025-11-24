import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSystemMessage, flattenAssistantText, sanitizeChatMessages } from "./_core/ai/chat";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const AI_MESSAGE_LIMIT = 40;

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
      .input(
        z.object({
          messages: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().min(1).max(4000),
              })
            )
            .min(1)
            .max(AI_MESSAGE_LIMIT),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const sanitizedMessages = sanitizeChatMessages(input.messages);

        if (sanitizedMessages.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "At least one non-empty message is required.",
          });
        }

        const systemMessage = createSystemMessage({
          userName: ctx.user?.name,
          userEmail: ctx.user?.email,
        });

        try {
          const response = await invokeLLM({
            messages: [systemMessage, ...sanitizedMessages],
          });

          const assistantText = flattenAssistantText(response);
          if (!assistantText) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "AI response did not include assistant content.",
            });
          }

          return {
            message: {
              role: "assistant" as const,
              content: assistantText,
            },
            usage: response.usage ?? null,
            model: response.model,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "AI chat failed.",
            cause: error instanceof Error ? error : undefined,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
