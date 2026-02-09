// frontend/src/utils/energyComparison.js
/**
 * エネルギー消費量比較分析ユーティリティ
 * 設計値と基準値を比較して、参考コメントを生成
 */

import { TYPICAL_ENERGY_VALUES, resolveTypeName } from './energyReferences';

/**
 * エネルギー消費量の比較分析を行う
 * @param {number} designValue - 設計値 (MJ/m2年)
 * @param {string} buildingType - 建物用途
 * @param {string} energyType - エネルギー種別 (heating, cooling, etc.)
 * @returns {object} - 分析結果
 */
export function analyzeEnergyConsumption(designValue, buildingType, energyType) {
  const mappedType = resolveTypeName(buildingType);
  const ranges = TYPICAL_ENERGY_VALUES[mappedType];

  if (!ranges || !ranges[energyType]) {
    return {
      level: 'normal',
      comment: '標準的な範囲内です',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      icon: null
    };
  }

  const { min: low, max: high, typical } = ranges[energyType];
  const ratio = designValue / typical;

  if (designValue < low * 0.8) {
    return {
      level: 'very_low',
      comment: `非常に低い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ性能が優秀です',
      color: 'text-accent-500',
      bgColor: 'bg-warm-50',
      icon: null
    };
  } else if (designValue < low) {
    return {
      level: 'low',
      comment: `低い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ設計が効いています',
      color: 'text-accent-500',
      bgColor: 'bg-warm-50',
      icon: null
    };
  } else if (designValue <= high) {
    if (designValue <= typical * 1.1) {
      return {
        level: 'normal',
        comment: `標準的な消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
        detail: '適切な範囲内です',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: null
      };
    } else {
      return {
        level: 'normal_high',
        comment: `やや高めの消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
        detail: '改善の余地があります',
        color: 'text-accent-600',
        bgColor: 'bg-accent-50',
        icon: null
      };
    }
  } else if (designValue <= high * 1.3) {
    return {
      level: 'high',
      comment: `高い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '省エネ対策の検討をお勧めします',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: null
    };
  } else {
    return {
      level: 'very_high',
      comment: `非常に高い消費量です（一般的な${typical}に対して${(ratio * 100).toFixed(0)}%）`,
      detail: '設計見直しを強くお勧めします',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: null
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
      color: 'text-accent-500',
      bgColor: 'bg-warm-50',
      icon: null
    };
  } else if (bei <= 0.9) {
    return {
      level: 'very_good',
      comment: '優秀な省エネ性能です',
      detail: '基準を大幅に下回る高効率設計です',
      color: 'text-accent-500',
      bgColor: 'bg-warm-50',
      icon: null
    };
  } else if (bei <= 1.0) {
    return {
      level: 'good',
      comment: '省エネ基準に適合します',
      detail: '法的要件を満たした良好な設計です',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: null
    };
  } else if (bei <= 1.2) {
    return {
      level: 'needs_improvement',
      comment: '省エネ基準に適合しません',
      detail: '設備効率の改善が必要です',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: null
    };
  } else {
    return {
      level: 'poor',
      comment: '省エネ基準に大きく適合しません',
      detail: '設計の抜本的な見直しが必要です',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: null
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
