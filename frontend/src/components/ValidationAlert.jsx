// frontend/src/components/ValidationAlert.jsx
import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { WARNING_LEVELS, formatWarningMessage } from '../utils/inputValidation';

export default function ValidationAlert({ warnings, onDismiss, className = "" }) {
  if (!warnings || warnings.length === 0) {
    return null;
  }

  const getIcon = (level) => {
    switch (level) {
      case WARNING_LEVELS.ERROR:
        return <FaExclamationTriangle className="text-red-500" />;
      case WARNING_LEVELS.WARNING:
        return <FaExclamationTriangle className="text-yellow-500" />;
      case WARNING_LEVELS.INFO:
        return <FaInfoCircle className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getBackgroundClass = (level) => {
    switch (level) {
      case WARNING_LEVELS.ERROR:
        return 'bg-red-50 border-red-200';
      case WARNING_LEVELS.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case WARNING_LEVELS.INFO:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 最も重要な警告レベルを取得
  const maxLevel = warnings.reduce((max, warning) => {
    if (warning.level === WARNING_LEVELS.ERROR) return WARNING_LEVELS.ERROR;
    if (warning.level === WARNING_LEVELS.WARNING && max !== WARNING_LEVELS.ERROR) return WARNING_LEVELS.WARNING;
    if (max !== WARNING_LEVELS.ERROR && max !== WARNING_LEVELS.WARNING) return WARNING_LEVELS.INFO;
    return max;
  }, WARNING_LEVELS.INFO);

  return (
    <div className={`border rounded-lg p-3 mb-3 ${getBackgroundClass(maxLevel)} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(maxLevel)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            {warnings.map((warning, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">
                  {warning.message}
                </div>
                {warning.suggestion && (
                  <div className="text-xs opacity-75 mt-1">
                    {warning.suggestion}
                  </div>
                )}
                {warning.recommendation && (
                  <div className="text-xs opacity-75 mt-1 font-medium">
                    💡 {warning.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// 複数の検証結果をまとめて表示するコンポーネント
export function ValidationSummary({ validationResults, className = "" }) {
  if (!validationResults || Object.keys(validationResults).length === 0) {
    return null;
  }

  const totalWarnings = Object.values(validationResults).flat().length;
  const errorCount = Object.values(validationResults).flat().filter(w => w.level === WARNING_LEVELS.ERROR).length;
  const warningCount = Object.values(validationResults).flat().filter(w => w.level === WARNING_LEVELS.WARNING).length;
  const infoCount = Object.values(validationResults).flat().filter(w => w.level === WARNING_LEVELS.INFO).length;

  if (totalWarnings === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2 text-green-800">
          <FaCheckCircle />
          <span className="font-medium">入力値チェック完了</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          すべての入力値が適切な範囲内です。
        </p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">入力値チェック結果</h4>
        <div className="flex space-x-3 text-sm">
          {errorCount > 0 && (
            <span className="text-red-600">❌ エラー {errorCount}件</span>
          )}
          {warningCount > 0 && (
            <span className="text-yellow-600">⚠️ 注意 {warningCount}件</span>
          )}
          {infoCount > 0 && (
            <span className="text-blue-600">ℹ️ 情報 {infoCount}件</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(validationResults).map(([field, warnings]) => (
          <div key={field}>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {getFieldDisplayName(field)}
            </div>
            <ValidationAlert warnings={warnings} />
          </div>
        ))}
      </div>

      {errorCount > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">
            <strong>エラーが {errorCount}件 あります。</strong>
            計算を実行する前に修正してください。
          </p>
        </div>
      )}
    </div>
  );
}

// フィールド名の表示用変換
const getFieldDisplayName = (field) => {
  const names = {
    floor_area: "床面積",
    renewable_energy: "再生可能エネルギー控除",
    design_energy_heating: "暖房エネルギー",
    design_energy_cooling: "冷房エネルギー",
    design_energy_ventilation: "換気エネルギー",
    design_energy_hot_water: "給湯エネルギー",
    design_energy_lighting: "照明エネルギー",
    design_energy_elevator: "昇降機エネルギー",
    ua_value: "UA値（外皮平均熱貫流率）",
    eta_ac_value: "ηAC値（平均日射熱取得率）"
  };
  return names[field] || field;
};