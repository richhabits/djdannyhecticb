/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const blogRouter = router({
  /**
   * Public: List published blog posts with pagination
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(6),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const result = await db.listBlogPosts(
        input?.limit || 6,
        input?.offset || 0,
        true
      );
      return {
        posts: result.posts.map(post => ({
          ...post,
          tags: post.tags ? JSON.parse(post.tags) : [],
        })),
        total: result.total,
      };
    }),

  /**
   * Public: Get single post by slug
   */
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const post = await db.getBlogPostBySlug(input.slug);
      if (!post) {
        throw new Error("Blog post not found");
      }
      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      };
    }),

  /**
   * Public: Search blog posts
   */
  search: publicProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const posts = await db.searchBlogPosts(input.query);
      return posts.map(post => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      }));
    }),

  /**
   * Admin: Create new blog post
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        content: z.string().min(1),
        excerpt: z.string().max(512).optional(),
        author: z.string().max(255).optional(),
        featuredImageUrl: z.string().max(512).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const post = await db.createBlogPost({
        title: input.title,
        slug: input.slug,
        content: input.content,
        excerpt: input.excerpt || null,
        author: input.author || null,
        featuredImageUrl: input.featuredImageUrl || null,
        tags: input.tags || [],
        published: input.published,
        publishedAt: input.published ? new Date() : null,
      });

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      };
    }),

  /**
   * Admin: Update blog post
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).optional(),
        content: z.string().min(1).optional(),
        excerpt: z.string().max(512).optional(),
        author: z.string().max(255).optional(),
        featuredImageUrl: z.string().max(512).optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      const post = await db.updateBlogPost(id, {
        ...updates,
        tags: updates.tags || undefined,
      });

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      };
    }),

  /**
   * Admin: Delete blog post
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Admin: Publish blog post
   */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const post = await db.updateBlogPost(input.id, {
        published: true,
        publishedAt: new Date(),
      });

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      };
    }),

  /**
   * Admin: Unpublish blog post
   */
  unpublish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const post = await db.updateBlogPost(input.id, {
        published: false,
      });

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
      };
    }),
});
