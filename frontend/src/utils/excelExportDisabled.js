// frontend/src/utils/excelExportDisabled.js
// プロ版Excel出力を停止し、簡易版ExcelまたはCSVに誘導するユーティリティ
import * as XLSX from 'xlsx';
import { exportToExcel } from './excelExport';

export const exportToProfessionalExcel = () => {
  throw new Error('プロ版Excel出力は現在停止中です（簡易版ExcelまたはCSVをご利用ください）');
};

export const exportToSimpleExcel = (result, formData, projectInfo) => {
  try {
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
    ws['!cols'] = [{ width: 26 }, { width: 24 }];
    XLSX.utils.book_append_sheet(wb, ws, 'BEI結果');
    const fname = `BEI_簡易_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.xlsx`;
    XLSX.writeFile(wb, fname);
    return fname;
  } catch (e) {
    // XLSX生成に失敗した場合はCSVにフォールバック
    exportToExcel(result, formData, projectInfo);
  }
};

