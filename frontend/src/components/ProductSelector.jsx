import { useEffect, useState } from 'react';

import { productsAPI } from '../utils/api';

/**
 * 製品選択カードUI
 *
 * UI原則 #1: 選択肢 > 自由入力
 * UI原則 #10: デフォルト最適化（推奨製品がデフォルト選択済み）
 */
export default function ProductSelector({
  category,
  zone,
  use,
  onSelect,
  selected,
  allowManualInput = true,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [error, setError] = useState(null);

  const categoryLabels = {
    windows: '窓サッシ',
    insulation: '断熱材',
    hvac: '空調設備',
    lighting: '照明設備',
  };

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const fetchers = {
        windows: () => productsAPI.listWindows(zone, use),
        insulation: () => productsAPI.listInsulation(zone),
        hvac: () => productsAPI.listHvac(zone, use),
        lighting: () => productsAPI.listLighting(use),
      };

      const fetcher = fetchers[category];
      if (!fetcher) {
        setError(`不明なカテゴリ: ${category}`);
        setLoading(false);
        return;
      }

      try {
        const data = await fetcher();
        if (!mounted) return;

        const loaded = data?.products || [];
        setProducts(loaded);

        if (!selected && loaded.length > 0) {
          const partner = loaded.find((p) => p.partner);
          if (partner) onSelect(partner);
        }
      } catch (err) {
        if (!mounted) return;
        setError('製品データの読み込みに失敗しました');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, [category, onSelect, selected, use, zone]);

  const renderSpec = (product) => {
    switch (category) {
      case 'windows':
        return `U=${product.u_value} | ${product.window_type} | ${product.glass_type}`;
      case 'insulation':
        return `λ=${product.lambda_value} | ${product.category} | ${product.material_type}`;
      case 'hvac':
        return `APF=${product.apf || '-'} | ${product.capacity_kw}kW | ${product.equipment_type}`;
      case 'lighting':
        return `${product.lm_per_w}lm/W | ${product.wattage}W | ${product.fixture_type}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        {categoryLabels[category]}を読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-3">
        {products.map((product) => {
          const isSelected = selected?.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setShowManual(false);
                onSelect(product);
              }}
              className={[
                'w-full text-left p-4 rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 bg-white hover:border-slate-300',
              ].join(' ')}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{product.name}</span>
                    {product.partner && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        おすすめ
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    {product.manufacturer} {product.series}
                  </p>
                  <p className="text-sm text-slate-600 mt-1 font-mono">{renderSpec(product)}</p>
                </div>
                {isSelected && <span className="text-emerald-500 text-xl">✓</span>}
              </div>
            </button>
          );
        })}

        {allowManualInput && (
          <button
            type="button"
            onClick={() => {
              setShowManual(true);
              onSelect(null);
            }}
            className={[
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              showManual
                ? 'border-slate-500 bg-slate-50'
                : 'border-dashed border-slate-300 bg-white hover:border-slate-400',
            ].join(' ')}
          >
            <span className="text-slate-600">スペックを直接入力</span>
          </button>
        )}
      </div>
    </div>
  );
}
