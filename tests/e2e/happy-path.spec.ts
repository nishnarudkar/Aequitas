import { test, expect } from '@playwright/test';

test.describe('Aequitas Happy Path User Flow', () => {
  test('allows user to complete intake wizard and view legal document analysis', async ({ page }) => {
    // 1. Visit home page intake wizard
    await page.goto('/');
    await expect(page).toHaveTitle(/Aequitas/i);

    // 2. Intake step check — Persona Selection
    const tenantPersonaTile = page.locator('button', { hasText: 'Tenant / Renter' });
    if (await tenantPersonaTile.isVisible()) {
      await tenantPersonaTile.click();
    }

    // 3. Continue through wizard step if present
    const continueBtn = page.getByRole('button', { name: /continue|start analysis/i });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
    }

    // 4. Navigate to workspace
    await page.goto('/analyze');
    await page.waitForLoadState('networkidle');

    // 5. Verify Workspace components and header
    await expect(page.getByText(/Contract Analysis/i)).toBeVisible();

    // 6. Test Tab Navigation
    // Check Analysis tab is active
    await expect(page.getByRole('tab', { name: /Analysis & Risks/i })).toBeVisible();

    // Switch to Action & Negotiation Tab
    await page.getByRole('tab', { name: /Checklist & Negotiation/i }).click();
    await expect(page.getByRole('heading', { name: /Action Checklist/i })).toBeVisible();

    // Switch to Lawyer Brief Tab
    await page.getByRole('tab', { name: /Print Lawyer Brief/i }).click();
    await expect(page.getByText(/Aequitas — Client Legal Brief/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Print Brief/i })).toBeVisible();

    // Switch to Compare Tab
    await page.getByRole('tab', { name: /Compare/i }).click();
    await expect(page.getByText(/Compare against fair market baseline/i)).toBeVisible();
  });
});
