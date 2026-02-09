// frontend/src/utils/equipmentReference.js
// 設備機器リファレンスデータ - BEI計算入力ガイダンス用

import { TYPICAL_ENERGY_VALUES, resolveTypeName } from './energyReferences.js';

/**
 * 各エネルギーカテゴリの設備機器情報・参考値
 * 建築設計実務で設計一次エネルギー消費量を入力する際の参考データ
 */
export const equipmentReference = {
  heating: {
    label: '暖房',
    overview: '暖房設備による一次エネルギー消費量。機器のCOP（成績係数）と暖房負荷から算出されます。',
    calculationMethod: '機器のCOP/効率 x 暖房負荷 x 一次エネルギー換算係数',
    equipment: [
      {
        name: 'パッケージエアコン（EHP）',
        description: '電気駆動ヒートポンプ。最も一般的な空調機器',
        copRange: '3.0 - 4.5',
        energyIntensity: { min: 30, max: 80, unit: 'MJ/m²年' },
        manufacturers: 'ダイキン、三菱電機、日立、パナソニック等',
        notes: '高効率インバータ制御機種を選定することでCOP向上'
      },
      {
        name: 'ガスヒートポンプ（GHP）',
        description: 'ガスエンジン駆動ヒートポンプ。電力ピークカットに有効',
        copRange: '1.5 - 2.5',
        energyIntensity: { min: 50, max: 120, unit: 'MJ/m²年' },
        manufacturers: 'ヤンマー、アイシン等',
        notes: 'ガスの一次エネルギー換算係数が異なるため注意'
      },
      {
        name: '中央熱源（チラー＋ボイラー）',
        description: '大規模建物向け中央式空調システム',
        copRange: '2.0 - 3.5',
        energyIntensity: { min: 40, max: 100, unit: 'MJ/m²年' },
        manufacturers: '荏原、三菱重工、日立等',
        notes: '搬送動力（ポンプ・ファン）も加算が必要'
      },
      {
        name: '電気ヒーター',
        description: '電気抵抗加熱。小規模補助暖房向け',
        copRange: '1.0',
        energyIntensity: { min: 100, max: 250, unit: 'MJ/m²年' },
        manufacturers: '各社',
        notes: 'COP=1.0のため一次エネルギー消費量が大きくなる'
      }
    ],
    documentSources: [
      '設備設計図の機器表（空調機器一覧）',
      'メーカーカタログのCOP値・APF値',
      '省エネ計算書の暖房一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '外皮性能（UA値）- 断熱性能が高いほど暖房負荷が減少',
      '地域区分 - 寒冷地ほど暖房負荷が増大',
      '運転時間・使用パターン - 事務所は日中、ホテルは24時間',
      '内部発熱 - 照明・OA機器等からの発熱で暖房負荷が減少'
    ]
  },

  cooling: {
    label: '冷房',
    overview: '冷房設備による一次エネルギー消費量。冷房は暖房と比べてCOPが高い傾向にあります。',
    calculationMethod: '機器のCOP/効率 x 冷房負荷 x 一次エネルギー換算係数',
    equipment: [
      {
        name: 'パッケージエアコン（EHP）',
        description: '電気駆動ヒートポンプ。冷房時のCOPは暖房より高い',
        copRange: '3.5 - 5.5',
        energyIntensity: { min: 25, max: 70, unit: 'MJ/m²年' },
        manufacturers: 'ダイキン、三菱電機、日立、パナソニック等',
        notes: 'APF（通年エネルギー消費効率）で評価するとより正確'
      },
      {
        name: 'ターボ冷凍機',
        description: '大規模建物向け高効率冷凍機。大容量で高COP',
        copRange: '5.0 - 6.5',
        energyIntensity: { min: 20, max: 50, unit: 'MJ/m²年' },
        manufacturers: '三菱重工、荏原、日立等',
        notes: '部分負荷特性が良好。インバータ機種はさらに高効率'
      },
      {
        name: '吸収式冷凍機',
        description: 'ガス焚き冷凍機。電力ピークカットに有効',
        copRange: '1.0 - 1.5',
        energyIntensity: { min: 50, max: 120, unit: 'MJ/m²年' },
        manufacturers: '川崎サーマル、荏原、日立等',
        notes: '二重効用型でCOP向上。ガスの一次エネルギー換算に注意'
      }
    ],
    documentSources: [
      '設備設計図の機器表（空調機器一覧）',
      'カタログの冷房能力とCOP値',
      '省エネ計算書の冷房一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '外皮性能（ηAC値）- 日射遮蔽性能が高いほど冷房負荷が減少',
      '地域区分 - 温暖地ほど冷房負荷が増大',
      '窓面積・方位 - 西面の大きな窓は冷房負荷を増大させる',
      '内部発熱 - 照明・OA機器・人体発熱の影響が大きい'
    ]
  },

  ventilation: {
    label: '換気',
    overview: '換気設備（送風機・排風機）の一次エネルギー消費量。全熱交換器の有無で大きく変わります。',
    calculationMethod: '送風機の消費電力 x 運転時間 x 一次エネルギー換算係数',
    equipment: [
      {
        name: '全熱交換器あり',
        description: '排気熱を回収して外気導入時の負荷を低減',
        copRange: '-',
        energyIntensity: { min: 20, max: 50, unit: 'MJ/m²年' },
        manufacturers: 'ダイキン、三菱電機、パナソニック等',
        notes: '暖房・冷房負荷も同時に大幅削減。効率60-80%の機種が一般的'
      },
      {
        name: '全熱交換器なし（一般換気）',
        description: '単純給排気方式。外気をそのまま導入',
        copRange: '-',
        energyIntensity: { min: 40, max: 80, unit: 'MJ/m²年' },
        manufacturers: '各社',
        notes: '外気負荷が直接空調負荷に加算される'
      },
      {
        name: '高効率モーター（IE3以上）',
        description: 'プレミアム効率モーター搭載の送風機',
        copRange: '-',
        energyIntensity: { min: 18, max: 45, unit: 'MJ/m²年' },
        manufacturers: '各モーターメーカー',
        notes: '従来モーターに比べ10-15%の消費電力削減が可能'
      }
    ],
    documentSources: [
      '換気設計図（換気系統図）',
      '風量計算書',
      '送風機の消費電力（銘板値またはカタログ値）',
      '省エネ計算書の換気一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '換気量（必要外気量）- 用途・在室人数で決定',
      '全熱交換器の有無と効率 - 導入で大幅な省エネ効果',
      'ダクト系の圧力損失 - 設計圧力損失が大きいと消費電力増大',
      '送風機のモーター効率 - IE3以上で10-15%削減'
    ]
  },

  hot_water: {
    label: '給湯',
    overview: '給湯設備の一次エネルギー消費量。建物用途によって給湯量が大きく異なります。',
    calculationMethod: '給湯負荷 / 機器効率 x 一次エネルギー換算係数',
    equipment: [
      {
        name: 'ヒートポンプ給湯機（エコキュート）',
        description: '電気式ヒートポンプ給湯。高効率で省エネ性能が高い',
        copRange: '3.0 - 4.0',
        energyIntensity: { min: 3, max: 8, unit: 'MJ/m²年' },
        manufacturers: 'ダイキン、三菱電機、パナソニック、コロナ等',
        notes: '事務所用途ではCOP3.0以上が一般的。寒冷地ではCOP低下に注意'
      },
      {
        name: 'ガス給湯器（潜熱回収型）',
        description: 'エコジョーズ等の高効率ガス給湯器',
        copRange: '効率 95%',
        energyIntensity: { min: 5, max: 15, unit: 'MJ/m²年' },
        manufacturers: 'リンナイ、ノーリツ、パロマ等',
        notes: '潜熱回収で従来型（80%）より大幅に効率向上'
      },
      {
        name: '電気温水器',
        description: '電気抵抗加熱式の温水器。シンプルだが効率は低い',
        copRange: '効率 90%',
        energyIntensity: { min: 10, max: 25, unit: 'MJ/m²年' },
        manufacturers: '各社',
        notes: '一次エネルギー消費量が大きい。可能ならヒートポンプへの切替を推奨'
      }
    ],
    documentSources: [
      '給湯設備設計図',
      '給湯負荷計算書',
      '機器カタログの給湯効率・COP',
      '省エネ計算書の給湯一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '建物用途 - 事務所は給湯量少ない、ホテル・病院は多い',
      '給湯温度 - 用途に応じた設定温度で負荷が変動',
      '配管長・保温 - 長い配管は熱損失が増大',
      '使用人数・使用量 - 在室人数に比例して増加'
    ],
    buildingTypeNotes: {
      office: '事務所は手洗い・湯沸かし程度。給湯量は少ない',
      hotel: 'ホテルは客室シャワー・浴室で給湯量が非常に多い',
      hospital: '病院は入浴・給湯・滅菌等で給湯量が多い',
      restaurant: '飲食店は厨房での大量給湯。給湯負荷が最も大きい用途の一つ',
      school: '学校はプール加温がある場合は給湯量が増大'
    }
  },

  lighting: {
    label: '照明',
    overview: '照明設備の一次エネルギー消費量。LED化と照明制御で大幅な省エネが可能です。',
    calculationMethod: '照明密度(W/m²) x 点灯時間 x 一次エネルギー換算係数',
    equipment: [
      {
        name: 'LED照明',
        description: '現在の主流。高効率で長寿命',
        copRange: '5 - 8 W/m²',
        energyIntensity: { min: 50, max: 90, unit: 'MJ/m²年' },
        manufacturers: 'パナソニック、東芝、コイズミ、大光電機等',
        notes: '照明器具の固有エネルギー消費効率(lm/W)が重要。100 lm/W以上が高効率'
      },
      {
        name: 'Hf蛍光灯',
        description: '高周波点灯方式の蛍光灯。LEDの前世代',
        copRange: '8 - 12 W/m²',
        energyIntensity: { min: 80, max: 130, unit: 'MJ/m²年' },
        manufacturers: 'パナソニック、東芝等',
        notes: 'LED照明への更新でエネルギー消費量を40-50%削減可能'
      },
      {
        name: '照明制御（調光・人感センサー）',
        description: '在室検知や昼光連動で不要な点灯を削減',
        copRange: '-',
        energyIntensity: { min: 0, max: 0, unit: '（削減率）' },
        manufacturers: '各照明メーカー、制御メーカー',
        notes: '調光制御で20-30%削減。人感センサーでさらに10-15%削減'
      },
      {
        name: '昼光利用制御',
        description: '窓際の自然光を利用して照明を自動減光',
        copRange: '-',
        energyIntensity: { min: 0, max: 0, unit: '（削減率）' },
        manufacturers: '各照明メーカー',
        notes: '窓際ゾーンで10-20%の照明エネルギー削減が可能'
      }
    ],
    documentSources: [
      '照明設計図（照明器具配置図）',
      '照度計算書',
      '照明器具の消費電力（器具リスト）',
      '省エネ計算書の照明一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '照明器具の種類と効率 - LED化で大幅削減',
      '必要照度 - JIS基準の推奨照度は用途ごとに異なる',
      '照明制御方式 - 調光・人感センサー・タイマーで削減',
      '昼光利用 - 窓面積・方位・ライトシェルフ等で活用度が変わる'
    ]
  },

  elevator: {
    label: '昇降機',
    overview: 'エレベーター・エスカレーターの一次エネルギー消費量。階数と利用頻度に依存します。',
    calculationMethod: '定格出力 x 運転時間 x 負荷率 x 一次エネルギー換算係数',
    equipment: [
      {
        name: '標準型エレベーター',
        description: '一般的なロープ式またはギヤレス式エレベーター',
        copRange: '-',
        energyIntensity: { min: 10, max: 20, unit: 'MJ/m²年' },
        manufacturers: '三菱電機、日立、東芝、フジテック、OTIS等',
        notes: '速度・積載量・台数で消費電力が変動'
      },
      {
        name: '回生電力型エレベーター',
        description: '下降時のエネルギーを電力として回収する省エネ型',
        copRange: '-',
        energyIntensity: { min: 8, max: 15, unit: 'MJ/m²年' },
        manufacturers: '三菱電機、日立、東芝等',
        notes: '標準型に比べ15-25%の省エネ効果。超高層建物で効果大'
      },
      {
        name: '低層建物（3階以下）',
        description: 'エレベーター不要の場合',
        copRange: '-',
        energyIntensity: { min: 0, max: 0, unit: 'MJ/m²年' },
        manufacturers: '-',
        notes: '3階以下の建物でエレベーターがない場合は0を入力'
      }
    ],
    documentSources: [
      '昇降機メーカーの仕様書',
      '年間消費電力量の見積もり（メーカー提出資料）',
      '省エネ計算書の昇降機一次エネルギー消費量欄'
    ],
    influencingFactors: [
      '建物階数 - 高層ほど消費量が増大',
      '利用頻度（交通量計算）- 用途・在館人数で変動',
      'エレベーター台数 - 台数に比例',
      '速度・積載量 - 高速・大容量ほど消費電力が大きい'
    ]
  }
};

/**
 * 建物用途別の代表的なエネルギー消費量目安 (MJ/m²年)
 * 入力ガイダンスで「この建物用途なら大体このくらい」を表示するために使用。
 * 判定ロジック側（energyComparison）と同じ基準値を参照し、不整合を防ぐ。
 */
const GUIDANCE_LABELS = {
  office: '事務所',
  hotel: 'ホテル',
  hospital: '病院',
  shop_department: '百貨店',
  shop_supermarket: 'スーパーマーケット',
  school_small: '小学校',
  school_high: '中高校',
  school_university: '大学',
  restaurant: '飲食店',
  assembly: '集会所',
  factory: '工場',
  residential_collective: '共同住宅'
};

const GUIDANCE_TYPES = Object.keys(GUIDANCE_LABELS);
const toRangeText = (range) => `${range.min} - ${range.max}`;

export const typicalEnergyByBuildingType = GUIDANCE_TYPES.reduce((acc, buildingType) => {
  const normalizedType = resolveTypeName(buildingType);
  const source = TYPICAL_ENERGY_VALUES[normalizedType] || TYPICAL_ENERGY_VALUES.offices;

  acc[buildingType] = {
    label: GUIDANCE_LABELS[buildingType],
    heating: { typical: source.heating.typical, range: toRangeText(source.heating) },
    cooling: { typical: source.cooling.typical, range: toRangeText(source.cooling) },
    ventilation: { typical: source.ventilation.typical, range: toRangeText(source.ventilation) },
    hot_water: { typical: source.hot_water.typical, range: toRangeText(source.hot_water) },
    lighting: { typical: source.lighting.typical, range: toRangeText(source.lighting) },
    elevator: { typical: source.elevator.typical, range: toRangeText(source.elevator) }
  };
  return acc;
}, {});

/**
 * カテゴリに対応する設備リファレンスデータを取得
 * @param {string} category - 'heating'|'cooling'|'ventilation'|'hot_water'|'lighting'|'elevator'
 * @returns {object|null} 設備リファレンスデータ
 */
export const getEquipmentReference = (category) => {
  return equipmentReference[category] || null;
};

/**
 * 建物用途とカテゴリに対応する代表値を取得
 * @param {string} buildingType - 建物用途キー
 * @param {string} category - エネルギーカテゴリキー
 * @returns {object|null} { typical, range }
 */
export const getTypicalEnergy = (buildingType, category) => {
  const buildingData = typicalEnergyByBuildingType[buildingType];
  if (!buildingData || !buildingData[category]) return null;
  return buildingData[category];
};

/**
 * MJ/m²年の値を総量MJ/年に換算（参考表示用）
 * @param {number} intensityValue - MJ/m²年
 * @param {number} floorArea - 延床面積 m²
 * @returns {number} MJ/年
 */
export const intensityToTotal = (intensityValue, floorArea) => {
  if (!intensityValue || !floorArea) return 0;
  return Math.round(intensityValue * floorArea);
};

/**
 * 総量MJ/年をMJ/m²年に換算
 * @param {number} totalValue - MJ/年
 * @param {number} floorArea - 延床面積 m²
 * @returns {number} MJ/m²年
 */
export const totalToIntensity = (totalValue, floorArea) => {
  if (!totalValue || !floorArea || floorArea <= 0) return 0;
  return parseFloat((totalValue / floorArea).toFixed(1));
};
