const { test, expect } = require('@playwright/test');

test('pricing page shows monthly and one-off plans', async ({ page }) => {
  await page.goto('/pricing');

  await expect(page.getByRole('heading', { name: 'Charge only for official workflow output' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Monthly Plan' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '30-Day Pass' })).toBeVisible();
  await expect(page.getByText('JPY 9,800 / month')).toBeVisible();
  await expect(page.getByText('JPY 4,980 / pass')).toBeVisible();
});
