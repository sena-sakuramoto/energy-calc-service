// frontend/src/components/InputGuidance.jsx
// 設計一次エネルギー消費量の入力ガイダンスパネル
// 各エネルギーカテゴリの設備情報・参考値を表示する折りたたみ式パネル

import { useState } from 'react';
import { FaInfoCircle, FaChevronDown, FaChevronUp, FaClipboardList, FaWrench, FaSearch, FaSlidersH } from 'react-icons/fa';
import {
  getEquipmentReference,
  getTypicalEnergy,
  intensityToTotal,
  typicalEnergyByBuildingType
} from '../utils/equipmentReference';

/**
 * InputGuidance - エネルギー入力フィールド用の折りたたみ式ガイダンスパネル
 *
 * @param {string} category - エネルギーカテゴリ: 'heating'|'cooling'|'ventilation'|'hot_water'|'lighting'|'elevator'
 * @param {string} buildingType - 建物用途キー: 'office'|'hotel' 等
 * @param {string|number} floorArea - 延床面積 (m²)
 */
export default function InputGuidance({ category, buildingType, floorArea }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const reference = getEquipmentReference(category);
  if (!reference) return null;

  const typicalEnergy = buildingType ? getTypicalEnergy(buildingType, category) : null;
  const buildingLabel = buildingType && typicalEnergyByBuildingType[buildingType]
    ? typicalEnergyByBuildingType[buildingType].label
    : null;
  const parsedFloorArea = parseFloat(floorArea) || 0;

  return (
    <div className="relative inline-block ml-1">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center text-xs font-medium rounded-md px-1.5 py-0.5 transition-all duration-200 ${
          isExpanded
            ? 'bg-accent-100 text-accent-700 ring-1 ring-accent-300'
            : 'text-primary-400 hover:text-accent-600 hover:bg-warm-100'
        }`}
        title={`${reference.label}の入力ガイダンスを表示`}
      >
        <FaInfoCircle className="text-xs" />
        <span className="ml-1 hidden sm:inline">参考</span>
      </button>

      {/* 展開パネル */}
      {isExpanded && (
        <div className="absolute left-0 top-full mt-1 z-40 w-[340px] sm:w-[400px] max-h-[480px] overflow-y-auto bg-warm-50 border border-primary-200 rounded-lg shadow-xl">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-warm-50 border-b border-primary-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaInfoCircle className="text-accent-600 text-sm" />
              <h4 className="font-semibold text-primary-800 text-sm">
                {reference.label} -- 入力ガイダンス
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-primary-400 hover:text-primary-600 p-1 rounded transition-colors"
            >
              <FaChevronUp className="text-xs" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-3">
            {/* 概要 */}
            <div className="text-xs text-primary-700 leading-relaxed">
              {reference.overview}
            </div>

            {/* 建物用途別の目安値（選択済みの場合） */}
            {typicalEnergy && buildingLabel && (
              <div className="bg-accent-50 border border-accent-200 rounded-md px-3 py-2">
                <div className="text-xs font-semibold text-accent-700 mb-1">
                  {buildingLabel}の目安値
                </div>
                <div className="flex items-baseline space-x-3">
                  <span className="text-lg font-bold text-accent-800">
                    {typicalEnergy.range}
                  </span>
                  <span className="text-xs text-accent-600">MJ/m²年</span>
                </div>
                <div className="text-xs text-accent-600 mt-1">
                  代表値: {typicalEnergy.typical} MJ/m²年
                  {parsedFloorArea > 0 && (
                    <span className="ml-2">
                      (総量換算: 約 {intensityToTotal(typicalEnergy.typical, parsedFloorArea).toLocaleString()} MJ/年)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 算出方法 */}
            {reference.calculationMethod && (
              <div className="bg-white border border-primary-100 rounded-md px-3 py-2">
                <div className="flex items-center space-x-1 mb-1">
                  <FaSlidersH className="text-primary-500 text-xs" />
                  <span className="text-xs font-semibold text-primary-700">算出方法</span>
                </div>
                <div className="text-xs text-primary-600 font-mono">
                  {reference.calculationMethod}
                </div>
              </div>
            )}

            {/* 設備機器例 */}
            <div>
              <div className="flex items-center space-x-1 mb-2">
                <FaWrench className="text-primary-500 text-xs" />
                <span className="text-xs font-semibold text-primary-700">主な設備機器と参考値</span>
              </div>
              <div className="space-y-2">
                {reference.equipment.map((eq, idx) => (
                  <EquipmentCard
                    key={idx}
                    equipment={eq}
                    floorArea={parsedFloorArea}
                  />
                ))}
              </div>
            </div>

            {/* 確認場所 */}
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <FaSearch className="text-primary-500 text-xs" />
                <span className="text-xs font-semibold text-primary-700">値の確認場所</span>
              </div>
              <ul className="space-y-0.5">
                {reference.documentSources.map((source, idx) => (
                  <li key={idx} className="text-xs text-primary-600 flex items-start">
                    <span className="text-primary-400 mr-1.5 mt-0.5 flex-shrink-0">-</span>
                    <span>{source}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 影響要因 */}
            <div>
              <div className="flex items-center space-x-1 mb-1">
                <FaClipboardList className="text-primary-500 text-xs" />
                <span className="text-xs font-semibold text-primary-700">値に影響する主な要因</span>
              </div>
              <ul className="space-y-0.5">
                {reference.influencingFactors.map((factor, idx) => (
                  <li key={idx} className="text-xs text-primary-600 flex items-start">
                    <span className="text-primary-400 mr-1.5 mt-0.5 flex-shrink-0">-</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 建物用途別の特記（給湯の場合のみ） */}
            {reference.buildingTypeNotes && buildingType && reference.buildingTypeNotes[buildingType] && (
              <div className="bg-warm-100 border border-primary-200 rounded-md px-3 py-2">
                <div className="text-xs font-semibold text-primary-700 mb-1">
                  {buildingLabel}での特記事項
                </div>
                <div className="text-xs text-primary-600">
                  {reference.buildingTypeNotes[buildingType]}
                </div>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="border-t border-primary-200 px-4 py-2 bg-warm-50 rounded-b-lg">
            <div className="text-[10px] text-primary-400 leading-relaxed">
              ※ 上記の値は一般的な目安です。実際の値は設備仕様・運用条件により異なります。
              正式な省エネ計算には、設備設計図書の値を使用してください。
            </div>
          </div>
        </div>
      )}

      {/* オーバーレイ（パネル外クリックで閉じる） */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

/**
 * EquipmentCard - 個別の設備機器情報カード
 */
function EquipmentCard({ equipment, floorArea }) {
  const [showDetail, setShowDetail] = useState(false);
  const hasIntensity = equipment.energyIntensity.min > 0 || equipment.energyIntensity.max > 0;

  return (
    <div className="bg-white border border-primary-100 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className="w-full text-left px-3 py-2 hover:bg-warm-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-primary-800 truncate">
              {equipment.name}
            </div>
            {hasIntensity && (
              <div className="flex items-center space-x-2 mt-0.5">
                {equipment.copRange !== '-' && (
                  <span className="text-[10px] text-primary-500">
                    COP/効率: {equipment.copRange}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-accent-600">
                  {equipment.energyIntensity.min}-{equipment.energyIntensity.max} {equipment.energyIntensity.unit}
                </span>
              </div>
            )}
          </div>
          <FaChevronDown className={`text-primary-300 text-[10px] ml-2 transition-transform flex-shrink-0 ${showDetail ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {showDetail && (
        <div className="px-3 pb-2 border-t border-primary-50 pt-2 space-y-1">
          <div className="text-[10px] text-primary-600">
            {equipment.description}
          </div>
          {equipment.notes && (
            <div className="text-[10px] text-accent-600">
              {equipment.notes}
            </div>
          )}
          {equipment.manufacturers && equipment.manufacturers !== '-' && (
            <div className="text-[10px] text-primary-400">
              主なメーカー: {equipment.manufacturers}
            </div>
          )}
          {hasIntensity && floorArea > 0 && (
            <div className="text-[10px] text-primary-500 bg-warm-50 rounded px-2 py-1 mt-1">
              延床 {floorArea.toLocaleString()}m² の場合: 約{' '}
              {(equipment.energyIntensity.min * floorArea).toLocaleString()} - {(equipment.energyIntensity.max * floorArea).toLocaleString()} MJ/年
            </div>
          )}
        </div>
      )}
    </div>
  );
}
