const { test, expect } = require('@playwright/test');

test('pricing page shows monthly and one-off plans', async ({ page }) => {
  await page.goto('/pricing');

  await expect(
    page.getByRole('heading', { name: '公式出力が必要なときだけ課金' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '月額プラン' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '30日パス' })).toBeVisible();
  await expect(page.getByText('9,800円 / 月')).toBeVisible();
  await expect(page.getByText('4,980円 / 回')).toBeVisible();
});
