import { PRODUCT_TABLE, resolveOpeningThermalSpec } from '../engine/tables/windowCombination';

export function estimateOpeningUnitCost(opening, product) {
  if (!product) return 0;

  const widthMm = Number(opening.width || 0) * 1000;
  const heightMm = Number(opening.height || 0) * 1000;

  if (Array.isArray(product.sizes) && product.sizes.length > 0) {
    let best = null;
    let minDist = Number.POSITIVE_INFINITY;

    product.sizes.forEach((size) => {
      const dw = widthMm - Number(size.w || 0);
      const dh = heightMm - Number(size.h || 0);
      const dist = Math.sqrt(dw * dw + dh * dh);
      if (dist < minDist) {
        minDist = dist;
        best = size;
      }
    });

    if (best?.cost) return Number(best.cost);
  }

  const area = Number(opening.width || 0) * Number(opening.height || 0);
  if (Number(product.cost_per_m2) > 0) {
    return Math.round(area * Number(product.cost_per_m2));
  }
  return 0;
}

export default function ProductSelector({ opening, onChange }) {
  const currentProductId = opening.product_id || '';

  const handleSelect = (event) => {
    const nextProductId = event.target.value || undefined;
    const spec = resolveOpeningThermalSpec({
      ...opening,
      product_id: nextProductId,
    });

    const product = spec?.product;
    const costPerUnit = product ? estimateOpeningUnitCost(opening, product) : undefined;

    onChange({
      ...opening,
      product_id: nextProductId,
      product_name: product?.name,
      u_value: Number(spec.u_value || opening.u_value || 3.49),
      eta_d_H: Number(spec.eta_d_H ?? opening.eta_d_H ?? 0),
      eta_d_C: Number(spec.eta_d_C ?? opening.eta_d_C ?? 0),
      cost_per_unit: costPerUnit,
    });
  };

  return (
    <select
      className="input-field text-xs md:text-sm"
      value={currentProductId}
      onChange={handleSelect}
    >
      <option value="">組み合わせ表を使用</option>
      {PRODUCT_TABLE.map((product) => (
        <option key={product.id} value={product.id}>
          {product.name} (U={product.u_value})
        </option>
      ))}
    </select>
  );
}
