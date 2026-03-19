import { memo, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaExternalLinkAlt, FaRegCircle } from 'react-icons/fa';

import { productsAPI } from '../utils/api';

/**
 * 製品選択カードUI
 *
 * UI原則 #1: 選択肢 > 自由入力
 * UI原則 #10: デフォルト最適化（推奨製品がデフォルト選択済み）
 */
const CATEGORY_LABELS = {
  windows: '窓サッシ',
  insulation: '断熱材',
  hvac: '空調設備',
  lighting: '照明設備',
};

const USE_LABELS = {
  office: '事務所',
  hotel: 'ホテル',
  hospital: '病院',
  school_small: '学校',
  assembly: '集会所',
  restaurant: '飲食店',
  factory: '工場',
  shop_department: '物販',
  shop_supermarket: 'スーパー',
};

const MANUFACTURER_LOGOS = {
  'YKK AP': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Ykkap_logo.svg',
    alt: 'YKK AP ロゴ',
  },
};

const buildHighlights = (category, product) => {
  switch (category) {
    case 'windows':
      return [
        { label: 'U値', value: product.u_value ?? '-' },
        { label: 'ガラス', value: product.glass_type || '-' },
        { label: '枠種別', value: product.frame_type || '-' },
        { label: '日射取得', value: product.eta_c ?? '-' },
      ];
    case 'insulation':
      return [
        { label: '熱伝導率', value: product.lambda_value ?? '-' },
        { label: '分類', value: product.category || '-' },
        { label: '材種', value: product.material_type || '-' },
        {
          label: '厚み例',
          value: Array.isArray(product.typical_thickness_mm)
            ? `${product.typical_thickness_mm.slice(0, 3).join(' / ')}mm`
            : '-',
        },
      ];
    case 'hvac':
      return [
        { label: 'APF', value: product.apf ?? '-' },
        { label: '能力', value: product.capacity_kw ? `${product.capacity_kw}kW` : '-' },
        { label: '冷房COP', value: product.cop_cooling ?? '-' },
        { label: '暖房COP', value: product.cop_heating ?? '-' },
      ];
    case 'lighting':
      return [
        { label: '効率', value: product.lm_per_w ? `${product.lm_per_w}lm/W` : '-' },
        { label: '消費電力', value: product.wattage ? `${product.wattage}W` : '-' },
        { label: '器具種別', value: product.fixture_type || '-' },
        { label: '調光', value: product.dimming ? '対応' : 'なし' },
      ];
    default:
      return [];
  }
};

const buildReason = (product, zone, use) => {
  const reasons = [];
  if (product.partner) reasons.push('優先提案');
  if (zone && Array.isArray(product.recommended_zones) && product.recommended_zones.includes(zone)) {
    reasons.push(`${zone}地域向け`);
  }
  if (use && Array.isArray(product.recommended_uses) && product.recommended_uses.includes(use)) {
    reasons.push(`${USE_LABELS[use] || use}向け`);
  }
  return reasons.length > 0 ? reasons.join(' / ') : '標準候補';
};

const productTone = (product) => {
  if (product.partner) {
    return {
      shell: 'border-amber-200 bg-amber-50/60',
      badge: 'bg-amber-100 text-amber-800',
    };
  }
  return {
    shell: 'border-slate-200 bg-white',
    badge: 'bg-slate-100 text-slate-700',
  };
};

const ProductCard = memo(function ProductCard({
  product,
  category,
  zone,
  use,
  isSelected,
  onPick,
}) {
  const tone = productTone(product);
  const highlights = useMemo(() => buildHighlights(category, product), [category, product]);
  const reason = useMemo(() => buildReason(product, zone, use), [product, zone, use]);
  const logo = MANUFACTURER_LOGOS[product.manufacturer];

  return (
    <div
      className={[
        'rounded-xl border-2 p-4 transition-[border-color,box-shadow,background-color] duration-150 shadow-sm',
        tone.shell,
        isSelected
          ? 'border-emerald-500 bg-emerald-50 shadow-md'
          : 'hover:border-slate-300 hover:shadow-md',
      ].join(' ')}
    >
      <div className="flex items-start gap-4">
        <div className={`hidden sm:flex shrink-0 w-14 h-14 rounded-2xl ${tone.badge} items-center justify-center text-xs font-bold text-center leading-tight px-2 overflow-hidden`}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.src}
              alt={logo.alt}
              className="max-w-full max-h-8 object-contain"
              loading="lazy"
            />
          ) : (
            product.manufacturer
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 text-lg">{product.name}</span>
            {product.partner && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                おすすめ
              </span>
            )}
            {isSelected && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                選択中
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {product.manufacturer} {product.series}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {reason}
            </span>
            {product.source && (
              <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs text-primary-700">
                {product.source}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {highlights.map((item) => (
              <div key={`${product.id}-${item.label}`} className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2">
                <div className="text-[11px] text-slate-500">{item.label}</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onPick(product)}
              className={[
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-colors',
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary-800 text-white hover:bg-primary-900',
              ].join(' ')}
            >
              {isSelected ? <FaCheckCircle className="text-sm" /> : <FaRegCircle className="text-sm" />}
              {isSelected ? 'この製品を選択中' : 'この製品を選ぶ'}
            </button>
            {product.catalog_url && (
              <a
                href={product.catalog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                資料を見る
                <FaExternalLinkAlt className="text-xs" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

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

  const buildHighlights = (product) => {
    switch (category) {
      case 'windows':
        return [
          { label: 'U値', value: product.u_value ?? '-' },
          { label: 'ガラス', value: product.glass_type || '-' },
          { label: '枠種別', value: product.frame_type || '-' },
          { label: '日射取得', value: product.eta_c ?? '-' },
        ];
      case 'insulation':
        return [
          { label: '熱伝導率', value: product.lambda_value ?? '-' },
          { label: '分類', value: product.category || '-' },
          { label: '材種', value: product.material_type || '-' },
          {
            label: '厚み例',
            value: Array.isArray(product.typical_thickness_mm)
              ? `${product.typical_thickness_mm.slice(0, 3).join(' / ')}mm`
              : '-',
          },
        ];
      case 'hvac':
        return [
          { label: 'APF', value: product.apf ?? '-' },
          { label: '能力', value: product.capacity_kw ? `${product.capacity_kw}kW` : '-' },
          { label: '冷房COP', value: product.cop_cooling ?? '-' },
          { label: '暖房COP', value: product.cop_heating ?? '-' },
        ];
      case 'lighting':
        return [
          { label: '効率', value: product.lm_per_w ? `${product.lm_per_w}lm/W` : '-' },
          { label: '消費電力', value: product.wattage ? `${product.wattage}W` : '-' },
          { label: '器具種別', value: product.fixture_type || '-' },
          { label: '調光', value: product.dimming ? '対応' : 'なし' },
        ];
      default:
        return [];
    }
  };

  const buildReason = (product) => {
    const reasons = [];
    if (product.partner) reasons.push('優先提案');
    if (zone && Array.isArray(product.recommended_zones) && product.recommended_zones.includes(zone)) {
      reasons.push(`${zone}地域向け`);
    }
    if (use && Array.isArray(product.recommended_uses) && product.recommended_uses.includes(use)) {
      reasons.push(`${useLabels[use] || use}向け`);
    }
    return reasons.length > 0 ? reasons.join(' / ') : '標準候補';
  };

  const productTone = (product) => {
    if (product.partner) {
      return {
        shell: 'border-amber-200 bg-amber-50/60',
        badge: 'bg-amber-100 text-amber-800',
        accent: 'bg-amber-500',
      };
    }
    return {
      shell: 'border-slate-200 bg-white',
      badge: 'bg-slate-100 text-slate-700',
      accent: 'bg-slate-400',
    };
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        {CATEGORY_LABELS[category]}を読み込み中...
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
            <ProductCard
              key={product.id}
              product={product}
              category={category}
              zone={zone}
              use={use}
              isSelected={isSelected}
              onPick={(picked) => {
                setShowManual(false);
                onSelect(picked);
              }}
            />
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
