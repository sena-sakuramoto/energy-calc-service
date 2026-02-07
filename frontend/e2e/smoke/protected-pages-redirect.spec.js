// e2e/smoke/protected-pages-redirect.spec.js
// 未認証リダイレクト確認 - 未認証で保護ページにアクセスしたときログインへリダイレクトされる
const { test, expect } = require('@playwright/test');
const { PROTECTED_PAGES } = require('../helpers/test-data');

for (const path of PROTECTED_PAGES) {
  test(`unauthenticated redirect: ${path} → /login`, async ({ page }) => {
    await page.goto(path);

    // ログインページへリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/);
  });
}
