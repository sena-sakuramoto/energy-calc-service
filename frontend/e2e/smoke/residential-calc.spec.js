const { test, expect } = require('@playwright/test');

async function openResidential(page) {
  await page.goto('/residential');
  await expect(page.getByRole('heading', { name: '楽々省エネ計算 — 住宅版' })).toBeVisible();
}

async function applyRectTemplate(page) {
  await page.getByRole('button', { name: '形状テンプレート' }).click();
  await page.getByRole('button', { name: '壁セグメントを自動生成' }).click();
  await page.waitForTimeout(700);
}

function resultPanel(page) {
  return page.locator('.sticky.bottom-3').first();
}

test.describe('住宅版計算 /residential', () => {
  test('ページが正常に読み込まれる', async ({ page }) => {
    await openResidential(page);

    await expect(page.getByRole('button', { name: '形状テンプレート' })).toBeVisible();
    await expect(page.getByRole('button', { name: '壁セグメント', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '建具表' })).toBeVisible();
    await expect(page.getByText('対応範囲')).toBeVisible();
  });

  test('形状テンプレート適用で壁セグメントが生成される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    await page.getByRole('button', { name: '壁セグメント', exact: true }).click();
    await expect(page.getByText('北面合計')).toBeVisible();
    await expect(page.getByText('NET')).toBeVisible();
  });

  test('入力後にUA/ηACが表示される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    const panel = resultPanel(page);
    await expect(panel).toContainText('UA値');
    await expect(panel).toContainText('ηAC値');

    const panelText = await panel.textContent();
    expect(panelText).toMatch(/UA値[\s\S]*\d+\.\d{2}/);
    expect(panelText).toMatch(/ηAC値[\s\S]*\d+\.\d/);
  });

  test('建具追加で建具行が表示される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    await page.getByRole('button', { name: '建具表' }).click();
    await page.getByRole('button', { name: '+ 建具追加' }).click();

    const firstRow = page.locator('tbody tr').first();
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(firstRow.locator('td').first().locator('input')).toHaveValue('W-1');
  });

  test('CSV取込で建具記号が反映される', async ({ page }) => {
    await openResidential(page);
    await page.getByRole('button', { name: '建具表' }).click();

    const csvContent = [
      'symbol,width,height,sash_type,glass_type,orientation,quantity,product_id',
      'W-CSV-1,1650,1100,resin,double_lowe_a16,S,2,apw330_std',
    ].join('\n');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'residential-openings.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent, 'utf-8'),
    });

    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow.locator('td').first().locator('input')).toHaveValue('W-CSV-1');
  });

  test('商品変更で比較表示が更新される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    await page.getByRole('button', { name: '建具表' }).click();
    await page.getByRole('button', { name: '+ 建具追加' }).click();

    const productSelect = page.locator('tbody tr').first().locator('td').nth(8).locator('select');
    await productSelect.selectOption('apw430_std');
    await page.waitForTimeout(500);

    const panel = resultPanel(page);
    await expect(panel).toContainText('UA');
    await expect(panel).toContainText('コスト');
    await expect(panel).toContainText('→');
  });

  test('求積表PDFがダウンロードされる', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '求積表PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^residential_area_table_.*\.pdf$/);
  });

  test('計算書PDFがダウンロードされる', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '計算書PDF' }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^residential_calc_report_.*\.pdf$/);
  });

  test('公式API検証ボタンで検証メッセージが表示される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    await page.getByRole('button', { name: '公式APIで検証' }).click();
    await page.waitForTimeout(500);

    const panel = resultPanel(page);
    await expect(panel).toContainText('検証');
    await expect(panel).toContainText('UA');
    await expect(panel).toContainText('ηAC');
  });

  test('プロジェクトがlocalStorageに保存・復元される', async ({ page }) => {
    await openResidential(page);
    await applyRectTemplate(page);

    const storedValue = await page.evaluate(() => localStorage.getItem('raku_projects'));
    expect(storedValue).toBeTruthy();

    await page.reload();
    await page.waitForTimeout(700);

    const panel = resultPanel(page);
    await expect(panel).toContainText('UA値');
  });
});
