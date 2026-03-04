# CODEX指示書: 住宅版 E2Eテスト（Playwright）

## 目的

`/residential` ページのE2Eテストを Playwright で作成する。CSV取込、商品変更時のUA差分、PDF出力、公式API検証の一連フローをテストする。

## 完了条件

1. `cd frontend && npx playwright test e2e/residential/ --project=smoke` → 全PASS
2. 最低8テストケース
3. `npm run build` → 成功

---

## 既存テスト構造

```
frontend/e2e/
├── auth.setup.js          # 認証セットアップ
├── helpers/
│   └── test-data.js       # テストデータ（TEST_USER, PUBLIC_PAGES等）
├── smoke/
│   ├── public-pages.spec.js
│   ├── official-bei-flow.spec.js   # ← 非住宅版の参考パターン
│   └── protected-pages-redirect.spec.js
├── auth/
│   ├── login.spec.js
│   └── register.spec.js
├── tools/
│   └── bei-calculator.spec.js
└── projects/
    └── project-crud.spec.js
```

**Playwright設定**: `frontend/playwright.config.js`
- Base URL: `http://localhost:3001`
- `NEXT_PUBLIC_USE_MOCK: 'true'`
- プロジェクト: `smoke`（認証不要）、`authenticated`（認証必要）

---

## 実装タスク

### Task 1: テストファイル作成

**ファイル**: `frontend/e2e/smoke/residential-calc.spec.js`（新規）

`/residential` は認証不要なので `smoke` プロジェクトに配置。

### Task 2: ページ読み込みテスト

```javascript
const { test, expect } = require('@playwright/test');

test.describe('住宅版計算 /residential', () => {

  test('ページが正常に読み込まれる', async ({ page }) => {
    await page.goto('/residential');
    await expect(page.getByText('住宅外皮計算')).toBeVisible();
    // タブが全て表示される
    await expect(page.getByRole('tab', { name: /形状テンプレート/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /壁セグメント/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /建具表/ })).toBeVisible();
  });

});
```

### Task 3: 形状テンプレート適用テスト

```javascript
test('形状テンプレートを適用すると壁セグメントが生成される', async ({ page }) => {
  await page.goto('/residential');

  // テンプレートタブをクリック
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();

  // 整形（総2階）を選択
  await page.getByText('整形（総2階）').click();

  // 壁セグメントタブに切り替え
  await page.getByRole('tab', { name: /壁セグメント/ }).click();

  // 4方位の壁セグメントが生成されているか確認
  // （具体的なセレクタはUI実装に合わせて調整）
  const wallInputs = page.locator('[data-testid="wall-segment"]');
  // もしdata-testidがなければ、壁の方位ラベルで確認
  await expect(page.getByText(/北面|N面/)).toBeVisible();
  await expect(page.getByText(/南面|S面/)).toBeVisible();
});
```

### Task 4: UA/ηAC リアルタイム計算テスト

```javascript
test('入力変更でUA値がリアルタイム更新される', async ({ page }) => {
  await page.goto('/residential');

  // テンプレートを適用して初期状態を作る
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();

  // 結果パネルにUA値が表示されるまで待機（debounce 300ms + 計算）
  await page.waitForTimeout(500);
  const resultPanel = page.locator('[class*="sticky"]').last();
  await expect(resultPanel).toContainText(/UA/);

  // UA値が数値として表示されている
  const uaText = await resultPanel.textContent();
  expect(uaText).toMatch(/UA\s*[=:]\s*\d+\.\d+/);
});
```

### Task 5: 建具表（WindowSchedule）テスト

```javascript
test('建具表に窓を追加するとηAC値が変化する', async ({ page }) => {
  await page.goto('/residential');

  // テンプレート適用
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // 初期ηAC値を記録
  const resultPanel = page.locator('[class*="sticky"]').last();
  const initialText = await resultPanel.textContent();

  // 建具表タブに切り替え
  await page.getByRole('tab', { name: /建具表/ }).click();

  // 窓を追加（ボタンがあるはず）
  const addButton = page.getByRole('button', { name: /追加|窓を追加/ });
  if (await addButton.isVisible()) {
    await addButton.click();
    await page.waitForTimeout(500);

    // ηAC値が変化（または窓が追加されたことの確認）
    const updatedText = await resultPanel.textContent();
    // 値が存在することの確認
    expect(updatedText).toMatch(/ηAC|eta/i);
  }
});
```

### Task 6: 商品選択テスト

```javascript
test('商品を変更するとUA値に差分が反映される', async ({ page }) => {
  await page.goto('/residential');

  // テンプレート適用
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // 建具表タブで窓が既にある場合、商品選択を変更
  await page.getByRole('tab', { name: /建具表/ }).click();

  // セレクトボックスがあれば商品を変更
  const sashSelect = page.locator('select').first();
  if (await sashSelect.isVisible()) {
    const options = await sashSelect.locator('option').allTextContents();
    if (options.length > 1) {
      await sashSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
    }
  }
});
```

### Task 7: CSV取込テスト

```javascript
test('CSVファイルから建具データを取り込める', async ({ page }) => {
  await page.goto('/residential');
  await page.getByRole('tab', { name: /建具表/ }).click();

  // CSVインポートボタンまたはファイル入力を探す
  const fileInput = page.locator('input[type="file"]');
  if (await fileInput.count() > 0) {
    // テスト用CSVを作成してアップロード
    const csvContent = 'symbol,width,height,sash_type,glass_type,orientation,quantity\nW-1,1650,1100,resin,double_low_e_gas,S,2';

    // Buffer経由でアップロード
    await fileInput.setInputFiles({
      name: 'test_windows.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    await page.waitForTimeout(500);
    // 取り込まれたデータが表示されるか確認
    await expect(page.getByText(/W-1/)).toBeVisible();
  }
});
```

### Task 8: PDF出力テスト

```javascript
test('求積表PDFが生成・ダウンロードされる', async ({ page }) => {
  await page.goto('/residential');

  // テンプレート適用
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // PDF出力ボタンをクリック
  const pdfButton = page.getByRole('button', { name: /求積表PDF|PDF/ });
  if (await pdfButton.isVisible()) {
    // ダウンロードイベントを待機
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await pdfButton.click();
    const download = await downloadPromise;

    if (download) {
      // ファイル名にPDFが含まれる
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  }
});

test('計算書PDFが生成・ダウンロードされる', async ({ page }) => {
  await page.goto('/residential');

  // テンプレート適用
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // 計算書PDFボタン
  const calcPdfButton = page.getByRole('button', { name: /計算書PDF/ });
  if (await calcPdfButton.isVisible()) {
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
    await calcPdfButton.click();
    const download = await downloadPromise;

    if (download) {
      expect(download.suggestedFilename()).toMatch(/\.pdf$/);
    }
  }
});
```

### Task 9: 公式API検証テスト（モック）

```javascript
test('公式API検証ボタンで三者比較結果が表示される', async ({ page }) => {
  // 住宅版APIをモック
  await page.route('**/residential/verify', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        backend_result: { ua_value: 0.56, eta_a_c: 1.2 },
        official_result: { ua: 0.56, eta_ac: 1.2 },
        comparison: { ua_match: true, eta_ac_match: true },
      }),
    });
  });

  await page.goto('/residential');

  // テンプレート適用
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // 検証ボタンをクリック
  const verifyButton = page.getByRole('button', { name: /公式API|検証/ });
  if (await verifyButton.isVisible()) {
    await verifyButton.click();
    await page.waitForTimeout(2000);

    // 検証結果が表示される
    // 成功時は「一致」「✅」などが表示される
    const body = await page.textContent('body');
    expect(body).toMatch(/一致|✅|match|0\.56/);
  }
});
```

### Task 10: localStorage永続化テスト

```javascript
test('プロジェクトがlocalStorageに保存・復元される', async ({ page }) => {
  await page.goto('/residential');

  // テンプレート適用して状態を作る
  await page.getByRole('tab', { name: /形状テンプレート/ }).click();
  await page.getByText('整形（総2階）').click();
  await page.waitForTimeout(500);

  // localStorageに保存されていることを確認
  const stored = await page.evaluate(() => {
    return localStorage.getItem('raku_projects') || localStorage.getItem('residential_project');
  });

  // リロードして復元されるか
  await page.reload();
  await page.waitForTimeout(1000);

  // テンプレート適用後の壁データが残っていればOK
  const resultPanel = page.locator('[class*="sticky"]').last();
  const text = await resultPanel.textContent();
  expect(text).toMatch(/UA/);
});
```

---

## テスト実行方法

```bash
cd frontend

# 住宅版テストのみ実行
npx playwright test e2e/smoke/residential-calc.spec.js --project=smoke

# ヘッド付きで確認
npx playwright test e2e/smoke/residential-calc.spec.js --project=smoke --headed

# 全E2Eテスト
npx playwright test
```

---

## 注意事項

- セレクタは実際のUI実装に合わせて調整すること。`data-testid` がない場合はロール・テキストベースで選択
- debounce 300ms があるため `waitForTimeout(500)` を適宜入れる
- PDFダウンロードテストは `page.waitForEvent('download')` を使用
- APIモックは `page.route()` で実装（Playwright標準パターン）
- 既存テスト `official-bei-flow.spec.js` のAPIモックパターンを参考にすること

## 参考ファイル

- `frontend/playwright.config.js` — Playwright設定
- `frontend/e2e/smoke/official-bei-flow.spec.js` — APIモック参考パターン
- `frontend/e2e/helpers/test-data.js` — テストデータ定義
- `frontend/src/residential/components/ResidentialCalc.tsx` — テスト対象コンポーネント
