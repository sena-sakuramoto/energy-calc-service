// frontend/src/pages/tools/tariff-calculator.jsx
import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { tariffAPI, apiRequest } from '../../utils/api';
import { FaDollarSign, FaReceipt, FaChartPie, FaPlus, FaTrash, FaInfoCircle } from 'react-icons/fa';

export default function TariffCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // 料金体系データ
  const [tariffData, setTariffData] = useState({
    type: 'flat',
    flat_rate_per_kwh: 25.0,
    tiers: [
      { limit_kwh: 100, rate_per_kwh: 20.0 },
      { limit_kwh: 200, rate_per_kwh: 25.0 },
      { limit_kwh: null, rate_per_kwh: 30.0 }
    ],
    tou_periods: [
      { name: 'peak', rate_per_kwh: 35.0, hours: [13, 14, 15, 16, 17, 18] },
      { name: 'off-peak', rate_per_kwh: 15.0, hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 23] }
    ],
    basic_charge_per_month: 1000.0,
    basic_charge_per_ampere: 0.0,
    renewable_energy_levy: 0.0,
    fuel_cost_adjustment: 0.0,
    demand_charge_per_kw: 0.0,
    fixed_costs: 0.0,
    tax_rate: 0.1,
    round_to_yen: true
  });

  // 使用量データ
  const [usageData, setUsageData] = useState({
    total_usage_kwh: 300.0,
    hourly_usage: Array(24).fill(12.5), // 均等配分
    amperage: 30,
    max_demand_kw: 0.0
  });

  const [useProfile, setUseProfile] = useState(false);

  const calculateTariff = async () => {
    setLoading(true);
    setError('');

    try {
      if (!usageData.total_usage_kwh && !useProfile) {
        throw new Error('使用量を入力してください');
      }

      const requestData = {
        tariff: tariffData,
        total_usage_kwh: parseFloat(usageData.total_usage_kwh),
        contract: {
          amperage: parseInt(usageData.amperage) || undefined,
          max_demand_kw: parseFloat(usageData.max_demand_kw) || undefined
        }
      };

      if (useProfile && tariffData.type === 'tou') {
        requestData.usage_profile = {
          hourly_usage: usageData.hourly_usage.map(h => parseFloat(h) || 0)
        };
      }

      const response = await apiRequest(() => tariffAPI.quote(requestData), 'Tariff Quote');

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

  const handleTariffChange = (field, value) => {
    setTariffData(prev => ({ ...prev, [field]: value }));
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...tariffData.tiers];
    updated[index][field] = field === 'limit_kwh' && value === '' ? null : parseFloat(value) || 0;
    setTariffData(prev => ({ ...prev, tiers: updated }));
  };

  const addTier = () => {
    setTariffData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { limit_kwh: null, rate_per_kwh: 30.0 }]
    }));
  };

  const removeTier = (index) => {
    setTariffData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const handleTouPeriodChange = (index, field, value) => {
    const updated = [...tariffData.tou_periods];
    if (field === 'hours') {
      // 時間範囲の処理（簡単化のため文字列で処理）
      const hours = value.split(',').map(h => parseInt(h.trim())).filter(h => !isNaN(h) && h >= 0 && h <= 23);
      updated[index][field] = hours;
    } else {
      updated[index][field] = value;
    }
    setTariffData(prev => ({ ...prev, tou_periods: updated }));
  };

  const addTouPeriod = () => {
    setTariffData(prev => ({
      ...prev,
      tou_periods: [...prev.tou_periods, { name: '', rate_per_kwh: 25.0, hours: [] }]
    }));
  };

  const removeTouPeriod = (index) => {
    setTariffData(prev => ({
      ...prev,
      tou_periods: prev.tou_periods.filter((_, i) => i !== index)
    }));
  };

  const handleHourlyUsageChange = (hour, value) => {
    const updated = [...usageData.hourly_usage];
    updated[hour] = parseFloat(value) || 0;
    setUsageData(prev => ({ ...prev, hourly_usage: updated }));
  };

  const distributeUsageEvenly = () => {
    const hourlyValue = usageData.total_usage_kwh / 24;
    setUsageData(prev => ({
      ...prev,
      hourly_usage: Array(24).fill(hourlyValue)
    }));
  };

  return (
    <CalculatorLayout title="料金計算機" subtitle="電気料金・コスト分析" icon={FaDollarSign}>
      <div className="min-h-screen bg-warm-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-accent-50 p-4 rounded-full">
                  <FaDollarSign className="text-3xl text-accent-500" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-primary-800">
                電力料金見積もりツール
              </h1>
              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                フラット・段階制・時間帯別料金に対応した詳細な電力料金計算
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* 料金体系設定 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaReceipt className="mr-3 text-primary-700" />
                    料金体系設定
                  </h2>

                  {error && <ErrorAlert message={error} />}

                  <div className="space-y-6">
                    {/* 料金タイプ選択 */}
                    <div>
                      <label className="block text-sm font-medium text-primary-700 mb-2">
                        料金タイプ
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                        value={tariffData.type}
                        onChange={(e) => handleTariffChange('type', e.target.value)}
                      >
                        <option value="flat">フラット料金</option>
                        <option value="tiered">段階制料金</option>
                        <option value="tou">時間帯別料金</option>
                      </select>
                    </div>

                    {/* フラット料金設定 */}
                    {tariffData.type === 'flat' && (
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          単価 (円/kWh)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.flat_rate_per_kwh}
                          onChange={(e) => handleTariffChange('flat_rate_per_kwh', parseFloat(e.target.value))}
                        />
                      </div>
                    )}

                    {/* 段階制料金設定 */}
                    {tariffData.type === 'tiered' && (
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-4">
                          段階料金設定
                        </label>
                        {tariffData.tiers.map((tier, index) => (
                          <div key={index} className="flex gap-3 mb-3 p-3 bg-warm-50 rounded-lg">
                            <div className="flex-1">
                              <input
                                type="number"
                                placeholder={index === tariffData.tiers.length - 1 ? "上限なし" : "上限 (kWh)"}
                                className="w-full px-3 py-2 border border-primary-300 rounded"
                                value={tier.limit_kwh || ''}
                                onChange={(e) => handleTierChange(index, 'limit_kwh', e.target.value)}
                                disabled={index === tariffData.tiers.length - 1}
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="単価 (円/kWh)"
                                className="w-full px-3 py-2 border border-primary-300 rounded"
                                value={tier.rate_per_kwh}
                                onChange={(e) => handleTierChange(index, 'rate_per_kwh', e.target.value)}
                              />
                            </div>
                            {tariffData.tiers.length > 1 && (
                              <button
                                onClick={() => removeTier(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addTier}
                          className="flex items-center text-accent-500 hover:text-accent-600"
                        >
                          <FaPlus className="mr-2" />
                          段階を追加
                        </button>
                      </div>
                    )}

                    {/* 時間帯別料金設定 */}
                    {tariffData.type === 'tou' && (
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-4">
                          時間帯別料金設定
                        </label>
                        {tariffData.tou_periods.map((period, index) => (
                          <div key={index} className="mb-4 p-4 bg-warm-50 rounded-lg">
                            <div className="grid grid-cols-3 gap-3 mb-2">
                              <input
                                type="text"
                                placeholder="時間帯名"
                                className="px-3 py-2 border border-primary-300 rounded"
                                value={period.name}
                                onChange={(e) => handleTouPeriodChange(index, 'name', e.target.value)}
                              />
                              <input
                                type="number"
                                step="0.01"
                                placeholder="単価"
                                className="px-3 py-2 border border-primary-300 rounded"
                                value={period.rate_per_kwh}
                                onChange={(e) => handleTouPeriodChange(index, 'rate_per_kwh', parseFloat(e.target.value))}
                              />
                              <button
                                onClick={() => removeTouPeriod(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="適用時間 (0,1,2,... または 13,14,15,16,17,18)"
                              className="w-full px-3 py-2 border border-primary-300 rounded"
                              value={period.hours.join(',')}
                              onChange={(e) => handleTouPeriodChange(index, 'hours', e.target.value)}
                            />
                          </div>
                        ))}
                        <button
                          onClick={addTouPeriod}
                          className="flex items-center text-accent-500 hover:text-accent-600"
                        >
                          <FaPlus className="mr-2" />
                          時間帯を追加
                        </button>
                      </div>
                    )}

                    {/* その他の料金設定 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          基本料金 (円/月)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.basic_charge_per_month}
                          onChange={(e) => handleTariffChange('basic_charge_per_month', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          アンペア単価 (円/A)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.basic_charge_per_ampere}
                          onChange={(e) => handleTariffChange('basic_charge_per_ampere', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          再エネ賦課金 (円/kWh)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.renewable_energy_levy}
                          onChange={(e) => handleTariffChange('renewable_energy_levy', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          燃料費調整 (円/kWh)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.fuel_cost_adjustment}
                          onChange={(e) => handleTariffChange('fuel_cost_adjustment', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          デマンド料金 (円/kW)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.demand_charge_per_kw}
                          onChange={(e) => handleTariffChange('demand_charge_per_kw', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          税率
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={tariffData.tax_rate}
                          onChange={(e) => handleTariffChange('tax_rate', parseFloat(e.target.value))}
                        >
                          <option value={0}>0% (税抜き)</option>
                          <option value={0.08}>8%</option>
                          <option value={0.1}>10%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 使用量設定 */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FaChartPie className="mr-3 text-accent-500" />
                    使用量・契約条件
                  </h2>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          月間使用量 (kWh)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={usageData.total_usage_kwh}
                          onChange={(e) => setUsageData(prev => ({ ...prev, total_usage_kwh: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          契約アンペア (A)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={usageData.amperage}
                          onChange={(e) => setUsageData(prev => ({ ...prev, amperage: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-primary-700 mb-2">
                          最大デマンド (kW)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                          value={usageData.max_demand_kw}
                          onChange={(e) => setUsageData(prev => ({ ...prev, max_demand_kw: e.target.value }))}
                        />
                      </div>
                    </div>

                    {tariffData.type === 'tou' && (
                      <div>
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="useProfile"
                            checked={useProfile}
                            onChange={(e) => setUseProfile(e.target.checked)}
                            className="mr-2"
                          />
                          <label htmlFor="useProfile" className="text-sm font-medium text-primary-700">
                            時間別使用量プロファイルを使用
                          </label>
                        </div>

                        {useProfile && (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <label className="text-sm font-medium text-primary-700">
                                時間別使用量 (kWh)
                              </label>
                              <button
                                onClick={distributeUsageEvenly}
                                className="text-sm text-accent-500 hover:text-accent-600"
                              >
                                均等配分
                              </button>
                            </div>
                            <div className="grid grid-cols-6 gap-2">
                              {usageData.hourly_usage.map((usage, hour) => (
                                <div key={hour} className="text-center">
                                  <div className="text-xs text-primary-400 mb-1">{hour}時</div>
                                  <input
                                    type="number"
                                    step="0.1"
                                    className="w-full px-2 py-1 text-sm border border-primary-300 rounded"
                                    value={usage}
                                    onChange={(e) => handleHourlyUsageChange(hour, e.target.value)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={calculateTariff}
                      disabled={loading}
                      className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors"
                    >
                      {loading ? <LoadingSpinner /> : '見積もり計算'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 計算結果 */}
              <div className="lg:col-span-1">
                {result && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <FaReceipt className="mr-3 text-accent-500" />
                      見積もり結果
                    </h3>

                    <div className="space-y-4">
                      {/* 総額 */}
                      <div className="text-center p-4 bg-accent-50 rounded-lg">
                        <div className="text-3xl font-bold mb-2 text-accent-500">
                          {Math.round(result.total_amount).toLocaleString()} 円
                        </div>
                        <div className="text-sm text-primary-500">
                          月額電力料金（税込）
                        </div>
                      </div>

                      {/* 内訳 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">税抜金額:</span>
                          <span>{Math.round(result.total_before_tax).toLocaleString()} 円</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">税額:</span>
                          <span>{Math.round(result.tax_amount).toLocaleString()} 円</span>
                        </div>
                      </div>

                      {/* 詳細内訳 */}
                      <div>
                        <div className="font-medium text-primary-700 mb-3">詳細内訳</div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {result.line_items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm py-1 border-b border-primary-100">
                              <span className="text-primary-500">{item.description}</span>
                              <span className="font-medium">{Math.round(item.amount).toLocaleString()} 円</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 料金体系サマリー */}
                      <div className="mt-4 p-3 bg-warm-50 rounded-lg">
                        <div className="flex items-center text-primary-700 font-medium mb-2">
                          <FaInfoCircle className="mr-2" />
                          料金体系
                        </div>
                        <div className="text-sm text-primary-600">
                          <div>タイプ: {
                            result.tariff_summary.type === 'flat' ? 'フラット料金' :
                            result.tariff_summary.type === 'tiered' ? '段階制料金' :
                            result.tariff_summary.type === 'tou' ? '時間帯別料金' : result.tariff_summary.type
                          }</div>
                          {result.tariff_summary.basic_charge_per_month > 0 && (
                            <div>基本料金: {result.tariff_summary.basic_charge_per_month.toLocaleString()} 円/月</div>
                          )}
                          <div>税率: {(result.tariff_summary.tax_rate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
