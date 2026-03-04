import { useState } from 'react';

import ProductSelector from './ProductSelector';

/**
 * 改善シミュレーター
 *
 * UI原則 #2: AI出力にアクションボタン
 */
export default function ImprovementSimulator({
  currentBei,
  zone,
  use,
  onApplyChange,
  recommendations,
  isRecalculating,
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const categoryLabels = {
    windows: '窓サッシ',
    insulation: '断熱材',
    hvac: '空調設備',
    lighting: '照明設備',
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">BEI改善提案</h3>
      {currentBei > 1.0 && (
        <p className="text-red-600 text-sm mb-4">
          現在のBEI ({currentBei.toFixed(2)}) は基準値1.0を超えています。以下の変更で適合可能です。
        </p>
      )}

      <div className="space-y-3">
        {recommendations.map((rec, idx) => {
          const product = rec.product;
          if (!product) return null;

          const impact = parseFloat(rec.estimated_bei_impact) || 0;
          const newBei = Math.max(0, currentBei + impact);

          return (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">
                    {categoryLabels[rec.category] || rec.category}
                  </span>
                  <p className="font-semibold text-slate-900 mt-1">
                    {product.name}
                    {product.partner && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        おすすめ
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm text-slate-500">BEI変化</p>
                  <p className={[
                    'text-lg font-bold',
                    impact < 0 ? 'text-emerald-600' : 'text-red-600',
                  ].join(' ')}>
                    {impact < 0 ? '' : '+'}
                    {impact.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">→ {newBei.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onApplyChange(rec)}
                  disabled={isRecalculating}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isRecalculating ? '再計算中...' : '適用して再計算'}
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === rec.category ? null : rec.category)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-lg hover:bg-slate-50"
                >
                  他の選択肢を見る
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-slate-400 text-sm hover:text-slate-600"
                >
                  スキップ
                </button>
              </div>

              {expandedCategory === rec.category && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <ProductSelector
                    category={rec.category}
                    zone={zone}
                    use={use}
                    selected={product}
                    onSelect={(p) => {
                      if (p) onApplyChange({ ...rec, product: p, product_id: p.id });
                      setExpandedCategory(null);
                    }}
                    allowManualInput={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
