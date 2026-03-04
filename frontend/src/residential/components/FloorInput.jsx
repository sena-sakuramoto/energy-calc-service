const ADJ_OPTIONS = [
  { value: 'underfloor', label: '床下' },
  { value: 'ground', label: '地盤' },
  { value: 'exterior', label: '外気' },
];

export default function FloorInput({ floor, foundation, onChange }) {
  const safeFloor = floor || { area: 54, u_value: 0.48, adjacency: 'underfloor' };
  const safeFoundation = foundation || { length: 30, psi_value: 0.6, h_value: 0.7 };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm md:text-base font-semibold text-primary-700">床</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-xs md:text-sm">
            面積 (m²)
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeFloor.area ?? 0}
              onChange={(e) => onChange({ floor: { ...safeFloor, area: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            U値
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeFloor.u_value ?? 0.48}
              onChange={(e) => onChange({ floor: { ...safeFloor, u_value: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            隣接
            <select
              className="input-field mt-1"
              value={safeFloor.adjacency || 'underfloor'}
              onChange={(e) => onChange({ floor: { ...safeFloor, adjacency: e.target.value } })}
            >
              {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm md:text-base font-semibold text-primary-700">基礎（線熱貫流）</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-xs md:text-sm">
            外周長さ (m)
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeFoundation.length ?? 0}
              onChange={(e) => onChange({ foundation: { ...safeFoundation, length: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            Ψ値 (W/mK)
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeFoundation.psi_value ?? 0.6}
              onChange={(e) => onChange({ foundation: { ...safeFoundation, psi_value: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            温度差係数 h
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeFoundation.h_value ?? 0.7}
              onChange={(e) => onChange({ foundation: { ...safeFoundation, h_value: Number(e.target.value || 0) } })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
