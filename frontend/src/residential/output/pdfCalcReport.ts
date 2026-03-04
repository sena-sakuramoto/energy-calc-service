import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { applyJapanesePdfFont, setJapanesePdfFont } from './pdfFont';

import type { ResidentialProject, ResidentialResult, VerifyState } from '../engine/types';

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY?: number } };

function getAutoTableFinalY(doc: jsPDF, fallback = 32): number {
  return (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? fallback;
}

export async function generateResidentialCalcReportPdf(
  project: Partial<ResidentialProject>,
  result: Partial<ResidentialResult>,
  verifyState?: VerifyState,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await applyJapanesePdfFont(doc);

  const now = new Date().toLocaleString('ja-JP');

  setJapanesePdfFont(doc, 'bold');
  doc.setFontSize(15);
  doc.text('住宅外皮計算書 (UA・ηAC)', 14, 14);
  setJapanesePdfFont(doc, 'normal');
  doc.setFontSize(9);
  doc.text(`案件名: ${project?.name || '住宅計算'}`, 14, 20);
  doc.text(`地域区分: ${project?.region || 6} / 作成日時: ${now}`, 14, 25);

  autoTable(doc, {
    startY: 32,
    head: [['項目', '値', '判定']],
    body: [
      ['UA値', `${Number(result?.ua_value || 0).toFixed(2)} W/m²K`, result?.grade ? `等級${result.grade}` : '等級4未満'],
      ['ηAC値', `${Number(result?.eta_a_c || 0).toFixed(1)}`, Number(result?.eta_a_c || 0) <= 3.0 ? '基準OK' : '基準超過'],
      ['ηAH値', `${Number(result?.eta_a_h || 0).toFixed(1)}`, '-'],
      ['ZEH基準', Number(result?.zeh_ok) ? '適合' : '未達', `基準: UA ≤ ${Number(result?.thresholds?.[5] || 0).toFixed(2)}`],
      ['窓コスト合計', `¥${Math.round(result?.window_cost_total || 0).toLocaleString('ja-JP')}`, '-'],
    ],
    styles: { fontSize: 9, font: 'NotoSansJPN' },
    headStyles: { fillColor: [51, 65, 85], font: 'NotoSansJPN' },
  });

  autoTable(doc, {
    startY: getAutoTableFinalY(doc) + 8,
    head: [['部位', '面積/長さ', 'U/Ψ', 'h', '熱損失']],
    body: (result?.parts_detail || []).map((part) => [
      `${part.type} (${part.orientation})`,
      part.type === 'foundation' ? `${Number(part.length || 0).toFixed(2)}m` : `${Number(part.area || 0).toFixed(2)}m²`,
      part.type === 'foundation' ? Number(part.psi_value || 0).toFixed(2) : Number(part.u_value || 0).toFixed(2),
      Number(part.h_value || 0).toFixed(2),
      Number(part.heat_loss || 0).toFixed(3),
    ]),
    styles: { fontSize: 8, font: 'NotoSansJPN' },
    headStyles: { fillColor: [194, 112, 62], font: 'NotoSansJPN' },
  });

  if (verifyState?.message) {
    const y = getAutoTableFinalY(doc) + 10;
    setJapanesePdfFont(doc, 'bold');
    doc.setFontSize(10);
    doc.text('公式API検証メモ', 14, y);
    setJapanesePdfFont(doc, 'normal');
    doc.setFontSize(9);
    doc.text(verifyState.message, 14, y + 6);
  }

  doc.save(`residential_calc_report_${Date.now()}.pdf`);
}
