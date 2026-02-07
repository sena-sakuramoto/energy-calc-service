// e2e/auth.setup.js
// 認証セットアップ - ユーザー登録 → ログイン → storageState 保存
const { test: setup } = require('@playwright/test');
const { TEST_USER } = require('./helpers/test-data');

setup('register and login', async ({ page }) => {
  // 1. 登録ページへ遷移
  await page.goto('/register');

  // 「メール・パスワードで登録」ボタンをクリック
  await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();

  // 2. 登録フォーム入力
  await page.locator('#fullName').fill(TEST_USER.fullName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);

  // 3. 登録送信
  await page.getByRole('button', { name: 'アカウントを作成' }).click();

  // 4. ログインページへリダイレクト確認
  await page.waitForURL('**/login?registered=true');

  // 5. ログインフォームへ遷移
  await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();

  // 6. ログインフォーム入力
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);

  // 7. ログイン送信
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();

  // 8. トップページへリダイレクト確認
  await page.waitForURL('/');

  // 9. storageState 保存
  await page.context().storageState({ path: './e2e/.auth/user.json' });
});
