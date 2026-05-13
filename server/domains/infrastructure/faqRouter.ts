/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import * as db from "../db";

const faqCategoryEnum = z.enum(["booking", "merch", "technical", "shipping", "general"]);

export const faqRouter = router({
  /**
   * Public: List all active FAQs grouped by category
   */
  list: publicProcedure
    .input(
      z.object({
        category: faqCategoryEnum.optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const faqs = await db.listFAQs(input?.category, true);

      // Group by category
      const grouped: Record<string, typeof faqs> = {};
      faqs.forEach(faq => {
        if (!grouped[faq.category]) {
          grouped[faq.category] = [];
        }
        grouped[faq.category].push(faq);
      });

      return grouped;
    }),

  /**
   * Public: Search FAQs
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      return await db.searchFAQs(input.query);
    }),

  /**
   * Admin: Create new FAQ
   */
  create: adminProcedure
    .input(
      z.object({
        question: z.string().min(1).max(512),
        answer: z.string().min(1),
        category: faqCategoryEnum,
        displayOrder: z.number().default(0).optional(),
        active: z.boolean().default(true).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.createFAQ({
        question: input.question,
        answer: input.answer,
        category: input.category,
        displayOrder: input.displayOrder || 0,
        active: input.active ?? true,
      });
    }),

  /**
   * Admin: Update FAQ
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        question: z.string().min(1).max(512).optional(),
        answer: z.string().min(1).optional(),
        category: faqCategoryEnum.optional(),
        displayOrder: z.number().optional(),
        active: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return await db.updateFAQ(id, updates);
    }),

  /**
   * Admin: Delete FAQ
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteFAQ(input.id);
      return { success: true };
    }),

  /**
   * Admin: Reorder FAQs
   */
  reorder: adminProcedure
    .input(
      z.object({
        faqIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      await db.reorderFAQs(input.faqIds);
      return { success: true };
    }),

  /**
   * Admin: Get all FAQs (for management interface)
   */
  all: adminProcedure
    .query(async () => {
      return await db.listFAQs(undefined, undefined);
    }),
});
