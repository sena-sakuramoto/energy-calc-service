import { useMemo } from 'react';

import { ORIENTATIONS } from '../engine/types';
import { resolveOpeningThermalSpec } from '../engine/tables/windowCombination';
import ProductSelector, { estimateOpeningUnitCost } from './ProductSelector.jsx';

const ORIENTATION_LABELS = {
  N: '北', NE: '北東', E: '東', SE: '南東',
  S: '南', SW: '南西', W: '西', NW: '北西',
};

const SASH_OPTIONS = [
  { value: 'metal', label: '金属' },
  { value: 'metal_resin', label: '金属樹脂複合' },
  { value: 'resin', label: '樹脂' },
  { value: 'wood', label: '木製' },
];

const GLASS_OPTIONS = [
  { value: 'single', label: '単板' },
  { value: 'double', label: '複層' },
  { value: 'double_lowe_a12', label: 'Low-E複層 A12' },
  { value: 'double_lowe_a16', label: 'Low-E複層 A16' },
  { value: 'triple_lowe_a9x2', label: 'Low-E三層 A9x2' },
  { value: 'triple_lowe_kr_a11x2', label: 'Low-E三層 Kr A11x2' },
];

function splitCsvLine(line) {
  const cols = [];
  let current = '';
  let inQuote = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      cols.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cols.push(current.trim());
  return cols;
}

function normalizeOrientation(raw) {
  const value = String(raw || '').toUpperCase();
  const map = {
    N: 'N', '北': 'N',
    NE: 'NE', '北東': 'NE',
    E: 'E', '東': 'E',
    SE: 'SE', '南東': 'SE',
    S: 'S', '南': 'S',
    SW: 'SW', '南西': 'SW',
    W: 'W', '西': 'W',
    NW: 'NW', '北西': 'NW',
  };
  return map[value] || 'S';
}

function toMeters(rawValue) {
  const num = Number(rawValue || 0);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num > 20 ? num / 1000 : num;
}

function applyThermalSpec(opening) {
  const spec = resolveOpeningThermalSpec(opening);
  const costPerUnit = spec.product ? estimateOpeningUnitCost(opening, spec.product) : opening.cost_per_unit;
  return {
    ...opening,
    product_name: spec.product?.name,
    u_value: Number(spec.u_value || 3.49),
    eta_d_H: Number(spec.eta_d_H ?? 0),
    eta_d_C: Number(spec.eta_d_C ?? 0),
    cost_per_unit: Number(costPerUnit || 0),
  };
}

function createOpening(symbol = '') {
  return applyThermalSpec({
    id: `opening_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    symbol: symbol || 'W-1',
    type: 'window',
    orientation: 'S',
    width: 1.6,
    height: 1.2,
    quantity: 1,
    sash_type: 'resin',
    glass_type: 'double_lowe_a12',
  });
}

export default function WindowSchedule({ openings, onChange }) {
  const safeOpenings = Array.isArray(openings) ? openings : [];

  const totalCost = useMemo(
    () => safeOpenings.reduce(
      (acc, opening) => acc + Number(opening.cost_per_unit || 0) * Number(opening.quantity || 1),
      0,
    ),
    [safeOpenings],
  );

  const updateRow = (id, patch) => {
    const next = safeOpenings.map((opening) => {
      if (opening.id !== id) return opening;
      const merged = { ...opening, ...patch };
      return applyThermalSpec(merged);
    });
    onChange(next);
  };

  const handleProductChange = (id, nextRow) => {
    onChange(safeOpenings.map((opening) => (opening.id === id ? nextRow : opening)));
  };

  const addOpening = () => {
    const nextSymbol = `W-${safeOpenings.length + 1}`;
    onChange([...safeOpenings, createOpening(nextSymbol)]);
  };

  const removeOpening = (id) => {
    onChange(safeOpenings.filter((opening) => opening.id !== id));
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const dataLines = lines.slice(1);
    const imported = dataLines.map((line, index) => {
      const [symbol, widthRaw, heightRaw, sash, glass, orientationRaw, quantityRaw, productId] = splitCsvLine(line);
      const opening = createOpening(symbol || `W-${index + 1}`);
      return applyThermalSpec({
        ...opening,
        symbol: symbol || opening.symbol,
        width: toMeters(widthRaw) || opening.width,
        height: toMeters(heightRaw) || opening.height,
        sash_type: sash || opening.sash_type,
        glass_type: glass || opening.glass_type,
        orientation: normalizeOrientation(orientationRaw),
        quantity: Math.max(Number(quantityRaw || 1), 1),
        product_id: productId || undefined,
      });
    });

    if (imported.length > 0) {
      onChange(imported);
    }

    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="btn-outline cursor-pointer text-sm py-2 px-3">
          CSVインポート
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
        </label>
        <button type="button" className="btn-secondary text-sm py-2 px-3" onClick={addOpening}>+ 建具追加</button>
        <div className="ml-auto text-sm font-semibold text-primary-700">合計: ¥{Math.round(totalCost).toLocaleString('ja-JP')}</div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-warm-200 bg-white">
        <table className="min-w-[1100px] w-full text-xs md:text-sm">
          <thead className="bg-warm-100 text-primary-700">
            <tr>
              <th className="px-2 py-2 text-left">記号</th>
              <th className="px-2 py-2 text-left">種類</th>
              <th className="px-2 py-2 text-left">W(mm)</th>
              <th className="px-2 py-2 text-left">H(mm)</th>
              <th className="px-2 py-2 text-left">サッシ</th>
              <th className="px-2 py-2 text-left">ガラス</th>
              <th className="px-2 py-2 text-left">方位</th>
              <th className="px-2 py-2 text-left">数量</th>
              <th className="px-2 py-2 text-left">商品</th>
              <th className="px-2 py-2 text-left">U値</th>
              <th className="px-2 py-2 text-left">コスト</th>
              <th className="px-2 py-2 text-left">削除</th>
            </tr>
          </thead>
          <tbody>
            {safeOpenings.map((opening) => {
              const rowCost = Number(opening.cost_per_unit || 0) * Number(opening.quantity || 1);
              return (
                <tr key={opening.id} className="border-t border-warm-100">
                  <td className="px-2 py-2"><input className="input-field py-1 px-2" value={opening.symbol || ''} onChange={(e) => updateRow(opening.id, { symbol: e.target.value })} /></td>
                  <td className="px-2 py-2">
                    <select className="input-field py-1 px-2" value={opening.type} onChange={(e) => updateRow(opening.id, { type: e.target.value })}>
                      <option value="window">窓</option>
                      <option value="door">ドア</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      className="input-field py-1 px-2"
                      value={Math.round(Number(opening.width || 0) * 1000)}
                      onChange={(e) => updateRow(opening.id, { width: toMeters(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      className="input-field py-1 px-2"
                      value={Math.round(Number(opening.height || 0) * 1000)}
                      onChange={(e) => updateRow(opening.id, { height: toMeters(e.target.value) })}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select className="input-field py-1 px-2" value={opening.sash_type} onChange={(e) => updateRow(opening.id, { sash_type: e.target.value, product_id: undefined })}>
                      {SASH_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className="input-field py-1 px-2" value={opening.glass_type} onChange={(e) => updateRow(opening.id, { glass_type: e.target.value, product_id: undefined })}>
                      {GLASS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className="input-field py-1 px-2" value={opening.orientation} onChange={(e) => updateRow(opening.id, { orientation: e.target.value })}>
                      {ORIENTATIONS.map((o) => <option key={o} value={o}>{ORIENTATION_LABELS[o] || o}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2"><input type="number" min="1" className="input-field py-1 px-2" value={opening.quantity || 1} onChange={(e) => updateRow(opening.id, { quantity: Math.max(Number(e.target.value || 1), 1) })} /></td>
                  <td className="px-2 py-2 min-w-[240px]">
                    <ProductSelector opening={opening} onChange={(nextOpening) => handleProductChange(opening.id, nextOpening)} />
                  </td>
                  <td className="px-2 py-2 font-semibold">{Number(opening.u_value || 0).toFixed(2)}</td>
                  <td className="px-2 py-2">¥{Math.round(rowCost).toLocaleString('ja-JP')}</td>
                  <td className="px-2 py-2"><button type="button" className="text-red-600 hover:text-red-800" onClick={() => removeOpening(opening.id)}>×</button></td>
                </tr>
              );
            })}
            {safeOpenings.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-6 text-center text-primary-400">建具がありません。+ 建具追加 または CSV インポートを実行してください。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
