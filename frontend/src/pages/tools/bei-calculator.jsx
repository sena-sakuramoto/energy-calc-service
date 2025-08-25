// frontend/src/pages/tools/bei-calculator.jsx
import { useState, useEffect } from 'react';
import { FaCalculator, FaBuilding, FaChartLine, FaCopy, FaDownload, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaArrowRight, FaFileAlt, FaPrint } from 'react-icons/fa';
import CalculatorLayout from '../../components/CalculatorLayout';
import FormSection from '../../components/FormSection';
import ResultCard from '../../components/ResultCard';
import ClimateZoneSelector from '../../components/ClimateZoneSelector';
import BuildingTypeSelector from '../../components/BuildingTypeSelector';
import HelpTooltip from '../../components/HelpTooltip';
import ComplianceReport from '../../components/ComplianceReport';
import { beiAPI } from '../../utils/api';

export default function BEICalculator() {
  const [formData, setFormData] = useState({
    building_type: '',
    climate_zone: '',
    floor_area: '',
    uses: [{
      use_type: '',
      floor_area_ratio: 100
    }],
    design_energy: {
      heating: '',
      cooling: '',
      ventilation: '',
      hot_water: '',
      lighting: '',
      elevator: ''
    },
    renewable_energy: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // バリデーション関数
  const validateStep1 = () => {
    const errors = {};
    
    if (!formData.building_type) {
      errors.building_type = '建物用途を選択してください';
    }
    if (!formData.climate_zone) {
      errors.climate_zone = '地域区分を選択してください';
    }
    if (!formData.floor_area || parseFloat(formData.floor_area) <= 0) {
      errors.floor_area = '延床面積を正しく入力してください（正の数値）';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const requiredFields = ['heating', 'cooling', 'ventilation', 'hot_water', 'lighting', 'elevator'];
    
    requiredFields.forEach(field => {
      if (!formData.design_energy[field] || parseFloat(formData.design_energy[field]) < 0) {
        errors[field] = `${getEnergyFieldLabel(field)}の値を正しく入力してください`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getEnergyFieldLabel = (field) => {
    const labels = {
      heating: '暖房',
      cooling: '冷房',
      ventilation: '機械換気',
      hot_water: '給湯',
      lighting: '照明',
      elevator: '昇降機'
    };
    return labels[field] || field;
  };

  const handleCalculate = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      // APIに送信するデータを準備
      const apiData = {
        building_area_m2: parseFloat(formData.floor_area),
        use: formData.building_type,
        zone: parseInt(formData.climate_zone),
        renewable_energy_deduction_mj: parseFloat(formData.renewable_energy) || 0,
        design_energy: Object.entries(formData.design_energy).map(([category, value]) => ({
          category,
          value: parseFloat(value),
          unit: 'kWh'
        }))
      };

      const response = await beiAPI.evaluate(apiData);
      setResult(response);
      setCurrentStep(4);
    } catch (error) {
      console.error('BEI計算エラー:', error);
      setValidationErrors({ api: 'BEI計算中にエラーが発生しました。入力内容を確認してください。' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResults = () => {
    if (!result) return;
    
    const text = `BEI計算結果\n\n` +
      `BEI値: ${result.bei_value}\n` +
      `適合判定: ${result.compliance_status === 'compliant' ? '適合' : '不適合'}\n` +
      `設計一次エネルギー: ${result.design_primary_energy_mj?.toLocaleString()} MJ/年\n` +
      `基準一次エネルギー: ${result.standard_primary_energy_mj?.toLocaleString()} MJ/年`;
    
    navigator.clipboard.writeText(text);
  };

  // 建物用途別基準エネルギー消費量を取得
  const getStandardEnergyByType = (buildingType) => {
    const standards = {
      office: { heating: 38.0, cooling: 38.0, ventilation: 28.0, hot_water: 3.0, lighting: 70.0, elevator: 14.0 },
      hotel: { heating: 54.0, cooling: 54.0, ventilation: 28.0, hot_water: 176.0, lighting: 70.0, elevator: 14.0 },
      hospital: { heating: 72.0, cooling: 72.0, ventilation: 89.0, hot_water: 176.0, lighting: 98.0, elevator: 14.0 },
      shop_department: { heating: 20.0, cooling: 20.0, ventilation: 28.0, hot_water: 3.0, lighting: 126.0, elevator: 14.0 },
      shop_supermarket: { heating: 20.0, cooling: 20.0, ventilation: 28.0, hot_water: 3.0, lighting: 140.0, elevator: 14.0 },
      school_small: { heating: 58.0, cooling: 23.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 2.0 },
      school_high: { heating: 58.0, cooling: 30.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 2.0 },
      school_university: { heating: 43.0, cooling: 30.0, ventilation: 14.0, hot_water: 17.0, lighting: 49.0, elevator: 14.0 },
      restaurant: { heating: 54.0, cooling: 54.0, ventilation: 117.0, hot_water: 105.0, lighting: 105.0, elevator: 14.0 },
      assembly: { heating: 38.0, cooling: 38.0, ventilation: 28.0, hot_water: 17.0, lighting: 70.0, elevator: 14.0 },
      factory: { heating: 72.0, cooling: 20.0, ventilation: 28.0, hot_water: 17.0, lighting: 70.0, elevator: 14.0 },
      residential_collective: { heating: 38.0, cooling: 38.0, ventilation: 14.0, hot_water: 105.0, lighting: 42.0, elevator: 14.0 }
    };
    return standards[buildingType] || standards.office;
  };

  // 地域別補正係数を取得
  const getRegionalFactors = (climateZone) => {
    const factors = {
      1: { heating: 2.38, cooling: 0.66 },
      2: { heating: 2.01, cooling: 0.69 },
      3: { heating: 1.54, cooling: 0.86 },
      4: { heating: 1.16, cooling: 0.99 },
      5: { heating: 1.07, cooling: 1.07 },
      6: { heating: 0.84, cooling: 1.15 },
      7: { heating: 0.70, cooling: 1.27 },
      8: { heating: 0.36, cooling: 1.35 }
    };
    return factors[parseInt(climateZone)] || factors[6];
  };

  // 規模補正係数を取得（簡易版）
  const getScaleFactor = (buildingType, floorArea) => {
    const area = parseFloat(floorArea) || 0;
    // 簡易的な規模補正（実際はより複雑）
    if (area < 300) return '1.00';
    if (area < 1000) return '0.95';
    if (area < 5000) return '0.90';
    if (area < 10000) return '0.85';
    return '0.80';
  };

  const downloadResults = () => {
    if (!result) return;
    
    const data = {
      calculation_date: new Date().toISOString(),
      building_info: {
        type: formData.building_type,
        climate_zone: formData.climate_zone,
        floor_area: formData.floor_area,
        renewable_energy: formData.renewable_energy
      },
      design_energy: formData.design_energy,
      calculation_basis: {
        standard_energy_consumption: getStandardEnergyByType(formData.building_type),
        regional_factors: getRegionalFactors(formData.climate_zone),
        scale_factor: getScaleFactor(formData.building_type, formData.floor_area)
      },
      result: result,
      legal_basis: [
        '建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）',
        '国土交通省告示第1396号（平成28年1月29日）',
        'モデル建物法による標準入力法（平成28年国土交通省告示第265号）'
      ]
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bei-calculation-detailed-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CalculatorLayout
      title="BEI計算（モデル建物法）"
      subtitle="建築物省エネ法対応 - Building Energy Index による省エネ基準適合性判定"
      icon={FaCalculator}
      backUrl="/tools"
      backText="計算ツール一覧に戻る"
    >
      <div className="max-w-6xl mx-auto">
        {/* ステップインジケーター */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? <FaCheckCircle /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-600">
            <span>基本情報</span>
            <span>設計値</span>
            <span>再エネ</span>
            <span>結果</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* ステップ1: 基本情報 */}
            {currentStep >= 1 && (
              <FormSection
                title="ステップ1: 建物基本情報"
                icon={FaBuilding}
              >
                {/* ガイダンス */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <strong>モデル建物法について：</strong>
                      国土交通省告示で定められた標準的な建物用途と地域区分に基づいて
                      省エネ性能を評価する方法です。まずは建物の基本情報を入力してください。
                    </div>
                  </div>
                </div>

                {/* 建物用途選択 */}
                <BuildingTypeSelector
                  value={formData.building_type}
                  onChange={(value) => {
                    setFormData({...formData, building_type: value});
                    setValidationErrors({...validationErrors, building_type: ''});
                  }}
                  className={validationErrors.building_type ? 'border-red-500' : ''}
                />
                {validationErrors.building_type && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.building_type}</p>
                )}

                {/* 地域区分選択 */}
                <ClimateZoneSelector
                  value={formData.climate_zone}
                  onChange={(value) => {
                    setFormData({...formData, climate_zone: value});
                    setValidationErrors({...validationErrors, climate_zone: ''});
                  }}
                  className={validationErrors.climate_zone ? 'border-red-500' : ''}
                />
                {validationErrors.climate_zone && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.climate_zone}</p>
                )}
                
                {/* 延床面積 */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      延床面積 (m²)
                    </label>
                    <HelpTooltip title="延床面積とは？">
                      建物の各階の床面積の合計です。
                      建築確認申請書や設計図書に記載されている数値を入力してください。
                    </HelpTooltip>
                  </div>
                  <input
                    type="number"
                    value={formData.floor_area}
                    onChange={(e) => {
                      setFormData({...formData, floor_area: e.target.value});
                      setValidationErrors({...validationErrors, floor_area: ''});
                    }}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.floor_area ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="例: 1000"
                    min="1"
                    required
                  />
                  {validationErrors.floor_area && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.floor_area}</p>
                  )}
                  {formData.floor_area && (
                    <p className="text-gray-600 text-sm mt-1">
                      入力された延床面積: {Number(formData.floor_area).toLocaleString()} m²
                    </p>
                  )}
                </div>
                
                {/* 次へボタン */}
                {currentStep === 1 && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) {
                          setCurrentStep(2);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>次へ：設計エネルギー値入力</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* ステップ2: 設計エネルギー値 */}
            {currentStep >= 2 && (
              <FormSection
                title="ステップ2: 設計一次エネルギー消費量"
                icon={FaChartLine}
              >
                {/* ガイダンス */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <strong>設計値入力：</strong>
                      設計した建物の年間エネルギー消費量を用途別に入力してください。
                      単位はMJ/年です。省エネ計算書やエネルギーシミュレーション結果を参考にしてください。
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(formData.design_energy).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {getEnergyFieldLabel(key)} (MJ/年)
                        </label>
                        <HelpTooltip title={`${getEnergyFieldLabel(key)}について`}>
                          {key === 'heating' && '暖房設備による年間一次エネルギー消費量'}
                          {key === 'cooling' && '冷房設備による年間一次エネルギー消費量'}
                          {key === 'ventilation' && '機械換気設備による年間一次エネルギー消費量'}
                          {key === 'hot_water' && '給湯設備による年間一次エネルギー消費量'}
                          {key === 'lighting' && '照明設備による年間一次エネルギー消費量'}
                          {key === 'elevator' && '昇降機による年間一次エネルギー消費量'}
                        </HelpTooltip>
                      </div>
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            design_energy: {
                              ...formData.design_energy,
                              [key]: e.target.value
                            }
                          });
                          setValidationErrors({...validationErrors, [key]: ''});
                        }}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors[key] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        required
                      />
                      {validationErrors[key] && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors[key]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* ナビゲーションボタン */}
                {currentStep === 2 && (
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) {
                          setCurrentStep(3);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <span>次へ：再エネ控除</span>
                      <FaArrowRight />
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* ステップ3: 再エネ控除 */}
            {currentStep >= 3 && (
              <FormSection
                title="ステップ3: 再生可能エネルギー控除"
                icon={FaLightbulb}
              >
                {/* ガイダンス */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <strong>再エネ控除について：</strong>
                      建物に設置された再生可能エネルギー設備（太陽光発電等）による
                      年間発電量を一次エネルギー消費量から控除できます。控除量がない場合は0を入力してください。
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      再エネ控除量 (MJ/年)
                    </label>
                    <HelpTooltip title="再エネ控除の計算方法">
                      太陽光発電等の年間発電量(kWh) × 9.76(一次エネルギー換算係数) ÷ 1000 × 3.6
                      で算出できます。設備がない場合は0を入力してください。
                    </HelpTooltip>
                  </div>
                  <input
                    type="number"
                    value={formData.renewable_energy}
                    onChange={(e) => setFormData({...formData, renewable_energy: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                  <p className="text-gray-600 text-sm mt-1">
                    設備がない場合は0のままでも計算できます
                  </p>
                </div>

                {/* ナビゲーションボタン */}
                {currentStep === 3 && (
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      戻る
                    </button>
                    <button
                      type="button"
                      onClick={handleCalculate}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>計算中...</span>
                        </>
                      ) : (
                        <>
                          <FaCalculator />
                          <span>BEI計算実行</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </FormSection>
            )}

            {/* エラー表示 */}
            {validationErrors.api && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FaExclamationTriangle className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    {validationErrors.api}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 結果表示 */}
          <div className="space-y-6">
            {result && (
              <ResultCard
                title="BEI計算結果"
                icon={FaChartLine}
                onCopy={copyResults}
                onDownload={downloadResults}
              >
                {/* BEI値と適合判定 */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">
                    <span className={result.compliance_status === 'compliant' ? 'text-green-600' : 'text-red-600'}>
                      {result.bei_value}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">BEI値 (Building Energy Index)</div>
                  
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    result.compliance_status === 'compliant' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.compliance_status === 'compliant' ? (
                      <>
                        <FaCheckCircle className="mr-2" />
                        省エネ基準適合
                      </>
                    ) : (
                      <>
                        <FaExclamationTriangle className="mr-2" />
                        省エネ基準不適合
                      </>
                    )}
                  </div>
                </div>

                {/* 詳細結果 */}
                <div className="space-y-6">
                  {/* エネルギー消費量比較 */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">設計一次エネルギー消費量</div>
                      <div className="text-2xl font-bold text-blue-900 mb-2">
                        {result.design_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                      {formData.renewable_energy && parseFloat(formData.renewable_energy) > 0 && (
                        <div className="text-xs text-blue-700">
                          再エネ控除: -{parseFloat(formData.renewable_energy).toLocaleString()} MJ/年
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-800 mb-1">基準一次エネルギー消費量</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {result.standard_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        モデル建物法による算定値
                      </div>
                    </div>
                  </div>

                  {/* 計算根拠詳細 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                      <FaCalculator className="mr-2 text-blue-600" />
                      計算根拠詳細
                    </h4>
                    
                    {/* 基準エネルギー消費量内訳 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">基準エネルギー消費量内訳 (MJ/m²年)</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <div className="bg-orange-50 p-2 rounded">
                          <div className="text-orange-800 font-medium">暖房</div>
                          <div className="text-orange-900">{getStandardEnergyByType(formData.building_type)?.heating || '-'}</div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-blue-800 font-medium">冷房</div>
                          <div className="text-blue-900">{getStandardEnergyByType(formData.building_type)?.cooling || '-'}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-green-800 font-medium">換気</div>
                          <div className="text-green-900">{getStandardEnergyByType(formData.building_type)?.ventilation || '-'}</div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <div className="text-purple-800 font-medium">給湯</div>
                          <div className="text-purple-900">{getStandardEnergyByType(formData.building_type)?.hot_water || '-'}</div>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded">
                          <div className="text-yellow-800 font-medium">照明</div>
                          <div className="text-yellow-900">{getStandardEnergyByType(formData.building_type)?.lighting || '-'}</div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-gray-800 font-medium">昇降機</div>
                          <div className="text-gray-900">{getStandardEnergyByType(formData.building_type)?.elevator || '-'}</div>
                        </div>
                      </div>
                    </div>

                    {/* 補正係数情報 */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">適用された補正係数</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-800 mb-1">地域補正係数 ({formData.climate_zone}地域)</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span>暖房:</span>
                              <span className="font-medium">{getRegionalFactors(formData.climate_zone)?.heating || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>冷房:</span>
                              <span className="font-medium">{getRegionalFactors(formData.climate_zone)?.cooling || '-'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                          <div className="font-medium text-green-800 mb-1">規模補正係数</div>
                          <div className="text-green-900">
                            延床面積 {Number(formData.floor_area).toLocaleString()}m²<br />
                            係数: {getScaleFactor(formData.building_type, formData.floor_area)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 計算式 */}
                    <div className="bg-yellow-50 p-3 rounded">
                      <div className="text-sm font-medium text-yellow-800 mb-2">BEI計算式</div>
                      <div className="text-xs text-yellow-900 space-y-1">
                        <div><strong>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</strong></div>
                        <div>= {result.design_primary_energy_mj?.toLocaleString()} ÷ {result.standard_primary_energy_mj?.toLocaleString()}</div>
                        <div>= <strong>{result.bei_value}</strong></div>
                        <div className="mt-2 pt-2 border-t border-yellow-200">
                          判定基準: BEI ≤ 1.0 で省エネ基準適合
                        </div>
                      </div>
                    </div>

                    {/* 法的根拠 */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        <strong>法的根拠:</strong><br />
                        • 建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）<br />
                        • 国土交通省告示第1396号（平成28年1月29日）<br />
                        • モデル建物法による標準入力法（平成28年国土交通省告示第265号）
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>※ ご注意</strong><br />
                      この計算結果は目安です。実際の省エネ法適合性判定には、所管行政庁が認める評価方法による詳細計算が必要な場合があります。
                    </div>
                  </div>
                </div>

                {/* 行動ボタン群 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReport(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaFileAlt />
                    <span>審査機関向け計算書</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setResult(null);
                      setValidationErrors({});
                      setShowReport(false);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    新しい計算を開始
                  </button>
                </div>
              </ResultCard>
            )}

            {/* 入力内容サマリー */}
            {(formData.building_type || formData.climate_zone || formData.floor_area) && !result && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <FaBuilding className="mr-3 text-blue-600" />
                  入力内容
                </h3>
                <div className="space-y-2 text-sm">
                  {formData.building_type && (
                    <div><span className="font-medium">建物用途:</span> {formData.building_type}</div>
                  )}
                  {formData.climate_zone && (
                    <div><span className="font-medium">地域区分:</span> {formData.climate_zone}地域</div>
                  )}
                  {formData.floor_area && (
                    <div><span className="font-medium">延床面積:</span> {Number(formData.floor_area).toLocaleString()} m²</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 審査機関向け計算書モーダル */}
        {showReport && result && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">建築物省エネ法 適合性判定申請書</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center space-x-2"
                  >
                    <FaPrint />
                    <span>印刷</span>
                  </button>
                  <button
                    onClick={() => setShowReport(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    閉じる
                  </button>
                </div>
              </div>
              <ComplianceReport 
                data={{
                  calculation_date: new Date().toISOString(),
                  building_info: {
                    type: formData.building_type,
                    climate_zone: formData.climate_zone,
                    floor_area: formData.floor_area,
                    renewable_energy: formData.renewable_energy
                  },
                  design_energy: formData.design_energy,
                  calculation_basis: {
                    standard_energy_consumption: getStandardEnergyByType(formData.building_type),
                    regional_factors: getRegionalFactors(formData.climate_zone),
                    scale_factor: getScaleFactor(formData.building_type, formData.floor_area)
                  },
                  result: result,
                  legal_basis: [
                    '建築物のエネルギー消費性能の向上に関する法律（建築物省エネ法）',
                    '国土交通省告示第1396号（平成28年1月29日）',
                    'モデル建物法による標準入力法（平成28年国土交通省告示第265号）'
                  ]
                }}
                onDownload={() => {
                  // PDF生成機能（将来実装）
                  alert('PDF生成機能は開発中です。現在は印刷機能をご利用ください。');
                }}
              />
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}