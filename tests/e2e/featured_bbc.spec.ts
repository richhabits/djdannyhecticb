/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { test, expect } from '@playwright/test';

test('Featured row has BBC and includes 1Xtra', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Check for Featured heading or section
  await expect(page.getByRole('heading', { name: /featured/i })).toBeVisible();
  
  // Check for BBC stations
  await expect(page.getByText(/BBC/i)).toBeVisible();
  
  // Check specifically for 1Xtra
  await expect(page.getByText(/1\s*Xtra/i)).toBeVisible();
});

test('Featured section is present on homepage', async ({ page }) => {
  await page.goto('/');
  
  // More flexible check - look for any featured content
  const featured = page.locator('[data-testid="featured-stations"], [class*="featured"], section:has-text("Featured")').first();
  await expect(featured).toBeVisible();
});
