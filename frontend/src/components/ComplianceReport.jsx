// frontend/src/components/ComplianceReport.jsx
import React, { useState } from 'react';
import { FaFileAlt, FaStamp, FaBuilding, FaChartBar, FaDownload, FaFilePdf, FaFileExcel, FaUpload } from 'react-icons/fa';
import { exportToExcel, exportToExcelXML } from '../utils/excelExport';
import { exportToProfessionalExcel, exportToSimpleExcel } from '../utils/excelExportProfessional';
import { formatBEI } from '../utils/number';
import { generateBEIReport } from '../utils/pdfExport';
import { officialAPI } from '../utils/api';

// Shared BEI formatter wrapper for this component
const formatBEIValue2 = (value) => {
  const v = formatBEI(value);
  return v == null ? '' : v;
};

const getBuildingTypeName = (type) => {
  const names = {
    office: "事務所等",
    hotel: "ホテル等", 
    hospital: "病院等",
    shop_department: "百貨店等",
    shop_supermarket: "スーパーマーケット",
    school_small: "学校等（小中学校）",
    school_high: "学校等（高等学校）",
    school_university: "学校等（大学）",
    restaurant: "飲食店等",
    assembly: "集会所等",
    factory: "工場等",
    residential_collective: "共同住宅"
  };
  return names[type] || type;
};

const getCategoryName = (category) => {
  const names = {
    heating: "暖房",
    cooling: "冷房", 
    ventilation: "機械換気",
    hot_water: "給湯",
    lighting: "照明",
    elevator: "昇降機"
  };
  return names[category] || category;
};

// BEIの表示丸め（第3位を切り上げ→第2位表示）
const formatBEIValue = (value) => {
  const v = Number(value);
  if (!Number.isFinite(v)) return '';
  const up3 = Math.ceil(v * 1000) / 1000;
  return up3.toFixed(2);
};

// 基準エネルギー消費量原単位データ（簡易版）
const getStandardIntensities = (buildingType, climateZone) => {
  // 実際の標準値（一部）
  const baseValues = {
    office: { heating: 38, cooling: 38, ventilation: 28, hot_water: 3, lighting: 70, elevator: 14 },
    hotel: { heating: 54, cooling: 54, ventilation: 28, hot_water: 176, lighting: 70, elevator: 14 },
    hospital: { heating: 72, cooling: 72, ventilation: 89, hot_water: 176, lighting: 98, elevator: 14 }
  };
  
  // 地域補正係数（簡易版）
  const regionalFactors = {
    1: { heating: 2.38, cooling: 0.66 },
    2: { heating: 2.01, cooling: 0.69 },
    3: { heating: 1.54, cooling: 0.86 },
    4: { heating: 1.16, cooling: 0.99 },
    5: { heating: 1.07, cooling: 1.07 },
    6: { heating: 0.84, cooling: 1.15 },
    7: { heating: 0.70, cooling: 1.27 },
    8: { heating: 0.36, cooling: 1.35 }
  };
  
  const base = baseValues[buildingType] || baseValues.office;
  const factors = regionalFactors[parseInt(climateZone)] || regionalFactors[4];
  
  return {
    heating: { base: base.heating, factor: factors.heating, corrected: base.heating * factors.heating * 0.95 },
    cooling: { base: base.cooling, factor: factors.cooling, corrected: base.cooling * factors.cooling * 0.95 },
    ventilation: { base: base.ventilation, factor: 1.0, corrected: base.ventilation * 0.95 },
    hot_water: { base: base.hot_water, factor: 1.0, corrected: base.hot_water * 0.95 },
    lighting: { base: base.lighting, factor: 1.0, corrected: base.lighting * 0.95 },
    elevator: { base: base.elevator, factor: 1.0, corrected: base.elevator * 0.95 }
  };
};

const toPdfBlob = (data) => {
  if (data instanceof Blob) return data;
  return new Blob([data], { type: 'application/pdf' });
};

const parseApiErrorDetail = async (error) => {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      if (!text) return error?.message || '不明なエラー';
      try {
        const parsed = JSON.parse(text);
        return parsed?.detail || text;
      } catch {
        return text;
      }
    } catch {
      return error?.message || '不明なエラー';
    }
  }
  return data?.detail || error?.message || '不明なエラー';
};

export default function ComplianceReport({ result, formData, projectInfo, onDownload, onDownloadPDF }) {
  const [officialLoading, setOfficialLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  if (!result || !formData) return null;

  const formatDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const standardIntensities = getStandardIntensities(formData.building_type, formData.climate_zone);

  // ── 公式API (v380) 経由でPDFを取得 ────────────────────────────────
  const handleOfficialPDF = async () => {
    setOfficialLoading(true);
    try {
      const response = await officialAPI.getReport({
        building_area_m2: parseFloat(formData.floor_area) || 0,
        use: formData.building_type || 'office',
        zone: formData.climate_zone || '6',
        design_energy: result.design_energy_breakdown
          ? result.design_energy_breakdown.map(item => ({
              category: item.category,
              value: item.design_mj || item.value || 0,
            }))
          : [],
        renewable_energy_deduction_mj: parseFloat(formData.renewable_energy) || 0,
      });
      const blob = toPdfBlob(response.data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectInfo?.name || 'project'}_公式計算書.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const detail = await parseApiErrorDetail(error);
      console.error('公式PDF取得エラー:', error);
      alert(`公式PDF取得に失敗しました。\n${detail}\n\n公式入力シート(xlsx)のアップロードもお試しください。`);
    } finally {
      setOfficialLoading(false);
    }
  };

  // ── Excelアップロード → 公式PDF取得 ────────────────────────────────
  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xlsm')) {
      alert('公式入力シート (.xlsx または .xlsm) をアップロードしてください。');
      return;
    }
    setUploadLoading(true);
    try {
      const response = await officialAPI.uploadExcelForReport(file);
      const blob = toPdfBlob(response.data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.(xlsx|xlsm)$/, '_公式計算書.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const detail = await parseApiErrorDetail(error);
      console.error('アップロードエラー:', error);
      alert(`公式PDF取得に失敗しました。\n${detail}`);
    } finally {
      setUploadLoading(false);
      event.target.value = '';
    }
  };

  // ── 参考用: 独自Excel出力（確認申請には使用不可） ────────────────────
  const handleExcelExport = () => {
    try {
      exportToProfessionalExcel(result, formData, projectInfo);
    } catch (error) {
      console.error('Excel出力エラー:', error);
      try {
        exportToSimpleExcel(result, formData, projectInfo);
      } catch (fallbackError) {
        try {
          exportToExcel(result, formData, projectInfo);
        } catch (csvError) {
          alert(`出力に失敗しました: ${csvError.message}`);
        }
      }
    }
  };

  // ── 参考用: 独自PDF出力（確認申請には使用不可） ────────────────────
  const handlePDFExport = async () => {
    try {
      await generateBEIReport(result, formData, projectInfo);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert(`PDF生成エラー: ${error.message}`);
    }
  };

  return (
    <div className="bg-white">
      <div id="compliance-report" className="border-2 border-primary-300 p-8 max-w-4xl mx-auto font-mono text-sm">
        {/* ヘッダー - 実務レベル文書管理対応 */}
        <div className="border-b-2 border-black pb-4 mb-6">
          {/* 文書識別情報バー */}
          <div className="bg-warm-50 -mx-8 -mt-8 px-8 pt-3 pb-2 mb-4 text-xs text-primary-600 border-b border-primary-300">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">文書ID:</span> BEI-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')} | 
                <span className="font-medium ml-2">版数:</span> Rev.01 | 
                <span className="font-medium ml-2">システム:</span> v2.0
              </div>
              <div>
                <span className="font-medium">最終更新:</span> {new Date().toLocaleString('ja-JP')}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="text-left flex-1">
              <h1 className="text-xl font-bold mb-2 text-primary-800">BEI計算結果レポート</h1>
              <h2 className="text-lg font-bold text-primary-700 mb-1">モデル建物法による一次エネルギー消費量計算</h2>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                ※ この画面表示は参考用です。確認申請には下の「公式PDF」をご利用ください。
              </p>

              {/* プロジェクト情報の要約表示 */}
              {projectInfo && (
                <div className="bg-warm-50 p-3 rounded border text-sm mt-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {projectInfo.name && <div><span className="font-medium">物件名:</span> {projectInfo.name}</div>}
                    {projectInfo.location && <div><span className="font-medium">所在地:</span> {projectInfo.location}</div>}
                    {projectInfo.buildingOwner && <div><span className="font-medium">建築主:</span> {projectInfo.buildingOwner}</div>}
                    {projectInfo.designer && <div><span className="font-medium">設計者:</span> {projectInfo.designer}</div>}
                  </div>
                </div>
              )}
            </div>
            {/* ダウンロードボタン */}
            <div className="no-print flex flex-col items-end gap-3">
                {/* ── 公式出力（確認申請用） ── */}
                <div>
                  <p className="text-xs font-bold text-primary-700 mb-1 text-right">確認申請用（公式様式）</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                        onClick={handleOfficialPDF}
                        disabled={officialLoading}
                        title="国交省公式API (v380) で公式様式PDFを生成"
                        className="bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-2 text-sm min-w-[120px] touch-manipulation"
                        style={{ minHeight: '44px' }}
                    >
                        <FaFilePdf />
                        <span>{officialLoading ? '生成中...' : '公式PDF'}</span>
                    </button>
                    <label
                        title="記入済みの公式入力シート(.xlsx/.xlsm)をアップロードして公式PDFを取得"
                        className={`${uploadLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer'} text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-2 text-sm min-w-[140px] touch-manipulation`}
                        style={{ minHeight: '44px' }}
                    >
                        <FaUpload />
                        <span>{uploadLoading ? 'アップロード中...' : 'Excel→公式PDF'}</span>
                        <input
                            type="file"
                            accept=".xlsx,.xlsm"
                            onChange={handleExcelUpload}
                            disabled={uploadLoading}
                            className="hidden"
                        />
                    </label>
                  </div>
                </div>
                {/* ── 参考出力（社内検討用） ── */}
                <div>
                  <p className="text-xs text-primary-400 mb-1 text-right">社内検討用（参考）</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                        onClick={handleExcelExport}
                        title="参考用Excelファイル（確認申請には使用不可）"
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-lg flex items-center space-x-1 text-xs touch-manipulation"
                    >
                        <FaFileExcel />
                        <span>参考Excel</span>
                    </button>
                    <button
                        onClick={handlePDFExport}
                        title="参考用PDF（確認申請には使用不可）"
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-lg flex items-center space-x-1 text-xs touch-manipulation"
                    >
                        <FaFilePdf />
                        <span>参考PDF</span>
                    </button>
                    <button
                        onClick={onDownload}
                        title="計算データJSON"
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-3 rounded-lg flex items-center space-x-1 text-xs touch-manipulation"
                    >
                        <FaDownload />
                        <span>JSON</span>
                    </button>
                  </div>
                </div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <p>作成日: {formatDate()}</p>
          </div>
        </div>

        {/* 建物概要 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3 flex items-center">
            <FaBuilding className="mr-2" />
            1. プロジェクト・建物概要
          </h3>
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">プロジェクト名</td>
                <td className="border border-black p-2" colSpan="3">{projectInfo?.name || '(未設定)'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">所在地</td>
                <td className="border border-black p-2" colSpan="3">{projectInfo?.location || '(未設定)'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">建築主</td>
                <td className="border border-black p-2">{projectInfo?.buildingOwner || '(未設定)'}</td>
                <td className="border border-black p-2 bg-gray-100 font-bold w-1/4">設計者</td>
                <td className="border border-black p-2">{projectInfo?.designer || '(未設定)'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">建物用途</td>
                <td className="border border-black p-2">{getBuildingTypeName(formData.building_type)}</td>
                <td className="border border-black p-2 bg-gray-100 font-bold">地域区分</td>
                <td className="border border-black p-2">{formData.climate_zone}地域</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">延床面積</td>
                <td className="border border-black p-2">{Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²</td>
                <td className="border border-black p-2 bg-gray-100 font-bold">再エネ控除</td>
                <td className="border border-black p-2">{Number(formData.renewable_energy || result.renewable_deduction_mj || 0).toLocaleString()} MJ/年</td>
              </tr>
            </tbody>
          </table>
          
          {/* 複数用途建物の詳細内訳（該当する場合のみ表示） */}
          {formData.building_usages && formData.building_usages.length > 1 && (
            <div className="mt-4">
              <h4 className="text-md font-bold mb-2 text-primary-700">■ 複数用途建物の内訳詳細</h4>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2">用途</th>
                    <th className="border border-black p-2">面積 (m²)</th>
                    <th className="border border-black p-2">面積比率 (%)</th>
                    <th className="border border-black p-2">基準原単位 (MJ/m²年)</th>
                    <th className="border border-black p-2">基準一次エネ消費量 (MJ/年)</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.building_usages?.map((usage, index) => {
                    const usageArea = Number(usage.area || 0);
                    const totalArea = Number(formData.floor_area || result.building_area_m2);
                    const areaRatio = totalArea > 0 ? (usageArea / totalArea * 100) : 0;
                    const baseIntensity = getStandardIntensities(usage.type, formData.climate_zone);
                    const totalIntensity = Object.values(baseIntensity).reduce((sum, cat) => sum + (cat.corrected || 0), 0);
                    const baseConsumption = usageArea * totalIntensity;
                    
                    return (
                      <tr key={index}>
                        <td className="border border-black p-2">{getBuildingTypeName(usage.type)}</td>
                        <td className="border border-black p-2 text-right">{usageArea.toLocaleString()}</td>
                        <td className="border border-black p-2 text-right">{areaRatio.toFixed(1)}</td>
                        <td className="border border-black p-2 text-right">{totalIntensity.toFixed(2)}</td>
                        <td className="border border-black p-2 text-right">{Math.round(baseConsumption).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-yellow-50 font-bold">
                    <td className="border border-black p-2">合計</td>
                    <td className="border border-black p-2 text-right">{Number(formData.floor_area || result.building_area_m2).toLocaleString()}</td>
                    <td className="border border-black p-2 text-right">100.0</td>
                    <td className="border border-black p-2 text-right">{result.standard_energy_per_m2?.toFixed(2)}</td>
                    <td className="border border-black p-2 text-right">{result.standard_primary_energy_mj?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-xs text-primary-600">
                <p>※ 各用途の基準一次エネルギー消費量は、用途別面積×基準原単位により算出</p>
                <p>※ 基準原単位は地域区分{formData.climate_zone}地域の補正係数適用済み</p>
              </div>
            </div>
          )}
          
          {/* 単一用途の場合の詳細表示 */}
          {(!formData.building_usages || formData.building_usages.length <= 1) && (
            <div className="mt-4">
              <h4 className="text-md font-bold mb-2 text-primary-700">■ 基準エネルギー消費量原単位の内訳</h4>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2">設備用途</th>
                    <th className="border border-black p-2">基準値 (MJ/m²年)</th>
                    <th className="border border-black p-2">地域補正係数</th>
                    <th className="border border-black p-2">補正後原単位 (MJ/m²年)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(standardIntensities).map(([category, data]) => (
                    <tr key={category}>
                      <td className="border border-black p-2">{getCategoryName(category)}</td>
                      <td className="border border-black p-2 text-right">{data.base?.toFixed(2)}</td>
                      <td className="border border-black p-2 text-right">{data.factor?.toFixed(3)}</td>
                      <td className="border border-black p-2 text-right">{data.corrected?.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-yellow-50 font-bold">
                    <td className="border border-black p-2">合計</td>
                    <td className="border border-black p-2 text-right">-</td>
                    <td className="border border-black p-2 text-right">-</td>
                    <td className="border border-black p-2 text-right">{result.standard_energy_per_m2?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-xs text-primary-600">
                <p>※ 地域区分{formData.climate_zone}地域に基づく補正係数を適用</p>
                <p>※ 国土交通省告示第265号に基づくモデル建物法標準値</p>
              </div>
            </div>
          )}
        </section>

        {/* BEI計算結果 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3 flex items-center">
            <FaChartBar className="mr-2" />
            2. BEI計算結果
          </h3>
          <table className="w-full border-collapse border border-black mb-4">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold w-1/2">設計一次エネルギー消費量</td>
                <td className="border border-black p-2 text-right">{result.design_primary_energy_mj?.toLocaleString()} MJ/年</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">基準一次エネルギー消費量</td>
                <td className="border border-black p-2 text-right">{result.standard_primary_energy_mj?.toLocaleString()} MJ/年</td>
              </tr>
              <tr className="bg-yellow-50">
                <td className="border border-black p-2 font-bold">BEI値</td>
                <td className="border border-black p-2 text-right font-bold text-lg">{formatBEIValue2(result.bei)}</td>
              </tr>
              <tr className={result.is_compliant ? 'bg-green-50' : 'bg-red-50'}>
                <td className="border border-black p-2 font-bold">適合判定</td>
                <td className="border border-black p-2 text-right font-bold">
                  {result.is_compliant ? '適合' : '不適合'}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-warm-50 p-3 rounded border">
            <p className="font-bold">計算式:</p>
            <p>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</p>
            <p>= {result.design_primary_energy_mj?.toLocaleString()} ÷ {result.standard_primary_energy_mj?.toLocaleString()}</p>
            <p>= <strong>{formatBEIValue2(result.bei)}</strong></p>
            <p className="mt-2 text-sm">※ BEI ≤ 1.0 で省エネ基準適合</p>
          </div>
        </section>

        {/* 設計エネルギー消費量内訳 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3">3. 設計一次エネルギー消費量内訳</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">用途</th>
                <th className="border border-black p-2">消費量 (MJ/年)</th>
                <th className="border border-black p-2">単位面積あたり (MJ/m²年)</th>
              </tr>
            </thead>
            <tbody>
              {result.design_energy_breakdown?.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black p-2">{getCategoryName(item.category)}</td>
                  <td className="border border-black p-2 text-right">{item.primary_energy_mj?.toLocaleString()}</td>
                  <td className="border border-black p-2 text-right">{(item.primary_energy_mj / (formData.floor_area || result.building_area_m2))?.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-2">合計</td>
                <td className="border border-black p-2 text-right">{result.design_primary_energy_mj?.toLocaleString()}</td>
                <td className="border border-black p-2 text-right">{result.design_energy_per_m2?.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 3.x カテゴリ別BEI・優先度（単一用途時） */}
        {!formData.is_mixed_use && (
          <section className="mb-6">
            <h3 className="text-lg font-bold border-b border-black mb-3">3.x カテゴリ別BEI・優先度</h3>
            {(() => {
              try {
                const area = Number(formData.floor_area || result.building_area_m2) || 0;
                // Prefer backend-provided E_Si if available; fallback to local intensities
                let stdPerCat;
                if (result && result.standard_energy_by_use && typeof result.standard_energy_by_use === 'object') {
                  stdPerCat = Object.fromEntries(
                    Object.entries(result.standard_energy_by_use)
                      .filter(([k]) => k !== 'total')
                      .map(([k, v]) => [k, (Number(v) || 0) / (area || 1)])
                  );
                } else if (result && result.primary_energy_result && result.primary_energy_result.standard_energy_by_use) {
                  const map = result.primary_energy_result.standard_energy_by_use;
                  stdPerCat = Object.fromEntries(
                    Object.entries(map)
                      .filter(([k]) => k !== 'total')
                      .map(([k, v]) => [k, (Number(v) || 0) / (area || 1)])
                  );
                } else {
                  const std = getStandardIntensities(formData.building_type, formData.climate_zone);
                  stdPerCat = Object.fromEntries(Object.entries(std).map(([k,v]) => [k, v.corrected]));
                }
                const cats = ['heating','cooling','ventilation','hot_water','lighting','elevator'];
                const designMap = Object.fromEntries((result.design_energy_breakdown||[]).map(x => [x.category, x.primary_energy_mj ?? x.value ?? 0]));
                const rows = cats.map(cat => {
                  const Ei = Number(designMap[cat]||0);
                  const ESi = Number(stdPerCat[cat]||0) * area;
                  const bei = ESi>0 ? (Ei/ESi) : 0;
                  return { cat, Ei, ESi, bei };
                });
                const totalEi = rows.reduce((s,r)=>s+r.Ei,0);
                const totalEx = rows.reduce((s,r)=>s+Math.max(0,r.Ei-r.ESi),0);
                const rows2 = rows.map(r => {
                  const excess = Math.max(0, r.Ei - r.ESi);
                  const excessShare = totalEx>0 ? excess/totalEx : 0;
                  const contrib = totalEi>0 ? r.Ei/totalEi : 0;
                  const band = (r.bei<=0.90)?'low':(r.bei<=1.05)?'typical':(r.bei>=1.15 && excessShare>=0.35)?'high-major':'high';
                  const priority = 0.7*Math.max(0,r.bei-1.0)+0.3*contrib;
                  return { ...r, excess, excessShare, contrib, band, priority };
                });
                const highMajor = rows2.filter(x=>x.band==='high-major').sort((a,b)=>b.priority-a.priority);
                const others = rows2.filter(x=>x.band!=='high-major').sort((a,b)=>b.priority-a.priority);
                const ordered = [...highMajor, ...others];
                const label = (b)=> b==='low'?'良好': b==='typical'?'標準': b==='high-major'?'要改善（重点）':'要改善';
                const color = (b)=> b==='low'?'text-green-700': b==='typical'?'text-primary-700': b==='high-major'?'text-red-700':'text-accent-700';
                return (
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2">カテゴリ</th>
                        <th className="border border-black p-2">設計E (MJ/年)</th>
                        <th className="border border-black p-2">基準E (MJ/年)</th>
                        <th className="border border-black p-2">BEI_i</th>
                        <th className="border border-black p-2">判定</th>
                        <th className="border border-black p-2">偏差/寄与度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordered.map(r => (
                        <tr key={r.cat}>
                          <td className="border border-black p-2">{getCategoryName(r.cat)}</td>
                          <td className="border border-black p-2 text-right">{Math.round(r.Ei).toLocaleString()}</td>
                          <td className="border border-black p-2 text-right">{Math.round(r.ESi).toLocaleString()}</td>
                          <td className="border border-black p-2 text-right">{formatBEIValue2(r.bei)}</td>
                          <td className={`border border-black p-2 font-semibold ${color(r.band)}`}>{label(r.band)}</td>
                          <td className="border border-black p-2 text-right">偏差 +{(Math.max(0,r.bei-1)*100).toFixed(0)}% ／ 寄与度 {(r.contrib*100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              } catch (e) {
                return <p className="text-sm text-primary-500">カテゴリ別BEIの集計に失敗しました</p>;
              }
            })()}
          </section>
        )}

        {/* 基準一次エネルギー消費量算定 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3">4. 基準一次エネルギー消費量算定</h3>
          <h4 className="text-base font-bold mb-2">4.1 基準エネルギー消費量原単位 (MJ/m²年)</h4>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2">用途</th>
                <th className="border border-black p-2">基準値</th>
                <th className="border border-black p-2">地域補正</th>
                <th className="border border-black p-2">規模補正</th>
                <th className="border border-black p-2">補正後</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(standardIntensities).map(([category, values]) => (
                <tr key={category}>
                  <td className="border border-black p-2">{getCategoryName(category)}</td>
                  <td className="border border-black p-2 text-right">{values.base}</td>
                  <td className="border border-black p-2 text-right">{values.factor}</td>
                  <td className="border border-black p-2 text-right">0.95</td>
                  <td className="border border-black p-2 text-right font-bold">{values.corrected.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black p-2">合計</td>
                <td className="border border-black p-2 text-right">-</td>
                <td className="border border-black p-2 text-right">-</td>
                <td className="border border-black p-2 text-right">-</td>
                <td className="border border-black p-2 text-right">
                  {result.standard_energy_per_m2?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="mt-4 bg-warm-50 p-3 rounded border text-sm">
            <p><strong>基準一次エネルギー消費量 = </strong></p>
            <p>基準エネルギー消費量原単位合計 × 延床面積</p>
            <p>= {result.standard_energy_per_m2?.toFixed(2)} × {Number(formData.floor_area || result.building_area_m2).toLocaleString()}</p>
            <p>= <strong>{result.standard_primary_energy_mj?.toLocaleString()} MJ/年</strong></p>
          </div>
        </section>

        {/* 法的根拠 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3">5. 法的根拠</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）</li>
            <li>国土交通省告示第1396号（平成28年1月29日）</li>
            <li>モデル建物法による標準入力法（平成28年国土交通省告示第265号）</li>
          </ul>
        </section>

        {/* 注記・特記事項 */}
        <section>
          <h3 className="text-lg font-bold border-b border-black mb-3">6. 注記・特記事項</h3>
          <div className="text-sm space-y-2">
            <div>
              <h4 className="font-bold text-primary-700 mb-1">■ 計算方法・適用基準</h4>
              <p>• 本計算書は建築物省エネ法に基づくモデル建物法により算定</p>
              <p>• 地域区分: {formData.climate_zone}地域の補正係数を適用</p>
              <p>• 規模補正係数: 0.95（モデル建物法標準値）</p>
              <p>• 一次エネルギー換算係数: 電力 9.76 MJ/kWh、都市ガス 45.0 MJ/m³（省エネ法準拠）</p>
              <p>• BEI判定基準: BEI ≤ 1.0 で省エネ基準適合（小数点第4位まで内部計算、表示は第3位）</p>
            </div>
            
            <div>
              <h4 className="font-bold text-primary-700 mb-1">■ モデル建物設備仕様（前提条件）</h4>
              <p>• 暖冷房設備: パッケージエアコン（COP=3.0相当）</p>
              <p>• 機械換気設備: 全熱交換器付き（交換効率65%）</p>
              <p>• 給湯設備: 電気温水器（COP=3.0相当）</p>
              <p>• 照明設備: LED照明（110lm/W以上相当）</p>
              <p>• 昇降機設備: VVVF制御（標準仕様）</p>
            </div>

            <div>
              <h4 className="font-bold text-primary-700 mb-1">■ 再生可能エネルギー・その他</h4>
              {formData.renewable_energy && Number(formData.renewable_energy) > 0 ? (
                <>
                  <p>• 再生可能エネルギー控除: {Number(formData.renewable_energy).toLocaleString()} MJ/年</p>
                  <p>• 太陽光発電等は全量自家消費条件で評価</p>
                  <p>• 再エネ設備の年間発電量は気象庁標準年データに基づく</p>
                </>
              ) : (
                <p>• 再生可能エネルギー設備: なし（再エネ控除なし）</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-primary-700 mb-1">■ 計算上の補足・警告事項</h4>
              <p>• モデル建物法による標準値は国交省公開カタログ値に準拠</p>
              <p>• 複合用途の場合、各用途部分の面積按分により基準値を算出</p>
              <p>• 入力データに未定義項目がある場合、標準換算係数を適用</p>
              {result.bei > 0.95 && result.bei <= 1.0 && (
                <p className="text-accent-600 font-medium">• BEI値が基準値に近接しています。設計変更時は再計算を推奨</p>
              )}
              {result.bei > 1.0 && (
                <p className="text-red-600 font-medium">• 省エネ基準不適合。設計見直しが必要です</p>
              )}
            </div>

            <div>
              <h4 className="font-bold text-primary-700 mb-1">■ 文書管理情報</h4>
              <p>• 計算書ID: BEI-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}-{Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</p>
              <p>• 版数: Rev.01</p>
              <p>• 作成システム: 建築物省エネ計算システム v2.0</p>
              <p>• 計算精度: 内部計算は倍精度浮動小数点、表示は適切な桁数で丸め</p>
            </div>

            {result.notes?.map((note, index) => (
              <p key={index} className="text-primary-600">• {note}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
