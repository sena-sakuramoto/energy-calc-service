const { test, expect } = require('@playwright/test');
const { TEST_USER } = require('../helpers/test-data');

const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');

test('official BEI flow: input -> compute -> pdf -> excel upload', async ({ page }) => {
  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': '*',
  };

  await page.route('**/official/**', async (route) => {
    const request = route.request();
    const url = request.url();

    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders });
      return;
    }

    if (url.includes('/official/compute')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          Status: 'OK',
          BasicInformationValidationResult: {
            IsValid: true,
            HasWarning: false,
            Errors: [],
            Warnings: [],
          },
        }),
      });
      return;
    }

    if (url.includes('/official/report') || url.includes('/official/upload-report')) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/pdf',
        body: PDF_BYTES,
      });
      return;
    }

    await route.continue();
  });

  // E2E auth bootstrap (register + login) for protected calculator pages.
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/register');
  await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();
  await page.locator('#fullName').fill(TEST_USER.fullName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'アカウントを作成' }).click();
  await page.waitForURL('**/login?registered=true');

  await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page.waitForURL('**/dashboard');

  await page.goto('/tools/official-bei');
  await expect(page.getByRole('heading', { name: '公式BEI計算 (様式入力)' })).toBeVisible();

  await page.locator('input[placeholder="例: ○○ビル"]').fill('E2Eテストビル');
  await page.locator('select').nth(0).selectOption('6地域');
  await page.locator('select').nth(1).selectOption('事務所モデル');
  await page.locator('input[placeholder="1000"]').fill('500');

  for (let i = 0; i < 9; i += 1) {
    await page.getByRole('button', { name: '次へ' }).click();
  }

  await expect(page.getByText('確認・公式PDF出力')).toBeVisible();

  await page.getByRole('button', { name: '公式計算実行' }).click();
  await expect(page.getByText('公式計算結果')).toBeVisible();
  await expect(page.locator('pre')).toContainText('"Status": "OK"');

  const [pdfDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '公式PDF出力' }).click(),
  ]);
  expect(pdfDownload.suggestedFilename()).toContain('.pdf');

  const [uploadDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('input[type="file"]').setInputFiles({
      name: 'sample.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('PK\x03\x04dummy-xlsx'),
    }),
  ]);
  expect(uploadDownload.suggestedFilename()).toContain('_official_report.pdf');

  await expect(page.getByText('公式計算エラー')).toHaveCount(0);
  await expect(page.getByText('公式PDF生成エラー')).toHaveCount(0);
  await expect(page.getByText('Excelアップロードエラー')).toHaveCount(0);
});

test('official BEI flow: blocks compute when required fields are missing', async ({ page }) => {
  let computeCallCount = 0;

  await page.route('**/official/**', async (route) => {
    const request = route.request();
    const url = request.url();

    if (url.includes('/official/compute')) {
      computeCallCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ Status: 'OK' }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/register');
  await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();
  await page.locator('#fullName').fill(TEST_USER.fullName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'アカウントを作成' }).click();
  await page.waitForURL('**/login?registered=true');

  await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page.waitForURL('**/dashboard');

  await page.goto('/tools/official-bei');
  await expect(page.getByRole('heading', { name: '公式BEI計算 (様式入力)' })).toBeVisible();

  for (let i = 0; i < 9; i += 1) {
    await page.getByRole('button', { name: '次へ' }).click();
  }

  await page.getByRole('button', { name: '公式計算実行' }).click();

  await expect(page.getByText('入力内容に不足があります。必須項目を確認してください。')).toBeVisible();
  await expect(page.getByText('公式計算結果')).toHaveCount(0);
  expect(computeCallCount).toBe(0);
});

test('official BEI flow: sample input button populates required fields', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/register');
  await page.getByRole('button', { name: 'メール・パスワードで登録' }).click();
  await page.locator('#fullName').fill(TEST_USER.fullName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'アカウントを作成' }).click();
  await page.waitForURL('**/login?registered=true');

  await page.getByRole('button', { name: 'メール・パスワードでログイン' }).click();
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page.waitForURL('**/dashboard');

  await page.goto('/tools/official-bei');
  await expect(page.getByRole('button', { name: 'サンプル入力' })).toBeVisible();

  await page.getByRole('button', { name: 'サンプル入力' }).click();

  await expect(page.locator('input[placeholder="例: ○○ビル"]')).toHaveValue('サンプルオフィスビル');
  await expect(page.locator('select').nth(0)).toHaveValue('6地域');
  await expect(page.locator('select').nth(1)).toHaveValue('事務所モデル');
  await expect(page.locator('input[placeholder="1000"]')).toHaveValue('500');
});
