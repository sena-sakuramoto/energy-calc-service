// frontend/src/utils/energyReferences.js
// 建物用途別エネルギー参照データ - 単一ソース・オブ・トゥルース
// inputValidation.js, energyComparison.js 等から参照される

/**
 * 建物用途キーの正規化マッピング
 * あらゆるキー表現を正規キー（複数形）に変換する
 */
export const BUILDING_TYPE_MAP = {
  // 単数形 → 正規キー
  'office': 'offices',
  'hotel': 'hotels',
  'hospital': 'hospitals',
  'shop': 'shops',
  'shop_department': 'department_stores',
  'shop_supermarket': 'department_stores',
  'school': 'schools',
  'school_small': 'schools',
  'school_high': 'schools',
  'school_university': 'schools',
  'restaurant': 'restaurants',
  'assembly': 'assembly_halls',
  'assembly_hall': 'assembly_halls',
  'factory': 'factories',
  'residential_collective': 'offices',
  // 複数形 → 正規キー (恒等写像)
  'offices': 'offices',
  'hotels': 'hotels',
  'hospitals': 'hospitals',
  'shops': 'shops',
  'department_stores': 'department_stores',
  'schools': 'schools',
  'restaurants': 'restaurants',
  'assembly_halls': 'assembly_halls',
  'factories': 'factories',
  // その他のマッピング
  'warehouses': 'offices',
  'gyms': 'assembly_halls',
  'libraries': 'schools',
  'museums': 'assembly_halls',
};

/**
 * 建物用途別の一般的なエネルギー消費量範囲 (MJ/m2年)
 * 検証と分析の両方で使用される唯一の定義
 *
 * 各項目:
 *   min  - 一般的な下限値 (inputValidation での low 境界)
 *   max  - 一般的な上限値 (inputValidation での high 境界)
 *   typical - 代表値
 */
export const TYPICAL_ENERGY_VALUES = {
  // 事務所等
  offices: {
    heating:     { min: 80,  max: 150, typical: 115 },
    cooling:     { min: 60,  max: 120, typical: 90  },
    ventilation: { min: 40,  max: 80,  typical: 60  },
    hot_water:   { min: 5,   max: 20,  typical: 12  },
    lighting:    { min: 80,  max: 140, typical: 110 },
    elevator:    { min: 15,  max: 30,  typical: 22  },
  },
  // 病院等
  hospitals: {
    heating:     { min: 200, max: 350, typical: 275 },
    cooling:     { min: 150, max: 250, typical: 200 },
    ventilation: { min: 100, max: 180, typical: 140 },
    hot_water:   { min: 80,  max: 150, typical: 115 },
    lighting:    { min: 100, max: 160, typical: 130 },
    elevator:    { min: 10,  max: 25,  typical: 17  },
  },
  // ホテル等
  hotels: {
    heating:     { min: 150, max: 250, typical: 200 },
    cooling:     { min: 120, max: 200, typical: 160 },
    ventilation: { min: 80,  max: 140, typical: 110 },
    hot_water:   { min: 100, max: 180, typical: 140 },
    lighting:    { min: 80,  max: 130, typical: 105 },
    elevator:    { min: 15,  max: 30,  typical: 22  },
  },
  // 百貨店等
  department_stores: {
    heating:     { min: 100, max: 180, typical: 140 },
    cooling:     { min: 80,  max: 140, typical: 110 },
    ventilation: { min: 60,  max: 100, typical: 80  },
    hot_water:   { min: 5,   max: 15,  typical: 10  },
    lighting:    { min: 120, max: 200, typical: 160 },
    elevator:    { min: 20,  max: 40,  typical: 30  },
  },
  // 学校等
  schools: {
    heating:     { min: 120, max: 200, typical: 160 },
    cooling:     { min: 60,  max: 120, typical: 90  },
    ventilation: { min: 40,  max: 80,  typical: 60  },
    hot_water:   { min: 10,  max: 30,  typical: 20  },
    lighting:    { min: 80,  max: 130, typical: 105 },
    elevator:    { min: 5,   max: 15,  typical: 10  },
  },
  // 飲食店等
  restaurants: {
    heating:     { min: 150, max: 250, typical: 200 },
    cooling:     { min: 120, max: 200, typical: 160 },
    ventilation: { min: 200, max: 350, typical: 275 },
    hot_water:   { min: 100, max: 200, typical: 150 },
    lighting:    { min: 100, max: 160, typical: 130 },
    elevator:    { min: 10,  max: 25,  typical: 17  },
  },
  // 集会所等
  assembly_halls: {
    heating:     { min: 100, max: 180, typical: 140 },
    cooling:     { min: 80,  max: 140, typical: 110 },
    ventilation: { min: 60,  max: 100, typical: 80  },
    hot_water:   { min: 5,   max: 20,  typical: 12  },
    lighting:    { min: 80,  max: 140, typical: 110 },
    elevator:    { min: 10,  max: 25,  typical: 17  },
  },
  // 工場等 (事務所と同等の参考値)
  factories: {
    heating:     { min: 80,  max: 150, typical: 115 },
    cooling:     { min: 60,  max: 120, typical: 90  },
    ventilation: { min: 40,  max: 80,  typical: 60  },
    hot_water:   { min: 5,   max: 20,  typical: 12  },
    lighting:    { min: 80,  max: 140, typical: 110 },
    elevator:    { min: 15,  max: 30,  typical: 22  },
  },
  // 物販店等
  shops: {
    heating:     { min: 100, max: 180, typical: 140 },
    cooling:     { min: 80,  max: 140, typical: 110 },
    ventilation: { min: 60,  max: 100, typical: 80  },
    hot_water:   { min: 5,   max: 15,  typical: 10  },
    lighting:    { min: 120, max: 200, typical: 160 },
    elevator:    { min: 20,  max: 40,  typical: 30  },
  },
};

/**
 * 建物用途の日本語ラベル
 */
export const BUILDING_TYPE_LABELS = {
  'offices': '事務所',
  'hotels': 'ホテル',
  'hospitals': '病院',
  'shops': '物販店',
  'department_stores': '百貨店',
  'schools': '学校',
  'restaurants': '飲食店',
  'assembly_halls': '集会所',
  'factories': '工場',
};

/**
 * 任意の建物用途キーを正規キーに解決する
 * マッピングに存在しないキーの場合は 'offices' にフォールバック
 * @param {string} typeKey - 建物用途キー
 * @returns {string} 正規化された建物用途キー
 */
export function resolveTypeName(typeKey) {
  return BUILDING_TYPE_MAP[typeKey] || 'offices';
}
