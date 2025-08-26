// frontend/src/components/ComplianceReport.jsx
import React from 'react';
import { FaFileAlt, FaStamp, FaBuilding, FaChartBar, FaDownload, FaFilePdf } from 'react-icons/fa';

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

export default function ComplianceReport({ result, formData, onDownload, onDownloadPDF }) {
  if (!result || !formData) return null;

  const formatDate = () => {
    return new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const standardIntensities = getStandardIntensities(formData.building_type, formData.climate_zone);

  // PDF生成関数
  const generatePDF = () => {
    const printContent = document.getElementById('compliance-report').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BEI計算書</title>
          <style>
            body { font-family: 'MS PGothic', 'Yu Gothic', sans-serif; font-size: 12px; margin: 20px; line-height: 1.4; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid black; padding: 8px; vertical-align: top; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .bg-green-50 { background-color: #f0fff0; }
            .bg-red-50 { background-color: #fff0f0; }
            .bg-yellow-50 { background-color: #fffff0; }
            .bg-gray-50 { background-color: #f9f9f9; }
            .bg-gray-100 { background-color: #f0f0f0; }
            .text-lg { font-size: 14px; }
            .text-xl { font-size: 16px; }
            .font-bold { font-weight: bold; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-4 { margin-top: 16px; }
            .p-3 { padding: 12px; }
            .border { border: 1px solid #ccc; }
            .rounded { border-radius: 4px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .no-print { display: none !important; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
              table { page-break-inside: avoid; }
              h1, h2, h3 { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="bg-white">
      {/* ダウンロードボタン */}
      <div className="mb-4 flex space-x-4 no-print">
        <button
          onClick={onDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <FaDownload />
          <span>JSONダウンロード</span>
        </button>
        <button
          onClick={generatePDF}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
        >
          <FaFilePdf />
          <span>PDF出力</span>
        </button>
      </div>

      <div id="compliance-report" className="border-2 border-gray-300 p-8 max-w-4xl mx-auto font-mono text-sm">
        {/* ヘッダー */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-xl font-bold mb-2">建築物省エネルギー法　適合性判定申請書</h1>
          <h2 className="text-lg font-bold">モデル建物法による一次エネルギー消費量計算書</h2>
          <div className="mt-4 text-right">
            <p>作成日: {formatDate()}</p>
          </div>
        </div>

        {/* 建物概要 */}
        <section className="mb-6">
          <h3 className="text-lg font-bold border-b border-black mb-3 flex items-center">
            <FaBuilding className="mr-2" />
            1. 建物概要
          </h3>
          <table className="w-full border-collapse border border-black">
            <tbody>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold w-1/3">建物用途</td>
                <td className="border border-black p-2">{getBuildingTypeName(formData.building_type)}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">地域区分</td>
                <td className="border border-black p-2">{formData.climate_zone}地域</td>
              </tr>
              <tr>
                <td className="border border-black p-2 bg-gray-100 font-bold">延床面積</td>
                <td className="border border-black p-2">{Number(formData.floor_area || result.building_area_m2).toLocaleString()} m²</td>
              </tr>
              <tr>
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