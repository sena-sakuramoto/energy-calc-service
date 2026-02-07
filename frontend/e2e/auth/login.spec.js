// e2e/auth/login.spec.js
// ログインフローの E2E テスト
const { test, expect } = require('@playwright/test');

test.describe('login flow', () => {
  // テスト前にユーザーを登録しておく
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();
    await page.locator('#fullName').fill('ログインテスト');
    await page.locator('#email').fill('e2e-login@example.com');
    await page.locator('#password').fill('LoginPass1234');
    await page.getByRole('button', { name: 'アカウントを作成' }).click();
    await page.waitForURL('**/login?registered=true');
  });

  test('user can login with email and password', async ({ page }) => {
    // 1. メールログインフォームへ遷移
    await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();

    // 2. フォーム入力
    await page.locator('#email').fill('e2e-login@example.com');
    await page.locator('#password').fill('LoginPass1234');

    // 3. ログイン送信
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // 4. トップページへリダイレクト
    await page.waitForURL('/');

    // 5. ヘッダーに「ログアウト」ボタンが表示されている
    await expect(page.getByRole('button', { name: 'ログアウト' })).toBeVisible();
  });

  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();
    await page.locator('#email').fill('e2e-login@example.com');
    await page.locator('#password').fill('WrongPassword');
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();

    // エラーメッセージが表示される
    await expect(page.getByText('パスワードが正しくありません')).toBeVisible();
  });
});
