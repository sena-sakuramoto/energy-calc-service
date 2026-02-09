// frontend/src/pages/tools/energy-calculator.jsx
import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { energyAPI, apiRequest } from '../../utils/api';
import { FaBolt, FaCalculator, FaCogs, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';

export default function EnergyCalculator() {
  const [activeTab, setActiveTab] = useState('power');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 電力計算
  const [powerData, setPowerData] = useState({
    voltage: '',
    current: '',
    power_factor: 1.0,
    is_three_phase: false
  });
  const [powerResult, setPowerResult] = useState(null);

  // エネルギー計算
  const [energyData, setEnergyData] = useState({
    power_kw: '',
    power_w: '',
    duration_hours: ''
  });
  const [energyResult, setEnergyResult] = useState(null);

  // コスト計算
  const [costData, setCostData] = useState({
    energy_kwh: '',
    tariff_per_kwh: 25.0,
    fixed_cost: 0,
    tax_rate: 0.1
  });
  const [costResult, setCostResult] = useState(null);

  // 機器集計
  const [devices, setDevices] = useState([
    { name: '', power_kw: '', usage_hours: '', quantity: 1 }
  ]);
  const [deviceResult, setDeviceResult] = useState(null);

  const calculatePower = async () => {
    setLoading(true);
    setError('');

    try {
      if (!powerData.voltage || !powerData.current) {
        throw new Error('電圧と電流を入力してください');
      }

      const response = await apiRequest(() => energyAPI.calculatePower(powerData), 'Power Calculation');

      if (response.success) {
        setPowerResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateEnergy = async () => {
    setLoading(true);
    setError('');

    try {
      if ((!energyData.power_kw && !energyData.power_w) || !energyData.duration_hours) {
        throw new Error('電力と時間を入力してください');
      }

      const data = { ...energyData };
      if (energyData.power_kw) {
        data.power_kw = parseFloat(energyData.power_kw);
      } else {
        data.power_w = parseFloat(energyData.power_w);
      }
      data.duration_hours = parseFloat(energyData.duration_hours);

      const response = await apiRequest(() => energyAPI.calculateEnergy(data), 'Energy Calculation');

      if (response.success) {
        setEnergyResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = async () => {
    setLoading(true);
    setError('');

    try {
      if (!costData.energy_kwh) {
        throw new Error('エネルギー消費量を入力してください');
      }

      const data = {
        energy_kwh: parseFloat(costData.energy_kwh),
        tariff_per_kwh: parseFloat(costData.tariff_per_kwh),
        fixed_cost: parseFloat(costData.fixed_cost),
        tax_rate: parseFloat(costData.tax_rate)
      };

      const response = await apiRequest(() => energyAPI.calculateCost(data), 'Cost Calculation');

      if (response.success) {
        setCostResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDevices = async () => {
    setLoading(true);
    setError('');

    try {
      const validDevices = devices.filter(device =>
        device.name && device.power_kw && device.usage_hours
      ).map(device => ({
        ...device,
        power_kw: parseFloat(device.power_kw),
        usage_hours: parseFloat(device.usage_hours),
        quantity: parseInt(device.quantity) || 1
      }));

      if (validDevices.length === 0) {
        throw new Error('機器情報を入力してください');
      }

      const response = await apiRequest(() => energyAPI.aggregateDevices({
        devices: validDevices
      }), 'Device Aggregation');

      if (response.success) {
        setDeviceResult(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addDevice = () => {
    setDevices(prev => [...prev, { name: '', power_kw: '', usage_hours: '', quantity: 1 }]);
  };

  const removeDevice = (index) => {
    setDevices(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeviceChange = (index, field, value) => {
    const updated = [...devices];
    updated[index][field] = value;
    setDevices(updated);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // 成功時の処理（必要に応じて）
    });
  };

  const tabs = [
    { id: 'power', name: '電力計算', icon: FaBolt },
    { id: 'energy', name: 'エネルギー計算', icon: FaCalculator },
    { id: 'cost', name: 'コスト計算', icon: FaCogs },
    { id: 'devices', name: '機器集計', icon: FaPlus }
  ];

  return (
    <CalculatorLayout
      title="エネルギー計算機"
      subtitle="電力・エネルギー消費量・コスト計算"
      icon={FaBolt}
    >
      <div className="min-h-screen bg-warm-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <FaBolt className="text-3xl text-primary-700" />
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-primary-800">
                エネルギー計算ツール
              </h1>
              <p className="text-lg text-primary-500 max-w-2xl mx-auto">
                電力、エネルギー消費量、コストの計算と機器使用量の集計が行えます
              </p>
            </div>

            {/* タブナビゲーション */}
            <div className="bg-white rounded-xl shadow-lg mb-8">
              <div className="flex border-b border-primary-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-accent-500 border-b-2 border-accent-500 bg-accent-50'
                        : 'text-primary-500 hover:text-primary-800 hover:bg-warm-50'
                    }`}
                  >
                    <tab.icon className="mr-2" />
                    {tab.name}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {error && <ErrorAlert message={error} />}

                {/* 電力計算タブ */}
                {activeTab === 'power' && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">電力計算</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                              電圧 (V) *
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                              value={powerData.voltage}
                              onChange={(e) => setPowerData(prev => ({ ...prev, voltage: e.target.value }))}
                              placeholder="100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-primary-700 mb-2">
                              電流 (A) *
                            </label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                              value={powerData.current}
                              onChange={(e) => setPowerData(prev => ({ ...prev, current: e.target.value }))}
                              placeholder="10"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            力率
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={powerData.power_factor}
                            onChange={(e) => setPowerData(prev => ({ ...prev, power_factor: parseFloat(e.target.value) }))}
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="three-phase"
                            checked={powerData.is_three_phase}
                            onChange={(e) => setPowerData(prev => ({ ...prev, is_three_phase: e.target.checked }))}
                            className="mr-2"
                          />
                          <label htmlFor="three-phase" className="text-sm font-medium text-primary-700">
                            三相電力
                          </label>
                        </div>
                        <button
                          onClick={calculatePower}
                          disabled={loading}
                          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                          {loading ? <LoadingSpinner /> : '計算実行'}
                        </button>
                      </div>
                    </div>

                    {powerResult && (
                      <div className="bg-warm-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold mb-4">計算結果</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">電力 (W):</span>
                            <span className="font-mono text-lg">{powerResult.power_w.toFixed(2)} W</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">電力 (kW):</span>
                            <span className="font-mono text-lg">{powerResult.power_kw.toFixed(3)} kW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">計算式:</span>
                            <span className="text-sm text-primary-500">
                              {powerResult.is_three_phase ? '√3 × ' : ''}V × I × cos&phi;
                            </span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`電力: ${powerResult.power_w.toFixed(2)} W (${powerResult.power_kw.toFixed(3)} kW)`)}
                            className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                          >
                            <FaCopy className="mr-2" />
                            結果をコピー
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* エネルギー計算タブ */}
                {activeTab === 'energy' && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">エネルギー計算</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            電力入力方式
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-primary-400 mb-1">kW単位</label>
                              <input
                                type="number"
                                step="0.001"
                                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                value={energyData.power_kw}
                                onChange={(e) => setEnergyData(prev => ({ ...prev, power_kw: e.target.value, power_w: '' }))}
                                placeholder="2.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-primary-400 mb-1">W単位</label>
                              <input
                                type="number"
                                className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                value={energyData.power_w}
                                onChange={(e) => setEnergyData(prev => ({ ...prev, power_w: e.target.value, power_kw: '' }))}
                                placeholder="2500"
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            使用時間 (h) *
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={energyData.duration_hours}
                            onChange={(e) => setEnergyData(prev => ({ ...prev, duration_hours: e.target.value }))}
                            placeholder="8"
                          />
                        </div>
                        <button
                          onClick={calculateEnergy}
                          disabled={loading}
                          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                          {loading ? <LoadingSpinner /> : '計算実行'}
                        </button>
                      </div>
                    </div>

                    {energyResult && (
                      <div className="bg-warm-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold mb-4">計算結果</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="font-medium">エネルギー消費量:</span>
                            <span className="font-mono text-lg">{energyResult.energy_kwh.toFixed(2)} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">使用電力:</span>
                            <span className="text-sm text-primary-500">{energyResult.power_kw.toFixed(3)} kW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">使用時間:</span>
                            <span className="text-sm text-primary-500">{energyResult.duration_hours} h</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`エネルギー消費量: ${energyResult.energy_kwh.toFixed(2)} kWh`)}
                            className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                          >
                            <FaCopy className="mr-2" />
                            結果をコピー
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* コスト計算タブ */}
                {activeTab === 'cost' && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">コスト計算</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            エネルギー消費量 (kWh) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={costData.energy_kwh}
                            onChange={(e) => setCostData(prev => ({ ...prev, energy_kwh: e.target.value }))}
                            placeholder="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            電力料金単価 (円/kWh)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={costData.tariff_per_kwh}
                            onChange={(e) => setCostData(prev => ({ ...prev, tariff_per_kwh: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            固定費 (円)
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={costData.fixed_cost}
                            onChange={(e) => setCostData(prev => ({ ...prev, fixed_cost: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-primary-700 mb-2">
                            税率
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                            value={costData.tax_rate}
                            onChange={(e) => setCostData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) }))}
                          >
                            <option value={0}>0% (税抜き)</option>
                            <option value={0.08}>8%</option>
                            <option value={0.1}>10%</option>
                          </select>
                        </div>
                        <button
                          onClick={calculateCost}
                          disabled={loading}
                          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                          {loading ? <LoadingSpinner /> : '計算実行'}
                        </button>
                      </div>
                    </div>

                    {costResult && (
                      <div className="bg-warm-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold mb-4">計算結果</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-medium text-lg">総額:</span>
                            <span className="font-mono text-xl text-accent-500">{Math.round(costResult.total_cost).toLocaleString()} 円</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">電力料金:</span>
                            <span className="text-sm">{Math.round(costResult.energy_cost).toLocaleString()} 円</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">固定費:</span>
                            <span className="text-sm">{Math.round(costResult.fixed_cost).toLocaleString()} 円</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">税額:</span>
                            <span className="text-sm">{Math.round(costResult.tax_amount).toLocaleString()} 円</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">単価:</span>
                            <span className="text-sm">{costResult.tariff_per_kwh} 円/kWh</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(`総額: ${Math.round(costResult.total_cost).toLocaleString()} 円`)}
                            className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                          >
                            <FaCopy className="mr-2" />
                            結果をコピー
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 機器集計タブ */}
                {activeTab === 'devices' && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">機器使用量集計</h3>
                      <div className="space-y-4">
                        {devices.map((device, index) => (
                          <div key={index} className="p-4 border border-primary-200 rounded-lg">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <input
                                type="text"
                                placeholder="機器名"
                                className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                value={device.name}
                                onChange={(e) => handleDeviceChange(index, 'name', e.target.value)}
                              />
                              <input
                                type="number"
                                step="0.001"
                                placeholder="電力 (kW)"
                                className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                value={device.power_kw}
                                onChange={(e) => handleDeviceChange(index, 'power_kw', e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                step="0.1"
                                placeholder="使用時間 (h)"
                                className="px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                value={device.usage_hours}
                                onChange={(e) => handleDeviceChange(index, 'usage_hours', e.target.value)}
                              />
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  placeholder="台数"
                                  className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-400"
                                  value={device.quantity}
                                  onChange={(e) => handleDeviceChange(index, 'quantity', e.target.value)}
                                />
                                {devices.length > 1 && (
                                  <button
                                    onClick={() => removeDevice(index)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={addDevice}
                          className="flex items-center text-accent-500 hover:text-accent-600"
                        >
                          <FaPlus className="mr-2" />
                          機器を追加
                        </button>
                        <button
                          onClick={calculateDevices}
                          disabled={loading}
                          className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-primary-400 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                        >
                          {loading ? <LoadingSpinner /> : '集計実行'}
                        </button>
                      </div>
                    </div>

                    {deviceResult && (
                      <div className="bg-warm-50 p-6 rounded-lg">
                        <h4 className="text-lg font-bold mb-4">集計結果</h4>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between border-b pb-2">
                            <span className="font-medium">総エネルギー:</span>
                            <span className="font-mono text-lg text-accent-500">{deviceResult.total_energy_kwh.toFixed(2)} kWh</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">総電力:</span>
                            <span className="text-sm">{deviceResult.total_power_kw.toFixed(2)} kW</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-primary-500">総機器数:</span>
                            <span className="text-sm">{deviceResult.device_count} 台</span>
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                          <h5 className="font-medium mb-2">機器別内訳</h5>
                          {deviceResult.devices.map((device, index) => (
                            <div key={index} className="text-xs bg-white p-2 rounded mb-1">
                              <div className="font-medium">{device.name}</div>
                              <div className="text-primary-500">
                                {device.power_kw}kW × {device.usage_hours}h × {device.quantity}台 = {device.energy_kwh.toFixed(1)}kWh
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => copyToClipboard(`総エネルギー: ${deviceResult.total_energy_kwh.toFixed(2)} kWh`)}
                          className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                        >
                          <FaCopy className="mr-2" />
                          結果をコピー
                        </button>
                      </div>
                    )}
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
