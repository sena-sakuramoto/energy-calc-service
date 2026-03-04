import { useState } from 'react';

import { MATERIAL_CONDUCTIVITY } from '../engine/tables/materialConductivity';

const MATERIAL_OPTIONS = Object.keys(MATERIAL_CONDUCTIVITY).map((key) => ({ value: key, label: key }));

export default function InsulationSelector({ walls, onChange }) {
  const [material, setMaterial] = useState('hgw16k');
  const [thickness, setThickness] = useState(105);

  const safeWalls = Array.isArray(walls) ? walls : [];

  const applyToAll = () => {
    onChange(
      safeWalls.map((wall) => ({
        ...wall,
        insulation_type: material,
        insulation_thickness: Number(thickness || 0),
      })),
    );
  };

  return (
    <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm md:text-base font-semibold text-primary-700">断熱仕様一括設定</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-xs md:text-sm">
          材料
          <select className="input-field mt-1" value={material} onChange={(e) => setMaterial(e.target.value)}>
            {MATERIAL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </label>
        <label className="text-xs md:text-sm">
          厚み (mm)
          <input type="number" className="input-field mt-1" value={thickness} onChange={(e) => setThickness(Number(e.target.value || 0))} />
        </label>
        <div className="flex items-end">
          <button type="button" className="btn-secondary w-full" onClick={applyToAll}>全壁に適用</button>
        </div>
      </div>
      <div className="text-xs text-primary-500">対象壁数: {safeWalls.length} セグメント</div>
    </div>
  );
}
