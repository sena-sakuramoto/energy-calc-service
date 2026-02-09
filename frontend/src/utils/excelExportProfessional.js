// frontend/src/utils/excelExportProfessional.js
// Professional multi-sheet Excel export for BEI calculations (SheetJS)
import * as XLSX from 'xlsx';
import { formatBEI } from './number';

// ---- lookup helpers ----

const getBuildingTypeName = (type) => {
  const names = {
    office: '事務所等',
    hotel: 'ホテル等',
    hospital: '病院等',
    shop_department: '百貨店等',
    shop_supermarket: 'スーパーマーケット',
    school_small: '学校等（小中学校）',
    school_high: '学校等（高等学校）',
    school_university: '学校等（大学）',
    restaurant: '飲食店等',
    assembly: '集会所等',
    factory: '工場等',
    residential_collective: '共同住宅',
  };
  return names[type] || type;
};

const getCategoryName = (category) => {
  const names = {
    heating: '暖房',
    cooling: '冷房',
    ventilation: '機械換気',
    hot_water: '給湯',
    lighting: '照明',
    elevator: '昇降機',
  };
  return names[category] || category;
};

// Standard energy intensity base values by building type (MJ/m2/year)
const BASE_INTENSITIES = {
  office:               { heating: 38, cooling: 38, ventilation: 28, hot_water:   3, lighting: 70, elevator: 14 },
  hotel:                { heating: 54, cooling: 54, ventilation: 28, hot_water: 176, lighting: 70, elevator: 14 },
  hospital:             { heating: 72, cooling: 72, ventilation: 89, hot_water: 176, lighting: 98, elevator: 14 },
  shop_department:      { heating: 38, cooling: 56, ventilation: 28, hot_water:   3, lighting: 98, elevator: 14 },
  shop_supermarket:     { heating: 38, cooling: 56, ventilation: 28, hot_water:   3, lighting: 98, elevator:  0 },
  school_small:         { heating: 38, cooling: 28, ventilation: 14, hot_water:   3, lighting: 56, elevator:  0 },
  school_high:          { heating: 38, cooling: 28, ventilation: 14, hot_water:   3, lighting: 56, elevator:  0 },
  school_university:    { heating: 38, cooling: 38, ventilation: 28, hot_water:   3, lighting: 70, elevator: 14 },
  restaurant:           { heating: 38, cooling: 38, ventilation: 28, hot_water: 176, lighting: 70, elevator:  0 },
  assembly:             { heating: 38, cooling: 38, ventilation: 28, hot_water:   3, lighting: 70, elevator: 14 },
  factory:              { heating: 14, cooling: 14, ventilation: 28, hot_water:   3, lighting: 56, elevator:  0 },
  residential_collective: { heating: 38, cooling: 28, ventilation: 14, hot_water: 70, lighting: 42, elevator: 14 },
};

// Regional correction factors for heating/cooling by climate zone
const REGIONAL_FACTORS = {
  1: { heating: 2.38, cooling: 0.66 },
  2: { heating: 2.01, cooling: 0.69 },
  3: { heating: 1.54, cooling: 0.86 },
  4: { heating: 1.16, cooling: 0.99 },
  5: { heating: 1.07, cooling: 1.07 },
  6: { heating: 0.84, cooling: 1.15 },
  7: { heating: 0.70, cooling: 1.27 },
  8: { heating: 0.36, cooling: 1.35 },
};

const SCALE_FACTOR = 0.95;

const getStandardIntensities = (buildingType, climateZone) => {
  const base = BASE_INTENSITIES[buildingType] || BASE_INTENSITIES.office;
  const factors = REGIONAL_FACTORS[parseInt(climateZone)] || REGIONAL_FACTORS[4];
  const cats = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];
  const out = {};
  cats.forEach((c) => {
    const f = (c === 'heating' || c === 'cooling') ? factors[c] : 1.0;
    out[c] = {
      base: base[c],
      factor: f,
      corrected: Math.round(base[c] * f * SCALE_FACTOR * 100) / 100,
    };
  });
  return out;
};

// ---- cell-style helpers (SheetJS community edition) ----
// SheetJS OSS does not natively apply rich styles inside .xlsx, but we can set
// number formats, column widths, row heights, and merges which ARE supported.

/**
 * Set a numeric format on every cell in a range that holds a number.
 * fmt examples: '#,##0', '#,##0.0', '0.00', '0.0%'
 */
const applyNumberFormat = (ws, startRow, endRow, col, fmt) => {
  for (let r = startRow; r <= endRow; r++) {
    const addr = XLSX.utils.encode_cell({ r, c: col });
    if (ws[addr] && ws[addr].t === 'n') {
      ws[addr].z = fmt;
    }
  }
};

// ---- date helpers ----
const yyyymmdd = () => {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

const jaDate = () =>
  new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

const makeDocumentId = () => {
  const d = new Date();
  return `BEI-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
};

// ===========================================================================
//  MAIN EXPORT
// ===========================================================================

export const exportToProfessionalExcel = (result, formData, projectInfo) => {
  if (!result || !formData) {
    throw new Error('計算結果またはフォームデータがありません');
  }

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: 'BEI計算書（モデル建物法）',
    Author: '建築物省エネ計算システム',
    CreatedDate: new Date(),
  };

  const area = Number(formData.floor_area || result.building_area_m2) || 0;
  const renewable = Number(formData.renewable_energy || result.renewable_deduction_mj || 0);
  const beiDisplay = formatBEI(result.bei) ?? String(result.bei);
  const beiNumber = formatBEI(result.bei, true) ?? result.bei;
  const documentId = makeDocumentId();
  const dateStr = jaDate();

  const buildingName = getBuildingTypeName(formData.building_type);
  const zoneLabel = `${formData.climate_zone}地域`;

  // category order
  const CATS = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];

  // build breakdown map  { category -> primary_energy_mj }
  const breakdownMap = {};
  (result.design_energy_breakdown || []).forEach((item) => {
    breakdownMap[item.category] = Number(item.primary_energy_mj || 0);
  });

  const stdIntensities = getStandardIntensities(formData.building_type, formData.climate_zone);

  // ===================================================================
  //  Sheet 1 : 計算概要 (Summary)
  // ===================================================================
  const s1 = [];
  // Row 0 (title)
  s1.push(['BEI計算書（モデル建物法）', '', '', '', '']);
  // Row 1 (subtitle)
  s1.push(['建築物省エネルギー法 適合性判定計算書', '', '', '', '']);
  // Row 2 (date / doc id)
  s1.push(['作成日', dateStr, '', '文書ID', documentId]);
  // Row 3 (blank)
  s1.push([]);
  // Row 4-8 : Project info header
  s1.push(['建物情報', '', '', '', '']);
  s1.push(['建物名称', projectInfo?.name || '(未設定)', '', '', '']);
  s1.push(['建物用途', buildingName, '', '', '']);
  s1.push(['地域区分', zoneLabel, '', '', '']);
  s1.push(['延べ面積', area, 'm\u00B2', '', '']);
  s1.push(['再エネ控除', renewable, 'MJ/年', '', '']);
  // Row 10 (blank)
  s1.push([]);
  // Row 11 : BEI Result header
  s1.push(['BEI計算結果', '', '', '', '']);
  // Row 12 : values
  s1.push(['BEI値', beiNumber, '', '判定結果', result.is_compliant ? '適合' : '不適合']);
  // Row 13 (blank)
  s1.push([]);
  // Row 14 : Formula
  s1.push(['計算式', 'BEI = 設計値 / 基準値', '', '', '']);
  s1.push(['設計一次エネルギー消費量', result.design_primary_energy_mj, 'MJ/年', '', '']);
  s1.push(['基準一次エネルギー消費量', result.standard_primary_energy_mj, 'MJ/年', '', '']);
  s1.push([
    '計算',
    `${result.design_primary_energy_mj?.toLocaleString()} / ${result.standard_primary_energy_mj?.toLocaleString()} = ${beiDisplay}`,
    '', '', '',
  ]);
  // Row 18 (blank)
  s1.push([]);
  // Row 19 : criteria note
  s1.push(['判定基準', 'BEI <= 1.0 で省エネ基準適合', '', '', '']);
  // Row 20: project extra info
  if (projectInfo) {
    s1.push([]);
    s1.push(['プロジェクト詳細', '', '', '', '']);
    if (projectInfo.buildingOwner) s1.push(['建築主', projectInfo.buildingOwner, '', '', '']);
    if (projectInfo.designer) s1.push(['設計者', projectInfo.designer, '', '', '']);
    if (projectInfo.designFirm) s1.push(['設計事務所', projectInfo.designFirm, '', '', '']);
    if (projectInfo.location) s1.push(['所在地', projectInfo.location, '', '', '']);
    if (projectInfo.description) s1.push(['概要', projectInfo.description, '', '', '']);
  }

  const ws1 = XLSX.utils.aoa_to_sheet(s1);

  // Column widths
  ws1['!cols'] = [
    { wch: 28 },
    { wch: 24 },
    { wch: 10 },
    { wch: 16 },
    { wch: 24 },
  ];

  // Merges for title rows
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // subtitle
    { s: { r: 4, c: 0 }, e: { r: 4, c: 4 } }, // section header
    { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } }, // BEI header
  ];

  // Number formats
  applyNumberFormat(ws1, 0, s1.length - 1, 1, '#,##0');
  // BEI cell special format
  const beiAddr1 = XLSX.utils.encode_cell({ r: 12, c: 1 });
  if (ws1[beiAddr1]) ws1[beiAddr1].z = '0.00';

  XLSX.utils.book_append_sheet(wb, ws1, '計算概要');

  // ===================================================================
  //  Sheet 2 : エネルギー内訳 (Energy Breakdown)
  // ===================================================================
  const s2 = [];
  // Header row
  s2.push([
    '項目',
    '設計一次エネルギー(MJ/年)',
    '単位面積あたり(MJ/m\u00B2年)',
    '基準値(MJ/m\u00B2年)',
    '比率(%)',
  ]);

  const totalDesign = Number(result.design_primary_energy_mj) || 0;

  CATS.forEach((cat) => {
    const designVal = breakdownMap[cat] || 0;
    const perM2 = area > 0 ? designVal / area : 0;
    const stdVal = stdIntensities[cat]?.corrected || 0;
    const pct = totalDesign > 0 ? (designVal / totalDesign) * 100 : 0;
    s2.push([
      getCategoryName(cat),
      Math.round(designVal),
      Math.round(perM2 * 10) / 10,
      stdVal,
      Math.round(pct * 10) / 10,
    ]);
  });

  // Total row
  const designPerM2 = Number(result.design_energy_per_m2) || (area > 0 ? totalDesign / area : 0);
  const stdPerM2Total = Number(result.standard_energy_per_m2) || 0;
  s2.push([
    '合計',
    Math.round(totalDesign),
    Math.round(designPerM2 * 10) / 10,
    Math.round(stdPerM2Total * 100) / 100,
    100.0,
  ]);

  // Renewable deduction row
  s2.push([
    '再エネ控除',
    -Math.round(renewable),
    area > 0 ? Math.round((-renewable / area) * 10) / 10 : 0,
    '',
    '',
  ]);

  // Net total row
  const netDesign = totalDesign - renewable;
  s2.push([
    '差引合計（ネット）',
    Math.round(netDesign),
    area > 0 ? Math.round((netDesign / area) * 10) / 10 : 0,
    '',
    '',
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet(s2);
  ws2['!cols'] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 26 },
    { wch: 22 },
    { wch: 12 },
  ];

  // Number formats for the data columns
  applyNumberFormat(ws2, 1, s2.length - 1, 1, '#,##0');
  applyNumberFormat(ws2, 1, s2.length - 1, 2, '#,##0.0');
  applyNumberFormat(ws2, 1, s2.length - 1, 3, '#,##0.00');
  applyNumberFormat(ws2, 1, s2.length - 1, 4, '0.0');

  XLSX.utils.book_append_sheet(wb, ws2, 'エネルギー内訳');

  // ===================================================================
  //  Sheet 3 : 基準値詳細 (Standard Values)
  // ===================================================================
  const s3 = [];
  s3.push(['基準エネルギー消費量原単位 詳細', '', '', '', '']);
  s3.push([]);
  s3.push(['建物用途', buildingName, '', '', '']);
  s3.push(['地域区分', zoneLabel, '', '', '']);
  s3.push(['規模補正係数', SCALE_FACTOR, '', '', '']);
  s3.push([]);
  s3.push([
    '設備用途',
    '基準値(MJ/m\u00B2年)',
    '地域補正係数',
    '規模補正係数',
    '補正後原単位(MJ/m\u00B2年)',
  ]);

  CATS.forEach((cat) => {
    const d = stdIntensities[cat];
    s3.push([
      getCategoryName(cat),
      d.base,
      d.factor,
      SCALE_FACTOR,
      d.corrected,
    ]);
  });

  // Total
  const totalCorrected = CATS.reduce((sum, c) => sum + (stdIntensities[c]?.corrected || 0), 0);
  s3.push([
    '合計',
    '-',
    '-',
    '-',
    Math.round(totalCorrected * 100) / 100,
  ]);

  s3.push([]);
  s3.push(['基準一次エネルギー消費量の算出', '', '', '', '']);
  s3.push(['基準原単位合計', Math.round(totalCorrected * 100) / 100, 'MJ/m\u00B2年', '', '']);
  s3.push(['延べ面積', area, 'm\u00B2', '', '']);
  s3.push([
    '基準一次エネルギー消費量',
    result.standard_primary_energy_mj,
    'MJ/年',
    '(= 原単位合計 x 延べ面積)',
    '',
  ]);

  s3.push([]);
  s3.push(['地域補正係数一覧', '', '', '', '']);
  s3.push(['地域区分', '暖房補正', '冷房補正', '', '']);
  Object.entries(REGIONAL_FACTORS).forEach(([zone, f]) => {
    s3.push([`${zone}地域`, f.heating, f.cooling, '', '']);
  });

  s3.push([]);
  s3.push(['参照: 建築物省エネ法基準値（国土交通省告示第265号）', '', '', '', '']);

  const ws3 = XLSX.utils.aoa_to_sheet(s3);
  ws3['!cols'] = [
    { wch: 28 },
    { wch: 22 },
    { wch: 16 },
    { wch: 28 },
    { wch: 26 },
  ];

  ws3['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
  ];

  // Formats
  applyNumberFormat(ws3, 7, 7 + CATS.length, 1, '#,##0');
  applyNumberFormat(ws3, 7, 7 + CATS.length, 2, '0.000');
  applyNumberFormat(ws3, 7, 7 + CATS.length, 4, '#,##0.00');

  XLSX.utils.book_append_sheet(wb, ws3, '基準値詳細');

  // ===================================================================
  //  Sheet 4 : 法的根拠 (Legal Basis)
  // ===================================================================
  const s4 = [];
  s4.push(['法的根拠・計算方法', '']);
  s4.push([]);

  s4.push(['1. 関連法令', '']);
  s4.push(['法令名', '概要']);
  s4.push(['建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）', '平成27年法律第53号']);
  s4.push(['エネルギー消費性能の向上に関する基本的な方針', '平成28年国土交通省告示第266号']);
  s4.push(['建築物エネルギー消費性能基準等を定める省令', '平成28年国土交通省令第11号']);
  s4.push(['国土交通省告示第1396号', '平成28年1月29日']);
  s4.push(['モデル建物法による標準入力法', '平成28年国土交通省告示第265号']);
  s4.push([]);

  s4.push(['2. 計算方法の概要', '']);
  s4.push(['手法', 'モデル建物法（標準入力法の簡易版）']);
  s4.push(['対象', '非住宅建築物（延べ面積300m\u00B2以上）']);
  s4.push(['指標', 'BEI（Building Energy Index）= 設計一次エネルギー消費量 / 基準一次エネルギー消費量']);
  s4.push(['適合基準', 'BEI <= 1.0']);
  s4.push(['対象設備', '暖房 / 冷房 / 換気 / 給湯 / 照明 / 昇降機']);
  s4.push([]);

  s4.push(['3. 一次エネルギー換算係数', '']);
  s4.push(['エネルギー種別', '換算係数']);
  s4.push(['電力', '9.76 MJ/kWh']);
  s4.push(['都市ガス', '45.0 MJ/m\u00B3']);
  s4.push(['LPG', '50.2 MJ/kg']);
  s4.push(['灯油', '36.7 MJ/L']);
  s4.push([]);

  s4.push(['4. モデル建物設備仕様（前提条件）', '']);
  s4.push(['設備', '仕様']);
  s4.push(['暖冷房設備', 'パッケージエアコン（COP=3.0相当）']);
  s4.push(['機械換気設備', '全熱交換器付き（交換効率65%）']);
  s4.push(['給湯設備', '電気温水器（COP=3.0相当）']);
  s4.push(['照明設備', 'LED照明（110lm/W以上相当）']);
  s4.push(['昇降機設備', 'VVVF制御（標準仕様）']);
  s4.push([]);

  s4.push(['5. 免責事項・注記', '']);
  s4.push(['', '本計算書は建築物省エネ法に基づくモデル建物法により算定した参考値です。']);
  s4.push(['', '最終的な適合判定は所管行政庁の審査によります。']);
  s4.push(['', '入力条件の変更により結果は変動する可能性があります。']);
  s4.push(['', '規模補正係数 0.95 を一律適用しています（モデル建物法標準値）。']);
  s4.push(['', `計算実行日: ${dateStr}`]);
  s4.push(['', `文書ID: ${documentId}`]);

  const ws4 = XLSX.utils.aoa_to_sheet(s4);
  ws4['!cols'] = [
    { wch: 48 },
    { wch: 56 },
  ];

  ws4['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
  ];

  XLSX.utils.book_append_sheet(wb, ws4, '法的根拠');

  // ===================================================================
  //  Write & download
  // ===================================================================
  const buildingFileName = projectInfo?.name || buildingName;
  const filename = `BEI計算書_${buildingFileName}_${yyyymmdd()}.xlsx`;

  XLSX.writeFile(wb, filename);
  return filename;
};

// Simple single-sheet export (lightweight fallback)
export const exportToSimpleExcel = (result, formData, projectInfo) => {
  const wb = XLSX.utils.book_new();
  const data = [
    ['BEI計算結果（簡易）'],
    ['項目', '値'],
    ['建物用途', String(formData?.building_type ?? '')],
    ['地域区分', String(formData?.climate_zone ?? '')],
    ['延床面積', String(formData?.floor_area ?? result?.building_area_m2 ?? '')],
    ['設計一次エネルギー(MJ/年)', String(result?.design_primary_energy_mj ?? '')],
    ['基準一次エネルギー(MJ/年)', String(result?.standard_primary_energy_mj ?? '')],
    ['BEI', String(result?.bei ?? '')],
    ['適合判定', result?.is_compliant ? '適合' : '不適合'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 26 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(wb, ws, 'BEI結果');
  const fname = `BEI_簡易_${yyyymmdd()}.xlsx`;
  XLSX.writeFile(wb, fname);
  return fname;
};
