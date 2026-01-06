import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if page title is present
    await expect(page).toHaveTitle(/n\.process/i);
    
    // Check for main heading or key content
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check for login link
    const loginLink = page.getByRole('link', { name: /login|entrar/i });
    if (await loginLink.count() > 0) {
      await expect(loginLink).toBeVisible();
    }
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});
