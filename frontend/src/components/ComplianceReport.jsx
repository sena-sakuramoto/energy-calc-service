// frontend/src/components/ComplianceReport.jsx
import React from 'react';
import { FaFileAlt, FaStamp, FaBuilding, FaChartBar } from 'react-icons/fa';

export default function ComplianceReport({ data, onDownload }) {
  if (!data) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-white border-2 border-gray-300 p-8 max-w-4xl mx-auto font-mono text-sm">
      {/* ヘッダー */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold mb-2">建築物省エネルギー法　適合性判定申請書</h1>
        <h2 className="text-lg font-bold">モデル建物法による一次エネルギー消費量計算書</h2>
        <div className="mt-4 text-right">
          <p>作成日: {formatDate(data.calculation_date)}</p>
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
              <td className="border border-black p-2">{getBuildingTypeName(data.building_info.type)}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-100 font-bold">地域区分</td>
              <td className="border border-black p-2">{data.building_info.climate_zone}地域</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-100 font-bold">延床面積</td>
              <td className="border border-black p-2">{Number(data.building_info.floor_area).toLocaleString()} m²</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-100 font-bold">再エネ控除</td>
              <td className="border border-black p-2">{Number(data.building_info.renewable_energy || 0).toLocaleString()} MJ/年</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 計算結果 */}
      <section className="mb-6">
        <h3 className="text-lg font-bold border-b border-black mb-3 flex items-center">
          <FaChartBar className="mr-2" />
          2. BEI計算結果
        </h3>
        <table className="w-full border-collapse border border-black mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-2 bg-gray-100 font-bold w-1/2">設計一次エネルギー消費量</td>
              <td className="border border-black p-2 text-right">{data.result.design_primary_energy_mj?.toLocaleString()} MJ/年</td>
            </tr>
            <tr>
              <td className="border border-black p-2 bg-gray-100 font-bold">基準一次エネルギー消費量</td>
              <td className="border border-black p-2 text-right">{data.result.standard_primary_energy_mj?.toLocaleString()} MJ/年</td>
            </tr>
            <tr className="bg-yellow-50">
              <td className="border border-black p-2 font-bold">BEI値</td>
              <td className="border border-black p-2 text-right font-bold text-lg">{data.result.bei_value}</td>
            </tr>
            <tr className={data.result.compliance_status === 'compliant' ? 'bg-green-50' : 'bg-red-50'}>
              <td className="border border-black p-2 font-bold">適合判定</td>
              <td className="border border-black p-2 text-right font-bold">
                {data.result.compliance_status === 'compliant' ? '適合' : '不適合'}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div className="bg-gray-50 p-3 rounded border">
          <p className="font-bold">計算式:</p>
          <p>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</p>
          <p>= {data.result.design_primary_energy_mj?.toLocaleString()} ÷ {data.result.standard_primary_energy_mj?.toLocaleString()}</p>
          <p>= <strong>{data.result.bei_value}</strong></p>
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
              <th className="border border-black p-2">原単位 (MJ/m²年)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.design_energy).map(([category, value]) => (
              <tr key={category}>
                <td className="border border-black p-2">{getEnergyLabel(category)}</td>
                <td className="border border-black p-2 text-right">{(parseFloat(value) * 3.6).toLocaleString()}</td>
                <td className="border border-black p-2 text-right">
                  {((parseFloat(value) * 3.6) / parseFloat(data.building_info.floor_area)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 基準エネルギー消費量 */}
      <section className="mb-6">
        <h3 className="text-lg font-bold border-b border-black mb-3">4. 基準一次エネルギー消費量算定</h3>
        <div className="mb-4">
          <h4 className="font-bold mb-2">4.1 基準エネルギー消費量原単位 (MJ/m²年)</h4>
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
              {Object.entries(data.calculation_basis.standard_energy_consumption).filter(([key]) => key !== 'total').map(([category, baseValue]) => (
                <tr key={category}>
                  <td className="border border-black p-2">{getEnergyLabel(category)}</td>
                  <td className="border border-black p-2 text-right">{baseValue}</td>
                  <td className="border border-black p-2 text-right">
                    {['heating', 'cooling'].includes(category) 
                      ? data.calculation_basis.regional_factors[category] 
                      : '1.00'}
                  </td>
                  <td className="border border-black p-2 text-right">{data.calculation_basis.scale_factor}</td>
                  <td className="border border-black p-2 text-right font-bold">
                    {(baseValue * 
                      (['heating', 'cooling'].includes(category) ? data.calculation_basis.regional_factors[category] : 1.0) * 
                      parseFloat(data.calculation_basis.scale_factor)
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 法的根拠 */}
      <section className="mb-6">
        <h3 className="text-lg font-bold border-b border-black mb-3 flex items-center">
          <FaStamp className="mr-2" />
          5. 法的根拠
        </h3>
        <ul className="list-disc list-inside space-y-1">
          {data.legal_basis.map((basis, index) => (
            <li key={index} className="text-sm">{basis}</li>
          ))}
        </ul>
      </section>

      {/* 注意事項 */}
      <section className="mb-6">
        <h3 className="text-lg font-bold border-b border-black mb-3">6. 注意事項</h3>
        <div className="text-sm space-y-2 bg-yellow-50 p-4 border-l-4 border-yellow-400">
          <p>• 本計算書は建築物省エネ法に基づくモデル建物法による概算計算です。</p>
          <p>• 実際の適合性判定申請には、より詳細な計算と設備仕様の明記が必要な場合があります。</p>
          <p>• 外皮性能（UA値、ηAC値）の適合も併せて確認してください。</p>
          <p>• 設備機器の効率値は実際の採用機器に基づいて更新してください。</p>
        </div>
      </section>

      {/* フッター */}
      <div className="text-center mt-8 pt-4 border-t-2 border-black">
        <p className="text-xs">
          本計算書は建築物省エネ法適合性判定の参考資料として作成されました。<br />
          最終的な判定は所管行政庁または登録建築物エネルギー消費性能評価機関にご確認ください。
        </p>
      </div>

      {/* ダウンロードボタン */}
      <div className="flex justify-center mt-6 no-print">
        <button
          onClick={onDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded flex items-center space-x-2"
        >
          <FaFileAlt />
          <span>PDF形式でダウンロード</span>
        </button>
      </div>
    </div>
  );
}

// ヘルパー関数
function getBuildingTypeName(type) {
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
    residential_collective: '共同住宅'
  };
  return names[type] || type;
}

function getEnergyLabel(category) {
  const labels = {
    heating: '暖房',
    cooling: '冷房',
    ventilation: '機械換気',
    hot_water: '給湯',
    lighting: '照明',
    elevator: '昇降機'
  };
  return labels[category] || category;
}