// frontend/src/components/ComplianceReport.jsx
import React from 'react';
import { FaFileAlt, FaStamp, FaBuilding, FaChartBar, FaDownload, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { exportToExcel, exportToExcelXML } from '../utils/excelExport';
import { exportToProfessionalExcel, exportToSimpleExcel } from '../utils/excelExportProfessional';

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

export default function ComplianceReport({ result, formData, projectInfo, onDownload, onDownloadPDF }) {
  if (!result || !formData) return null;

  const formatDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const standardIntensities = getStandardIntensities(formData.building_type, formData.climate_zone);

  // Excel出力関数（プロフェッショナル版）
  const handleExcelExport = () => {
    try {
      exportToProfessionalExcel(result, formData, projectInfo);
      alert('プロ仕様Excelファイル(.xlsx)をダウンロードしました！\n5シート構成で実務レベル対応です。');
    } catch (error) {
      console.error('Excel出力エラー:', error);
      // フォールバック: シンプル版を試行
      try {
        exportToSimpleExcel(result, formData, projectInfo);
        alert('簡易版Excelファイル(.xlsx)をダウンロードしました。');
      } catch (fallbackError) {
        console.error('簡易Excel出力エラー:', fallbackError);
        // 最終フォールバック: 従来のCSV形式
        try {
          exportToExcel(result, formData, projectInfo);
          alert('CSV形式でダウンロードしました（Excelで開けます）。');
        } catch (csvError) {
          alert(`すべての出力方法が失敗しました: ${csvError.message}`);
        }
      }
    }
  };

  const handleExcelXMLExport = () => {
    try {
      exportToExcelXML(result, formData, projectInfo);
    } catch (error) {
      alert(`Excel XML出力エラー: ${error.message}`);
    }
  };

  // PDF生成関数 - スマホ対応（改良版）
  const generatePDF = async () => {
    try {
      // モバイル端末の検出
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      console.log('PDF生成開始:', { isMobile, userAgent: navigator.userAgent });
      
      if (isMobile) {
        // モバイル用: Web Share API または直接ダウンロード
        const printContent = document.getElementById('compliance-report');
        if (!printContent) {
          alert('印刷する内容が見つかりません');
          return;
        }

        // HTML文字列を作成
        const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BEI計算書</title>
  <style>
    body { 
      font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', sans-serif; 
      font-size: 14px; 
      margin: 15px; 
      line-height: 1.5;
      color: #000;
    }
    table { 
      border-collapse: collapse; 
      width: 100%; 
      margin-bottom: 15px; 
      border: 2px solid #000;
    }
    th, td { 
      border: 1px solid #000; 
      padding: 8px; 
      vertical-align: top; 
      font-size: 12px;
    }
    th { 
      background-color: #e8e8e8; 
      font-weight: bold; 
      text-align: center;
    }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .text-lg { font-size: 16px; font-weight: bold; }
    .text-xl { font-size: 18px; font-weight: bold; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }
    .mb-6 { margin-bottom: 20px; }
    .mt-4 { margin-top: 15px; }
    .p-3 { padding: 12px; }
    .border { border: 1px solid #000; }
    .no-print { display: none; }
    h1, h2, h3 { 
      color: #000; 
      margin-top: 20px; 
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
${printContent.innerHTML.replace(/class="no-print[^"]*"/g, 'style="display:none"')}
</body>
</html>`;

        // Blob を作成してダウンロード
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BEI計算書_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('HTML形式でダウンロードしました。ブラウザで開いてPDF印刷してください。');
        return;
      }
      
      // デスクトップ用: 従来の方式
      const printContent = document.getElementById('compliance-report').innerHTML;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>BEI計算書</title>
            <style>
              body { 
                font-family: 'MS PGothic', 'Yu Gothic', sans-serif; 
                font-size: 12px; 
                margin: 20px; 
                line-height: 1.4; 
              }
              table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
              th, td { border: 1px solid black; padding: 8px; vertical-align: top; }
              th { background-color: #f0f0f0; font-weight: bold; }
              .no-print { display: none !important; }
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              setTimeout(() => { 
                window.print(); 
                setTimeout(() => window.close(), 1000); 
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert(`PDF生成エラー: ${error.message}`);
    }
  };

  return (
    <div className="bg-white">
      <div id="compliance-report" className="border-2 border-gray-300 p-8 max-w-4xl mx-auto font-mono text-sm">
        {/* ヘッダー */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h1 className="text-xl font-bold mb-2">建築物省エネルギー法　適合性判定申請書</h1>
              <h2 className="text-lg font-bold">モデル建物法による一次エネルギー消費量計算書</h2>
            </div>
            {/* ダウンロードボタン - スマホ対応 */}
            <div className="no-print flex flex-col items-end gap-2">
                <div className="flex flex-wrap justify-end gap-2">
                    <button
                        onClick={handleExcelExport}
                        title="プロ仕様Excelファイル(.xlsx)をダウンロード - 5シート構成・実務レベル"
                        className="bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-2 text-sm min-w-[90px] touch-manipulation"
                        style={{ minHeight: '44px' }} /* iOS推奨タップ領域 */
                    >
                        <FaFileExcel />
                        <span>Excel</span>
                    </button>
                    <button
                        onClick={generatePDF}
                        onTouchStart={() => console.log('PDF button touched')}
                        className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-2 text-sm min-w-[80px] touch-manipulation"
                        style={{ minHeight: '44px', WebkitTapHighlightColor: 'rgba(0,0,0,0.1)' }} /* iOS推奨タップ領域 + タップハイライト */
                    >
                        <FaFilePdf />
                        <span>PDF</span>
                    </button>
                    <button
                        onClick={onDownload}
                        className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg flex items-center space-x-2 text-sm min-w-[80px] touch-manipulation"
                        style={{ minHeight: '44px' }} /* iOS推奨タップ領域 */
                    >
                        <FaDownload />
                        <span>JSON</span>
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">実用的Excel・PDF対応（スマホ可）</p>
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
                <td className="border border-black p-2 text-right font-bold text-lg">{result.bei}</td>
              </tr>
              <tr className={result.is_compliant ? 'bg-green-50' : 'bg-red-50'}>
                <td className="border border-black p-2 font-bold">適合判定</td>
                <td className="border border-black p-2 text-right font-bold">
                  {result.is_compliant ? '適合' : '不適合'}
                </td>
              </tr>
            </tbody>
          </table>
          
          <div className="bg-gray-50 p-3 rounded border">
            <p className="font-bold">計算式:</p>
            <p>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</p>
            <p>= {result.design_primary_energy_mj?.toLocaleString()} ÷ {result.standard_primary_energy_mj?.toLocaleString()}</p>
            <p>= <strong>{result.bei}</strong></p>
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
          
          <div className="mt-4 bg-gray-50 p-3 rounded border text-sm">
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

        {/* 注記 */}
        <section>
          <h3 className="text-lg font-bold border-b border-black mb-3">6. 注記</h3>
          <div className="text-sm space-y-1">
            <p>• 本計算書は建築物省エネ法に基づくモデル建物法により算定</p>
            <p>• 地域区分: {formData.climate_zone}地域の補正係数を適用</p>
            <p>• 規模補正係数: 0.95（簡易計算）</p>
            {result.notes?.map((note, index) => (
              <p key={index}>• {note}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}