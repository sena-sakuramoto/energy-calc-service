// e2e/projects/project-crud.spec.js
// プロジェクト CRUD の E2E テスト（認証済み状態で実行）
const { test, expect } = require('@playwright/test');
const { TEST_PROJECT } = require('../helpers/test-data');

test.describe('project CRUD', () => {
  test('create project and see it in list', async ({ page }) => {
    // 1. 新規プロジェクト作成ページへ
    await page.goto('/projects/new');

    // 2. フォーム入力
    await page.locator('#name').fill(TEST_PROJECT.name);
    await page.locator('#description').fill(TEST_PROJECT.description);

    // 3. 作成ボタンクリック
    await page.getByRole('button', { name: 'プロジェクトを作成' }).click();

    // 4. プロジェクト一覧へリダイレクト
    await page.waitForURL('**/projects');

    // 5. 作成成功の確認（通知 or ページタイトルが表示される）
    await expect(page.getByText('プロジェクトを作成しました')).toBeVisible();

    // 6. 作成したプロジェクト名が一覧に表示される
    await expect(page.getByText(TEST_PROJECT.name)).toBeVisible();
  });
});
