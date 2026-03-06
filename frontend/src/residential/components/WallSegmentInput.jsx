import { useMemo, useState } from 'react';

import { calcEnvelopeAreasFromSegments } from '../engine/calcAreas';
import { ORIENTATIONS } from '../engine/types';
import { MATERIAL_CONDUCTIVITY } from '../engine/tables/materialConductivity';

const ORIENTATION_LABELS = {
  N: '北', NE: '北東', E: '東', SE: '南東',
  S: '南', SW: '南西', W: '西', NW: '北西',
};

const ORIENTATION_COLORS = {
  N: 'bg-blue-100 text-blue-800',
  NE: 'bg-indigo-100 text-indigo-800',
  E: 'bg-emerald-100 text-emerald-800',
  SE: 'bg-teal-100 text-teal-800',
  S: 'bg-amber-100 text-amber-800',
  SW: 'bg-orange-100 text-orange-800',
  W: 'bg-rose-100 text-rose-800',
  NW: 'bg-purple-100 text-purple-800',
};

const ADJ_OPTIONS = [
  { value: 'exterior', label: '外気' },
  { value: 'ground', label: '地盤' },
  { value: 'unheated_space', label: '非空調' },
  { value: 'underfloor', label: '床下' },
];

const MATERIAL_OPTIONS = Object.keys(MATERIAL_CONDUCTIVITY).map((key) => ({ value: key, label: key }));

function createWall(orientation) {
  return {
    id: `wall_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    orientation,
    input_method: 'dimensions',
    width: 8.0,
    height: 2.7,
    area_gross: undefined,
    insulation_type: 'hgw16k',
    insulation_thickness: 105,
    u_value: undefined,
    adjacency: 'exterior',
  };
}

function calcGross(wall) {
  if (wall.input_method === 'direct_area') return Number(wall.area_gross || 0);
  return Number(wall.width || 0) * Number(wall.height || 0);
}

function WallCard({ wall, isExpanded, onToggle, onUpdate, onRemove }) {
  const area = calcGross(wall);
  const orientLabel = ORIENTATION_LABELS[wall.orientation] || wall.orientation;
  const orientColor = ORIENTATION_COLORS[wall.orientation] || 'bg-gray-100 text-gray-800';
  const adjacencyLabel = ADJ_OPTIONS.find((o) => o.value === wall.adjacency)?.label || wall.adjacency;

  return (
    <div className="border border-warm-200 rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-warm-50 text-left"
        onClick={onToggle}
      >
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${orientColor}`}>
          {orientLabel}
        </span>

        <span className="text-sm font-medium text-primary-800 min-w-[5rem]">
          {area.toFixed(1)} m²
        </span>

        <span className="text-xs text-primary-500 flex-1">
          {wall.insulation_type} {Number(wall.insulation_thickness || 0)}mm
          {wall.u_value != null ? ` (U=${wall.u_value})` : ''}
          {wall.adjacency !== 'exterior' ? ` [${adjacencyLabel}]` : ''}
        </span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-primary-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-warm-100 bg-warm-50 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs">
              幅 (m)
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={wall.width ?? ''}
                onChange={(e) => onUpdate({ width: Number(e.target.value || 0), input_method: 'dimensions' })}
              />
            </label>
            <label className="text-xs">
              高さ (m)
              <input
                type="number"
                step="0.01"
                className="input-field mt-1"
                value={wall.height ?? ''}
                onChange={(e) => onUpdate({ height: Number(e.target.value || 0), input_method: 'dimensions' })}
              />
            </label>
            <div className="text-xs flex items-end pb-2 text-primary-600">
              = {area.toFixed(2)} m²
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs">
              断熱材
              <select
                className="input-field mt-1"
                value={wall.insulation_type || 'hgw16k'}
                onChange={(e) => onUpdate({ insulation_type: e.target.value })}
              >
                {MATERIAL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </label>
            <label className="text-xs">
              厚み (mm)
              <input
                type="number"
                className="input-field mt-1"
                value={wall.insulation_thickness ?? 105}
                onChange={(e) => onUpdate({ insulation_thickness: Number(e.target.value || 0) })}
              />
            </label>
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-primary-500 hover:text-primary-700">詳細設定</summary>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <label>
                方位
                <select
                  className="input-field mt-1"
                  value={wall.orientation}
                  onChange={(e) => onUpdate({ orientation: e.target.value })}
                >
                  {ORIENTATIONS.map((o) => <option key={o} value={o}>{ORIENTATION_LABELS[o] || o}</option>)}
                </select>
              </label>
              <label>
                入力方式
                <select
                  className="input-field mt-1"
                  value={wall.input_method || 'dimensions'}
                  onChange={(e) => onUpdate({ input_method: e.target.value })}
                >
                  <option value="dimensions">寸法入力</option>
                  <option value="direct_area">面積直接</option>
                </select>
              </label>
              <label>
                隣接条件
                <select
                  className="input-field mt-1"
                  value={wall.adjacency || 'exterior'}
                  onChange={(e) => onUpdate({ adjacency: e.target.value })}
                >
                  {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              <label>
                U値 (上書き)
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={wall.u_value ?? ''}
                  onChange={(e) => onUpdate({ u_value: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
              </label>
              {wall.input_method === 'direct_area' && (
                <label className="md:col-span-2">
                  面積 (m²)
                  <input
                    type="number"
                    step="0.01"
                    className="input-field mt-1"
                    value={wall.area_gross ?? ''}
                    onChange={(e) => onUpdate({ area_gross: Number(e.target.value || 0) })}
                  />
                </label>
              )}
            </div>
          </details>

          <div className="flex justify-end">
            <button type="button" className="text-xs text-red-500 hover:text-red-700" onClick={onRemove}>
              この壁を削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WallSegmentInput({ walls, openings, onChange }) {
  const [expandedId, setExpandedId] = useState(null);

  const safeWalls = Array.isArray(walls) ? walls : [];
  const safeOpenings = Array.isArray(openings) ? openings : [];

  const areaSummary = useMemo(
    () => calcEnvelopeAreasFromSegments({ walls: safeWalls, openings: safeOpenings }),
    [safeWalls, safeOpenings],
  );

  const updateWall = (id, patch) => {
    onChange(safeWalls.map((wall) => (wall.id === id ? { ...wall, ...patch } : wall)));
  };

  const removeWall = (id) => {
    onChange(safeWalls.filter((wall) => wall.id !== id));
  };

  const addWall = () => {
    const newWall = createWall('N');
    onChange([...safeWalls, newWall]);
    setExpandedId(newWall.id);
  };

  const sortedWalls = [...safeWalls].sort((a, b) => {
    const aIndex = ORIENTATIONS.indexOf(a.orientation);
    const bIndex = ORIENTATIONS.indexOf(b.orientation);
    const safeAIndex = aIndex === -1 ? ORIENTATIONS.length : aIndex;
    const safeBIndex = bIndex === -1 ? ORIENTATIONS.length : bIndex;
    return safeAIndex - safeBIndex;
  });

  const totalGross = areaSummary.gross_total || 0;
  const totalOpenings = areaSummary.opening_total || 0;
  const totalNet = areaSummary.net_total || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between bg-warm-50 border border-warm-200 rounded-xl px-4 py-2">
        <div className="text-sm text-primary-700">
          外壁 {totalGross.toFixed(1)}m² − 窓 {totalOpenings.toFixed(1)}m² = <span className="font-bold">NET {totalNet.toFixed(1)}m²</span>
        </div>
        <div className="text-xs text-primary-500">{safeWalls.length} セグメント</div>
      </div>

      <div className="space-y-2">
        {sortedWalls.map((wall) => (
          <WallCard
            key={wall.id}
            wall={wall}
            isExpanded={expandedId === wall.id}
            onToggle={() => setExpandedId(expandedId === wall.id ? null : wall.id)}
            onUpdate={(patch) => updateWall(wall.id, patch)}
            onRemove={() => {
              removeWall(wall.id);
              if (expandedId === wall.id) setExpandedId(null);
            }}
          />
        ))}
      </div>

      {safeWalls.length === 0 && (
        <div className="text-sm text-primary-400 bg-white border border-dashed border-warm-300 rounded-xl p-6">
          壁セグメントは未登録です。
        </div>
      )}

      <button type="button" className="btn-outline text-sm py-2 px-4 w-full" onClick={addWall}>
        + 壁セグメントを追加
      </button>
    </div>
  );
}
