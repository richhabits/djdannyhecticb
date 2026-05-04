/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ID: string;
  readonly VITE_OAUTH_PORTAL_URL: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
