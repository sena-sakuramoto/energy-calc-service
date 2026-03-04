const ORIENTATION_LABELS = {
  N: '北', NE: '北東', E: '東', SE: '南東',
  S: '南', SW: '南西', W: '西', NW: '北西',
};

export default function AreaTable({ result }) {
  if (!result?.area_summary) {
    return (
      <div className="bg-white border border-warm-200 rounded-xl p-4 text-sm text-primary-400">
        面積計算の結果がありません。
      </div>
    );
  }

  const rows = Object.entries(result.area_summary.by_orientation || {});

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-warm-200 bg-white">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-warm-100 text-primary-700">
            <tr>
              <th className="px-3 py-2 text-left">方位</th>
              <th className="px-3 py-2 text-right">GROSS(m²)</th>
              <th className="px-3 py-2 text-right">開口(m²)</th>
              <th className="px-3 py-2 text-right">NET(m²)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([orientation, row]) => (
              <tr key={orientation} className="border-t border-warm-100">
                <td className="px-3 py-2">{ORIENTATION_LABELS[orientation] || orientation}</td>
                <td className="px-3 py-2 text-right">{Number(row.gross || 0).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{Number(row.openings || 0).toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-semibold">{Number(row.net || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-warm-50 border-t border-warm-200">
            <tr>
              <td className="px-3 py-2 font-semibold">合計</td>
              <td className="px-3 py-2 text-right">{Number(result.area_summary.gross_total || 0).toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{Number(result.area_summary.opening_total || 0).toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-semibold">{Number(result.area_summary.net_total || 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-warm-200 bg-white">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-warm-100 text-primary-700">
            <tr>
              <th className="px-3 py-2 text-left">部位</th>
              <th className="px-3 py-2 text-right">面積/長さ</th>
              <th className="px-3 py-2 text-right">U/Ψ</th>
              <th className="px-3 py-2 text-right">h</th>
              <th className="px-3 py-2 text-right">熱損失</th>
            </tr>
          </thead>
          <tbody>
            {(result.parts_detail || []).map((part, idx) => (
              <tr key={`${part.type}_${idx}`} className="border-t border-warm-100">
                <td className="px-3 py-2">{part.type} ({part.orientation})</td>
                <td className="px-3 py-2 text-right">
                  {part.type === 'foundation' ? `${Number(part.length || 0).toFixed(2)}m` : `${Number(part.area || 0).toFixed(2)}m²`}
                </td>
                <td className="px-3 py-2 text-right">
                  {part.type === 'foundation' ? Number(part.psi_value || 0).toFixed(2) : Number(part.u_value || 0).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-right">{Number(part.h_value || 0).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">{Number(part.heat_loss || 0).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
