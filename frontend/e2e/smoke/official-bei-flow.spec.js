const { test, expect } = require('@playwright/test');
const { TEST_USER } = require('../helpers/test-data');

const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');

const sampleButton = (page) =>
  page.locator('div.mb-4.flex.flex-wrap.items-center.justify-end.gap-2 button').first();
const nextButton = (page) =>
  page.locator('div.flex.justify-between.mt-6 button').last();
const outputButtons = (page) =>
  page.locator('div.grid.md\\:grid-cols-2.gap-4 > button');

async function registerAndLogin(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  await page.goto('/register');
  await page.getByRole('button', { name: 'メールアドレスで登録' }).click();
  await page.locator('#fullName').fill(TEST_USER.fullName);
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'アカウントを作成' }).click();
  await page.waitForURL('**/login?registered=true');

  await page.getByRole('button', { name: 'メールアドレスでログイン' }).click();
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page.waitForURL('**/dashboard');
}

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

  await registerAndLogin(page);

  await page.goto('/tools/official-bei');
  await expect(page.locator('h1').first()).toBeVisible();

  await sampleButton(page).click();

  for (let i = 0; i < 9; i += 1) {
    await nextButton(page).click();
  }

  await expect(outputButtons(page)).toHaveCount(2);

  await outputButtons(page).nth(0).click();
  await expect(page.locator('pre')).toContainText('"Status": "OK"');

  const [pdfDownload] = await Promise.all([
    page.waitForEvent('download'),
    outputButtons(page).nth(1).click(),
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
});

test('official BEI flow: blocks compute when required fields are missing', async ({ page }) => {
  let computeCallCount = 0;

  await page.route('**/official/**', async (route) => {
    if (route.request().url().includes('/official/compute')) {
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

  await registerAndLogin(page);

  await page.goto('/tools/official-bei');

  for (let i = 0; i < 9; i += 1) {
    await nextButton(page).click();
  }

  await outputButtons(page).nth(0).click();

  await expect(page.locator('.bg-red-50.border.border-red-200').first()).toBeVisible();
  await expect(page.locator('pre')).toHaveCount(0);
  expect(computeCallCount).toBe(0);
});

test('official BEI flow: sample input button populates required fields', async ({ page }) => {
  await registerAndLogin(page);

  await page.goto('/tools/official-bei');
  await sampleButton(page).click();

  await expect(page.locator('input[type="text"]').first()).not.toHaveValue('');
  await expect(page.locator('select').nth(0)).not.toHaveValue('');
  await expect(page.locator('select').nth(1)).not.toHaveValue('');
  await expect(page.locator('input[placeholder="1000"]')).toHaveValue('500');
});

test('official BEI flow: sample payload avoids known report-validation traps', async ({ page }) => {
  let reportPayload = null;

  await page.route('**/official/report', async (route) => {
    const body = route.request().postData();
    reportPayload = body ? JSON.parse(body) : null;
    await route.fulfill({
      status: 200,
      contentType: 'application/pdf',
      body: PDF_BYTES,
    });
  });

  await registerAndLogin(page);

  await page.goto('/tools/official-bei');
  await sampleButton(page).click();

  for (let i = 0; i < 9; i += 1) {
    await nextButton(page).click();
  }

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    outputButtons(page).nth(1).click(),
  ]);
  expect(download.suggestedFilename()).toContain('.pdf');

  expect(reportPayload).toBeTruthy();
  const officialInput = reportPayload?.official_input || {};
  expect(officialInput?.building?.room_type).toBeUndefined();

  const sampleHotWater = officialInput?.hot_waters?.[0];
  expect(sampleHotWater).toBeTruthy();
  expect(sampleHotWater.use_type).toBeTruthy();
  expect(sampleHotWater.water_saving).toBeTruthy();
  expect(sampleHotWater.fuel_consumption).toBeDefined();

  const samplePump = officialInput?.pumps?.[0];
  if (samplePump?.variable_flow) {
    expect(samplePump.min_flow_input).toBeTruthy();
  }

  const sampleFan = officialInput?.fans?.[0];
  if (sampleFan?.variable_airflow) {
    expect(sampleFan.min_airflow_input).toBeTruthy();
  }
});

test('official BEI flow: template download links are available', async ({ page }) => {
  await registerAndLogin(page);

  await page.goto('/tools/official-bei');

  const modelTemplateLink = page.locator(
    'a[href="/templates/MODEL_inputSheet_for_Ver3.8_beta.xlsx"]',
  );
  const smallTemplateLink = page.locator(
    'a[href="/templates/SMALLMODEL_inputSheet_for_Ver3.8_beta.xlsx"]',
  );

  await expect(modelTemplateLink).toBeVisible();
  await expect(smallTemplateLink).toBeVisible();
});

test('official BEI flow: shows deployment hint when official endpoint is missing', async ({ page }) => {
  await page.route('**/official/compute', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Not Found' }),
    });
  });

  await registerAndLogin(page);

  await page.goto('/tools/official-bei');
  await sampleButton(page).click();

  for (let i = 0; i < 9; i += 1) {
    await nextButton(page).click();
  }

  await outputButtons(page).nth(0).click();
  await expect(page.getByText('/api/v1/official/*').first()).toBeVisible();
});
