/**
 * End-to-End Tests - User Journeys
 * Testing complete user flows through the application
 */

import { test, expect } from '@playwright/test';

test.describe('User Navigation Journey', () => {
  test('should navigate through all main pages', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    await expect(page).toHaveTitle(/BoomPets/);

    // Navigate to My Plan
    await page.click('text=My Plan');
    await expect(page).toHaveURL('/plan');
    await expect(page.locator('text=Weekly Schedule')).toBeVisible();

    // Navigate to Track
    await page.click('text=Track');
    await expect(page).toHaveURL('/track');
    await expect(page.locator('text=Feeding Streak')).toBeVisible();

    // Navigate to Consult
    await page.click('text=Consult');
    await expect(page).toHaveURL('/consult');
    await expect(page.locator('text=Find an Expert')).toBeVisible();

    // Navigate to More
    await page.click('text=More');
    await expect(page).toHaveURL('/more');
  });

  test('should display emergency contact information on consult page', async ({ page }) => {
    await page.goto('/consult');
    
    // Check for Poison Control Center
    await expect(page.locator('text=Poison Control Center')).toBeVisible();
    await expect(page.locator('text=888-426-4435')).toBeVisible();
  });
});

test.describe('Meal Logging Journey', () => {
  test('should allow logging a meal', async ({ page }) => {
    await page.goto('/track');
    
    // Fill out meal form
    await page.selectOption('select', 'Premium Kibble (Adult)');
    await page.fill('input[type="number"]', '1.5');
    
    // Check for Complete Log button
    const logButton = page.locator('text=Complete Log');
    await expect(logButton).toBeVisible();
  });
});

test.describe('Specialist Browsing Journey', () => {
  test('should filter specialists by category', async ({ page }) => {
    await page.goto('/consult');
    
    // Click on Nutrition filter
    await page.click('text=Nutrition');
    
    // Verify filter is active
    const nutritionButton = page.locator('button:has-text("Nutrition")');
    await expect(nutritionButton).toHaveClass(/bg-orange-500/);
  });

  test('should display specialist information', async ({ page }) => {
    await page.goto('/consult');
    
    // Check for specialist cards
    await expect(page.locator('text=Dr. Elena Rodriguez')).toBeVisible();
    await expect(page.locator('text=Emergency Care')).toBeVisible();
    await expect(page.locator('text=Book Now')).toBeVisible();
  });
});
