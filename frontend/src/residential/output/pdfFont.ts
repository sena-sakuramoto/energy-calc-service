import jsPDF from 'jspdf';

const PDF_FONT_FILE = 'NotoSansJPN-Regular.ttf';
const PDF_FONT_NAME = 'NotoSansJPN';

let fontBase64Promise: Promise<string> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadJapaneseFontBase64(): Promise<string> {
  if (!fontBase64Promise) {
    fontBase64Promise = (async () => {
      const response = await fetch(`/fonts/${PDF_FONT_FILE}`);
      if (!response.ok) {
        throw new Error(`日本語フォントの読み込みに失敗しました: ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      return arrayBufferToBase64(buffer);
    })();
  }
  return fontBase64Promise;
}

export async function applyJapanesePdfFont(doc: jsPDF): Promise<void> {
  const available = doc.getFontList();
  if (available[PDF_FONT_NAME]) {
    doc.setFont(PDF_FONT_NAME, 'normal');
    return;
  }

  // Browser-side PDF generation path only.
  if (typeof window === 'undefined') {
    doc.setFont('Helvetica', 'normal');
    return;
  }

  const fontBase64 = await loadJapaneseFontBase64();
  doc.addFileToVFS(PDF_FONT_FILE, fontBase64);
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'normal');
  doc.addFont(PDF_FONT_FILE, PDF_FONT_NAME, 'bold');
  doc.setFont(PDF_FONT_NAME, 'normal');
}

export function setJapanesePdfFont(doc: jsPDF, style: 'normal' | 'bold' = 'normal'): void {
  const available = doc.getFontList();
  if (available[PDF_FONT_NAME]) {
    doc.setFont(PDF_FONT_NAME, style);
    return;
  }
  doc.setFont('Helvetica', style);
}
