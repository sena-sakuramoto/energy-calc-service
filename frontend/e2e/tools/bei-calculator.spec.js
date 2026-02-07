// e2e/tools/bei-calculator.spec.js
// BEI 計算ツールの E2E テスト
const { test, expect } = require('@playwright/test');

test.describe('BEI calculator', () => {
  test('apply sample data and run calculation', async ({ page }) => {
    // 1. BEI計算ページへ遷移
    await page.goto('/tools/bei-calculator');

    // 2. サンプルデータ（小規模事務所ビル）を適用
    await page.getByRole('button', { name: '小規模事務所ビル' }).click();

    // 3. サンプルデータが適用されたことをサマリーで確認
    await expect(page.getByText('延床面積: 1,200 m²', { exact: true })).toBeVisible();

    // 4. 「次へ」ボタンで進む（ステップ1→ステップ2: 設計エネルギー値）
    await page.getByRole('button', { name: /次へ/ }).click();

    // 5. ステップ2（設計エネルギー値）が表示されることを確認
    await expect(page.getByRole('heading', { name: /設計一次エネルギー消費量/ })).toBeVisible();

    // 6. 「次へ」で再エネ控除ステップへ
    await page.getByRole('button', { name: /次へ/ }).click();

    // 7. 再エネ控除ステップが表示される
    await expect(page.getByRole('heading', { name: /再生可能エネルギー控除/ })).toBeVisible();

    // 8. BEI計算実行
    await page.getByRole('button', { name: /BEI計算実行/ }).click();

    // 9. 結果が表示されることを確認
    await expect(page.getByText('BEI計算結果')).toBeVisible({ timeout: 15_000 });
  });
});
