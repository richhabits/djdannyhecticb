/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { test, expect } from '@playwright/test';

test('BBC Radio 1Xtra plays with Live chip', async ({ page }) => {
  await page.goto('/');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  // Find and click 1Xtra
  const xtraButton = page.getByText(/1\s*Xtra/i).first();
  await xtraButton.click();
  
  // Wait for player or modal to appear
  await page.waitForTimeout(1000);
  
  // Click play button
  const playButton = page.getByRole('button', { name: /play/i });
  await expect(playButton).toBeVisible();
  await playButton.click();
  
  // Check for playing status
  await expect(page.locator('[data-player-status="playing"], [data-status="playing"], [class*="playing"]')).toBeVisible({
    timeout: 10000
  });
  
  // Check for Live indicator
  await expect(page.getByText(/Live/i)).toBeVisible();
});

test('Station player controls are functional', async ({ page }) => {
  await page.goto('/');
  
  // This is a more general test for any station playback
  await page.waitForLoadState('networkidle');
  
  // Look for any play button
  const playButton = page.getByRole('button', { name: /play/i }).first();
  if (await playButton.isVisible()) {
    await playButton.click();
    
    // Wait a moment for playback to start
    await page.waitForTimeout(2000);
    
    // Look for pause or stop button (indicates playing)
    const pauseButton = page.getByRole('button', { name: /pause|stop/i }).first();
    await expect(pauseButton).toBeVisible({ timeout: 5000 });
  }
});
