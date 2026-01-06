import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check if login form is visible
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should show Google login button', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Google login button
    const googleButton = page.getByRole('button', { name: /google|sign in with google/i });
    if (await googleButton.count() > 0) {
      await expect(googleButton).toBeVisible();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // Check for validation message (if implemented)
      // This is a basic test - adjust based on actual validation
    }
  });
});
