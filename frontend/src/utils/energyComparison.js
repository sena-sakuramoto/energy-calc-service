// frontend/src/utils/energyComparison.js
/**
 * エネルギー消費量比較分析ユーティリティ
 * 設計値と基準値を比較して、参考コメントを生成
 */

// 建物用途別の一般的なエネルギー消費量範囲（MJ/m²年）
const ENERGY_RANGES = {
  // 事務所等
  'offices': {
    heating: { low: 80, high: 180, typical: 115 },
    cooling: { low: 60, high: 120, typical: 90 },
    ventilation: { low: 40, high: 80, typical: 60 },
    hot_water: { low: 5, high: 30, typical: 12 },
    lighting: { low: 80, high: 140, typical: 110 },
    elevator: { low: 15, high: 30, typical: 22 }
  },
  // 病院等
  'hospitals': {
    heating: { low: 200, high: 350, typical: 275 },
    cooling: { low: 150, high: 250, typical: 200 },
    ventilation: { low: 100, high: 180, typical: 140 },
    hot_water: { low: 80, high: 150, typical: 115 },
    lighting: { low: 100, high: 160, typical: 130 },
    elevator: { low: 10, high: 25, typical: 17 }
  },
  // ホテル等
  'hotels': {
    heating: { low: 150, high: 250, typical: 200 },
    cooling: { low: 120, high: 200, typical: 160 },
    ventilation: { low: 80, high: 140, typical: 110 },
    hot_water: { low: 100, high: 180, typical: 140 },
    lighting: { low: 80, high: 130, typical: 105 },
    elevator: { low: 15, high: 30, typical: 22 }
  },
  // 百貨店等
  'department_stores': {
    heating: { low: 100, high: 180, typical: 140 },
    cooling: { low: 80, high: 140, typical: 110 },
    ventilation: { low: 60, high: 100, typical: 80 },
    hot_water: { low: 5, high: 15, typical: 10 },
    lighting: { low: 120, high: 200, typical: 160 },
    elevator: { low: 20, high: 40, typical: 30 }
  },
  // 学校等
  'schools': {
    heating: { low: 120, high: 200, typical: 160 },
    cooling: { low: 60, high: 120, typical: 90 },
    ventilation: { low: 40, high: 80, typical: 60 },
    hot_water: { low: 10, high: 30, typical: 20 },
    lighting: { low: 80, high: 130, typical: 105 },
    elevator: { low: 5, high: 15, typical: 10 }
  },
  // 飲食店等
  'restaurants': {
    heating: { low: 150, high: 250, typical: 200 },
    cooling: { low: 120, high: 200, typical: 160 },
    ventilation: { low: 200, high: 350, typical: 275 },
    hot_water: { low: 100, high: 200, typical: 150 },
    lighting: { low: 100, high: 160, typical: 130 },
    elevator: { low: 10, high: 25, typical: 17 }
  },
  // 集会所等
  'assembly_halls': {
    heating: { low: 100, high: 180, typical: 140 },
    cooling: { low: 80, high: 140, typical: 110 },
    ventilation: { low: 60, high: 100, typical: 80 },
    hot_water: { low: 5, high: 20, typical: 12 },
    lighting: { low: 80, high: 140, typical: 110 },
    elevator: { low: 10, high: 25, typical: 17 }
  }
};

// 建物用途マッピング
const BUILDING_TYPE_MAPPING = {
  'offices': 'offices',
  'hospitals': 'hospitals', 
  'hotels': 'hotels',
  'department_stores': 'department_stores',
  'schools': 'schools',
  'restaurants': 'restaurants',
  'assembly_halls': 'assembly_halls',
  'factories': 'offices', // 工場→事務所のデータを参考
  'warehouses': 'offices', // 倉庫→事務所のデータを参考
  'gyms': 'assembly_halls', // 体育館→集会所のデータを参考
  'libraries': 'schools', // 図書館→学校のデータを参考
  'museums': 'assembly_halls' // 博物館→集会所のデータを参考
};

/**
 * エネルギー消費量の比較分析を行う
 * @param {number} designValue - 設計値 (MJ/m²年)
 * @param {string} buildingType - 建物用途
 * @param {string} energyType - エネルギー種別 (heating, cooling, etc.)
 * @returns {object} - 分析結果
 */
export function analyzeEnergyConsumption(designValue, buildingType, energyType) {
  const mappedType = BUILDING_TYPE_MAPPING[buildingType] || 'offices';
  const ranges = ENERGY_RANGES[mappedType];
  
  if (!ranges || !ranges[energyType]) {
    return {
      level: 'normal',
      comment: '標準的な範囲内です',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: '📊'
    };
  }

  const { low, high, typical } = ranges[energyType];
  const ratio = designValue / typical;

  if (designValue < low * 0.8) {
    return {
      level: 'very_low',
      comment: `非常に低い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ性能が優秀です',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: '🌟'
    };
  } else if (designValue < low) {
    return {
      level: 'low',
      comment: `低い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ設計が効いています',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✅'
    };
  } else if (designValue <= high) {
    if (designValue <= typical * 1.1) {
      return {
        level: 'normal',
        comment: `標準的な消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
        detail: '適切な範囲内です',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: '📊'
      };
    } else {
      return {
        level: 'normal_high',
        comment: `やや高めの消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
        detail: '改善の余地があります',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        icon: '⚠️'
      };
    }
  } else if (designValue <= high * 1.3) {
    return {
      level: 'high',
      comment: `高い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ対策の検討をお勧めします',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '🔺'
    };
  } else {
    return {
      level: 'very_high',
      comment: `非常に高い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '設計見直しを強くお勧めします',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '🚨'
    };
  }
}

/**
 * 全体のBEI値に対するコメント生成
 * @param {number} bei - BEI値
 * @returns {object} - コメント情報
 */
export function analyzeBEI(bei) {
  if (bei <= 0.8) {
    return {
      level: 'excellent',
      comment: '非常に優秀な省エネ性能です',
      detail: 'ZEB Ready相当の高性能建築物です',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: '🌟'
    };
  } else if (bei <= 0.9) {
    return {
      level: 'very_good',
      comment: '優秀な省エネ性能です',
      detail: '基準を大幅に下回る高効率設計です',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '✨'
    };
  } else if (bei <= 1.0) {
    return {
      level: 'good',
      comment: '省エネ基準に適合します',
      detail: '法的要件を満たした良好な設計です',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '✅'
    };
  } else if (bei <= 1.2) {
    return {
      level: 'needs_improvement',
      comment: '省エネ基準に適合しません',
      detail: '設備効率の改善が必要です',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '⚠️'
    };
  } else {
    return {
      level: 'poor',
      comment: '省エネ基準に大きく適合しません',
      detail: '設計の抜本的な見直しが必要です',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: '🚨'
    };
  }
}

/**
 * エネルギー種別の日本語名を取得
 * @param {string} energyType - エネルギー種別
 * @returns {string} - 日本語名
 */
export function getEnergyTypeName(energyType) {
  const names = {
    heating: '暖房',
    cooling: '冷房',
    ventilation: '換気',
    hot_water: '給湯',
    lighting: '照明',
    elevator: '昇降機'
  };
  return names[energyType] || energyType;
}

/**
 * 改善提案を生成
 * @param {string} energyType - エネルギー種別
 * @param {string} level - 消費量レベル
 * @returns {array} - 改善提案リスト
 */
export function getImprovementSuggestions(energyType, level) {
  if (level === 'low' || level === 'very_low' || level === 'normal') {
    return [];
  }

  const suggestions = {
    heating: [
      '高効率ヒートポンプの導入',
      '建物外皮の断熱性能向上',
      '熱回収換気システムの採用',
      '床暖房システムの効率化'
    ],
    cooling: [
      '高効率空調機への更新',
      '遮熱性能の向上（窓・外壁）',
      '自然換気の活用',
      'デマンド制御システムの導入'
    ],
    ventilation: [
      '高効率換気ファンの採用',
      '熱交換換気システムの導入',
      'CO2センサーによる外気量制御',
      'ダクトレイアウトの最適化'
    ],
    hot_water: [
      '高効率給湯器への更新',
      '太陽熱温水システムの導入',
      '配管断熱の強化',
      '使用量に応じた容量最適化'
    ],
    lighting: [
      'LED照明への完全更新',
      '昼光利用システムの導入',
      '人感センサーの設置',
      'タスク・アンビエント照明の採用'
    ],
    elevator: [
      '回生電力システム搭載機種への更新',
      'インバータ制御の導入',
      'LED照明の採用',
      '待機電力の削減対策'
    ]
  };

  return suggestions[energyType] || [];
}