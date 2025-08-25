// frontend/src/pages/tools/bei-calculator.jsx
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { beiAPI, apiRequest, handleApiError } from '../../utils/api';
import { FaBuilding, FaCalculator, FaChartBar, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

export default function BEICalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [uses, setUses] = useState([]);
  const [zones, setZones] = useState([]);
  
  // フォームデータ
  const [buildingData, setBuildingData] = useState({
    building_area_m2: '',
    use: '',
    zone: '',
    usage_mix: [],
    renewable_energy_deduction_mj: 0,
    bei_round_digits: 3,
    compliance_threshold: 1.0
  });

  const [designEnergy, setDesignEnergy] = useState([
    { category: 'lighting', value: '', unit: 'kWh' },
    { category: 'cooling', value: '', unit: 'kWh' },
    { category: 'heating', value: '', unit: 'kWh' },
    { category: 'ventilation', value: '', unit: 'kWh' },
    { category: 'hot_water', value: '', unit: 'kWh' },
    { category: 'outlet_and_others', value: '', unit: 'kWh' }
  ]);

  const [isMixedUse, setIsMixedUse] = useState(false);

  // 建物用途とゾーン情報を取得
  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    const usesResult = await apiRequest(() => beiAPI.getUses(), 'Load uses');
    if (usesResult.success) {
      setUses(usesResult.data.uses);
    }
  };

  const loadZones = async (use) => {
    if (!use) {
      setZones([]);
      return;
    }
    const zonesResult = await apiRequest(() => beiAPI.getZones(use), 'Load zones');
    if (zonesResult.success) {
      setZones(zonesResult.data.zones);
    }
  };

  const handleInputChange = (field, value) => {
    setBuildingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'use') {
      loadZones(value);
      setBuildingData(prev => ({ ...prev, zone: '' }));
    }
  };

  const handleDesignEnergyChange = (index, field, value) => {
    const updated = [...designEnergy];
    updated[index][field] = value;
    setDesignEnergy(updated);
  };

  const addDesignEnergyCategory = () => {
    setDesignEnergy(prev => [...prev, { category: '', value: '', unit: 'kWh' }]);
  };

  const removeDesignEnergyCategory = (index) => {
    setDesignEnergy(prev => prev.filter((_, i) => i !== index));
  };

  const addUsageMix = () => {
    setBuildingData(prev => ({
      ...prev,
      usage_mix: [...prev.usage_mix, { use: '', zone: '', area_share: '' }]
    }));
  };

  const removeUsageMix = (index) => {
    setBuildingData(prev => ({
      ...prev,
      usage_mix: prev.usage_mix.filter((_, i) => i !== index)
    }));
  };

  const handleUsageMixChange = (index, field, value) => {
    const updated = [...buildingData.usage_mix];
    updated[index][field] = value;
    setBuildingData(prev => ({ ...prev, usage_mix: updated }));
  };

  const calculateBEI = async () => {
    setLoading(true);
    setError('');

    try {
      // データ検証
      if (!buildingData.building_area_m2) {
        throw new Error('建物面積を入力してください');
      }

      if (!isMixedUse && (!buildingData.use || !buildingData.zone)) {
        throw new Error('建物用途と地域区分を選択してください');
      }

      if (isMixedUse && buildingData.usage_mix.length === 0) {
        throw new Error('複合用途の場合は用途構成を追加してください');
      }

      const validDesignEnergy = designEnergy.filter(item => 
        item.category && item.value && !isNaN(parseFloat(item.value))
      ).map(item => ({
        ...item,
        value: parseFloat(item.value)
      }));

      if (validDesignEnergy.length === 0) {
        throw new Error('設計エネルギー消費量を入力してください');
      }

      const requestData = {
        building_area_m2: parseFloat(buildingData.building_area_m2),
        design_energy: validDesignEnergy,
        renewable_energy_deduction_mj: parseFloat(buildingData.renewable_energy_deduction_mj) || 0,
        bei_round_digits: parseInt(buildingData.bei_round_digits),
        compliance_threshold: parseFloat(buildingData.compliance_threshold)
      };

      if (isMixedUse) {
        requestData.usage_mix = buildingData.usage_mix.map(mix => ({
          use: mix.use,
          zone: mix.zone,
          area_share: parseFloat(mix.area_share)
        }));
      } else {
        requestData.use = buildingData.use;
        requestData.zone = buildingData.zone;
      }

      const response = await apiRequest(() => beiAPI.evaluate(requestData), 'BEI Calculation');
      
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryDisplayNames = {
    lighting: '照明',
    cooling: '冷房',
    heating: '暖房',
    ventilation: '換気',
    hot_water: '給湯',
    outlet_and_others: 'コンセント・その他',
    elevator: 'エレベーター'
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <FaBuilding className="text-3xl text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                BEI計算ツール
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                建築物エネルギー消費性能（BEI）を正確に計算し、省エネ基準適合性を判定します
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* 入力フォーム */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaCalculator className="mr-3 text-blue-600" />
                    計算条件入力
                  </h2>

                  {error && <ErrorAlert message={error} />}

                  {/* 基本情報 */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        建物面積 (m²) *
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={buildingData.building_area_m2}
                        onChange={(e) => handleInputChange('building_area_m2', e.target.value)}
                        placeholder="1000"
                      />
                    </div>

                    {/* 建物用途選択 */}
                    <div>
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="mixedUse"
                          checked={isMixedUse}
                          onChange={(e) => setIsMixedUse(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="mixedUse" className="text-sm font-medium text-gray-700">
                          複合用途建物
                        </label>
                      </div>

                      {!isMixedUse ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              建物用途 *
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={buildingData.use}
                              onChange={(e) => handleInputChange('use', e.target.value)}
                            >
                              <option value="">選択してください</option>
                              {uses.map(use => (
                                <option key={use} value={use}>
                                  {use === 'office' ? 'オフィス' : 
                                   use === 'hotel' ? 'ホテル' :
                                   use === 'retail' ? '店舗' :
                                   use === 'school' ? '学校' : use}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              地域区分 *
                            </label>
                            <select
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={buildingData.zone}
                              onChange={(e) => handleInputChange('zone', e.target.value)}
                              disabled={!buildingData.use}
                            >
                              <option value="">選択してください</option>
                              {zones.map(zone => (
                                <option key={zone} value={zone}>地域{zone}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            用途構成
                          </label>
                          {buildingData.usage_mix.map((mix, index) => (
                            <div key={index} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                              <select
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                value={mix.use}
                                onChange={(e) => handleUsageMixChange(index, 'use', e.target.value)}
                              >
                                <option value="">用途選択</option>
                                {uses.map(use => (
                                  <option key={use} value={use}>{use}</option>
                                ))}
                              </select>
                              <select
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                value={mix.zone}
                                onChange={(e) => handleUsageMixChange(index, 'zone', e.target.value)}
                              >
                                <option value="">地域選択</option>
                                {zones.map(zone => (
                                  <option key={zone} value={zone}>地域{zone}</option>
                                ))}
                              </select>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                placeholder="面積比率"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                value={mix.area_share}
                                onChange={(e) => handleUsageMixChange(index, 'area_share', e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => removeUsageMix(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={addUsageMix}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <FaPlus className="mr-2" />用途を追加
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 設計エネルギー消費量 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        設計エネルギー消費量 *
                      </label>
                      {designEnergy.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-3">
                          <select
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            value={item.category}
                            onChange={(e) => handleDesignEnergyChange(index, 'category', e.target.value)}
                          >
                            <option value="">カテゴリ選択</option>
                            {Object.entries(categoryDisplayNames).map(([key, name]) => (
                              <option key={key} value={key}>{name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="消費量"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                            value={item.value}
                            onChange={(e) => handleDesignEnergyChange(index, 'value', e.target.value)}
                          />
                          <select
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                            value={item.unit}
                            onChange={(e) => handleDesignEnergyChange(index, 'unit', e.target.value)}
                          >
                            <option value="kWh">kWh</option>
                            <option value="m3_gas">m³ガス</option>
                            <option value="L_kerosene">L灯油</option>
                            <option value="MJ">MJ</option>
                          </select>
                          {designEnergy.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDesignEnergyCategory(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addDesignEnergyCategory}
                        className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <FaPlus className="mr-2" />カテゴリを追加
                      </button>
                    </div>

                    {/* オプション設定 */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          再エネ控除 (MJ/年)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={buildingData.renewable_energy_deduction_mj}
                          onChange={(e) => handleInputChange('renewable_energy_deduction_mj', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BEI小数点桁数
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={buildingData.bei_round_digits}
                          onChange={(e) => handleInputChange('bei_round_digits', e.target.value)}
                        >
                          <option value={1}>1桁</option>
                          <option value={2}>2桁</option>
                          <option value={3}>3桁</option>
                          <option value={4}>4桁</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          適合閾値
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={buildingData.compliance_threshold}
                          onChange={(e) => handleInputChange('compliance_threshold', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 計算ボタン */}
                    <div className="pt-6">
                      <button
                        onClick={calculateBEI}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        {loading ? <LoadingSpinner /> : 'BEI計算を実行'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 計算結果 */}
              <div className="lg:col-span-1">
                {result && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <FaChartBar className="mr-3 text-green-600" />
                      計算結果
                    </h3>

                    {/* BEI結果 */}
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-3xl font-bold mb-2 text-blue-600">
                          BEI = {result.bei}
                        </div>
                        <div className={`text-lg font-semibold ${result.is_compliant ? 'text-green-600' : 'text-red-600'}`}>
                          {result.is_compliant ? '適合' : '不適合'}
                        </div>
                      </div>

                      {/* エネルギー値 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-700">設計一次エネルギー</div>
                          <div className="text-lg">{result.design_primary_energy_mj.toLocaleString()} MJ</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">基準一次エネルギー</div>
                          <div className="text-lg">{result.standard_primary_energy_mj.toLocaleString()} MJ</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">設計値/m²</div>
                          <div>{result.design_energy_per_m2.toFixed(1)} MJ/m²</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">基準値/m²</div>
                          <div>{result.standard_energy_per_m2.toFixed(1)} MJ/m²</div>
                        </div>
                      </div>

                      {/* 設計エネルギー内訳 */}
                      <div>
                        <div className="font-medium text-gray-700 mb-3">設計エネルギー内訳</div>
                        <div className="space-y-2">
                          {result.design_energy_breakdown.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{categoryDisplayNames[item.category] || item.category}</span>
                              <span>{item.primary_energy_mj.toLocaleString()} MJ</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 再エネ控除 */}
                      {result.renewable_deduction_mj > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>再エネ控除</span>
                          <span>-{result.renewable_deduction_mj.toLocaleString()} MJ</span>
                        </div>
                      )}

                      {/* 注意事項 */}
                      {result.notes && result.notes.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center text-yellow-800 font-medium mb-2">
                            <FaInfoCircle className="mr-2" />
                            注意事項
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {result.notes.map((note, index) => (
                              <li key={index}>• {note}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}