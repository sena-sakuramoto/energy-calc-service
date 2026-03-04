const ADJ_OPTIONS = [
  { value: 'exterior', label: '外気' },
  { value: 'unheated_space', label: '非空調' },
];

export default function RoofInput({ roof, ceiling, onChange }) {
  const safeRoof = roof || { area: 54, u_value: 0.24, adjacency: 'exterior' };
  const safeCeiling = ceiling || { area: 0, u_value: 0.3, adjacency: 'unheated_space' };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm md:text-base font-semibold text-primary-700">屋根</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-xs md:text-sm">
            面積 (m²)
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeRoof.area ?? 0}
              onChange={(e) => onChange({ roof: { ...safeRoof, area: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            U値
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeRoof.u_value ?? 0.24}
              onChange={(e) => onChange({ roof: { ...safeRoof, u_value: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            隣接
            <select
              className="input-field mt-1"
              value={safeRoof.adjacency || 'exterior'}
              onChange={(e) => onChange({ roof: { ...safeRoof, adjacency: e.target.value } })}
            >
              {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-4 space-y-3">
        <h3 className="text-sm md:text-base font-semibold text-primary-700">天井（任意）</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="text-xs md:text-sm">
            面積 (m²)
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeCeiling.area ?? 0}
              onChange={(e) => onChange({ ceiling: { ...safeCeiling, area: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            U値
            <input
              type="number"
              step="0.01"
              className="input-field mt-1"
              value={safeCeiling.u_value ?? 0.3}
              onChange={(e) => onChange({ ceiling: { ...safeCeiling, u_value: Number(e.target.value || 0) } })}
            />
          </label>
          <label className="text-xs md:text-sm">
            隣接
            <select
              className="input-field mt-1"
              value={safeCeiling.adjacency || 'unheated_space'}
              onChange={(e) => onChange({ ceiling: { ...safeCeiling, adjacency: e.target.value } })}
            >
              {ADJ_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
