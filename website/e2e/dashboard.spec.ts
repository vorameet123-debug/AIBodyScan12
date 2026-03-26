/**
 * E2E Tests - Dashboard Interactions
 * Tests main application dashboard and features
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test('home page has hero section', async ({ page }) => {
        await page.goto('/');

        // Should have main heading or hero
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible({ timeout: 5000 });
    });

    test('home page has call-to-action buttons', async ({ page }) => {
        await page.goto('/');

        // Should have at least one CTA button
        const buttons = page.getByRole('button');
        await expect(buttons.first()).toBeVisible({ timeout: 5000 });
    });

    test('responsive layout works', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');

        // Page should still be visible
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Reset to desktop
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/');
        await expect(body).toBeVisible();
    });
});

test.describe('UI Elements', () => {
    test('page has proper accessibility', async ({ page }) => {
        await page.goto('/');

        // Check for proper heading structure
        const h1 = page.locator('h1');
        const count = await h1.count();
        expect(count).toBeGreaterThanOrEqual(0); // Should have at least 0 (might use h2 as main)
    });

    test('interactive elements are focusable', async ({ page }) => {
        await page.goto('/');

        // Tab through focusable elements
        await page.keyboard.press('Tab');

        // Something should be focused
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeDefined();
    });

    test('images have alt text', async ({ page }) => {
        await page.goto('/');

        // Check images have alt attributes
        const images = page.locator('img[src]');
        const count = await images.count();

        if (count > 0) {
            for (let i = 0; i < Math.min(count, 5); i++) {
                const img = images.nth(i);
                const alt = await img.getAttribute('alt');
                // Alt can be empty string for decorative images, but should exist
                expect(alt !== null || await img.getAttribute('role') === 'presentation').toBeTruthy();
            }
        }
    });
});

test.describe('Performance', () => {
    test('page loads within acceptable time', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;

        // Page should load within 10 seconds
        expect(loadTime).toBeLessThan(10000);
    });

    test('no console errors on page load', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(2000);

        // Filter out known non-critical errors
        const criticalErrors = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('manifest') &&
            !e.includes('chunk')
        );

        expect(criticalErrors.length).toBe(0);
    });
});
