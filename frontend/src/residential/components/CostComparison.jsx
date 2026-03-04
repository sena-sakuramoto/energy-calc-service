export default function CostComparison({ comparison }) {
  if (!comparison) {
    return (
      <div className="text-xs text-primary-400">
        商品変更時に UA 改善量とコスト差分を表示します。
      </div>
    );
  }

  const uaSign = comparison.ua_delta <= 0 ? '' : '+';
  const costSign = comparison.cost_delta >= 0 ? '+' : '-';
  const absCost = Math.abs(comparison.cost_delta || 0).toLocaleString('ja-JP');

  return (
    <div className="text-xs md:text-sm bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-primary-700">
      {comparison.before_name}→{comparison.after_name}: UA {uaSign}
      {Number(comparison.ua_delta || 0).toFixed(2)} / コスト {costSign}¥{absCost}
    </div>
  );
}
