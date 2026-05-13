/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/**
 * Auth Domain - Barrel Export
 * ============================
 * Central export point for all authentication-related functionality.
 * Includes OAuth, Google Auth, Admin Auth, and cookie management.
 */

export { validateAdminAuth, authenticateSession, createSessionToken, verifyJWT } from './adminAuth'
export { registerGoogleAuthRoutes, getGoogleAuthUrl } from './googleAuth'
export { registerOAuthRoutes } from './oauth'
export { getSessionCookieOptions } from './cookies'
export { adminAuthRoutes, registerAdminAuthRoutes } from './adminAuthRoutes'
