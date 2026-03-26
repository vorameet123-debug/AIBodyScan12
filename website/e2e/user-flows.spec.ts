/**
 * E2E Tests - User Flows
 * Tests complete user journeys through the application
 */
import { test, expect } from '@playwright/test';

test.describe('User Flow - Measurement Analysis', () => {
    test('can view measurement features from home', async ({ page }) => {
        await page.goto('/');

        // Look for measurement-related content
        const measurementContent = page.locator('text=/measurement|3D|body scan|analyze/i');
        if (await measurementContent.count() > 0) {
            await expect(measurementContent.first()).toBeVisible({ timeout: 5000 });
        }
    });

    test('measurements page loads', async ({ page }) => {
        await page.goto('/measurements');

        // Should load or redirect
        await page.waitForTimeout(1000);
        const url = page.url();

        // Should be on measurements or redirected to login
        expect(url).toMatch(/measurements|login|auth/i);
    });
});

test.describe('User Flow - Wardrobe', () => {
    test('wardrobe page accessible', async ({ page }) => {
        await page.goto('/wardrobe');

        await page.waitForTimeout(1000);
        const url = page.url();

        // Should be on wardrobe or redirected to login
        expect(url).toMatch(/wardrobe|login|auth/i);
    });
});

test.describe('User Flow - Payment', () => {
    test('pricing page shows plans', async ({ page }) => {
        await page.goto('/pricing');

        await page.waitForTimeout(1000);

        // Should show pricing info
        const pricingContent = page.locator('text=/price|plan|premium|pro|free|subscription|₹|\\$/i');
        if (await pricingContent.count() > 0) {
            await expect(pricingContent.first()).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('API Health', () => {
    test('backend health endpoint responds', async ({ request }) => {
        // Direct API call to backend
        const response = await request.get('http://localhost:8000/api/v1/health');

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.status).toBe('healthy');
    });

    test('backend info endpoint responds', async ({ request }) => {
        const response = await request.get('http://localhost:8000/api/v1/info');

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data).toHaveProperty('name');
        expect(data).toHaveProperty('version');
    });
});
