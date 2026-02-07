// e2e/smoke/public-pages.spec.js
// 公開ページのスモークテスト - 各ページが正常にロードされることを確認
const { test, expect } = require('@playwright/test');
const { PUBLIC_PAGES } = require('../helpers/test-data');

for (const path of PUBLIC_PAGES) {
  test(`public page loads: ${path}`, async ({ page }) => {
    const response = await page.goto(path);

    // HTTP ステータスが成功(2xx)であること
    expect(response.status()).toBeLessThan(400);

    // ページがクラッシュしていないことを確認（bodyが存在する）
    await expect(page.locator('body')).toBeVisible();
  });
}
