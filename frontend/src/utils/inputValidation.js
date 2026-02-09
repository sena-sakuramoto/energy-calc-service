// frontend/src/utils/inputValidation.js
// 入力値検証とアラートシステム

import { TYPICAL_ENERGY_VALUES, resolveTypeName } from './energyReferences';

// 警告レベルの定義
export const WARNING_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

// 入力値検証関数
export const validateEnergyInput = (buildingType, category, value, floorArea) => {
  const warnings = [];
  
  if (!value || value === '' || isNaN(parseFloat(value))) {
    return warnings;
  }

  const numValue = parseFloat(value);
  const perM2Value = floorArea ? numValue / parseFloat(floorArea) : 0;
  
  // 負の値チェック
  if (numValue < 0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: 'エネルギー消費量は0以上の値を入力してください',
      suggestion: '0以上の値を入力してください'
    });
    return warnings;
  }

  // 建物用途別の範囲チェック
  const mappedBuildingType = resolveTypeName(buildingType);
  const ranges = TYPICAL_ENERGY_VALUES[mappedBuildingType];

  if (ranges && ranges[category] && floorArea) {
    const range = ranges[category];
    
    if (perM2Value < range.min * 0.3) {
      warnings.push({
        level: WARNING_LEVELS.WARNING,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大幅に小さいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} MJ/m²年（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `値を確認してください。設備が無い場合は0でも構いません`
      });
    } else if (perM2Value < range.min) {
      warnings.push({
        level: WARNING_LEVELS.INFO,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より小さいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} MJ/m²年（現在: ${perM2Value.toFixed(1)} MJ/m²年）`
      });
    } else if (perM2Value > range.max * 2) {
      warnings.push({
        level: WARNING_LEVELS.ERROR,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大幅に大きいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} MJ/m²年（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `入力値を再確認してください。単位間違いの可能性があります`
      });
    } else if (perM2Value > range.max) {
      warnings.push({
        level: WARNING_LEVELS.WARNING,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大きいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} MJ/m²年（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `特殊な設備がある場合は問題ありません`
      });
    } else {
      warnings.push({
        level: WARNING_LEVELS.INFO,
        message: `${getCategoryDisplayName(category)}の値は適切な範囲内です`,
        suggestion: `一般的な値: ${range.typical} MJ/m²年（現在: ${perM2Value.toFixed(1)} MJ/m²年）`
      });
    }
  }

  // 極端に大きな値のチェック（床面積との比較）
  if (floorArea && numValue > parseFloat(floorArea) * 1000) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: '値が床面積に対して極端に大きいです',
      suggestion: '単位を確認してください（MJ/年で入力）',
      recommendation: 'kWh/年の場合は3.6で割ってください'
    });
  }

  return warnings;
};

// 床面積の検証
export const validateFloorArea = (floorArea) => {
  const warnings = [];
  
  if (!floorArea || floorArea === '' || isNaN(parseFloat(floorArea))) {
    return warnings;
  }

  const numValue = parseFloat(floorArea);
  
  if (numValue <= 0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: '床面積は0より大きい値を入力してください',
      suggestion: '正の値を入力してください'
    });
  } else if (numValue < 50) {
    warnings.push({
      level: WARNING_LEVELS.WARNING,
      message: '床面積が小さいです',
      suggestion: '住宅用途でない場合は値を確認してください'
    });
  } else if (numValue > 100000) {
    warnings.push({
      level: WARNING_LEVELS.WARNING,
      message: '床面積が非常に大きいです',
      suggestion: '超高層建築物の場合は問題ありません'
    });
  } else {
    warnings.push({
      level: WARNING_LEVELS.INFO,
      message: '床面積は適切な範囲内です',
      suggestion: `${numValue.toLocaleString()} m²`
    });
  }

  return warnings;
};

// 再生可能エネルギー量の検証
export const validateRenewableEnergy = (renewableEnergy, totalDesignEnergy) => {
  const warnings = [];
  
  if (!renewableEnergy || renewableEnergy === '') {
    return warnings;
  }

  const numValue = parseFloat(renewableEnergy);
  
  if (numValue < 0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: '再生可能エネルギー量は0以上の値を入力してください',
      suggestion: '0以上の値を入力してください'
    });
  } else if (totalDesignEnergy && numValue > totalDesignEnergy) {
    warnings.push({
      level: WARNING_LEVELS.WARNING,
      message: '再エネ控除量が設計一次エネルギー消費量を上回っています',
      suggestion: '控除量は設計エネルギー消費量以下にしてください',
      recommendation: '太陽光発電等の年間発電量を確認してください'
    });
  } else if (numValue > 0) {
    warnings.push({
      level: WARNING_LEVELS.INFO,
      message: '再生可能エネルギー控除が設定されています',
      suggestion: `控除量: ${numValue.toLocaleString()} MJ/年`
    });
  }

  return warnings;
};

// カテゴリ名の表示用変換
export const getCategoryDisplayName = (category) => {
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

// UA値の検証
export const validateUAValue = (uaValue, climateZone) => {
  const warnings = [];
  
  if (!uaValue || uaValue === '' || isNaN(parseFloat(uaValue))) {
    return warnings;
  }

  const numValue = parseFloat(uaValue);
  
  if (numValue <= 0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: 'UA値は0より大きい値を入力してください',
      suggestion: '正の値を入力してください'
    });
  } else if (numValue > 5.0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: 'UA値が極端に大きいです',
      suggestion: '一般的な建築物のUA値は0.3～2.0の範囲です',
      recommendation: '入力値を再確認してください'
    });
  } else if (climateZone) {
    const standards = {
      1: 0.46, 2: 0.46, 3: 0.56, 4: 0.75,
      5: 0.87, 6: 0.87, 7: 0.87, 8: 0.87
    };
    
    const standardValue = standards[parseInt(climateZone)];
    if (standardValue) {
      if (numValue <= standardValue) {
        warnings.push({
          level: WARNING_LEVELS.INFO,
          message: `${climateZone}地域の省エネ基準に適合しています`,
          suggestion: `基準値: ${standardValue} W/(m²·K)以下（現在: ${numValue} W/(m²·K)）`
        });
      } else if (numValue <= standardValue * 1.5) {
        warnings.push({
          level: WARNING_LEVELS.WARNING,
          message: `${climateZone}地域の省エネ基準を上回っています`,
          suggestion: `基準値: ${standardValue} W/(m²·K)以下（現在: ${numValue} W/(m²·K)）`,
          recommendation: '断熱性能の向上を検討してください'
        });
      } else {
        warnings.push({
          level: WARNING_LEVELS.ERROR,
          message: `${climateZone}地域の省エネ基準を大幅に上回っています`,
          suggestion: `基準値: ${standardValue} W/(m²·K)以下（現在: ${numValue} W/(m²·K)）`,
          recommendation: '断熱改修が必要です'
        });
      }
    }
  } else {
    warnings.push({
      level: WARNING_LEVELS.INFO,
      message: 'UA値が入力されました',
      suggestion: `現在: ${numValue} W/(m²·K)`
    });
  }

  return warnings;
};

// ηAC値の検証
export const validateEtaACValue = (etaACValue, climateZone) => {
  const warnings = [];
  
  if (!etaACValue || etaACValue === '' || isNaN(parseFloat(etaACValue))) {
    return warnings;
  }

  const numValue = parseFloat(etaACValue);
  
  if (numValue <= 0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: 'ηAC値は0より大きい値を入力してください',
      suggestion: '正の値を入力してください'
    });
  } else if (numValue > 10.0) {
    warnings.push({
      level: WARNING_LEVELS.ERROR,
      message: 'ηAC値が極端に大きいです',
      suggestion: '一般的な建築物のηAC値は1.0～6.0の範囲です',
      recommendation: '入力値を再確認してください'
    });
  } else if (climateZone) {
    const standards = {
      1: 4.6, 2: 4.6, 3: 3.5, 4: 3.2,
      5: 2.8, 6: 2.8, 7: 2.8, 8: 2.8
    };
    
    const standardValue = standards[parseInt(climateZone)];
    if (standardValue) {
      if (numValue <= standardValue) {
        warnings.push({
          level: WARNING_LEVELS.INFO,
          message: `${climateZone}地域の省エネ基準に適合しています`,
          suggestion: `基準値: ${standardValue}以下（現在: ${numValue}）`
        });
      } else if (numValue <= standardValue * 1.5) {
        warnings.push({
          level: WARNING_LEVELS.WARNING,
          message: `${climateZone}地域の省エネ基準を上回っています`,
          suggestion: `基準値: ${standardValue}以下（現在: ${numValue}）`,
          recommendation: '遮熱性能の向上を検討してください'
        });
      } else {
        warnings.push({
          level: WARNING_LEVELS.ERROR,
          message: `${climateZone}地域の省エネ基準を大幅に上回っています`,
          suggestion: `基準値: ${standardValue}以下（現在: ${numValue}）`,
          recommendation: '窓・開口部の改修が必要です'
        });
      }
    }
  } else {
    warnings.push({
      level: WARNING_LEVELS.INFO,
      message: 'ηAC値が入力されました',
      suggestion: `現在: ${numValue}`
    });
  }

  return warnings;
};

// 複数項目の一括検証
export const validateAllInputs = (formData) => {
  const allWarnings = {};
  
  // 床面積の検証
  const floorAreaWarnings = validateFloorArea(formData.floor_area);
  if (floorAreaWarnings.length > 0) {
    allWarnings.floor_area = floorAreaWarnings;
  }

  // 外皮性能の検証（標準入力法の場合）
  if (formData.calculation_method === 'standard_input' && formData.envelope_performance) {
    const uaWarnings = validateUAValue(formData.envelope_performance.ua_value, formData.climate_zone);
    if (uaWarnings.length > 0) {
      allWarnings.ua_value = uaWarnings;
    }

    if (formData.building_type === 'residential_collective') {
      const etaACWarnings = validateEtaACValue(formData.envelope_performance.eta_ac_value, formData.climate_zone);
      if (etaACWarnings.length > 0) {
        allWarnings.eta_ac_value = etaACWarnings;
      }
    }
  }

  // 設計エネルギーの検証
  if (formData.design_energy) {
    Object.entries(formData.design_energy).forEach(([category, value]) => {
      const warnings = validateEnergyInput(
        formData.building_type, 
        category, 
        value, 
        formData.floor_area
      );
      if (warnings.length > 0) {
        allWarnings[`design_energy_${category}`] = warnings;
      }
    });
  }

  // 再エネ控除の検証
  const totalDesignEnergy = formData.design_energy ? 
    Object.values(formData.design_energy).reduce((sum, val) => sum + (parseFloat(val) || 0), 0) : 0;
  
  const renewableWarnings = validateRenewableEnergy(formData.renewable_energy, totalDesignEnergy);
  if (renewableWarnings.length > 0) {
    allWarnings.renewable_energy = renewableWarnings;
  }

  return allWarnings;
};

// 警告メッセージのフォーマット
export const formatWarningMessage = (warning) => {
  return {
    message: warning.message,
    suggestion: warning.suggestion,
    recommendation: warning.recommendation,
    level: warning.level,
    className: getWarningClassName(warning.level),
    icon: getWarningIcon(warning.level)
  };
};

// 警告レベルに応じたCSSクラス
export const getWarningClassName = (level) => {
  switch (level) {
    case WARNING_LEVELS.ERROR:
      return 'bg-red-50 border-red-200 text-red-800';
    case WARNING_LEVELS.WARNING:
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case WARNING_LEVELS.INFO:
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

// 警告レベルに応じたアイコン
export const getWarningIcon = (level) => {
  switch (level) {
    case WARNING_LEVELS.ERROR:
      return '❌';
    case WARNING_LEVELS.WARNING:
      return '⚠️';
    case WARNING_LEVELS.INFO:
      return 'ℹ️';
    default:
      return '📝';
  }
};