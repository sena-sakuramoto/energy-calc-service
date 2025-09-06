// frontend/src/utils/inputValidation.js
// 入力値検証とアラートシステム

// 建物用途別の一般的な値の範囲（MJ/m²年） - energyComparison.js と値を統一
export const TYPICAL_ENERGY_RANGES = {
  office: { min: 80, max: 150, typical: 115 }, // heating
  offices: { // alias for office
    heating: { min: 80, max: 150, typical: 115 },
    cooling: { min: 60, max: 120, typical: 90 },
    ventilation: { min: 40, max: 80, typical: 60 },
    hot_water: { min: 5, max: 20, typical: 12 },
    lighting: { min: 80, max: 140, typical: 110 },
    elevator: { min: 15, max: 30, typical: 22 }
  },
  hospital: { min: 200, max: 350, typical: 275 }, // heating
  hospitals: { // alias for hospital
    heating: { min: 200, max: 350, typical: 275 },
    cooling: { min: 150, max: 250, typical: 200 },
    ventilation: { min: 100, max: 180, typical: 140 },
    hot_water: { min: 80, max: 150, typical: 115 },
    lighting: { min: 100, max: 160, typical: 130 },
    elevator: { min: 10, max: 25, typical: 17 }
  },
  hotel: { min: 150, max: 250, typical: 200 }, // heating
  hotels: { // alias for hotel
    heating: { min: 150, max: 250, typical: 200 },
    cooling: { min: 120, max: 200, typical: 160 },
    ventilation: { min: 80, max: 140, typical: 110 },
    hot_water: { min: 100, max: 180, typical: 140 },
    lighting: { min: 80, max: 130, typical: 105 },
    elevator: { min: 15, max: 30, typical: 22 }
  },
  shop_department: { min: 100, max: 180, typical: 140 }, // heating
  department_stores: { // alias for shop_department
    heating: { min: 100, max: 180, typical: 140 },
    cooling: { min: 80, max: 140, typical: 110 },
    ventilation: { min: 60, max: 100, typical: 80 },
    hot_water: { min: 5, max: 15, typical: 10 },
    lighting: { min: 120, max: 200, typical: 160 },
    elevator: { min: 20, max: 40, typical: 30 }
  },
  school: { min: 120, max: 200, typical: 160 }, // heating
  schools: { // alias for school
    heating: { min: 120, max: 200, typical: 160 },
    cooling: { min: 60, max: 120, typical: 90 },
    ventilation: { min: 40, max: 80, typical: 60 },
    hot_water: { min: 10, max: 30, typical: 20 },
    lighting: { min: 80, max: 130, typical: 105 },
    elevator: { min: 5, max: 15, typical: 10 }
  },
  restaurant: { min: 150, max: 250, typical: 200 }, // heating
  restaurants: { // alias for restaurant
    heating: { min: 150, max: 250, typical: 200 },
    cooling: { min: 120, max: 200, typical: 160 },
    ventilation: { min: 200, max: 350, typical: 275 },
    hot_water: { min: 100, max: 200, typical: 150 },
    lighting: { min: 100, max: 160, typical: 130 },
    elevator: { min: 10, max: 25, typical: 17 }
  },
  assembly_hall: { min: 100, max: 180, typical: 140 }, // heating
  assembly_halls: { // alias for assembly_hall
    heating: { min: 100, max: 180, typical: 140 },
    cooling: { min: 80, max: 140, typical: 110 },
    ventilation: { min: 60, max: 100, typical: 80 },
    hot_water: { min: 5, max: 20, typical: 12 },
    lighting: { min: 80, max: 140, typical: 110 },
    elevator: { min: 10, max: 25, typical: 17 }
  }
};

// ... (The rest of the file remains the same) ...

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
  const ranges = TYPICAL_ENERGY_RANGES[buildingType];
  if (ranges && ranges[category] && floorArea) {
    const range = ranges[category];
    
    if (perM2Value < range.min * 0.3) {
      warnings.push({
        level: WARNING_LEVELS.WARNING,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大幅に小さいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} ${range.unit}（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `値を確認してください。設備が無い場合は0でも構いません`
      });
    } else if (perM2Value < range.min) {
      warnings.push({
        level: WARNING_LEVELS.INFO,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より小さいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} ${range.unit}（現在: ${perM2Value.toFixed(1)} MJ/m²年）`
      });
    } else if (perM2Value > range.max * 2) {
      warnings.push({
        level: WARNING_LEVELS.ERROR,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大幅に大きいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} ${range.unit}（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `入力値を再確認してください。単位間違いの可能性があります`
      });
    } else if (perM2Value > range.max) {
      warnings.push({
        level: WARNING_LEVELS.WARNING,
        message: `${getCategoryDisplayName(category)}の値が一般的な範囲より大きいです`,
        suggestion: `一般的な範囲: ${range.min}-${range.max} ${range.unit}（現在: ${perM2Value.toFixed(1)} MJ/m²年）`,
        recommendation: `特殊な設備がある場合は問題ありません`
      });
    } else {
      warnings.push({
        level: WARNING_LEVELS.INFO,
        message: `${getCategoryDisplayName(category)}の値は適切な範囲内です`,
        suggestion: `一般的な値: ${range.typical} ${range.unit}（現在: ${perM2Value.toFixed(1)} MJ/m²年）`
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

// ... (The rest of the file is unchanged) ...
