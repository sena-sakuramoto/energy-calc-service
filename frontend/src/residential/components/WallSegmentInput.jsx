import { useMemo, useState } from 'react';

import { calcEnvelopeAreasFromSegments } from '../engine/calcAreas';
import { ORIENTATIONS } from '../engine/types';
import { MATERIAL_CONDUCTIVITY } from '../engine/tables/materialConductivity';

const ORIENTATION_LABELS = {
  N: '北', NE: '北東', E: '東', SE: '南東',
  S: '南', SW: '南西', W: '西', NW: '北西',
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

export default function WallSegmentInput({ walls, openings, onChange }) {
  const [activeOrientation, setActiveOrientation] = useState('N');

  const safeWalls = Array.isArray(walls) ? walls : [];
  const safeOpenings = Array.isArray(openings) ? openings : [];

  const areaSummary = useMemo(
    () => calcEnvelopeAreasFromSegments({ walls: safeWalls, openings: safeOpenings }),
    [safeWalls, safeOpenings],
  );

  const selectedWalls = safeWalls.filter((wall) => wall.orientation === activeOrientation);

  const updateWall = (id, patch) => {
    onChange(safeWalls.map((wall) => (wall.id === id ? { ...wall, ...patch } : wall)));
  };

  const removeWall = (id) => {
    onChange(safeWalls.filter((wall) => wall.id !== id));
  };

  const addWall = (orientation) => {
    onChange([...safeWalls, createWall(orientation)]);
  };

  const currentSummary = areaSummary.by_orientation?.[activeOrientation] || { gross: 0, openings: 0, net: 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ORIENTATIONS.map((orientation) => (
          <button
            key={orientation}
            type="button"
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${activeOrientation === orientation ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-primary-700 border-warm-200 hover:border-primary-300'}`}
            onClick={() => setActiveOrientation(orientation)}
          >
            {ORIENTATION_LABELS[orientation] || orientation}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {selectedWalls.map((wall, idx) => (
          <div key={wall.id} className="bg-white border border-warm-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-primary-700">壁{idx + 1}</div>
              <button type="button" className="text-red-600 hover:text-red-800" onClick={() => removeWall(wall.id)}>× 削除</button>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <label className="text-xs md:text-sm">
                入力方式
                <select
                  className="input-field mt-1"
                  value={wall.input_method}
                  onChange={(e) => updateWall(wall.id, { input_method: e.target.value })}
                >
                  <option value="dimensions">寸法入力</option>
                  <option value="direct_area">面積直接</option>
                </select>
              </label>

              {wall.input_method === 'dimensions' ? (
                <>
                  <label className="text-xs md:text-sm">
                    幅 (m)
                    <input
                      type="number"
                      step="0.01"
                      className="input-field mt-1"
                      value={wall.width ?? ''}
                      onChange={(e) => updateWall(wall.id, { width: Number(e.target.value || 0) })}
                    />
                  </label>
                  <label className="text-xs md:text-sm">
                    高さ (m)
                    <input
                      type="number"
                      step="0.01"
                      className="input-field mt-1"
                      value={wall.height ?? ''}
                      onChange={(e) => updateWall(wall.id, { height: Number(e.target.value || 0) })}
                    />
                  </label>
                  <div className="text-xs md:text-sm text-primary-600 flex items-end">
                    面積: {calcGross(wall).toFixed(2)} m²
                  </div>
                </>
              ) : (
                <label className="text-xs md:text-sm">
                  面積 (m²)
                  <input
                    type="number"
                    step="0.01"
                    className="input-field mt-1"
                    value={wall.area_gross ?? ''}
                    onChange={(e) => updateWall(wall.id, { area_gross: Number(e.target.value || 0) })}
                  />
                </label>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <label className="text-xs md:text-sm">
                断熱材
                <select
                  className="input-field mt-1"
                  value={wall.insulation_type || 'hgw16k'}
                  onChange={(e) => updateWall(wall.id, { insulation_type: e.target.value })}
                >
                  {MATERIAL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              <label className="text-xs md:text-sm">
                厚み (mm)
                <input
                  type="number"
                  className="input-field mt-1"
                  value={wall.insulation_thickness ?? 105}
                  onChange={(e) => updateWall(wall.id, { insulation_thickness: Number(e.target.value || 0) })}
                />
              </label>
              <label className="text-xs md:text-sm">
                U値 (任意上書き)
                <input
                  type="number"
                  step="0.01"
                  className="input-field mt-1"
                  value={wall.u_value ?? ''}
                  onChange={(e) => updateWall(wall.id, { u_value: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
              </label>
              <label className="text-xs md:text-sm">
                隣接条件
                <select
                  className="input-field mt-1"
                  value={wall.adjacency || 'exterior'}
                  onChange={(e) => updateWall(wall.id, { adjacency: e.target.value })}
                >
                  {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
            </div>
          </div>
        ))}

        {selectedWalls.length === 0 && (
          <div className="text-sm text-primary-400 bg-white border border-dashed border-warm-300 rounded-xl p-6">
            この方位の壁セグメントは未登録です。
          </div>
        )}

        <button type="button" className="btn-secondary text-sm py-2 px-3" onClick={() => addWall(activeOrientation)}>+ 壁を追加</button>
      </div>

      <div className="bg-warm-50 border border-warm-200 rounded-xl p-3 text-sm text-primary-700">
        {ORIENTATION_LABELS[activeOrientation] || activeOrientation}面合計: 外壁(GROSS) {currentSummary.gross.toFixed(2)}m² − 窓 {currentSummary.openings.toFixed(2)}m² = NET {currentSummary.net.toFixed(2)}m²
      </div>
    </div>
  );
}
