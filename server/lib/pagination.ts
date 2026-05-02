/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 *
 * Pagination utilities for database queries
 * Provides cursor-based and offset-based pagination with performance optimizations
 */

import { SQL } from "drizzle-orm";

export interface PaginationParams {
  limit?: number;
  offset?: number;
  cursor?: string | number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string | number;
  pageInfo: {
    pageSize: number;
    offset: number;
    totalPages: number;
    currentPage: number;
  };
}

// Constants for pagination
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;
const MIN_LIMIT = 1;

/**
 * Validates and normalizes pagination parameters
 */
export function validatePaginationParams(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  let validatedLimit = DEFAULT_LIMIT;
  let validatedOffset = 0;

  if (limit !== undefined) {
    if (limit < MIN_LIMIT || !Number.isInteger(limit)) {
      validatedLimit = DEFAULT_LIMIT;
    } else if (limit > MAX_LIMIT) {
      validatedLimit = MAX_LIMIT;
    } else {
      validatedLimit = limit;
    }
  }

  if (offset !== undefined) {
    if (offset < 0 || !Number.isInteger(offset)) {
      validatedOffset = 0;
    } else {
      validatedOffset = offset;
    }
  }

  return { limit: validatedLimit, offset: validatedOffset };
}

/**
 * Creates SQL LIMIT and OFFSET clauses for pagination
 */
export function createPaginationClause(limit: number, offset: number): string {
  return `LIMIT ${limit} OFFSET ${offset}`;
}

/**
 * Calculates pagination metadata
 */
export function calculatePageInfo(
  total: number,
  limit: number,
  offset: number
): PaginationResult<any>["pageInfo"] {
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    pageSize: limit,
    offset,
    totalPages,
    currentPage,
  };
}

/**
 * Creates pagination result with metadata
 */
export function createPaginationResult<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
  nextCursor?: string | number
): PaginationResult<T> {
  const pageInfo = calculatePageInfo(total, limit, offset);
  const hasMore = offset + limit < total;

  return {
    data,
    total,
    hasMore,
    nextCursor: hasMore ? nextCursor : undefined,
    pageInfo,
  };
}

/**
 * Cursor-based pagination for efficient pagination on large datasets
 * Returns the next cursor value to use for subsequent queries
 */
export function getCursorValue<T extends Record<string, any>>(
  items: T[],
  cursorField: keyof T
): string | number | undefined {
  if (items.length === 0) return undefined;
  const lastItem = items[items.length - 1];
  return lastItem[cursorField] as string | number;
}

/**
 * Recommended limits for different queries
 * Adjust based on your performance testing
 */
export const PAGINATION_PRESETS = {
  CHAT_MESSAGES: { default: 50, max: 100 },
  REACTIONS: { default: 50, max: 500 },
  DONATIONS: { default: 25, max: 100 },
  LEADERBOARD: { default: 25, max: 100 },
  NOTIFICATIONS: { default: 20, max: 50 },
  SEARCH: { default: 10, max: 50 },
  FEED: { default: 30, max: 100 },
} as const;

/**
 * Get pagination limit for a specific query type
 */
export function getPaginationLimitForQuery(
  queryType: keyof typeof PAGINATION_PRESETS,
  requested?: number
): number {
  const preset = PAGINATION_PRESETS[queryType];
  if (!requested) return preset.default;
  return Math.min(Math.max(requested, 1), preset.max);
}
