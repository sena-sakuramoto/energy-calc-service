import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { applyJapanesePdfFont, setJapanesePdfFont } from './pdfFont';

import type { ResidentialProject, ResidentialResult } from '../engine/types';

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY?: number } };

function getAutoTableFinalY(doc: jsPDF, fallback = 26): number {
  return (doc as JsPdfWithAutoTable).lastAutoTable?.finalY ?? fallback;
}

export async function generateAreaTablePdf(
  project: Partial<ResidentialProject>,
  result: Partial<ResidentialResult>,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await applyJapanesePdfFont(doc);

  const now = new Date().toLocaleString('ja-JP');
  const title = `外皮面積求積表 - ${project?.name || '住宅計算'}`;

  setJapanesePdfFont(doc, 'bold');
  doc.setFontSize(14);
  doc.text(title, 14, 14);
  setJapanesePdfFont(doc, 'normal');
  doc.setFontSize(9);
  doc.text(`作成日時: ${now}`, 14, 20);

  const rows = Object.entries(result?.area_summary?.by_orientation || {}).map(([orientation, row]) => [
    orientation,
    Number(row.gross || 0).toFixed(2),
    Number(row.openings || 0).toFixed(2),
    Number(row.net || 0).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 26,
    head: [['方位', 'GROSS(m²)', '開口(m²)', 'NET(m²)']],
    body: rows,
    styles: { fontSize: 9, font: 'NotoSansJPN' },
    headStyles: { fillColor: [51, 65, 85], font: 'NotoSansJPN' },
    foot: [[
      '合計',
      Number(result?.area_summary?.gross_total || 0).toFixed(2),
      Number(result?.area_summary?.opening_total || 0).toFixed(2),
      Number(result?.area_summary?.net_total || 0).toFixed(2),
    ]],
  });

  const detailRows = (result?.parts_detail || []).map((part) => [
    `${part.type} (${part.orientation})`,
    part.type === 'foundation' ? `${Number(part.length || 0).toFixed(2)}m` : `${Number(part.area || 0).toFixed(2)}m²`,
    part.type === 'foundation' ? Number(part.psi_value || 0).toFixed(2) : Number(part.u_value || 0).toFixed(2),
    Number(part.h_value || 0).toFixed(2),
    Number(part.heat_loss || 0).toFixed(3),
  ]);

  autoTable(doc, {
    startY: getAutoTableFinalY(doc) + 8,
    head: [['部位', '面積/長さ', 'U/Ψ', 'h', '熱損失']],
    body: detailRows,
    styles: { fontSize: 8, font: 'NotoSansJPN' },
    headStyles: { fillColor: [194, 112, 62], font: 'NotoSansJPN' },
  });

  doc.save(`residential_area_table_${Date.now()}.pdf`);
}
