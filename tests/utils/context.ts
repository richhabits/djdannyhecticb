/**
 * Test Context Helpers
 * Creates mock tRPC context for testing
 */

import { createTestUser } from "./fixtures";
import { TestUser } from "./fixtures";

export interface MockTRPCContext {
  user?: TestUser;
  isAdmin: boolean;
  req?: {
    headers: Record<string, string>;
  };
  res?: any;
}

/**
 * Create a mock tRPC context for an authenticated user
 */
export function createAuthContext(user?: TestUser): MockTRPCContext {
  const testUser = user || createTestUser();
  return {
    user: testUser,
    isAdmin: testUser.role === "admin",
    req: {
      headers: {
        authorization: `Bearer token_${testUser.id}`,
      },
    },
  };
}

/**
 * Create a mock tRPC context for an unauthenticated user
 */
export function createAnonymousContext(): MockTRPCContext {
  return {
    user: undefined,
    isAdmin: false,
    req: {
      headers: {},
    },
  };
}

/**
 * Create a mock tRPC context for an admin user
 */
export function createAdminContext(): MockTRPCContext {
  const admin = createTestUser({ role: "admin" });
  return {
    user: admin,
    isAdmin: true,
    req: {
      headers: {
        authorization: `Bearer token_admin_${admin.id}`,
      },
    },
  };
}
