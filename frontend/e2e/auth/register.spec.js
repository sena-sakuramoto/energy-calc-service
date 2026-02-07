// e2e/auth/register.spec.js
// 登録フローの E2E テスト
const { test, expect } = require('@playwright/test');

test('user can register with email and password', async ({ page }) => {
  const uniqueEmail = `e2e-register-${Date.now()}@example.com`;

  // 1. 登録ページへ遷移
  await page.goto('/register');
  await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();

  // 2. 「メール・パスワードで登録」をクリック
  await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();

  // 3. フォーム入力
  await page.locator('#fullName').fill('テスト太郎');
  await page.locator('#email').fill(uniqueEmail);
  await page.locator('#password').fill('SecurePass123');

  // 4. 登録送信
  await page.getByRole('button', { name: 'アカウントを作成' }).click();

  // 5. ログインページへリダイレクト（registered=true 付き）
  await page.waitForURL('**/login?registered=true');

  // 6. 登録成功メッセージが表示されていること
  await expect(page.getByText('登録が完了しました')).toBeVisible();
});
