/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

declare module "cookie" {
  export function parse(
    str: string,
    options?: Record<string, unknown>
  ): Record<string, string>;
}
