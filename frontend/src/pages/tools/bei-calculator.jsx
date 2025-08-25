// frontend/src/pages/tools/bei-calculator.jsx
import { useState, useEffect } from 'react';
import { FaCalculator, FaBuilding, FaChartLine, FaCopy, FaDownload, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import CalculatorLayout from '../../components/CalculatorLayout';
import FormSection from '../../components/FormSection';
import ResultCard from '../../components/ResultCard';
import ClimateZoneSelector from '../../components/ClimateZoneSelector';
import BuildingTypeSelector from '../../components/BuildingTypeSelector';
import HelpTooltip from '../../components/HelpTooltip';
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

  const downloadResults = () => {
    if (!result) return;
    
    const data = {
      calculation_date: new Date().toISOString(),
      building_info: {
        type: formData.building_type,
        climate_zone: formData.climate_zone,
        floor_area: formData.floor_area
      },
      result: result
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bei-calculation-${new Date().toISOString().split('T')[0]}.json`;
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-1">設計一次エネルギー</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {result.design_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-800 mb-1">基準一次エネルギー</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {result.standard_primary_energy_mj?.toLocaleString()} MJ/年
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-sm text-yellow-800">
                      <strong>BEI = 設計一次エネルギー消費量 ÷ 基準一次エネルギー消費量</strong>
                      <br />
                      BEI値が1.0以下で省エネ基準に適合します。
                    </div>
                  </div>
                </div>

                {/* 再計算ボタン */}
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setResult(null);
                      setValidationErrors({});
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
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
      </div>
    </CalculatorLayout>
  );
}