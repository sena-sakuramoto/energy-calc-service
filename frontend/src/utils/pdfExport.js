// frontend/src/utils/pdfExport.js
// Professional PDF generation for BEI calculation reports using jsPDF + jspdf-autotable
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBEI } from './number';

// ─── Color Theme ───────────────────────────────────────────────────────────────
const COLORS = {
  slate:       [51, 65, 85],    // #334155 - primary dark headers
  slateMid:    [100, 116, 139], // #64748B - secondary text
  slateLight:  [226, 232, 240], // #E2E8F0 - light backgrounds
  terracotta:  [194, 112, 62],  // #c2703e - accent
  white:       [255, 255, 255],
  black:       [0, 0, 0],
  rowEven:     [248, 250, 252], // #F8FAFC - alternating rows
  greenBg:     [220, 252, 231], // #DCFCE7 - compliant
  greenText:   [21, 128, 61],   // #15803D
  redBg:       [254, 226, 226], // #FEE2E2 - non-compliant
  redText:     [185, 28, 28],   // #B91C1C
  yellowBg:    [254, 249, 195], // #FEF9C3 - highlight
  blueBg:      [219, 234, 254], // #DBEAFE - info
};

// Helper to apply a color array to jsPDF methods
const setFill = (doc, color) => doc.setFillColor(color[0], color[1], color[2]);
const setDraw = (doc, color) => doc.setDrawColor(color[0], color[1], color[2]);
const setText = (doc, color) => doc.setTextColor(color[0], color[1], color[2]);

// ─── Helper Lookups ────────────────────────────────────────────────────────────
const BUILDING_TYPE_NAMES = {
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

const CATEGORY_NAMES = {
  heating: '暖房',
  cooling: '冷房',
  ventilation: '換気',
  hot_water: '給湯',
  lighting: '照明',
  elevator: '昇降機',
};

const CATEGORY_ORDER = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];

const PDF_FONT_FILE = 'NotoSansJPN-Regular.ttf';
const PDF_FONT_NAME = 'NotoSansJPN';
let fontBase64Promise = null;

const setPdfFont = (doc, style = 'normal') => {
  const fontStyle = style === 'bold' ? 'bold' : 'normal';
  const available = doc.getFontList();
  if (available[PDF_FONT_NAME]) {
    doc.setFont(PDF_FONT_NAME, fontStyle);
    return;
  }
  doc.setFont('Helvetica', fontStyle);
};

const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const loadJapaneseFontBase64 = async () => {
  if (!fontBase64Promise) {
    fontBase64Promise = (async () => {
      const res = await fetch(`/fonts/${PDF_FONT_FILE}`);
      if (!res.ok) {
        throw new Error(`日本語フォントの読み込みに失敗しました: ${res.status}`);
      }
      const buffer = await res.arrayBuffer();
      return arrayBufferToBase64(buffer);
    })();
  }
  return fontBase64Promise;
};

const ensureJapaneseFont = async (doc) => {
  const available = doc.getFontList();
  if (available[PDF_FONT_NAME]) {
    return;
  }
  if (typeof window === 'undefined') {
    return;
  }
  const fontBase64 = await loadJapaneseFontBase64();
  doc.addFileToVFS(PDF_FONT_FILE, fontBase64);
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'normal');
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'bold');
};

// ─── Standard Intensities (simplified) ─────────────────────────────────────────
const getStandardIntensities = (buildingType, climateZone) => {
  const baseValues = {
    office:   { heating: 38, cooling: 38, ventilation: 28, hot_water: 3,   lighting: 70, elevator: 14 },
    hotel:    { heating: 54, cooling: 54, ventilation: 28, hot_water: 176, lighting: 70, elevator: 14 },
    hospital: { heating: 72, cooling: 72, ventilation: 89, hot_water: 176, lighting: 98, elevator: 14 },
  };
  const regionalFactors = {
    1: { heating: 2.38, cooling: 0.66 },
    2: { heating: 2.01, cooling: 0.69 },
    3: { heating: 1.54, cooling: 0.86 },
    4: { heating: 1.16, cooling: 0.99 },
    5: { heating: 1.07, cooling: 1.07 },
    6: { heating: 0.84, cooling: 1.15 },
    7: { heating: 0.70, cooling: 1.27 },
    8: { heating: 0.36, cooling: 1.35 },
  };
  const base = baseValues[buildingType] || baseValues.office;
  const factors = regionalFactors[parseInt(climateZone)] || regionalFactors[4];
  const out = {};
  for (const key of CATEGORY_ORDER) {
    const f = (key === 'heating' || key === 'cooling') ? factors[key] : 1.0;
    out[key] = {
      base: base[key],
      factor: f,
      corrected: base[key] * f * 0.95,
    };
  }
  return out;
};

// ─── Formatting Helpers ────────────────────────────────────────────────────────
const fmtBEI = (v) => {
  const r = formatBEI(v);
  return r == null ? '-' : r;
};

const fmtNum = (v, decimals = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '-';
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString('ja-JP');
};

const fmtNumJP = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '-';
  return Math.round(n).toLocaleString('ja-JP');
};

// ─── Document ID Generator ─────────────────────────────────────────────────────
const generateDocumentId = () => {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const dy = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `BEI-${yr}-${mo}-${dy}-${seq}`;
};

// ─── Page Footer Renderer ──────────────────────────────────────────────────────
const addFooter = (doc, documentId, pageWidth, pageHeight, margin) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - margin + 5;

    // Divider line
    setDraw(doc, COLORS.slateLight);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Left: Document ID
    setPdfFont(doc, 'normal');
    doc.setFontSize(7);
    setText(doc, COLORS.slateMid);
    doc.text(documentId, margin, footerY + 4);

    // Center: Generated note
    const centerText = '楽々省エネ計算で自動生成';
    const centerW = doc.getTextWidth(centerText);
    doc.text(centerText, (pageWidth - centerW) / 2, footerY + 4);

    // Right: Page number
    const pageText = `${i} / ${totalPages}`;
    const pageW = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageW, footerY + 4);

    // Disclaimer line
    doc.setFontSize(6);
    const disclaimer = '提出前に国交省公式計算ツールと照合してください。';
    const disclaimerW = doc.getTextWidth(disclaimer);
    doc.text(disclaimer, (pageWidth - disclaimerW) / 2, footerY + 8);
  }
};

// ─── Section Header Renderer ───────────────────────────────────────────────────
const drawSectionHeader = (doc, text, x, y, width) => {
  setFill(doc, COLORS.slate);
  doc.roundedRect(x, y, width, 8, 1, 1, 'F');
  setPdfFont(doc, 'bold');
  doc.setFontSize(10);
  setText(doc, COLORS.white);
  doc.text(text, x + 4, y + 5.5);
  setText(doc, COLORS.black);
  return y + 12;
};

// ─── Check for Page Break ──────────────────────────────────────────────────────
const ensureSpace = (doc, cursorY, neededHeight, pageHeight, margin) => {
  if (cursorY + neededHeight > pageHeight - margin - 15) {
    doc.addPage();
    return margin + 5;
  }
  return cursorY;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Main Export Function
// ═══════════════════════════════════════════════════════════════════════════════
export async function generateBEIReport(result, formData, projectInfo) {
  if (!result || !formData) {
    throw new Error('PDF出力には result と formData が必要です。');
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await ensureJapaneseFont(doc);
  const pageWidth = doc.internal.pageSize.getWidth();   // 210
  const pageHeight = doc.internal.pageSize.getHeight();  // 297
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const documentId = generateDocumentId();
  const currentDate = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const projectName = projectInfo?.name || '';
  const buildingTypeName = BUILDING_TYPE_NAMES[formData.building_type] || formData.building_type || '';
  const floorArea = Number(formData.floor_area || result.building_area_m2 || 0);
  const renewableEnergy = Number(formData.renewable_energy || result.renewable_deduction_mj || 0);
  const standardIntensities = getStandardIntensities(formData.building_type, formData.climate_zone);
  const isCompliant = !!result.is_compliant;
  const beiStr = fmtBEI(result.bei);

  // Pick compliant/non-compliant colors once
  const statusColor = isCompliant ? COLORS.greenText : COLORS.redText;
  const statusBg = isCompliant ? COLORS.greenBg : COLORS.redBg;
  const boxBg = isCompliant ? [240, 253, 244] : [254, 242, 242]; // subtle green/red tint

  let y = margin;

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. DOCUMENT HEADER
  // ═══════════════════════════════════════════════════════════════════════════

  // Top accent bar
  setFill(doc, COLORS.terracotta);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Document ID & metadata line (right-aligned)
  y = 8;
  setPdfFont(doc, 'normal');
  doc.setFontSize(7);
  setText(doc, COLORS.slateMid);
  const metaLine = `${documentId}  |  ${currentDate}  |  システム v2.0`;
  const metaW = doc.getTextWidth(metaLine);
  doc.text(metaLine, pageWidth - margin - metaW, y);

  // Main title
  y = 16;
  setPdfFont(doc, 'bold');
  doc.setFontSize(18);
  setText(doc, COLORS.slate);
  doc.text('BEI計算書（モデル建物法）', pageWidth / 2, y, { align: 'center' });

  // Subtitle
  y += 8;
  doc.setFontSize(11);
  setText(doc, COLORS.slateMid);
  doc.text('建築物省エネ法に基づく一次エネルギー計算結果', pageWidth / 2, y, { align: 'center' });

  // Company name
  y += 6;
  doc.setFontSize(8);
  setText(doc, COLORS.terracotta);
  doc.text('楽々省エネ計算  -  Archi-Prisma Design Works', pageWidth / 2, y, { align: 'center' });

  // Divider
  y += 4;
  setDraw(doc, COLORS.terracotta);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PROJECT INFORMATION TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  y = drawSectionHeader(doc, '1. 建物概要', margin, y, contentWidth);

  autoTable(doc,{
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 9,
      font: PDF_FONT_NAME,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
      lineColor: COLORS.slateLight,
      lineWidth: 0.3,
      textColor: COLORS.black,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold', fillColor: COLORS.slateLight, textColor: COLORS.slate },
      1: { cellWidth: 55 },
      2: { cellWidth: 35, fontStyle: 'bold', fillColor: COLORS.slateLight, textColor: COLORS.slate },
      3: { cellWidth: 55 },
    },
    body: [
      ['建物名',   projectName || '（未設定）', '建物用途', buildingTypeName || '（未設定）'],
      ['所在地',   projectInfo?.location || '（未設定）', '地域区分', `${formData.climate_zone || '-'}地域`],
      ['建築主',   projectInfo?.buildingOwner || '（未設定）', '設計者', projectInfo?.designer || '（未設定）'],
      ['延床面積', `${fmtNumJP(floorArea)} m²`, '再エネ控除', `${fmtNumJP(renewableEnergy)} MJ/年`],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. BEI CALCULATION RESULT (Prominent Display)
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 55, pageHeight, margin);
  y = drawSectionHeader(doc, '2. BEI計算結果', margin, y, contentWidth);

  // Large BEI value box
  const beiBoxH = 40;

  // Box background
  setFill(doc, boxBg);
  doc.roundedRect(margin, y, contentWidth, beiBoxH, 2, 2, 'F');

  // Box border
  setDraw(doc, statusColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, contentWidth, beiBoxH, 2, 2, 'S');

  // BEI value (large, left-center area)
  setPdfFont(doc, 'bold');
  doc.setFontSize(36);
  setText(doc, statusColor);
  doc.text('BEI = ' + beiStr, margin + contentWidth * 0.35, y + 18, { align: 'center' });

  // Judgment badge (right area)
  const judgmentText = isCompliant ? '適合' : '不適合';
  const badgeX = margin + contentWidth * 0.68;
  const badgeY = y + 8;
  const badgeW = 42;
  const badgeH = 12;
  setFill(doc, statusBg);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'F');
  setDraw(doc, statusColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'S');
  setPdfFont(doc, 'bold');
  doc.setFontSize(12);
  setText(doc, statusColor);
  doc.text(judgmentText, badgeX + badgeW / 2, badgeY + 8.5, { align: 'center' });

  // Sub-label below badge
  doc.setFontSize(7);
  const subLabel = isCompliant ? '省エネ基準に適合' : '省エネ基準に不適合';
  doc.text(subLabel, badgeX + badgeW / 2, badgeY + badgeH + 4, { align: 'center' });

  // Criterion note at bottom of box
  setPdfFont(doc, 'normal');
  doc.setFontSize(7.5);
  setText(doc, COLORS.slateMid);
  doc.text(
    '判定基準: BEI ≤ 1.0 で省エネ基準適合',
    margin + contentWidth / 2,
    y + beiBoxH - 3,
    { align: 'center' }
  );

  // Summary table below box
  y += beiBoxH + 4;
  setText(doc, COLORS.black);

  autoTable(doc,{
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 9,
      font: PDF_FONT_NAME,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      lineColor: COLORS.slateLight,
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.55, fontStyle: 'bold', fillColor: COLORS.slateLight, textColor: COLORS.slate },
      1: { cellWidth: contentWidth * 0.45, halign: 'right' },
    },
    body: [
      ['設計一次エネルギー消費量', fmtNumJP(result.design_primary_energy_mj) + ' MJ/年'],
      ['基準一次エネルギー消費量', fmtNumJP(result.standard_primary_energy_mj) + ' MJ/年'],
      ['BEI値', beiStr],
      ['判定', isCompliant ? '適合' : '不適合'],
    ],
  });
  y = doc.lastAutoTable.finalY + 8;

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. ENERGY BREAKDOWN TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 60, pageHeight, margin);
  y = drawSectionHeader(doc, '3. 一次エネルギー内訳', margin, y, contentWidth);

  const breakdownRows = [];
  let totalDesign = 0;
  let totalStandard = 0;

  const designMap = {};
  if (result.design_energy_breakdown && Array.isArray(result.design_energy_breakdown)) {
    result.design_energy_breakdown.forEach(item => {
      designMap[item.category] = Number(item.primary_energy_mj || item.value || 0);
    });
  }

  for (const cat of CATEGORY_ORDER) {
    const designVal = designMap[cat] || 0;
    const stdIntensity = standardIntensities[cat]?.corrected || 0;
    const stdVal = stdIntensity * floorArea;
    const ratio = stdVal > 0 ? (designVal / stdVal) : 0;
    totalDesign += designVal;
    totalStandard += stdVal;
    breakdownRows.push([
      CATEGORY_NAMES[cat] || cat,
      fmtNumJP(designVal) + ' MJ/年',
      fmtNumJP(stdVal) + ' MJ/年',
      fmtBEI(ratio),
    ]);
  }

  // Total row
  breakdownRows.push([
    '合計',
    fmtNumJP(result.design_primary_energy_mj || totalDesign) + ' MJ/年',
    fmtNumJP(result.standard_primary_energy_mj || totalStandard) + ' MJ/年',
    fmtBEI(result.bei),
  ]);

  // Renewable deduction row
  if (renewableEnergy > 0) {
    breakdownRows.push([
      '再生可能エネルギー控除',
      '-' + fmtNumJP(renewableEnergy) + ' MJ/年',
      '-',
      '-',
    ]);
  }

  autoTable(doc,{
    startY: y,
    margin: { left: margin, right: margin },
    head: [['用途', '設計値', '基準値', '比率 (BEI_i)']],
    body: breakdownRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.slate,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 8.5,
      font: PDF_FONT_NAME,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
    },
    alternateRowStyles: {
      fillColor: COLORS.rowEven,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.28 },
      1: { cellWidth: contentWidth * 0.24, halign: 'right' },
      2: { cellWidth: contentWidth * 0.24, halign: 'right' },
      3: { cellWidth: contentWidth * 0.24, halign: 'center' },
    },
    didParseCell: (data) => {
      const isTotalRow = data.row.index === CATEGORY_ORDER.length;
      const isRenewableRow = renewableEnergy > 0 && data.row.index === CATEGORY_ORDER.length + 1;
      if (isTotalRow && data.section === 'body') {
        data.cell.styles.fillColor = COLORS.yellowBg;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }
      if (isRenewableRow && data.section === 'body') {
        data.cell.styles.fillColor = COLORS.blueBg;
        data.cell.styles.fontStyle = 'italic';
      }
    },
  });
  y = doc.lastAutoTable.finalY + 8;

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. CALCULATION FORMULA SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 40, pageHeight, margin);
  y = drawSectionHeader(doc, '4. 計算式', margin, y, contentWidth);

  // Formula box
  const formulaBoxH = 30;
  doc.setFillColor(248, 250, 252);
  setDraw(doc, COLORS.slateLight);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, formulaBoxH, 1.5, 1.5, 'FD');

  setPdfFont(doc, 'bold');
  doc.setFontSize(10);
  setText(doc, COLORS.slate);
  doc.text('BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量', margin + 4, y + 7);

  setPdfFont(doc, 'normal');
  doc.setFontSize(9);
  setText(doc, COLORS.black);
  const designE = fmtNumJP(result.design_primary_energy_mj);
  const stdE = fmtNumJP(result.standard_primary_energy_mj);
  doc.text('    = ' + designE + ' MJ/年  ÷  ' + stdE + ' MJ/年', margin + 4, y + 14);

  setPdfFont(doc, 'bold');
  doc.setFontSize(11);
  setText(doc, COLORS.terracotta);
  doc.text('    = ' + beiStr, margin + 4, y + 22);

  setPdfFont(doc, 'normal');
  doc.setFontSize(7);
  setText(doc, COLORS.slateMid);
  doc.text('※ BEIは内部で小数第4位まで計算し、表示は小数第2位です。', margin + 4, y + 28);

  y += formulaBoxH + 8;

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. STANDARD ENERGY INTENSITIES TABLE
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 55, pageHeight, margin);
  y = drawSectionHeader(doc, '5. 基準エネルギー消費量原単位 (MJ/m²年)', margin, y, contentWidth);

  const intensityRows = [];
  let intensityTotal = 0;
  for (const cat of CATEGORY_ORDER) {
    const vals = standardIntensities[cat];
    intensityTotal += vals.corrected;
    intensityRows.push([
      CATEGORY_NAMES[cat] || cat,
      fmtNum(vals.base, 2),
      fmtNum(vals.factor, 3),
      '0.950',
      fmtNum(vals.corrected, 2),
    ]);
  }
  intensityRows.push([
    '合計',
    '-',
    '-',
    '-',
    fmtNum(result.standard_energy_per_m2 || intensityTotal, 2),
  ]);

  autoTable(doc,{
    startY: y,
    margin: { left: margin, right: margin },
    head: [['用途', '基準値', '地域補正係数', '規模補正係数', '補正後']],
    body: intensityRows,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.slate,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: {
      fontSize: 8.5,
      font: PDF_FONT_NAME,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      halign: 'right',
    },
    alternateRowStyles: {
      fillColor: COLORS.rowEven,
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: contentWidth * 0.24 },
      1: { cellWidth: contentWidth * 0.19 },
      2: { cellWidth: contentWidth * 0.19 },
      3: { cellWidth: contentWidth * 0.19 },
      4: { cellWidth: contentWidth * 0.19, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === CATEGORY_ORDER.length && data.section === 'body') {
        data.cell.styles.fillColor = COLORS.yellowBg;
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }
    },
  });
  y = doc.lastAutoTable.finalY + 4;

  // Standard energy summary note
  setPdfFont(doc, 'normal');
  doc.setFontSize(8);
  setText(doc, COLORS.slateMid);
  const summaryNote =
    '基準一次エネルギー消費量 = ' +
    fmtNum(result.standard_energy_per_m2 || intensityTotal, 2) +
    ' MJ/m²年 × ' +
    fmtNumJP(floorArea) +
    ' m² = ' +
    fmtNumJP(result.standard_primary_energy_mj) +
    ' MJ/年';
  doc.text(summaryNote, margin + 2, y + 2);
  y += 10;

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. LEGAL BASIS SECTION
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 35, pageHeight, margin);
  y = drawSectionHeader(doc, '6. 法的根拠', margin, y, contentWidth);

  const legalItems = [
    ['建築物省エネ法', '建築物のエネルギー消費性能の向上等に関する法律'],
    ['モデル建物法', '平成28年国土交通省告示第265号（標準入力法）'],
    ['国土交通省告示第1396号', '平成28年1月29日 一次エネルギー消費量基準'],
  ];

  autoTable(doc,{
    startY: y,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      font: PDF_FONT_NAME,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      lineColor: COLORS.slateLight,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.38, fontStyle: 'bold', fillColor: COLORS.slateLight, textColor: COLORS.slate },
      1: { cellWidth: contentWidth * 0.62 },
    },
    body: legalItems,
  });
  y = doc.lastAutoTable.finalY + 8;

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. NOTES & ASSUMPTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  y = ensureSpace(doc, y, 50, pageHeight, margin);
  y = drawSectionHeader(doc, '7. 注記・前提条件', margin, y, contentWidth);

  const notes = [
    `地域区分: ${formData.climate_zone || '-'}地域の補正係数を適用しています。`,
    '規模補正係数: 0.950（モデル建物法標準値）',
    '一次エネルギー換算係数: 電力 9.76 MJ/kWh、都市ガス 45.0 MJ/m³',
    'BEI判定基準: BEI ≤ 1.0 で省エネ基準適合',
  ];

  if (renewableEnergy > 0) {
    notes.push(`再生可能エネルギー控除: ${fmtNumJP(renewableEnergy)} MJ/年（自家消費前提）`);
  }

  if (result.bei > 0.95 && result.bei <= 1.0) {
    notes.push('注意: BEI値が基準値に近いため、設計変更時は再計算してください。');
  }
  if (result.bei > 1.0) {
    notes.push('注意: 省エネ基準不適合です。設計見直しが必要です。');
  }

  if (result.notes && Array.isArray(result.notes)) {
    result.notes.forEach(n => notes.push(String(n)));
  }

  setPdfFont(doc, 'normal');
  doc.setFontSize(8);
  setText(doc, COLORS.black);
  for (const note of notes) {
    y = ensureSpace(doc, y, 6, pageHeight, margin);
    // Terracotta bullet
    setFill(doc, COLORS.terracotta);
    doc.circle(margin + 2, y - 0.5, 0.8, 'F');
    // Wrapped text
    const lines = doc.splitTextToSize(note, contentWidth - 8);
    doc.text(lines, margin + 6, y);
    y += lines.length * 3.5 + 1.5;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER ON ALL PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  addFooter(doc, documentId, pageWidth, pageHeight, margin);

  // ═══════════════════════════════════════════════════════════════════════════
  // SAVE
  // ═══════════════════════════════════════════════════════════════════════════
  const safeName = projectName
    ? projectName.replace(/[^a-zA-Z0-9_\u3000-\u9FFF]/g, '_') + '_'
    : '';
  const fileName = 'BEI計算書_' + safeName + new Date().toISOString().split('T')[0] + '.pdf';
  doc.save(fileName);

  return { documentId, fileName };
}
